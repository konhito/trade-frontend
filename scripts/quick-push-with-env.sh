#!/bin/bash

# Shell script to push schema with DATABASE_URL
# Usage: DATABASE_URL="postgresql://..." bash scripts/quick-push-with-env.sh

set -e

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not provided!"
    echo ""
    echo "Usage:"
    echo "  DATABASE_URL='postgresql://...' bash scripts/quick-push-with-env.sh"
    exit 1
fi

echo "🚀 Pushing schema to database..."
echo ""

echo "1️⃣ Generating Prisma Client..."
DATABASE_URL="$DATABASE_URL" npx prisma generate

echo ""
echo "2️⃣ Pushing to database..."
DATABASE_URL="$DATABASE_URL" npx prisma db push --accept-data-loss

echo ""
echo "✅ Done! Restart your dev server."

