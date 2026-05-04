export const GEN_ID = () => {
  const chars = "ABCDEF0123456789";
  let id = "KD-";
  for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id + "-" + new Date().getFullYear();
};

export function createMockStream(fileId, fileMb, onEvent) {
  const isLarge = fileMb > 50; 
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