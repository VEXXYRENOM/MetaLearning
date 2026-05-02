import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ── Constants ─────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://metalearning.app',
  'https://www.metalearning.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const RATE_LIMIT_FREE = 5;   // طلبات/يوم للخطة المجانية
const RATE_LIMIT_PRO  = 50;  // طلبات/يوم للـ Pro

// ── Supabase Admin Client (Service Role — يتجاوز RLS) ──────────────────────
// يُنشأ مرة واحدة لكل instance (Vercel يُعيد استخدام الـ instance بين الطلبات)
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase admin credentials not configured');
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ── Supabase Rate Limiter ─────────────────────────────────────────────────
/**
 * يتحقق من الحد اليومي والساعي باستخدام check_fal_generation_limit RPC
 */
async function checkAndIncrementUsage(userId, plan) {
  const supabase = getSupabaseAdmin();
  
  const hourlyLimit = (plan === 'pro' || plan === 'school') ? 20 : 3;
  const dailyLimit  = (plan === 'pro' || plan === 'school') ? 100 : 10;

  const { data, error } = await supabase.rpc('check_fal_generation_limit', {
    p_user_key:    userId,
    p_plan:        plan,
    p_hourly_limit: hourlyLimit,
    p_daily_limit:  dailyLimit,
  });

  if (error) {
    // Fail-Closed: نرفض الطلب في حال وجود خطأ تقني لحماية الـ API
    console.error('[RateLimit] Supabase error, DENYING request (fail-closed):', error.message);
    return { allowed: false, error: 'Internal validation error', reason: 'db_error' };
  }

  return data;
}

async function getPlanFromDB(userId) {
  if (!userId || userId.startsWith('ip:')) return 'free';
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();
  return data?.plan ?? 'free';
}

// ── Main Handler ──────────────────────────────────────────────────────────
export default async function handler(req, res) {

  // ── CORS ────────────────────────────────────────────────────────────────
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://metalearning.app');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MetaLearning-Client-Secret, X-User-Id, X-User-Plan');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method Not Allowed' });

  // ── Security: Client Secret Header ──────────────────────────────────────
  const serverSecret = process.env.PROXY_CLIENT_SECRET;
  if (serverSecret) {
    const clientSecret = req.headers['x-metalearning-client-secret'];
    if (!clientSecret || clientSecret !== serverSecret) {
      console.warn('[Security] Invalid client secret from origin:', origin);
      return res.status(403).json({ error: 'Unauthorized: invalid client secret' });
    }
  }
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }

    // --- 1. Caching Check ---
    const promptHash = crypto.createHash('md5').update(image_url).digest('hex');
    const supabaseAdmin = getSupabaseAdmin();
    const { data: cachedAsset } = await supabaseAdmin
      .from('generated_assets')
      .select('glb_url')
      .eq('prompt_hash', promptHash)
      .single();
    
    if (cachedAsset && cachedAsset.glb_url) {
      console.log(`[Cache Hit] Returning cached GLB for hash: ${promptHash}`);
      return res.status(200).json({
        cached: true,
        glb_url: cachedAsset.glb_url,
        "3d_model_url": cachedAsset.glb_url
      });
    }

    // --- 2. Rate Limiting (Only if not cached) ---
    const clientIp = (req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      ?? req.socket?.remoteAddress
      ?? 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '');

    const headerUserId = req.headers['x-user-id'];
    // User format: user:<id> for authenticated, ip:<hash> for anonymous
    let userId = 'ip:unknown';
    if (headerUserId) {
      userId = `user:${headerUserId}`;
    } else {
      const ipHash = crypto.createHash('md5').update(clientIp).digest('hex');
      userId = `ip:${ipHash}`;
    }
    const userPlan = await getPlanFromDB(headerUserId);

    let rateLimitResult;
    try {
      rateLimitResult = await checkAndIncrementUsage(userId, userPlan);
    } catch (rlError) {
      console.error('[RateLimit] Fatal error, DENYING request (fail-closed):', rlError);
      rateLimitResult = { allowed: false, reason: 'fatal_error' };
    }

    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', '3600'); // 1 hour
      return res.status(429).json({
        error: 'You have reached your generation limit. Please wait or upgrade.',
        errorEn: 'You have reached your generation limit. Please wait or upgrade.',
        retryAfter: '3600',
        plan: userPlan,
        reason: rateLimitResult.reason
      });
    }

    // --- 3. Proxy to Fal.ai Queue API ---
    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      console.error('[Config] FAL_API_KEY not set in Vercel environment.');
      return res.status(500).json({ error: 'Server misconfiguration: FAL_API_KEY missing' });
    }

    // Using queue.fal.run instead of fal.run for async submission
    const falResponse = await fetch('https://queue.fal.run/fal-ai/stable-fast-3d', {
      method: 'POST',
      headers: {
        'Authorization': falApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url }),
    });

    if (!falResponse.ok) {
      const text = await falResponse.text();
      console.error('[Fal.ai] Error response:', text);
      return res.status(falResponse.status).json({ error: `Fal AI API error: ${text}` });
    }

    const data = await falResponse.json();
    // data contains { request_id, response_url, status_url, cancel_url }
    return res.status(200).json({
      request_id: data.request_id,
      prompt_hash: promptHash, // Send hash to client so it can pass it to status endpoint
      status_url: data.status_url
    });

  } catch (error) {
    console.error('[Proxy] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error communicating with Fal AI' });
  }
}
