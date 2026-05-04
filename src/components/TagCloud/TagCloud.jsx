import React, { useState } from 'react';
import { TAG_MAP } from '../../constants';

export default function TagCloud({ file, onUpdateFile, onClickTag }) {
  const [newTagInput, setNewTagInput] = useState("");

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const exists = file.tags.some(t => t[1].toLowerCase() === newTagInput.trim().toLowerCase());
    if (!exists) {
      onUpdateFile && onUpdateFile(file.id, { 
        tags: [...file.tags, ["gray", newTagInput.trim()]] 
      });
    }
    setNewTagInput("");
  };

  return (
    <div className="tag-management-box" onClick={e => e.stopPropagation()}>
      <div className="tmb-header">Tag Cloud</div>
      <div className="tmb-cloud">
        {file.tags.map(([color, label], i) => (
          <div 
            key={i} 
            className={`tmb-tag ${TAG_MAP[color] || "ftag-gray"}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-knowdrive-tag", label);
              e.dataTransfer.effectAllowed = "copy";
            }}
          >
            <span onClick={(e) => { e.stopPropagation(); onClickTag && onClickTag(label); }}>#{label}</span>
            <button className="tmb-remove" onClick={(e) => { 
              e.stopPropagation(); 
              onUpdateFile && onUpdateFile(file.id, { tags: file.tags.filter((_, idx) => idx !== i) }); 
            }}>×</button>
          </div>
        ))}
        <div className="tmb-input-wrap">
          <input 
            type="text" 
            placeholder="Add tag..." 
            value={newTagInput}
            onChange={e => setNewTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
