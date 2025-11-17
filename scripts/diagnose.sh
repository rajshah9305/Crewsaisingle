#!/bin/bash

# RAJAI Platform - Diagnostic Script
# This script helps diagnose server errors and configuration issues

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         RAJAI Platform - Diagnostic Tool                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check 1: .env file exists
echo -e "${BLUE}[1/8]${NC} Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
else
    echo -e "${RED}✗${NC} .env file not found"
    echo -e "${YELLOW}Fix:${NC} Run: cp .env.example .env"
    exit 1
fi

# Check 2: Environment variables
echo -e "${BLUE}[2/8]${NC} Checking environment variables..."
source .env 2>/dev/null || true

if [ -z "$GOOGLE_API_KEY" ] || [ "$GOOGLE_API_KEY" = "your_google_api_key_here" ]; then
    echo -e "${RED}✗${NC} GOOGLE_API_KEY not configured"
    echo -e "${YELLOW}Fix:${NC} Get API key from https://makersuite.google.com/app/apikey"
    ENV_ERROR=1
else
    echo -e "${GREEN}✓${NC} GOOGLE_API_KEY is set"
fi

if [ -z "$DATABASE_URL" ] || [ "$DATABASE_URL" = "postgresql://user:password@host:5432/database" ]; then
    echo -e "${RED}✗${NC} DATABASE_URL not configured"
    echo -e "${YELLOW}Fix:${NC} Get database from https://neon.tech"
    ENV_ERROR=1
else
    echo -e "${GREEN}✓${NC} DATABASE_URL is set"
fi

if [ ! -z "$ENV_ERROR" ]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  CONFIGURATION ERROR${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Your environment variables are not configured."
    echo ""
    echo "Quick fix:"
    echo "  1. Run: ${YELLOW}./scripts/setup-env.sh${NC}"
    echo "  2. Or see: ${YELLOW}QUICK_FIX.md${NC}"
    echo ""
    exit 1
fi

# Check 3: Node modules
echo -e "${BLUE}[3/8]${NC} Checking node_modules..."
if [ -d node_modules ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${RED}✗${NC} node_modules not found"
    echo -e "${YELLOW}Fix:${NC} Run: npm install"
    exit 1
fi

# Check 4: TypeScript compilation
echo -e "${BLUE}[4/8]${NC} Checking TypeScript compilation..."
if npm run check > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TypeScript compiles without errors"
else
    echo -e "${RED}✗${NC} TypeScript compilation errors"
    echo -e "${YELLOW}Fix:${NC} Run: npm run check"
    exit 1
fi

# Check 5: Database connection
echo -e "${BLUE}[5/8]${NC} Testing database connection..."
if command -v psql &> /dev/null; then
    if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Database connection successful"
    else
        echo -e "${RED}✗${NC} Cannot connect to database"
        echo -e "${YELLOW}Fix:${NC} Check your DATABASE_URL"
        DB_ERROR=1
    fi
else
    echo -e "${YELLOW}⚠${NC}  psql not installed, skipping database test"
fi

# Check 6: Google API key validity
echo -e "${BLUE}[6/8]${NC} Testing Google API key..."
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GOOGLE_API_KEY" 2>/dev/null || echo "000")

if [ "$API_TEST" = "200" ]; then
    echo -e "${GREEN}✓${NC} Google API key is valid"
elif [ "$API_TEST" = "400" ]; then
    echo -e "${RED}✗${NC} Google API key is invalid"
    echo -e "${YELLOW}Fix:${NC} Get a new key from https://makersuite.google.com/app/apikey"
    API_ERROR=1
else
    echo -e "${YELLOW}⚠${NC}  Could not verify API key (network issue?)"
fi

# Check 7: Port availability
echo -e "${BLUE}[7/8]${NC} Checking port availability..."
PORT=${PORT:-5001}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC}  Port $PORT is already in use"
    echo -e "${YELLOW}Fix:${NC} Kill the process or change PORT in .env"
else
    echo -e "${GREEN}✓${NC} Port $PORT is available"
fi

# Check 8: Build test
echo -e "${BLUE}[8/8]${NC} Testing build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    echo -e "${YELLOW}Fix:${NC} Run: npm run build"
    BUILD_ERROR=1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Summary
if [ -z "$DB_ERROR" ] && [ -z "$API_ERROR" ] && [ -z "$BUILD_ERROR" ]; then
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║              ✓ All Checks Passed!                         ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Your configuration looks good!"
    echo ""
    echo "Next steps:"
    echo "  1. Initialize database: ${YELLOW}npm run db:push${NC}"
    echo "  2. Start server: ${YELLOW}npm run dev${NC}"
    echo "  3. Open browser: ${YELLOW}http://localhost:$PORT${NC}"
    echo ""
else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║              ✗ Issues Found                               ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Please fix the issues above and run this script again."
    echo ""
    echo "Quick fixes:"
    if [ ! -z "$DB_ERROR" ]; then
        echo "  • Database: Check your DATABASE_URL in .env"
    fi
    if [ ! -z "$API_ERROR" ]; then
        echo "  • API Key: Get new key from https://makersuite.google.com/app/apikey"
    fi
    if [ ! -z "$BUILD_ERROR" ]; then
        echo "  • Build: Run 'npm run build' to see detailed errors"
    fi
    echo ""
    echo "For detailed help, see: ${YELLOW}QUICK_FIX.md${NC}"
    echo ""
    exit 1
fi
