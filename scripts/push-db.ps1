# PowerShell script to push schema to database
# This handles Windows process locking issues

Write-Host "🚀 Starting database schema push..." -ForegroundColor Cyan
Write-Host ""

# Check if Next.js dev server is running
$process = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "⚠️  Next.js dev server detected!" -ForegroundColor Yellow
    Write-Host "   Please stop it first with Ctrl+C" -ForegroundColor Yellow
    Write-Host "   Then run this script again" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

Write-Host "1️⃣ Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣ Pushing schema to database..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema to database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schema pushed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "✨ Done! Restart your dev server if it was running." -ForegroundColor Green

