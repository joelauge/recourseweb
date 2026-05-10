import React, { useState, useEffect, useRef, useCallback } from 'react';
import FileCard from '../FileCard/FileCard';
import { OP_MAP } from '../../constants';
import { UploadIcon, SearchIcon, ListIcon, DiffIcon, ExtractIcon, MapIcon, InfoIcon, DBIcon, FileIcon, WarnIcon, ChatIcon, CheckIcon, MoveIcon, SendIcon, ViewToggleIcon, ChevronIcon, TreeViewIcon, MicIcon, ImageIcon, VideoIcon } from '../Icons';
import FileTree from '../FileTree/FileTree';
import VectorSidebar from '../VectorSidebar/VectorSidebar';
import FileViewer from '../FileViewer/FileViewer';

export default function Session({ session, isActive, isOverLimit, sessionPct, onUpgradeClick, setFiles, availableSessions, moveFile, showSidebar, showTopPanel, showBottomPanel, isVectorSidebarOpen, setIsVectorSidebarOpen, searchMode, searchValue, setSearchValue, activeVectorStoreId, performSearch, searchResults, uploadFile, deleteFile, fileStatuses }) {
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
  const [scopedTags, setScopedTags] = useState(new Set());
  const [isOpMenuOpen, setIsOpMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  const [realAtoms, setRealAtoms] = useState([]);
  const [isFetchingAtoms, setIsFetchingAtoms] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [openFiles, setOpenFiles] = useState([]); // List of file objects
  const [activeOpenFileId, setActiveOpenFileId] = useState(null);

  const fileInputRef = useRef();
  const opMenuRef = useRef();
  const streamLogRef = useRef();
  const chatEndRef = useRef();
  const dragEnterCount = useRef(0);
  const trayEnterCount = useRef(0);
  const tagTrayEnterCount = useRef(0);

  useEffect(() => {
    if (scopedTags.size > 0) {
      setIsVectorSidebarOpen(true);
    } else {
      setIsVectorSidebarOpen(false);
    }
  }, [scopedTags.size]);

  const filteredVectors = searchResults && searchResults.length > 0
    ? searchResults
    : realAtoms;

  // Fetch real atoms when scope changes
  const scopedIdsStr = JSON.stringify(Array.from(scopedIds));
  useEffect(() => {
    if (scopedIds.size === 0) {
      setRealAtoms([]);
      return;
    }

    const ids = Array.from(scopedIds);
    const lastId = ids[ids.length - 1];
    const file = files.find(f => f.id === lastId);
    if (!file || file.state !== "READY") return;

    let isMounted = true;
    const fetchAtoms = async () => {
      setIsFetchingAtoms(true);
      try {
        const res = await fetch(`/search?query=${encodeURIComponent(file.path)}&mode=uri&limit=15`);
        if (!res.ok) throw new Error("Failed to fetch atoms");
        const data = await res.json();
        if (isMounted) setRealAtoms(data.atoms || []);
      } catch (err) {
        console.error("Atom fetch error:", err);
      } finally {
        if (isMounted) setIsFetchingAtoms(false);
      }
    };

    fetchAtoms();
    return () => { isMounted = false; };
  }, [scopedIdsStr, files]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isThinking]);

  const setFilesRef = useRef(setFiles);
  useEffect(() => { setFilesRef.current = setFiles; }, [setFiles]);

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

  const handleStatusUpdate = useCallback((uri, data) => {
    setFilesRef.current(prev => prev.map(f => {
      if (f.path !== uri) return f;

      const { status, chunks_processed, chunks_total } = data;
      let state = "QUEUED";
      let progress = 0;
      let msg = "Processing...";

      if (status === 'processed' || status === 'ready' || status === 'completed') {
        state = "READY";
        progress = 100;
        msg = "Ingestion complete";
      } else if (status === 'indexing') {
        state = "INDEXING";
        progress = 50;
        msg = `Indexing chunks... (${chunks_processed || 0}/${chunks_total || '?'})`;
      } else if (status === 'learning' || status === 'processing') {
        state = "LEARNING";
        progress = 30;
        msg = status === 'learning' ? "Extracting embeddings..." : "Analyzing content...";
      }

      const typeColor = { vec: "blue", kb: "teal", vid: "red", img: "violet", raw: "amber" }[f.type] || "gray";
      const ext = f.path.split(".").pop().toUpperCase();

      const newTags = state === "READY"
        ? [[typeColor, ext], ["gray", (f.mb || 0) + " MB"], ["green", "SUPERVECTOR"]]
        : [[state === "INDEXING" ? "blue" : "violet", state], ["gray", (f.mb || 0) + " MB"]];

      const newStats = state === "READY"
        ? [{ v: chunks_total || Math.round((f.mb || 1) * 8.2), k: "VECTORS" }, { v: "READY", k: "STATE" }, { v: "0.95", k: "DENSITY" }, { v: "LOCAL", k: "LOC" }]
        : [{ v: chunks_processed || 0, k: "CHUNKS" }, { v: "BERT", k: "MODEL" }, { v: "TASK", k: state }];

      return {
        ...f,
        state,
        progress,
        logs: [...(f.logs || []).slice(-3), msg],
        tags: newTags,
        stats: newStats
      };
    }));
  }, []);

  // Effect to sync file statuses from hook
  useEffect(() => {
    Object.entries(fileStatuses).forEach(([uri, data]) => {
      handleStatusUpdate(uri, data);
    });
  }, [fileStatuses, handleStatusUpdate]);


  const scopedFiles = files.filter(f => scopedIds.has(f.id));
  const totalScopedMb = scopedFiles.reduce((s, f) => s + f.mb, 0);

  function addToScope(file) {
    if (file.state !== "READY") return;
    setScopedIds(prev => new Set([...prev, file.id]));
  }
  function removeFromScope(id) {
    setScopedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  function handleFileClick(file) { addToScope(file); }
  
  function handleFileDoubleClick(file) {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveOpenFileId(file.id);
  }

  function closeFile(e, fileId) {
    e.stopPropagation();
    setOpenFiles(prev => {
      const next = prev.filter(f => f.id !== fileId);
      if (activeOpenFileId === fileId) {
        setActiveOpenFileId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  }

  function handleDragStart(e, file) {
    if (file.state !== "READY") return;
    e.dataTransfer.setData("application/x-knowdrive-file", file.id);
    e.dataTransfer.effectAllowed = "copyMove";
    setDraggingId(file.id);
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, dragging: true } : f));
  }
  function handleDragEnd(e) {
    setDraggingId(null);
    setFiles(prev => prev.map(f => ({ ...f, dragging: false })));
  }

  function handleTrayDrop(e) {
    e.preventDefault();
    setTrayDragOver(false);

    const tag = e.dataTransfer.getData("application/x-knowdrive-tag");
    if (tag) {
      setScopedTags(prev => new Set([...prev, tag]));
      addLogEntry("SYSTEM", `[SCOPE] Added tag #${tag} to active query context`, "ev-ready");
      return;
    }

    const fileId = e.dataTransfer.getData("application/x-knowdrive-file") || draggingId;
    if (fileId) {
      const f = files.find(f => f.id === fileId);
      if (f) {
        addToScope(f);
        addLogEntry(f.id, `[SCOPE] Added file to active query context`, "ev-ready");
      }
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
      addLogEntry("SYSTEM", `[SCOPE] Added tag #${tag} to active query context`, "ev-ready");
    }
  }

  function handleListOSDrop(e) {
    dragEnterCount.current = 0; setListDragOver(false);
    if (!e.dataTransfer.files.length) return;
    e.preventDefault();
    handleOSFileDrop(Array.from(e.dataTransfer.files));
  }

  async function handleOSFileDrop(osFiles) {
    for (const f of osFiles) {
      try {
        await uploadFile(f);
        addLogEntry(f.name, `[UPLOAD] File sent to KnowDB pipeline`, "ev-remembering");
      } catch (err) {
        addLogEntry(f.name, `[ERROR] Upload failed: ${err.message}`, "ev-error");
      }
    }
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
    <div style={{ display: "flex", flex: 1, flexDirection: "row", overflow: "hidden", position: "relative", minHeight: 0 }}>
      <div className={`fs-overlay ${isFilesDrawerOpen ? "active" : ""}`} onClick={() => setIsFilesDrawerOpen(false)} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

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
              <input ref={fileInputRef} type="file" multiple style={{ display: "none" }}
                onChange={e => { handleOSFileDrop(Array.from(e.target.files)); e.target.value = ""; }} />
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
              <span style={{ color: "var(--text-muted)" }}> / </span>
              <span>session</span>
              <span style={{ color: "var(--text-muted)" }}> / </span>
              <span className="crumb-active">{session.id}</span>
            </div>
          </div>

          <div
            className="file-list-wrap"
            onDragEnter={e => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); dragEnterCount.current++; setListDragOver(true); } }}
            onDragLeave={() => { dragEnterCount.current--; if (dragEnterCount.current <= 0) { dragEnterCount.current = 0; setListDragOver(false); } }}
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
                onFileDoubleClick={handleFileDoubleClick}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onRename={(id) => {
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
                  if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
                    deleteFile(id);
                    setFiles(prev => prev.filter(f => f.id !== id));
                    removeFromScope(id);
                  }
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
                  onDoubleClick={handleFileDoubleClick}
                  availableSessions={availableSessions}
                  onRename={(id, newName) => {
                    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
                    addLogEntry(id, `[SYSTEM] Renamed file to: ${newName}`, "ev-ready");
                  }}
                  onDelete={(id) => {
                    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
                      deleteFile(id);
                      setFiles(prev => prev.filter(f => f.id !== id));
                      removeFromScope(id);
                    }
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

        <div className={`query-panel ${!showSidebar ? "sidebar-collapsed" : ""}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className={`welcome-head ${!showTopPanel ? "collapsed" : ""}`}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <button className="mobile-only-btn" onClick={() => setIsFilesDrawerOpen(true)} style={{
                display: "none", padding: "4px 8px", borderRadius: "4px", background: "var(--blue-light)",
                border: "1px solid var(--blue-mid)", color: "var(--blue)", fontSize: "10px", fontWeight: "600",
                alignItems: "center", gap: "4px"
              }}>
                <FileIcon /> Browse Files
              </button>
              <div className="welcome-eyebrow">Session · {session.id}</div>
            </div>
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

          <div className="workspace-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px' }}>
            {/* File Tabs Bar */}
            {(openFiles.length > 0 || !hasFiles) && (
              <div className="file-tabs-bar">
                <div 
                  className={`file-tab ${!activeOpenFileId ? 'active' : ''}`} 
                  onClick={() => setActiveOpenFileId(null)}
                >
                  <SearchIcon size={12} />
                  <span>Main Session</span>
                </div>
                {openFiles.map(f => (
                  <div 
                    key={f.id} 
                    className={`file-tab ${activeOpenFileId === f.id ? 'active' : ''}`}
                    onClick={() => setActiveOpenFileId(f.id)}
                  >
                    <div className={`tab-icon-dot ${f.type}`} />
                    <span>{f.name}</span>
                    <span className="tab-close" onClick={(e) => closeFile(e, f.id)}>×</span>
                  </div>
                ))}
              </div>
            )}

            {activeOpenFileId ? (
              <div className="file-viewer-workspace" style={{ flex: 1, overflowY: 'auto' }}>
                <FileViewer 
                  file={openFiles.find(f => f.id === activeOpenFileId)} 
                  onClose={() => setActiveOpenFileId(null)}
                />
              </div>
            ) : (
              <>
                <div className="tray-layout-wrap" style={{ marginBottom: '20px' }}>
              <div
                className={`tray ${trayDragOver ? "drag-over" : ""}`}
                onDragEnter={e => { e.preventDefault(); trayEnterCount.current++; setTrayDragOver(true); }}
                onDragLeave={() => { trayEnterCount.current--; if (trayEnterCount.current <= 0) { trayEnterCount.current = 0; setTrayDragOver(false); } }}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={(e) => { trayEnterCount.current = 0; setTrayDragOver(false); handleTrayDrop(e); }}
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
                        <div className={`chip-dot chip-dot-${f.type}`} />
                        <span className="chip-name">{f.name.length > 20 ? f.name.slice(0, 18) + "…" : f.name}</span>
                        <span className="chip-size">{f.mb} MB</span>
                        <span className="chip-remove">×</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`tray tags-tray ${tagTrayDragOver ? "drag-over" : ""}`}
                onDragEnter={e => { e.preventDefault(); tagTrayEnterCount.current++; setTagTrayDragOver(true); }}
                onDragLeave={() => { tagTrayEnterCount.current--; if (tagTrayEnterCount.current <= 0) { tagTrayEnterCount.current = 0; setTagTrayDragOver(false); } }}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={(e) => { tagTrayEnterCount.current = 0; setTagTrayDragOver(false); handleTagTrayDrop(e); }}
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
              <div className="query-zone" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div className="query-split-wrap" style={{ flex: 1, display: 'flex', gap: '20px', minHeight: 0 }}>
                  {/* Left Column: Input and Activity */}
                  <div className="query-input-col" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
                    <div className="op-dropdown-container" ref={opMenuRef}>
                      <button
                        className={`op-dropdown-toggle ${isOpMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsOpMenuOpen(!isOpMenuOpen)}
                      >
                        <div className="op-current-icon">
                          {{ QUERY: <SearchIcon />, SUMMARIZE: <ListIcon />, DIFF: <DiffIcon />, EXTRACT: <ExtractIcon />, MAP: <MapIcon /> }[activeOp]}
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
                                {{ QUERY: <SearchIcon />, SUMMARIZE: <ListIcon />, DIFF: <DiffIcon />, EXTRACT: <ExtractIcon />, MAP: <MapIcon /> }[key]}
                              </div>
                              <span>{op.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="query-input-wrap" style={{ flex: 1.5, display: 'flex', flexDirection: 'column', minHeight: '180px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                      <div className="query-input-header" style={{ padding: '8px 12px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="qih-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--blue)', fontWeight: 600 }}>input://</span>
                        <span className="qih-op" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{OP_MAP[activeOp].label}</span>
                        <span className="qih-cursor" style={{ color: 'var(--blue)', animation: 'blink 1s infinite' }}>▊</span>
                      </div>
                      <textarea
                        className="query-textarea"
                        style={{ flex: 1, border: 'none', padding: '12px', fontSize: '14px', resize: 'none', outline: 'none', background: 'transparent' }}
                        placeholder={isOverLimit ? "Storage limit reached. Please upgrade to run further queries." : OP_MAP[activeOp].ph}
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        disabled={isOverLimit}
                      />

                      <div className="query-actions" style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)' }}>
                        <div className="q-status-group" style={{ display: 'flex', gap: '16px' }}>
                          <div className="q-stats" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="q-stat-label" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>session window</span>
                            <div className="q-stat-bar" style={{ width: '60px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div className="q-stat-fill" style={{ height: '100%', background: 'var(--blue)', width: `${sessionPct}%` }} />
                            </div>
                            <span className="q-stat-val" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--blue)' }}>{sessionPct.toFixed(1)}%</span>
                          </div>
                        </div>
                        <button
                          className="run-query-btn"
                          style={{
                            padding: '6px 16px', background: 'var(--blue)', color: 'white', border: 'none',
                            borderRadius: '4px', fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                            opacity: (!queryText.trim() || isOverLimit || isThinking) ? 0.5 : 1
                          }}
                          disabled={!queryText.trim() || isOverLimit || isThinking}
                          onClick={async () => {
                            if (!queryText.trim() || isOverLimit) return;
                            setIsThinking(true);
                            setChatMessages(prev => [...prev, { role: 'user', content: queryText }]);

                            try {
                              const trimmedQuery = queryText.trim();
                              const data = await performSearch({
                                query: trimmedQuery,
                                mode: activeOp === 'QUERY' ? 'vector' : activeOp.toLowerCase(),
                                field: 'content',
                                vsId: activeVectorStoreId,
                                fileIds: Array.from(scopedIds),
                                tags: Array.from(scopedTags)
                              });

                              const count = data.atoms?.length || 0;
                              const lastWord = trimmedQuery.split(' ').filter(Boolean).pop() || "query";
                              const response = count > 0
                                ? `RLLM Inference Result: I found ${count} relevant segments across the scoped files. Based on the file content, the term "${lastWord}" appears to be linked to ${data.atoms[0].uri}.`
                                : `RLLM Inference Result: I couldn't find any direct matches for "${trimmedQuery}" within the current context.`;

                              setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
                              addLogEntry("SYSTEM", `[RLLM] Inference complete. Found ${count} segments.`, "ev-ready");
                              setQueryText("");
                            } catch (err) {
                              setChatMessages(prev => [...prev, { role: 'system', content: `Error: ${err.message}` }]);
                            } finally {
                              setIsThinking(false);
                            }
                          }}
                        >
                          {isThinking ? 'Processing...' : 'Run Query'}
                        </button>
                      </div>
                    </div>

                    {showBottomPanel && (
                      <div className="activity-tray" style={{ flex: 1, minHeight: '100px', display: 'flex', flexDirection: 'column', background: '#1e1e1e', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid #333' }}>
                        <div className="at-header" style={{ padding: '6px 12px', background: '#252525', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="at-title" style={{ color: '#aaa', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>ACTIVITY STREAM</div>
                          <div className="at-status" style={{ color: '#4ade80', fontSize: '9px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} /> LIVE SIGNAL
                          </div>
                        </div>
                        <div className="at-list" style={{ flex: 1, overflowY: 'auto', padding: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                          {streamLog.length === 0 ? (
                            <div className="at-entry" style={{ color: '#666', fontStyle: 'italic', padding: '4px' }}>
                              [IDLE] Waiting for event signals...
                            </div>
                          ) : (
                            streamLog.map((log, idx) => (
                              <div key={idx} className="at-entry" style={{ display: 'flex', gap: '8px', padding: '2px 0' }}>
                                <span className="at-time" style={{ color: '#555' }}>{log.ts}</span>
                                <span className="at-name" style={{ color: '#8b5cf6' }}>{log.file}</span>
                                <span className={`at-msg ${log.evClass}`} style={{ color: '#ccc' }}>{log.msg}</span>
                              </div>
                            ))
                          )}
                          <div ref={streamLogRef} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Chat Response Stream */}
                  <div className="query-chat-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div className="chat-header" style={{ padding: '8px 14px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="chat-header-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Response Stream</span>
                      <button 
                        className="chat-clear-btn" 
                        style={{ 
                          fontSize: '10px', 
                          background: 'rgba(37, 99, 235, 0.08)', 
                          border: '1px solid rgba(37, 99, 235, 0.2)', 
                          borderRadius: '4px',
                          padding: '3px 8px',
                          color: 'var(--blue)', 
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }} 
                        onClick={() => setChatMessages([])}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {chatMessages.length === 0 ? (
                        <div className="chat-empty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '10px', opacity: 0.6 }}>
                          <SearchIcon size={32} />
                          <span style={{ fontSize: '13px' }}>Run a query to see RLLM inference results</span>
                        </div>
                      ) : (
                        <>
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role}`}>
                              {msg.content}
                            </div>
                          ))}
                          {isThinking && (
                            <div className="chat-msg ai">
                              <div className="thinking-indicator">
                                <div className="thinking-dot" />
                                <div className="thinking-dot" />
                                <div className="thinking-dot" />
                              </div>
                            </div>
                          )}
                            <div ref={chatEndRef} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </>
            )}
          </div>
        </div>

        {isVectorSidebarOpen && (
          <VectorSidebar
            isOpen={isVectorSidebarOpen}
            tags={scopedTags}
            vectors={filteredVectors}
            onClose={() => setIsVectorSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}