import React, { useState, useEffect } from 'react';
import knowdriveLogoSrc from '../../../assets/knowdrive_white_logo_notext.svg';

export default function Footer() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('kd-theme') === 'dark' } catch { return false }
  });

  useEffect(() => {
    const handleTheme = (e) => setIsDark(e.detail.isDark);
    window.addEventListener('kd-theme-change', handleTheme);
    return () => window.removeEventListener('kd-theme-change', handleTheme);
  }, []);

  const scrollTo = (id) => {
    window.dispatchEvent(new CustomEvent('kd-scroll-to', { detail: { id } }));
  };

  return (
    <footer className={`landing${isDark ? ' dark' : ''}`}>
      <div className="l-footer">
        <div className="l-container">
          <div className="l-footer-inner">
            <div className="l-footer-logo">
              <img src={knowdriveLogoSrc} alt="KnowDrive" height="20" style={{ filter: isDark ? 'none' : 'brightness(0)' }} />
              KnowDrive.ai
            </div>
            <ul className="l-footer-links">
              <li><a href="#features" onClick={e => { e.preventDefault(); scrollTo('#features') }}>Features</a></li>
              <li><a href="#pricing" onClick={e => { e.preventDefault(); scrollTo('#pricing') }}>Pricing</a></li>
              <li><a href="mailto:hello@knowdrive.ai">Contact</a></li>
            </ul>
            <div className="l-footer-copy">© 2026 KnowDrive.ai. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
