import { loadStripe } from '@stripe/stripe-js'

let stripePromise = null

function getStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!key) return null
  if (!stripePromise) stripePromise = loadStripe(key)
  return stripePromise
}

export async function handleCheckout(storageGB, monthlyPriceCents) {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!key) return { error: 'NOT_CONFIGURED' }

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    const res = await fetch(`${apiBase}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storageGB, monthlyPriceCents }),
    })
    if (!res.ok) throw new Error('Server error')
    const data = await res.json()
    if (data.error) throw new Error(data.error)

    return { clientSecret: data.clientSecret }
  } catch (err) {
    return { error: err.message }
  }
}
