const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Register TypeScript support
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
  }
});

app.use(cors());

// Parse JSON bodies for all routes except uploadMedia
app.use((req, res, next) => {
  if (req.path === '/api/uploadMedia') {
    return next();
  }
  express.json()(req, res, next);
});

// Import API handlers - now using ts-node
const createHandler = (modulePath) => async (req, res) => {
  try {
    const module = require(modulePath);
    const handler = module.default;
    await handler(req, res);
  } catch (error) {
    console.error(`Error in ${modulePath}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Route API calls to the real Vercel functions
app.post('/api/uploadMedia', createHandler('./api/uploadMedia.ts'));
app.post('/api/transcribe', createHandler('./api/transcribe.ts'));
app.post('/api/ensurePair', createHandler('./api/ensurePair.ts'));
app.post('/api/saveTile', createHandler('./api/saveTile.ts'));
app.get('/api/listTiles', createHandler('./api/listTiles.ts'));
app.post('/api/summarise', createHandler('./api/summarise.ts'));

app.listen(port, () => {
  console.log(`Development API server running at http://localhost:${port}`);
  console.log('Environment variables loaded:', {
    DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY ? '***configured***' : 'not found',
    SUPABASE_URL: process.env.SUPABASE_URL ? '***configured***' : 'not found'
  });
});