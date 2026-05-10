import React from 'react'
import ReactDOM from 'react-dom/client'
import landingStyles from './styles/landing.css?inline'
import indexStyles from './styles/index.css?inline'
import { ModularHost } from './ModularHost'

// ─── Global Registry for Modular Portals ─────────────────────
const registry = {
  state: { 
    header: null, 
    site: null, 
    footer: null, 
    view: window.location.pathname === '/dashboard' ? 'app' : 'landing' 
  },
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  register(type, node) {
    console.log(`[Registry] Registering ${type}`);
    this.state = { ...this.state, [type]: node };
    this.listeners.forEach(l => l());
  },
  setView(view) {
    console.log(`[Registry] Switching view to: ${view}`);
    this.state = { ...this.state, view };
    const root = document.documentElement;
    if (view === 'app') {
      root.classList.add('app-active');
      document.body.classList.add('app-active');
    } else {
      root.classList.remove('app-active');
      document.body.classList.remove('app-active');
    }
    this.listeners.forEach(l => l());
  },
  getSnapshot() {
    return this.state;
  }
};

// Apply initial body classes
if (registry.state.view === 'app') {
  document.documentElement.classList.add('app-active');
  document.body.classList.add('app-active');
}

// ─── Custom Element Definitions ──────────────────────────────
function defineModularElement(tagName, type) {
  class ModularElement extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      
      const styleSheet = new CSSStyleSheet();
      // Transform body.app-active selectors to work inside shadow DOM
      const shadowIndexStyles = indexStyles.replace(/body\.app-active\s+/g, ':host-context(body.app-active) ');
      const shadowLandingStyles = landingStyles.replace(/body\.app-active\s+/g, ':host-context(body.app-active) ');
      
      styleSheet.replaceSync(`
        :host { display: block; width: 100%; position: relative; }
        :host([part="site"]) { min-height: 100vh; }
        :host-context(body.app-active)[part="site"] { height: 100%; min-height: 100%; overflow: hidden; }
        ${shadowLandingStyles}
        ${shadowIndexStyles}
      `);
      shadow.adoptedStyleSheets = [styleSheet];
      console.log(`[CustomElement] Created ${tagName} shadow root`);
    }
    connectedCallback() {
      this.setAttribute('part', type);
      // Ensure shadowRoot is ready before registering
      if (this.shadowRoot) {
        registry.register(type, this.shadowRoot);
      } else {
        console.error(`[CustomElement] ${tagName} missing shadowRoot on connect!`);
      }
    }
  }
  
  if (!customElements.get(tagName)) {
    customElements.define(tagName, ModularElement);
    console.log(`[CustomElement] Defined ${tagName}`);
  }
}

defineModularElement('knowdrive-header', 'header');
defineModularElement('knowdrive-site', 'site');
defineModularElement('knowdrive-footer', 'footer');

// ─── Launch the Host Engine ──────────────────────────────────
const HOST_ID = '__knowdrive_host_root__';
let hostContainer = document.getElementById(HOST_ID);

if (!hostContainer) {
  hostContainer = document.createElement('div');
  hostContainer.id = HOST_ID;
  hostContainer.style.display = 'none';
  document.body.appendChild(hostContainer);
}

const root = ReactDOM.createRoot(hostContainer);
root.render(<ModularHost registry={registry} />);

// HMR Cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    root.unmount();
  });
}
