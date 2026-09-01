#!/usr/bin/env bash
# Yarijoo V2 — Database Setup & Seed Script (Bash/Linux/Mac)
# Usage: bash scripts/setup-db.sh

set -e

echo ""
echo "🚀 Yarijoo V2 — Database Setup"
echo ""

# Step 1: Generate Prisma Client
echo "1️⃣  Generating Prisma client..."
npx prisma generate

# Step 2: Run Migrations
echo ""
echo "2️⃣  Running database migrations..."
npx prisma migrate deploy || {
    echo "⚠️  migrate deploy failed, trying db push..."
    npx prisma db push --accept-data-loss
}

# Step 3: Run Seed
echo ""
echo "3️⃣  Seeding database with initial data..."
npm run seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Admin login:"
echo "   Phone : +989100000000"
echo "   OTP   : check server logs (dev mode, no SMS key required)"
echo ""
echo "🌐 Start servers:"
echo "   Backend  : npm run start:dev          (port 3333)"
echo "   Frontend : cd ../frontend && npm run dev  (port 3001)"
echo ""
