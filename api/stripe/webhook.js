import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← مفتاح Service Role (ليس Anon)
);

// Note: body parsing is handled manually via getRawBody() below

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.subscription_tier === 'max' ? 'max' : 'pro';
      if (userId && session.subscription) {
        // Fetch real expiration from Stripe
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        await supabase
          .from('profiles')
          .update({
            plan:                   tier,
            subscription_tier:      tier,
            subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id:      session.customer,
            stripe_subscription_id:  session.subscription,
          })
          .eq('id', userId);
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        // Fetch real expiration from Stripe
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        
        // Find user by subscription ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, subscription_tier')
          .eq('stripe_subscription_id', invoice.subscription)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
              // Ensure tier remains aligned (optional double-check)
              plan: profile.subscription_tier,
            })
            .eq('id', profile.id);
        }
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();
      if (profile) {
        await supabase
          .from('profiles')
          .update({
            plan:                    'free',
            subscription_tier:       'free',
            subscription_expires_at: null,
          })
          .eq('id', profile.id);
      }
      break;
    }
  }

  res.json({ received: true });
}
