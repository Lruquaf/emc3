#!/usr/bin/env bash
# ESLint'i apps/api dizininden çalıştırır.
# lint-staged bu script'i staged dosya yollarıyla çağırır (örn. apps/api/src/...)
set -e
cd "$(dirname "$0")/../apps/api"
relpaths=()
for f in "$@"; do
  relpaths+=("${f#*apps/api/}")
done
[[ ${#relpaths[@]} -eq 0 ]] || pnpm exec eslint --fix "${relpaths[@]}"
