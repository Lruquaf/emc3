#!/usr/bin/env sh
# Container başlarken: migrate + (RUN_SEED_ON_DEPLOY=true ise) seed, sonra API.
# Railway deploy.hooks postdeploy desteklemediği için seed burada çalıştırılıyor.
set -e
cd "$(dirname "$0")/.."

pnpm db:generate
pnpm db:migrate

if [ "$RUN_SEED_ON_DEPLOY" = "true" ]; then
  echo "🌱 RUN_SEED_ON_DEPLOY=true: seed çalıştırılıyor..."
  pnpm db:seed || true
  echo "💡 İlk kurulum tamamsa Railway Variables'dan RUN_SEED_ON_DEPLOY=false yapın."
fi

exec node dist/index.js
