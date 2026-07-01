"""
LegiScan API Client for California Equity Legislative Tracker
==============================================================
Fetches structured bill data from LegiScan's API.
All factual data (author, district, party, status, dates, votes) comes from here.
AI never generates these fields.

Usage:
  python legiscan_client.py --api-key YOUR_KEY --output raw_bills.json
  python legiscan_client.py --api-key YOUR_KEY --bill SB48    # single bill test
  python legiscan_client.py --dataset /path/to/CA_dataset.zip  # offline mode

Free tier: 30,000 queries/month (plenty for ~2,500 CA bills + monthly updates)
"""

import argparse
import json
import os
import sys
import time
import zipfile
import glob
from pathlib import Path

try:
    import requests
except ImportError:
    print("Installing requests...")
    os.system(f"{sys.executable} -m pip install requests --break-system-packages -q")
    import requests


API_BASE = "https://api.legiscan.com/"
CA_STATE = "CA"
RATE_LIMIT_DELAY = 0.35  # ~3 requests/sec, well within limits


def api_call(api_key, operation, params=None):
    """Make a single LegiScan API call."""
    query = {"key": api_key, "op": operation}
    if params:
        query.update(params)
    
    resp = requests.get(API_BASE, params=query, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    
    if data.get("status") == "ERROR":
        raise Exception(f"LegiScan API error: {data.get('alert', {}).get('message', 'Unknown error')}")
    
    return data


def get_session_list(api_key):
    """Get available CA legislative sessions."""
    data = api_call(api_key, "getSessionList", {"state": CA_STATE})
    sessions = data.get("sessions", [])
    print(f"Found {len(sessions)} CA sessions")
    for s in sessions[:5]:
        print(f"  - {s['session_name']} (ID: {s['session_id']}, {s['year_start']}-{s['year_end']})")
    return sessions


def get_current_session_id(api_key):
    """Find the current (2025-2026) CA session ID."""
    sessions = get_session_list(api_key)
    for s in sessions:
        if s["year_start"] >= 2025 and "Regular" in s.get("session_name", ""):
            print(f"\n→ Using session: {s['session_name']} (ID: {s['session_id']})")
            return s["session_id"]
    if sessions:
        s = sessions[0]
        print(f"\n→ Fallback to most recent: {s['session_name']} (ID: {s['session_id']})")
        return s["session_id"]
    raise Exception("No CA sessions found")


def get_master_list(api_key, session_id=None):
    """Get master list of all bills in session. Returns dict of {bill_id: summary}."""
    params = {"id": session_id} if session_id else {"state": CA_STATE}
    data = api_call(api_key, "getMasterList", params)
    
    master = data.get("masterlist", {})
    bills = {}
    for key, val in master.items():
        if key == "session":
            continue
        if isinstance(val, dict) and "bill_id" in val:
            bills[val["bill_id"]] = val
    
    print(f"Master list: {len(bills)} bills in session")
    return bills


def get_bill_detail(api_key, bill_id):
    """Get full detail for a single bill."""
    data = api_call(api_key, "getBill", {"id": bill_id})
    return data.get("bill", {})


def fetch_all_bills(api_key, session_id=None, limit=None, bill_filter=None):
    """Fetch all bills from a session with full details."""
    if session_id is None:
        session_id = get_current_session_id(api_key)
    
    master = get_master_list(api_key, session_id)
    
    if bill_filter:
        normalized = bill_filter.upper().replace(" ", "").replace("-", "")
        matching = {bid: info for bid, info in master.items() 
                    if info.get("number", "").replace(" ", "") == normalized}
        if not matching:
            print(f"Bill {bill_filter} not found.")
            return []
        master = matching
    
    bill_ids = list(master.keys())[:limit] if limit else list(master.keys())
    
    bills = []
    total = len(bill_ids)
    queries_used = 1
    
    for i, bid in enumerate(bill_ids):
        try:
            bill = get_bill_detail(api_key, bid)
            bills.append(bill)
            queries_used += 1
            
            if (i + 1) % 50 == 0 or (i + 1) == total:
                print(f"  Fetched {i+1}/{total} bills ({queries_used} API queries)")
            
            time.sleep(RATE_LIMIT_DELAY)
        except Exception as e:
            print(f"  ⚠ Error fetching bill {bid}: {e}")
            continue
    
    print(f"\n✓ Fetched {len(bills)} bills using {queries_used} API queries")
    return bills


def load_from_dataset(dataset_path):
    """Load bills from a downloaded LegiScan dataset ZIP. Zero API queries."""
    bills = []
    if zipfile.is_zipfile(dataset_path):
        with zipfile.ZipFile(dataset_path, 'r') as zf:
            bill_files = [f for f in zf.namelist() if '/bill/' in f and f.endswith('.json')]
            print(f"Dataset contains {len(bill_files)} bill files")
            for bf in bill_files:
                try:
                    with zf.open(bf) as f:
                        data = json.loads(f.read())
                        bill = data.get("bill", data)
                        bills.append(bill)
                except Exception as e:
                    print(f"  ⚠ Error reading {bf}: {e}")
    print(f"✓ Loaded {len(bills)} bills from dataset")
    return bills


def save_raw(bills, output_path):
    with open(output_path, 'w') as f:
        json.dump(bills, f, indent=2)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"✓ Saved {len(bills)} bills to {output_path} ({size_mb:.1f} MB)")


def main():
    parser = argparse.ArgumentParser(description="LegiScan API Client")
    parser.add_argument("--api-key", help="LegiScan API key (or set LEGISCAN_API_KEY env var)")
    parser.add_argument("--dataset", help="Path to downloaded dataset ZIP (offline mode)")
    parser.add_argument("--output", default="raw_bills.json", help="Output JSON file")
    parser.add_argument("--bill", help="Fetch a single bill (e.g., SB48)")
    parser.add_argument("--limit", type=int, help="Max bills (for testing)")
    parser.add_argument("--session-id", type=int, help="Specific session ID")
    parser.add_argument("--list-sessions", action="store_true", help="List available sessions")
    
    args = parser.parse_args()
    
    if args.dataset:
        bills = load_from_dataset(args.dataset)
        save_raw(bills, args.output)
        return
    
    api_key = args.api_key or os.environ.get("LEGISCAN_API_KEY")
    if not api_key:
        print("❌ Need API key. Use --api-key or set LEGISCAN_API_KEY env var")
        print("   Get a free key at: https://legiscan.com/legiscan")
        sys.exit(1)
    
    if args.list_sessions:
        get_session_list(api_key)
        return
    
    bills = fetch_all_bills(api_key, session_id=args.session_id, limit=args.limit, bill_filter=args.bill)
    if bills:
        save_raw(bills, args.output)
        print(f"\n📊 Query budget: ~{len(bills)+1} of 30,000 monthly queries used")


if __name__ == "__main__":
    main()
