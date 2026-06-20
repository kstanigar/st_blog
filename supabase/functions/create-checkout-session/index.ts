import Stripe from 'npm:stripe';
import { createClient } from 'npm:@supabase/supabase-js';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { product_id, price_id } = await req.json();
  if (!product_id || !price_id) {
    return new Response(JSON.stringify({ error: 'Missing product_id or price_id' }), { status: 400 });
  }

  const origin = req.headers.get('origin') ?? 'https://your-domain.com';

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: [{ price: price_id, quantity: 1 }],
      metadata: { user_id: user.id, product_id },
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/`,
    },
    { idempotencyKey: crypto.randomUUID() },
  );

  return new Response(JSON.stringify({ url: session.url }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
