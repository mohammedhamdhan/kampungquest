# Set Root Directory in Vercel

## Quick Fix: Set Root Directory to `web`

Instead of configuring complex paths, just tell Vercel your app is in the `/web` folder:

### Steps:

1. Go to https://vercel.com/dashboard
2. Click on your **kampungquest** project
3. Go to **Settings** → **General**
4. Scroll down to **Root Directory**
5. Click **Edit**
6. Enter: `web`
7. Click **Save**

### Then:
1. Go to **Deployments**
2. Click **Redeploy** on the latest deployment

OR just commit the updated `vercel.json` and push:

```bash
git add vercel.json
git commit -m "Set root directory to web in vercel.json"
git push
```

---

## What This Does:

- Vercel will now treat `/web` as the root
- Build command becomes simpler: `npm run build`
- Output directory: `dist` (relative to `/web`)
- API routes: `/web/api` → `/api`

This is the cleanest solution! ✨