import React from 'react';
import { LogoSVG } from '../Icons';

export default function UpgradeModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-icon"><LogoSVG height={48} /></div>
        <div className="modal-title">Limit Reached</div>
        <div className="modal-body">
          It seems you've filled your maximum session size for this ephemeral container.
          <br /><br />
          Upgrade to <strong>Pro</strong> for 10GB, <strong>Max</strong> for 100GB, or <strong>Ultra</strong> for 1TB.
          For larger requirements, please contact our enterprise sales team.
        </div>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-primary" onClick={onClose}>Upgrade to Pro</button>
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Contact Enterprise Sales</button>
          <button className="modal-btn modal-btn-secondary" style={{ border:"none", background:"transparent", color:"var(--text-muted)" }} onClick={onClose}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}
