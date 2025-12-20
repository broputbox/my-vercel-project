import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details.email;
    const businessName = session.metadata.businessName || 'New Client'; // add metadata in checkout

    // Create user in Supabase Auth
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: Math.random().toString(36).slice(-8), // temp password or use magic link
    });

    if (authError) return res.status(400).json({ error: authError });

    // Create client row
    await supabase.from('clients').insert({ user_id: user.user.id, business_name: businessName });

    // Send welcome email with login link (use SendGrid or Supabase magic link)
    // supabase.auth.signInWithOtp({ email }) for passwordless

    // Optional: Send unique webhook URL
  }

  res.json({ received: true });
};
