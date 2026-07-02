"""
Incremental monthly update — the automated version of "did we update the bill
statuses this month."

Unlike the legacy legiscan_client.py -> transform_bills.py -> equity_classifier.py
chain (which writes to pipeline/data/*.json and BillsData.js, a format the live
app never reads), this script reads and writes public/ca_equity_bills_2025.json
directly, in its actual nested equity_analysis format.

What it does:
  1. Pull LegiScan's master list for the configured session (change_hash per bill).
  2. Diff against what's already in the live dataset.
  3. For bills whose change_hash changed: refetch and refresh FACTS only
     (status, lifecycle, texts, sponsors) — equity_analysis is left untouched,
     since a status change doesn't mean the bill's substance changed.
  4. For bills that are brand new (not seen before): fetch full detail, then run
     the same three-pass AI pipeline used for the initial dataset — Sonnet
     classification, Haiku direction, Haiku summary — reusing the exact
     functions from rerun_errors.py / direction_classifier.py / generate_summaries.py
     so a monthly update produces bills indistinguishable from the original batch.
  5. Update metadata (total_bills, last_updated, energy_usage via commit_energy).

Usage:
  python monthly_update.py            # real run
  python monthly_update.py --dry-run  # fetch + diff only, no writes, no AI calls
  python monthly_update.py --limit 5  # cap new-bill classification (testing)

Required env vars: LEGISCAN_API_KEY, ANTHROPIC_API_KEY
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path
from dotenv import dotenv_values

ROOT = Path(__file__).parent.parent
env_vals = dotenv_values(ROOT / ".env")
LEGISCAN_API_KEY = env_vals.get("LEGISCAN_API_KEY") or os.environ.get("LEGISCAN_API_KEY")
ANTHROPIC_API_KEY = env_vals.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")

if not LEGISCAN_API_KEY:
    print("ERROR: No LEGISCAN_API_KEY found in .env or environment")
    sys.exit(1)
if not ANTHROPIC_API_KEY:
    print("ERROR: No ANTHROPIC_API_KEY found in .env or environment")
    sys.exit(1)

try:
    import anthropic
except ImportError:
    os.system(f"{sys.executable} -m pip install anthropic python-dotenv requests -q")
    import anthropic

sys.path.insert(0, str(Path(__file__).parent))
from legiscan_client import get_master_list, get_bill_detail
from energy_tracking import commit_energy

# Reuse the exact classification passes used to build the original dataset —
# keeps a monthly update indistinguishable from the initial batch.
from rerun_errors import classify_bill as classify_equity, MODEL as SONNET_MODEL
from direction_classifier import classify_direction, EQUITY_CLASSES
from generate_summaries import summarize_bill

DATA_PATH = ROOT / "public" / "ca_equity_bills_2025.json"
SESSION_CONFIG_PATH = ROOT / "session_config.json"


def load_session_config():
    with open(SESSION_CONFIG_PATH) as f:
        return json.load(f)


def build_lifecycle(history):
    """
    Build the live dataset's lifecycle dict from raw LegiScan history entries.
    Matches the schema normalizeBill() (frontend) already expects — verified
    against 8 example bills spanning every current_status value in the live
    dataset, so current_status derivation (see below) lines up correctly.
    """
    lc = {
        "introduced_date": None, "committee_dates": [], "floor_dates": [],
        "passed_house": None, "passed_senate": None,
        "signed_date": None, "vetoed_date": None, "died_date": None,
    }
    for action in history or []:
        date = action.get("date", "")
        text = (action.get("action") or "").lower()

        if not lc["introduced_date"] and ("introduced" in text or "read first time" in text):
            lc["introduced_date"] = date
        if any(kw in text for kw in ["referred to com", "from committee", "committee on"]):
            lc["committee_dates"].append(date)
        if any(kw in text for kw in ["read second time", "read third time", "floor"]):
            lc["floor_dates"].append(date)
        # passed_house/passed_senate mark the crossover DESTINATION named in the action
        # text ("Ordered to the Senate"/"Ordered to the Assembly") — not which chamber
        # performed the action. Verified against the live dataset: AB2's Assembly floor
        # pass ("Read third time. Passed. Ordered to the Senate.") is recorded under
        # passed_senate, since that's where it was headed.
        if "read third time" in text and "passed" in text:
            if "ordered to the senate" in text and not lc["passed_senate"]:
                lc["passed_senate"] = date
            elif "ordered to the assembly" in text and not lc["passed_house"]:
                lc["passed_house"] = date
        if "signed by governor" in text or "chaptered" in text:
            lc["signed_date"] = date
        if "vetoed" in text:
            lc["vetoed_date"] = date
        if "died" in text or "failed" in text:
            lc["died_date"] = date

    # Dedupe + sort date lists (LegiScan sometimes logs near-duplicate actions same day)
    lc["committee_dates"] = sorted(set(lc["committee_dates"]))
    lc["floor_dates"] = sorted(set(lc["floor_dates"]))

    # current_status derivation — reverse-engineered from the live dataset:
    # purely a function of these date fields, not LegiScan's raw numeric status code.
    if lc["signed_date"]:
        lc["current_status"] = "signed"
    elif lc["vetoed_date"]:
        lc["current_status"] = "vetoed"
    elif lc["died_date"]:
        lc["current_status"] = "died"
    elif lc["passed_house"] and lc["passed_senate"]:
        lc["current_status"] = "passed_both"
    elif lc["passed_house"] or lc["passed_senate"]:
        lc["current_status"] = "passed_one_chamber"
    elif lc["floor_dates"]:
        lc["current_status"] = "in_floor_process"
    elif lc["committee_dates"]:
        lc["current_status"] = "in_committee"
    else:
        lc["current_status"] = "introduced"

    return lc


def raw_bill_to_tracker_bill(raw):
    """Facts layer only — no AI. Matches the live dataset's per-bill schema."""
    sponsors = [
        {"name": s.get("name", ""), "party": s.get("party", ""), "role": s.get("role", "")}
        for s in raw.get("sponsors", [])
    ]
    texts = [
        {"type": t.get("type"), "date": t.get("date"), "url": t.get("state_link") or t.get("url")}
        for t in raw.get("texts", [])
    ]
    raw_committee = raw.get("committee")
    committee = (
        {"name": raw_committee.get("name", ""), "chamber": raw_committee.get("chamber", "")}
        if isinstance(raw_committee, dict) and raw_committee.get("name")
        else None
    )
    calendar = [
        {
            "type": e.get("type", ""),
            "date": e.get("date", ""),
            "time": e.get("time", ""),
            "location": e.get("location", ""),
            "description": e.get("description", ""),
        }
        for e in (raw.get("calendar") or [])
    ]
    return {
        "bill_id": raw.get("bill_id"),
        "bill_number": raw.get("bill_number"),
        "title": raw.get("title", ""),
        "description": raw.get("description", ""),
        "state": raw.get("state", "CA"),
        "session": raw.get("session", {}).get("session_name", "") if isinstance(raw.get("session"), dict) else "",
        "status": raw.get("status"),
        "status_desc": raw.get("status_desc"),
        "url": raw.get("url", ""),
        "state_link": raw.get("state_link", ""),
        "change_hash": raw.get("change_hash", ""),
        "sponsors": sponsors,
        "subjects": raw.get("subjects", []),
        "lifecycle": build_lifecycle(raw.get("history", [])),
        "texts": texts,
        "committee": committee,
        "calendar": calendar,
    }


def main():
    parser = argparse.ArgumentParser(description="Monthly incremental bill update")
    parser.add_argument("--dry-run", action="store_true", help="Fetch + diff only, no writes, no AI calls")
    parser.add_argument("--limit", type=int, help="Cap number of new bills classified (for testing)")
    args = parser.parse_args()

    config = load_session_config()
    session_id = config["session_id"]

    print("=" * 60)
    print(f"MONTHLY UPDATE — session {session_id} ({config['session_name']})")
    print("=" * 60)

    with open(DATA_PATH) as f:
        data = json.load(f)
    bills = data["bills"]
    by_id = {b["bill_id"]: (i, b) for i, b in enumerate(bills)}

    print("Fetching LegiScan master list...")
    master = get_master_list(LEGISCAN_API_KEY, session_id)
    print(f"  {len(master)} bills in session")

    new_ids, changed_ids = [], []
    for bill_id, summary in master.items():
        if bill_id not in by_id:
            new_ids.append(bill_id)
        elif summary.get("change_hash") != by_id[bill_id][1].get("change_hash"):
            changed_ids.append(bill_id)

    print(f"  New bills:     {len(new_ids)}")
    print(f"  Changed bills: {len(changed_ids)}")
    print(f"  Unchanged:     {len(master) - len(new_ids) - len(changed_ids)}")

    if args.dry_run:
        print("\n--dry-run: stopping before any writes or AI calls.")
        return

    if args.limit:
        new_ids = new_ids[: args.limit]

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY, timeout=30.0, max_retries=1)
    total_tokens = 0
    total_requests = 0

    def checkpoint(label):
        data["bills"] = bills
        data["metadata"]["total_bills"] = len(bills)
        with open(DATA_PATH, "w") as f:
            json.dump(data, f)
        print(f"  ✓ Checkpoint saved ({label})")

    # --- Refresh facts on changed bills (no AI, equity_analysis untouched) ---
    for n, bill_id in enumerate(changed_ids, 1):
        print(f"  [{n}/{len(changed_ids)}] refreshing facts for changed bill {bill_id}")
        raw = get_bill_detail(LEGISCAN_API_KEY, bill_id)
        idx, existing = by_id[bill_id]
        facts = raw_bill_to_tracker_bill(raw)
        facts["equity_analysis"] = existing.get("equity_analysis", {})
        bills[idx] = facts
        if n % 100 == 0:
            checkpoint(f"{n}/{len(changed_ids)} changed bills refreshed")
        time.sleep(0.35)

    # --- New bills: facts + full AI pipeline ---
    for n, bill_id in enumerate(new_ids, 1):
        print(f"  [{n}/{len(new_ids)}] classifying new bill {bill_id}")
        raw = get_bill_detail(LEGISCAN_API_KEY, bill_id)
        bill = raw_bill_to_tracker_bill(raw)

        analysis, tokens = classify_equity(client, bill)
        total_tokens += tokens
        total_requests += 1
        if analysis is None:
            print("  CREDITS EXHAUSTED — stopping new-bill classification.")
            break
        bill["equity_analysis"] = {
            "classification": analysis.get("classification", ""),
            "rationale": analysis.get("rationale", ""),
            "key_populations": analysis.get("key_populations", []),
            "confidence": analysis.get("confidence", ""),
            "classified_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
            "model_used": SONNET_MODEL,
        }

        if bill["equity_analysis"]["classification"] in EQUITY_CLASSES:
            direction, d_tokens = classify_direction(client, bill)
            total_tokens += d_tokens
            total_requests += 1
            if direction:
                bill["equity_analysis"]["direction"] = direction

        summary, s_tokens = summarize_bill(client, bill)
        total_tokens += s_tokens
        total_requests += 1
        if summary:
            bill["equity_analysis"]["summary"] = summary

        bills.append(bill)
        by_id[bill_id] = (len(bills) - 1, bill)

        if n % 25 == 0:
            data["bills"] = bills
            commit_energy(data, total_tokens, total_requests)
            checkpoint(f"{n}/{len(new_ids)} new bills classified")
            total_tokens = 0
            total_requests = 0

        time.sleep(0.2)

    data["bills"] = bills
    data["metadata"]["total_bills"] = len(bills)
    data["metadata"]["last_updated"] = time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime())
    commit_energy(data, total_tokens, total_requests)

    with open(DATA_PATH, "w") as f:
        json.dump(data, f)

    print()
    print("=" * 60)
    print(f"DONE — {len(changed_ids)} refreshed, {len(new_ids)} new bills classified")
    print(f"  Tokens used: {total_tokens:,}")
    print(f"  Saved to:    {DATA_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()
