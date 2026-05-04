
export const FILE_STATES = {
  QUEUED:      { label: "Queued",      color: "queued" },
  REMEMBERING: { label: "Remembering", color: "remembering" }, // uploading / writing to session storage
  LEARNING:    { label: "Learning",    color: "learning" },    // chunking / vectorizing
  INDEXING:    { label: "Indexing",    color: "indexing" },    // building HNSW index in SuperVector DB
  READY:       { label: "Ready",       color: "ready" },       // indexed, queryable
  ERROR:       { label: "Error",       color: "error" },
};

export const OP_MAP = {
  QUERY:     { label: "semantic_query",  ph: 'Describe what you want to find across the files in scope…\n\ne.g. "What does the PIPEDA manual say about consent gates, and where does Pierre demonstrate this in the demo?"' },
  SUMMARIZE: { label: "summarize",       ph: 'Which files should be summarized, and at what level of detail?' },
  DIFF:      { label: "diff_files",      ph: 'What should be compared between the files in scope?' },
  EXTRACT:   { label: "extract_data",    ph: 'What specific data should be extracted?' },
  MAP:       { label: "cross_map",       ph: 'What concepts should be cross-mapped across all files?' },
};

export const SEED_FILES = [
  { id: "f1", name: "PIPEDA Compliance Manual", path: "session/{sid}/compliance/pipeda-manual-v2.vec",
    type: "vec", mb: 88, tags: [["blue","PIPEDA"],["blue","AI Governance"],["gray","2,341 vectors"]],
    stats: [{v:"2,341",k:"VECTORS"},{v:"1536",k:"DIMS"},{v:"Apr 12",k:"INDEXED"},{v:"0.97",k:"DENSITY"}],
    details: { model: "text-embedding-3-large", chunks: "842", author: "Legal Team", version: "2.4.1" }, addedAt: 1712918400000 },
  { id: "f2", name: "Pierre's BT Demo — Live", path: "session/{sid}/media/pierre-bt-demo-ep14.mp4",
    type: "vid", mb: 124, tags: [["red","MP4 · 1080p"],["gray","38:14"],["gray","4,102 chunks"]],
    stats: [{v:"4,102",k:"CHUNKS"},{v:"38:14",k:"DURATION"},{v:"Apr 14",k:"RECORDED"},{v:"AI",k:"TRANSCRIPT"}],
    details: { codec: "h.264", bitrate: "4.2 Mbps", fps: "30", provider: "RLLM-Vision" }, addedAt: 1713091200000 },
  { id: "f3", name: "BT Orchestration Schema", path: "session/{sid}/schemas/bt-orchestration-v2.1.kb",
    type: "kb", mb: 64, tags: [["teal","pytrees v2.1"],["teal","BT Engine"],["gray","891 vectors"]],
    stats: [{v:"891",k:"VECTORS"},{v:"768",k:"DIMS"},{v:"Apr 8",k:"INDEXED"},{v:"0.88",k:"DENSITY"}],
    details: { engine: "RecourseBT-v4", schema: "YAML", validation: "Strict" }, addedAt: 1712572800000 },
  { id: "f4", name: "BT Architecture Diagram", path: "session/{sid}/media/bt-pipeline-v2.1.png",
    type: "img", mb: 22, tags: [["violet","PNG · 2400×1600"],["gray","CLIP-L/14"],["gray","893 visual vecs"]],
    stats: [{v:"893",k:"VIS.VECS"},{v:"CLIP",k:"MODEL"},{v:"Apr 14",k:"INDEXED"},{v:"2400px",k:"WIDTH"}],
    details: { resolution: "2400x1600", depth: "24-bit", model: "CLIP-L/14", colorSpace: "sRGB" }, addedAt: 1713091200000 },
  { id: "f5", name: "Q1 Market Intel Shard", path: "session/{sid}/intel/q1-market-intel.csv",
    type: "kb", mb: 57, tags: [["amber","CSV"],["amber","Market Intel"],["gray","443 vectors"]],
    stats: [{v:"443",k:"VECTORS"},{v:"768",k:"DIMS"},{v:"Mar 28",k:"INDEXED"},{v:"0.71",k:"DENSITY"}],
    details: { source: "Terminal-API", format: "CSV", confidence: "High" }, addedAt: 1711584000000 },
  { id: "f6", name: "Onboarding Orchestrator", path: "session/{sid}/logic/onboarding.py",
    type: "vec", mb: 12, tags: [["green","Python"],["green","UX Logic"],["gray","124 nodes"]],
    stats: [{v:"124",k:"NODES"},{v:"32",k:"EDGES"},{v:"Apr 19",k:"INDEXED"},{v:"Graph",k:"MODE"}],
    details: { type: "Script", runtime: "RLLM-Runtime-v1", complexity: "Medium" }, addedAt: 1713523200000 },
  { id: "f7", name: "Security Audit 2024", path: "session/{sid}/reports/security-audit-final.pdf",
    type: "raw", mb: 45, tags: [["red","PDF"],["red","Sensitive"],["gray","32 pages"]],
    stats: [{v:"32",k:"PAGES"},{v:"1,200",k:"VECS"},{v:"Apr 22",k:"INDEXED"},{v:"PDF",k:"OCR"}],
    details: { auditor: "ShieldGuard", classification: "Internal", compliance: "SOC2-Typ2" }, addedAt: 1713782400000 },
  { id: "f8", name: "Product Roadmap", path: "session/{sid}/planning/roadmap-h2.docx",
    type: "raw", mb: 8, tags: [["blue","DOCX"],["blue","Strategy"],["gray","12 pages"]],
    stats: [{v:"12",k:"PAGES"},{v:"450",k:"VECS"},{v:"Apr 25",k:"INDEXED"},{v:"Word",k:"DOC"}],
    details: { owner: "Product", priority: "P0", horizon: "6 months" }, addedAt: 1714041600000 },
  { id: "f9", name: "Legal Discovery — Set A", path: "session/{sid}/legal/discovery-a.zip",
    type: "raw", mb: 48, tags: [["gray","ZIP"],["gray","Discovery"]],
    stats: [{v:"1.2k",k:"FILES"},{v:"14k",k:"VECS"},{v:"Apr 26",k:"INDEXED"},{v:"Batch",k:"MODE"}],
    details: { case: "KnowDrive vs Global", retention: "7 years" }, addedAt: 1714128000000 },
  { id: "f10", name: "Training Video: App Sec", path: "session/{sid}/training/app-sec.mp4",
    type: "vid", mb: 38, tags: [["red","Video"],["gray","12:04"]],
    stats: [{v:"12:04",k:"DURATION"},{v:"720p",k:"QUALITY"},{v:"Apr 26",k:"RECORDED"},{v:"AI",k:"LOGS"}],
    details: { topic: "Application Security", speaker: "CISO" }, addedAt: 1714128000000 },
  { id: "f11", name: "System Logs — Gateway", path: "session/{sid}/logs/gateway.log",
    type: "raw", mb: 12, tags: [["amber","Log"],["gray","Production"]],
    stats: [{v:"24k",k:"LINES"},{v:"Err",k:"TYPE"},{v:"Apr 27",k:"INDEXED"},{v:"Raw",k:"MODE"}],
    details: { environment: "Production", service: "Gateway" }, addedAt: 1714214400000 },
  { id: "f12", name: "User Feedback Summary", path: "session/{sid}/feedback/summary.md",
    type: "raw", mb: 3, tags: [["green","Markdown"],["gray","Feedback"]],
    stats: [{v:"890",k:"ENTRIES"},{v:"Text",k:"DATA"},{v:"Apr 27",k:"INDEXED"},{v:"Graph",k:"MODE"}],
    details: { sentiment: "Positive", volume: "Medium" }, addedAt: 1714214400000 },
  { id: "f13", name: "Architecture Sketch", path: "session/{sid}/design/arch-sketch.png",
    type: "img", mb: 4, tags: [["violet","Image"],["gray","Whiteboard"]],
    stats: [{v:"1024px",k:"WIDTH"},{v:"CLIP",k:"MODEL"},{v:"Apr 27",k:"INDEXED"},{v:"sRGB",k:"COLOR"}],
    details: { tool: "Excalidraw", content: "System Design" }, addedAt: 1714214400000 },
  { id: "f14", name: "Employee Handbook", path: "session/{sid}/hr/handbook-2024.pdf",
    type: "raw", mb: 18, tags: [["blue","PDF"],["gray","HR"]],
    stats: [{v:"56",k:"PAGES"},{v:"800",k:"VECS"},{v:"Apr 27",k:"INDEXED"},{v:"OCR",k:"STATUS"}],
    details: { department: "HR", version: "V2.1" }, addedAt: 1714214400000 },
  { id: "f15", name: "Q2 Financial Forecast", path: "session/{sid}/finance/q2-forecast.xlsx",
    type: "kb", mb: 22, tags: [["green","XLSX"],["green","Finance"]],
    stats: [{v:"12",k:"SHEETS"},{v:"900",k:"VECS"},{v:"Apr 27",k:"INDEXED"},{v:"Tabular",k:"MODE"}],
    details: { period: "Q2 2024", auditor: "Finance Team" }, addedAt: 1714214400000 },
];

// ── Per-Store File Sets ────────────────────────────────────────────────────────
// Loaded when switching vector stores to simulate distinct corpora

export const STORE_FILES = {
  'vs-primary': null, // uses SEED_FILES (default)

  'vs-research': [
    { id: 'r1', name: 'NeurIPS 2024 Paper', path: 'session/{sid}/research/neurips-2024.pdf',
      type: 'vec', mb: 18, tags: [['blue','PDF'],['blue','ML Research'],['gray','1,204 vectors']],
      stats: [{v:'1,204',k:'VECTORS'},{v:'1536',k:'DIMS'},{v:'Jan 14',k:'INDEXED'},{v:'0.96',k:'DENSITY'}],
      details: { authors: 'LeCun et al.', venue: 'NeurIPS 2024', topic: 'Self-Supervised Learning' }, addedAt: 1705276800000 },
    { id: 'r2', name: 'Synthetic Dataset v3', path: 'session/{sid}/research/synth-dataset-v3.kb',
      type: 'kb', mb: 340, tags: [['teal','KB'],['teal','Synthetic'],['gray','18k vectors']],
      stats: [{v:'18,204',k:'VECTORS'},{v:'768',k:'DIMS'},{v:'Feb 2',k:'INDEXED'},{v:'0.89',k:'DENSITY'}],
      details: { generator: 'RLLM-Synth', seed: '42', distribution: 'Gaussian' }, addedAt: 1706832000000 },
    { id: 'r3', name: 'Experiment Log — Run 47', path: 'session/{sid}/research/exp-log-47.raw',
      type: 'raw', mb: 5, tags: [['amber','Log'],['gray','Experiment']],
      stats: [{v:'4,201',k:'LINES'},{v:'JSON',k:'FORMAT'},{v:'Mar 8',k:'INDEXED'},{v:'Raw',k:'MODE'}],
      details: { model: 'GPT-4o', epochs: '12', loss: '0.0042' }, addedAt: 1709856000000 },
    { id: 'r4', name: 'Benchmark Results Q1', path: 'session/{sid}/research/benchmarks-q1.xlsx',
      type: 'kb', mb: 9, tags: [['green','XLSX'],['green','Benchmarks']],
      stats: [{v:'8',k:'SHEETS'},{v:'620',k:'VECS'},{v:'Mar 29',k:'INDEXED'},{v:'Tabular',k:'MODE'}],
      details: { suite: 'MMLU + HumanEval', baseline: 'GPT-4-turbo' }, addedAt: 1711670400000 },
    { id: 'r5', name: 'Model Architecture Sketch', path: 'session/{sid}/research/arch-v2.png',
      type: 'img', mb: 3, tags: [['violet','Image'],['gray','Whiteboard']],
      stats: [{v:'2048px',k:'WIDTH'},{v:'CLIP',k:'MODEL'},{v:'Apr 1',k:'INDEXED'},{v:'sRGB',k:'COLOR'}],
      details: { tool: 'Excalidraw', content: 'Transformer Architecture' }, addedAt: 1711929600000 },
  ],

  'vs-archive': [
    { id: 'a1', name: 'Annual Report 2019', path: 'session/{sid}/archive/annual-report-2019.pdf',
      type: 'raw', mb: 64, tags: [['gray','PDF'],['gray','Archive'],['gray','2019']],
      stats: [{v:'148',k:'PAGES'},{v:'5.2k',k:'VECS'},{v:'Jan 5 \'20',k:'INDEXED'},{v:'OCR',k:'MODE'}],
      details: { year: '2019', auditor: 'Deloitte', classification: 'Public' }, addedAt: 1578182400000 },
    { id: 'a2', name: 'Legacy CRM Export', path: 'session/{sid}/archive/crm-export-2018.csv',
      type: 'kb', mb: 210, tags: [['gray','CSV'],['amber','Legacy'],['gray','11k records']],
      stats: [{v:'11,204',k:'RECORDS'},{v:'Text',k:'FORMAT'},{v:'Dec 1 \'18',k:'INDEXED'},{v:'Tabular',k:'MODE'}],
      details: { source: 'Salesforce Classic', fields: '42', era: '2016–2018' }, addedAt: 1543622400000 },
    { id: 'a3', name: 'Patent Filing — KD-001', path: 'session/{sid}/archive/patent-kd001.pdf',
      type: 'raw', mb: 12, tags: [['blue','PDF'],['blue','IP'],['gray','Sealed']],
      stats: [{v:'38',k:'PAGES'},{v:'890',k:'VECS'},{v:'Jun 14 \'21',k:'INDEXED'},{v:'Legal',k:'CLASS'}],
      details: { USPTO: 'US11,234,567', filing: 'Jun 2021', status: 'Granted' }, addedAt: 1623628800000 },
    { id: 'a4', name: 'Board Minutes 2020–22', path: 'session/{sid}/archive/board-minutes.zip',
      type: 'raw', mb: 8, tags: [['gray','ZIP'],['gray','Board'],['gray','Confidential']],
      stats: [{v:'24',k:'DOCS'},{v:'1.1k',k:'VECS'},{v:'Jan 10 \'23',k:'INDEXED'},{v:'Batch',k:'MODE'}],
      details: { sessions: '24', retention: '10 years', classification: 'Confidential' }, addedAt: 1673308800000 },
  ],
};

export const TYPE_LABELS = {
  vec: "VECTOR", kb: "KNOWLEDGE", vid: "VIDEO", img: "IMAGE", raw: "RAW"
};

export const TAG_MAP = {
  blue: "ftag ftag-blue", teal: "ftag ftag-teal", violet: "ftag ftag-violet",
  amber: "ftag ftag-amber", red: "ftag ftag-red", green: "ftag ftag-green",
  gray: "ftag ftag-gray"
};

