import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import styles from './styles/landing.css?inline'

import Header from './components/layout/Header'
import MainContent from './components/layout/MainContent'
import Footer from './components/layout/Footer'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env.local")
}

function createCustomElement(tagName, Component) {
  class CustomElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      const initialData = {};
      for (const attr of this.attributes) {
        if (attr.name.startsWith('data-')) {
          const key = attr.name.slice(5).replace(/-([a-z])/g, g => g[1].toUpperCase());
          initialData[key] = attr.value;
        }
      }

      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(`
        :host {
          display: block;
          width: 100%;
          position: relative;
        }
        ${styles}
      `);
      this.shadowRoot.adoptedStyleSheets = [styleSheet];

      const mountPoint = document.createElement('div');
      mountPoint.id = 'kd-inner-root';
      this.shadowRoot.appendChild(mountPoint);

      this.root = ReactDOM.createRoot(mountPoint);
      this.root.render(
        <React.StrictMode>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <Component initialData={initialData} rootNode={this.shadowRoot} />
          </ClerkProvider>
        </React.StrictMode>
      );
    }

    disconnectedCallback() {
      if (this.root) this.root.unmount();
    }
  }

  if (!customElements.get(tagName)) {
    customElements.define(tagName, CustomElement);
  }
}

// Define the modular custom elements
createCustomElement('knowdrive-header', Header);
createCustomElement('knowdrive-site', MainContent);
createCustomElement('knowdrive-footer', Footer);
