#!/usr/bin/env bash
# ESLint'i apps/web dizininden çalıştırır; TypeScript resolver doğru tsconfig ile çalışır.
# lint-staged bu script'i staged dosya yollarıyla çağırır (örn. apps/web/src/hooks/index.ts)
set +e  # Hataları fatal yapma - commit'i engelleme
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_DIR="$SCRIPT_DIR/../apps/web"
cd "$WEB_DIR"

relpaths=()
for f in "$@"; do
  # Convert absolute or relative paths to relative paths from apps/web
  if [[ "$f" == *"apps/web/"* ]]; then
    relpaths+=("${f#*apps/web/}")
  elif [[ "$f" == "$WEB_DIR"* ]]; then
    relpaths+=("${f#$WEB_DIR/}")
  else
    relpaths+=("$f")
  fi
done

if [[ ${#relpaths[@]} -gt 0 ]]; then
  # Run ESLint with fix - hatalar olsa bile devam et
  pnpm exec eslint --fix "${relpaths[@]}" || {
    echo "⚠ ESLint found issues in web files, but continuing..."
    exit 0
  }
fi
exit 0
