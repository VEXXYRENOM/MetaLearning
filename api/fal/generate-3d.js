export default async function handler(req, res) {
  // Allow OPTIONS request for CORS preflight if needed
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Only allow POST requests for the proxy
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image_url } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }

    // Access the secure environment variable provided by Vercel
    const falApiKey = process.env.FAL_API_KEY;
    
    if (!falApiKey) {
      console.error("FAL_API_KEY is not defined in Vercel environment variables.");
      return res.status(500).json({ error: 'FAL_API_KEY is not configured on the server' });
    }

    // Proxy the request directly to Fal.run
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

    const data = await falResponse.json();
    
    // Add favorable CORS headers for safety
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);

  } catch (error) {
    console.error("Vercel Proxy Error:", error);
    return res.status(500).json({ error: 'Internal Server Error while communicating with Fal AI' });
  }
}
