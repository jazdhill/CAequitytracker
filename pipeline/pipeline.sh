#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# CA Equity Legislative Tracker — Data Pipeline
# ═══════════════════════════════════════════════════════════════
#
# Usage:
#   ./pipeline.sh full                  # Full run (all bills)
#   ./pipeline.sh full --limit 10       # Test with 10 bills
#   ./pipeline.sh fetch                 # Just fetch from LegiScan
#   ./pipeline.sh transform             # Just transform
#   ./pipeline.sh classify              # Just run equity analysis
#   ./pipeline.sh update                # Monthly update (incremental)
#   ./pipeline.sh status                # Show pipeline status
#
# Required environment variables:
#   LEGISCAN_API_KEY     — Free at https://legiscan.com/legiscan
#   ANTHROPIC_API_KEY    — From https://console.anthropic.com/
# ═══════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

RAW_FILE="${DATA_DIR}/raw_bills.json"
TRANSFORMED_FILE="${DATA_DIR}/tracker_bills.json"
CLASSIFIED_FILE="${DATA_DIR}/classified_bills.json"
BILLS_JS_FILE="${DATA_DIR}/BillsData.js"

mkdir -p "$DATA_DIR"

COMMAND="${1:-status}"
shift || true

LIMIT=""
SKIP_ANALYZED=""
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --limit) LIMIT="--limit $2"; shift 2;;
        --skip-analyzed) SKIP_ANALYZED="--skip-analyzed"; shift;;
        *) EXTRA_ARGS="$EXTRA_ARGS $1"; shift;;
    esac
done

do_fetch() {
    echo "→ STEP 1: Fetching from LegiScan API..."
    python3 "${SCRIPT_DIR}/legiscan_client.py" --output "$RAW_FILE" $LIMIT $EXTRA_ARGS
}

do_transform() {
    echo "→ STEP 2: Transforming LegiScan data..."
    python3 "${SCRIPT_DIR}/transform_bills.py" --input "$RAW_FILE" --output "$TRANSFORMED_FILE" --stats
}

do_classify() {
    echo "→ STEP 3: Running equity classification..."
    INPUT_FILE="$TRANSFORMED_FILE"
    if [ -f "$CLASSIFIED_FILE" ] && [ -n "$SKIP_ANALYZED" ]; then
        INPUT_FILE="$CLASSIFIED_FILE"
    fi
    python3 "${SCRIPT_DIR}/equity_classifier.py" --input "$INPUT_FILE" --output "$CLASSIFIED_FILE" $LIMIT $SKIP_ANALYZED
}

do_export() {
    echo "→ STEP 4: Exporting to BillsData.js..."
    python3 "${SCRIPT_DIR}/transform_bills.py" --input "$CLASSIFIED_FILE" --output "$BILLS_JS_FILE" --format js
    echo ""
    echo "✓ To use in your tracker:"
    echo "  cp $BILLS_JS_FILE /path/to/your/tracker/BillsData.js"
}

do_full() {
    echo "═══════════════════════════════════════════════"
    echo "  CA Equity Tracker — Full Pipeline Run"
    echo "  $(date)"
    echo "═══════════════════════════════════════════════"
    do_fetch && do_transform && do_classify && do_export
    echo "✓ Pipeline complete!"
}

do_update() {
    echo "═══ Monthly Update — $(date) ═══"
    [ -f "$CLASSIFIED_FILE" ] && cp "$CLASSIFIED_FILE" "${DATA_DIR}/backup_${TIMESTAMP}.json"
    SKIP_ANALYZED="--skip-analyzed"
    do_fetch && do_transform && do_classify && do_export
}

do_status() {
    echo "═══ Pipeline Status ═══"
    [ -n "$LEGISCAN_API_KEY" ] && echo "✓ LegiScan API key set" || echo "⚠ LEGISCAN_API_KEY not set"
    [ -n "$ANTHROPIC_API_KEY" ] && echo "✓ Anthropic API key set" || echo "⚠ ANTHROPIC_API_KEY not set"
    echo ""
    for F in "$RAW_FILE" "$TRANSFORMED_FILE" "$CLASSIFIED_FILE" "$BILLS_JS_FILE"; do
        if [ -f "$F" ]; then
            echo "✓ $(basename $F): $(du -h $F | cut -f1)"
        else
            echo "  $(basename $F): not yet created"
        fi
    done
}

case "$COMMAND" in
    full)      do_full;;
    fetch)     do_fetch;;
    transform) do_transform;;
    classify)  do_classify;;
    export)    do_export;;
    update)    do_update;;
    status)    do_status;;
    *) echo "Unknown command: $COMMAND"; do_status; exit 1;;
esac
