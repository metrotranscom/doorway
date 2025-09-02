#!/bin/sh
export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
echo "DATABASE_URL: $DATABASE_URL"
echo "Running migrations..."
yarn prisma generate&&yarn start:prod
