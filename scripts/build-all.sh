#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT_DIR="$(cd "$THEME_DIR/.." && pwd)"

export PATH="$THEME_DIR/node_modules/.bin:$PATH:/opt/homebrew/bin:/usr/local/bin"

cd "$ROOT_DIR"

echo "=================================================="
echo "Hugo-Carbon Multi-Site Unified Build & Audit"
echo "=================================================="

# Ensure symlinks for node_modules in sub-sites
[ -e "$ROOT_DIR/node_modules" ] || ln -sf hugo-theme-carbon/node_modules "$ROOT_DIR/node_modules"
[ -e "$THEME_DIR/exampleSite/node_modules" ] || ln -sf ../node_modules "$THEME_DIR/exampleSite/node_modules"
[ -e "$ROOT_DIR/cesar-caldeira-cc/node_modules" ] || ln -sf ../hugo-theme-carbon/node_modules "$ROOT_DIR/cesar-caldeira-cc/node_modules"
[ -e "$ROOT_DIR/blog-caldeira-cc/node_modules" ] || ln -sf ../hugo-theme-carbon/node_modules "$ROOT_DIR/blog-caldeira-cc/node_modules"
[ -e "$ROOT_DIR/apps-caldeira-cc/node_modules" ] || ln -sf ../hugo-theme-carbon/node_modules "$ROOT_DIR/apps-caldeira-cc/node_modules"
[ -e "$ROOT_DIR/games-caldeira-cc/node_modules" ] || ln -sf ../hugo-theme-carbon/node_modules "$ROOT_DIR/games-caldeira-cc/node_modules"

echo "--> [1/5] Building exampleSite (carbon.caldeira.cc)..."
(cd hugo-theme-carbon/exampleSite && hugo --gc --minify)
python3 "$SCRIPT_DIR/encrypt.py" --dir hugo-theme-carbon/exampleSite/public

echo "--> [2/5] Building cesar-caldeira-cc..."
(cd cesar-caldeira-cc && hugo --gc --minify)

echo "--> [3/5] Building blog-caldeira-cc..."
(cd blog-caldeira-cc && hugo --gc --minify)

echo "--> [4/5] Building apps-caldeira-cc..."
(cd apps-caldeira-cc && hugo --gc --minify)

echo "--> [5/5] Building games-caldeira-cc..."
(cd games-caldeira-cc && hugo --gc --minify)

echo "=================================================="
echo "Running Dependency & Link Audits"
echo "=================================================="
python3 "$SCRIPT_DIR/verify-dependencies.py"
python3 "$SCRIPT_DIR/test_public_html.py" --dir hugo-theme-carbon/exampleSite/public
python3 "$SCRIPT_DIR/test_public_html.py" --dir cesar-caldeira-cc/public
python3 "$SCRIPT_DIR/test_public_html.py" --dir blog-caldeira-cc/public
python3 "$SCRIPT_DIR/test_public_html.py" --dir apps-caldeira-cc/public
python3 "$SCRIPT_DIR/test_public_html.py" --dir games-caldeira-cc/public

echo ""
echo "🎉 ALL SITES BUILT AND VERIFIED WITH ZERO ERRORS!"
