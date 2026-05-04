import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from the parent directory's .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { storageGB, monthlyPriceCents } = req.body;

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
      return_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 KnowDrive API running at http://localhost:${PORT}`);
});
