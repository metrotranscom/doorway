#!/bin/sh
# URL encode the password to handle special characters
ENCODED_PASSWORD=$(node -e "console.log(encodeURIComponent('$PGPASSWORD'))")

export DATABASE_URL="postgresql://${PGUSER}:${ENCODED_PASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
echo "DATABASE_URL (password masked): postgresql://${PGUSER}:***@${PGHOST}:${PGPORT}/${PGDATABASE}"
if [ "$SKIP_MIGRATIONS" = TRUE ];then
  echo "Skipping Migrations"
  yarn db:migration:skip 00_init || true && yarn db:migration:skip 02_hba_to_prisma || true && yarn db:migration:skip 03_0_external_listing || true && yarn db:migration:run;
else
  echo "Running migrations...${MIGRATION_CMD}";
  yarn ${MIGRATION_CMD};
fi