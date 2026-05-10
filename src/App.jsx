import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import './styles/index.css';

import Session from './components/Session/Session';
import UpgradeModal from './components/UpgradeModal/UpgradeModal';
import { useKnowDB } from './hooks/useKnowDB';
import { GEN_ID, createMockStream } from './utils/mockData';
import { FILE_STATES, OP_MAP, SEED_FILES, STORE_FILES } from './constants';
import { LogoSVG, DBIcon, UploadIcon, SearchIcon, ListIcon, DiffIcon, ExtractIcon, MapIcon, InfoIcon, MoreVerticalIcon, ActionChatIcon, FileIcon, PlusIcon, SidebarToggleIcon, TopPanelToggleIcon, BottomPanelToggleIcon, MicIcon, ImageIcon, VideoIcon, RightSidebarToggleIcon, ChevronIcon, CheckIcon, SettingsIcon, UserPlusIcon, CameraIcon, AudioRecordIcon, VideoRecordIcon, XCircleIcon, PlayIcon, EyeIcon } from './components/Icons';
const STORAGE_LIMIT_MB = 1024;

export default function App() {
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(() => {
    const saved = localStorage.getItem('kd-show-sidebar');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showTopPanel, setShowTopPanel] = useState(() => {
    const saved = localStorage.getItem('kd-show-top-panel');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showBottomPanel, setShowBottomPanel] = useState(() => {
    const saved = localStorage.getItem('kd-show-bottom-panel');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isVectorSidebarOpen, setIsVectorSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('kd-show-vector-sidebar');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const makeSession = (id, label) => ({
    id,
    label,
    files: [], // Start empty, wait for dbFiles
    isNew: false
  });

  const [sessions, setSessions] = useState([makeSession(GEN_ID(), 'Main Session')]);
  const [activeId, setActiveId] = useState(() => sessions[0].id);
  const [searchMode, setSearchMode] = useState('TEXT');
  const [searchValue, setSearchValue] = useState('');
  const [searchAttachments, setSearchAttachments] = useState([]); // [{id, type:'image'|'audio'|'video', name, url, blob}]
  const [previewMedia, setPreviewMedia] = useState(null); // {type, url, name}
  const [recordingStream, setRecordingStream] = useState(null);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const searchMediaRef = useRef();
  const cameraInputRef = useRef();
  const videoInputRef = useRef();
  const audioInputRef = useRef();
  const mediaRecorderRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const videoPreviewRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const recordingStartTimeRef = useRef(0);

  // Persist layout settings
  useEffect(() => {
    localStorage.setItem('kd-show-sidebar', JSON.stringify(showSidebar));
  }, [showSidebar]);
  useEffect(() => {
    localStorage.setItem('kd-show-top-panel', JSON.stringify(showTopPanel));
  }, [showTopPanel]);
  useEffect(() => {
    localStorage.setItem('kd-show-bottom-panel', JSON.stringify(showBottomPanel));
  }, [showBottomPanel]);
  useEffect(() => {
    localStorage.setItem('kd-show-vector-sidebar', JSON.stringify(isVectorSidebarOpen));
  }, [isVectorSidebarOpen]);

  // Sync recording stream to video element
  useEffect(() => {
    if (isRecordingVideo && recordingStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = recordingStream;
    }
  }, [isRecordingVideo, recordingStream]);

  // Close media menu on outside click
  useEffect(() => {
    function handler(e) {
      if (searchMediaRef.current && !searchMediaRef.current.contains(e.target) && !e.target.closest('.fs-media-menu')) {
        setIsMediaMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function addSearchAttachment(blob, type, name) {
    const url = URL.createObjectURL(blob);
    const id = Date.now() + Math.random();
    setSearchAttachments(prev => [...prev, { id, type, name, url, blob }]);
  }

  function removeSearchAttachment(id) {
    setSearchAttachments(prev => {
      const a = prev.find(x => x.id === id);
      if (a) URL.revokeObjectURL(a.url);
      return prev.filter(x => x.id !== id);
    });
  }

  function handleSearchPaste(e) {
    const items = Array.from(e.clipboardData?.items || []);
    items.forEach(item => {
      if (item.kind === 'file') {
        const blob = item.getAsFile();
        if (!blob) return;
        const isImg = blob.type.startsWith('image/');
        const isVid = blob.type.startsWith('video/');
        const isAud = blob.type.startsWith('audio/');
        if (isImg || isVid || isAud) {
          e.preventDefault();
          const type = isImg ? 'image' : isVid ? 'video' : 'audio';
          addSearchAttachment(blob, type, blob.name || type + '_paste');
        }
      }
    });
  }

  async function startAudioRecord() {
    setIsMediaMenuOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
      const source = audioContext.createMediaStreamSource(stream);

      // High-pass filter to remove low-frequency rumble (< 100Hz)
      const highpass = audioContext.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 100;

      // Low-pass filter to remove high-frequency hiss (> 7000Hz)
      const lowpass = audioContext.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 7000;

      // Dynamics compressor to normalize voice levels
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, audioContext.currentTime);
      compressor.knee.setValueAtTime(40, audioContext.currentTime);
      compressor.ratio.setValueAtTime(12, audioContext.currentTime);
      compressor.attack.setValueAtTime(0, audioContext.currentTime);
      compressor.release.setValueAtTime(0.25, audioContext.currentTime);

      const gainNode = audioContext.createGain();
      const destination = audioContext.createMediaStreamDestination();

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(destination);

      const mr = new MediaRecorder(destination.stream);
      mediaChunksRef.current = [];
      mr.ondataavailable = e => mediaChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' });
        addSearchAttachment(blob, 'audio', 'recording.webm');
        stream.getTracks().forEach(t => t.stop());
        audioContext.close();
        setIsRecordingAudio(false);
      };
      
      mr.start();
      mediaRecorderRef.current = mr;
      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;
      recordingStartTimeRef.current = Date.now();
      setIsRecordingAudio(true);
    } catch (err) { 
      console.error("Failed to start audio recording", err);
      setIsRecordingAudio(false); 
    }
  }

  function stopAudioRecord() {
    if (!mediaRecorderRef.current || !isRecordingAudio) return;
    
    const elapsed = Date.now() - recordingStartTimeRef.current;
    const minDuration = 8000; // 8 seconds

    if (elapsed < minDuration) {
      // Mute the input and wait for the remainder of the 8 seconds
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1);
      }
      // Keep UI state as recording (or maybe "Processing...")
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, minDuration - elapsed);
    } else {
      mediaRecorderRef.current.stop();
    }
  }

  async function startVideoRecord() {
    setIsMediaMenuOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setRecordingStream(stream);
      const mr = new MediaRecorder(stream);
      mediaChunksRef.current = [];
      mr.ondataavailable = e => mediaChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(mediaChunksRef.current, { type: 'video/webm' });
        addSearchAttachment(blob, 'video', 'recording.webm');
        stream.getTracks().forEach(t => t.stop());
        setRecordingStream(null);
        setIsRecordingVideo(false);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecordingVideo(true);
    } catch { setIsRecordingVideo(false); setRecordingStream(null); }
  }

  function stopVideoRecord() {
    mediaRecorderRef.current?.stop();
  }

  const [activeVectorStore, setActiveVectorStore] = useState({ id: 'global', name: 'Global Corpus', description: 'Universal file storage' });
  const [isVSMenuOpen, setIsVSMenuOpen] = useState(false);
  const [isVSSwitching, setIsVSSwitching] = useState(false);

  const {
    vectorStores,
    files: dbFiles,
    fileStatuses,
    searchResults,
    performSearch,
    uploadFile,
    fetchFiles,
    fetchVectorStores,
    deleteFile
  } = useKnowDB({ selectedVectorStore: activeVectorStore?.id });

  // Sync real files from backend to the active session
  useEffect(() => {
    if (dbFiles && dbFiles.length > 0) {
      setSessions(prev => {
        // Smarter sync: Identify which files are already in ANY session
        const allCurrentFiles = prev.flatMap(s => s.files);
        const updatedSessions = prev.map(s => {
          const sessionFiles = s.files;
          
          // Files that belong to THIS session
          const filesToKeep = [];
          
          // For each file in the DB, decide if it belongs here
          dbFiles.forEach(f => {
            const existingInAny = allCurrentFiles.find(cf => cf.path === f.filename || cf.id === f.id);
            const isNew = !existingInAny && (Date.now() - (f.created_at * 1000) < 300000);
            
            const stats = [
              { v: f.chunk_count || '?', k: "CHUNKS" },
              { v: f.bytes ? (f.bytes / (1024 * 1024)).toFixed(1) : '0', k: "MB" },
              { v: f.status.toUpperCase(), k: "STATE" }
            ];
            if (f.created_at) {
              const date = new Date(f.created_at * 1000);
              stats.push({ v: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), k: "INDEXED" });
            }

            const tags = [];
            if (f.mime_type) {
              const type = f.mime_type.split('/')[0];
              const color = { image: 'violet', video: 'red', audio: 'amber', text: 'blue' }[type] || 'gray';
              tags.push([color, f.mime_type.split('/').pop().toUpperCase()]);
            }
            if (f.tags) {
              f.tags.forEach(t => {
                if (!t.startsWith('mime:') && !t.startsWith('charset:')) {
                  tags.push(['teal', t.toUpperCase()]);
                }
              });
            }

            const fileObj = {
              ...(existingInAny || {}),
              id: f.id,
              name: f.filename,
              path: f.filename,
              isNew: isNew || existingInAny?.isNew,
              type: f.mime_type?.startsWith('video') ? 'vid' : 
                    f.mime_type?.startsWith('audio') ? 'audio' : 
                    f.mime_type?.startsWith('image') ? 'img' : 'vec',
              mb: f.bytes ? Math.round(f.bytes / (1024 * 1024)) : 0,
              state: f.status === 'processed' ? 'READY' : f.status === 'processing' ? 'LEARNING' : 'QUEUED',
              progress: f.status === 'processed' ? 100 : 0,
              tags: tags.length > 0 ? tags : [['gray', 'UNTAGGED']],
              stats: stats,
              details: {
                id: f.id,
                purpose: f.purpose,
                mime: f.mime_type,
                vs: f.vector_store_id || 'global'
              }
            };

            // If it's already in this session, or it's brand new and this is the active session
            const isInThisSession = s.files.some(cf => cf.path === f.filename || cf.id === f.id);
            const isAssignedElsewhere = !isInThisSession && allCurrentFiles.some(cf => (cf.path === f.filename || cf.id === f.id) && !s.files.includes(cf));
            
            if (isInThisSession || (!isAssignedElsewhere && s.id === activeId)) {
              filesToKeep.push(fileObj);
            }
          });
          
          return { ...s, files: filesToKeep };
        });
        
        return updatedSessions;
      });
    }
  }, [dbFiles, activeId]);

  const [managingVS, setManagingVS] = useState(null);
  const [vsEditName, setVsEditName] = useState('');
  const [vsEditDesc, setVsEditDesc] = useState('');

  // Auto-fetch on mount and vector store change
  useEffect(() => {
    fetchVectorStores();
    fetchFiles();
  }, [fetchVectorStores, fetchFiles, activeVectorStore?.id]);

  const switchVectorStore = async (vs) => {
    if (vs.id === activeVectorStore?.id) { setIsVSMenuOpen(false); return; }
    setIsVSMenuOpen(false);
    setIsVSSwitching(true);
    
    // The hook will trigger fetchFiles when activeVectorStore.id changes
    setActiveVectorStore(vs);
    
    // Brief delay for UX feel
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsVSSwitching(false);
  };

  const [ttl, setTtl] = useState(3600);

  useEffect(() => {
    const t = setInterval(() => setTtl(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const ttlStr = `${String(Math.floor(ttl / 60)).padStart(2, "0")}:${String(ttl % 60).padStart(2, "0")}`;

  const activeSession = sessions.find(s => s.id === activeId);
  const totalUsedMb = activeSession ? activeSession.files.reduce((sum, f) => sum + f.mb, 0) : 0;
  const meterPct = Math.min(100, (totalUsedMb / STORAGE_LIMIT_MB) * 100);
  const isOverLimit = totalUsedMb >= STORAGE_LIMIT_MB;

  useEffect(() => {
    if (isOverLimit) {
      setIsLimitModalOpen(true);
    }
  }, [isOverLimit]);

  function addSession() {
    const s = makeSession(false);
    setSessions(prev => [...prev, s]);
    setActiveId(s.id);
  }
  function moveFile(fileId, fromSessionId, toSessionId) {
    if (toSessionId === 'new') {
      const s = makeSession(false);
      setSessions(prev => {
        const fromSession = prev.find(p => p.id === fromSessionId);
        if (!fromSession) return prev;
        const file = fromSession.files.find(f => f.id === fileId);
        if (!file) return prev;
        const movedFile = { ...file, isNew: false };
        return [...prev.map(p => p.id === fromSessionId ? { ...p, files: p.files.filter(f => f.id !== fileId) } : p), { ...s, files: [movedFile] }];
      });
      setActiveId(s.id);
    } else {
      setSessions(prev => {
        const fromSession = prev.find(p => p.id === fromSessionId);
        if (!fromSession) return prev;
        const file = fromSession.files.find(f => f.id === fileId);
        if (!file) return prev;
        const movedFile = { ...file, isNew: false };
        return prev.map(p => {
          if (p.id === fromSessionId) return { ...p, files: p.files.filter(f => f.id !== fileId) };
          if (p.id === toSessionId) return { ...p, files: [...p.files, movedFile] };
          return p;
        });
      });
    }
  }
  function closeSession(id, e) {
    e.stopPropagation();
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) return prev; 
      return next;
    });
    if (activeId === id) {
      setSessions(prev => {
        const next = prev.filter(s => s.id !== id);
        if (next.length > 0) setActiveId(next[next.length - 1].id);
        return next;
      });
    }
  }

  return (
    <div className="app-container">
      <UpgradeModal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} />
      
      <div className="app-layout">
        <div className="topbar">
          <div className="topbar-logo"><LogoSVG /></div>
          <div className="ephem-badge" data-tooltip="All session data will be erased when you close this session. Upgrade to retain all data.">
            <div className="ephem-dot"/>
            <span className="ephem-label">EPHEMERAL SESSION</span>
          </div>
          <div className="meter-wrap">
            <span className="meter-label">1 GB limit</span>
            <div className="meter-track">
              <div className={`meter-fill ${isOverLimit ? "critical" : ""}`} style={{ width: `${meterPct}%` }}/>
            </div>
            <span className={`meter-val ${isOverLimit ? "critical" : ""}`}>{totalUsedMb} MB used</span>
          </div>
          <div style={{ flex:1, display: 'flex', justifyContent: 'center' }}>
            {isOverLimit && (
              <div className="topbar-alert">
                <InfoIcon size={14}/>
                <span>Storage limit reached. Inference paused.</span>
                <button className="upgrade-btn-small" onClick={() => setIsLimitModalOpen(true)}>Upgrade Account</button>
              </div>
            )}
          </div>
          <div className="session-meta">
            <span>SESSION <span className="session-id-val">{activeId}</span></span>
            <div className="ttl-wrap">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>TTL</span> <span className="ttl-val">{ttlStr}</span>
            </div>
          </div>
          <div className="layout-toggles">
            <button className={`layout-toggle-btn ${showSidebar ? "active" : ""}`} onClick={() => setShowSidebar(!showSidebar)}>
              <SidebarToggleIcon active={showSidebar} />
            </button>
            <button className={`layout-toggle-btn ${showTopPanel ? "active" : ""}`} onClick={() => setShowTopPanel(!showTopPanel)}>
              <TopPanelToggleIcon active={showTopPanel} />
            </button>
            <button className={`layout-toggle-btn ${showBottomPanel ? "active" : ""}`} onClick={() => setShowBottomPanel(!showBottomPanel)}>
              <BottomPanelToggleIcon active={showBottomPanel} />
            </button>
            <button className={`layout-toggle-btn ${isVectorSidebarOpen ? "active" : ""}`} onClick={() => setIsVectorSidebarOpen(!isVectorSidebarOpen)}>
              <RightSidebarToggleIcon active={isVectorSidebarOpen} />
            </button>
          </div>
          <div className="user-chip">
            <div className="avatar">JA</div>
            <span className="user-name">Joel Augé</span>
          </div>
        </div>

        <div className="tabs-bar">
          <div className="global-search-wrap" ref={searchMediaRef}>
            <div className={`fs-search-input-box ${searchAttachments.length > 0 ? 'has-attachments' : ''}`}>
              <div className="fs-search-box-inner">
                {/* Left icon — opens media capture menu */}
                <button
                  className={`fs-media-trigger ${isMediaMenuOpen ? 'active' : ''} ${isRecordingAudio || isRecordingVideo ? 'recording' : ''}`}
                  onClick={() => {
                    if (isRecordingAudio) { stopAudioRecord(); return; }
                    if (isRecordingVideo) { stopVideoRecord(); return; }
                    setIsMediaMenuOpen(v => !v);
                  }}
                  title={isRecordingAudio ? 'Stop recording' : isRecordingVideo ? 'Stop recording' : 'Attach media'}
                >
                  {isRecordingAudio || isRecordingVideo
                    ? <span className="fs-rec-dot" />
                    : <SearchIcon size={14} />}
                </button>

                {/* Video Recording Live Preview — Rendered via Portal */}
                {isRecordingVideo && createPortal(
                  <div className="video-recording-viewer">
                    <video ref={videoPreviewRef} autoPlay muted playsInline />
                    <div className="v-rec-status">
                      <span className="v-rec-dot" />
                      REC
                    </div>
                  </div>,
                  document.body
                )}

                {/* Media capture popover — Rendered via Portal */}
                {isMediaMenuOpen && createPortal(
                  <div 
                    className="fs-media-menu" 
                    style={{ 
                      position: 'fixed', 
                      top: searchMediaRef.current?.getBoundingClientRect().bottom + 6 + 'px',
                      left: searchMediaRef.current?.getBoundingClientRect().left + 'px'
                    }}
                  >
                    <button className="fs-media-item" onClick={() => { setIsMediaMenuOpen(false); cameraInputRef.current?.click(); }}>
                      <span className="fs-media-item-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><CameraIcon size={14} /></span>
                      <div>
                        <div className="fs-media-item-label">Take a Picture</div>
                        <div className="fs-media-item-sub">Capture from camera or paste screenshot</div>
                      </div>
                    </button>
                    <button className="fs-media-item" onClick={startAudioRecord}>
                      <span className="fs-media-item-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><AudioRecordIcon size={14} /></span>
                      <div>
                        <div className="fs-media-item-label">Record Audio</div>
                        <div className="fs-media-item-sub">Capture mic input · click again to stop</div>
                      </div>
                    </button>
                    <button className="fs-media-item" onClick={startVideoRecord}>
                      <span className="fs-media-item-icon" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563eb' }}><VideoRecordIcon size={14} /></span>
                      <div>
                        <div className="fs-media-item-label">Record Video</div>
                        <div className="fs-media-item-sub">Capture camera + mic · click again to stop</div>
                      </div>
                    </button>
                    <div className="fs-media-divider" />
                    <div className="fs-media-hint">You can also paste images, audio, or video directly</div>
                  </div>,
                  document.body
                )}

                {/* Hidden file inputs for camera/video capture */}
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) addSearchAttachment(f, 'image', f.name); e.target.value=''; }} />
                <input ref={videoInputRef} type="file" accept="video/*" capture="environment" style={{ display:'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) addSearchAttachment(f, 'video', f.name); e.target.value=''; }} />
                <input ref={audioInputRef} type="file" accept="audio/*" style={{ display:'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) addSearchAttachment(f, 'audio', f.name); e.target.value=''; }} />

                <input
                  type="text"
                  className="fs-search-input"
                  placeholder={
                    isRecordingAudio ? '🔴 Recording audio… click microphone icon to stop' :
                    isRecordingVideo ? '🔴 Recording video… click icon to stop' :
                    searchMode === 'TEXT' ? 'Search by filename or content…' :
                    searchMode === 'AUDIO' ? 'Search for spoken words or sounds…' :
                    'Search for objects, text in images, or scenes…'
                  }
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  onPaste={handleSearchPaste}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      performSearch({
                        query: searchValue,
                        mode: searchMode === 'TEXT' ? 'fts' : 'vector',
                        field: searchMode.toLowerCase(),
                        file: searchAttachments.length > 0 ? searchAttachments[0].blob : null,
                        vsId: activeVectorStore.id
                      });
                    }
                  }}
                />
                <div className="fs-search-toggles">
                  <button className={`fs-search-toggle-btn ${searchMode === 'TEXT' ? 'active' : ''}`} onClick={() => setSearchMode('TEXT')}><SearchIcon size={12} /></button>
                  <button className={`fs-search-toggle-btn ${searchMode === 'AUDIO' ? 'active' : ''}`} onClick={() => setSearchMode('AUDIO')}><MicIcon size={12} /></button>
                  <button className={`fs-search-toggle-btn ${searchMode === 'VISUAL' ? 'active' : ''}`} onClick={() => setSearchMode('VISUAL')}><VideoIcon size={12} /></button>
                </div>
              </div>

              {/* Attachment chips — shown when media has been added */}
              {searchAttachments.length > 0 && (
                <div className="search-attachment-strip">
                  {searchAttachments.map(a => (
                    <div key={a.id} className={`search-attach-chip search-attach-chip-${a.type}`}>
                      {a.type === 'image' && (
                        <div className="attach-thumb-wrap">
                          <img src={a.url} alt={a.name} className="attach-thumb" />
                          <div className="attach-img-preview-box">
                            <img src={a.url} alt={a.name} />
                          </div>
                        </div>
                      )}
                      {(a.type === 'audio' || a.type === 'video') && (
                        <button className="attach-play-btn" onClick={() => setPreviewMedia(a)} title="Preview">
                          <PlayIcon size={10} />
                        </button>
                      )}
                      {a.type === 'audio' && (
                        <span className="attach-icon-wrap" style={{ color: '#ef4444' }}><MicIcon size={12} /></span>
                      )}
                      {a.type === 'video' && (
                        <span className="attach-icon-wrap" style={{ color: '#2563eb' }}><VideoIcon size={12} /></span>
                      )}
                      <span className="attach-name">{a.name.length > 18 ? a.name.slice(0, 16) + '…' : a.name}</span>
                      <button 
                        className="attach-ingest-btn" 
                        onClick={(e) => { e.stopPropagation(); uploadFile(a.blob, a.name); removeSearchAttachment(a.id); }}
                        title="Save to Corpus"
                      >
                        <UploadIcon size={12} />
                      </button>
                      <button className="attach-remove" onClick={() => removeSearchAttachment(a.id)}>
                        <XCircleIcon size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Media Preview Modal */}
          {previewMedia && createPortal(
            <div className="media-preview-overlay" onClick={() => setPreviewMedia(null)}>
              <div className="media-preview-content" onClick={e => e.stopPropagation()}>
                <button className="media-preview-close" onClick={() => setPreviewMedia(null)}><XCircleIcon size={20} /></button>
                <div className="media-preview-header">{previewMedia.name}</div>
                <div className="media-preview-body">
                  {previewMedia.type === 'audio' && (
                    <audio controls autoPlay src={previewMedia.url} className="preview-audio" />
                  )}
                  {previewMedia.type === 'video' && (
                    <video controls autoPlay src={previewMedia.url} className="preview-video" />
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
          <div className="tabs-divider" />
          {sessions.map(s => (
            <div
              key={s.id}
              className={`tab-item ${s.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(s.id)}
            >
              {s.hasActivity && s.files.some(f => f.state !== "READY" && f.state !== "QUEUED") && (
                <div className="tab-activity"/>
              )}
              <span>{s.label}</span>
              <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", marginLeft:"2px" }}>
                {s.files.length > 0 ? `· ${s.files.length}f` : "· empty"}
              </span>
              {sessions.length > 1 && (
                <div className="tab-close" onClick={e => closeSession(s.id, e)}>×</div>
              )}
            </div>
          ))}
          <div className="tab-add" onClick={addSession}>
            <PlusIcon /> session
          </div>

          <div style={{ flex: 1 }} />

          <div className="vs-selector-wrap">
            <button
              className={`vs-selector-btn ${isVSMenuOpen ? 'active' : ''} ${isVSSwitching ? 'switching' : ''}`}
              onClick={() => !isVSSwitching && setIsVSMenuOpen(!isVSMenuOpen)}
            >
              {isVSSwitching ? (
                <><span className="vs-spinner" />Connecting...</>
              ) : (
                <><DBIcon size={12} /><span>{activeVectorStore.name}</span><ChevronIcon size={10} style={{ transform: isVSMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} /></>
              )}
            </button>
            
            {isVSMenuOpen && (
              <div className="vs-menu">
                <div className="vs-menu-header">Select Vector Store</div>
                {/* Always show Global Corpus */}
                <div 
                  className={`vs-menu-item ${activeVectorStore.id === 'global' ? 'active' : ''}`}
                  onClick={() => switchVectorStore({ id: 'global', name: 'Global Corpus', description: 'Universal file storage' })}
                >
                  <div className="vs-item-icon"><DBIcon size={12} /></div>
                  <div className="vs-item-info">
                    <div className="vs-item-name">Global Corpus</div>
                    <div className="vs-item-type">Universal file storage</div>
                  </div>
                </div>
                
                {vectorStores.map(vs => (
                  <div 
                    key={vs.id} 
                    className={`vs-menu-item ${activeVectorStore && vs.id === activeVectorStore.id ? 'active' : ''}`}
                    onClick={() => switchVectorStore(vs)}
                  >
                    <div className="vs-item-icon"><DBIcon size={12} /></div>
                    <div className="vs-item-info">
                      <div className="vs-item-name">{vs.name}</div>
                      <div className="vs-item-type">{vs.description}</div>
                    </div>
                    <div className="vs-item-actions">
                      {activeVectorStore && vs.id === activeVectorStore.id && <div className="vs-item-check"><CheckIcon /></div>}
                      <button 
                        className="vs-item-manage-btn" 
                        onClick={(e) => { e.stopPropagation(); setManagingVS(vs); setVsEditName(vs.name); setVsEditDesc(vs.description || ''); setIsVSMenuOpen(false); }}
                        title="Manage Vector Store"
                      >
                        <SettingsIcon size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="vs-menu-divider" />
                <div className="vs-menu-item vs-menu-add">
                  <div className="vs-item-icon"><PlusIcon /></div>
                  <span>Create New Store</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="session-body">
          {sessions.map(s => (
            <Session 
              key={s.id} 
              session={s} 
              isActive={s.id === activeId} 
              isOverLimit={isOverLimit} 
              sessionPct={meterPct}
              showSidebar={showSidebar}
              showTopPanel={showTopPanel}
              showBottomPanel={showBottomPanel}
              isVectorSidebarOpen={isVectorSidebarOpen}
              setIsVectorSidebarOpen={setIsVectorSidebarOpen}
              searchMode={searchMode}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              activeVectorStoreId={activeVectorStore?.id}
              availableSessions={sessions.filter(as => as.id !== s.id)}
              setFiles={(updater) => {
                setSessions(prev => prev.map(p => p.id === s.id ? { ...p, files: typeof updater === 'function' ? updater(p.files) : updater } : p));
              }}
              moveFile={moveFile}
              onUpgradeClick={() => setIsLimitModalOpen(true)} 
              performSearch={performSearch}
              searchResults={searchResults}
              uploadFile={uploadFile}
              deleteFile={deleteFile}
              fileStatuses={fileStatuses}
            />
          ))}
        </div>
      </div>

      {managingVS && (
        <div className="modal-overlay" onClick={() => setManagingVS(null)}>
          <div className="modal-card vs-manage-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon"><DBIcon size={24} /></div>
              <div className="modal-title-wrap">
                <div className="modal-title">Manage Vector Store</div>
                <div className="modal-subtitle">KnowDB &middot; {managingVS.id}</div>
              </div>
              <button className="modal-close" onClick={() => setManagingVS(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <label>Store Name</label>
                <input
                  type="text"
                  value={vsEditName}
                  onChange={e => setVsEditName(e.target.value)}
                  placeholder="e.g. Primary Brain"
                />
              </div>

              <div className="form-section">
                <label>Description</label>
                <textarea
                  value={vsEditDesc}
                  onChange={e => setVsEditDesc(e.target.value)}
                  placeholder="Describe what this vector store is used for..."
                  rows={3}
                />
              </div>

              <div className="vs-permissions-panel">
                <div className="panel-header">
                  <div className="panel-title"><UserPlusIcon size={14} /> Permissions & Access</div>
                  <button className="panel-add-btn">Invite Collaborator</button>
                </div>
                <div className="panel-users-list">
                  <div className="panel-user-row">
                    <div className="user-avatar">JA</div>
                    <div className="user-info">
                      <div className="user-display-name">Joel Augé (You)</div>
                      <div className="user-role">Owner</div>
                    </div>
                  </div>
                  <div className="panel-user-row">
                    <div className="user-avatar" style={{ background: 'var(--teal)' }}>SD</div>
                    <div className="user-info">
                      <div className="user-display-name">Sarah Doe</div>
                      <div className="user-role">Editor</div>
                    </div>
                    <button className="user-remove">Revoke</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={() => setManagingVS(null)}>Cancel</button>
              <button
                className="modal-btn modal-btn-primary"
                onClick={() => {
                  const trimmedName = vsEditName.trim() || managingVS.name;
                  setVectorStores(prev => prev.map(vs =>
                    vs.id === managingVS.id
                      ? { ...vs, name: trimmedName, description: vsEditDesc }
                      : vs
                  ));
                  // keep activeVectorStore in sync if it was the one being edited
                  if (activeVectorStore?.id === managingVS.id) {
                    setActiveVectorStore(prev => ({ ...prev, name: trimmedName, description: vsEditDesc }));
                  }
                  setManagingVS(null);
                }}
              >Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
