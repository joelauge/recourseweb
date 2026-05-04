import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import styles from './styles/landing.css?inline'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local")
}

function Root({ initialData, rootNode }) {
  const [showApp, setShowApp] = useState(false)
  if (showApp) return <App data={initialData} rootNode={rootNode} />
  return <LandingPage onGetStarted={() => setShowApp(true)} data={initialData} rootNode={rootNode} />
}

class KnowDriveSite extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Extract data-attributes to pass as props
    const initialData = {};
    for (const attr of this.attributes) {
      if (attr.name.startsWith('data-')) {
        const key = attr.name.slice(5).replace(/-([a-z])/g, g => g[1].toUpperCase());
        initialData[key] = attr.value;
      }
    }

    // Inject styles into shadow DOM
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        position: relative;
      }
      ${styles}
    `);
    this.shadowRoot.adoptedStyleSheets = [styleSheet];

    // Create a container for React
    const mountPoint = document.createElement('div');
    mountPoint.id = 'kd-inner-root';
    this.shadowRoot.appendChild(mountPoint);

    // Render React
    this.root = ReactDOM.createRoot(mountPoint);
    this.root.render(
      <React.StrictMode>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <Root initialData={initialData} rootNode={this.shadowRoot} />
        </ClerkProvider>
      </React.StrictMode>
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

// Define the custom element
if (!customElements.get('knowdrive-site')) {
  customElements.define('knowdrive-site', KnowDriveSite);
}
