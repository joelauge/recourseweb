import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TYPE_LABELS, TAG_MAP, FILE_STATES } from '../../constants';
import { ActionChatIcon, MoreVerticalIcon, ChevronIcon, MoveIcon, TYPE_ICONS } from '../Icons';
import TagCloud from '../TagCloud/TagCloud';

export default // ─── FILE CARD COMPONENT ──────────────────────────────────────────────────────
function FileCard({ file, onDragStart, onDragEnd, onClick, onDoubleClick, isSelected, isOverLimit, isExtendedView, onUpgradeClick, onDelete, onMove, onRename, availableSessions, onUpdateFile, onClickTag }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameInput, setRenameInput] = useState(file.name);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: `Hi, I'm the KnowDB agent for ${file.name}. What would you like to know?` }
  ]);
  const historyRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!showMenu) return;
    const handleClose = () => setShowMenu(false);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('click', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('click', handleClose);
    };
  }, [showMenu]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    if (showMenu) {
      setShowMenu(false);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
      setShowMenu(true);
    }
    setActiveSubMenu(null);
  };

  const TIcon = TYPE_ICONS[file.type] || TYPE_ICONS.raw;
  const state = file.state || "READY";
  const stateInfo = FILE_STATES[state];
  const showBar = state !== "READY" && state !== "ERROR";
  const pct = file.progress ?? (state === "READY" ? 100 : 0);
  const recentLog = file.logs?.slice(-1)[0];

  const handleExpandToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleChatSend = (e) => {
    e.stopPropagation();
    if (!chatInput.trim()) return;
    setChatHistory(prev => [...prev, { role: "user", text: chatInput }]);
    setChatInput("");
    
    // Mock AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: "ai", text: "This is a mocked response based on the file contents. In production, this would query the specific file namespace." }]);
    }, 600);
  };

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [chatHistory, isChatOpen]);

  return (
    <div
      className={`file-card type-${file.type} ${isSelected ? "selected" : ""} ${file.dragging ? "dragging" : ""} ${isExpanded ? "expanded" : ""}`}
      draggable={state === "READY"}
      onDragStart={(e) => onDragStart(e, file)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(file)}
      onDoubleClick={() => onDoubleClick && onDoubleClick(file)}
      style={{ animationDelay: `${(file.animDelay || 0)}ms` }}
    >
      <div className="file-inner">
        <div className="file-top">
          <div className={`file-type-icon fti-${file.type}`}>
            <TIcon />
            <span className="ext-tag">{TYPE_LABELS[file.type]}</span>
          </div>
          <div className="file-name-block">
            {isRenaming ? (
              <input
                autoFocus
                className="file-name-input"
                value={renameInput}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setRenameInput(e.target.value)}
                onBlur={() => {
                  setIsRenaming(false);
                  if (renameInput.trim() && renameInput !== file.name) {
                    onRename && onRename(file.id, renameInput.trim());
                  } else {
                    setRenameInput(file.name);
                  }
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") {
                    setIsRenaming(false);
                    if (renameInput.trim() && renameInput !== file.name) {
                      onRename && onRename(file.id, renameInput.trim());
                    } else {
                      setRenameInput(file.name);
                    }
                  } else if (e.key === "Escape") {
                    setIsRenaming(false);
                    setRenameInput(file.name);
                  }
                }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <div className="file-name" title={file.name} style={{ marginBottom: 0 }}>{file.name}</div>
                {file.isNew && <div className="new-badge">NEW</div>}
              </div>
            )}
            <div className="file-path">{file.path}</div>
            <div className="file-tags">
              {file.tags.map(([color, label], i) => (
                <span 
                  key={i} 
                  className={TAG_MAP[color] || "ftag ftag-gray"}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/x-knowdrive-tag", label);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickTag && onClickTag(label);
                  }}
                >{label}</span>
              ))}
              <span className="file-size-badge">{file.mb} MB</span>
            </div>
          </div>

          <div className="card-actions" style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            {isSelected && (
              <button className={`card-action-btn chat-btn ${isChatOpen ? "active" : ""}`} title="Chat with file" onClick={(e) => { e.stopPropagation(); setIsChatOpen(!isChatOpen); }}>
                <ActionChatIcon />
              </button>
            )}
            <div className="menu-container" style={{ position: 'relative' }}>
              <button className="card-action-btn" onClick={handleMenuClick}>
                <MoreVerticalIcon />
              </button>
              {showMenu && createPortal(
                <div className="file-menu-dropdown" style={{ top: menuPos.top, right: menuPos.right }} onClick={(e) => e.stopPropagation()} onMouseLeave={() => setActiveSubMenu(null)}>
                  <div className="file-menu-item" onMouseEnter={() => setActiveSubMenu(null)} onClick={(e) => { e.stopPropagation(); setShowMenu(false); setIsRenaming(true); }}>Rename</div>
                  
                  <div className="file-menu-item" onMouseEnter={() => setActiveSubMenu('move')}>
                    Move to... <span className="menu-caret">▶</span>
                    {activeSubMenu === 'move' && (
                      <div className="file-submenu-dropdown">
                        <div className="file-submenu-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove && onMove(file.id, 'new'); }}>New Session...</div>
                        <div className="submenu-divider" />
                        {availableSessions && availableSessions.length > 0 ? (
                          availableSessions.map(ses => (
                            <div key={ses.id} className="file-submenu-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove && onMove(file.id, ses.id); }}>{ses.label}</div>
                          ))
                        ) : (
                          <div className="file-submenu-item" style={{opacity: 0.5}}>No other sessions</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="file-menu-item" onMouseEnter={() => setActiveSubMenu('tag')}>
                    Tag... <span className="menu-caret">▶</span>
                    {activeSubMenu === 'tag' && (
                      <div className="file-submenu-dropdown tag-submenu-v2">
                        <TagCloud 
                          file={file} 
                          onUpdateFile={onUpdateFile} 
                          onClickTag={onClickTag} 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="submenu-divider" />
                  <div className="file-menu-item" style={{ color: "var(--red)" }} onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete && onDelete(file.id); }}>Delete</div>
                </div>,
                document.body
              )}
            </div>
            <button className={`expand-toggle ${isExpanded ? "active" : ""}`} onClick={handleExpandToggle}>
              <ChevronIcon />
            </button>
          </div>
        </div>

        {isExtendedView && (
          <div className="file-stats">
            <div className="fstat">
              <span className="fstat-val">{file.mb}</span>
              <span className="fstat-key">MB</span>
            </div>
            {file.stats.map((s, i) => (
              <div className="fstat" key={i}>
                <span className="fstat-val">{s.v}</span>
                <span className="fstat-key">{s.k}</span>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <div className="file-details">
            <TagCloud 
              file={file} 
              onUpdateFile={onUpdateFile} 
              onClickTag={onClickTag} 
            />

            <div className="detail-row">
              <span className="detail-label">Full Path</span>
              <span className="detail-val">{file.path}</span>
            </div>
            {Object.entries(file.details || {}).map(([k, v]) => (
              <div className="detail-row" key={k}>
                <span className="detail-label">{k}</span>
                <span className="detail-val">{v}</span>
              </div>
            ))}
            {file.logs && file.logs.length > 0 && (
              <div className="detail-row" style={{ marginTop: "4px" }}>
                <span className="detail-label">Activity Log</span>
                <div className="detail-val" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {file.logs.map((log, idx) => (
                    <div key={idx} style={{ opacity: idx === file.logs.length - 1 ? 1 : 0.6 }}>› {log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isChatOpen && isSelected && (
          <div className="file-chat-ui" onClick={(e) => e.stopPropagation()}>
            <div className="fc-history" ref={historyRef}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`fc-msg ${msg.role}`}>{msg.text}</div>
              ))}
            </div>
            <div className="fc-input-wrap">
              <input 
                type="text" 
                className="fc-input" 
                placeholder={isOverLimit ? "Storage limit reached..." : "Ask about this file..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(e); }}
                disabled={isOverLimit}
              />
              <button className="fc-send-btn" disabled={!chatInput.trim() || isOverLimit} onClick={handleChatSend}>
                <SendIcon size={11} />
              </button>
            </div>
            {isOverLimit && (
              <div style={{ fontSize: "9.5px", color: "var(--red)", textAlign: "center", marginTop: "2px", fontWeight: "500" }}>
                Limit reached. <span style={{ textDecoration: "underline", cursor: "pointer", fontWeight: "700" }} onClick={(e) => { e.stopPropagation(); onUpgradeClick && onUpgradeClick(); }}>Upgrade Account</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isExtendedView && (
        <div className="file-state-bar">
          <div className="state-indicator">
            <div className={`state-dot ${stateInfo.color}`}/>
            <span className={`state-label ${stateInfo.color}`}>{stateInfo.label}</span>
            {recentLog && <span className="state-msg">{recentLog}</span>}
          </div>
          {showBar && (
            <>
              <div className="state-progress-wrap">
                <div className={`state-progress-fill ${stateInfo.color}`} style={{ width: `${pct}%` }}/>
              </div>
              <span className="state-pct">{pct}%</span>
            </>
          )}
        </div>
      )}

      {state === "READY" && (
        <div className="drag-hint"><MoveIcon /> drag to query</div>
      )}
    </div>
  );
}
