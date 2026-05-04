import React, { useState, useEffect, useSyncExternalStore } from 'react'
import ReactDOM from 'react-dom/client'
import { createPortal } from 'react-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import styles from './styles/landing.css?inline'

import Header from './components/layout/Header'
import MainContent from './components/layout/MainContent'
import Footer from './components/layout/Footer'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// ─── Global Registry for Modular Portals ─────────────────────
const registry = {
  state: { header: null, site: null, footer: null },
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  register(type, node) {
    this.state = { ...this.state, [type]: node };
    this.listeners.forEach(l => l());
  },
  getSnapshot() {
    return this.state;
  }
};

function ModularHost() {
  const roots = useSyncExternalStore(registry.subscribe.bind(registry), registry.getSnapshot.bind(registry));
  
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {roots.header && createPortal(<Header rootNode={roots.header} />, roots.header)}
      {roots.site && createPortal(<MainContent rootNode={roots.site} />, roots.site)}
      {roots.footer && createPortal(<Footer rootNode={roots.footer} />, roots.footer)}
    </ClerkProvider>
  );
}

// ─── Custom Element Definitions ──────────────────────────────
function defineModularElement(tagName, type) {
  class ModularElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      
      const styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(`
        :host { display: block; width: 100%; position: relative; }
        ${styles}
      `);
      this.shadowRoot.adoptedStyleSheets = [styleSheet];
    }
    connectedCallback() {
      registry.register(type, this.shadowRoot);
    }
  }
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ModularElement);
  }
}

defineModularElement('knowdrive-header', 'header');
defineModularElement('knowdrive-site', 'site');
defineModularElement('knowdrive-footer', 'footer');

// ─── Launch the Host Engine ──────────────────────────────────
const hostContainer = document.createElement('div');
hostContainer.style.display = 'none';
document.body.appendChild(hostContainer);
ReactDOM.createRoot(hostContainer).render(<ModularHost />);
