# 🔧 Vercel Build Errors - Solutions

## Error: "Function Runtimes must have a valid version"

### Full Error Message
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

### Cause
Invalid `runtime` specification in `vercel.json`. Vercel's newer format doesn't use `runtime: "nodejs20.x"`.

### Solution ✅

**Fixed vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist/client",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

**What was removed**:
- ❌ `"version": 2` - Not needed in new format
- ❌ `"runtime": "nodejs20.x"` - Vercel auto-detects from package.json
- ❌ `"regions": ["iad1"]` - Vercel handles automatically
- ❌ `"env": {"NODE_ENV": "production"}` - Set in dashboard instead

**What was kept**:
- ✅ `buildCommand` - How to build
- ✅ `installCommand` - How to install dependencies
- ✅ `outputDirectory` - Where static files are
- ✅ `rewrites` - API routing
- ✅ `functions.maxDuration` - Function timeout
- ✅ `functions.memory` - Function memory

### How Vercel Detects Node.js Version

Vercel automatically detects Node.js version from:

1. **package.json** `engines` field:
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **.nvmrc** file:
   ```
   20
   ```

3. **.node-version** file:
   ```
   20.0.0
   ```

4. **Default**: Uses latest LTS if not specified

### Verification

After pushing the fix:

1. **Vercel will auto-redeploy** (if connected to GitHub)
2. **Or manually redeploy**:
   - Go to Vercel Dashboard
   - Deployments → Latest → Redeploy

3. **Build should succeed** with:
   ```
   ✅ Build completed successfully
   ```

---

## Other Common Vercel Build Errors

### Error: "Build command failed"

**Symptoms**:
```
Error: Command "npm run build" exited with 1
```

**Causes & Solutions**:

#### 1. TypeScript Errors

**Check**:
```bash
npm run check
```

**Fix**:
```bash
# Fix TypeScript errors in your code
# Then push
git add -A
git commit -m "Fix TypeScript errors"
git push origin main
```

#### 2. Missing Dependencies

**Check**:
```bash
npm install
npm run build
```

**Fix**:
```bash
# Update package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

#### 3. Environment Variables Not Set

**Check**: Build logs for errors like:
```
DATABASE_URL environment variable is not set
```

**Fix**:
- Go to Vercel Dashboard
- Settings → Environment Variables
- Add missing variables
- Redeploy

---

### Error: "Cannot find module"

**Symptoms**:
```
Error: Cannot find module '../dist/index.js'
```

**Cause**: Build didn't create expected output files

**Fix**:

1. **Check build script in package.json**:
   ```json
   {
     "scripts": {
       "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js"
     }
   }
   ```

2. **Verify build output locally**:
   ```bash
   npm run build
   ls -la dist/index.js
   ls -la dist/client/
   ```

3. **Check vercel.json**:
   ```json
   {
     "outputDirectory": "dist/client"
   }
   ```

4. **Push fix**:
   ```bash
   git add -A
   git commit -m "Fix build output"
   git push origin main
   ```

---

### Error: "Output directory not found"

**Symptoms**:
```
Error: Output directory "dist/client" not found
```

**Cause**: Build didn't create the output directory

**Fix**:

1. **Check vite.config.ts**:
   ```typescript
   export default defineConfig({
     build: {
       outDir: path.resolve(__dirname, "dist/client")
     }
   })
   ```

2. **Test build locally**:
   ```bash
   npm run build
   ls -la dist/client/
   ```

3. **Verify vercel.json matches**:
   ```json
   {
     "outputDirectory": "dist/client"
   }
   ```

---

### Error: "Function size limit exceeded"

**Symptoms**:
```
Error: Serverless Function size is 51 MB, max is 50 MB
```

**Cause**: Backend bundle too large

**Solutions**:

1. **Use external packages** (don't bundle node_modules):
   ```bash
   # In package.json build script
   esbuild server/index.ts --packages=external
   ```

2. **Remove unused dependencies**:
   ```bash
   npm prune
   ```

3. **Check for large files**:
   ```bash
   du -sh dist/index.js
   ```

---

### Error: "Invalid configuration"

**Symptoms**:
```
Error: Invalid vercel.json configuration
```

**Cause**: Syntax error in vercel.json

**Fix**:

1. **Validate JSON**:
   ```bash
   cat vercel.json | jq .
   ```

2. **Check for**:
   - Missing commas
   - Extra commas
   - Unclosed brackets
   - Invalid property names

3. **Use minimal valid config**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist/client"
   }
   ```

---

## Debugging Build Issues

### View Build Logs

1. **Go to Vercel Dashboard**
2. **Click your project**
3. **Click "Deployments"**
4. **Click on failed deployment**
5. **View "Build Logs"**

### Test Build Locally

```bash
# Clean build
rm -rf dist/ node_modules/
npm install
npm run build

# Check output
ls -la dist/
ls -la dist/client/
ls -la dist/index.js

# Test production
npm start
curl http://localhost:5001/api/health
```

### Check Configuration Files

```bash
# Verify vercel.json
cat vercel.json

# Verify package.json scripts
cat package.json | grep -A 5 '"scripts"'

# Verify vite.config.ts
cat vite.config.ts | grep -A 5 'build'
```

---

## Prevention Checklist

Before deploying to Vercel:

- [ ] `npm run build` succeeds locally
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `dist/client/` directory created
- [ ] `dist/index.js` file created
- [ ] `api/index.js` exists
- [ ] `vercel.json` is valid JSON
- [ ] Environment variables documented
- [ ] No syntax errors in code

---

## Quick Fix Commands

```bash
# Fix and redeploy
git add -A
git commit -m "Fix build error"
git push origin main

# Test locally first
npm run build && npm start

# Validate configuration
cat vercel.json | jq .

# Check TypeScript
npm run check

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Getting Help

### Check These First

1. **Build logs** - Most errors show here
2. **Function logs** - For runtime errors
3. **This guide** - Common solutions
4. **Vercel docs** - https://vercel.com/docs

### Error Message Lookup

| Error | Section |
|-------|---------|
| "Function Runtimes must have a valid version" | Top of this file |
| "Build command failed" | TypeScript/Dependencies |
| "Cannot find module" | Build Output |
| "Output directory not found" | Build Configuration |
| "Function size limit exceeded" | Bundle Size |
| "Invalid configuration" | JSON Syntax |

---

## Summary

**Most common fix**: Remove invalid `runtime` specification from `vercel.json`

**Current working config**:
```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist/client",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

**Vercel auto-detects**:
- Node.js version from package.json
- Regions based on your account
- Environment from dashboard settings

**Result**: Clean, simple configuration that works! ✅
