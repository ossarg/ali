#!/usr/bin/env bash

set -e

echo "Running migrations..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

FILES=$(ls -1 "$SCRIPT_DIR/../migrations"/*.sql 2>/dev/null | sort)

if [ -z "$FILES" ]; then
  echo "No migration files found"
  exit 0
fi

for FILE in $FILES; do
  echo "Applying: $(basename $FILE)"
  psql "$DATABASE_URL" -f "$FILE"
  echo "Done: $(basename $FILE)"
done

echo "All migrations applied successfully"
