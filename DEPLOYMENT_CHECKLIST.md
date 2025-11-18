# 🚀 RAJAI Platform - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [x] All TypeScript errors resolved (0 errors)
- [x] Build successful (`npm run build`)
- [x] No console errors or warnings
- [x] Code follows TypeScript best practices
- [x] All imports properly typed

### 2. Environment Configuration
- [ ] `GOOGLE_API_KEY` set in Vercel
- [ ] `DATABASE_URL` configured with SSL
- [ ] `NODE_ENV=production` set
- [ ] `ALLOWED_ORIGINS` set to production domain
- [ ] Optional variables configured as needed

### 3. Database Setup
- [ ] PostgreSQL database created (Neon recommended)
- [ ] Database schema initialized (`npm run db:push`)
- [ ] Database connection tested
- [ ] SSL mode enabled for production
- [ ] Connection pooling configured

### 4. API Configuration
- [ ] Google Gemini API key valid and active
- [ ] API quota sufficient for expected load
- [ ] Rate limiting configured appropriately
- [ ] CORS origins match deployment domain

### 5. Security
- [ ] Environment variables not committed to Git
- [ ] `.env` file in `.gitignore`
- [ ] API keys rotated if previously exposed
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured (Helmet.js)

## 🔧 Vercel Deployment Steps

### Step 1: Import Repository
1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `rajshah9305/Crewsaisingle`
4. Click "Import"

### Step 2: Configure Project
1. **Framework Preset**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist/client`
4. **Install Command**: `npm ci`
5. **Root Directory**: `./`

### Step 3: Add Environment Variables
Navigate to **Settings → Environment Variables** and add:

```
GOOGLE_API_KEY=your_actual_api_key
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.vercel.app
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
EXECUTION_TIMEOUT_MS=300000
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Note your deployment URL: `https://your-app.vercel.app`

### Step 5: Initialize Database
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
cd Crewsaisingle
vercel link

# Pull environment variables
vercel env pull .env.local

# Initialize database schema
npm run db:push
```

### Step 6: Verify Deployment
1. Visit `https://your-app.vercel.app`
2. Check landing page loads correctly
3. Navigate to `/dashboard`
4. Test health endpoint: `https://your-app.vercel.app/api/health`
5. Create a test agent
6. Execute the agent and verify results

## 🧪 Post-Deployment Testing

### Functional Tests
- [ ] Landing page displays correctly
- [ ] Navigation works between all pages
- [ ] Dashboard shows metrics
- [ ] Agent creation form works
- [ ] Agent execution completes successfully
- [ ] Execution history displays
- [ ] Error handling works gracefully

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Agent execution completes within timeout
- [ ] No memory leaks
- [ ] Database queries optimized

### Security Tests
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] SQL injection prevented
- [ ] XSS protection enabled

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS/Android)

## 🔍 Health Check Verification

### Expected Response
```json
{
  "status": "healthy",
  "timestamp": "2025-11-18T20:00:00.000Z",
  "database": "connected",
  "environment": "production",
  "gemini": "configured"
}
```

### Test Commands
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Create test agent
curl -X POST https://your-app.vercel.app/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "role": "Tester",
    "goal": "Verify deployment",
    "backstory": "Created to test production deployment",
    "tasks": ["Check system health", "Verify API connectivity"]
  }'

# List agents
curl https://your-app.vercel.app/api/agents
```

## 🐛 Troubleshooting

### Build Fails
**Issue**: "Cannot find module @rollup/rollup"
**Solution**: Ensure `vercel.json` uses `"installCommand": "npm ci"`

**Issue**: TypeScript errors during build
**Solution**: Run `npm run check` locally and fix all errors

### Database Connection Fails
**Issue**: "Connection refused" or "SSL required"
**Solution**: 
- Verify `DATABASE_URL` includes `?sslmode=require`
- Check database is accessible from Vercel IPs
- Ensure database credentials are correct

### Agent Creation Fails
**Issue**: "Function invocation failed"
**Solution**:
- Verify database schema is initialized (`npm run db:push`)
- Check `GOOGLE_API_KEY` is valid
- Review Vercel function logs for errors

### API Timeout
**Issue**: 504 Gateway Timeout
**Solution**:
- Increase `EXECUTION_TIMEOUT_MS` if needed
- Check Gemini API quota and limits
- Verify database connection pool settings

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor page views and performance
- Track Core Web Vitals

### Error Tracking
- Check Vercel function logs for errors
- Monitor database connection pool usage
- Review API response times

### Database Monitoring
- Monitor connection count
- Check query performance
- Review slow query logs
- Monitor storage usage

## 🔄 Continuous Deployment

### Automatic Deployments
Vercel automatically deploys on:
- Push to `main` branch
- Pull request creation (preview deployments)
- Manual trigger from dashboard

### Deployment Workflow
1. Push code to GitHub
2. Vercel detects changes
3. Runs build process
4. Deploys to production
5. Previous deployment remains as fallback

### Rollback Procedure
If deployment fails:
1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find last working deployment
4. Click "Promote to Production"

## 🎯 Performance Optimization

### Recommended Settings
- **Node.js Version**: 18.x (latest LTS)
- **Function Timeout**: 60 seconds
- **Function Memory**: 1024 MB
- **Edge Caching**: Enabled for static assets
- **Compression**: Enabled (gzip/brotli)

### Database Optimization
- Use connection pooling (configured)
- Enable query caching where appropriate
- Index frequently queried columns
- Monitor and optimize slow queries

## 📈 Scaling Considerations

### Current Limits
- Vercel Free Tier: 100GB bandwidth/month
- Vercel Pro: 1TB bandwidth/month
- Database: Depends on provider plan

### Scaling Strategies
1. **Horizontal Scaling**: Vercel handles automatically
2. **Database Scaling**: Upgrade Neon plan as needed
3. **API Caching**: Enable response caching
4. **CDN**: Vercel Edge Network (automatic)

## ✅ Final Checklist

Before marking deployment complete:
- [ ] All environment variables set
- [ ] Database schema initialized
- [ ] Health check returns "healthy"
- [ ] Landing page accessible
- [ ] Agent creation works
- [ ] Agent execution completes
- [ ] No console errors
- [ ] HTTPS working
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring enabled
- [ ] Documentation updated
- [ ] Team notified of deployment

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Health endpoint returns 200 OK
2. ✅ All pages load without errors
3. ✅ Agents can be created and executed
4. ✅ Database operations work correctly
5. ✅ Performance meets expectations
6. ✅ Security measures active
7. ✅ No critical errors in logs

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Production URL**: _________________

**Notes**: _________________
