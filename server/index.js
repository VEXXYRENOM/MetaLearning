import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'https://metalearning.app',
  'https://www.metalearning.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Middleware
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' })); // Allow large base64 images

app.post('/api/fal/generate-3d', async (req, res) => {
  try {
    const { image_url } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }

    const falApiKey = process.env.FAL_API_KEY;
    
    if (!falApiKey) {
      console.error("FAL_API_KEY is not defined in .env");
      return res.status(500).json({ error: 'FAL_API_KEY is not configured on the server' });
    }

    const falResponse = await fetch('https://fal.run/fal-ai/stable-fast-3d', {
      method: "POST",
      headers: {
        "Authorization": falApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image_url })
    });

    if (!falResponse.ok) {
      const text = await falResponse.text();
      console.error("Fal AI Error:", text);
      return res.status(falResponse.status).json({ error: `Fal AI API error: ${text}` });
    }

    const json = await falResponse.json();
    res.json(json);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Internal Server Error while communicating with Fal AI' });
  }
});

app.listen(PORT, () => {
  console.log(`[API Proxy] Server running on http://localhost:${PORT}`);
  console.log(`[API Proxy] Loaded FAL_API_KEY: ${process.env.FAL_API_KEY ? 'Yes' : 'No'}`);
});
