import React, { useState, useEffect, useRef, useCallback } from 'react';
import FileCard from '../FileCard/FileCard';
import { OP_MAP } from '../../constants';
import { createMockStream } from '../../utils/mockData';
import { UploadIcon, SearchIcon, ListIcon, DiffIcon, ExtractIcon, MapIcon, InfoIcon, DBIcon, FileIcon, WarnIcon, ChatIcon, CheckIcon, MoveIcon, SendIcon, ViewToggleIcon, ChevronIcon, TreeViewIcon, MicIcon, ImageIcon, VideoIcon } from '../Icons';
import FileTree from '../FileTree/FileTree';
import VectorSidebar from '../VectorSidebar/VectorSidebar';

const MOCK_VECTORS = [
  { id: 'v1', tags: ['PIPEDA', 'AI Governance'], content: 'Privacy principles for AI systems: Transparency, Accountability, and Individual Access must be maintained throughout the model lifecycle.', source: 'pipeda-manual-v2.vec', score: 0.98 },
  { id: 'v2', tags: ['SuperVector'], content: 'Index optimization: HNSW graphs allow for O(log n) search complexity while maintaining 95%+ recall on high-dimensional vectors.', source: 'bt-orchestration-v2.1.kb', score: 0.95 },
  { id: 'v3', tags: ['PIPEDA'], content: 'Consent requirements: Meaningful consent is required for the collection, use, and disclosure of personal information.', source: 'pipeda-manual-v2.vec', score: 0.92 },
  { id: 'v4', tags: ['AI Governance'], content: 'Bias mitigation: Regular auditing of training datasets is required to ensure fairness and prevent disparate impact.', source: 'compliance-audit-2024.pdf', score: 0.89 },
  { id: 'v5', tags: ['Market Intel'], content: 'Competitor analysis: DeepMind remains the primary innovator in agentic frameworks, though open-source alternatives are gaining traction.', source: 'q1-market-analysis-2025.raw', score: 0.87 }
];

export default // ─── SESSION COMPONENT ────────────────────────────────────────────────────────
function Session({ session, isActive, isOverLimit, sessionPct, onUpgradeClick, setFiles, availableSessions, moveFile, showSidebar, showTopPanel, showBottomPanel, isVectorSidebarOpen, setIsVectorSidebarOpen, searchMode, searchValue, setSearchValue, activeVectorStoreId }) {
  const files = session.files;
  const [scopedIds, setScopedIds] = useState(new Set());
  const [draggingId, setDraggingId] = useState(null);
  const [trayDragOver, setTrayDragOver] = useState(false);
  const [tagTrayDragOver, setTagTrayDragOver] = useState(false);
  const [listDragOver, setListDragOver] = useState(false);
  const [sortOrder, setSortOrder] = useState('recent');
  const [isExtendedView, setIsExtendedView] = useState(true);
  const [isTreeView, setIsTreeView] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [activeOp, setActiveOp] = useState("QUERY");
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
  const [streamLog, setStreamLog] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [scopedTags, setScopedTags] = useState(new Set());
  const [isOpMenuOpen, setIsOpMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);



  useEffect(() => {
    if (scopedTags.size > 0) {
      setIsVectorSidebarOpen(true);
    } else {
      setIsVectorSidebarOpen(false);
    }
  }, [scopedTags.size]);

  const filteredVectors = MOCK_VECTORS.filter(v => 
    v.tags.some(t => scopedTags.has(t))
  );
  const fileInputRef = useRef();
  const streamLogRef = useRef();
  const opMenuRef = useRef();
  const dragEnterCount = useRef(0);
  // Stable ref so stream callbacks never close over a stale setFiles prop
  const setFilesRef = useRef(setFiles);
  useEffect(() => { setFilesRef.current = setFiles; }, [setFiles]);
  // Defined forward-ref so startStream doesn't need to re-create on every render
  const handleStreamEventRef = useRef(null);

  // Click outside op menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (opMenuRef.current && !opMenuRef.current.contains(event.target)) {
        setIsOpMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 280), 650);
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const filesRef = useRef(files);
  useEffect(() => { filesRef.current = files; }, [files]);

  const addLogEntry = useCallback((fileId, msg, evClass) => {
    const fileName = filesRef.current.find(f => f.id === fileId)?.name || fileId;
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setStreamLog(prev => [...prev.slice(-60), { ts, file: fileName, msg, evClass }]);
    setTimeout(() => {
      if (streamLogRef.current) streamLogRef.current.scrollTop = streamLogRef.current.scrollHeight;
    }, 50);
  }, []);

  const handleStreamEvent = useCallback(({ fileId, state, msg, pct }) => {
    setFilesRef.current(prev => prev.map(f => {
      if (f.id !== fileId) return f;
      
      let newTags = [...f.tags];
      let newStats = [...f.stats];
      
      if (state === "REMEMBERING") {
        newTags = [["amber", "REMEMBERING"], ["gray", f.mb + " MB"]];
        newStats = [{ v: "SYNC", k: "TASK" }, { v: "CLOUD", k: "MODE" }, { v: pct + "%", k: "STATUS" }];
      } else if (state === "LEARNING") {
        newTags = [["violet", "LEARNING"], ["gray", f.mb + " MB"]];
        newStats = [{ v: Math.round(f.mb * 7.5), k: "EST.CHUNKS" }, { v: "BERT", k: "MODEL" }, { v: "TASK", k: "PENDING" }];
      } else if (state === "INDEXING") {
        newTags = [["blue", "INDEXING"], ["gray", f.mb + " MB"]];
        newStats = [{ v: "HNSW", k: "DB" }, { v: "VEC", k: "STORE" }, { v: "BUSY", k: "IO" }];
      } else if (state === "READY") {
        const typeColor = { vec: "blue", kb: "teal", vid: "red", img: "violet", raw: "amber" }[f.type] || "gray";
        const ext = f.path.split(".").pop().toUpperCase();
        newTags = [[typeColor, ext], ["gray", f.mb + " MB"], ["green", "SUPERVECTOR"]];
        newStats = [
          { v: Math.round(f.mb * 8.2), k: "VECTORS" },
          { v: "READY", k: "STATE" },
          { v: "0.95", k: "DENSITY" },
          { v: "LOCAL", k: "LOC" }
        ];
      }

      return { 
        ...f, 
        state, 
        progress: pct, 
        logs: [...(f.logs || []).slice(-3), msg],
        tags: newTags,
        stats: newStats
      };
    }));
    const evClass = `ev-${state.toLowerCase()}`;
    addLogEntry(fileId, `[${state}] ${msg}`, evClass);
  }, [addLogEntry]);

  // Always keep the ref current
  handleStreamEventRef.current = handleStreamEvent;

  const startStream = useCallback((fileId, fileMb) => {
    createMockStream(fileId, fileMb, (evt) => handleStreamEventRef.current(evt));
  }, []);

  // Fire streams when the corpus changes (initial load or store switch)
  // Track files[0]?.id as a stable proxy for 'new corpus loaded'
  const firstFileId = files[0]?.id ?? null;
  useEffect(() => {
    if (!session.hasSeedFiles || files.length === 0) return;
    setStreamLog([]);
    const snapshot = [...files];
    const timers = snapshot.map((f, i) =>
      setTimeout(() => {
        if (f.state !== 'READY') {
          createMockStream(f.id, f.mb, (evt) => handleStreamEventRef.current?.(evt));
        }
      }, 300 + i * 400)
    );
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstFileId]); // fires when corpus root changes

  const scopedFiles = files.filter(f => scopedIds.has(f.id));
  const totalScopedMb = scopedFiles.reduce((s, f) => s + f.mb, 0);
  const canSubmit = scopedIds.size > 0 && queryText.trim().length > 0;

  function addToScope(file) {
    if (file.state !== "READY") return;
    setScopedIds(prev => new Set([...prev, file.id]));
  }
  function removeFromScope(id) {
    setScopedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  function handleFileClick(file) { addToScope(file); }

  function handleDragStart(file) {
    if (file.state !== "READY") return;
    setDraggingId(file.id);
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, dragging: true } : f));
  }
  function handleDragEnd() {
    setDraggingId(null);
    setFiles(prev => prev.map(f => ({ ...f, dragging: false })));
  }

  function handleTrayDrop(e) {
    e.preventDefault(); setTrayDragOver(false);
    const tag = e.dataTransfer.getData("application/x-knowdrive-tag");
    if (tag) {
      setScopedTags(prev => new Set([...prev, tag]));
      return;
    }
    if (draggingId) {
      const f = files.find(f => f.id === draggingId);
      if (f) addToScope(f);
      return;
    }
    if (e.dataTransfer.files.length) handleOSFileDrop(Array.from(e.dataTransfer.files));
  }

  function handleTagTrayDrop(e) {
    e.preventDefault();
    setTagTrayDragOver(false);
    const tag = e.dataTransfer.getData("application/x-knowdrive-tag");
    if (tag) {
      setScopedTags(prev => new Set([...prev, tag]));
    }
  }

  function handleListOSDrop(e) {
    dragEnterCount.current = 0; setListDragOver(false);
    if (!e.dataTransfer.files.length) return;
    e.preventDefault();
    handleOSFileDrop(Array.from(e.dataTransfer.files));
  }

  function handleOSFileDrop(osFiles) {
    const newCards = osFiles.map((f, i) => {
      const ext = f.name.split(".").pop().toLowerCase();
      const type = ["pdf","doc","docx","txt","md","vec"].includes(ext) ? "vec"
        : ["json","yaml","yml","kb"].includes(ext) ? "kb"
        : ["mp4","mov","webm"].includes(ext) ? "vid"
        : ["png","jpg","jpeg","webp"].includes(ext) ? "img" : "raw";
      const mb = Math.max(1, Math.round(f.size / 1024 / 1024));
      const name = f.name.replace(/\.[^.]+$/, "");
      const id = "u" + Date.now() + i;
      return {
        id, name, type, mb, isNew: true,
        path: `session/${session.id}/uploads/${f.name}`,
        addedAt: Date.now() + i,
        tags: [[{vec:"blue",kb:"teal",vid:"red",img:"violet",raw:"amber"}[type], ext.toUpperCase() + " · uploaded"], ["gray", mb + " MB"]],
        stats: [{ v:"—", k:"VECTORS" }, { v: ext.toUpperCase(), k:"FORMAT" }, { v:"now", k:"UPLOADED" }, { v:"pending", k:"INDEX" }],
        state: "QUEUED", progress: 0, logs: [], animDelay: i * 80,
      };
    });
    setFiles(prev => [...prev, ...newCards]);
    newCards.forEach((f, i) => {
      setTimeout(() => {
        setFiles(prev => prev.map(fc => fc.id === f.id ? { ...fc, state: "REMEMBERING" } : fc));
        startStream(f.id, f.mb);
        addLogEntry(f.id, `[QUEUED] File received — starting ingestion pipeline`, "ev-remembering");
      }, i * 1200 + 400); 
    });
  }

  const hasFiles = files.length > 0;
  const totalMb = files.reduce((s, f) => s + f.mb, 0);

  const filteredBySearch = files.filter(f => {
    if (!searchValue) return true;
    const matchName = f.name.toLowerCase().includes(searchValue.toLowerCase());
    
    if (searchMode === "AUDIO") {
      return matchName && (f.type === "raw" || f.path.match(/\.(mp3|wav|ogg|m4a)$/i));
    }
    if (searchMode === "VISUAL") {
      return matchName && (f.type === "img" || f.type === "vid");
    }
    return matchName;
  });

  const sortedFiles = [...filteredBySearch].sort((a, b) => {
    switch (sortOrder) {
      case 'name_asc': return a.name.localeCompare(b.name);
      case 'name_desc': return b.name.localeCompare(a.name);
      case 'size_desc': return b.mb - a.mb;
      case 'type': return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
      case 'recent':
      default:
        return (b.addedAt || 0) - (a.addedAt || 0);
    }
  });

  if (!isActive) return null;

  return (
    <div style={{ display:"flex", flex:1, flexDirection:"row", overflow:"hidden", position:"relative" }}>
      <div className={`fs-overlay ${isFilesDrawerOpen ? "active" : ""}`} onClick={() => setIsFilesDrawerOpen(false)}/>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        <div 
          className={`fs-panel ${isFilesDrawerOpen ? "m-open" : ""} ${!showSidebar ? "collapsed" : ""}`}
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
          <div className="fs-resizer" onMouseDown={handleResizeStart} />
        <div className="fs-toolbar">
          <div className="fs-toolbar-top">
            <div className="fs-title">Your Files</div>
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon /> Add files
            </button>
            <input ref={fileInputRef} type="file" multiple style={{ display:"none" }}
              onChange={e => { handleOSFileDrop(Array.from(e.target.files)); e.target.value = ""; }}/>
            <div style={{ flex: 1 }} />
            <select className="sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="size_desc">Largest Size</option>
              <option value="type">File Type</option>
            </select>
            <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
              <button className={`view-toggle-btn ${!isTreeView ? "active" : ""}`} onClick={() => setIsTreeView(false)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", color: !isTreeView ? "var(--blue)" : "var(--text-muted)" }}>
                <ViewToggleIcon active={!isTreeView} />
              </button>
              <button className={`view-toggle-btn ${isTreeView ? "active" : ""}`} onClick={() => setIsTreeView(true)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", color: isTreeView ? "var(--blue)" : "var(--text-muted)" }}>
                <TreeViewIcon active={isTreeView} />
              </button>
              {!isTreeView && (
                <button className={`view-toggle-btn ${isExtendedView ? "active" : ""}`} onClick={() => setIsExtendedView(!isExtendedView)} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "4px", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", color: isExtendedView ? "var(--blue)" : "var(--text-muted)" }}>
                  <ListIcon size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="fs-path">
            <span>knowdrive://</span>
            <span style={{ color:"var(--text-muted)" }}> / </span>
            <span>session</span>
            <span style={{ color:"var(--text-muted)" }}> / </span>
            <span className="crumb-active">{session.id}</span>
          </div>
        </div>

        <div
          className="file-list-wrap"
          onDragEnter={e => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); dragEnterCount.current++; setListDragOver(true); }}}
          onDragLeave={() => { dragEnterCount.current--; if (dragEnterCount.current <= 0) { dragEnterCount.current = 0; setListDragOver(false); }}}
          onDragOver={e => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
          onDrop={handleListOSDrop}
        >
          <div className={`fs-drop-overlay ${listDragOver ? "active" : ""}`} style={{ pointerEvents: 'none' }}>
            <div className="fs-drop-msg">
              <UploadIcon />
              <span>Drop to ingest into KnowDB</span>
            </div>
          </div>

          {!hasFiles ? (
            <div className="empty-state">
              <div className="empty-icon"><FileIcon /></div>
              <div className="empty-title">Your Workspace is Empty</div>
              <div className="empty-sub">No files in this session yet. Upload a file or drag one here to begin indexing.</div>
              <button className="empty-cta" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon /> Add your first file
              </button>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ opacity: 0.5 }}><SearchIcon size={24} /></div>
              <div className="empty-title">No results found</div>
              <div className="empty-sub">No files in this session match your {searchMode.toLowerCase()} search for "{searchValue}".</div>
              <button className="empty-cta" onClick={() => setSearchValue("")}>
                Clear Search
              </button>
            </div>
          ) : isTreeView ? (
            <FileTree 
              files={sortedFiles} 
              onFileClick={handleFileClick} 
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd} 
              onRename={(id) => {
                // Find file and set isRenaming in local state if we had it, but here we just trigger rename
                // For now, let's keep it simple and just set a prompt or similar, 
                // but better is to match FileCard's renaming logic.
                const f = files.find(f => f.id === id);
                if (f) {
                  const newName = prompt("Rename file:", f.name);
                  if (newName && newName !== f.name) {
                    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
                    addLogEntry(id, `[SYSTEM] Renamed file to: ${newName}`, "ev-ready");
                  }
                }
              }}
              onDelete={(id) => {
                setFiles(prev => prev.filter(f => f.id !== id));
                removeFromScope(id);
              }}
              onMove={(id, targetId) => {
                removeFromScope(id);
                moveFile(id, session.id, targetId);
              }}
              availableSessions={availableSessions}
              onUpdateFile={(id, data) => setFiles(prev => prev.map(f => f.id === id ? { ...f, ...data } : f))}
              onClickTag={(label) => setScopedTags(prev => { const s = new Set(prev); if (s.has(label)) s.delete(label); else s.add(label); return s; })}
            />
          ) : (
            sortedFiles.map(file => (
              <FileCard
                key={file.id}
                file={{ ...file, path: file.path.replace("{sid}", session.id) }}
                isSelected={scopedIds.has(file.id)}
                isOverLimit={isOverLimit}
                isExtendedView={isExtendedView}
                onUpgradeClick={onUpgradeClick}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={handleFileClick}
                availableSessions={availableSessions}
                onRename={(id, newName) => {
                  setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
                  addLogEntry(id, `[SYSTEM] Renamed file to: ${newName}`, "ev-ready");
                }}
                onDelete={(id) => {
                  setFiles(prev => prev.filter(f => f.id !== id));
                  removeFromScope(id);
                }}
                onMove={(id, targetId) => {
                  removeFromScope(id);
                  moveFile(id, session.id, targetId);
                }}
                onUpdateFile={(id, data) => setFiles(prev => prev.map(f => f.id === id ? { ...f, ...data } : f))}
                onClickTag={(label) => setScopedTags(prev => { const s = new Set(prev); if (s.has(label)) s.delete(label); else s.add(label); return s; })}
              />
            ))
          )}
        </div>

        <div className="fs-footer">
          <div className="fs-footer-label">Total Volume</div>
          <div className="fs-footer-val">{files.length} objects · {totalMb} MB</div>
        </div>
      </div>

      <div className={`query-panel ${!showSidebar ? "sidebar-collapsed" : ""}`}>
        <div className={`welcome-head ${!showTopPanel ? "collapsed" : ""}`}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"4px" }}>
            <button className="mobile-only-btn" onClick={() => setIsFilesDrawerOpen(true)} style={{ 
              display: "none", padding: "4px 8px", borderRadius: "4px", background: "var(--blue-light)", 
              border: "1px solid var(--blue-mid)", color: "var(--blue)", fontSize: "10px", fontWeight: "600",
              alignItems: "center", gap: "4px"
            }}>
              <FileIcon /> Browse Files
            </button>
            <div className="welcome-eyebrow">Session · {session.id}</div>
          </div>
          <style>{`
            @media (max-width: 820px) {
              .mobile-only-btn { display: flex !important; }
            }
          `}</style>
          <div className="welcome-title">
            {hasFiles ? "What do you want to know?" : "Start by adding files"}
          </div>
          <div className="welcome-sub">
            {hasFiles
              ? "Drag files from the corpus into scope, pick an operation, and run your analysis. Watch the activity stream as RLLM indexes your content."
              : "This session has no files yet. Upload documents, videos, schemas, or images. RLLM will Remember and Learn from them automatically before you query."}
          </div>
          <div className="constraint-row">
            <div className="cpill cpill-warn"><WarnIcon /> 1 GB ephemeral session</div>
            <div className="cpill cpill-info"><ChatIcon /> Corpus-scoped queries only</div>
            <div className="cpill cpill-ok"><CheckIcon /> SuperVector DB · local inference</div>
          </div>
        </div>

        <div className="workspace-body">
            <div className="tray-layout-wrap">
              <div
                className={`tray ${trayDragOver ? "drag-over" : ""}`}
                onDragOver={e => { e.preventDefault(); setTrayDragOver(true); }}
                onDragLeave={() => setTrayDragOver(false)}
                onDrop={handleTrayDrop}
              >
                <div className="tray-header">
                  <span className="tray-label">Files in scope</span>
                  {scopedIds.size > 0 && <span className="tray-count">{scopedIds.size}</span>}
                </div>
                {scopedIds.size === 0 ? (
                  <div className="tray-empty-zone">
                    <MoveIcon /> Drag files here
                  </div>
                ) : (
                  <div className="tray-files">
                    {scopedFiles.map(f => (
                      <div key={f.id} className="tray-chip" onClick={() => removeFromScope(f.id)}>
                        <div className={`chip-dot chip-dot-${f.type}`}/>
                        <span className="chip-name">{f.name.length > 20 ? f.name.slice(0,18)+"…" : f.name}</span>
                        <span className="chip-size">{f.mb} MB</span>
                        <span className="chip-remove">×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div 
                className={`tray tags-tray ${tagTrayDragOver ? "drag-over" : ""}`}
                onDragOver={e => { e.preventDefault(); setTagTrayDragOver(true); }}
                onDragLeave={() => setTagTrayDragOver(false)}
                onDrop={handleTagTrayDrop}
              >
                <div className="tray-header">
                  <span className="tray-label">Tags in scope</span>
                  {scopedTags.size > 0 && <span className="tray-count">{scopedTags.size}</span>}
                </div>
                {scopedTags.size === 0 ? (
                  <div className="tray-empty-zone">
                    No tags in scope
                  </div>
                ) : (
                  <div className="tray-files">
                    {Array.from(scopedTags).map(tag => (
                      <div key={tag} className="tray-chip tag-chip" onClick={() => setScopedTags(prev => { const s = new Set(prev); s.delete(tag); return s; })}>
                        <span className="chip-name">#{tag}</span>
                        <span className="chip-remove">×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          {!hasFiles ? (
            <div className="query-empty-state">
              <div className="qes-icon"><DBIcon /></div>
              <div className="qes-title">Waiting for files</div>
              <div className="qes-sub">Once files are added to this session, RLLM will index them and you can run semantic queries, summaries, diffs, and cross-maps.</div>
            </div>
          ) : (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"10px", minHeight:0 }}>
              <div className="op-dropdown-container" ref={opMenuRef}>
                <button 
                  className={`op-dropdown-toggle ${isOpMenuOpen ? 'active' : ''}`} 
                  onClick={() => setIsOpMenuOpen(!isOpMenuOpen)}
                >
                  <div className="op-current-icon">
                    {{ QUERY:<SearchIcon/>, SUMMARIZE:<ListIcon/>, DIFF:<DiffIcon/>, EXTRACT:<ExtractIcon/>, MAP:<MapIcon/> }[activeOp]}
                  </div>
                  <span>{OP_MAP[activeOp].label}</span>
                  <ChevronIcon className={`dropdown-arrow ${isOpMenuOpen ? 'open' : ''}`} />
                </button>
                
                {isOpMenuOpen && (
                  <div className="op-dropdown-menu">
                    {Object.entries(OP_MAP).map(([key, op]) => (
                      <div 
                        key={key} 
                        className={`op-dropdown-item ${activeOp === key ? 'active' : ''}`}
                        onClick={() => { setActiveOp(key); setIsOpMenuOpen(false); }}
                      >
                        <div className="op-item-icon">
                          {{ QUERY:<SearchIcon/>, SUMMARIZE:<ListIcon/>, DIFF:<DiffIcon/>, EXTRACT:<ExtractIcon/>, MAP:<MapIcon/> }[key]}
                        </div>
                        <span>{op.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="query-input-wrap">
                <div className="query-input-header">
                  <span className="qih-label">input://</span>
                  <span className="qih-op">{OP_MAP[activeOp].label}</span>
                  <span className="qih-cursor">▊</span>
                  <div style={{ flex: 1 }} />
                </div>
                <textarea
                  className="query-textarea"
                  placeholder={isOverLimit ? "Storage limit reached. Please upgrade to run further queries." : OP_MAP[activeOp].ph}
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  disabled={isOverLimit}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit && !isOverLimit) { setSubmitting(true); setTimeout(() => setSubmitting(false), 2000); }}}
                />



                {showBottomPanel && (
                  <div className="stream-log" ref={streamLogRef}>
                    {streamLog.length === 0 ? (
                      <div className="log-entry" style={{ opacity: 0.4, justifyContent: "center", padding: "10px 0" }}>
                        <span className="log-msg" style={{ fontSize: "9px" }}>[IDLE] Waiting for event signals...</span>
                      </div>
                    ) : (
                      streamLog.map((entry, i) => (
                        <div key={i} className="log-entry">
                          <span className="log-ts">{entry.ts}</span>
                          <span className="log-file">{entry.file.length > 18 ? entry.file.slice(0,16)+"…" : entry.file}</span>
                          <span className={`log-msg ${entry.evClass}`}>{entry.msg}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="query-footer">
                  <div className="session-usage">
                    <span>session window</span>
                    <div className="usage-bar-track">
                      <div className="usage-bar-fill" style={{ width: `${sessionPct.toFixed(1)}%` }}/>
                    </div>
                    <span className="usage-pct">{sessionPct.toFixed(1)}%</span>
                  </div>
                  <button className="submit-btn" disabled={!canSubmit || submitting || isOverLimit} onClick={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 2000); }}>
                    <SendIcon />{isOverLimit ? "Limit Reached" : (submitting ? "Running…" : "Run Query")}
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      <VectorSidebar 
        isOpen={isVectorSidebarOpen} 
        tags={scopedTags} 
        vectors={filteredVectors}
        onClose={() => setIsVectorSidebarOpen(false)}
      />
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────