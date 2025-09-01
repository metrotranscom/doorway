#!/bin/sh
export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
yarn prisma generate&&yarn start:prod
