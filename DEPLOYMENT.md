# 🚀 Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - To host your repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - Get free hosting at:
   - [Neon](https://neon.tech) (Recommended)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)
4. **Google Gemini API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: RAJAI Platform"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/rajshah9305/Crewsaisingle.git

# Push to GitHub
git push -u origin main
```

## Step 2: Set Up Database

### Option A: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname`)
4. Save it for later

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Save it for later

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

### 3.2 Configure Environment Variables

In the Vercel dashboard, add these environment variables:

```env
GOOGLE_API_KEY=your_actual_gemini_api_key
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
PORT=5001
ALLOWED_ORIGINS=https://your-app.vercel.app
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Replace the values with your actual credentials!

### 3.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete (2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

## Step 4: Initialize Database

After deployment, you need to push the database schema:

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull

# Push database schema
npm run db:push
```

### Option 2: Using Local Environment

```bash
# Create .env with production DATABASE_URL
echo "DATABASE_URL=your_production_database_url" > .env

# Push schema
npm run db:push
```

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Check the health endpoint: `https://your-app.vercel.app/api/health`
3. Create a test agent
4. Execute the agent
5. Verify results appear

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Solution**: Run `npm install` locally and commit `package-lock.json`

**Error**: "TypeScript compilation failed"
- **Solution**: Run `npm run check` locally to find errors

### Database Connection Issues

**Error**: "DATABASE_URL is not set"
- **Solution**: Verify environment variables in Vercel dashboard

**Error**: "Connection timeout"
- **Solution**: Check if your database allows connections from Vercel IPs

### API Errors

**Error**: "GOOGLE_API_KEY is not set"
- **Solution**: Add the API key in Vercel environment variables

**Error**: "CORS policy error"
- **Solution**: Update `ALLOWED_ORIGINS` to include your Vercel domain

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update `ALLOWED_ORIGINS` environment variable

## Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### Performance Monitoring

1. Go to Vercel dashboard
2. Click on your project
3. View "Analytics" tab for:
   - Response times
   - Error rates
   - Traffic patterns

## Scaling

Vercel automatically scales your application. For high traffic:

1. Upgrade to Vercel Pro for better limits
2. Consider upgrading your database plan
3. Enable caching by setting:
   ```env
   ENABLE_RESPONSE_CACHE=true
   CACHE_TTL_SECONDS=300
   ```

## Security Checklist

- ✅ Environment variables are set in Vercel (not in code)
- ✅ Database uses SSL connections
- ✅ CORS is configured with specific origins
- ✅ Rate limiting is enabled
- ✅ API keys are kept secret
- ✅ Database credentials are secure

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys!
```

## Rollback

If something goes wrong:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find a working deployment
4. Click "..." → "Promote to Production"

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Gemini API**: [ai.google.dev](https://ai.google.dev)

## Cost Estimate

- **Vercel**: Free tier (Hobby) - $0/month
- **Neon**: Free tier - $0/month (0.5GB storage)
- **Gemini API**: Free tier - $0/month (60 requests/minute)

**Total**: $0/month for small projects! 🎉

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database schema pushed
- [ ] Health endpoint returns 200
- [ ] Test agent creation works
- [ ] Test agent execution works
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

**Congratulations!** 🎉 Your RAJAI Platform is now live!
