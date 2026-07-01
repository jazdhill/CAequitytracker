"""
Classify equity direction (advances / threatens / mixed) for equity-relevant bills.
Adds equity_analysis.direction to each bill — picked up by normalizeBill()
which currently hardcodes every equity-relevant bill to "advances" because
this field was never actually populated by the original classification run.

Targets: bills classified DIRECT EQUITY IMPACT, STRUCTURAL EQUITY IMPACT, or
         EQUITY RELEVANT (same set generate_summaries.py originally targeted)
Skips:   Bills that already have equity_analysis.direction set
Cost:    ~30 output tokens/bill x ~4,120 bills, Haiku ~ $0.50-1.00
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import dotenv_values

env_path = Path(__file__).parent.parent / ".env"
env_vals = dotenv_values(env_path)
ANTHROPIC_API_KEY = env_vals.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")

if not ANTHROPIC_API_KEY:
    print("ERROR: No ANTHROPIC_API_KEY found in .env")
    sys.exit(1)

try:
    import anthropic
except ImportError:
    os.system(f"{sys.executable} -m pip install anthropic python-dotenv -q")
    import anthropic

DATA_PATH = Path(__file__).parent.parent / "public" / "ca_equity_bills_2025.json"
MODEL = "claude-haiku-4-5-20251001"

EQUITY_CLASSES = {"DIRECT EQUITY IMPACT", "STRUCTURAL EQUITY IMPACT", "EQUITY RELEVANT"}
VALID_DIRECTIONS = {"advances", "threatens", "mixed"}

SYSTEM_PROMPT = """You are an equity policy analyst for the California Equity Legislative Tracker. You classify a bill's DIRECTION of impact on racial equity, given its title, official description, and an existing equity rationale.

Choose exactly one:
- "advances": Expands protections, resources, or rights for affected communities
- "threatens": Restricts protections, increases punitive measures, or removes resources
- "mixed": Contains elements that both help and harm, or has genuinely ambiguous impact

Be nonpartisan. Judge impact, not party. Consider documented racial disparities in criminal justice, housing, labor, and education.

Respond with ONLY one word: advances, threatens, or mixed. Nothing else."""


def classify_direction(client, bill):
    title = bill.get("title", "")
    description = bill.get("description", "")
    bill_number = bill.get("bill_number", "")
    rationale = bill.get("equity_analysis", {}).get("rationale", "")

    prompt = f"Bill: {bill_number}\nTitle: {title}\nOfficial description: {description}\nExisting equity rationale: {rationale}\n\nClassify the direction:"

    for attempt in range(3):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=10,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
                timeout=30.0,
            )
            direction = response.content[0].text.strip().lower()
            tokens = response.usage.input_tokens + response.usage.output_tokens
            if direction not in VALID_DIRECTIONS:
                # Model sometimes wraps in punctuation/extra words — take first matching token
                direction = next((d for d in VALID_DIRECTIONS if d in direction), None)
            return direction, tokens
        except Exception as e:
            err = str(e)
            if "credit" in err.lower() or "billing" in err.lower():
                print(f"\n  CREDITS EXHAUSTED — stopping.", flush=True)
                return None, 0
            print(f"  ! {bill_number} attempt {attempt+1}/3 failed: {err[:150]}", flush=True)
            if attempt == 2:
                return None, 0
            time.sleep(2 ** attempt)
    return None, 0


def main():
    print("=" * 60)
    print("CLASSIFY DIRECTION: Equity-relevant bills")
    print("=" * 60)

    with open(DATA_PATH) as f:
        data = json.load(f)

    bills = data["bills"]

    targets = [
        (i, b) for i, b in enumerate(bills)
        if b.get("equity_analysis", {}).get("classification") in EQUITY_CLASSES
        and not b.get("equity_analysis", {}).get("direction")
    ]

    already_done = sum(
        1 for b in bills
        if b.get("equity_analysis", {}).get("direction")
    )
    print(f"Total bills: {len(bills)}")
    print(f"Equity-relevant needing direction: {len(targets)}")
    print(f"Already classified: {already_done}")
    print()

    if not targets:
        print("Nothing to do — all equity-relevant bills already have direction.")
        return

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY, timeout=30.0, max_retries=1)

    total_tokens = 0
    done = 0
    start = time.time()

    for n, (idx, bill) in enumerate(targets, 1):
        num = bill.get("bill_number", "?")

        if n % 100 == 1:
            elapsed = time.time() - start
            rate = n / elapsed if elapsed > 0 else 0
            remaining = (len(targets) - n) / rate / 60 if rate > 0 else 0
            print(f"[{n}/{len(targets)}] {num}  |  ~{remaining:.0f} min remaining  |  {done} done")

        direction, tokens = classify_direction(client, bill)

        if direction is None and tokens == 0:
            print(f"\nStopped at bill {n}/{len(targets)}. {done} classified.")
            print("Run again to resume — already-classified bills are saved.")
            break

        if direction:
            bills[idx]["equity_analysis"]["direction"] = direction
            total_tokens += tokens
            done += 1

        if n % 100 == 0:
            data["bills"] = bills
            with open(DATA_PATH, "w") as f:
                json.dump(data, f)
            print(f"  ✓ Checkpoint saved ({done} classified)")

        time.sleep(0.2)

    data["bills"] = bills
    with open(DATA_PATH, "w") as f:
        json.dump(data, f)

    elapsed = (time.time() - start) / 60
    kwh = total_tokens / 1_000_000

    print()
    print("=" * 60)
    print(f"DONE in {elapsed:.1f} min")
    print(f"  Classified:   {done}")
    print(f"  Tokens used:  {total_tokens:,}")
    print(f"  Est. energy:  ~{kwh:.3f} kWh")
    print(f"  Saved to:     {DATA_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()
