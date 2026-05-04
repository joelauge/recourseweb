// Mock API for KnowDrive File System
const MOCK_FILES = [
    { id: 1, name: 'PIPEDA Compliance Manual.vec', creator: 'Joel Augé', role: 'Admin', vectors: 2341, ingested: 'Apr 12, 2025', lastQueried: 'Apr 21, 2025', type: 'blue', typeLabel: 'VEC' },
    { id: 2, name: 'BT Orchestration Schema.kb', creator: 'Pierre Augé', role: 'CTO', vectors: 891, ingested: 'Apr 8, 2025', lastQueried: 'Apr 20, 2025', type: 'teal', typeLabel: 'KB' },
    { id: 3, name: 'Q1 Market Analysis.raw', creator: 'Dave McLean', role: 'Consultant', vectors: 443, ingested: 'Mar 28, 2025', lastQueried: 'Apr 18, 2025', type: 'amber', typeLabel: 'RAW' },
    { id: 4, name: 'CRTC Policy Digest.vec', creator: 'Kevin Shepherd', role: 'CEO', vectors: 1108, ingested: 'Mar 30, 2025', lastQueried: 'Apr 19, 2025', type: 'violet', typeLabel: 'VEC' }
];

const MOCK_STORAGE = {
    documents: { vectors: 1842, size: '6.2 GB', total: '10 GB', percent: 62 },
    embeddings: { vectors: 4590, size: '3.8 GB', total: '10 GB', percent: 38 },
    schemas: { vectors: 287, size: '5.4 GB', total: '7 GB', percent: 75 },
    raw: { vectors: 634, size: '3.0 GB', total: '5 GB', percent: 23 },
    totalIndexed: '18.4 GB',
    totalCapacity: '32 GB',
    usagePercent: 57
};

const MOCK_NAMESPACES = [
    { id: 1, name: 'Compliance Core', tag: 'PIPEDA', type: 'blue', files: 15, size: '4.2 GB', starred: true },
    { id: 2, name: 'Orchestrator KB', tag: 'BT Engine', type: 'teal', files: 35, size: '1.8 GB', starred: false },
    { id: 3, name: 'Market Intel', tag: 'Research', type: 'amber', files: 20, size: '890 MB', starred: false }
];

export const api = {
    getFiles: async () => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_FILES), 300));
    },
    getStorageData: async () => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_STORAGE), 200));
    },
    getNamespaces: async () => {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_NAMESPACES), 250));
    },
    searchFiles: async (query) => {
        return new Promise(resolve => {
            const results = MOCK_FILES.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
            setTimeout(() => resolve(results), 400);
        });
    }
};
