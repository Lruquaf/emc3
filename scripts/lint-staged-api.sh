#!/usr/bin/env bash
# ESLint'i apps/api dizininden çalıştırır.
# lint-staged bu script'i staged dosya yollarıyla çağırır (örn. apps/api/src/...)
set +e  # Hataları fatal yapma - commit'i engelleme
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$SCRIPT_DIR/../apps/api"
cd "$API_DIR"

relpaths=()
for f in "$@"; do
  # Convert absolute or relative paths to relative paths from apps/api
  if [[ "$f" == *"apps/api/"* ]]; then
    relpaths+=("${f#*apps/api/}")
  elif [[ "$f" == "$API_DIR"* ]]; then
    relpaths+=("${f#$API_DIR/}")
  else
    relpaths+=("$f")
  fi
done

if [[ ${#relpaths[@]} -gt 0 ]]; then
  # Run ESLint with fix - hatalar olsa bile devam et
  pnpm exec eslint --fix "${relpaths[@]}" || {
    echo "⚠ ESLint found issues in API files, but continuing..."
    exit 0
  }
fi
exit 0
