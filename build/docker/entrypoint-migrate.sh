#!/bin/sh
export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
# We need to skip all migrations that are just for local development (changes already exist in deployed environment)
if [ "$SKIP_MIGRATIONS" = TRUE ]; then
	yarn db:migration:skip 00_init || true && yarn db:migration:skip 02_hba_to_prisma || true && yarn db:migration:skip 03_0_external_listing || true && yarn db:migration:run
else
	yarn db:migration:run
fi
