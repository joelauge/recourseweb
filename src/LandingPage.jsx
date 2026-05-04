import React, { useState, useEffect, useRef, useCallback } from 'react'
import './styles/landing.css'
import { handleCheckout } from './stripe.js'
import CheckoutModal from './components/CheckoutModal'
import WaitlistModal from './components/WaitlistModal/WaitlistModal'
import knowdriveLogoSrc from '../assets/knowdrive_white_logo_notext.svg'
import homeVideo from '../assets/knowdrive_home.mp4'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 5.886 3 3 0 1 0 5.174 2.688 3 3 0 1 0 5.658 0 3 3 0 1 0 5.174-2.688 4 4 0 0 0 .52-5.886 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5z" />
      <path d="M9 13a4.5 4.5 0 0 0 3 3 4.5 4.5 0 0 0 3-3" />
      <path d="M12 8.5V16" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function BotIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

function ScaleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h18" />
    </svg>
  )
}

function DnaIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 18 8-12" />
      <path d="m8 6 8 12" />
      <path d="M11 11h2" />
      <path d="M9 16h6" />
      <path d="M13 6h3" />
      <path d="M11 18H8" />
      <path d="M15 8h2" />
      <path d="M10 6H8" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
    </svg>
  )
}

function CpuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  )
}

function GraduationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}

/* ─── Pricing math ──────────────────────────────────────────── */
// Slider 0–100 maps log-scale to 1 GB – 1 PB
function gbFromSlider(v) {
  return Math.round(Math.pow(10, (v / 100) * 6))
}
function sliderFromGB(gb) {
  return (Math.log10(Math.max(gb, 1)) / 6) * 100
}
// Power-law volume discount: $5/GB at 1 GB, ~$0.50/GB at 1 PB
function pricePerGB(gb) {
  return Math.max(0.50, 5 * Math.pow(Math.max(gb, 1), -0.25))
}
function monthlyTotal(gb) {
  return gb * pricePerGB(gb)
}

function formatStorage(gb) {
  if (gb >= 1_000_000) return `${(gb / 1_048_576).toFixed(2)} PB`
  if (gb >= 1_000) return `${(gb / 1_024).toFixed(gb >= 100_000 ? 0 : 1)} TB`
  return `${gb} GB`
}

function formatUSD(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  if (n >= 100) return `$${Math.round(n)}`
  return `$${n.toFixed(2)}`
}

function formatTokens(gb) {
  // ~750 tokens per KB, so ~750,000 tokens per MB, ~750M tokens per GB
  const tokens = gb * 750_000_000
  if (tokens >= 1e15) return `${(tokens / 1e15).toFixed(1)}Q tokens`
  if (tokens >= 1e12) return `${(tokens / 1e12).toFixed(1)}T tokens`
  if (tokens >= 1e9) return `${(tokens / 1e9).toFixed(1)}B tokens`
  return `${(tokens / 1e6).toFixed(0)}M tokens`
}

/* ─── Animated number hook ──────────────────────────────────── */
function useAnimatedNumber(target, duration = 250) {
  const [value, setValue] = useState(target)
  const frame = useRef(null)
  const last = useRef(target)

  useEffect(() => {
    const from = last.current
    const start = performance.now()
    cancelAnimationFrame(frame.current)

    frame.current = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) frame.current = requestAnimationFrame(tick)
      else last.current = target
    })
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration])

  return value
}

/* ─── Tick marks for slider ─────────────────────────────────── */
const TICKS = [
  { label: '1 GB', pos: 0 },
  { label: '10 GB', pos: 16.67 },
  { label: '100 GB', pos: 33.33 },
  { label: '1 TB', pos: 50 },
  { label: '10 TB', pos: 66.67 },
  { label: '100 TB', pos: 83.33 },
  { label: '1 PB', pos: 100 },
]

/* ─── Pricing comparison data ───────────────────────────────── */
const COMPARISON_ROWS = [
  { tier: '1 GB', gb: 1, monthly: true },
  { tier: '10 GB', gb: 10, monthly: true },
  { tier: '100 GB', gb: 100, monthly: true },
  { tier: '1 TB', gb: 1_024, monthly: true },
  { tier: '10 TB', gb: 10_240, monthly: true },
  { tier: '100 TB', gb: 102_400, monthly: true },
  { tier: '1 PB', gb: 1_048_576, monthly: true },
]

/* ─── Features ──────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <BrainIcon />,
    iconClass: 'icon-purple',
    cardClass: 'glow-purple',
    title: 'Persistent AI Memory',
    desc: 'Your models never forget. Store billions of tokens of context that persist across every session, every model call, every deployment.',
  },
  {
    icon: <ZapIcon />,
    iconClass: 'icon-blue',
    cardClass: 'glow-blue',
    title: 'Sub-10ms Retrieval',
    desc: 'Vector-indexed storage with sub-10ms retrieval latency at petabyte scale. Semantic search across your entire knowledge base, instantly.',
  },
  {
    icon: <ChartIcon />,
    iconClass: 'icon-cyan',
    cardClass: 'glow-cyan',
    title: 'Elastic Scaling',
    desc: 'Start at 1 GB and grow to a petabyte without migration, downtime, or re-indexing. Pay exactly for what you use, billed to the gigabyte.',
  },
]

/* ─── Use cases ─────────────────────────────────────────────── */
const USE_CASES = [
  { icon: <BotIcon />, title: 'AI Assistants', desc: 'Give chatbots months of conversation history and deep institutional knowledge.' },
  { icon: <ScaleIcon />, title: 'Legal Discovery', desc: 'Index entire case archives. Ask any question across millions of documents.' },
  { icon: <DnaIcon />, title: 'Medical Research', desc: 'Cross-reference clinical trials, patient records, and literature at scale.' },
  { icon: <BuildingIcon />, title: 'Enterprise Search', desc: 'Unify knowledge across all your tools, docs, and internal databases.' },
  { icon: <CpuIcon />, title: 'Autonomous Agents', desc: 'Agents that accumulate learnings, memories, and skills across runs.' },
  { icon: <GraduationIcon />, title: 'Academia & R&D', desc: 'Ingest entire research corpora. Surface connections no human could find.' },
]

/* ─── Main component ────────────────────────────────────────── */
export default function LandingPage({ onGetStarted }) {
  const [sliderVal, setSliderVal] = useState(0)
  const [isAnnual, setIsAnnual] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [subscribeState, setSubscribeState] = useState('idle') // idle, loading, success, error
  const [stripeWarning, setStripeWarning] = useState(false)
  const [checkoutClientSecret, setCheckoutClientSecret] = useState(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('kd-theme') === 'dark' }
    catch { return false }
  })
  const sliderRef = useRef(null)

  // Persist theme choice
  useEffect(() => {
    try { localStorage.setItem('kd-theme', isDark ? 'dark' : 'light') } catch { }
  }, [isDark])

  const gb = gbFromSlider(sliderVal)
  const ppgb = pricePerGB(gb)
  const monthly = monthlyTotal(gb)
  const annual = monthly * 12 * 0.8

  const animMonthly = useAnimatedNumber(monthly)
  const animPpgb = useAnimatedNumber(ppgb)

  // Update slider gradient fill
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--fill', `${sliderVal}%`)
    }
  }, [sliderVal])

  // Nav scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = useCallback((id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  function handleManualGBChange(e) {
    const val = parseFloat(e.target.value) || 0
    const clamped = Math.min(Math.max(val, 1), 1000000)
    setSliderVal(sliderFromGB(clamped))
  }

  async function handleSubscribe() {
    setSubscribeState('loading')
    setStripeWarning(false)
    const priceCents = Math.round(isAnnual ? annual * 100 : monthly * 100)
    const result = await handleCheckout(gb, priceCents)
    if (result?.error === 'NOT_CONFIGURED') {
      setStripeWarning(true)
      setSubscribeState('idle')
    } else if (result?.clientSecret) {
      setCheckoutClientSecret(result.clientSecret)
      setIsCheckoutOpen(true)
      setSubscribeState('idle')
    } else if (result?.error) {
      setSubscribeState('error')
    }
  }

  return (
    <div className={`landing${isDark ? ' dark' : ''}`}>
      {/* ── Background ── */}
      <div className="landing-bg" aria-hidden>
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
        <div className="aurora-orb aurora-orb-4" />
        <div className="bg-darken" />
        <div className="grid-overlay" />
      </div>

      {/* ── Nav ── */}
      <nav className={`l-nav${isScrolled ? ' scrolled' : ''}`}>
        <div className="l-container">
          <div className="l-nav-inner">
            <a href="#home" className="l-nav-logo" onClick={e => { e.preventDefault(); scrollTo('#home') }}>
              <img src={knowdriveLogoSrc} alt="KnowDrive" className="l-nav-logo-img" />
              KnowDrive.ai
            </a>
            <ul className="l-nav-links">
              <li><a href="#features" onClick={e => { e.preventDefault(); scrollTo('#features') }}>Features</a></li>
              <li><a href="#pricing" onClick={e => { e.preventDefault(); scrollTo('#pricing') }}>Pricing</a></li>
              <li><a href="#usecases" onClick={e => { e.preventDefault(); scrollTo('#usecases') }}>Use Cases</a></li>
            </ul>
            <div className="l-nav-ctas">
              <button
                className="theme-toggle"
                onClick={() => setIsDark(d => !d)}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
              <button className="btn-ghost" onClick={() => setIsWaitlistOpen(true)}>Sign In</button>
              <button className="btn-primary" onClick={() => setIsWaitlistOpen(true)}>Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="l-hero" id="home">
        <div className="l-container">
          <div className="l-hero-inner">
            <div className="l-hero-copy">
              <div className="l-hero-badge animate-in">
                <span className="badge-pulse" />
                Don't settle for 1 million tokens anymore.
              </div>
              <h1 className="l-hero-title animate-in delay-1">
                The world's first<br />
                <span className="gradient-text">unlimited context window.</span>
              </h1>
              <p className="l-hero-sub animate-in delay-2">
                KnowDrive.ai scales the current LLM context window of 1 million tokens (~5 megabytes) by several orders of magnitude, to a full petabyte of persistent AI context
                storage. Feed your models unlimited knowledge. — pay only for what you use.
              </p>
              <div className="l-hero-ctas animate-in delay-3">
                <button className="btn-primary large" onClick={() => setIsWaitlistOpen(true)}>
                  Start for $5 / month
                </button>
                <button className="btn-ghost large" onClick={() => setIsWaitlistOpen(true)}>
                  Open App →
                </button>
              </div>
              <div className="l-hero-stats animate-in delay-3">
                <div className="l-hero-stat">
                  <span className="hero-stat-value">1 GB</span>
                  <span className="hero-stat-label">Minimum</span>
                </div>
                <div className="l-hero-stat">
                  <span className="hero-stat-value">1 PB</span>
                  <span className="hero-stat-label">Maximum</span>
                </div>
                <div className="l-hero-stat">
                  <span className="hero-stat-value">$5 / GB</span>
                  <span className="hero-stat-label">Starting price</span>
                </div>
              </div>
            </div>

            {/* Video preview visual */}
            <div className="l-hero-visual animate-in delay-2">
              <div className="video-viewer">
                <video 
                  src={homeVideo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="hero-video"
                />
                <div className="video-overlay-glow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="l-features" id="features">
        <div className="l-container">
          <div className="section-header">
            <span className="section-eyebrow">Why KnowDrive</span>
            <h2 className="section-title">Built for the token era</h2>
            <p className="section-sub">
              Context is the new compute. KnowDrive is the first storage layer
              purpose-built for AI — not retrofitted from object storage.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feature-card ${f.cardClass}`}>
                <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="l-pricing" id="pricing">
        <div className="l-container">
          <div className="section-header centered">
            <span className="section-eyebrow">Flexible Pricing</span>
            <h2 className="section-title">Scale from gigabytes to petabytes</h2>
            <p className="section-sub">
              One plan, unlimited scale. Volume pricing kicks in automatically —
              the more you store, the less you pay per gigabyte.
            </p>
          </div>

          <div className="pricing-card">
            {/* Annual toggle */}
            <div className="billing-toggle">
              <span className={`billing-label${!isAnnual ? ' active' : ''}`}>Monthly</span>
              <div
                className={`billing-toggle-track${isAnnual ? ' active' : ''}`}
                role="switch"
                aria-checked={isAnnual}
                tabIndex={0}
                onClick={() => setIsAnnual(v => !v)}
                onKeyDown={e => e.key === 'Enter' && setIsAnnual(v => !v)}
              >
                <div className="billing-toggle-thumb" />
              </div>
              <span className={`billing-label${isAnnual ? ' active' : ''}`}>
                Annual <span className="billing-discount">Save 20%</span>
              </span>
            </div>

            {/* Slider */}
            <div className="slider-wrap">
              <div className="slider-header">
                <span className="slider-label">Context Window Storage</span>
                <div className="slider-value-input-wrap">
                  <input
                    type="number"
                    className="slider-num-input"
                    value={Math.round(gb)}
                    onChange={handleManualGBChange}
                    min="1"
                    max="1000000"
                  />
                  <span className="slider-num-unit">GB</span>
                </div>
              </div>
              <div className="range-container">
                <input
                  ref={sliderRef}
                  type="range"
                  className="storage-slider"
                  min={0}
                  max={100}
                  value={sliderVal}
                  onChange={e => setSliderVal(Number(e.target.value))}
                  aria-label="Storage size"
                />
                <div className="slider-ticks" aria-hidden>
                  {TICKS.map(t => (
                    <span
                      key={t.label}
                      className="tick"
                      style={{ position: 'absolute', left: `calc(${t.pos}% + ${t.pos === 0 ? 0 : t.pos === 100 ? -22 : -11}px)` }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price display */}
            <div className="price-display">
              <div className="price-main">
                <span className="price-amount">
                  {formatUSD(isAnnual ? annual / 12 : animMonthly)}
                </span>
                <div className="price-per">
                  <span>per {isAnnual ? 'month, billed annually' : 'month'}</span>
                </div>
                <div className="price-rate" style={{ marginTop: 8 }}>
                  {animPpgb.toFixed(2)}/GB/month
                </div>
              </div>
              <div className="price-breakdown">
                <div className="breakdown-row">
                  <span className="breakdown-label">Storage</span>
                  <span className="breakdown-value">{formatStorage(gb)}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">Price / GB</span>
                  <span className="breakdown-value highlight">${animPpgb.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span className="breakdown-label">Context capacity</span>
                  <span className="breakdown-value">{formatTokens(gb)}</span>
                </div>
                {isAnnual && (
                  <div className="breakdown-row">
                    <span className="breakdown-label">Annual savings</span>
                    <span className="breakdown-value green">{formatUSD(monthly * 12 * 0.2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="pricing-cta">
              <button
                className={`subscribe-btn${subscribeState === 'loading' ? ' loading' : ''}`}
                onClick={handleSubscribe}
                disabled={subscribeState === 'loading'}
              >
                <span>
                  {subscribeState === 'loading'
                    ? 'Redirecting to Stripe…'
                    : `Subscribe — ${formatUSD(isAnnual ? annual : monthly)} / ${isAnnual ? 'year' : 'month'}`
                  }
                </span>
              </button>

              <div className="stripe-notice">
                Secured by
                <span className="stripe-icon">stripe</span>
                · Cancel anytime · 99.99% SLA
              </div>

              {stripeWarning && (
                <div className="stripe-config-notice">
                  <strong>Stripe not yet configured.</strong> Add your publishable key to{' '}
                  <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in <code>.env.local</code> and point{' '}
                  <code>/api/create-checkout-session</code> to your backend to enable payments.
                </div>
              )}
              {subscribeState === 'error' && (
                <div className="stripe-config-notice" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
                  Something went wrong. Please try again or contact support.
                </div>
              )}
            </div>
          </div>

          {/* Volume pricing table */}
          <div style={{ marginTop: 56, overflowX: 'auto' }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Storage Tier</th>
                  <th>Price / GB / mo</th>
                  <th>Monthly Total</th>
                  <th>Annual Total</th>
                  <th>Context Capacity</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(row => {
                  const ppg = pricePerGB(row.gb)
                  const mo = monthlyTotal(row.gb)
                  return (
                    <tr key={row.tier}>
                      <td className="td-bold">{row.tier}</td>
                      <td className="td-price">${ppg.toFixed(2)}</td>
                      <td className="td-price">{formatUSD(mo)}</td>
                      <td className="td-price td-check">{formatUSD(mo * 12 * 0.8)}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#64748b' }}>{formatTokens(row.gb)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Use Cases ── */}
      <section className="l-usecases" id="usecases">
        <div className="l-container">
          <div className="section-header">
            <span className="section-eyebrow">Use Cases</span>
            <h2 className="section-title">Who stores context on KnowDrive</h2>
            <p className="section-sub">
              From solo developers to global enterprises — anyone building AI that needs to remember.
            </p>
          </div>
          <div className="usecases-grid">
            {USE_CASES.map(u => (
              <div key={u.title} className="usecase-card">
                <div className="usecase-icon">{u.icon}</div>
                <div className="usecase-title">{u.title}</div>
                <div className="usecase-desc">{u.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="l-cta">
        <div className="l-container">
          <div className="l-cta-inner">
            <h2 className="l-cta-title">
              Start building with<br />
              <span className="gradient-text">infinite context</span>
            </h2>
            <p className="l-cta-sub">
              Your first gigabyte is $5. Scale to a petabyte with a single API call.
              No migrations. No re-indexing. No surprises.
            </p>
            <div className="l-cta-btns">
              <button className="btn-primary large" onClick={() => setIsWaitlistOpen(true)}>
                Get Started — $5 / mo
              </button>
              <button className="btn-ghost large" onClick={() => setIsWaitlistOpen(true)}>
                Open App →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="l-footer">
        <div className="l-container">
          <div className="l-footer-inner">
            <div className="l-footer-logo">
              <img src={knowdriveLogoSrc} alt="KnowDrive" className="l-nav-logo-img" style={{ height: 22 }} />
              KnowDrive.ai
            </div>
            <ul className="l-footer-links">
              <li><a href="#features" onClick={e => { e.preventDefault(); scrollTo('#features') }}>Features</a></li>
              <li><a href="#pricing" onClick={e => { e.preventDefault(); scrollTo('#pricing') }}>Pricing</a></li>
              <li><a href="#usecases" onClick={e => { e.preventDefault(); scrollTo('#usecases') }}>Use Cases</a></li>
              <li><a href="mailto:hello@knowdrive.ai">Contact</a></li>
            </ul>
            <p className="l-footer-copy">© 2026 KnowDrive, Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        clientSecret={checkoutClientSecret} 
      />

      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
      />
    </div>
  )
}
