#!/usr/bin/env sh
# Container başlarken: migrate + (RUN_SEED_ON_DEPLOY=true ise) seed, sonra API.
# Railway deploy.hooks postdeploy desteklemediği için seed burada çalıştırılıyor.
set -e
cd "$(dirname "$0")/.."

# Prisma Client'ı generate et (DATABASE_URL'e ihtiyaç yok)
echo "🔧 Generating Prisma Client..."
pnpm db:generate

# PostgreSQL'in hazır olmasını bekle ve migration'ı retry mekanizması ile çalıştır
echo "⏳ Waiting for PostgreSQL to be ready and running migrations..."
MAX_RETRIES=60
RETRY=0

while [ $RETRY -lt $MAX_RETRIES ]; do
  if pnpm db:migrate 2>/dev/null; then
    echo "✅ Database is ready and migrations completed!"
    break
  fi
  
  RETRY=$((RETRY + 1))
  if [ $RETRY -lt $MAX_RETRIES ]; then
    echo "   Attempt $RETRY/$MAX_RETRIES: Database not ready, waiting 1 second..."
    sleep 1
  fi
done

if [ $RETRY -eq $MAX_RETRIES ]; then
  echo "❌ Database is not ready after $MAX_RETRIES attempts"
  echo "   Please check Railway PostgreSQL service logs"
  exit 1
fi

if [ "$RUN_SEED_ON_DEPLOY" = "true" ]; then
  echo "🌱 RUN_SEED_ON_DEPLOY=true: seed çalıştırılıyor..."
  pnpm db:seed || true
  echo "💡 İlk kurulum tamamsa Railway Variables'dan RUN_SEED_ON_DEPLOY=false yapın."
fi

exec node dist/index.js
