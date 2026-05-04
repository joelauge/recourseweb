// Slider 0–100 maps log-scale to 1 GB – 1 PB
export function gbFromSlider(v) {
  return Math.round(Math.pow(10, (v / 100) * 6))
}
export function sliderFromGB(gb) {
  return (Math.log10(Math.max(gb, 1)) / 6) * 100
}
// Power-law volume discount: $5/GB at 1 GB, ~$0.50/GB at 1 PB
export function pricePerGB(gb) {
  return Math.max(0.50, 5 * Math.pow(Math.max(gb, 1), -0.25))
}
export function monthlyTotal(gb) {
  return gb * pricePerGB(gb)
}

export function formatStorage(gb) {
  if (gb >= 1_000_000) return `${(gb / 1_048_576).toFixed(2)} PB`
  if (gb >= 1_000) return `${(gb / 1_024).toFixed(gb >= 100_000 ? 0 : 1)} TB`
  return `${gb} GB`
}

export function formatUSD(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  if (n >= 100) return `$${Math.round(n)}`
  return `$${n.toFixed(2)}`
}

export function formatTokens(gb) {
  const tokens = gb * 750_000_000
  if (tokens >= 1e15) return `${(tokens / 1e15).toFixed(1)}Q tokens`
  if (tokens >= 1e12) return `${(tokens / 1e12).toFixed(1)}T tokens`
  if (tokens >= 1e9) return `${(tokens / 1e9).toFixed(1)}B tokens`
  return `${(tokens / 1e6).toFixed(0)}M tokens`
}
