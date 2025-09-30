# Vercel Environment Variables Setup

## Method 1: Via Vercel Dashboard (Recommended - Easiest)

1. Go to https://vercel.com/dashboard
2. Click on your **kampungquest** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below (click "Add" for each one)

### Variables to Add:

**For all environments (Production, Preview, Development):**

```
OPENAI_API_KEY
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

DEEPGRAM_API_KEY
3d4e7485683a39307311171d3c6f56ba2c24572a

SUPABASE_URL
https://zrbgepudooanovmpcxye.supabase.co

SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDMxNjMsImV4cCI6MjA3NDE3OTE2M30.DFeDBHV71JjDX5ggkX3WXlMzTyyWCqA9HJVeCPEKfqg

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMzE2MywiZXhwIjoyMDc0MTc5MTYzfQ.sl9mxM9DCyqZxKUkpLwjPLkqDWTKBymViicgN6sLxkY

VITE_SUPABASE_URL
https://zrbgepudooanovmpcxye.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDMxNjMsImV4cCI6MjA3NDE3OTE2M30.DFeDBHV71JjDX5ggkX3WXlMzTyyWCqA9HJVeCPEKfqg

VITE_API_BASE
/api
```

**For each variable:**
1. Click **Add New**
2. Enter the **Name** (e.g., `OPENAI_API_KEY`)
3. Paste the **Value**
4. Select all three environments: ✅ Production ✅ Preview ✅ Development
5. Click **Save**

### After Adding All Variables:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the failed deployment
3. Click **Redeploy**

OR just push a new commit and it will auto-deploy.

---

## Method 2: Via CLI (Alternative)

If you prefer using the command line:

```bash
# Make sure you're logged in
vercel login

# Run the setup script
./setup-vercel-env.sh
```

---

## Verify Setup

After adding variables, you can verify by:

1. Go to **Settings** → **Environment Variables**
2. You should see 8 variables listed
3. Each should be available in all 3 environments

Then redeploy and it should work! 🚀