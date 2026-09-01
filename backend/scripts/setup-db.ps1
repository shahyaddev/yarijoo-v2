# Yarijoo V2 — Database Setup & Seed Script (PowerShell)
# Usage: .\scripts\setup-db.ps1

Write-Host "🚀 Yarijoo V2 — Database Setup" -ForegroundColor Cyan
Write-Host ""

# Step 1: Generate Prisma Client
Write-Host "1️⃣  Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "❌ prisma generate failed" -ForegroundColor Red; exit 1 }

# Step 2: Run Migrations
Write-Host ""
Write-Host "2️⃣  Running database migrations..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  migrate deploy failed, trying db push..." -ForegroundColor Yellow
    npx prisma db push --accept-data-loss
    if ($LASTEXITCODE -ne 0) { Write-Host "❌ Migration failed" -ForegroundColor Red; exit 1 }
}

# Step 3: Run Seed
Write-Host ""
Write-Host "3️⃣  Seeding database..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Seed failed" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Admin login:" -ForegroundColor Cyan
Write-Host "   Phone: +989100000000" -ForegroundColor White
Write-Host "   OTP: check server logs (dev mode)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Start servers:" -ForegroundColor Cyan
Write-Host "   Backend:  npm run start:dev   (port 3333)" -ForegroundColor White
Write-Host "   Frontend: cd ../frontend && npm run dev   (port 3001)" -ForegroundColor White
