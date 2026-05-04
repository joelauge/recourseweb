import React from 'react';
import VectorCard from '../VectorCard/VectorCard';
import { DBIcon, ChevronIcon } from '../Icons';

export default function VectorSidebar({ isOpen, tags, vectors, onClose }) {
  return (
    <div className={`vector-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="vs-header">
        <div className="vs-title">
          <DBIcon size={16} />
          <span>Vector Explorer</span>
        </div>
        <div className="vs-tags-row">
          {Array.from(tags).map(tag => (
            <span key={tag} className="vs-tag-chip">#{tag}</span>
          ))}
        </div>
        <button className="vs-close" onClick={onClose} title="Close sidebar">
          ×
        </button>
      </div>
      <div className="vs-body">
        <div className="vs-stats-row">
          <span className="vs-count">{vectors.length} vectors</span>
          <span className="vs-label">found with shared tags</span>
        </div>
        <div className="vs-list">
          {vectors.length === 0 ? (
            <div className="vs-empty">
              No vectors match the current tag scope.
            </div>
          ) : (
            vectors.map(v => (
              <VectorCard key={v.id} vector={v} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
