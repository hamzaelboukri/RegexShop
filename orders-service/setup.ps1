# Orders Service Setup Script

Write-Host "🚀 Setting up Orders Service..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ Node.js version: $(node --version)" -ForegroundColor Green

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

# Generate Prisma client
Write-Host "`n🔧 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prisma client generated successfully" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "`n⚠️  No .env file found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file. Please update it with your configuration." -ForegroundColor Green
} else {
    Write-Host "`n✓ .env file already exists" -ForegroundColor Green
}

# Run migrations
Write-Host "`n📊 Running database migrations..." -ForegroundColor Cyan
Write-Host "Make sure PostgreSQL is running on port 5436" -ForegroundColor Yellow

$confirmation = Read-Host "Do you want to run migrations now? (y/n)"
if ($confirmation -eq 'y') {
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migrations completed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Migrations failed. Please check your database connection." -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Setup completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update .env with your configuration" -ForegroundColor White
Write-Host "2. Run 'npm run start:dev' to start the service" -ForegroundColor White
Write-Host "3. Visit http://localhost:3004/api/docs for API documentation" -ForegroundColor White
Write-Host "`nOr use Docker:" -ForegroundColor Cyan
Write-Host "docker-compose up orders-service" -ForegroundColor White
