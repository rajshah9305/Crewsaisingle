# 🚀 Deploy to Vercel - Step by Step Guide

This guide will walk you through deploying the RAJAI Platform to Vercel in under 5 minutes.

## Prerequisites

Before you begin, make sure you have:

1. ✅ A [Vercel account](https://vercel.com/signup) (free tier works great)
2. ✅ A [PostgreSQL database](https://neon.tech) (free tier available)
3. ✅ A [Google Gemini API key](https://makersuite.google.com/app/apikey) (free tier available)

## Option 1: One-Click Deploy (Fastest) ⚡

Click the button below to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rajshah9305/Crewsaisingle&env=DATABASE_URL,GOOGLE_API_KEY,NODE_ENV&envDescription=Required%20environment%20variables%20for%20RAJAI%20Platform&envLink=https://github.com/rajshah9305/Crewsaisingle/blob/main/.env.example)

### After clicking the button:

1. **Sign in to Vercel** (or create an account)
2. **Name your project** (e.g., "rajai-platform")
3. **Configure Environment Variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `GOOGLE_API_KEY`: Your Gemini API key
   - `NODE_ENV`: Set to `production`
4. **Click "Deploy"**
5. **Wait 2-3 minutes** for the build to complete
6. **Done!** Your app is live at `https://your-project.vercel.app`

## Option 2: Manual Deploy via Vercel Dashboard 🎯

### Step 1: Get Your Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

### Step 3: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Enter: `https://github.com/rajshah9305/Crewsaisingle`
   - Click "Import"

3. **Configure Project**
   - **Project Name:** `rajai-platform` (or your choice)
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist/client` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables**
   
   Click "Environment Variables" and add:

   | Name | Value | Example |
   |------|-------|---------|
   | `DATABASE_URL` | Your PostgreSQL connection string | `postgresql://user:pass@host/db` |
   | `GOOGLE_API_KEY` | Your Gemini API key | `AIzaSyC...` |
   | `NODE_ENV` | `production` | `production` |

   **Optional Variables** (for advanced configuration):

   | Name | Value | Description |
   |------|-------|-------------|
   | `DB_MAX_CONNECTIONS` | `10` | Max database connections |
   | `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per 15 min |
   | `LOG_LEVEL` | `info` | Logging level |
   | `ALLOWED_ORIGINS` | `https://yourdomain.com` | CORS origins |

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live!

### Step 4: Initialize Database

After deployment, you need to create the database tables:

1. **Install Vercel CLI** (one-time setup):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   cd /path/to/Crewsaisingle
   vercel link
   ```

4. **Run database migration**:
   ```bash
   vercel env pull .env.local
   npm run db:push
   ```

   Or manually run this SQL in your database:
   ```sql
   CREATE TABLE IF NOT EXISTS agents (
     id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     role TEXT NOT NULL,
     goal TEXT NOT NULL,
     backstory TEXT NOT NULL,
     tasks JSONB NOT NULL,
     "order" INTEGER NOT NULL DEFAULT 0
   );

   CREATE TABLE IF NOT EXISTS executions (
     id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
     agent_id VARCHAR NOT NULL,
     agent_name TEXT NOT NULL,
     status TEXT NOT NULL,
     result TEXT,
     created_at TIMESTAMP NOT NULL DEFAULT NOW()
   );
   ```

### Step 5: Verify Deployment

1. **Check Health Endpoint**
   ```bash
   curl https://your-project.vercel.app/api/health
   ```

   Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-11-16T...",
     "database": "connected",
     "environment": "production",
     "gemini": "configured"
   }
   ```

2. **Open Your App**
   - Visit `https://your-project.vercel.app`
   - You should see the RAJAI Platform dashboard

3. **Test Agent Creation**
   - Click "Create Agent"
   - Fill in the form
   - Click "Save"
   - Execute the agent

## Option 3: Deploy via Vercel CLI 💻

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
cd /path/to/Crewsaisingle
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** rajai-platform
- **Directory?** ./
- **Override settings?** No

### Step 4: Add Environment Variables

```bash
vercel env add DATABASE_URL production
# Paste your database URL

vercel env add GOOGLE_API_KEY production
# Paste your API key

vercel env add NODE_ENV production
# Type: production
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

## Post-Deployment Configuration

### 1. Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 2. Enable Analytics

1. Go to "Analytics" tab
2. Enable Web Analytics (free)
3. Monitor traffic and performance

### 3. Set Up Monitoring

1. Go to "Monitoring" tab
2. Enable Error Tracking
3. Set up alerts for errors

### 4. Configure Security Headers

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Build Fails

**Error:** `Cannot find module 'xxx'`
- **Solution:** Run `npm install` locally and commit `package-lock.json`

**Error:** `TypeScript compilation failed`
- **Solution:** Run `npm run check` locally to see errors

### Database Connection Fails

**Error:** `DATABASE_URL environment variable is not set`
- **Solution:** Add `DATABASE_URL` in Vercel environment variables

**Error:** `Connection timeout`
- **Solution:** Check if your database allows connections from Vercel IPs

### API Errors

**Error:** `GOOGLE_API_KEY environment variable is not set`
- **Solution:** Add `GOOGLE_API_KEY` in Vercel environment variables

**Error:** `Rate limit exceeded`
- **Solution:** Increase `RATE_LIMIT_MAX_REQUESTS` or upgrade Gemini API plan

### Runtime Errors

**Error:** `Module not found`
- **Solution:** Check that all dependencies are in `dependencies` (not `devDependencies`)

**Error:** `Function timeout`
- **Solution:** Upgrade to Vercel Pro for longer function timeouts

## Performance Optimization

### 1. Enable Edge Caching

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/agents",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 2. Enable Compression

Already enabled via `compression` middleware in server.

### 3. Optimize Images

Use Vercel Image Optimization:
```jsx
import Image from 'next/image'
// Replace <img> with <Image>
```

## Monitoring and Logs

### View Logs

```bash
vercel logs your-project.vercel.app
```

Or in Vercel Dashboard:
1. Go to your project
2. Click "Deployments"
3. Click on a deployment
4. Click "View Function Logs"

### Monitor Performance

1. Go to "Analytics" tab
2. View:
   - Page views
   - Response times
   - Error rates
   - Geographic distribution

## Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deployment

```bash
vercel --prod
```

### Rollback

1. Go to "Deployments" tab
2. Find previous deployment
3. Click "..." → "Promote to Production"

## Cost Estimation

### Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Edge Network
- ✅ Web Analytics

### Paid Features:
- 🔒 Custom domains (free on Pro)
- 🔒 Longer function timeouts (Pro: 60s, Enterprise: 900s)
- 🔒 More bandwidth (Pro: 1TB/month)
- 🔒 Team collaboration

**Estimated Monthly Cost:**
- **Free Tier:** $0 (perfect for testing)
- **Pro Tier:** $20/month (recommended for production)
- **Enterprise:** Custom pricing

## Support

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Project README](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Community
- [GitHub Issues](https://github.com/rajshah9305/Crewsaisingle/issues)
- [Vercel Discord](https://vercel.com/discord)

### Need Help?
Open an issue on GitHub with:
- Deployment URL
- Error message
- Steps to reproduce

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Code is pushed to GitHub
- [ ] Environment variables are ready
- [ ] Database is created and accessible
- [ ] Google Gemini API key is valid
- [ ] Build passes locally (`npm run build`)
- [ ] TypeScript compiles (`npm run check`)

After deploying:

- [ ] Health check returns 200
- [ ] Can create agents
- [ ] Can execute agents
- [ ] Logs show no errors
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Monitoring set up

---

**🎉 Congratulations!** Your RAJAI Platform is now live on Vercel!

**Live URL:** `https://your-project.vercel.app`

**Next Steps:**
1. Test all features
2. Set up custom domain
3. Enable monitoring
4. Share with users!
