# ⚡ Vercel Deployment - Quick Start (5 Minutes)

## 🎯 Super Fast Deployment

### Step 1: Push to GitHub (30 seconds)

```bash
git add -A
git commit -m "Deploy to Vercel"
git push origin main
```

---

### Step 2: Import to Vercel (1 minute)

1. Go to: https://vercel.com/new
2. Click "Import" next to your repository
3. **Don't change any settings** (vercel.json handles it)

---

### Step 3: Add Environment Variables (2 minutes)

Before clicking "Deploy", add these 3 variables:

```
Name: GOOGLE_API_KEY
Value: [Your API key from https://makersuite.google.com/app/apikey]
Environments: ✅ Production ✅ Preview ✅ Development

Name: DATABASE_URL  
Value: [Your database URL from https://neon.tech]
Environments: ✅ Production ✅ Preview ✅ Development

Name: NODE_ENV
Value: production
Environments: ✅ Production only
```

---

### Step 4: Deploy (1 minute)

1. Click "Deploy" button
2. Wait for build (1-2 minutes)
3. Click "Visit" when ready

---

### Step 5: Verify (30 seconds)

Test your deployment:

```bash
# Replace with your actual URL
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "gemini": "configured"
}
```

---

## ✅ Done!

Your app is live at: `https://your-app-name.vercel.app`

---

## 🐛 If Something Goes Wrong

### Build Failed?
```bash
# Test locally first
npm run build

# Fix errors, then push
git add -A && git commit -m "Fix build" && git push
```

### Function Invocation Failed?
- Check environment variables are set correctly
- Go to: Dashboard → Settings → Environment Variables
- Verify all 3 variables exist

### Database Error?
```bash
# Test database connection
psql "$DATABASE_URL" -c "SELECT 1"

# Initialize database
npm run db:push
```

---

## 📚 Need More Help?

See detailed guide: [VERCEL_DEPLOYMENT_STEPS.md](VERCEL_DEPLOYMENT_STEPS.md)

---

## 🎯 Command Cheat Sheet

```bash
# Local testing
npm run build          # Build for production
npm start              # Test production build
npm run check          # Check TypeScript

# Vercel CLI (optional)
npm install -g vercel  # Install CLI
vercel login           # Login
vercel --prod          # Deploy
vercel logs            # View logs
vercel rollback        # Rollback deployment

# Database
npm run db:push        # Initialize database
npm run validate       # Validate environment

# Git
git status             # Check status
git add -A             # Stage all changes
git commit -m "msg"    # Commit
git push origin main   # Push to GitHub (auto-deploys)
```

---

## 🔗 Quick Links

| Link | URL |
|------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Import Project | https://vercel.com/new |
| Google API Key | https://makersuite.google.com/app/apikey |
| Neon Database | https://neon.tech |
| GitHub Repo | https://github.com/rajshah9305/Crewsaisingle |

---

## ⚡ One-Command Deploy (After Setup)

```bash
git add -A && git commit -m "Update" && git push origin main
```

Vercel automatically deploys on push! 🚀
