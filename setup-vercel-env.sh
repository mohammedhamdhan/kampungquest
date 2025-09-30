#!/bin/bash

# Script to set up Vercel environment variables
# Run this after logging into Vercel CLI: vercel login

echo "Setting up Vercel environment variables..."

# Backend API keys (for Vercel functions)
vercel env add OPENAI_API_KEY production << EOF
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
EOF

vercel env add DEEPGRAM_API_KEY production << EOF
3d4e7485683a39307311171d3c6f56ba2c24572a
EOF

vercel env add SUPABASE_URL production << EOF
https://zrbgepudooanovmpcxye.supabase.co
EOF

vercel env add SUPABASE_ANON_KEY production << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDMxNjMsImV4cCI6MjA3NDE3OTE2M30.DFeDBHV71JjDX5ggkX3WXlMzTyyWCqA9HJVeCPEKfqg
EOF

vercel env add SUPABASE_SERVICE_ROLE_KEY production << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMzE2MywiZXhwIjoyMDc0MTc5MTYzfQ.sl9mxM9DCyqZxKUkpLwjPLkqDWTKBymViicgN6sLxkY
EOF

# Frontend env vars (VITE_ prefixed)
vercel env add VITE_SUPABASE_URL production << EOF
https://zrbgepudooanovmpcxye.supabase.co
EOF

vercel env add VITE_SUPABASE_ANON_KEY production << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDMxNjMsImV4cCI6MjA3NDE3OTE2M30.DFeDBHV71JjDX5ggkX3WXlMzTyyWCqA9HJVeCPEKfqg
EOF

vercel env add VITE_API_BASE production << EOF
/api
EOF

echo ""
echo "✓ Environment variables added to production"
echo ""
echo "Now adding to preview and development..."

# Also add to preview and development environments
for env in preview development; do
  vercel env add OPENAI_API_KEY $env << EOF
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
EOF

  vercel env add DEEPGRAM_API_KEY $env << EOF
3d4e7485683a39307311171d3c6f56ba2c24572a
EOF

  vercel env add SUPABASE_URL $env << EOF
https://zrbgepudooanovmpcxye.supabase.co
EOF

  vercel env add SUPABASE_ANON_KEY $env << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDMxNjMsImV4cCI6MjA3NDE3OTE2M30.DFeDBHV71JjDX5ggkX3WXlMzTyyWCqA9HJVeCPEKfqg
EOF

  vercel env add SUPABASE_SERVICE_ROLE_KEY $env << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYwMzE2MywiZXhwIjoyMDc0MTc5MTYzfQ.sl9mxM9DCyqZxKUkpLwjPLkqDWTKBymViicgN6sLxkY
EOF

  vercel env add VITE_SUPABASE_URL $env << EOF
https://zrbgepudooanovmpcxye.supabase.co
EOF

  vercel env add VITE_SUPABASE_ANON_KEY $env << EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyYmdlcHVkb29hbm92bXBjeHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDMxNjMsImV4cCI6MjA3NDE3OTE2M30.DFeDBHV71JjDX5ggkX3WXlMzTyyWCqA9HJVeCPEKfqg
EOF

  vercel env add VITE_API_BASE $env << EOF
/api
EOF
done

echo ""
echo "✓ All environment variables configured!"
echo "✓ You can now redeploy: vercel --prod"