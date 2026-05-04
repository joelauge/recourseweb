import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F0F2F7;
    --surface: #FFFFFF;
    --surface-2: #F7F8FC;
    --border: #E2E6F0;
    --blue: #2563EB;
    --blue-light: #EEF3FF;
    --blue-mid: #DBEAFE;
    --teal: #0D9488;
    --teal-light: #CCFBF1;
    --violet: #7C3AED;
    --violet-light: #EDE9FE;
    --amber: #D97706;
    --amber-light: #FEF3C7;
    --red: #DC2626;
    --red-light: #FEF2F2;
    --green: #16A34A;
    --green-light: #F0FDF4;
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-muted: #94A3B8;
    --font-head: 'Sora', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --radius-sm: 5px; --radius: 10px; --radius-lg: 16px;
    --shadow-sm: 0 1px 3px rgba(15,23,42,.06),0 1px 2px rgba(15,23,42,.04);
    --shadow: 0 4px 16px rgba(15,23,42,.08);
    --shadow-file: 0 8px 32px rgba(37,99,235,.10),0 2px 8px rgba(15,23,42,.08);
  }

  html,body,#root { height:100%; font-family:var(--font-body); background:var(--bg);
    color:var(--text-primary); font-size:14px; line-height:1.5; overflow:hidden; }

  /* ── TOPBAR ── */
  .topbar { height:52px; min-height:52px; background:var(--surface);
    border-bottom:1px solid var(--border); display:flex; align-items:center;
    padding:0 20px; gap:16px; position:relative; z-index:20; flex-shrink:0; }
  .topbar-logo { display:flex; align-items:center; flex-shrink:0; }
  .topbar-logo svg { height:22px; width:auto; display:block; }
  .topbar-divider { width:1px; height:24px; background:var(--border); flex-shrink:0; }

  /* ── EPHEM BADGE ── */
  .ephem-badge { display:flex; align-items:center; gap:7px; padding:4px 11px;
    border-radius:20px; background:var(--amber-light); border:1px solid #FCD34D; flex-shrink:0; }
  .ephem-dot { width:6px; height:6px; border-radius:50%; background:var(--amber);
    animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
  .ephem-label { font-family:var(--font-mono); font-size:10.5px; font-weight:500;
    color:var(--amber); letter-spacing:.04em; }

  /* ── METER ── */
  .meter-wrap { display:flex; align-items:center; gap:9px; flex-shrink:0; }
  .meter-label { font-family:var(--font-mono); font-size:10.5px; color:var(--text-muted); white-space:nowrap; }
  .meter-track { width:110px; height:5px; background:#E2E8F0; border-radius:3px; overflow:hidden; }
  .meter-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--blue),var(--teal));
    transition:width .6s cubic-bezier(.16,1,.3,1); }
  .meter-val { font-family:var(--font-mono); font-size:10.5px; font-weight:600; color:var(--blue); min-width:80px; }

  /* ── TTL + SESSION ID ── */
  .session-meta { display:flex; align-items:center; gap:14px; font-family:var(--font-mono);
    font-size:10.5px; color:var(--text-muted); }
  .session-id-val { color:var(--text-secondary); }
  .ttl-wrap { display:flex; align-items:center; gap:5px; }
  .ttl-val { color:var(--text-secondary); font-weight:500; }

  /* ── USER CHIP ── */
  .user-chip { display:flex; align-items:center; gap:7px; padding:4px 10px 4px 5px;
    background:var(--bg); border:1px solid var(--border); border-radius:24px; cursor:pointer;
    transition:all .15s; }
  .user-chip:hover { border-color:var(--blue); background:var(--blue-light); }
  .avatar { width:24px; height:24px; border-radius:50%;
    background:linear-gradient(135deg,#2563EB,#0D9488);
    display:flex; align-items:center; justify-content:center;
    color:#fff; font-size:9px; font-weight:700; }
  .user-name { font-size:12px; font-weight:600; }

  /* ── TABS BAR ── */
  .tabs-bar { height:40px; min-height:40px; background:var(--surface);
    border-bottom:1px solid var(--border); display:flex; align-items:flex-end;
    padding:0 16px; gap:2px; overflow-x:auto; flex-shrink:0; }
  .tabs-bar::-webkit-scrollbar { height:0; }
  .tab-item { display:flex; align-items:center; gap:7px; padding:0 14px;
    height:34px; border-radius:8px 8px 0 0; cursor:pointer;
    font-family:var(--font-mono); font-size:11.5px; font-weight:500;
    color:var(--text-muted); border:1px solid transparent; border-bottom:none;
    transition:all .15s; white-space:nowrap; position:relative; flex-shrink:0; }
  .tab-item:hover { color:var(--text-secondary); background:var(--bg); }
  .tab-item.active { color:var(--blue); background:var(--surface-2);
    border-color:var(--border); font-weight:600; }
  .tab-item.active::after { content:''; position:absolute; bottom:-1px; left:0; right:0;
    height:1px; background:var(--surface-2); }
  .tab-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .tab-close { width:16px; height:16px; border-radius:3px; display:flex; align-items:center;
    justify-content:center; font-size:12px; line-height:1; color:var(--text-muted);
    transition:all .1s; margin-left:2px; }
  .tab-close:hover { background:var(--red-light); color:var(--red); }
  .tab-add { display:flex; align-items:center; gap:5px; padding:0 12px;
    height:30px; border-radius:8px 8px 0 0; cursor:pointer; margin-bottom:0;
    font-family:var(--font-mono); font-size:11px; color:var(--text-muted);
    border:1.5px dashed var(--border); transition:all .15s; flex-shrink:0; align-self:center; }
  .tab-add:hover { border-color:var(--blue); color:var(--blue); background:var(--blue-light); }
  .tab-activity { width:6px; height:6px; border-radius:50%; background:var(--amber); animation:pulse 1.5s infinite; }

  /* ── BODY ── */
  .session-body { flex:1; display:flex; overflow:hidden; }

  /* ── LEFT PANEL ── */
  .fs-panel { width:420px; min-width:420px; display:flex; flex-direction:column;
    border-right:1px solid var(--border); background:var(--surface); overflow:hidden; }
  .fs-toolbar { padding:14px 18px 11px; border-bottom:1px solid var(--border); flex-shrink:0; }
  .fs-toolbar-top { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .fs-title { font-family:var(--font-head); font-size:13px; font-weight:700; }
  .fs-subtitle { font-family:var(--font-mono); font-size:10.5px; color:var(--text-muted); margin-left:auto; }
  .upload-btn { display:flex; align-items:center; gap:6px; padding:5px 11px;
    border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px; font-weight:600;
    background:var(--surface); border:1.5px solid var(--border);
    color:var(--text-secondary); cursor:pointer; transition:all .15s; }
  .upload-btn:hover { border-color:var(--blue); color:var(--blue); background:var(--blue-light); }
  .fs-path { display:flex; align-items:center; gap:4px; font-family:var(--font-mono);
    font-size:10.5px; color:var(--text-muted); background:var(--bg);
    padding:5px 10px; border-radius:var(--radius-sm); border:1px solid var(--border); }
  .crumb-active { color:var(--blue); font-weight:500; }
  .fs-sort { display:flex; align-items:center; gap:4px; margin-top:8px; }
  .sort-btn { font-family:var(--font-mono); font-size:10px; color:var(--text-muted);
    padding:2px 7px; border-radius:4px; cursor:pointer; border:1px solid transparent; transition:all .1s; }
  .sort-btn:hover { color:var(--text-secondary); border-color:var(--border); }
  .sort-btn.active { color:var(--blue); background:var(--blue-light); border-color:var(--blue-mid); }
  .sort-sep { width:1px; height:12px; background:var(--border); }
  .fs-count { margin-left:auto; font-family:var(--font-mono); font-size:10px; color:var(--text-muted); }

  /* ── FILE LIST ── */
  .file-list-wrap { flex:1; overflow-y:auto; padding:12px; display:flex;
    flex-direction:column; gap:9px; position:relative; }
  .file-list-wrap::-webkit-scrollbar { width:4px; }
  .file-list-wrap::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:10px; }

  /* ── DROP OVERLAY ── */
  .drop-overlay { position:absolute; inset:0; z-index:20;
    background:rgba(37,99,235,.06); border:2px dashed var(--blue);
    border-radius:var(--radius-lg); margin:6px;
    display:flex; align-items:center; justify-content:center;
    flex-direction:column; gap:10px; backdrop-filter:blur(2px); pointer-events:none; }
  .drop-label { font-family:var(--font-mono); font-size:13px; font-weight:600; color:var(--blue); }
  .drop-sub { font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }

  /* ── EMPTY STATE ── */
  .empty-state { flex:1; display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:14px; padding:32px; text-align:center; }
  .empty-icon { width:56px; height:56px; border-radius:16px;
    background:linear-gradient(145deg,#EEF3FF,#DBEAFE);
    display:flex; align-items:center; justify-content:center; }
  .empty-icon svg { width:26px; height:26px; color:var(--blue); opacity:.6; }
  .empty-title { font-family:var(--font-head); font-size:14px; font-weight:700; color:var(--text-secondary); }
  .empty-sub { font-family:var(--font-mono); font-size:11px; color:var(--text-muted); line-height:1.6; max-width:220px; }
  .empty-cta { display:flex; align-items:center; gap:6px; padding:8px 16px;
    border-radius:var(--radius-sm); background:var(--blue); color:#fff;
    font-family:var(--font-mono); font-size:11.5px; font-weight:600; cursor:pointer;
    border:none; transition:all .15s; }
  .empty-cta:hover { background:#1D4ED8; transform:translateY(-1px); }

  /* ── FILE CARD ── */
  .file-card { background:var(--surface); border:1.5px solid var(--border);
    border-radius:var(--radius-lg); padding:0; cursor:grab; overflow:hidden;
    transition:all .2s cubic-bezier(.16,1,.3,1); box-shadow:var(--shadow-sm);
    position:relative; user-select:none;
    animation:cardIn .35s cubic-bezier(.16,1,.3,1) both; }
  @keyframes cardIn { from{opacity:0;transform:translateY(8px) scale(.98)} to{opacity:1;transform:none} }
  .file-card:hover { border-color:var(--blue); box-shadow:var(--shadow-file); transform:translateY(-1px); }
  .file-card.selected { border-color:var(--blue); background:#FAFCFF; }
  .file-card.dragging { opacity:.45; transform:scale(.97) rotate(-.4deg); border-style:dashed; }

  /* Left accent strip */
  .file-card::before { content:''; position:absolute; left:0; top:0; bottom:0;
    width:4px; border-radius:16px 0 0 16px; }
  .file-card.type-vec::before { background:linear-gradient(180deg,#2563EB,#60A5FA); }
  .file-card.type-kb::before  { background:linear-gradient(180deg,#0D9488,#34D399); }
  .file-card.type-raw::before { background:linear-gradient(180deg,#7C3AED,#A78BFA); }
  .file-card.type-img::before { background:linear-gradient(180deg,#9333EA,#F472B6); }
  .file-card.type-vid::before { background:linear-gradient(180deg,#DC2626,#FB923C); }

  .file-inner { padding:13px 14px 13px 20px; }
  .file-top { display:flex; align-items:flex-start; gap:12px; margin-bottom:9px; }

  .file-type-icon { width:44px; height:52px; border-radius:9px; display:flex;
    flex-direction:column; align-items:center; justify-content:center; gap:4px; flex-shrink:0; }
  .file-type-icon svg { width:20px; height:20px; }
  .ext-tag { font-family:var(--font-mono); font-size:8px; font-weight:700;
    padding:2px 5px; border-radius:3px; letter-spacing:.06em; color:#fff; line-height:1; }
  .fti-vec { background:linear-gradient(145deg,#EEF3FF,#DBEAFE); color:var(--blue); }
  .fti-vec .ext-tag { background:var(--blue); }
  .fti-kb  { background:linear-gradient(145deg,#CCFBF1,#A7F3D0); color:var(--teal); }
  .fti-kb  .ext-tag { background:var(--teal); }
  .fti-raw { background:linear-gradient(145deg,#EDE9FE,#DDD6FE); color:var(--violet); }
  .fti-raw .ext-tag { background:var(--violet); }
  .fti-img { background:linear-gradient(145deg,#FDF4FF,#F3E8FF); color:#9333EA; }
  .fti-img .ext-tag { background:#9333EA; }
  .fti-vid { background:linear-gradient(145deg,#FFF1F2,#FFE4E6); color:var(--red); }
  .fti-vid .ext-tag { background:var(--red); }

  .file-name-block { flex:1; min-width:0; }
  .file-name { font-family:var(--font-head); font-size:13px; font-weight:700;
    letter-spacing:-.1px; line-height:1.25; margin-bottom:2px;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .file-path { font-family:var(--font-mono); font-size:9.5px; color:var(--text-muted);
    margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .file-tags { display:flex; gap:4px; flex-wrap:wrap; }
  .ftag { font-family:var(--font-mono); font-size:9px; font-weight:500;
    padding:2px 6px; border-radius:20px; border:1px solid; line-height:1.4; }
  .ftag-blue   { background:var(--blue-light); color:var(--blue); border-color:#BFDBFE; }
  .ftag-teal   { background:var(--teal-light); color:var(--teal); border-color:#99F6E4; }
  .ftag-violet { background:var(--violet-light); color:var(--violet); border-color:#C4B5FD; }
  .ftag-amber  { background:var(--amber-light); color:var(--amber); border-color:#FCD34D; }
  .ftag-red    { background:var(--red-light); color:var(--red); border-color:#FCA5A5; }
  .ftag-gray   { background:var(--bg); color:var(--text-muted); border-color:var(--border); }
  .ftag-green  { background:var(--green-light); color:var(--green); border-color:#86EFAC; }

  .size-badge { display:flex; flex-direction:column; align-items:flex-end; flex-shrink:0; }
  .size-num { font-family:var(--font-mono); font-size:20px; font-weight:400;
    letter-spacing:-.03em; line-height:1; color:var(--text-primary); }
  .size-unit { font-family:var(--font-mono); font-size:9.5px; color:var(--text-muted); text-align:right; margin-top:1px; }

  /* ── FILE STATS ROW ── */
  .file-stats { display:flex; background:var(--bg); border-radius:var(--radius-sm);
    border:1px solid var(--border); overflow:hidden; }
  .fstat { flex:1; padding:6px 8px; display:flex; flex-direction:column;
    align-items:center; gap:1px; border-right:1px solid var(--border); }
  .fstat:last-child { border-right:none; }
  .fstat-val { font-family:var(--font-mono); font-size:11px; font-weight:600; color:var(--text-primary); }
  .fstat-key { font-family:var(--font-mono); font-size:9px; color:var(--text-muted); letter-spacing:.04em; }

  /* ── FILE STATE / ACTIVITY BAR ── */
  .file-state-bar { padding:8px 14px 10px 20px; border-top:1px solid var(--border);
    display:flex; align-items:center; gap:10px; background:var(--surface-2); }
  .state-indicator { display:flex; align-items:center; gap:6px; flex:1; min-width:0; }
  .state-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .state-dot.remembering { background:var(--amber); animation:pulse 1.2s infinite; }
  .state-dot.learning    { background:var(--violet); animation:pulse 1.5s infinite; }
  .state-dot.indexing    { background:var(--blue); animation:pulse 1.8s infinite; }
  .state-dot.ready       { background:var(--green); }
  .state-dot.error       { background:var(--red); }
  .state-dot.queued      { background:var(--text-muted); }
  .state-label { font-family:var(--font-mono); font-size:10.5px; font-weight:600; }
  .state-label.remembering { color:var(--amber); }
  .state-label.learning    { color:var(--violet); }
  .state-label.indexing    { color:var(--blue); }
  .state-label.ready       { color:var(--green); }
  .state-label.error       { color:var(--red); }
  .state-label.queued      { color:var(--text-muted); }
  .state-msg { font-family:var(--font-mono); font-size:10px; color:var(--text-muted);
    flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* Progress bar inside state bar */
  .state-progress-wrap { width:80px; height:3px; background:#E2E8F0; border-radius:2px; overflow:hidden; flex-shrink:0; }
  .state-progress-fill { height:100%; border-radius:2px; transition:width .4s ease; }
  .state-progress-fill.remembering { background:var(--amber); }
  .state-progress-fill.learning    { background:var(--violet); }
  .state-progress-fill.indexing    { background:var(--blue); }
  .state-progress-fill.ready       { background:var(--green); width:100%!important; }
  .state-pct { font-family:var(--font-mono); font-size:9.5px; color:var(--text-muted); flex-shrink:0; min-width:28px; text-align:right; }

  /* ── ACTIVITY LOG STREAM ── */
  .activity-stream { margin-top:2px; max-height:44px; overflow:hidden; }
  .activity-line { display:flex; align-items:center; gap:6px; padding:1px 0;
    animation:logLine .2s ease; }
  @keyframes logLine { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
  .activity-ts { font-family:var(--font-mono); font-size:9px; color:var(--text-muted); flex-shrink:0; }
  .activity-evt { font-family:var(--font-mono); font-size:9.5px; color:var(--text-secondary); }
  .activity-evt.highlight { color:var(--blue); font-weight:600; }

  /* ── NEW BADGE ── */
  .new-badge { position:absolute; top:9px; right:12px; font-family:var(--font-mono);
    font-size:8.5px; font-weight:700; padding:2px 6px; border-radius:20px;
    background:var(--green-light); color:var(--green); border:1px solid #86EFAC;
    letter-spacing:.06em; pointer-events:none; }

  /* ── DRAG HINT ── */
  .drag-hint { position:absolute; right:12px; bottom:10px; display:flex; align-items:center;
    gap:4px; font-family:var(--font-mono); font-size:9px; color:var(--text-muted);
    opacity:0; transition:opacity .2s; pointer-events:none; }
  .file-card:hover .drag-hint { opacity:1; }

  /* ── RIGHT PANEL ── */
  .query-panel { flex:1; display:flex; flex-direction:column; background:var(--surface-2); overflow:hidden; }
  .welcome-head { padding:24px 28px 18px; border-bottom:1px solid var(--border); flex-shrink:0; background:var(--surface); }
  .welcome-eyebrow { font-family:var(--font-mono); font-size:10px; font-weight:500; color:var(--blue);
    letter-spacing:.09em; text-transform:uppercase; margin-bottom:5px;
    display:flex; align-items:center; gap:7px; }
  .welcome-eyebrow::before { content:''; width:16px; height:1.5px; background:var(--blue); display:block; }
  .welcome-title { font-family:var(--font-head); font-size:22px; font-weight:800;
    letter-spacing:-.4px; line-height:1.2; margin-bottom:5px; }
  .welcome-sub { font-size:12.5px; color:var(--text-secondary); line-height:1.6; max-width:500px; }
  .constraint-row { display:flex; gap:7px; margin-top:12px; flex-wrap:wrap; }
  .cpill { display:flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px;
    font-family:var(--font-mono); font-size:10.5px; font-weight:500; border:1px solid; }
  .cpill svg { width:11px; height:11px; flex-shrink:0; }
  .cpill-warn { background:var(--amber-light); border-color:#FCD34D; color:var(--amber); }
  .cpill-info { background:var(--blue-light); border-color:var(--blue-mid); color:var(--blue); }
  .cpill-ok   { background:var(--green-light); border-color:#86EFAC; color:var(--green); }

  /* ── WORKSPACE BODY ── */
  .workspace-body { flex:1; display:flex; flex-direction:column; overflow:hidden; padding:16px 20px; gap:12px; }

  /* ── EMPTY QUERY STATE ── */
  .query-empty-state { flex:1; display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:16px; opacity:.7; }
  .qes-icon { width:64px; height:64px; border-radius:20px;
    background:linear-gradient(145deg,#EEF3FF,#DBEAFE);
    display:flex; align-items:center; justify-content:center; }
  .qes-icon svg { width:28px; height:28px; color:var(--blue); opacity:.5; }
  .qes-title { font-family:var(--font-head); font-size:15px; font-weight:700; color:var(--text-muted); }
  .qes-sub { font-family:var(--font-mono); font-size:11px; color:var(--text-muted); text-align:center; line-height:1.7; max-width:280px; }

  /* ── TRAY ── */
  .tray { background:var(--surface); border:1.5px solid var(--border);
    border-radius:var(--radius-lg); padding:12px 14px; flex-shrink:0; transition:all .2s; }
  .tray.drag-over { border-color:var(--blue); background:var(--blue-light); box-shadow:0 0 0 3px rgba(37,99,235,.1); }
  .tray-header { display:flex; align-items:center; gap:7px; margin-bottom:8px; }
  .tray-label { font-family:var(--font-mono); font-size:10px; font-weight:600;
    color:var(--text-muted); text-transform:uppercase; letter-spacing:.07em; }
  .tray-count { font-family:var(--font-mono); font-size:9.5px; font-weight:700;
    padding:1px 6px; border-radius:10px; background:var(--blue); color:#fff; }
  .tray-empty-zone { display:flex; align-items:center; justify-content:center; gap:7px;
    height:34px; color:var(--text-muted); font-family:var(--font-mono); font-size:10.5px;
    border:1.5px dashed var(--border); border-radius:var(--radius-sm); transition:all .2s; }
  .tray.drag-over .tray-empty-zone { border-color:var(--blue); color:var(--blue); }
  .tray-files { display:flex; gap:7px; flex-wrap:wrap; }
  .tray-chip { display:flex; align-items:center; gap:7px; padding:5px 9px;
    background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-sm);
    cursor:pointer; transition:all .15s;
    animation:chipIn .2s cubic-bezier(.16,1,.3,1); }
  @keyframes chipIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
  .tray-chip:hover { border-color:var(--red); background:var(--red-light); }
  .chip-dot { width:7px; height:7px; border-radius:50%; }
  .chip-dot-vec { background:var(--blue); }
  .chip-dot-kb  { background:var(--teal); }
  .chip-dot-raw { background:var(--violet); }
  .chip-dot-img { background:#9333EA; }
  .chip-dot-vid { background:var(--red); }
  .chip-name { font-family:var(--font-mono); font-size:10.5px; font-weight:500; color:var(--text-secondary); }
  .chip-size { font-family:var(--font-mono); font-size:10px; color:var(--text-muted); }
  .chip-remove { color:var(--text-muted); font-size:13px; transition:color .1s; margin-left:1px; }
  .tray-chip:hover .chip-remove { color:var(--red); }

  /* ── OP SELECTOR ── */
  .op-selector { display:flex; gap:5px; flex-wrap:wrap; }
  .op-btn { display:flex; align-items:center; gap:6px; padding:6px 12px;
    border-radius:var(--radius-sm); font-family:var(--font-mono); font-size:11px; font-weight:500;
    border:1.5px solid var(--border); background:var(--surface);
    color:var(--text-secondary); cursor:pointer; transition:all .15s; }
  .op-btn:hover { border-color:var(--blue); color:var(--blue); background:var(--blue-light); }
  .op-btn.active { background:var(--blue); border-color:var(--blue); color:#fff; }
  .op-btn svg { width:12px; height:12px; }

  /* ── QUERY INPUT ── */
  .query-input-wrap { flex:1; position:relative; display:flex; flex-direction:column;
    background:var(--surface); border:1.5px solid var(--border); border-radius:var(--radius-lg);
    overflow:hidden; transition:border-color .15s,box-shadow .15s; min-height:0; }
  .query-input-wrap:focus-within { border-color:var(--blue); box-shadow:0 0 0 3px rgba(37,99,235,.08); }
  .query-input-header { display:flex; align-items:center; gap:7px; padding:9px 13px 0; flex-shrink:0; }
  .qih-label { font-family:var(--font-mono); font-size:9.5px; font-weight:600;
    color:var(--text-muted); text-transform:uppercase; letter-spacing:.08em; }
  .qih-op { font-family:var(--font-mono); font-size:10px; font-weight:600; color:var(--blue);
    background:var(--blue-light); border:1px solid var(--blue-mid); padding:2px 7px; border-radius:4px; }
  .qih-cursor { font-family:var(--font-mono); font-size:12px; color:var(--blue); animation:blink 1.1s infinite; }
  @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  .query-textarea { flex:1; padding:8px 14px 12px; resize:none;
    background:transparent; border:none; outline:none;
    font-family:var(--font-mono); font-size:12.5px; line-height:1.7;
    color:var(--text-primary); min-height:80px; }
  .query-textarea::placeholder { color:var(--text-muted); font-style:italic; }

  /* ── QUERY FOOTER ── */
  .query-footer { display:flex; align-items:center; gap:10px; padding:9px 13px;
    border-top:1px solid var(--border); background:var(--bg); flex-shrink:0; }
  .session-usage { display:flex; align-items:center; gap:8px; flex:1; font-family:var(--font-mono); font-size:10px; color:var(--text-muted); }
  .usage-bar-track { flex:1; max-width:140px; height:3.5px; background:#E2E8F0; border-radius:2px; overflow:hidden; }
  .usage-bar-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,var(--blue),var(--teal)); transition:width .5s cubic-bezier(.16,1,.3,1); }
  .usage-pct { font-weight:600; color:var(--blue); }
  .usage-free { color:var(--text-muted); }
  .submit-btn { display:flex; align-items:center; gap:7px; padding:8px 18px;
    background:var(--blue); color:#fff; border:none; border-radius:var(--radius-sm);
    font-family:var(--font-mono); font-size:11.5px; font-weight:600;
    cursor:pointer; transition:all .15s; }
  .submit-btn:hover:not(:disabled) { background:#1D4ED8; transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,.3); }
  .submit-btn:disabled { opacity:.4; cursor:not-allowed; }
  .submit-btn svg { width:13px; height:13px; }

  /* ── STREAM LOG OVERLAY ── */
  .stream-log { position:absolute; bottom:0; left:0; right:0;
    background:rgba(15,23,42,.92); backdrop-filter:blur(6px);
    border-top:1px solid rgba(255,255,255,.08); padding:10px 16px;
    max-height:120px; overflow-y:auto; display:flex; flex-direction:column; gap:3px; }
  .stream-log::-webkit-scrollbar { width:3px; }
  .stream-log::-webkit-scrollbar-thumb { background:#334155; border-radius:3px; }
  .log-entry { display:flex; align-items:baseline; gap:8px; animation:logLine .15s ease; }
  .log-ts { font-family:var(--font-mono); font-size:9px; color:#475569; flex-shrink:0; }
  .log-file { font-family:var(--font-mono); font-size:9.5px; color:#94A3B8; flex-shrink:0; font-weight:500; }
  .log-msg { font-family:var(--font-mono); font-size:9.5px; color:#CBD5E1; }
  .log-msg.ev-remembering { color:#FCD34D; }
  .log-msg.ev-learning    { color:#A78BFA; }
  .log-msg.ev-indexing    { color:#60A5FA; }
  .log-msg.ev-ready       { color:#4ADE80; }
  .log-msg.ev-error       { color:#F87171; }
  .log-msg.ev-chunk       { color:#7DD3FC; }
  .log-msg.ev-routing     { color:#C084FC; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:10px; }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const SESSION_MB = 1024;
const GEN_ID = () => {
  const chars = "ABCDEF0123456789";
  let id = "KD-";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id + "-" + new Date().getFullYear();
};

// File states — maps to RLLM proxy event signals
const FILE_STATES = {
  QUEUED:      { label: "Queued",      color: "queued" },
  REMEMBERING: { label: "Remembering", color: "remembering" }, // uploading / writing to session storage
  LEARNING:    { label: "Learning",    color: "learning" },    // chunking / vectorizing
  INDEXING:    { label: "Indexing",    color: "indexing" },    // building HNSW index in SuperVector DB
  READY:       { label: "Ready",       color: "ready" },       // indexed, queryable
  ERROR:       { label: "Error",       color: "error" },
};

const OP_MAP = {
  QUERY:     { label: "semantic_query",  ph: 'Describe what you want to find across the files in scope…\n\ne.g. "What does the PIPEDA manual say about consent gates, and where does Pierre demonstrate this in the demo?"' },
  SUMMARIZE: { label: "summarize",       ph: 'Which files should be summarized, and at what level of detail?' },
  DIFF:      { label: "diff_files",      ph: 'What should be compared between the files in scope?' },
  EXTRACT:   { label: "extract_data",    ph: 'What specific data should be extracted?' },
  MAP:       { label: "cross_map",       ph: 'What concepts should be cross-mapped across all files?' },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const SEED_FILES = [
  { id: "f1", name: "PIPEDA Compliance Manual", path: "session/{sid}/compliance/pipeda-manual-v2.vec",
    type: "vec", mb: 312, tags: [["blue","PIPEDA"],["blue","AI Governance"],["gray","2,341 vectors"]],
    stats: [{v:"2,341",k:"VECTORS"},{v:"1536",k:"DIMS"},{v:"Apr 12",k:"INDEXED"},{v:"0.97",k:"DENSITY"}] },
  { id: "f2", name: "Pierre's BT Demo — Live", path: "session/{sid}/media/pierre-bt-demo-ep14.mp4",
    type: "vid", mb: 248, tags: [["red","MP4 · 1080p"],["gray","38:14"],["gray","4,102 chunks"]],
    stats: [{v:"4,102",k:"CHUNKS"},{v:"38:14",k:"DURATION"},{v:"Apr 14",k:"RECORDED"},{v:"AI",k:"TRANSCRIPT"}] },
  { id: "f3", name: "BT Orchestration Schema", path: "session/{sid}/schemas/bt-orchestration-v2.1.kb",
    type: "kb", mb: 186, tags: [["teal","pytrees v2.1"],["teal","BT Engine"],["gray","891 vectors"]],
    stats: [{v:"891",k:"VECTORS"},{v:"768",k:"DIMS"},{v:"Apr 8",k:"INDEXED"},{v:"0.88",k:"DENSITY"}] },
  { id: "f4", name: "BT Architecture Diagram", path: "session/{sid}/media/bt-pipeline-v2.1.png",
    type: "img", mb: 94, tags: [["violet","PNG · 2400×1600"],["gray","CLIP-L/14"],["gray","893 visual vecs"]],
    stats: [{v:"893",k:"VIS.VECS"},{v:"CLIP",k:"MODEL"},{v:"Apr 14",k:"INDEXED"},{v:"2400px",k:"WIDTH"}] },
  { id: "f5", name: "Q1 Market Analysis", path: "session/{sid}/intel/q1-market-analysis-2025.raw",
    type: "raw", mb: 57, tags: [["amber","Research"],["amber","Market Intel"],["gray","443 vectors"]],
    stats: [{v:"443",k:"VECTORS"},{v:"768",k:"DIMS"},{v:"Mar 28",k:"INDEXED"},{v:"0.71",k:"DENSITY"}] },
];

// ─── MOCK SSE STREAM ENGINE ───────────────────────────────────────────────────
// Simulates the RLLM proxy event stream for file ingestion
// Real implementation: EventSource('/api/sessions/{id}/events')

function createMockStream(fileId, fileMb, onEvent) {
  const isLarge = fileMb > 50; // files > 50MB go through Learning (chunking) phase
  const steps = [
    { state: "REMEMBERING", msg: "Writing to session store…", pct: 5, delay: 300 },
    { state: "REMEMBERING", msg: `Buffering ${fileMb}MB payload…`, pct: 30, delay: 700 },
    { state: "REMEMBERING", msg: "Payload written to KnowDB session shard", pct: 65, delay: 600 },
    { state: "REMEMBERING", msg: "Session store confirmed receipt", pct: 90, delay: 500 },
    ...(isLarge ? [
      { state: "LEARNING", msg: "Detecting content type and encoding…", pct: 5, delay: 400 },
      { state: "LEARNING", msg: `LCD chunking: target window 2,048 tokens`, pct: 15, delay: 500 },
      { state: "LEARNING", msg: "Chunk 1 / " + Math.round(fileMb / 4) + " dispatched to embedding model", pct: 25, delay: 300 },
      { state: "LEARNING", msg: "Chunk " + Math.round(fileMb / 8) + " / " + Math.round(fileMb / 4) + " — division-of-work active", pct: 45, delay: 600 },
      { state: "LEARNING", msg: "BT Sequence: chunking → embedding → staging", pct: 60, delay: 500 },
      { state: "LEARNING", msg: "Embedding batch complete, staging vectors", pct: 80, delay: 700 },
      { state: "LEARNING", msg: "All chunks embedded — handing to indexer", pct: 98, delay: 400 },
    ] : [
      { state: "LEARNING", msg: "Small file — single-pass embedding", pct: 40, delay: 400 },
      { state: "LEARNING", msg: "Embedding complete", pct: 90, delay: 500 },
    ]),
    { state: "INDEXING", msg: "Building HNSW index in SuperVector DB…", pct: 20, delay: 500 },
    { state: "INDEXING", msg: "Writing namespace partition…", pct: 55, delay: 400 },
    { state: "INDEXING", msg: "Index integrity check passed", pct: 90, delay: 350 },
    { state: "READY",    msg: "File ready — queryable in session", pct: 100, delay: 300 },
  ];

  let i = 0;
  function next() {
    if (i >= steps.length) return;
    const step = steps[i++];
    setTimeout(() => {
      onEvent({ fileId, ...step });
      next();
    }, step.delay + Math.random() * 200);
  }
  next();
}

// ─── LOGO SVG ─────────────────────────────────────────────────────────────────
const LogoSVG = () => (
  <svg style={{height:"22px",width:"auto",display:"block"}} viewBox="0 0 474.05 418.99" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id="lg0r" x1="42.2" y1="9.06" x2="42.2" y2="292.13" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2483c5" stopOpacity=".8"/><stop offset=".88" stopColor="#2e3191"/></linearGradient>
      <linearGradient id="lg1r" x1="221.17" y1="149.23" x2="221.17" y2="293.78" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2483c5" stopOpacity=".5"/><stop offset=".79" stopColor="#1b75bb"/></linearGradient>
      <linearGradient id="lg2r" x1="277.7" y1="7.51" x2="277.7" y2="294.46" xlinkHref="#lg0r"/>
      <linearGradient id="lg3r" x1="24.05" y1="413.75" x2="24.05" y2="370.47" xlinkHref="#lg0r"/>
      <linearGradient id="lg4r" x1="76.69" y1="413.75" x2="76.69" y2="370.47" xlinkHref="#lg0r"/>
      <linearGradient id="lg5r" x1="136.06" y1="414.38" x2="136.06" y2="369.84" xlinkHref="#lg0r"/>
      <linearGradient id="lg6r" x1="201.86" y1="413.75" x2="201.86" y2="370.47" xlinkHref="#lg0r"/>
    </defs>
    <g style={{isolation:"isolate"}}><g><g>
      <rect fill="url(#lg0r)" x="6.32" y="9.06" width="71.76" height="283.06" rx="35.88" ry="35.88"/>
      <path fill="url(#lg1r)" d="M136.99,178.96l29.42-29.73,144.96,137.9c2.53,2.41.81,6.67-2.68,6.65l-81-.45c-7.19-.04-14.06-2.92-19.13-8.02l-71.83-72.26c-9.41-9.46-9.29-24.78.26-34.1Z"/>
      <path fill="#767576" style={{mixBlendMode:"multiply",opacity:.38}} d="M166.41,149.23l8.66,8.68-21.98,20.96c-4.73,4.51-8.24,10.05-11.21,15.88-4.14,8.11-.14,22.87-.14,22.87,0,0-9.84-8.1-11.3-17.75-1.33-8.74,3.22-15.86,6.2-19.59,5.08-6.38,21.36-22.47,21.36-22.47l8.42-8.57Z"/>
      <path fill="url(#lg2r)" d="M138.25,214.32l-42.4-40.2c-12.84-12.09-13.13-32.41-.63-44.86L204.57,20.35c8.35-8.32,19.68-12.94,31.46-12.84l105.98.91c6.94.06,13.82,1.17,20.43,3.28,30.06,9.63,107.24,43.47,106.92,134.62-.41,117.27-82.27,140.21-88.22,143.32-2.25,1.18-20.09,4.81-23.7,4.81-9.1,0-17.81-3.69-24.16-10.2l-33.84-35.16c-2.04-2.08-.56-5.58,2.36-5.56l30.64.23c9.43-2.37,74.21-16.99,73.36-89.79-.79-67.42-69.84-80.09-81.99-80.31l-46.95-.82-18.27.6c-10.6.35-20.68,4.65-28.25,12.07l-42.33,41.44-49.33,51.26c-6.44,6.61-7.88,14.36-7.68,19.58.28,7.3,7.27,16.52,7.27,16.52Z"/>
    </g><g>
      <path fill="url(#lg2r)" d="M6.77,413.75v-43.28h5.86v43.28h-5.86ZM33.53,413.75l-21.83-22.58,21.39-20.71h7.61l-23.08,22.2v-3.24l23.7,24.32h-7.8Z"/>
      <path fill="url(#lg4r)" d="M59.66,413.75v-43.28h4.12l1.75,6.8v36.49h-5.86ZM89.6,413.75l-26.57-35.49.75-7.8,26.63,35.43-.81,7.86ZM89.6,413.75l-1.75-6.42v-36.86h5.86v43.28h-4.12Z"/>
      <path fill="url(#lg5r)" d="M136.13,414.38c-3.08,0-5.95-.57-8.61-1.72-2.66-1.14-4.99-2.74-6.99-4.8-2-2.06-3.54-4.44-4.65-7.14-1.1-2.7-1.65-5.59-1.65-8.67s.55-6.02,1.65-8.7c1.1-2.68,2.64-5.04,4.62-7.08,1.97-2.04,4.28-3.62,6.92-4.74,2.64-1.12,5.5-1.68,8.58-1.68s5.93.56,8.58,1.68c2.64,1.12,4.96,2.7,6.95,4.74,2,2.04,3.55,4.41,4.68,7.11,1.12,2.7,1.68,5.61,1.68,8.73s-.56,5.97-1.68,8.67c-1.12,2.7-2.67,5.07-4.65,7.11-1.98,2.04-4.28,3.63-6.92,4.77-2.64,1.14-5.48,1.72-8.51,1.72ZM136,408.76c3.12,0,5.85-.72,8.2-2.15,2.35-1.43,4.21-3.41,5.58-5.92,1.37-2.52,2.06-5.39,2.06-8.64,0-2.41-.4-4.62-1.18-6.64-.79-2.02-1.89-3.77-3.31-5.27-1.41-1.5-3.08-2.65-4.99-3.46-1.91-.81-4.03-1.22-6.36-1.22-3.08,0-5.79.71-8.14,2.12-2.35,1.41-4.2,3.37-5.55,5.86-1.35,2.5-2.03,5.36-2.03,8.61,0,2.41.38,4.65,1.15,6.7.77,2.06,1.85,3.83,3.24,5.3,1.39,1.48,3.06,2.63,4.99,3.46,1.93.83,4.04,1.25,6.33,1.25Z"/>
      <path fill="url(#lg6r)" d="M187.45,413.75l-14.16-43.28h5.86l11.23,35.3h-1.68l11.04-35.3h4.24l11.04,35.3h-1.62l11.23-35.3h5.8l-14.1,43.28h-4.18l-11.1-35.24h1.62l-11.04,35.24h-4.18Z"/>
      <path fill="#3a3a3a" d="M250.76,413.75v-42.54h3.3v42.54h-3.3ZM252.51,413.75v-3.06h13.22c3.58,0,6.73-.78,9.45-2.34,2.72-1.56,4.85-3.71,6.39-6.46,1.54-2.74,2.31-5.9,2.31-9.48s-.77-6.67-2.31-9.42-3.68-4.88-6.42-6.42c-2.74-1.54-5.88-2.31-9.42-2.31h-13.04v-3.06h13.1c3.12,0,5.99.53,8.61,1.59,2.62,1.06,4.9,2.54,6.83,4.43,1.93,1.89,3.43,4.14,4.49,6.74,1.06,2.6,1.59,5.44,1.59,8.51s-.53,5.85-1.59,8.45c-1.06,2.6-2.55,4.85-4.46,6.77s-4.18,3.4-6.8,4.46c-2.62,1.06-5.47,1.59-8.54,1.59h-13.41Z"/>
      <path fill="#3a3a3a" d="M309.32,413.75v-42.54h3.3v42.54h-3.3ZM311.32,394.23v-2.81h13.16c3.12,0,5.51-.79,7.17-2.37,1.66-1.58,2.49-3.68,2.49-6.3s-.82-4.66-2.46-6.24c-1.64-1.58-4.04-2.37-7.2-2.37h-13.16v-2.93h13.04c2.74,0,5.09.49,7.05,1.47,1.95.98,3.45,2.33,4.49,4.05,1.04,1.73,1.56,3.73,1.56,6.02s-.52,4.29-1.56,6.02-2.54,3.07-4.49,4.02c-1.96.96-4.3,1.43-7.05,1.43h-13.04ZM336.27,413.75l-16.47-20.27,3.31-.87,17.46,21.14h-4.3Z"/>
      <path fill="#3a3a3a" d="M360.53,413.75v-42.54h3.3v42.54h-3.3Z"/>
      <path fill="#3a3a3a" d="M401.63,413.75l-16.78-42.54h3.55l15.28,39.11h-1.37l15.41-39.11h3.49l-16.9,42.54h-2.68Z"/>
      <path fill="#3a3a3a" d="M442.23,413.75v-42.54h3.3v42.54h-3.3ZM444.35,374.21v-2.99h25.26v2.99h-25.26ZM444.35,393.36v-2.87h23.64v2.87h-23.64ZM444.35,413.75v-2.99h25.57v2.99h-25.57Z"/>
    </g></g></g>
  </svg>
);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === "string" ? <path d={d}/> : d}
  </svg>
);
const UploadIcon  = () => <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>}/>;
const SearchIcon  = () => <Icon d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const SendIcon    = () => <Icon d={<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>}/>;
const PlusIcon    = () => <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>;
const MoveIcon    = () => <Icon d={<><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></>} size={10}/>;
const FileIcon    = () => <Icon d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}/>;
const WarnIcon    = () => <Icon d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} size={11}/>;
const ChatIcon    = () => <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={11}/>;
const CheckIcon   = () => <Icon d="M20 6 9 17l-5-5" size={11}/>;
const DBIcon      = () => <Icon d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>}/>;
const ListIcon    = () => <Icon d={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>}/>;
const MapIcon     = () => <Icon d={<><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></>}/>;
const DiffIcon    = () => <Icon d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}/>;
const ExtractIcon = () => <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}/>;

const TYPE_ICONS = {
  vec: () => <Icon d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>} size={20}/>,
  kb:  () => <Icon d={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>} size={20}/>,
  raw: () => <Icon d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>} size={20}/>,
  img: () => <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>} size={20}/>,
  vid: () => <Icon d={<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>} size={20}/>,
};

const TYPE_LABELS = { vec:"VEC", kb:"KB", raw:"RAW", img:"IMG", vid:"VID" };
const TAG_MAP = { blue:"ftag ftag-blue", teal:"ftag ftag-teal", violet:"ftag ftag-violet", amber:"ftag ftag-amber", red:"ftag ftag-red", gray:"ftag ftag-gray", green:"ftag ftag-green" };

// ─── FILE CARD COMPONENT ──────────────────────────────────────────────────────
function FileCard({ file, onDragStart, onDragEnd, onClick, isSelected }) {
  const TIcon = TYPE_ICONS[file.type] || TYPE_ICONS.raw;
  const state = file.state || "READY";
  const stateInfo = FILE_STATES[state];
  const showBar = state !== "READY" && state !== "ERROR";
  const pct = file.progress ?? (state === "READY" ? 100 : 0);
  const recentLog = file.logs?.slice(-1)[0];

  return (
    <div
      className={`file-card type-${file.type} ${isSelected ? "selected" : ""} ${file.dragging ? "dragging" : ""}`}
      draggable={state === "READY"}
      onDragStart={() => onDragStart(file)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(file)}
      style={{ animationDelay: `${(file.animDelay || 0)}ms` }}
    >
      {file.isNew && <div className="new-badge">NEW</div>}
      <div className="file-inner">
        <div className="file-top">
          <div className={`file-type-icon fti-${file.type}`}>
            <TIcon />
            <span className="ext-tag">{TYPE_LABELS[file.type]}</span>
          </div>
          <div className="file-name-block">
            <div className="file-name" title={file.name}>{file.name}</div>
            <div className="file-path">{file.path}</div>
            <div className="file-tags">
              {file.tags.map(([color, label], i) => (
                <span key={i} className={TAG_MAP[color] || "ftag ftag-gray"}>{label}</span>
              ))}
            </div>
          </div>
          <div className="size-badge">
            <div className="size-num">{file.mb}</div>
            <div className="size-unit">MB · {file.type}</div>
          </div>
        </div>

        <div className="file-stats">
          {file.stats.map((s, i) => (
            <div className="fstat" key={i}>
              <span className="fstat-val">{s.v}</span>
              <span className="fstat-key">{s.k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* State bar — always shown for active states, shown briefly for READY */}
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

      {state === "READY" && (
        <div className="drag-hint"><MoveIcon /> drag to query</div>
      )}
    </div>
  );
}

// ─── SESSION COMPONENT ────────────────────────────────────────────────────────
function Session({ session, isActive }) {
  const [files, setFiles] = useState(session.files);
  const [scopedIds, setScopedIds] = useState(new Set());
  const [draggingId, setDraggingId] = useState(null);
  const [trayDragOver, setTrayDragOver] = useState(false);
  const [listDragOver, setListDragOver] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [activeOp, setActiveOp] = useState("QUERY");
  const [streamLog, setStreamLog] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef();
  const streamLogRef = useRef();
  const dragEnterCount = useRef(0);

  // Update files ref so callbacks see current state
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

  // Handle mock stream events
  const handleStreamEvent = useCallback(({ fileId, state, msg, pct }) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId
        ? { ...f, state, progress: pct, logs: [...(f.logs || []).slice(-2), msg] }
        : f
    ));
    const evClass = `ev-${state.toLowerCase()}`;
    addLogEntry(fileId, `[${state}] ${msg}`, evClass);
  }, [addLogEntry]);

  // Start stream for a file
  const startStream = useCallback((fileId, fileMb) => {
    createMockStream(fileId, fileMb, handleStreamEvent);
  }, [handleStreamEvent]);

  // Seed files start streaming on first mount if session has seed data
  useEffect(() => {
    if (!session.hasSeedFiles) return;
    files.forEach((f, i) => {
      if (f.state !== "READY") {
        setTimeout(() => startStream(f.id, f.mb), i * 400);
      }
    });
  }, []); // eslint-disable-line

  const scopedFiles = files.filter(f => scopedIds.has(f.id));
  const totalScopedMb = scopedFiles.reduce((s, f) => s + f.mb, 0);
  const sessionPct = Math.min((totalScopedMb / SESSION_MB) * 100, 100);
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
    // Internal card drag
    if (draggingId) {
      const f = files.find(f => f.id === draggingId);
      if (f) addToScope(f);
      return;
    }
    // OS file drop — handle same as list drop
    if (e.dataTransfer.files.length) handleOSFileDrop(Array.from(e.dataTransfer.files));
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
        tags: [[{vec:"blue",kb:"teal",vid:"red",img:"violet",raw:"amber"}[type], ext.toUpperCase() + " · uploaded"], ["gray", mb + " MB"]],
        stats: [{ v:"—", k:"VECTORS" }, { v: ext.toUpperCase(), k:"FORMAT" }, { v:"now", k:"UPLOADED" }, { v:"pending", k:"INDEX" }],
        state: "QUEUED", progress: 0, logs: [], animDelay: i * 80,
      };
    });
    setFiles(prev => [...prev, ...newCards]);
    // Stagger stream start
    newCards.forEach((f, i) => {
      setTimeout(() => {
        setFiles(prev => prev.map(fc => fc.id === f.id ? { ...fc, state: "REMEMBERING" } : fc));
        startStream(f.id, f.mb);
        addLogEntry(f.id, `[QUEUED] File received — starting ingestion pipeline`, "ev-remembering");
      }, i * 600 + 200);
    });
  }

  const hasFiles = files.length > 0;
  const totalMb = files.reduce((s, f) => s + f.mb, 0);

  if (!isActive) return null;

  return (
    <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

      {/* ── LEFT: YOUR FILES ── */}
      <div className="fs-panel">
        <div className="fs-toolbar">
          <div className="fs-toolbar-top">
            <div className="fs-title">Your Files</div>
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
              <UploadIcon /> Add files
            </button>
            <input ref={fileInputRef} type="file" multiple style={{ display:"none" }}
              onChange={e => { handleOSFileDrop(Array.from(e.target.files)); e.target.value = ""; }}/>
            <div className="fs-subtitle">knowdrive://{session.id}</div>
          </div>
          <div className="fs-path">
            <span>knowdrive://</span>
            <span style={{ color:"var(--text-muted)" }}> / </span>
            <span>session</span>
            <span style={{ color:"var(--text-muted)" }}> / </span>
            <span className="crumb-active">{session.id}</span>
          </div>
          <div className="fs-sort">
            <span className="sort-btn active">size ↓</span>
            <span className="sort-sep"/>
            <span className="sort-btn">name</span>
            <span className="sort-btn">type</span>
            <span className="sort-btn">state</span>
            <span className="fs-count">{files.length} objects · {totalMb} MB</span>
          </div>
        </div>

        <div
          className="file-list-wrap"
          onDragEnter={e => { if (e.dataTransfer.types.includes("Files")) { dragEnterCount.current++; setListDragOver(true); }}}
          onDragLeave={() => { dragEnterCount.current--; if (dragEnterCount.current <= 0) { dragEnterCount.current = 0; setListDragOver(false); }}}
          onDragOver={e => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
          onDrop={handleListOSDrop}
        >
          {listDragOver && (
            <div className="drop-overlay">
              <UploadIcon />
              <div className="drop-label">Drop files to add to session</div>
              <div className="drop-sub">PDF, DOCX, MP4, PNG, JSON and more</div>
            </div>
          )}

          {!hasFiles && (
            <div className="empty-state">
              <div className="empty-icon"><FileIcon /></div>
              <div className="empty-title">No files yet</div>
              <div className="empty-sub">Add files to this session by uploading or dragging them in. RLLM will remember and index them automatically.</div>
              <button className="empty-cta" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon /> Add your first file
              </button>
            </div>
          )}

          {files.map(file => (
            <FileCard
              key={file.id}
              file={{ ...file, path: file.path.replace("{sid}", session.id) }}
              isSelected={scopedIds.has(file.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={handleFileClick}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT: QUERY WORKSPACE ── */}
      <div className="query-panel">
        <div className="welcome-head">
          <div className="welcome-eyebrow">Session · {session.id}</div>
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
          {/* Tray */}
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
                <MoveIcon /> Drag files here or click them to add to scope
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

          {/* Op selector + compose — or empty state */}
          {!hasFiles ? (
            <div className="query-empty-state">
              <div className="qes-icon"><DBIcon /></div>
              <div className="qes-title">Waiting for files</div>
              <div className="qes-sub">Once files are added to this session, RLLM will index them and you can run semantic queries, summaries, diffs, and cross-maps.</div>
            </div>
          ) : (
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"10px", minHeight:0 }}>
              <div className="op-selector">
                {Object.entries(OP_MAP).map(([key, op]) => (
                  <button key={key} className={`op-btn ${activeOp === key ? "active" : ""}`} onClick={() => setActiveOp(key)}>
                    {{ QUERY:<SearchIcon/>, SUMMARIZE:<ListIcon/>, DIFF:<DiffIcon/>, EXTRACT:<ExtractIcon/>, MAP:<MapIcon/> }[key]}
                    {op.label}
                  </button>
                ))}
              </div>

              <div className="query-input-wrap">
                <div className="query-input-header">
                  <span className="qih-label">input://</span>
                  <span className="qih-op">{OP_MAP[activeOp].label}</span>
                  <span className="qih-cursor">▊</span>
                </div>
                <textarea
                  className="query-textarea"
                  placeholder={OP_MAP[activeOp].ph}
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) { setSubmitting(true); setTimeout(() => setSubmitting(false), 2000); }}}
                />
                <div className="query-footer">
                  <div className="session-usage">
                    <span>session window</span>
                    <div className="usage-bar-track">
                      <div className="usage-bar-fill" style={{ width: `${sessionPct.toFixed(1)}%` }}/>
                    </div>
                    <span className="usage-pct">{sessionPct.toFixed(1)}%</span>
                    <span className="usage-free">— {SESSION_MB - totalScopedMb} MB free</span>
                  </div>
                  <button className="submit-btn" disabled={!canSubmit || submitting} onClick={() => { setSubmitting(true); setTimeout(() => setSubmitting(false), 2000); }}>
                    <SendIcon />{submitting ? "Running…" : "Run Query"}
                  </button>
                </div>

                {/* Live stream log overlay */}
                {streamLog.length > 0 && (
                  <div className="stream-log" ref={streamLogRef}>
                    {streamLog.map((entry, i) => (
                      <div key={i} className="log-entry">
                        <span className="log-ts">{entry.ts}</span>
                        <span className="log-file">{entry.file.length > 18 ? entry.file.slice(0,16)+"…" : entry.file}</span>
                        <span className={`log-msg ${entry.evClass}`}>{entry.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function KnowDrive() {
  const makeSession = (withFiles = true) => {
    const id = GEN_ID();
    return {
      id,
      label: id.replace("-" + new Date().getFullYear(), ""),
      hasActivity: withFiles,
      hasSeedFiles: withFiles,
      files: withFiles
        ? SEED_FILES.map((f, i) => ({
            ...f,
            path: f.path.replace("{sid}", id),
            state: "QUEUED",
            progress: 0,
            logs: [],
            animDelay: i * 60,
          }))
        : [],
    };
  };

  const [sessions, setSessions] = useState([makeSession(true)]);
  const [activeId, setActiveId] = useState(() => sessions[0].id);
  const [ttl, setTtl] = useState(3600);

  // Global TTL countdown
  useEffect(() => {
    const t = setInterval(() => setTtl(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const ttlStr = `${String(Math.floor(ttl / 60)).padStart(2, "0")}:${String(ttl % 60).padStart(2, "0")}`;

  function addSession() {
    const s = makeSession(false);
    setSessions(prev => [...prev, s]);
    setActiveId(s.id);
  }
  function closeSession(id, e) {
    e.stopPropagation();
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) return prev; // never close last tab
      return next;
    });
    if (activeId === id) {
      setSessions(prev => {
        const next = prev.filter(s => s.id !== id);
        if (next.length > 0) setActiveId(next[next.length - 1].id);
        return prev;
      });
    }
  }

  // Compute total storage across all sessions for meter
  const totalUsedMb = sessions.reduce((sum, s) => sum + s.files.reduce((fs, f) => fs + f.mb, 0), 0);
  const meterPct = Math.min((totalUsedMb / SESSION_MB) * 100, 100);

  return (
    <>
      <style>{css}</style>
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="topbar-logo"><LogoSVG /></div>
          <div className="topbar-divider"/>
          <div className="ephem-badge">
            <div className="ephem-dot"/>
            <span className="ephem-label">EPHEMERAL SESSION</span>
          </div>
          <div className="meter-wrap">
            <span className="meter-label">1 GB limit</span>
            <div className="meter-track"><div className="meter-fill" style={{ width: `${meterPct}%` }}/></div>
            <span className="meter-val">{totalUsedMb} MB used</span>
          </div>
          <div style={{ flex:1 }}/>
          <div className="session-meta">
            <span>SESSION <span className="session-id-val">{activeId}</span></span>
            <div className="ttl-wrap">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>TTL</span> <span className="ttl-val">{ttlStr}</span>
            </div>
          </div>
          <div className="user-chip">
            <div className="avatar">JA</div>
            <span className="user-name">Joel Augé</span>
          </div>
        </div>

        {/* ── TABS BAR ── */}
        <div className="tabs-bar">
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
        </div>

        {/* ── SESSION BODIES ── */}
        <div className="session-body">
          {sessions.map(s => (
            <Session key={s.id} session={s} isActive={s.id === activeId} />
          ))}
        </div>

      </div>
    </>
  );
}
