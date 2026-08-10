#!/usr/bin/env bash
set -euo pipefail

BACKUP_FILE="${1:?Usage: sudo TRENDK_CONFIRM_RESTORE=yes deploy/scripts/restore-db.sh /path/to/backup.dump}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script with sudo on the VPS." >&2
  exit 1
fi

if [[ "${TRENDK_CONFIRM_RESTORE:-}" != "yes" ]]; then
  echo "Set TRENDK_CONFIRM_RESTORE=yes to restore a database backup." >&2
  exit 1
fi

test -f "${BACKUP_FILE}"
cat "${BACKUP_FILE}" | docker exec -i trendk-postgres sh -c 'pg_restore --clean --if-exists --no-owner --no-acl -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

echo "Restored ${BACKUP_FILE}."
