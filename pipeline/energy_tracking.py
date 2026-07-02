"""
Shared energy-accounting helper for pipeline scripts.

The About page's energy cap ("17 kWh per year") resets annually, so token
usage needs to be bucketed by calendar year, not just accumulated forever.
metadata.energy_usage.by_year holds that breakdown; total_tokens/requests_made
are kept alongside as an all-time running total for transparency.
"""

from datetime import datetime, timezone


def commit_energy(data, tokens, requests):
    """Add `tokens`/`requests` to both the all-time total and the current
    calendar year's bucket. Call this at every checkpoint, not just at the
    end, so an interrupted run doesn't lose its energy accounting."""
    usage = data["metadata"]["energy_usage"]
    usage["total_tokens"] = usage.get("total_tokens", 0) + tokens
    usage["requests_made"] = usage.get("requests_made", 0) + requests

    year = str(datetime.now(timezone.utc).year)
    by_year = usage.setdefault("by_year", {})
    bucket = by_year.setdefault(year, {"tokens": 0, "requests": 0})
    bucket["tokens"] += tokens
    bucket["requests"] += requests
