import { createClient } from '@supabase/supabase-js';

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
 * يتحقق من الحد اليومي ويُزيد العداد في Supabase.
 * يستخدم UPSERT ذرياً لضمان صحة البيانات في الطلبات المتزامنة.
 * 
 * @param userId   معرف المستخدم (UUID أو hashed IP)
 * @param plan     خطة المستخدم: 'free' | 'pro' | 'school'
 * @returns { allowed: boolean, remaining: number, count: number }
 */
async function checkAndIncrementUsage(userId, plan) {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC
  const limit = (plan === 'pro' || plan === 'school') ? RATE_LIMIT_PRO : RATE_LIMIT_FREE;

  // محاولة إدراج أول طلب اليوم أو زيادة العداد إذا كان السجل موجوداً
  const { data, error } = await supabase.rpc('increment_api_usage', {
    p_user_id:   userId,
    p_date:      today,
    p_plan:      plan,
    p_limit:     limit,
  });

  if (error) {
    // في حالة خطأ في DB، نسمح بالطلب ونُسجّل التحذير (fail open بحذر)
    console.error('[RateLimit] Supabase error, allowing request:', error.message);
    return { allowed: true, remaining: limit - 1, count: 1 };
  }

  // الدالة تُعيد: { allowed, current_count }
  const result = data;
  const remaining = Math.max(0, limit - (result?.current_count ?? 1));
  return {
    allowed:   result?.allowed ?? true,
    remaining,
    count:     result?.current_count ?? 1,
  };
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

  // ── Rate Limiting (Supabase-backed, persistent across cold starts) ───────
  // نستخدم userId من الـ header إذا أرسله العميل (authenticated user)
  // وإلا نستخدم الـ IP كمعرف مجهول
  const clientIp = (req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    ?? req.socket?.remoteAddress
    ?? 'unknown').replace(/[^a-zA-Z0-9.:_-]/g, '');

  const headerUserId = req.headers['x-user-id'];
  const userId = headerUserId || `ip:${clientIp}`;
  const userPlan = await getPlanFromDB(headerUserId);

  let rateLimitResult;
  try {
    rateLimitResult = await checkAndIncrementUsage(userId, userPlan);
  } catch (rlError) {
    console.error('[RateLimit] Fatal error, allowing request:', rlError);
    rateLimitResult = { allowed: true, remaining: 1, count: 1 };
  }

  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
  res.setHeader('X-RateLimit-Used', rateLimitResult.count);

  if (!rateLimitResult.allowed) {
    return res.status(429).json({
      error: 'لقد تجاوزت الحد اليومي للتوليد. قم بالترقية للـ Pro للحصول على 50 طلب يومياً.',
      errorEn: 'Daily generation limit exceeded. Upgrade to Pro for 50 requests/day.',
      retryAfter: '24h',
      plan: userPlan,
    });
  }

  // ── Proxy to Fal.ai ───────────────────────────────────────────────────
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ error: 'image_url is required' });
    }

    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      console.error('[Config] FAL_API_KEY not set in Vercel environment.');
      return res.status(500).json({ error: 'Server misconfiguration: FAL_API_KEY missing' });
    }

    const falResponse = await fetch('https://fal.run/fal-ai/stable-fast-3d', {
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
    return res.status(200).json(data);

  } catch (error) {
    console.error('[Proxy] Unexpected error:', error);
    return res.status(500).json({ error: 'Internal Server Error communicating with Fal AI' });
  }
}
