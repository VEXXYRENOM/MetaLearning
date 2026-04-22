import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- Raw body helper (needed for Vercel serverless) ---
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// --- Paddle Webhook Signature Verification ---
// Paddle sends: Paddle-Signature: ts=TIMESTAMP;h1=HMAC_SHA256
function verifyPaddleSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(';').map(p => p.split('='))
  );
  const ts = parts['ts'];
  const h1 = parts['h1'];
  if (!ts || !h1) return false;

  const signed = `${ts}:${rawBody.toString('utf8')}`;
  const expected = createHmac('sha256', secret).update(signed).digest('hex');
  return expected === h1;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const signatureHeader = req.headers['paddle-signature'];
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!verifyPaddleSignature(rawBody, signatureHeader, webhookSecret)) {
    console.error('Paddle Webhook: Invalid signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const eventType = event.event_type;
  const data = event.data;

  console.log(`Paddle Webhook received: ${eventType}`);

  switch (eventType) {
    // ── New subscription created after checkout ──────────────────────────────
    case 'subscription.created': {
      const userId = data.custom_data?.userId;
      const tier   = data.custom_data?.subscription_tier === 'max' ? 'max' : 'pro';
      const expiresAt = data.current_billing_period?.ends_at ?? null;

      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({
            plan:                    tier,
            subscription_tier:       tier,
            subscription_expires_at: expiresAt,
            paddle_customer_id:      data.customer_id,
            paddle_subscription_id:  data.id,
          })
          .eq('id', userId);

        if (error) console.error('Supabase update error (subscription.created):', error);
      }
      break;
    }

    // ── Subscription renewed / billing period updated ────────────────────────
    case 'subscription.updated': {
      const subscriptionId = data.id;
      const status         = data.status; // 'active' | 'canceled' | 'past_due'
      const expiresAt      = data.current_billing_period?.ends_at ?? null;
      const tier           = data.custom_data?.subscription_tier === 'max' ? 'max' : 'pro';

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('paddle_subscription_id', subscriptionId)
        .single();

      if (profile) {
        const newTier = status === 'active' ? tier : 'free';
        const { error } = await supabase
          .from('profiles')
          .update({
            plan:                    newTier,
            subscription_tier:       newTier,
            subscription_expires_at: status === 'active' ? expiresAt : null,
          })
          .eq('id', profile.id);

        if (error) console.error('Supabase update error (subscription.updated):', error);
      }
      break;
    }

    // ── Subscription canceled ────────────────────────────────────────────────
    case 'subscription.canceled': {
      const subscriptionId = data.id;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('paddle_subscription_id', subscriptionId)
        .single();

      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update({
            plan:                    'free',
            subscription_tier:       'free',
            subscription_expires_at: null,
          })
          .eq('id', profile.id);

        if (error) console.error('Supabase update error (subscription.canceled):', error);
      }
      break;
    }

    default:
      console.log(`Unhandled Paddle event: ${eventType}`);
  }

  res.status(200).json({ received: true });
}
