"""
Transform LegiScan Raw Data → Tracker Format
=============================================
Converts LegiScan API JSON into the exact format used by BillsData.js.

CRITICAL RULE: This script only maps factual fields that exist in LegiScan data.
It NEVER generates, guesses, or infers any facts.

NOTE: The lifecycle parser has a known issue — step 4 (Floor 1st) and step 6 
(Floor 2nd) can double-fire on the same action if history ordering is unusual.
Fix planned for next session: use explicit chamber tracking instead of seen_steps logic.
"""

import argparse
import json
import re
from pathlib import Path


STATUS_MAP = {
    0: "Introduced", 1: "Introduced",
    2: "Passed 1st Chamber",
    3: "Passed Legislature",
    4: "Signed into Law",
    5: "Vetoed",
    6: "Failed",
}

CHAMBER_MAP = {"H": "Assembly", "S": "Senate", "A": "Assembly"}

SUBJECT_TO_TOPIC = {
    "Education": "Education (K-12)",
    "Higher Education": "Higher Education",
    "Colleges and Universities": "Higher Education",
    "Crime": "Policing & Criminal Justice",
    "Criminal Justice": "Policing & Criminal Justice",
    "Corrections": "Policing & Criminal Justice",
    "Law Enforcement": "Policing & Criminal Justice",
    "Drugs": "Policing & Criminal Justice",
    "Labor": "Labor & Workers' Rights",
    "Employment": "Labor & Workers' Rights",
    "Wages and Benefits": "Labor & Workers' Rights",
    "Housing": "Housing & Homelessness",
    "Homelessness": "Housing & Homelessness",
    "Land Use": "Housing & Homelessness",
    "Health": "Health & Public Health",
    "Mental Health": "Health & Public Health",
    "Public Health": "Health & Public Health",
    "Immigration": "Immigration",
    "Civil Rights": "Civil Rights & Voting",
    "Elections": "Civil Rights & Voting",
    "Voting": "Civil Rights & Voting",
    "Environment": "Environment & Climate",
    "Energy": "Environment & Energy",
    "Climate Change": "Environment & Climate",
    "Water": "Water",
    "Technology": "Technology & AI",
    "Artificial Intelligence": "Technology & AI",
    "Privacy": "Technology & AI",
    "Economic Development": "Economic Development",
    "Taxation": "Economic Development",
    "Budget": "Economic Development",
    "Business": "Economic Development",
    "Transportation": "Transportation",
    "Agriculture": "Food & Agriculture",
    "Public Safety": "Public Safety",
    "Children": "Children & Families",
    "Families": "Children & Families",
    "Consumer Protection": "Consumer Protection",
    "Government": "Government & Elections",
    "Veterans": "Veterans",
    "Disability": "Disability Services",
    "Tribal": "Tribal Affairs",
}


def map_district(raw_district, chamber):
    if not raw_district:
        return ""
    raw = str(raw_district).strip()
    if raw.startswith("SD-"):
        num = raw.replace("SD-", "").lstrip("0") or "0"
        return f"SD-{num}"
    elif raw.startswith("HD-") or raw.startswith("AD-"):
        num = raw.replace("HD-", "").replace("AD-", "").lstrip("0") or "0"
        return f"AD-{num}"
    try:
        num = int(raw)
        prefix = "SD" if chamber == "Senate" else "AD"
        return f"{prefix}-{num}"
    except ValueError:
        return raw


def map_bill_number(raw_number):
    if not raw_number:
        return ""
    return re.sub(r'([A-Z]+)\s*(\d+)', r'\1 \2', raw_number.strip())


def map_bill_id(raw_number):
    if not raw_number:
        return ""
    return re.sub(r'([A-Z]+)\s*(\d+)', r'\1-\2', raw_number.strip())


def map_status(status_code, history=None):
    base = STATUS_MAP.get(status_code, "Unknown")
    if base == "Failed" and history:
        last_action = history[-1].get("action", "") if history else ""
        if "committee" in last_action.lower() or "suspense" in last_action.lower():
            return "Failed in Committee"
    return base


def map_topics(subjects):
    if not subjects:
        return []
    topics = set()
    for subj in subjects:
        name = subj.get("subject_name", "")
        if name in SUBJECT_TO_TOPIC:
            topics.add(SUBJECT_TO_TOPIC[name])
        else:
            for key, val in SUBJECT_TO_TOPIC.items():
                if key.lower() in name.lower():
                    topics.add(val)
                    break
    return sorted(topics)


def build_lifecycle(history, status_code):
    """
    Build lifecycle array from real LegiScan history only.
    
    KNOWN ISSUE: Step 4 and Step 6 use same keywords ("read third time").
    Current logic uses seen_steps gating but has edge cases.
    TODO next session: track by chamber transitions instead.
    """
    if not history:
        return []
    
    lifecycle = []
    seen_steps = set()
    
    for action in history:
        date = action.get("date", "")
        text = action.get("action", "")
        lower_text = text.lower()
        
        if any(kw in lower_text for kw in ["introduced", "read first time"]) and 1 not in seen_steps and 4 not in seen_steps:
            lifecycle.append({"step": 1, "label": "Introduced", "date": date, "detail": text[:80]})
            seen_steps.add(1)
            continue
        
        if 4 in seen_steps and 5 not in seen_steps and (
            lower_text.startswith("in assembly.") or lower_text.startswith("in senate.")):
            lifecycle.append({"step": 5, "label": "2nd Chamber", "date": date, "detail": text[:80]})
            seen_steps.add(5)
            continue
        
        if 5 in seen_steps and 6 not in seen_steps and "read third time" in lower_text:
            lifecycle.append({"step": 6, "label": "Floor (2nd)", "date": date, "detail": text[:80]})
            seen_steps.add(6)
            continue
        
        if any(kw in lower_text for kw in ["referred to com", "from committee: do pass"]) and 2 not in seen_steps and 4 not in seen_steps:
            lifecycle.append({"step": 2, "label": "Committee", "date": date, "detail": text[:80]})
            seen_steps.add(2)
            continue
        
        if any(kw in lower_text for kw in ["appr.", "appropriation", "fiscal", "suspense"]) and 3 not in seen_steps and 4 not in seen_steps:
            lifecycle.append({"step": 3, "label": "Fiscal", "date": date, "detail": text[:80]})
            seen_steps.add(3)
            continue
        
        if any(kw in lower_text for kw in ["read third time", "ordered to the senate", "ordered to the assembly"]) and 4 not in seen_steps and 5 not in seen_steps:
            lifecycle.append({"step": 4, "label": "Floor (1st)", "date": date, "detail": text[:80]})
            seen_steps.add(4)
            continue
        
        if "enrolled" in lower_text and 7 not in seen_steps:
            lifecycle.append({"step": 7, "label": "Enrolled", "date": date, "detail": text[:80]})
            seen_steps.add(7)
            continue
        
        if ("signed by governor" in lower_text or "chaptered" in lower_text) and 8 not in seen_steps:
            lifecycle.append({"step": 8, "label": "Signed", "date": date, "detail": text[:80]})
            seen_steps.add(8)
            continue
        
        if "vetoed" in lower_text and 8 not in seen_steps:
            lifecycle.append({"step": 8, "label": "Vetoed", "date": date, "detail": text[:80]})
            seen_steps.add(8)
    
    lifecycle.sort(key=lambda x: x["step"])
    return lifecycle


def get_leginfo_url(bill_number, session="202520260"):
    compact = bill_number.replace(" ", "")
    return f"https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id={session}{compact}"


def transform_bill(raw):
    """Transform a single LegiScan bill → our tracker format."""
    bill_number = map_bill_number(raw.get("bill_number", ""))
    chamber_code = raw.get("body", "")
    chamber = CHAMBER_MAP.get(chamber_code, chamber_code)
    
    sponsors = raw.get("sponsors", [])
    primary = sponsors[0] if sponsors else {}
    
    author = primary.get("name", "Unknown")
    party = primary.get("party", "")
    district = map_district(primary.get("district", ""), chamber)
    
    history = raw.get("history", [])
    status_code = raw.get("status", 0)
    status = map_status(status_code, history)
    status_date = raw.get("status_date", "")
    
    date_introduced = history[0]["date"] if history else ""
    last_action = history[-1] if history else {}
    
    topics = map_topics(raw.get("subjects", []))
    session = raw.get("session", {})
    year = session.get("year_start", 2025)
    lifecycle = build_lifecycle(history, status_code)
    
    return {
        # FACTUAL (from LegiScan)
        "id": map_bill_id(raw.get("bill_number", "")),
        "number": bill_number,
        "chamber": chamber,
        "title": raw.get("title", ""),
        "author": author,
        "authorParty": party,
        "authorDistrict": district,
        "authorRegion": "",
        "status": status,
        "dateIntroduced": date_introduced,
        "lastAction": last_action.get("date", status_date),
        "lastActionText": last_action.get("action", "")[:100],
        "url": get_leginfo_url(bill_number),
        "year": year,
        "lifecycle": lifecycle,
        "topics": topics,
        
        # AI-ANALYZED (placeholders)
        "summary": "",
        "equityProximity": "",
        "equityDirection": "",
        "equityRationale": "",
        "race": [],
        "gender": False,
        "lgbtq": False,
        "disability": False,
        "workingClass": False,
        
        # METADATA
        "_legiscan_bill_id": raw.get("bill_id"),
        "_legiscan_change_hash": raw.get("change_hash", ""),
        "_legiscan_description": raw.get("description", ""),
        "_legiscan_subjects": [s.get("subject_name", "") for s in raw.get("subjects", [])],
        "_has_equity_analysis": False,
    }


def transform_all(raw_bills):
    transformed = []
    for raw in raw_bills:
        bill_type = raw.get("bill_type", "")
        bill_num = raw.get("bill_number", "")
        if bill_type == "B" or bill_num.startswith(("AB", "SB")):
            transformed.append(transform_bill(raw))
        elif bill_type == "CA" or bill_num.startswith(("ACA", "SCA")):
            transformed.append(transform_bill(raw))
    print(f"✓ Transformed {len(transformed)} bills")
    return transformed


def save_json(bills, output_path):
    with open(output_path, 'w') as f:
        json.dump(bills, f, indent=2)
    print(f"✓ Saved to {output_path}")


def save_js(bills, output_path):
    clean = [{k: v for k, v in b.items() if not k.startswith("_")} for b in bills]
    js = "export const BILLS_DATA = " + json.dumps(clean, indent=2) + ";\n"
    with open(output_path, 'w') as f:
        f.write(js)
    print(f"✓ Saved JS module to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Transform LegiScan → tracker format")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--format", choices=["json", "js"], default="json")
    parser.add_argument("--stats", action="store_true")
    args = parser.parse_args()
    
    with open(args.input) as f:
        raw_bills = json.load(f)
    
    bills = transform_all(raw_bills)
    
    if args.format == "js":
        save_js(bills, args.output)
    else:
        save_json(bills, args.output)


if __name__ == "__main__":
    main()
