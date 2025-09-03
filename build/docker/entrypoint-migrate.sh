#!/bin/sh
if [ "$SKIP_MIGRATIONS" = TRUE ];then
  echo "Skipping Migrations"
  yarn db:migration:skip 00_init || true && yarn db:migration:skip 02_hba_to_prisma || true && yarn db:migration:skip 03_0_external_listing || true && yarn db:migration:run;
else
  echo "Running migrations...${MIGRATION_CMD}";
  yarn ${MIGRATION_CMD};
fi