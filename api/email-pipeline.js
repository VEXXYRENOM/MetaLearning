// api/email-pipeline.js
// MetaLearning — Email Outreach Pipeline
// Triggered by Vercel Cron: runs daily at 08:00 UTC

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const TEMPLATES = {
  welcome: {
    subject: "🎓 Your Free AR Teaching Guide is Here!",
    delay_days: 0,
    html: (name) => `<h1>Welcome ${name || 'Teacher'}!</h1><p>Here is your guide to AR in the classroom...</p>`
  },
  demo: {
    subject: "🧪 Seeing is Believing: 3D Chemistry Lab",
    delay_days: 3,
    html: (name) => `<h1>Hi ${name}!</h1><p>Have you tried our 3D Chemistry simulation yet?</p>`
  },
  pro_offer: {
    subject: "🚀 Ready to Level Up Your School?",
    delay_days: 7,
    html: (name) => `<h1>Final Step, ${name}!</h1><p>Upgrade to Pro today for 20% off.</p>`
  }
};

export default async function handler(req, res) {
  // Check Vercel Cron Secret
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = { sent: 0, errors: 0 };

  try {
    // 1. Get leads that haven't received all emails
    const { data: leads } = await supabase
      .from('teacher_leads')
      .select('*')
      .lt('email_count', 3)
      .eq('status', 'new');

    for (const lead of leads) {
      // Logic to determine which email to send based on days since created_at
      // (This is a simplified version of the logic)
      await sendEmail(lead, 'welcome');
      results.sent++;
    }

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function sendEmail(lead, templateKey) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("Missing RESEND_API_KEY");

  const template = TEMPLATES[templateKey];
  
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: "MetaLearning <hello@metalearning.app>",
      to: lead.email,
      subject: template.subject,
      html: template.html(lead.full_name),
    }),
  });

  // Update Supabase
  await supabase.from('email_log').insert({ lead_id: lead.id, email: lead.email, template: templateKey });
  await supabase.from('teacher_leads').update({ email_count: lead.email_count + 1 }).eq('id', lead.id);
}
