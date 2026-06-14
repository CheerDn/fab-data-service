#!/usr/bin/env bash
set -euo pipefail

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-fab}"
PGPASSWORD="${PGPASSWORD:-fab123}"
PGDATABASE="${PGDATABASE:-fabdata}"

export PGPASSWORD

echo "Waiting for PostgreSQL at $PGHOST:$PGPORT..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER"; do
  sleep 2
done
echo "PostgreSQL is ready."

ROW_COUNT=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -tAc "SELECT COUNT(*) FROM equipment;" 2>/dev/null || echo "0")

if [ "$ROW_COUNT" -gt "0" ]; then
  echo "Equipment table already has $ROW_COUNT rows. Skipping seed."
  exit 0
fi

echo "Seeding database..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "$(dirname "$0")/../db/migrations/V2__seed.sql"
echo "Seed complete."
