import React from 'react';
import { DBIcon } from '../Icons';

export default function VectorCard({ vector }) {
  return (
    <div className="vector-card">
      <div className="vector-inner">
        <div className="vector-top">
          <div className="vector-icon">
            <DBIcon size={14} />
          </div>
          <div className="vector-info">
            <div className="vector-source">{vector.source}</div>
            <div className="vector-score">{(vector.score * 100).toFixed(1)}% match</div>
          </div>
        </div>
        <div className="vector-content">{vector.content}</div>
        <div className="vector-tags">
          {vector.tags.map(tag => (
            <span key={tag} className="vtag">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
