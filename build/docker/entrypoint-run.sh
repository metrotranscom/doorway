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

echo "Starting Service..."
yarn start:prod
