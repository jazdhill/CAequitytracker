"""
Equity Classifier — Claude API Analysis Layer
==============================================
Takes transformed bill data (with factual fields from LegiScan) and runs
each bill through Claude to generate equity classifications.

The AI receives the bill's official description, subjects, title, and status
as INPUT — it does not generate these. It only generates the ANALYSIS.

Usage:
  python equity_classifier.py --input tracker_bills.json --output classified_bills.json
  python equity_classifier.py --input tracker_bills.json --output classified_bills.json --limit 5

Cost: ~2,500 bills × ~2K tokens ≈ $5-15 depending on rates
"""

import argparse
import json
import os
import sys
import time

try:
    import requests
except ImportError:
    os.system(f"{sys.executable} -m pip install requests --break-system-packages -q")
    import requests


ANTHROPIC_API = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-4-20250514"
MAX_RETRIES = 3
RATE_LIMIT_DELAY = 1.0


SYSTEM_PROMPT = """You are an equity policy analyst for the California Equity Legislative Tracker, a tool created by a UCLA researcher. Your job is to analyze California state legislation through a racial equity lens.

For each bill, you will receive its official title, description, subjects, and status from the California Legislature (via LegiScan). Based on this factual information, provide:

1. **summary**: A 1-3 sentence plain-language summary accessible to non-specialists. Explain what the bill DOES, not just what it's about. Use active voice.

2. **equityProximity**: How directly the bill relates to racial equity.
   - "explicit": Bill directly names race, ethnicity, or specific racial groups
   - "structural": Bill addresses systems (housing, education, criminal justice, labor) that disproportionately affect communities of color, but doesn't name race explicitly

3. **equityDirection**: The bill's impact on racial equity.
   - "advances": Expands protections, resources, or rights for affected communities
   - "threatens": Restricts protections, increases punitive measures, or removes resources
   - "mixed": Contains elements that both help and harm, or has ambiguous impact

4. **equityRationale**: 2-3 sentences explaining WHY you classified it this way.

5. **race**: Array of affected communities. Choose from: "Black", "Latino/a/e", "Asian", "Indigenous", "Immigrants", "MENA". Empty array if general population.

6. **gender**: boolean
7. **lgbtq**: boolean
8. **disability**: boolean
9. **workingClass**: boolean

GUIDELINES:
- Be nonpartisan. Judge IMPACT, not party.
- "structural" is not lesser than "explicit."
- Consider documented racial disparities in criminal justice, housing, and labor.
- Purely procedural bills can have empty classifications.

Respond with ONLY a JSON object. No markdown, no explanation outside the JSON."""


USER_PROMPT_TEMPLATE = """Analyze this California bill for racial equity impact:

BILL: {number}
TITLE: {title}
DESCRIPTION: {description}
SUBJECTS: {subjects}
STATUS: {status}
AUTHOR: {author} ({party})
TOPICS: {topics}

Respond with JSON: summary, equityProximity, equityDirection, equityRationale, race, gender, lgbtq, disability, workingClass"""


def classify_bill(bill, api_key):
    user_msg = USER_PROMPT_TEMPLATE.format(
        number=bill.get("number", ""),
        title=bill.get("title", ""),
        description=bill.get("_legiscan_description", bill.get("title", "")),
        subjects=", ".join(bill.get("_legiscan_subjects", bill.get("topics", []))),
        status=bill.get("status", ""),
        author=bill.get("author", ""),
        party=bill.get("authorParty", ""),
        topics=", ".join(bill.get("topics", [])),
    )
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
    }
    body = {
        "model": MODEL,
        "max_tokens": 800,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_msg}],
    }
    
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.post(ANTHROPIC_API, headers=headers, json=body, timeout=60)
            if resp.status_code == 429:
                time.sleep(min(2 ** attempt * 5, 60))
                continue
            resp.raise_for_status()
            data = resp.json()
            
            text = ""
            for block in data.get("content", []):
                if block.get("type") == "text":
                    text += block["text"]
            
            text = text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
            
            # Also return token counts for energy tracking
            usage = data.get("usage", {})
            return json.loads(text), usage
            
        except (json.JSONDecodeError, requests.exceptions.RequestException) as e:
            print(f"    ⚠ Error on attempt {attempt+1}: {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(2 ** attempt * 2)
    
    return None, {}


def apply_analysis(bill, analysis):
    if not analysis:
        return bill
    bill["summary"] = analysis.get("summary", "")
    bill["equityProximity"] = analysis.get("equityProximity", "")
    bill["equityDirection"] = analysis.get("equityDirection", "")
    bill["equityRationale"] = analysis.get("equityRationale", "")
    bill["race"] = analysis.get("race", [])
    bill["gender"] = bool(analysis.get("gender", False))
    bill["lgbtq"] = bool(analysis.get("lgbtq", False))
    bill["disability"] = bool(analysis.get("disability", False))
    bill["workingClass"] = bool(analysis.get("workingClass", False))
    bill["_has_equity_analysis"] = True
    return bill


def run_classification(bills, api_key, limit=None, skip_analyzed=False):
    to_classify = [b for b in bills if not (skip_analyzed and b.get("_has_equity_analysis"))]
    if limit:
        to_classify = to_classify[:limit]
    
    total = len(to_classify)
    success = 0
    total_input_tokens = 0
    total_output_tokens = 0
    
    print(f"\n🔬 Classifying {total} bills for equity impact...")
    print(f"   Model: {MODEL}\n")
    
    for i, bill in enumerate(to_classify):
        bill_num = bill.get("number", "?")
        analysis, usage = classify_bill(bill, api_key)
        
        if analysis:
            apply_analysis(bill, analysis)
            success += 1
            total_input_tokens += usage.get("input_tokens", 0)
            total_output_tokens += usage.get("output_tokens", 0)
        
        if (i + 1) % 10 == 0 or (i + 1) == total:
            print(f"  [{i+1}/{total}] {bill_num}: {bill.get('equityProximity', '?')}/{bill.get('equityDirection', '?')}")
        
        time.sleep(RATE_LIMIT_DELAY)
    
    # Energy estimation: ~0.002 kWh per 1K tokens (conservative)
    total_tokens = total_input_tokens + total_output_tokens
    estimated_kwh = (total_tokens / 1000) * 0.002
    
    print(f"\n✓ Classified: {success}/{total}")
    print(f"  Tokens used: {total_tokens:,} ({total_input_tokens:,} in + {total_output_tokens:,} out)")
    print(f"  Estimated energy: {estimated_kwh:.3f} kWh")
    
    return bills, {"tokens": total_tokens, "kwh": estimated_kwh}


def main():
    parser = argparse.ArgumentParser(description="Equity classifier")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--api-key", help="Anthropic API key (or ANTHROPIC_API_KEY env var)")
    parser.add_argument("--limit", type=int)
    parser.add_argument("--skip-analyzed", action="store_true")
    parser.add_argument("--format", choices=["json", "js"], default="json")
    args = parser.parse_args()
    
    api_key = args.api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ Need Anthropic API key. Set ANTHROPIC_API_KEY env var")
        sys.exit(1)
    
    with open(args.input) as f:
        bills = json.load(f)
    
    bills, stats = run_classification(bills, api_key, limit=args.limit, skip_analyzed=args.skip_analyzed)
    
    if args.format == "js":
        clean = [{k: v for k, v in b.items() if not k.startswith("_")} for b in bills]
        js = "export const BILLS_DATA = " + json.dumps(clean, indent=2) + ";\n"
        with open(args.output, 'w') as f:
            f.write(js)
    else:
        with open(args.output, 'w') as f:
            json.dump(bills, f, indent=2)
    
    print(f"✓ Saved to {args.output}")


if __name__ == "__main__":
    main()
