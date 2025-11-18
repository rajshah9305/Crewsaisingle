# Vercel Deployment Setup Guide

## Issue: "Function Invocation Failed" When Creating Agents

This error occurs when the database schema hasn't been initialized on your Vercel deployment. Follow these steps to fix it.

## Prerequisites

You should have already:
- ✅ Deployed the app to Vercel
- ✅ Set environment variables in Vercel dashboard:
  - `GOOGLE_API_KEY`
  - `DATABASE_URL`
  - `NODE_ENV=production`

## Step 1: Install Vercel CLI

If you haven't already, install the Vercel CLI globally:

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

## Step 3: Link Your Project

Navigate to your project directory and link it to your Vercel deployment:

```bash
cd Crewsaisingle
vercel link
```

Select your project when prompted.

## Step 4: Pull Environment Variables

Pull the environment variables from Vercel to your local machine:

```bash
vercel env pull .env.local
```

This creates a `.env.local` file with your production environment variables.

## Step 5: Initialize Database Schema

Run the database initialization script:

```bash
npm run db:push
```

Or use the provided script:

```bash
./scripts/init-db.sh
```

This will create the necessary tables in your database:
- `agents` - Stores AI agent configurations
- `executions` - Stores execution history and results

## Step 6: Verify Database Setup

You can verify the tables were created by checking your database:

**For Neon:**
1. Go to https://console.neon.tech
2. Select your project
3. Go to "Tables" tab
4. You should see `agents` and `executions` tables

**For Supabase:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Table Editor"
4. You should see `agents` and `executions` tables

## Step 7: Test Agent Creation

Now go back to your Vercel deployment and try creating an agent again. It should work!

## Troubleshooting

### Error: "DATABASE_URL is not set"

**Solution:** Make sure you've set the `DATABASE_URL` environment variable in your Vercel dashboard:
1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add `DATABASE_URL` with your PostgreSQL connection string
4. Redeploy the application

### Error: "Connection refused" or "Connection timeout"

**Solution:** Check your database connection:
1. Verify the `DATABASE_URL` is correct
2. Ensure your database is running and accessible
3. For Neon/Supabase, check if your IP is whitelisted (usually not needed)
4. Make sure SSL is configured correctly (add `?sslmode=require` if needed)

### Error: "relation 'agents' does not exist"

**Solution:** The database tables haven't been created yet. Run Step 5 again:
```bash
npm run db:push
```

### Error: "Invalid API key" or Gemini API errors

**Solution:** Check your `GOOGLE_API_KEY`:
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key or verify your existing one
3. Update the environment variable in Vercel dashboard
4. Redeploy the application

## Alternative: Manual Database Setup

If the automated script doesn't work, you can manually create the tables using SQL:

```sql
-- Create agents table
CREATE TABLE agents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  goal TEXT NOT NULL,
  backstory TEXT NOT NULL,
  tasks JSONB NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Create executions table
CREATE TABLE executions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR NOT NULL,
  agent_name TEXT NOT NULL,
  status TEXT NOT NULL,
  result TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_agents_order ON agents("order");
CREATE INDEX idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX idx_executions_agent_id ON executions(agent_id);
```

Run this SQL in your database console (Neon SQL Editor, Supabase SQL Editor, or pgAdmin).

## Environment Variables Reference

Make sure these are set in your Vercel dashboard:

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `GOOGLE_API_KEY` | Yes | `AIzaSy...` |
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | `5001` (auto-set by Vercel) |
| `ALLOWED_ORIGINS` | No | Your Vercel domain |

## Need More Help?

If you're still experiencing issues:

1. Check the Vercel deployment logs:
   - Go to your project in Vercel
   - Click on "Deployments"
   - Click on the latest deployment
   - Check the "Build Logs" and "Function Logs"

2. Check the browser console for detailed error messages

3. Verify your database is accessible by testing the connection string locally

## Quick Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Initialize database
npm run db:push

# Deploy to Vercel
vercel --prod
```

## Success!

Once the database is initialized, you should be able to:
- ✅ Create new agents
- ✅ Edit existing agents
- ✅ Execute agent tasks
- ✅ View execution history

Your RAJAI Platform is now fully operational on Vercel! 🎉
