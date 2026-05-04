import React, { useState, useEffect, useCallback } from 'react';
import knowdriveLogoSrc from '../../../assets/knowdrive_white_logo_notext.svg';

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header({ rootNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('kd-theme') === 'dark' } catch { return false }
  });

  useEffect(() => {
    const onScroll = (e) => {
      const top = e.detail?.scrollTop ?? window.scrollY;
      setIsScrolled(top > 40);
    };
    window.addEventListener('kd-site-scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('kd-site-scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('kd-theme', newDark ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('kd-theme-change', { detail: { isDark: newDark } }));
  };

  const scrollTo = (id) => {
    // We send a global event for scrolling so the main site component can handle it
    window.dispatchEvent(new CustomEvent('kd-scroll-to', { detail: { id } }));
  };

  const openWaitlist = () => {
    window.dispatchEvent(new CustomEvent('kd-open-waitlist'));
  };

  return (
    <header className={`landing${isDark ? ' dark' : ''}`}>
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
              <button className="theme-toggle" onClick={toggleTheme}>
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
              <button className="btn-ghost" onClick={openWaitlist}>Sign In</button>
              <button className="btn-primary" onClick={openWaitlist}>Get Started</button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
