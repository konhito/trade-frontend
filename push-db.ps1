# Quick script to push database schema

Write-Host "Pushing schema to database..." -ForegroundColor Cyan

npx prisma db push --accept-data-loss

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Done! Schema pushed successfully." -ForegroundColor Green
    Write-Host "Restart your dev server to see the changes." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Failed to push schema." -ForegroundColor Red
}

