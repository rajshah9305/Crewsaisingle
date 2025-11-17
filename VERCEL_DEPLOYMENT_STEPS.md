# 🚀 Vercel Deployment - Complete Step-by-Step Guide

## Overview

This guide provides **exact steps** with **screenshots descriptions** and **commands** to deploy the RAJAI Platform to Vercel.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] GitHub account
- [ ] Vercel account (free tier is fine)
- [ ] Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))
- [ ] PostgreSQL database URL ([Get free from Neon](https://neon.tech))
- [ ] Code pushed to GitHub repository

---

## 🎯 Part 1: Prepare Your Repository

### Step 1.1: Verify Your Code is on GitHub

```bash
# Check current branch
git branch

# Should show: * main (or master)

# Check remote
git remote -v

# Should show:
# origin  https://github.com/rajshah9305/Crewsaisingle.git (fetch)
# origin  https://github.com/rajshah9305/Crewsaisingle.git (push)

# Check status
git status

# Should show: "nothing to commit, working tree clean"
```

### Step 1.2: If Changes Need to be Pushed

```bash
# Add all changes
git add -A

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 1.3: Verify on GitHub

1. Open browser
2. Go to: https://github.com/rajshah9305/Crewsaisingle
3. Verify you see:
   - ✅ `vercel.json` file
   - ✅ `package.json` file
   - ✅ `api/index.js` file
   - ✅ Latest commit

---

## 🌐 Part 2: Create Vercel Account (If Needed)

### Step 2.1: Sign Up for Vercel

1. **Open browser** and go to: https://vercel.com/signup

2. **Choose sign-up method**:
   - Click "Continue with GitHub" (recommended)
   - Or use email

3. **Authorize Vercel**:
   - Click "Authorize Vercel"
   - Grant repository access

4. **Complete profile**:
   - Enter your name
   - Choose account type (Personal is fine)
   - Click "Continue"

**Result**: You're now logged into Vercel Dashboard

---

## 📦 Part 3: Import Project to Vercel

### Step 3.1: Start Import Process

1. **Go to Vercel Dashboard**:
   - URL: https://vercel.com/dashboard
   - You should see "Let's build something new"

2. **Click "Add New..."**:
   - Click the "Add New..." button (top right)
   - Select "Project" from dropdown

3. **Import Git Repository**:
   - You'll see "Import Git Repository" page
   - Look for your repository: `rajshah9305/Crewsaisingle`

### Step 3.2: Select Repository

**If you see your repository**:
- Click "Import" button next to it
- Skip to Step 3.3

**If you DON'T see your repository**:

1. Click "Adjust GitHub App Permissions"
2. Click "Configure GitHub App"
3. Select "All repositories" or select specific repository
4. Click "Save"
5. Return to Vercel
6. Click "Import" next to your repository

### Step 3.3: Configure Project

You'll see "Configure Project" page with these sections:

#### Project Name
```
Default: crewsaisingle
You can change this or keep it
```

#### Framework Preset
```
Vercel should auto-detect: "Other"
Leave as is - our vercel.json handles configuration
```

#### Root Directory
```
Leave as: ./
(Don't change this)
```

#### Build and Output Settings

Vercel will show:
```
Build Command: npm run build
Output Directory: dist/client
Install Command: npm install
```

**These are automatically detected from vercel.json** ✅

**DO NOT CHANGE THESE** - they're correct!

---

## 🔐 Part 4: Configure Environment Variables

### Step 4.1: Add Environment Variables

**IMPORTANT**: Do this BEFORE clicking "Deploy"

1. **Scroll down** to "Environment Variables" section

2. **Add Variable 1: GOOGLE_API_KEY**
   ```
   Name:  GOOGLE_API_KEY
   Value: [Paste your Google API key here]
   
   Example: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   
   - Click "Add" button
   - Select all environments: ✅ Production ✅ Preview ✅ Development

3. **Add Variable 2: DATABASE_URL**
   ```
   Name:  DATABASE_URL
   Value: [Paste your PostgreSQL connection string]
   
   Example: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
   
   - Click "Add" button
   - Select all environments: ✅ Production ✅ Preview ✅ Development

4. **Add Variable 3: NODE_ENV**
   ```
   Name:  NODE_ENV
   Value: production
   ```
   
   - Click "Add" button
   - Select: ✅ Production only

### Step 4.2: Verify Environment Variables

You should now see 3 environment variables listed:
- ✅ GOOGLE_API_KEY
- ✅ DATABASE_URL
- ✅ NODE_ENV

**Screenshot Check**: Your screen should show these three variables with their values (partially hidden for security)

---

## 🚀 Part 5: Deploy

### Step 5.1: Start Deployment

1. **Click "Deploy" button** (bottom of page)

2. **Wait for deployment**:
   - You'll see "Building..." status
   - This takes 1-3 minutes
   - You'll see build logs in real-time

### Step 5.2: Monitor Build Progress

You'll see these stages:

```
1. ⏳ Queued
   └─ Waiting for build to start

2. 🔨 Building
   ├─ Cloning repository
   ├─ Installing dependencies (npm install)
   ├─ Running build command (npm run build)
   │  ├─ vite build (building frontend)
   │  └─ esbuild (bundling backend)
   └─ Uploading build output

3. ✅ Ready
   └─ Deployment successful!
```

### Step 5.3: Build Success

When successful, you'll see:
```
✅ Deployment Ready
   Your project is live at: https://crewsaisingle-xxx.vercel.app
```

**Click "Visit" button** to open your deployed application

---

## 🧪 Part 6: Verify Deployment

### Step 6.1: Test Health Endpoint

1. **Open new browser tab**

2. **Go to your Vercel URL + /api/health**:
   ```
   https://your-app-name.vercel.app/api/health
   ```

3. **Expected response**:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-11-17T...",
     "database": "connected",
     "environment": "production",
     "gemini": "configured"
   }
   ```

**If you see this** ✅ - Your API is working!

**If you see an error** ❌ - See troubleshooting section below

### Step 6.2: Test Frontend

1. **Go to your main Vercel URL**:
   ```
   https://your-app-name.vercel.app
   ```

2. **You should see**:
   - ✅ RAJAI Platform homepage
   - ✅ "New Agent" button
   - ✅ Stats cards (Total Agents, Active Executions, etc.)

### Step 6.3: Test Creating an Agent

1. **Click "New Agent" button**

2. **Fill in the form**:
   ```
   Name: Test Agent
   Role: Software Developer
   Goal: Write clean code
   Backstory: Experienced developer with 10 years of expertise
   Tasks: Write a hello world function
   ```

3. **Click "Create Agent"**

4. **Expected result**:
   - ✅ Success toast notification
   - ✅ Agent appears in the list
   - ✅ No errors

### Step 6.4: Test Agent Execution

1. **Click "Execute" button** on your test agent

2. **Expected result**:
   - ✅ "Agent executed" toast notification
   - ✅ Execution appears in "Executions" tab
   - ✅ Status shows "Running" then "Completed"

3. **View results**:
   - Click on the execution
   - You should see the AI-generated response

**If all tests pass** ✅ - Your deployment is successful!

---

## 🔧 Part 7: Post-Deployment Configuration

### Step 7.1: Set Up Custom Domain (Optional)

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Click "Settings" tab**
4. **Click "Domains" in sidebar**
5. **Click "Add Domain"**
6. **Enter your domain**: `yourdomain.com`
7. **Follow DNS configuration instructions**

### Step 7.2: Configure Production Database

If you used a test database, now set up production:

1. **Create production database** on Neon/Supabase
2. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
3. **Edit DATABASE_URL**:
   - Click "Edit" on DATABASE_URL
   - Update to production database URL
   - Save changes
4. **Redeploy**:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Step 7.3: Initialize Production Database

```bash
# Set production database URL locally
export DATABASE_URL="your_production_database_url"

# Push schema to production database
npm run db:push
```

---

## 📊 Part 8: Monitor Your Deployment

### Step 8.1: View Deployment Logs

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Click "Deployments" tab**
4. **Click on latest deployment**
5. **Click "View Function Logs"**

You'll see:
- API requests
- Errors (if any)
- Performance metrics

### Step 8.2: Check Analytics

1. **Click "Analytics" tab**
2. **View**:
   - Page views
   - Response times
   - Error rates
   - Geographic distribution

### Step 8.3: Set Up Alerts (Optional)

1. **Go to Settings** → **Notifications**
2. **Enable**:
   - ✅ Deployment notifications
   - ✅ Error alerts
   - ✅ Performance alerts

---

## 🐛 Troubleshooting

### Issue 1: Build Failed

**Symptoms**:
```
❌ Build failed
Error: Command "npm run build" exited with 1
```

**Solutions**:

1. **Check build logs**:
   - Click on failed deployment
   - Read error messages

2. **Common causes**:
   - TypeScript errors
   - Missing dependencies
   - Environment variables not set

3. **Fix locally first**:
   ```bash
   # Test build locally
   npm run build
   
   # If it fails, fix errors
   npm run check  # Check TypeScript
   npm install    # Reinstall dependencies
   ```

4. **Push fix and redeploy**:
   ```bash
   git add -A
   git commit -m "Fix build errors"
   git push origin main
   ```

---

### Issue 2: "Function Invocation Failed"

**Symptoms**:
```
500 Internal Server Error
Function invocation failed
```

**Solutions**:

1. **Check environment variables**:
   - Go to Settings → Environment Variables
   - Verify all 3 variables are set:
     - ✅ GOOGLE_API_KEY
     - ✅ DATABASE_URL
     - ✅ NODE_ENV

2. **Check function logs**:
   - Deployments → Latest → View Function Logs
   - Look for error messages

3. **Common causes**:
   - Missing GOOGLE_API_KEY
   - Invalid DATABASE_URL
   - Database not initialized

4. **Fix**:
   ```bash
   # Verify API key works
   curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY"
   
   # Verify database connection
   psql "$DATABASE_URL" -c "SELECT 1"
   ```

5. **Redeploy after fixing**:
   - Deployments → Latest → Redeploy

---

### Issue 3: "Database Connection Failed"

**Symptoms**:
```
{
  "status": "degraded",
  "database": "error"
}
```

**Solutions**:

1. **Check DATABASE_URL format**:
   ```
   Correct: postgresql://user:pass@host:5432/dbname
   Wrong:   postgres://user:pass@host:5432/dbname  (missing 'ql')
   ```

2. **Verify database is accessible**:
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1"
   ```

3. **Check database provider**:
   - Neon: Ensure project is not paused
   - Supabase: Check connection pooling is enabled

4. **Update DATABASE_URL**:
   - Settings → Environment Variables
   - Edit DATABASE_URL
   - Save and redeploy

---

### Issue 4: "API Routes Return 404"

**Symptoms**:
```
GET /api/agents → 404 Not Found
```

**Solutions**:

1. **Check vercel.json rewrites**:
   ```json
   "rewrites": [
     {
       "source": "/api/(.*)",
       "destination": "/api"
     }
   ]
   ```

2. **Verify api/index.js exists**:
   ```bash
   ls -la api/index.js
   ```

3. **Check build output**:
   ```bash
   npm run build
   ls -la dist/index.js
   ```

4. **Redeploy**:
   - Push changes to GitHub
   - Vercel will auto-deploy

---

### Issue 5: "Static Files Not Loading"

**Symptoms**:
- Blank page
- 404 for CSS/JS files

**Solutions**:

1. **Check outputDirectory in vercel.json**:
   ```json
   "outputDirectory": "dist/client"
   ```

2. **Verify build creates dist/client/**:
   ```bash
   npm run build
   ls -la dist/client/
   ```

3. **Check vite.config.ts**:
   ```typescript
   build: {
     outDir: path.resolve(__dirname, "dist/client")
   }
   ```

---

## 🔄 Part 9: Redeployment

### When to Redeploy

Redeploy when you:
- Change environment variables
- Update code
- Fix configuration issues

### Method 1: Automatic (Recommended)

```bash
# Make changes
git add -A
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys
```

### Method 2: Manual Redeploy

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Click "Deployments" tab**
4. **Click "..." on latest deployment**
5. **Click "Redeploy"**
6. **Confirm redeploy**

### Method 3: CLI Redeploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 📝 Part 10: Maintenance Commands

### View Deployment Status

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# List deployments
vercel ls

# View logs
vercel logs [deployment-url]
```

### Rollback Deployment

```bash
# Via CLI
vercel rollback

# Or via Dashboard:
# Deployments → Previous deployment → Promote to Production
```

### Update Environment Variables

```bash
# Via CLI
vercel env add GOOGLE_API_KEY production
vercel env add DATABASE_URL production

# Or via Dashboard:
# Settings → Environment Variables → Edit
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] `vercel.json` configured
- [ ] `api/index.js` exists
- [ ] Build succeeds locally (`npm run build`)
- [ ] Google API key ready
- [ ] Database URL ready

### During Deployment
- [ ] Project imported to Vercel
- [ ] Environment variables added (all 3)
- [ ] Build completed successfully
- [ ] No errors in build logs

### Post-Deployment
- [ ] Health endpoint returns "healthy"
- [ ] Frontend loads correctly
- [ ] Can create agents
- [ ] Can execute agents
- [ ] All features work

### Monitoring
- [ ] Function logs checked
- [ ] Analytics reviewed
- [ ] Alerts configured
- [ ] Custom domain set up (optional)

---

## 🎯 Quick Reference

### Essential URLs

```bash
# Vercel Dashboard
https://vercel.com/dashboard

# Your Deployment
https://your-app-name.vercel.app

# Health Check
https://your-app-name.vercel.app/api/health

# Function Logs
Dashboard → Project → Deployments → Latest → View Function Logs
```

### Essential Commands

```bash
# Local build test
npm run build

# Local production test
npm start

# Deploy via CLI
vercel --prod

# View logs
vercel logs

# Rollback
vercel rollback
```

---

## 🎉 Success Indicators

You'll know deployment is successful when:

1. ✅ **Build Status**: "Ready" with green checkmark
2. ✅ **Health Check**: Returns `{"status": "healthy"}`
3. ✅ **Frontend**: Loads without errors
4. ✅ **API**: All endpoints respond correctly
5. ✅ **Features**: Can create and execute agents
6. ✅ **Logs**: No errors in function logs

---

## 📞 Getting Help

### If You're Stuck

1. **Check function logs** (most issues show here)
2. **Review this guide** (step-by-step)
3. **Check documentation**:
   - [DEPLOYMENT_FIX.md](DEPLOYMENT_FIX.md)
   - [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)
   - [QUICK_FIX.md](QUICK_FIX.md)

### Common Error Messages

| Error | Guide Section |
|-------|---------------|
| "Build failed" | Troubleshooting → Issue 1 |
| "Function invocation failed" | Troubleshooting → Issue 2 |
| "Database connection failed" | Troubleshooting → Issue 3 |
| "404 on API routes" | Troubleshooting → Issue 4 |
| "Blank page" | Troubleshooting → Issue 5 |

---

## 🚀 You're Done!

Your RAJAI Platform is now live on Vercel! 🎉

**Next steps**:
- Share your deployment URL
- Monitor analytics
- Add custom domain
- Scale as needed

**Your deployment URL**: `https://your-app-name.vercel.app`

Congratulations! 🎊
