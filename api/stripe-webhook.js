import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const buf = req.rawBody; // ⭐ FIXED

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email;
    const businessName = session.metadata?.businessName || 'New Client';

    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: Math.random().toString(36).slice(-8),
    });

    if (authError) {
      console.error('Auth Error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    const { error: insertError } = await supabase
      .from('clients')
      .insert({ user_id: user.id, business_name: businessName });

    if (insertError) {
      console.error('Insert Error:', insertError.message);
      return res.status(400).json({ error: insertError.message });
    }
  }

  res.status(200).json({ received: true });
}
