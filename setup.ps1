# DSMS Quick Setup Script (PowerShell)
# This script automates the initial setup of the Disease Surveillance Management System

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DSMS - Quick Setup Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if MySQL is installed
try {
    $mysqlVersion = mysql --version
    Write-Host "✅ MySQL found: $mysqlVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MySQL command not found. Please ensure MySQL 8.0+ is installed." -ForegroundColor Yellow
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Setup environment file
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "🔧 Setting up environment variables..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit .env file with your MySQL credentials" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue after updating .env file"
}

# Generate Prisma client
Write-Host ""
Write-Host "🔨 Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate

# Run migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
Write-Host "Note: Make sure your MySQL database is running and .env is configured correctly" -ForegroundColor Yellow
npm run prisma:migrate

# Seed database
Write-Host ""
$seed = Read-Host "Do you want to seed the database with sample data? (y/n)"
if ($seed -eq "y" -or $seed -eq "Y") {
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    npm run db:seed
}

# Success message
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  ✅ Setup completed successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Development mode:" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  With real-time features:" -ForegroundColor White
Write-Host "    npm run dev:socket" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Production mode:" -ForegroundColor White
Write-Host "    npm run build" -ForegroundColor Yellow
Write-Host "    npm run start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "For more information, see SETUP.md" -ForegroundColor Gray
Write-Host ""

