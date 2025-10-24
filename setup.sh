#!/bin/bash

# DSMS Quick Setup Script
# This script automates the initial setup of the Disease Surveillance Management System

set -e  # Exit on error

echo "========================================="
echo "  DSMS - Quick Setup Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL command not found. Please ensure MySQL 8.0+ is installed.${NC}"
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo ""
    echo "🔧 Setting up environment variables..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your MySQL credentials${NC}"
    echo ""
    read -p "Press enter to continue after updating .env file..."
fi

# Generate Prisma client
echo ""
echo "🔨 Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
echo -e "${YELLOW}Note: Make sure your MySQL database is running and .env is configured correctly${NC}"
npm run prisma:migrate

# Seed database
echo ""
read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    npm run db:seed
fi

# Success message
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  ✅ Setup completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "  Development mode:"
echo -e "    ${YELLOW}npm run dev${NC}"
echo ""
echo "  With real-time features:"
echo -e "    ${YELLOW}npm run dev:socket${NC}"
echo ""
echo "  Production mode:"
echo -e "    ${YELLOW}npm run build${NC}"
echo -e "    ${YELLOW}npm run start${NC}"
echo ""
echo "Visit: http://localhost:3000"
echo ""
echo "For more information, see SETUP.md"
echo ""

