import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, VideoIcon, MicIcon, FileIcon, ImageIcon, CheckIcon, ChevronIcon, SearchIcon, StopIcon, PlusIcon, MinusIcon, MaximizeIcon, DBIcon, ListIcon, DiffIcon } from '../Icons';

export default function FileViewer({ file, onClose }) {
  if (!file) return null;

  const fileName = file.name || file.path || '';
  const isVideo = file.type === 'vid' || fileName.match(/\.(mp4|mov|avi|webm|mkv)$/i);
  const isAudio = file.type === 'audio' || fileName.match(/\.(mp3|wav|ogg|m4a|flac)$/i);
  const isImage = file.type === 'img' || fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
  const isDoc = file.type === 'vec' || file.type === 'raw' || file.type === 'kb' || fileName.match(/\.(pdf|doc|docx|txt|md|csv)$/i);
  const isOffice = fileName.match(/\.(docx|doc|xlsx|xls|pptx|ppt)$/i);

  const [atoms, setAtoms] = useState([]);
  const [isLoadingAtoms, setIsLoadingAtoms] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  
  const mediaRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => {
    const fetchAtoms = async () => {
      setIsLoadingAtoms(true);
      try {
        const res = await fetch(`/search?mode=uri&query=${encodeURIComponent(file.id)}&include_binary=false&limit=100`);
        if (res.ok) {
          const data = await res.json();
          const sorted = (data.atoms || []).sort((a, b) => {
            const seqA = a.sequence_index ?? 0;
            const seqB = b.sequence_index ?? 0;
            if (seqA !== seqB) return seqA - seqB;
            return (a.metadata?.snippet_start ?? 0) - (b.metadata?.snippet_start ?? 0);
          });
          setAtoms(sorted);
        }
      } catch (e) {
        console.error("Failed to fetch atoms for file", e);
      } finally {
        setIsLoadingAtoms(false);
      }
    };

    fetchAtoms();
  }, [file.id]);

  const [docUrl, setDocUrl] = useState(null);
  const contentUrl = `/v1/files/${encodeURIComponent(file.id)}/content`;

  // Prevent automatic file downloads by using blob URLs for docs/images
  useEffect(() => {
    if (!contentUrl) {
      setDocUrl(null);
      return;
    }
    
    // Video, Audio, and Office docs continue to use direct streaming or fallbacks
    if (isVideo || isAudio || isOffice) {
      setDocUrl(isVideo || isAudio ? contentUrl : null);
      return;
    }

    let isMounted = true;
    const fetchBlob = async () => {
      try {
        const response = await fetch(contentUrl);
        const blob = await response.blob();
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setDocUrl(url);
        }
      } catch (err) {
        console.error("Failed to fetch inline content:", err);
        if (isMounted) setDocUrl(contentUrl);
      }
    };

    fetchBlob();
    return () => {
      isMounted = false;
      if (docUrl && docUrl.startsWith('blob:')) {
        URL.revokeObjectURL(docUrl);
      }
    };
  }, [contentUrl, isVideo, isAudio]);

  const formatTime = (seconds) => {
    if (seconds === undefined || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const COLLABORA_SERVER_URL = "http://localhost:9980";

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (isPlaying) media.pause();
    else media.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration);
  };

  const seekTo = (time) => {
    const media = mediaRef.current;
    if (media) {
      media.currentTime = time;
      if (!isPlaying) {
        media.play();
        setIsPlaying(true);
      }
    }
  };

  const handleZoom = (delta) => {
    setZoomScale(prev => Math.min(Math.max(0.1, prev + delta), 5));
  };

  const resetZoom = () => setZoomScale(1);

  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.pageX - viewportRef.current.offsetLeft,
      y: e.pageY - viewportRef.current.offsetTop,
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - viewportRef.current.offsetLeft;
    const y = e.pageY - viewportRef.current.offsetTop;
    const walkX = (x - dragStart.x) * 1.5;
    const walkY = (y - dragStart.y) * 1.5;
    viewportRef.current.scrollLeft = dragStart.scrollLeft - walkX;
    viewportRef.current.scrollTop = dragStart.scrollTop - walkY;
  };

  const stopDragging = () => setIsDragging(false);

  return (
    <div className={`file-viewer-container fv-type-${file.type}`}>
      <div className="fv-header">
        <div className="fv-header-main">
          <div className="fv-tags-row">
            {file.tags && file.tags.map(([color, label], i) => (
              <span key={i} className={`fv-tag fv-tag-${color}`}>{label}</span>
            ))}
            {isVideo && <span className="fv-tag fv-tag-orange">AI TRANSCRIPT · 4,102 CHUNKS</span>}
            {isDoc && <span className="fv-tag fv-tag-teal">VECTORIZED · 2,341 VECTORS</span>}
          </div>
          <h1 className="fv-title">{file.name} {isVideo ? 'Walkthrough' : isDoc ? 'Analysis' : 'Preview'}</h1>
          <p className="fv-description">
            {file.details?.purpose || 'No description available for this file.'}
            {isVideo ? ' Recorded live demo of the RLLM Behavior Tree orchestrator, including real-time SuperVector DB retrieval.' : ''}
          </p>
        </div>
        <div className="fv-header-actions">
          <button className="fv-action-btn">Download</button>
          <button className="fv-action-btn primary">Vectorize</button>
        </div>
      </div>

      <div className="fv-grid">
        <div className="fv-grid-left">
          <div className={`fv-player-surface ${isVideo ? 'aspect-video' : isAudio ? 'aspect-audio' : isImage ? 'aspect-image' : 'aspect-doc'}`}>
            {isVideo ? (
              <div className="fv-player-inner">
                <div className="fv-media-canvas">
                  <video 
                    ref={mediaRef}
                    className="fv-real-video"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onClick={togglePlay}
                  >
                    <source src={`${contentUrl}#t=0.001`} type={file.details?.mime || 'video/mp4'} />
                  </video>

                  {!isPlaying && (
                    <button className="fv-main-play-btn" onClick={togglePlay}>
                      <PlayIcon size={32} />
                    </button>
                  )}
                </div>
                <div className="fv-player-controls">
                  <div className="fv-progress-container">
                    <div className="fv-progress-bar" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      seekTo(pos * duration);
                    }}>
                      <div className="fv-progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }} />
                    </div>
                  </div>
                  <div className="fv-controls-row">
                    <div className="fv-controls-left">
                      <button className="fv-icon-btn" onClick={togglePlay}>
                        {isPlaying ? <StopIcon size={14} /> : <PlayIcon size={14} />}
                      </button>
                      <span className="fv-timer">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <div className="fv-controls-right">
                      <span className="fv-quality-badge">HD SOURCE</span>
                      <button className="fv-icon-btn"><SearchIcon size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : isAudio ? (
              <div className="fv-player-inner fv-audio-inner">
                <div className="fv-media-canvas">
                  <div className="fv-audio-hero">
                    <MicIcon size={64} className="fv-audio-icon" />
                    <div className="fv-audio-info">
                      <div className="fv-audio-title">{file.name}</div>
                      <div className="fv-audio-meta">{file.details?.mime || 'Audio Stream'}</div>
                    </div>
                    <audio 
                      ref={mediaRef}
                      className="fv-real-audio" 
                      src={contentUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                  <div className="fv-audio-viz">
                    {[...Array(60)].map((_, i) => (
                      <div key={i} className="fv-audio-bar" style={{ 
                        height: `${10 + Math.random() * 80}%`,
                        opacity: isPlaying ? 0.8 : 0.3,
                        transition: 'height 0.2s, opacity 0.2s'
                      }} />
                    ))}
                  </div>
                  {!isPlaying && (
                    <button className="fv-main-play-btn" onClick={togglePlay}>
                      <PlayIcon size={32} />
                    </button>
                  )}
                </div>
                <div className="fv-player-controls">
                  <div className="fv-progress-container">
                    <div className="fv-progress-bar" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      seekTo(pos * duration);
                    }}>
                      <div className="fv-progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }} />
                    </div>
                  </div>
                  <div className="fv-controls-row">
                    <div className="fv-controls-left">
                      <button className="fv-icon-btn" onClick={togglePlay}>
                        {isPlaying ? <StopIcon size={14} /> : <PlayIcon size={14} />}
                      </button>
                      <span className="fv-timer">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <div className="fv-controls-right">
                      <span className="fv-quality-badge">LOSSLESS SOURCE</span>
                      <button className="fv-icon-btn"><SearchIcon size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : isImage ? (
              <div className="fv-player-inner fv-image-inner">
                <div className="fv-media-canvas image-canvas">
                  <div className="fv-img-controls">
                    <button className="fv-img-btn" onClick={() => handleZoom(0.25)}><PlusIcon size={14} /></button>
                    <button className="fv-img-btn" onClick={() => handleZoom(-0.25)}><MinusIcon size={14} /></button>
                    <button className="fv-img-btn" onClick={resetZoom}><MaximizeIcon size={14} /></button>
                    <span className="fv-zoom-label">{Math.round(zoomScale * 100)}%</span>
                  </div>
                  <div 
                    className={`fv-img-viewport ${isDragging ? 'is-dragging' : ''}`}
                    ref={viewportRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                  >
                    <img 
                      src={docUrl || contentUrl} 
                      alt={file.name}
                      className="fv-real-img zoomed"
                      style={{ 
                        transform: `scale(${zoomScale})`,
                        pointerEvents: isDragging ? 'none' : 'auto'
                      }}
                      onError={(e) => e.target.src = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1200"}
                    />
                  </div>
                </div>
                <div className="fv-player-controls">
                  <div className="fv-controls-row">
                    <div className="fv-controls-left">
                      <ImageIcon size={14} style={{ marginRight: '8px', opacity: 0.6 }} />
                      <span className="fv-timer">{file.name}</span>
                    </div>
                    <div className="fv-controls-right">
                      <span className="fv-quality-badge">IMAGE SOURCE</span>
                      <button className="fv-icon-btn"><SearchIcon size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="fv-player-inner fv-doc-inner">
                <div className="fv-media-canvas doc-canvas">
                  <div className="fv-doc-container">
                    {isOffice ? (
                      <iframe 
                        src={`${COLLABORA_SERVER_URL}/browser/dist/cool.html?WOPISrc=http://host.docker.internal:3003/wopi/files/${encodeURIComponent(file.id)}`}
                        className="fv-real-doc"
                        title={file.name}
                        allowFullScreen
                        style={{ border: 'none', background: '#fff' }}
                      />
                    ) : (
                      <iframe 
                        src={docUrl} 
                        className="fv-real-doc"
                        title={file.name}
                      />
                    )}
                  </div>
                </div>
                <div className="fv-player-controls">
                  <div className="fv-controls-row">
                    <div className="fv-controls-left">
                      <FileIcon size={14} style={{ marginRight: '8px', opacity: 0.6 }} />
                      <span className="fv-timer">{file.name}</span>
                    </div>
                    <div className="fv-controls-right">
                      <span className="fv-quality-badge">{file.type === 'kb' ? 'KNOWLEDGE BASE' : 'VECTOR SOURCE'}</span>
                      <button className="fv-icon-btn" onClick={() => window.open(contentUrl, '_blank')}><MaximizeIcon size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="fv-details-panel">
            <h3 className="fv-sub-title">System Insights</h3>
            <div className="fv-insights-grid">
              <div className="fv-insight-card">
                <div className="fv-insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <SearchIcon size={14} style={{ color: 'var(--blue)' }} />
                  <span className="fv-insight-label">Latency</span>
                </div>
                <span className="fv-insight-val">42ms</span>
              </div>
              <div className="fv-insight-card">
                <div className="fv-insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <DBIcon size={14} style={{ color: 'var(--blue)' }} />
                  <span className="fv-insight-label">Embedding</span>
                </div>
                <span className="fv-insight-val">HNSW</span>
              </div>
              <div className="fv-insight-card">
                <div className="fv-insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckIcon size={14} style={{ color: 'var(--blue)' }} />
                  <span className="fv-insight-label">Confidence</span>
                </div>
                <span className="fv-insight-val">0.982</span>
              </div>
            </div>
          </div>
        </div>

        <div className="fv-grid-right">
          {(isVideo || isAudio) ? (
            <div className="fv-transcript-panel">
              <div className="fv-panel-header">
                <span className="fv-panel-title">AI TRANSCRIPT</span>
                <div className="fv-status-chip">{isLoadingAtoms ? 'LOADING...' : 'SYNCED'}</div>
              </div>
              <div className="fv-transcript-scroll">
                {atoms.length > 0 ? atoms.map((atom, idx) => {
                  const startTime = atom.metadata?.snippet_start || 0;
                  const isActive = currentTime >= startTime && (idx === atoms.length - 1 || currentTime < atoms[idx+1].metadata?.snippet_start);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`fv-ts-item ${isActive ? 'active' : ''}`}
                      onClick={() => seekTo(startTime)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="fv-ts-time">{formatTime(startTime)}</span>
                      <p className="fv-ts-text">{atom.text}</p>
                    </div>
                  );
                }) : (
                  <div className="fv-ts-empty">
                    {isLoadingAtoms ? 'Analyzing media segments...' : 'No transcript segments found for this file.'}
                  </div>
                )}
              </div>
            </div>
          ) : isDoc ? (
            <div className="fv-analysis-panel">
              <div className="fv-panel-header">
                <span className="fv-panel-title">VECTOR ANALYSIS</span>
                <div className="fv-status-chip">{isLoadingAtoms ? 'ANALYZING...' : 'INDEXED'}</div>
              </div>
              <div className="fv-analysis-content">
                <div className="fv-details-panel">
                  <h3 className="fv-sub-title">Semantic Distribution</h3>
                  <div className="fv-insights-grid fv-insights-stack">
                    <div className="fv-insight-card">
                      <div className="fv-insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <ListIcon size={14} style={{ color: 'var(--blue)' }} />
                        <span className="fv-insight-label">Segments</span>
                      </div>
                      <span className="fv-insight-val">{atoms.length}</span>
                    </div>
                    <div className="fv-insight-card">
                      <div className="fv-insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <DiffIcon size={14} style={{ color: 'var(--blue)' }} />
                        <span className="fv-insight-label">Avg. Length</span>
                      </div>
                      <span className="fv-insight-val">
                        {atoms.length > 0 
                          ? Math.round(atoms.reduce((acc, a) => acc + a.text.length, 0) / atoms.length)
                          : 0}
                      </span>
                    </div>
                    <div className="fv-insight-card">
                      <div className="fv-insight-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckIcon size={14} style={{ color: 'var(--blue)' }} />
                        <span className="fv-insight-label">Confidence</span>
                      </div>
                      <span className="fv-insight-val">98%</span>
                    </div>
                  </div>
                </div>
                
                <div className="fv-analysis-summary">
                  <p style={{ margin: '0 0 12px 0', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Semantic Chunks ({atoms.length})
                  </p>
                  <div className="fv-meta-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {atoms.slice(0, 10).map((atom, i) => (
                      <div key={i} className="fv-meta-item" style={{ flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className="fv-meta-label">CHUNK #{i + 1}</span>
                        <span className="fv-meta-val" style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {atom.text.substring(0, 120)}...
                        </span>
                      </div>
                    ))}
                    {atoms.length > 10 && (
                      <div className="fv-meta-item" style={{ justifyContent: 'center', opacity: 0.5 }}>
                        <span className="fv-meta-label">+{atoms.length - 10} more segments</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="fv-meta-panel">
               <div className="fv-panel-header">
                 <span className="fv-panel-title">FILE METADATA</span>
               </div>
               <div className="fv-meta-list">
                 {Object.entries(file.details || {}).map(([k, v]) => (
                   <div key={k} className="fv-meta-item">
                     <span className="fv-meta-label">{k}</span>
                     <span className="fv-meta-val">{String(v)}</span>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
