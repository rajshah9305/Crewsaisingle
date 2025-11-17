# 🚨 Quick Fix: Server Error - Function Invocation Failed

## Problem
The server cannot start because environment variables are not configured with actual values.

## Root Cause
The `.env` file contains placeholder values:
- `GOOGLE_API_KEY=your_google_api_key_here` ❌
- `DATABASE_URL=postgresql://user:password@host:5432/database` ❌

## Solution (Choose One)

---

### Option 1: Quick Test Setup (5 minutes) ⚡

Use this for immediate testing without external services.

#### Step 1: Get Google API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

#### Step 2: Set Up Free Database (Neon - Recommended)

1. Visit: https://neon.tech
2. Sign up (free, no credit card required)
3. Create a new project
4. Copy the connection string (looks like: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)

#### Step 3: Update .env File

```bash
# Edit the .env file
nano .env
# or
code .env
```

Replace the placeholder values:

```env
# Replace with your actual Google API key
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Replace with your Neon database URL
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb

NODE_ENV=development
```

#### Step 4: Initialize Database

```bash
npm run db:push
```

#### Step 5: Start Server

```bash
npm run dev
```

✅ Server should now start successfully!

---

### Option 2: Use Supabase (Alternative Free Database)

1. Visit: https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (use "Connection pooling" mode)
5. Update `.env` with the connection string

---

### Option 3: Local PostgreSQL (For Development)

If you have PostgreSQL installed locally:

```bash
# Create database
createdb rajai

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/rajai
```

---

## Verification

After configuring, verify the setup:

### 1. Check Environment Variables

```bash
npm run validate
```

Expected output:
```
✅ Environment variables are properly configured
✅ All required dependencies are installed
```

### 2. Test Health Endpoint

```bash
# Start server
npm run dev

# In another terminal, test health
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-17T...",
  "database": "connected",
  "environment": "development",
  "gemini": "configured"
}
```

### 3. Test Agent Creation

```bash
curl -X POST http://localhost:5001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "role": "Developer",
    "goal": "Test the system",
    "backstory": "Testing agent",
    "tasks": ["Test task 1"]
  }'
```

Expected: HTTP 201 with agent data

---

## Common Issues

### Issue 1: "Invalid API Key"

**Symptom**: Server starts but agent execution fails

**Solution**: 
- Verify your Google API key is correct
- Check that Gemini API is enabled in Google Cloud Console
- Try creating a new API key

### Issue 2: "Database Connection Failed"

**Symptom**: Server starts but database operations fail

**Solution**:
- Verify database URL is correct
- Check that database is accessible
- For Neon: Ensure you're using the correct connection string
- Test connection: `psql $DATABASE_URL`

### Issue 3: "Port Already in Use"

**Symptom**: `Error: listen EADDRINUSE: address already in use :::5001`

**Solution**:
```bash
# Kill existing process
pkill -f "tsx server/index.ts"

# Or change port in .env
PORT=5002
```

---

## For Vercel Deployment

If you're deploying to Vercel and getting this error:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `GOOGLE_API_KEY` = Your actual API key
   - `DATABASE_URL` = Your database connection string
   - `NODE_ENV` = `production`
3. Redeploy the application

---

## Need Help?

### Quick Links
- **Google API Key**: https://makersuite.google.com/app/apikey
- **Neon Database**: https://neon.tech
- **Supabase Database**: https://supabase.com
- **Setup Guide**: See [SETUP.md](SETUP.md)

### Troubleshooting Steps

1. **Check .env file exists**:
   ```bash
   ls -la .env
   ```

2. **Verify environment variables**:
   ```bash
   grep -E "GOOGLE_API_KEY|DATABASE_URL" .env
   ```

3. **Check server logs**:
   ```bash
   npm run dev
   # Look for error messages
   ```

4. **Test database connection**:
   ```bash
   # If you have psql installed
   psql $DATABASE_URL -c "SELECT 1"
   ```

---

## Summary

**The server error occurs because:**
- Environment variables are not configured
- The application requires actual API keys and database credentials

**To fix:**
1. Get Google API key from https://makersuite.google.com/app/apikey
2. Get database URL from https://neon.tech (free)
3. Update `.env` file with actual values
4. Run `npm run db:push` to initialize database
5. Run `npm run dev` to start server

**After fixing, you should be able to:**
- ✅ Create new agents
- ✅ Execute agent tasks
- ✅ View execution results
- ✅ Access all features

---

**Need more help?** Check [SETUP.md](SETUP.md) for detailed instructions.
