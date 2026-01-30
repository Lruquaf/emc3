#!/usr/bin/env bash
# ESLint'i apps/web dizininden çalıştırır; TypeScript resolver doğru tsconfig ile çalışır.
# lint-staged bu script'i staged dosya yollarıyla çağırır (örn. apps/web/src/hooks/index.ts)
set -e
cd "$(dirname "$0")/../apps/web"
relpaths=()
for f in "$@"; do
  relpaths+=("${f#*apps/web/}")
done
[[ ${#relpaths[@]} -eq 0 ]] || pnpm exec eslint --fix "${relpaths[@]}"
