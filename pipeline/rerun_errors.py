"""
Rerun only the ERROR bills from a previous pipeline run.
Reads the existing JSON, reclassifies only bills with classification == ERROR,
and writes the patched JSON back in place.
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv, dotenv_values

# Load .env from project root
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
MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = """You are an equity policy analyst for the California Equity Legislative Tracker.
Analyze California legislation through a racial equity lens.

Return ONLY valid JSON with these exact fields:
{
  "classification": "DIRECT EQUITY IMPACT" | "STRUCTURAL EQUITY IMPACT" | "EQUITY RELEVANT" | "NOT EQUITY FOCUSED",
  "rationale": "2-3 sentence explanation",
  "key_populations": ["array", "of", "affected", "groups"],
  "confidence": "high" | "medium" | "low"
}

Classifications:
- DIRECT EQUITY IMPACT: Bill explicitly names race/ethnicity or targets clearly racialized conditions
- STRUCTURAL EQUITY IMPACT: Bill shapes systems (housing, education, criminal justice, labor) that disproportionately affect communities of color
- EQUITY RELEVANT: Bill has some equity implications but indirect or minor
- NOT EQUITY FOCUSED: Bill has minimal connection to racial equity

Key populations to consider: Black, Latino/a/e, Asian, Indigenous, Immigrants, MENA, Gender, LGBTQ+, Disability, Working-class"""

def classify_bill(client, bill):
    title = bill.get("title", "")
    description = bill.get("description", "")
    subjects = bill.get("subjects", [])
    if isinstance(subjects, list):
        subjects_str = ", ".join(
            s if isinstance(s, str) else s.get("subject_name", "") for s in subjects
        )
    else:
        subjects_str = ""

    prompt = f"""Bill: {bill.get('bill_number', '')} — {title}
Description: {description}
Subjects: {subjects_str}

Classify this bill's equity impact. Return only the JSON object."""

    for attempt in range(3):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=400,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            text = response.content[0].text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            result = json.loads(text.strip())
            return result, response.usage.input_tokens + response.usage.output_tokens
        except json.JSONDecodeError:
            if attempt == 2:
                return {"classification": "ERROR", "rationale": "JSON parse error", "key_populations": [], "confidence": "low"}, 0
            time.sleep(1)
        except Exception as e:
            err = str(e)
            if "credit" in err.lower() or "billing" in err.lower():
                print(f"\n  CREDITS EXHAUSTED — stopping. Run again after topping up.")
                return None, 0
            if attempt == 2:
                return {"classification": "ERROR", "rationale": f"Classification failed: {err[:100]}", "key_populations": [], "confidence": "low"}, 0
            time.sleep(2 ** attempt)
    return {"classification": "ERROR", "rationale": "Max retries exceeded", "key_populations": [], "confidence": "low"}, 0


def main():
    print("=" * 60)
    print("RERUN: Reclassifying ERROR bills")
    print("=" * 60)

    with open(DATA_PATH) as f:
        data = json.load(f)

    bills = data["bills"]
    error_indices = [i for i, b in enumerate(bills)
                     if b.get("equity_analysis", {}).get("classification") == "ERROR"]

    print(f"Total bills: {len(bills)}")
    print(f"To reclassify: {len(error_indices)}")
    print()

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    total_tokens = 0
    fixed = 0
    still_errored = 0
    start = time.time()

    for n, idx in enumerate(error_indices, 1):
        bill = bills[idx]
        num = bill.get("bill_number", "?")

        if n % 50 == 1:
            elapsed = time.time() - start
            rate = n / elapsed if elapsed > 0 else 0
            remaining = (len(error_indices) - n) / rate / 60 if rate > 0 else 0
            print(f"[{n}/{len(error_indices)}] {num}  |  ~{remaining:.0f} min remaining  |  {fixed} fixed so far")

        result, tokens = classify_bill(client, bill)

        if result is None:  # Credits exhausted mid-run
            print(f"\nStopped at bill {n}/{len(error_indices)}. {fixed} bills fixed so far.")
            print("Top up credits and run again — already-fixed bills are saved.")
            break

        total_tokens += tokens
        bills[idx]["equity_analysis"] = result

        if result["classification"] != "ERROR":
            fixed += 1
        else:
            still_errored += 1

        # Save checkpoint every 100 bills
        if n % 100 == 0:
            data["bills"] = bills
            with open(DATA_PATH, "w") as f:
                json.dump(data, f)
            print(f"  ✓ Checkpoint saved ({fixed} fixed)")

        time.sleep(0.3)  # gentle rate limiting

    # Final save
    data["bills"] = bills
    data["metadata"]["energy_usage"]["total_tokens"] = \
        data["metadata"]["energy_usage"].get("total_tokens", 0) + total_tokens
    data["metadata"]["energy_usage"]["requests_made"] = \
        data["metadata"]["energy_usage"].get("requests_made", 0) + len(error_indices)

    with open(DATA_PATH, "w") as f:
        json.dump(data, f)

    elapsed = (time.time() - start) / 60
    print()
    print("=" * 60)
    print(f"DONE in {elapsed:.1f} min")
    print(f"  Fixed:        {fixed}")
    print(f"  Still errors: {still_errored}")
    print(f"  Tokens used:  {total_tokens:,}")
    print(f"  Saved to:     {DATA_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()
