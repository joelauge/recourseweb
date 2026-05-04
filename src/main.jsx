import { ClerkProvider } from '@clerk/clerk-react'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local")
}

function Root() {
  const [showApp, setShowApp] = useState(false)
  if (showApp) return <App />
  return <LandingPage onGetStarted={() => setShowApp(true)} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Root />
    </ClerkProvider>
  </React.StrictMode>,
)
