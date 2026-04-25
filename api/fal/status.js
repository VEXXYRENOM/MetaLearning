import { createClient } from '@supabase/supabase-js';

const ALLOWED_ORIGINS = [
  'https://metalearning.app',
  'https://www.metalearning.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin credentials not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(req, res) {
  // --- CORS ---
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://metalearning.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-MetaLearning-Client-Secret');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  // --- Security ---
  const serverSecret = process.env.PROXY_CLIENT_SECRET;
  if (serverSecret) {
    const clientSecret = req.headers['x-metalearning-client-secret'];
    if (!clientSecret || clientSecret !== serverSecret) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
  }

  const { status_url, prompt_hash } = req.query;
  if (!status_url) return res.status(400).json({ error: 'status_url is required' });

  const falApiKey = process.env.FAL_API_KEY;
  if (!falApiKey) return res.status(500).json({ error: 'FAL_API_KEY missing' });

  try {
    // Poll Fal.ai
    const falRes = await fetch(status_url, {
      method: 'GET',
      headers: { 'Authorization': falApiKey }
    });

    if (!falRes.ok) {
      const text = await falRes.text();
      return res.status(falRes.status).json({ error: text });
    }

    const data = await falRes.json();
    
    // If completed, cache the result to Supabase Storage!
    if (data.status === 'COMPLETED' && data.payload) {
      const payload = data.payload;
      const modelUrl = payload.model_url ?? payload.url ?? payload.model ?? payload['3d_model_url'] ?? payload.glb_url;
      
      if (modelUrl && prompt_hash) {
        try {
          console.log(`[Cache] Downloading GLB from Fal.ai: ${modelUrl}`);
          const glbRes = await fetch(modelUrl);
          const glbBuffer = await glbRes.arrayBuffer();
          
          const supabase = getSupabaseAdmin();
          const fileName = `${prompt_hash}.glb`;
          
          console.log(`[Cache] Uploading ${fileName} to Supabase Storage...`);
          // Note: ensure 'models' bucket exists in Supabase Storage and is public
          const { error: uploadError } = await supabase.storage
            .from('models')
            .upload(fileName, glbBuffer, {
              contentType: 'model/gltf-binary',
              upsert: true
            });
            
          if (uploadError) {
            console.error('[Cache] Storage upload failed:', uploadError);
            // Fallback to original URL if storage fails
            payload.glb_url = modelUrl;
          } else {
            const { data: publicUrlData } = supabase.storage.from('models').getPublicUrl(fileName);
            const supabaseCdnUrl = publicUrlData.publicUrl;
            payload.glb_url = supabaseCdnUrl;
            
            // Save to DB Cache
            await supabase.from('generated_assets').upsert({
              prompt_hash: prompt_hash,
              glb_url: supabaseCdnUrl,
              original_prompt: 'image_url' // We only have the hash here
            });
            console.log(`[Cache] Successfully cached to Supabase: ${supabaseCdnUrl}`);
          }
        } catch (cacheErr) {
          console.error('[Cache] Failed to process cache:', cacheErr);
          payload.glb_url = modelUrl; // Fallback
        }
      }
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('[Proxy] Status check error:', error);
    return res.status(500).json({ error: 'Internal server error checking status' });
  }
}
