import Stripe from 'stripe';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/create-checkout-session') {
      try {
        if (!env.STRIPE_SECRET_KEY) {
          throw new Error('STRIPE_SECRET_KEY is not defined in the Worker environment.');
        }

        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
          httpClient: Stripe.createFetchHttpClient(),
        });
        
        const body = await request.json();
        const { storageGB, monthlyPriceCents } = body;

        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded_page',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `KnowDrive - ${storageGB} GB Plan`,
                  description: 'Unlimited context storage for AI agents',
                },
                unit_amount: monthlyPriceCents,
                recurring: {
                  interval: 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          // Note: In production, you'll update this to your actual GitHub Pages URL
          return_url: `${env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        console.error('Stripe Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};
