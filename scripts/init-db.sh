#!/bin/bash

# Database initialization script for Vercel deployment
# This script should be run after deploying to Vercel to set up the database schema

echo "🔧 Initializing database schema..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please set it in your Vercel dashboard or .env file"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Run drizzle-kit push to create tables
echo "📦 Creating database tables..."
npx drizzle-kit push

if [ $? -eq 0 ]; then
  echo "✅ Database schema initialized successfully!"
  echo ""
  echo "Your database now has the following tables:"
  echo "  - agents (for storing AI agents)"
  echo "  - executions (for storing execution history)"
  echo ""
  echo "You can now create agents in your application!"
else
  echo "❌ Failed to initialize database schema"
  echo "Please check your DATABASE_URL and database connection"
  exit 1
fi
