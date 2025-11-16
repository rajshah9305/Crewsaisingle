# ⚡ RAJ AI Platform - Quick Start

Get up and running in 5 minutes!

## 🚀 One-Command Setup

```bash
# Clone, install, configure, and start
git clone https://github.com/rajshah9305/Crewsaisingle.git && \
cd Crewsaisingle && \
npm install && \
cp .env.example .env && \
echo "⚠️  IMPORTANT: Edit .env with your credentials before continuing!" && \
echo "   1. Get Google API key: https://makersuite.google.com/app/apikey" && \
echo "   2. Get PostgreSQL database: https://neon.tech (free tier)" && \
echo "   3. Update .env file with your values" && \
echo "   4. Run: npm run db:push && npm run dev"
```

## 📝 Manual Setup (Recommended)

### 1. Clone and Install
```bash
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

**Required values**:
- `GOOGLE_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- `DATABASE_URL` - Get from [Neon](https://neon.tech) or [Supabase](https://supabase.com)

### 3. Initialize Database
```bash
npm run db:push
```

### 4. Start Server
```bash
npm run dev
```

Open [http://localhost:5001](http://localhost:5001)

## 🎯 Create Your First Agent

1. Click **"New Agent"**
2. Fill in:
   - **Name**: Research Assistant
   - **Role**: Senior Research Analyst
   - **Goal**: Find and summarize information
   - **Backstory**: Expert researcher with 15 years experience
   - **Tasks**:
     - Research latest AI trends
     - Summarize top 3 findings
     - Provide actionable insights
3. Click **"Create Agent"**
4. Click **"Execute"** to run

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run validate         # Check environment setup
npm run db:push          # Update database schema

# Production
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run validation tests
curl http://localhost:5001/api/health  # Check health
```

## 🆘 Quick Troubleshooting

### "DATABASE_URL not set"
```bash
# Check .env exists
ls -la .env

# If missing, copy from example
cp .env.example .env
```

### "Invalid API key"
```bash
# Verify in .env (no quotes, no spaces)
cat .env | grep GOOGLE_API_KEY

# Should look like:
# GOOGLE_API_KEY=AIzaSyC...
```

### "Port already in use"
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in .env
echo "PORT=5002" >> .env
```

### Execution stuck in "running"
```bash
# Restart server (auto-cleanup on startup)
# Press Ctrl+C, then:
npm run dev
```

## 📚 Next Steps

- **Full Setup Guide**: See [SETUP.md](./SETUP.md)
- **API Documentation**: See [README.md](./README.md)
- **Fixes Applied**: See [FIXES.md](./FIXES.md)

## 🎉 That's It!

You're ready to orchestrate AI agents!

**Need help?** Check [SETUP.md](./SETUP.md) for detailed troubleshooting.
