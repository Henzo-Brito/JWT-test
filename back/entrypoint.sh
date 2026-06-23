#!/bin/sh
set -e

echo "Running migrations..."
bun run db:push

echo "Starting server..."
exec bun run src/index.ts
