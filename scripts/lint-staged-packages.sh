#!/usr/bin/env bash
# ESLint'i packages dizininden çalıştırır.
# lint-staged bu script'i staged dosya yollarıyla çağırır
set +e  # Hataları fatal yapma - commit'i engelleme
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

# Package bazında dosyaları grupla
declare -A shared_files
declare -A config_files

for f in "$@"; do
  # Convert absolute or relative paths to relative paths from packages
  relpath=""
  if [[ "$f" == *"packages/"* ]]; then
    relpath="${f#*packages/}"
  elif [[ "$f" == "$ROOT_DIR/packages/"* ]]; then
    relpath="${f#$ROOT_DIR/packages/}"
  fi
  
  if [[ -n "$relpath" ]]; then
    if [[ "$relpath" == shared/* ]]; then
      filepath="${relpath#shared/}"
      if [[ -f "$ROOT_DIR/packages/shared/$filepath" ]]; then
        shared_files["$filepath"]=1
      fi
    elif [[ "$relpath" == config/* ]]; then
      filepath="${relpath#config/}"
      if [[ -f "$ROOT_DIR/packages/config/$filepath" ]] && [[ "$filepath" == *.js ]]; then
        config_files["$filepath"]=1
      fi
    fi
  fi
done

# Shared package için ESLint çalıştır
if [[ ${#shared_files[@]} -gt 0 ]]; then
  cd "$ROOT_DIR/packages/shared" || exit 0
  files=("${!shared_files[@]}")
  pnpm exec eslint --fix "${files[@]}" || true
fi

# Config package için ESLint çalıştır
if [[ ${#config_files[@]} -gt 0 ]]; then
  cd "$ROOT_DIR/packages/config" || exit 0
  files=("${!config_files[@]}")
  pnpm exec eslint --fix "${files[@]}" || true
fi

exit 0
