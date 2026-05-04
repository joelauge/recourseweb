import React, { useState } from 'react';
import { LogoSVG } from '../Icons';

export default function WaitlistModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      // In a real app, you'd send this to your backend/waitlist service
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="waitlist-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-content">
          <div className="modal-logo">
            <LogoSVG height={48} />
          </div>

          <h2 className="modal-title">Capacity Reached</h2>
          <p className="modal-desc">
            We're currently not admitting new users to ensure the highest performance for our existing members.
            Sign up for updates to be the first to know when new slots open!
          </p>

          {!submitted ? (
            <form className="waitlist-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary">
                  Notify Me
                </button>
              </div>
              <p className="modal-footer-text">Join the waitlist.</p>
            </form>
          ) : (
            <div className="success-message">
              <div className="success-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3" fill="none">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3>You're on the list!</h3>
              <p>We'll email you as soon as a spot becomes available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
