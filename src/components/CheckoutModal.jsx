import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { LogoSVG } from './Icons';

// Initialize Stripe with the publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutModal({ isOpen, onClose, clientSecret }) {
  if (!isOpen || !clientSecret) return null;

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-container" onClick={e => e.stopPropagation()}>
        <button className="checkout-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="checkout-header">
          <LogoSVG height={32} />
          <h2>KnowDrive — Unlimited Context Window for LLMs</h2>
          <div className="checkout-separator"></div>
        </div>

        <div className="checkout-body">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}
