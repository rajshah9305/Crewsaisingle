# 🚨 URGENT FIX: Server Error - Function Invocation Failed

## Where Are You Seeing This Error?

### ✅ If on Vercel/Production Deployment

The error occurs because **environment variables are not configured in Vercel**.

#### Immediate Fix (5 minutes):

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `Crewsaisingle`

2. **Navigate to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add Required Variables**

   Add these three variables:

   **Variable 1: GOOGLE_API_KEY**
   - Name: `GOOGLE_API_KEY`
   - Value: Your Google API key (get from https://makersuite.google.com/app/apikey)
   - Environment: Production, Preview, Development (check all)

   **Variable 2: DATABASE_URL**
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string (get from https://neon.tech)
   - Environment: Production, Preview, Development (check all)

   **Variable 3: NODE_ENV**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environment: Production, Preview, Development (check all)

4. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

5. **Test**
   - Visit your Vercel URL
   - Try creating an agent
   - Should work now! ✅

---

### ✅ If Running Locally

The error occurs because your `.env` file has placeholder values.

#### Quick Fix:

**Step 1: Get Google API Key (2 minutes)**

```bash
# Open this URL in your browser:
https://makersuite.google.com/app/apikey

# Steps:
# 1. Sign in with Google
# 2. Click "Create API Key"
# 3. Copy the key (starts with AIza...)
```

**Step 2: Get Free Database (3 minutes)**

```bash
# Open this URL in your browser:
https://neon.tech

# Steps:
# 1. Sign up (free, no credit card)
# 2. Create a new project
# 3. Copy the connection string
#    (looks like: postgresql://username:password@ep-xxx.neon.tech/neondb)
```

**Step 3: Update .env File**

```bash
# Edit the .env file
nano .env
```

Replace these lines with your actual values:

```env
# Replace with YOUR actual Google API key
GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Replace with YOUR actual database URL
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb

# Keep this as is for local development
NODE_ENV=development
```

**Step 4: Initialize Database**

```bash
npm run db:push
```

**Step 5: Start Server**

```bash
npm run dev
```

**Step 6: Test**

Open http://localhost:5001 and try creating an agent.

---

## 🔍 Detailed Troubleshooting

### Error: "Invalid API Key" or "API key not configured"

**Cause**: Google API key is missing or invalid

**Fix**:
1. Verify your API key is correct (no extra spaces)
2. Check that Gemini API is enabled
3. Try creating a new API key
4. Make sure you copied the entire key

**Test your API key**:
```bash
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY"
```

---

### Error: "Database connection failed" or "DATABASE_URL not set"

**Cause**: Database URL is missing or invalid

**Fix**:
1. Verify your database URL is correct
2. Check that the database is accessible
3. For Neon: Make sure you're using the correct connection string
4. Test the connection

**Test your database connection**:
```bash
# If you have psql installed
psql "YOUR_DATABASE_URL" -c "SELECT 1"
```

---

### Error: "Function invocation failed" on Vercel

**Cause**: Environment variables not set in Vercel dashboard

**Fix**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all three required variables (see above)
3. Make sure to select all environments (Production, Preview, Development)
4. Redeploy the application

**Important**: After adding environment variables, you MUST redeploy for changes to take effect.

---

## 📋 Verification Checklist

### For Local Development:

- [ ] `.env` file exists in project root
- [ ] `GOOGLE_API_KEY` is set to actual API key (not placeholder)
- [ ] `DATABASE_URL` is set to actual database URL (not placeholder)
- [ ] `NODE_ENV` is set to `development`
- [ ] Database schema is initialized (`npm run db:push`)
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health endpoint returns "healthy" (http://localhost:5001/api/health)

### For Vercel Deployment:

- [ ] Environment variables added in Vercel dashboard
- [ ] All three variables configured (GOOGLE_API_KEY, DATABASE_URL, NODE_ENV)
- [ ] Variables are set for all environments
- [ ] Application has been redeployed after adding variables
- [ ] Deployment shows "Ready" status
- [ ] Health endpoint returns "healthy" (https://your-app.vercel.app/api/health)

---

## 🎯 Step-by-Step: Complete Setup

### For Vercel (Production):

```bash
# 1. Get Google API Key
# Visit: https://makersuite.google.com/app/apikey
# Copy your API key

# 2. Get Neon Database
# Visit: https://neon.tech
# Create project and copy connection string

# 3. Configure Vercel
# Go to: https://vercel.com/dashboard
# Your Project → Settings → Environment Variables
# Add:
#   GOOGLE_API_KEY = your_api_key
#   DATABASE_URL = your_database_url
#   NODE_ENV = production

# 4. Initialize Database (one-time)
# In your local terminal:
export DATABASE_URL="your_neon_database_url"
npm run db:push

# 5. Redeploy on Vercel
# Deployments → Latest → Redeploy

# 6. Test
# Visit your Vercel URL and create an agent
```

### For Local Development:

```bash
# 1. Clone repository (if not already done)
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle

# 2. Install dependencies
npm install

# 3. Get credentials
# Google API Key: https://makersuite.google.com/app/apikey
# Neon Database: https://neon.tech

# 4. Configure environment
cp .env.example .env
nano .env  # Update with your actual credentials

# 5. Initialize database
npm run db:push

# 6. Start server
npm run dev

# 7. Test
# Open http://localhost:5001
```

---

## 🆘 Still Not Working?

### Check Server Logs

**On Vercel:**
1. Go to your project dashboard
2. Click "Deployments"
3. Click on the latest deployment
4. Click "View Function Logs"
5. Look for error messages

**Locally:**
```bash
npm run dev
# Look for error messages in the terminal
```

### Common Error Messages and Fixes:

| Error Message | Cause | Fix |
|--------------|-------|-----|
| "DATABASE_URL environment variable is not set" | Missing database URL | Add DATABASE_URL to .env or Vercel |
| "Invalid or missing Google API key" | Missing/invalid API key | Add valid GOOGLE_API_KEY |
| "Failed to connect to database" | Database not accessible | Check database URL and network |
| "Function invocation failed" | Environment vars not set | Add all required env vars and redeploy |
| "Execution timed out" | Long-running operation | Normal for first execution, wait longer |

---

## 📞 Get Help

### Quick Links:
- **Google API Key**: https://makersuite.google.com/app/apikey
- **Neon Database**: https://neon.tech
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Quick Fix**: [QUICK_FIX.md](QUICK_FIX.md)

### Troubleshooting Commands:

```bash
# Check if environment variables are set
npm run validate

# Test health endpoint
curl http://localhost:5001/api/health

# Check database connection
psql "$DATABASE_URL" -c "SELECT 1"

# View server logs
npm run dev

# Test API endpoint
curl -X POST http://localhost:5001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "role": "Developer",
    "goal": "Test the system",
    "backstory": "Testing",
    "tasks": ["Test task"]
  }'
```

---

## ✅ Success Indicators

You'll know it's working when:

1. **Health Check Returns Healthy**:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "gemini": "configured"
   }
   ```

2. **Agent Creation Succeeds**:
   - Returns HTTP 201
   - Agent appears in the list
   - No error messages

3. **Agent Execution Works**:
   - Returns HTTP 202
   - Execution appears in history
   - Results are generated

---

## 🎉 After Fixing

Once configured correctly:
- ✅ Create agents without errors
- ✅ Execute tasks successfully
- ✅ View execution results
- ✅ All features work properly

---

**Need immediate help?** The issue is almost always missing or incorrect environment variables. Double-check your configuration!
