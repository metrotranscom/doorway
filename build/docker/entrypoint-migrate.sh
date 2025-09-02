#!/bin/sh
export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"




#!/bin/sh

# Debug the individual secret values
echo "PGUSER: $PGUSER"
echo "PGHOST: $PGHOST"
echo "PGPORT: $PGPORT"
echo "PGDATABASE: $PGDATABASE"
echo "PGPASSWORD length: ${#PGPASSWORD}"

# Validate port is numeric
if ! echo "$PGPORT" | grep -qE '^[0-9]+$'; then
  echo "ERROR: PGPORT is not a valid number: '$PGPORT'"
  exit 1
fi

# URL encode the password to handle special characters
ENCODED_PASSWORD=$(node -e "console.log(encodeURIComponent('$PGPASSWORD'))")

export DATABASE_URL="postgresql://${PGUSER}:${ENCODED_PASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
echo "DATABASE_URL (password masked): postgresql://${PGUSER}:***@${PGHOST}:${PGPORT}/${PGDATABASE}"


if [ "$SKIP_MIGRATIONS" = TRUE ]; then echo "Skipping Migrations"&&yarn db:migration:skip 00_init || true && yarn db:migration:skip 02_hba_to_prisma || true && yarn db:migration:skip 03_0_external_listing || true && yarn db:migration:run; \
    else echo "Running migrations..."&&yarn ${MIGRATION_CMD}; \
    fi