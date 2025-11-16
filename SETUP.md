# 🚀 RAJ AI Platform - Complete Setup Guide

This guide will walk you through setting up the RAJ AI Multi-Agent Orchestration Platform from scratch.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js 18 or higher** installed ([Download](https://nodejs.org/))
- [ ] **PostgreSQL database** (see options below)
- [ ] **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))
- [ ] **Git** installed for version control

## 🗄️ Step 1: Database Setup

You have several options for PostgreSQL hosting:

### Option A: Neon (Recommended - Free Tier)

1. Visit [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:password@host.neon.tech/database`)

### Option B: Supabase (Free Tier)

1. Visit [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (URI format)

### Option C: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb rajai_platform

# Your connection string will be:
# postgresql://localhost:5432/rajai_platform
```

## 🔑 Step 2: Get Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with `AIza...`)

⚠️ **Important**: Keep this key secure and never commit it to version control!

## 📦 Step 3: Clone and Install

```bash
# Clone the repository
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle

# Install dependencies
npm install
```

## ⚙️ Step 4: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor
nano .env  # or use your preferred editor
```

Update the following required variables:

```env
# Required - Replace with your actual values
GOOGLE_API_KEY=AIza...your_actual_key_here
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=development

# Optional - Can keep defaults
PORT=5001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_RESPONSE_CACHE=false
CACHE_TTL_SECONDS=300
EXECUTION_TIMEOUT_MS=300000
```

### Environment Variables Explained

| Variable | What It Does | Example |
|----------|--------------|---------|
| `GOOGLE_API_KEY` | Your Gemini API key for AI execution | `AIzaSyC...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port (must be 5001 in Gitpod) | `5001` |
| `EXECUTION_TIMEOUT_MS` | Max time for agent execution | `300000` (5 minutes) |

## 🗃️ Step 5: Initialize Database

```bash
# Push the database schema
npm run db:push

# You should see:
# ✅ Schema pushed successfully
```

This creates two tables:
- `agents` - Stores agent configurations
- `executions` - Tracks execution history

## ✅ Step 6: Verify Setup

```bash
# Check if everything is configured correctly
npm run validate

# Expected output:
# ✅ Environment variables validated
# ✅ Database connection successful
# ✅ Google API key configured
```

## 🚀 Step 7: Start Development Server

```bash
# Start the development server
npm run dev

# You should see:
# ➜ Local:   http://localhost:5001/
# ➜ Network: use --host to expose
```

Open your browser to [http://localhost:5001](http://localhost:5001)

## 🎯 Step 8: Create Your First Agent

1. Click the **"New Agent"** button
2. Fill in the form:
   - **Name**: Content Writer
   - **Role**: Senior Content Strategist
   - **Goal**: Create engaging, SEO-optimized content
   - **Backstory**: Expert writer with 10 years of experience
   - **Tasks**: 
     - Research trending topics in tech
     - Write a 500-word article about AI
     - Optimize for SEO
3. Click **"Create Agent"**
4. Click **"Execute"** to run the agent
5. Watch the execution status update in real-time

## 🔧 Troubleshooting

### Issue: "DATABASE_URL environment variable is not set"

**Solution**: Make sure you've created the `.env` file and added your database URL.

```bash
# Check if .env exists
ls -la .env

# If not, copy from example
cp .env.example .env
```

### Issue: "Failed to connect to database"

**Solutions**:
1. Verify your `DATABASE_URL` is correct
2. Check if your database is running
3. Ensure your IP is whitelisted (for cloud databases)
4. Test connection manually:

```bash
# Install psql if needed
brew install postgresql

# Test connection
psql "postgresql://user:password@host:5432/database"
```

### Issue: "Gemini API error: Invalid API key"

**Solutions**:
1. Verify your API key is correct in `.env`
2. Check if the key has proper permissions
3. Ensure there are no extra spaces or quotes
4. Generate a new key if needed

### Issue: "Port 5001 is already in use"

**Solution**: Kill the process using the port or change the port:

```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change PORT in .env
PORT=5002
```

### Issue: "Module not found" errors

**Solution**: Reinstall dependencies:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Execution stays in "running" status forever

**Solution**: The server has a cleanup job that runs every 5 minutes. You can also restart the server to clean up stuck executions.

```bash
# Restart the server
# Press Ctrl+C to stop
npm run dev
```

## 📊 Monitoring and Logs

### View Logs

```bash
# Development logs are shown in console
# Production logs are in logs/ directory

# View error logs
tail -f logs/error.log

# View combined logs
tail -f logs/combined.log
```

### Check Health

```bash
# Health check endpoint
curl http://localhost:5001/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "environment": "development",
  "gemini": "configured"
}
```

## 🏗️ Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `GOOGLE_API_KEY`
   - `DATABASE_URL`
   - `NODE_ENV=production`
5. Deploy!

### Environment-Specific Settings

**Development**:
- Detailed logging
- No rate limiting
- Hot reload enabled
- Source maps included

**Production**:
- Minimal logging
- Rate limiting active (100 req/15min)
- Optimized builds
- Security headers enabled

## 🔐 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Use strong database passwords** - At least 16 characters
3. **Rotate API keys regularly** - Every 90 days recommended
4. **Enable SSL for database** - Especially for production
5. **Monitor API usage** - Check Google Cloud Console for quota
6. **Set up alerts** - For failed executions and errors

## 📚 Next Steps

Now that you're set up:

1. **Explore Templates** - Click "Templates" to see pre-built agents
2. **Read API Docs** - Check `README.md` for API reference
3. **Customize UI** - Modify components in `client/src/components/`
4. **Add Features** - Extend the platform with your own ideas

## 🆘 Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/rajshah9305/Crewsaisingle/issues)
- **Documentation**: Check `README.md` for detailed API docs
- **Logs**: Always check logs first for error details

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database created
- [ ] Google Gemini API key obtained
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Setup validated (`npm run validate`)
- [ ] Development server running (`npm run dev`)
- [ ] First agent created and executed successfully

Congratulations! 🎉 Your RAJ AI Platform is now fully operational!
