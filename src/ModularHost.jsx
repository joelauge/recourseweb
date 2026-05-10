import React, { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import Header from './components/layout/Header';
import MainContent from './components/layout/MainContent';
import Footer from './components/layout/Footer';
import App from './App';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function ModularHost({ registry }) {
  const roots = useSyncExternalStore(registry.subscribe.bind(registry), registry.getSnapshot.bind(registry));
  
  useEffect(() => {
    console.log("[ModularHost] Mounted. View:", roots.view);
    
    if (window.location.pathname === '/dashboard') {
      registry.setView('app');
    }

    const handleOpenApp = () => {
      console.log("[ModularHost] Signal: kd-open-app");
      registry.setView('app');
      window.history.pushState({}, '', '/dashboard');
    };
    
    window.addEventListener('kd-open-app', handleOpenApp);
    return () => window.removeEventListener('kd-open-app', handleOpenApp);
  }, []);

  let content = null;
  
  if (roots.view === 'app') {
    if (roots.site) {
      content = createPortal(<App />, roots.site);
    } else {
      console.warn("[ModularHost] Dashboard view active but 'site' root is missing.");
    }
  } else {
    content = (
      <>
        {roots.header && createPortal(<Header rootNode={roots.header} />, roots.header)}
        {roots.site && createPortal(<MainContent rootNode={roots.site} />, roots.site)}
        {roots.footer && createPortal(<Footer rootNode={roots.footer} />, roots.footer)}
      </>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {content}
    </ClerkProvider>
  );
}
