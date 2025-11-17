# 🚀 RAJAI Platform - Complete Setup Guide

This guide will help you set up the RAJAI Platform from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **PostgreSQL database** (we recommend [Neon](https://neon.tech) for free hosting)
- **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle

# Install dependencies
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual credentials
nano .env  # or use your preferred editor
```

**Required Configuration:**

```env
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_actual_google_api_key_here

# Get from Neon.tech (recommended) or your PostgreSQL provider
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Set to development for local work
NODE_ENV=development
```

### 3. Initialize Database

```bash
# Push the database schema
npm run db:push
```

### 4. Start Development Server

```bash
# Start the application
npm run dev

# The app will be available at http://localhost:5001
```

## Detailed Setup Instructions

### Getting a Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and paste it into your `.env` file

### Setting Up PostgreSQL Database

#### Option 1: Neon (Recommended - Free Tier Available)

1. Visit [Neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string
5. Paste it into your `.env` file as `DATABASE_URL`

#### Option 2: Supabase (Alternative Free Option)

1. Visit [Supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" for better performance)
5. Paste it into your `.env` file as `DATABASE_URL`

#### Option 3: Local PostgreSQL

```bash
# Install PostgreSQL locally
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql

# Start PostgreSQL
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo service postgresql start

# Create database
createdb rajai

# Your DATABASE_URL will be:
DATABASE_URL=postgresql://postgres:password@localhost:5432/rajai
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_API_KEY` | Your Google Gemini API key | - | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ Yes |
| `NODE_ENV` | Environment (development/production) | development | ✅ Yes |
| `PORT` | Server port | 5001 | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000,localhost:5001 | No |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | info | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | 900000 (15 min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |
| `EXECUTION_TIMEOUT_MS` | Agent execution timeout | 300000 (5 min) | No |

## Verification

After setup, verify everything works:

### 1. Check Health Endpoint

```bash
curl http://localhost:5001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected",
  "environment": "development",
  "gemini": "configured"
}
```

### 2. Create a Test Agent

1. Open http://localhost:5001 in your browser
2. Click "New Agent"
3. Fill in the form:
   - **Name**: Test Agent
   - **Role**: Software Developer
   - **Goal**: Write clean, efficient code
   - **Backstory**: Experienced developer with 10 years of expertise
   - **Tasks**: Add at least one task like "Write a hello world function"
4. Click "Create Agent"

### 3. Execute the Agent

1. Click the "Execute" button on your test agent
2. Wait for the execution to complete
3. View the results in the "Executions" tab

## Troubleshooting

### Database Connection Issues

**Error**: `DATABASE_URL environment variable is not set`

**Solution**: Make sure your `.env` file exists and contains a valid `DATABASE_URL`

```bash
# Check if .env exists
ls -la .env

# Verify DATABASE_URL is set
grep DATABASE_URL .env
```

### Google API Key Issues

**Error**: `Invalid or missing Google API key`

**Solution**: 
1. Verify your API key is correct in `.env`
2. Check that you've enabled the Gemini API in Google Cloud Console
3. Ensure there are no extra spaces or quotes around the key

### Port Already in Use

**Error**: `Port 5001 is already in use`

**Solution**: Change the port in your `.env` file:

```env
PORT=5002
```

### TypeScript Compilation Errors

**Error**: TypeScript compilation fails

**Solution**: 
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Run type check
npm run check
```

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run check

# Push database schema changes
npm run db:push

# Validate environment and dependencies
npm run validate
```

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `GOOGLE_API_KEY`
   - `DATABASE_URL`
   - `NODE_ENV=production`
5. Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Set environment variables
export NODE_ENV=production
export GOOGLE_API_KEY=your_key
export DATABASE_URL=your_database_url

# Start the server
npm start
```

## Next Steps

- 📚 Read the [API Documentation](README.md#-api-reference)
- 🎨 Customize the UI theme in `tailwind.config.ts`
- 🔧 Configure advanced settings in `server/config.ts`
- 📊 Set up monitoring and logging
- 🔒 Review security best practices

## Getting Help

- 📖 Check the [main README](README.md) for detailed documentation
- 🐛 Report issues on [GitHub Issues](https://github.com/rajshah9305/Crewsaisingle/issues)
- 💬 Join our community discussions

## License

MIT License - see [LICENSE](LICENSE) for details
