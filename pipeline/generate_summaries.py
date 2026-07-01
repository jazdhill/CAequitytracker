"""
Generate plain-English summaries for all bills.
Adds equity_analysis.summary to each bill — picked up by normalizeBill()
over the raw 'relating to X' extraction.

Targets: every bill (equity-relevant and not)
Skips:   Bills that already have equity_analysis.summary set
Cost:    ~100 output tokens/bill × ~4,863 bills ≈ $0.60-1.20, ~0.3 kWh
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv, dotenv_values

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
MODEL = "claude-haiku-4-5-20251001"  # Haiku: cheaper + faster for short summaries

EQUITY_CLASSES = {"DIRECT EQUITY IMPACT", "STRUCTURAL EQUITY IMPACT", "EQUITY RELEVANT"}

SYSTEM_PROMPT = """You write plain-English bill summaries for a California legislative tracker used by college students and community advocates.

Given a bill number, title, and official description, write 1-2 sentences (max 40 words) that explain:
1. What the bill would DO in plain English (no section numbers, no legal citations)
2. Who it would affect

Rules:
- No jargon. "Workers" not "labor force participants."
- No bill number in your answer. Start with a verb or noun.
- No "This bill..." opener.
- If the description is too vague to summarize meaningfully, write: "Relates to [topic]." using the topic from the description.

Return ONLY the summary sentence(s). Nothing else."""


def summarize_bill(client, bill):
    title = bill.get("title", "")
    description = bill.get("description", "")
    bill_number = bill.get("bill_number", "")

    prompt = f"Bill: {bill_number}\nTitle: {title}\nOfficial description: {description}\n\nWrite the plain-English summary:"

    for attempt in range(3):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=120,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            summary = response.content[0].text.strip()
            tokens = response.usage.input_tokens + response.usage.output_tokens
            return summary, tokens
        except Exception as e:
            err = str(e)
            if "credit" in err.lower() or "billing" in err.lower():
                print(f"\n  CREDITS EXHAUSTED — stopping.")
                return None, 0
            if attempt == 2:
                return None, 0
            time.sleep(2 ** attempt)
    return None, 0


def main():
    print("=" * 60)
    print("GENERATE SUMMARIES: Equity-relevant bills")
    print("=" * 60)

    with open(DATA_PATH) as f:
        data = json.load(f)

    bills = data["bills"]

    # Find bills that need summaries
    targets = [
        (i, b) for i, b in enumerate(bills)
        if not b.get("equity_analysis", {}).get("summary")
    ]

    print(f"Total bills: {len(bills)}")
    print(f"Equity-relevant (need summaries): {len(targets)}")
    already_done = sum(
        1 for b in bills
        if b.get("equity_analysis", {}).get("summary")
    )
    print(f"Already have summaries: {already_done}")
    print()

    if not targets:
        print("Nothing to do — all equity-relevant bills already have summaries.")
        return

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    total_tokens = 0
    done = 0
    skipped = 0
    start = time.time()

    for n, (idx, bill) in enumerate(targets, 1):
        num = bill.get("bill_number", "?")

        if n % 100 == 1:
            elapsed = time.time() - start
            rate = n / elapsed if elapsed > 0 else 0
            remaining = (len(targets) - n) / rate / 60 if rate > 0 else 0
            print(f"[{n}/{len(targets)}] {num}  |  ~{remaining:.0f} min remaining  |  {done} done")

        summary, tokens = summarize_bill(client, bill)

        if summary is None and tokens == 0:
            # Check if it was a credit error (returned from inside loop) or just failed
            skipped += 1
            # Try to detect credit exhaustion by checking error pattern
            print(f"\nStopped at bill {n}/{len(targets)}. {done} summaries generated.")
            print("Run again to resume — already-summarized bills are saved.")
            break

        if summary:
            bills[idx]["equity_analysis"]["summary"] = summary
            total_tokens += tokens
            done += 1

        # Checkpoint every 100 bills
        if n % 100 == 0:
            data["bills"] = bills
            with open(DATA_PATH, "w") as f:
                json.dump(data, f)
            print(f"  ✓ Checkpoint saved ({done} summaries)")

        time.sleep(0.2)

    # Final save
    data["bills"] = bills
    data["metadata"]["energy_usage"]["total_tokens"] = \
        data["metadata"]["energy_usage"].get("total_tokens", 0) + total_tokens
    data["metadata"]["energy_usage"]["requests_made"] = \
        data["metadata"]["energy_usage"].get("requests_made", 0) + len(targets)

    with open(DATA_PATH, "w") as f:
        json.dump(data, f)

    elapsed = (time.time() - start) / 60
    kwh = total_tokens / 1_000_000  # rough: 1 kWh per 1M tokens

    print()
    print("=" * 60)
    print(f"DONE in {elapsed:.1f} min")
    print(f"  Summaries generated: {done}")
    print(f"  Skipped/failed:      {skipped}")
    print(f"  Tokens used:         {total_tokens:,}")
    print(f"  Est. energy:         ~{kwh:.3f} kWh")
    print(f"  Saved to:            {DATA_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()
