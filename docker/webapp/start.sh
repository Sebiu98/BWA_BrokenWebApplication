#!/usr/bin/env sh
set -eu

cd /app/backend

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY mancante"
  exit 1
fi

if [ -z "${JWT_SECRET:-}" ]; then
  echo "JWT_SECRET mancante"
  exit 1
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

upsert_env() {
  key="$1"
  value="$2"

  if [ -z "$value" ]; then
    return 0
  fi

  if [ -f .env ] && grep -q "^${key}=" .env; then
    sed -i "s#^${key}=.*#${key}=${value}#" .env
  else
    echo "${key}=${value}" >> .env
  fi
}

upsert_env APP_KEY "${APP_KEY}"
upsert_env DB_CONNECTION "${DB_CONNECTION:-pgsql}"
upsert_env DB_HOST "${DB_HOST:-database}"
upsert_env DB_PORT "${DB_PORT:-5432}"
upsert_env DB_DATABASE "${DB_DATABASE:-bwa_dojo}"
upsert_env DB_USERNAME "${DB_USERNAME:-postgres}"
upsert_env DB_PASSWORD "${DB_PASSWORD:-postgres}"
upsert_env CACHE_STORE "${CACHE_STORE:-file}"
upsert_env SESSION_DRIVER "${SESSION_DRIVER:-file}"
upsert_env QUEUE_CONNECTION "${QUEUE_CONNECTION:-sync}"

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs

php artisan config:clear || true

if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${AUTO_SEED:-false}" = "true" ]; then
  php artisan db:seed --force
fi

php artisan serve --host=0.0.0.0 --port=8000 &

cd /app
exec pnpm start --hostname 0.0.0.0 --port 3000
