#!/bin/bash

# RAJAI Platform - Interactive Environment Setup Script
# This script helps you configure your environment variables

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         RAJAI Platform - Environment Setup                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Your existing .env file was not modified."
        exit 0
    fi
fi

# Copy from example if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Created .env file from .env.example"
    else
        echo -e "${RED}✗${NC} .env.example not found"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Step 1: Google Gemini API Key${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "You need a Google Gemini API key to use AI features."
echo ""
echo -e "${YELLOW}How to get your API key:${NC}"
echo "1. Visit: https://makersuite.google.com/app/apikey"
echo "2. Sign in with your Google account"
echo "3. Click 'Create API Key'"
echo "4. Copy the key (starts with 'AIza...')"
echo ""
read -p "Do you have your Google API key ready? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your Google API key: " GOOGLE_API_KEY
    if [ -z "$GOOGLE_API_KEY" ]; then
        echo -e "${RED}✗${NC} API key cannot be empty"
        exit 1
    fi
    # Update .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|GOOGLE_API_KEY=.*|GOOGLE_API_KEY=$GOOGLE_API_KEY|" .env
    else
        # Linux
        sed -i "s|GOOGLE_API_KEY=.*|GOOGLE_API_KEY=$GOOGLE_API_KEY|" .env
    fi
    echo -e "${GREEN}✓${NC} Google API key configured"
else
    echo -e "${YELLOW}⚠️${NC}  Skipping Google API key setup"
    echo "   You'll need to add it manually to .env later"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Step 2: Database Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Choose your database option:"
echo ""
echo "1) Neon (Recommended - Free, no credit card required)"
echo "2) Supabase (Alternative free option)"
echo "3) Local PostgreSQL"
echo "4) Custom connection string"
echo "5) Skip (configure manually later)"
echo ""
read -p "Enter your choice (1-5): " -n 1 -r DB_CHOICE
echo
echo ""

case $DB_CHOICE in
    1)
        echo -e "${YELLOW}Setting up Neon database:${NC}"
        echo "1. Visit: https://neon.tech"
        echo "2. Sign up (free, no credit card)"
        echo "3. Create a new project"
        echo "4. Copy the connection string"
        echo ""
        read -p "Enter your Neon connection string: " DATABASE_URL
        if [ -z "$DATABASE_URL" ]; then
            echo -e "${RED}✗${NC} Database URL cannot be empty"
            exit 1
        fi
        ;;
    2)
        echo -e "${YELLOW}Setting up Supabase database:${NC}"
        echo "1. Visit: https://supabase.com"
        echo "2. Create a new project"
        echo "3. Go to Settings → Database"
        echo "4. Copy the connection string (use 'Connection pooling')"
        echo ""
        read -p "Enter your Supabase connection string: " DATABASE_URL
        if [ -z "$DATABASE_URL" ]; then
            echo -e "${RED}✗${NC} Database URL cannot be empty"
            exit 1
        fi
        ;;
    3)
        echo -e "${YELLOW}Setting up local PostgreSQL:${NC}"
        echo ""
        read -p "Database name (default: rajai): " DB_NAME
        DB_NAME=${DB_NAME:-rajai}
        read -p "Username (default: postgres): " DB_USER
        DB_USER=${DB_USER:-postgres}
        read -p "Password (default: password): " DB_PASS
        DB_PASS=${DB_PASS:-password}
        read -p "Host (default: localhost): " DB_HOST
        DB_HOST=${DB_HOST:-localhost}
        read -p "Port (default: 5432): " DB_PORT
        DB_PORT=${DB_PORT:-5432}
        
        DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
        
        echo ""
        echo -e "${YELLOW}Creating database...${NC}"
        if command -v createdb &> /dev/null; then
            createdb $DB_NAME 2>/dev/null || echo "Database may already exist"
            echo -e "${GREEN}✓${NC} Database created or already exists"
        else
            echo -e "${YELLOW}⚠️${NC}  createdb command not found. Please create the database manually:"
            echo "   psql -U postgres -c \"CREATE DATABASE $DB_NAME;\""
        fi
        ;;
    4)
        echo -e "${YELLOW}Custom database connection:${NC}"
        echo ""
        read -p "Enter your PostgreSQL connection string: " DATABASE_URL
        if [ -z "$DATABASE_URL" ]; then
            echo -e "${RED}✗${NC} Database URL cannot be empty"
            exit 1
        fi
        ;;
    5)
        echo -e "${YELLOW}⚠️${NC}  Skipping database setup"
        echo "   You'll need to add DATABASE_URL to .env manually"
        DATABASE_URL=""
        ;;
    *)
        echo -e "${RED}✗${NC} Invalid choice"
        exit 1
        ;;
esac

# Update DATABASE_URL if provided
if [ ! -z "$DATABASE_URL" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
    else
        # Linux
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
    fi
    echo -e "${GREEN}✓${NC} Database URL configured"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Step 3: Environment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "Environment (development/production) [development]: " NODE_ENV
NODE_ENV=${NODE_ENV:-development}

if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|" .env
else
    sed -i "s|NODE_ENV=.*|NODE_ENV=$NODE_ENV|" .env
fi
echo -e "${GREEN}✓${NC} Environment set to: $NODE_ENV"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Step 4: Initialize Database${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -z "$DATABASE_URL" ]; then
    read -p "Initialize database schema now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo ""
        echo -e "${YELLOW}Running database migrations...${NC}"
        npm run db:push
        echo -e "${GREEN}✓${NC} Database initialized"
    fi
fi

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                  ✓ Setup Complete!                        ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Verify your configuration:"
echo -e "   ${YELLOW}npm run validate${NC}"
echo ""
echo "2. Start the development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "3. Open your browser:"
echo -e "   ${YELLOW}http://localhost:5001${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
