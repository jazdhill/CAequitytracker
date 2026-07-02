"""
One-time backfill: populate committee/calendar on every existing bill.

These two fields were added to raw_bill_to_tracker_bill() after the dataset
was originally built, so no bill has them yet. Going forward, the regular
monthly_update.py changed-bill refresh keeps them current automatically —
this script only needs to run once to catch the ~4,860 bills that predate
the fields.

Refetches full bill detail for every bill (same as monthly_update.py's
"changed bill" path) and replaces facts wholesale — equity_analysis is
preserved untouched. No AI calls, no Anthropic cost.

Usage:
  python backfill_committee_calendar.py            # real run
  python backfill_committee_calendar.py --limit 5  # test on a few bills
"""

import argparse
import json
import sys
import time
from pathlib import Path
from dotenv import dotenv_values

ROOT = Path(__file__).parent.parent
env_vals = dotenv_values(ROOT / ".env")
LEGISCAN_API_KEY = env_vals.get("LEGISCAN_API_KEY")

if not LEGISCAN_API_KEY:
    print("ERROR: No LEGISCAN_API_KEY found in .env")
    sys.exit(1)

sys.path.insert(0, str(Path(__file__).parent))
from legiscan_client import get_bill_detail
from monthly_update import raw_bill_to_tracker_bill

DATA_PATH = ROOT / "public" / "ca_equity_bills_2025.json"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()

    with open(DATA_PATH) as f:
        data = json.load(f)
    bills = data["bills"]

    targets = [(i, b) for i, b in enumerate(bills) if "committee" not in b]
    if args.limit:
        targets = targets[: args.limit]

    print(f"Backfilling committee/calendar on {len(targets)} bills...")
    start = time.time()

    for n, (idx, bill) in enumerate(targets, 1):
        if n % 50 == 1:
            elapsed = time.time() - start
            rate = n / elapsed if elapsed > 0 else 0
            remaining = (len(targets) - n) / rate / 60 if rate > 0 else 0
            print(f"[{n}/{len(targets)}] {bill.get('bill_number')}  |  ~{remaining:.0f} min remaining")

        raw = get_bill_detail(LEGISCAN_API_KEY, bill["bill_id"])
        refreshed = raw_bill_to_tracker_bill(raw)
        refreshed["equity_analysis"] = bill.get("equity_analysis", {})
        bills[idx] = refreshed

        if n % 100 == 0:
            data["bills"] = bills
            with open(DATA_PATH, "w") as f:
                json.dump(data, f)
            print(f"  ✓ Checkpoint saved ({n}/{len(targets)})")

        time.sleep(0.35)

    data["bills"] = bills
    with open(DATA_PATH, "w") as f:
        json.dump(data, f)

    print()
    print(f"DONE — {len(targets)} bills backfilled in {(time.time()-start)/60:.1f} min")


if __name__ == "__main__":
    main()
