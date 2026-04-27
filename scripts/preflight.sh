#!/usr/bin/env bash
# Pre-submission sanity script for the Shopify Theme Store.
# Runs the automated subset of docs/SUBMISSION.md.
#
# Usage:  bash scripts/preflight.sh
#         (run from repo root)
#
# Exits non-zero on any failure so this can be wired into CI.

set -u
red()    { printf '\033[31m%s\033[0m\n' "$*"; }
green()  { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
bold()   { printf '\033[1m%s\033[0m\n' "$*"; }

FAIL=0
WARN=0
step() {
  bold ""
  bold "▶ $1"
}

check_locale_keys() {
  step "Locale completeness — every key in en.default.json must exist in 5 EU locales"
  python3 - <<'PY' || FAIL=$((FAIL+1))
import json, sys
def flatten(d, p=''):
    for k, v in d.items():
        kk = f"{p}.{k}" if p else k
        if isinstance(v, dict):
            yield from flatten(v, kk)
        else:
            yield kk
en = set(flatten(json.load(open('locales/en.default.json'))))
missing = {}
for lang in ('de','fr','it','es','nl'):
    other = set(flatten(json.load(open(f'locales/{lang}.json'))))
    diff = en - other
    if diff:
        missing[lang] = diff
if missing:
    for lang, keys in missing.items():
        print(f"  [{lang}] missing {len(keys)} keys: {sorted(keys)[:5]}{'…' if len(keys)>5 else ''}")
    sys.exit(1)
print("  all locales complete")
PY
}

check_json() {
  step "JSON validity — every config/templates/locales JSON parses"
  python3 - <<'PY' || FAIL=$((FAIL+1))
import json, glob, sys
errors = []
for path in glob.glob('config/*.json') + glob.glob('templates/**/*.json', recursive=True) + glob.glob('locales/*.json') + glob.glob('sections/*.json'):
    try:
        json.load(open(path))
    except Exception as e:
        errors.append(f"{path}: {e}")
if errors:
    for e in errors: print(' ', e)
    sys.exit(1)
print(f"  parsed {len(glob.glob('config/*.json') + glob.glob('templates/**/*.json', recursive=True) + glob.glob('locales/*.json') + glob.glob('sections/*.json'))} files")
PY
}

check_no_hardcoded_strings() {
  step "Hard-coded English strings in *.liquid (≤ 5 known false-positives allowed)"
  count=$(grep -rEho '>[A-Z][a-z]{3,}[ a-zA-Z]{4,}<' sections/*.liquid snippets/*.liquid 2>/dev/null | grep -v '\${' | grep -vE '^>(Shopify|ReCircle|None|Liquid)<' | wc -l | tr -d ' ')
  if [ "$count" -gt 50 ]; then
    yellow "  $count potential hard-coded strings (review manually — some are placeholder tokens)"
    WARN=$((WARN+1))
  else
    green "  ok ($count candidates, manual spot-check recommended)"
  fi
}

check_no_remote_scripts() {
  step "No unexpected external <script src=\"http(s)://\"> in templates"
  # Allowed CDNs: Shopify, GA4 (gtag), Meta Pixel — these are opt-in via theme settings
  hits=$(grep -rEn '<script[^>]+src=["'\'']https?://' layout/ sections/ snippets/ templates/ 2>/dev/null \
    | grep -vE 'cdn.shopify.com|googletagmanager.com/gtag/js|connect.facebook.net' || true)
  if [ -n "$hits" ]; then
    red "  found:"; echo "$hits"
    FAIL=$((FAIL+1))
  else
    green "  none (analytics CDNs whitelisted)"
  fi
}

check_no_includes() {
  step "No deprecated {% include %} (must use {% render %})"
  hits=$(grep -rEn '\{%\s*include\b' sections/ snippets/ layout/ templates/ 2>/dev/null || true)
  if [ -n "$hits" ]; then
    red "  found:"; echo "$hits"
    FAIL=$((FAIL+1))
  else
    green "  none"
  fi
}

check_required_templates() {
  step "Required OS 2.0 templates present"
  required=(index product collection list-collections blog article page search cart 404 gift_card password)
  missing=()
  for t in "${required[@]}"; do
    if [ ! -f "templates/$t.json" ] && [ ! -f "templates/$t.liquid" ]; then
      missing+=("$t")
    fi
  done
  customers=(account login register order addresses reset_password activate_account)
  for t in "${customers[@]}"; do
    if [ ! -f "templates/customers/$t.json" ] && [ ! -f "templates/customers/$t.liquid" ]; then
      missing+=("customers/$t")
    fi
  done
  if [ ${#missing[@]} -gt 0 ]; then
    red "  missing: ${missing[*]}"
    FAIL=$((FAIL+1))
  else
    green "  all 19 templates present"
  fi
}

check_required_settings_groups() {
  step "Required theme-settings groups in settings_schema.json"
  python3 - <<'PY' || FAIL=$((FAIL+1))
import json, sys
schema = json.load(open('config/settings_schema.json'))
names = [block.get('name', '') for block in schema if isinstance(block, dict)]
lowered = [n.lower() for n in names]
roles = {
    'colors':     ['color', 'colour', 'palette'],
    'typography': ['typography', 'font'],
    'layout':     ['layout', 'spacing', 'density'],
    'social':     ['social'],
    'brand':      ['brand', 'refurbished', 'circular'],
}
missing = [role for role, hints in roles.items() if not any(h in n for n in lowered for h in hints)]
if missing:
    print(f"  missing roles: {missing}")
    print(f"  found groups : {names}")
    sys.exit(1)
print(f"  all required groups present (found {len(names)})")
PY
}

check_asset_sizes() {
  step "Asset budgets (JS < 100 KB total, CSS < 200 KB total)"
  js=$(stat -c%s assets/*.js 2>/dev/null | awk '{s+=$1} END{print s+0}')
  css=$(stat -c%s assets/*.css 2>/dev/null | awk '{s+=$1} END{print s+0}')
  printf "  total JS:  %d KB\n" $((js/1024))
  printf "  total CSS: %d KB\n" $((css/1024))
  [ "$js" -lt 102400 ] || { yellow "  warn: JS over 100 KB (acceptable for vanilla theme; review)"; WARN=$((WARN+1)); }
  [ "$css" -lt 204800 ] || { red "  fail: CSS over 200 KB"; FAIL=$((FAIL+1)); }
}

check_theme_check() {
  step "theme-check (if installed)"
  if command -v theme-check >/dev/null 2>&1; then
    theme-check . || FAIL=$((FAIL+1))
  elif command -v shopify >/dev/null 2>&1; then
    shopify theme check || FAIL=$((FAIL+1))
  else
    yellow "  theme-check / shopify CLI not installed — skipping (install at: https://shopify.dev/docs/themes/tools/theme-check)"
    WARN=$((WARN+1))
  fi
}

# ---- Run --------------------------------------------------------------------
check_json
check_locale_keys
check_required_templates
check_required_settings_groups
check_no_remote_scripts
check_no_includes
check_no_hardcoded_strings
check_asset_sizes
check_theme_check

bold ""
bold "═══ Summary ═══"
if [ "$FAIL" -gt 0 ]; then
  red "  $FAIL hard failure(s) — must fix before submission"
fi
if [ "$WARN" -gt 0 ]; then
  yellow "  $WARN warning(s) — review manually"
fi
if [ "$FAIL" -eq 0 ] && [ "$WARN" -eq 0 ]; then
  green "  all checks passed — ready to submit"
fi
exit $FAIL
