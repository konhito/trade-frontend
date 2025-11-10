# Script to create .env.local file with production values
# Run: .\update-env.ps1

$envContent = @"
# Frontend Environment Variables - Production
NEXT_PUBLIC_BACKEND_URL=https://trade-backend-production-b0a3.up.railway.app

# Optional Services (if using)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
OPENAI_API_KEY=sk-your_openai_api_key_here
RESEND_API_KEY=re_your_resend_api_key_here
CRON_SECRET=your_cron_secret_here
ADMIN_USER_ID=your_admin_user_id_here
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline
Write-Host ".env.local file created with production values!" -ForegroundColor Green






