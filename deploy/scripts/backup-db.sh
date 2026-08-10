#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${TRENDK_BACKUP_DIR:-/var/backups/trendk/postgres}"
RETENTION_DAYS="${TRENDK_BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date -u +%Y%m%d%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/trendk-postgres-${TIMESTAMP}.dump"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo on the VPS." >&2
  exit 1
fi

install -d -m 700 "${BACKUP_DIR}"
docker exec trendk-postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-acl' > "${BACKUP_FILE}"
chmod 600 "${BACKUP_FILE}"

NEWEST_BACKUP="$(find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'trendk-postgres-*.dump' -printf '%T@ %p\n' | sort -nr | head -n 1 | cut -d ' ' -f 2-)"
find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'trendk-postgres-*.dump' -mtime "+${RETENTION_DAYS}" -print | while IFS= read -r old_backup; do
  if [[ "${old_backup}" != "${NEWEST_BACKUP}" ]]; then
    rm -f "${old_backup}"
  fi
done

echo "${BACKUP_FILE}"
