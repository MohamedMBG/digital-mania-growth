#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${TRENDK_APP_DIR:-/opt/trendk}"
BACKEND_ENV_FILE="${TRENDK_BACKEND_ENV_FILE:-/etc/trendk/backend.env}"
POSTGRES_ENV_FILE="${TRENDK_POSTGRES_ENV_FILE:-/etc/trendk/postgres.env}"
TARGET_RELEASE="${1:-}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo on the VPS." >&2
  exit 1
fi

if [[ -z "${TARGET_RELEASE}" ]]; then
  TARGET_RELEASE="$(find "${APP_DIR}/releases" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort | tail -n 2 | head -n 1)"
fi

if [[ -z "${TARGET_RELEASE}" || ! -d "${APP_DIR}/releases/${TARGET_RELEASE}" ]]; then
  echo "No rollback release found. Pass a release id from ${APP_DIR}/releases." >&2
  exit 1
fi

ln -sfn "${APP_DIR}/releases/${TARGET_RELEASE}" "${APP_DIR}/current"
test -f "${APP_DIR}/current/dist/index.html"
ln -sfn "${APP_DIR}/current/dist" /var/www/trendk/current.next

cd "${APP_DIR}/current"
env TRENDK_BACKEND_ENV_FILE="${BACKEND_ENV_FILE}" TRENDK_POSTGRES_ENV_FILE="${POSTGRES_ENV_FILE}" docker compose -p trendk -f docker-compose.prod.yml up -d --build
nginx -t
curl -fsS http://127.0.0.1:4000/api/health >/dev/null
mv -T /var/www/trendk/current.next /var/www/trendk/current

echo "Rolled back to release ${TARGET_RELEASE}."
