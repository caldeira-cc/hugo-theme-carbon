#!/usr/bin/env bash
set -e

export PATH=$PATH:/opt/homebrew/bin:/usr/local/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$THEME_DIR/.." && pwd)"

cd "$ROOT_DIR"

echo "=================================================="
echo "Hugo-Carbon Multi-Site Unified Build & Audit"
echo "=================================================="

echo "--> [1/4] Building exampleSite (carbon.caldeira.cc)..."
(cd hugo-theme-carbon/exampleSite && hugo --gc --minify)
python3 "$SCRIPT_DIR/encrypt.py" --dir hugo-theme-carbon/exampleSite/public

echo "--> [2/4] Building cesar-caldeira-cc..."
(cd cesar-caldeira-cc && hugo --gc --minify)

echo "--> [3/4] Building blog-caldeira-cc..."
(cd blog-caldeira-cc && hugo --gc --minify)

echo "--> [4/4] Building apps-caldeira-cc..."
(cd apps-caldeira-cc && hugo --gc --minify)

echo "=================================================="
echo "Running Dependency & Link Audits"
echo "=================================================="
python3 "$SCRIPT_DIR/verify-dependencies.py"
python3 "$SCRIPT_DIR/test_public_html.py" --dir hugo-theme-carbon/exampleSite/public
python3 "$SCRIPT_DIR/test_public_html.py" --dir cesar-caldeira-cc/public
python3 "$SCRIPT_DIR/test_public_html.py" --dir blog-caldeira-cc/public
python3 "$SCRIPT_DIR/test_public_html.py" --dir apps-caldeira-cc/public

echo ""
echo "🎉 ALL SITES BUILT AND VERIFIED WITH ZERO ERRORS!"
