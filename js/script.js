import { api } from './api.js';
import { store } from './store.js';

document.addEventListener('DOMContentLoaded', async () => {
    initUI();
    await fetchData();
    render();
    startIngestionSimulation();
});

function initUI() {
    // Sidebar Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 1024) {
                document.querySelector('.sidebar').classList.remove('active');
            }
        });
    });

    // Mobile Sidebar Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Global Search
    const searchInput = document.querySelector('.search-wrap input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            store.setFilter('search', e.target.value);
            debounceSearch(e.target.value);
        });
    }

    // Table Inline Search
    const tableSearch = document.querySelector('.tbl-search');
    if (tableSearch) {
        tableSearch.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            const input = document.createElement('input');
            input.style.border = 'none';
            input.style.background = 'transparent';
            input.style.outline = 'none';
            input.style.width = '100%';
            input.placeholder = 'Search files...';
            tableSearch.innerHTML = '';
            tableSearch.appendChild(input);
            input.focus();
            input.addEventListener('input', (e) => {
                store.setFilter('search', e.target.value);
            });
        });
    }

    // Table Filters
    const filters = document.querySelectorAll('.tbl-filter');
    filters.forEach((filter, index) => {
        filter.addEventListener('click', () => {
            // Index 0: Type, Index 1: Agent, Index 2: Date
            if (index === 0) {
                const types = ['all', 'blue', 'teal', 'amber', 'violet'];
                const current = store.state.filters.type;
                const next = types[(types.indexOf(current) + 1) % types.length];
                store.setFilter('type', next);
                filter.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> ${next === 'all' ? 'All Types' : next.charAt(0).toUpperCase() + next.slice(1)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
            }
        });
    });

    // Subscribe to store
    store.subscribe(() => render());

    // Theme handling
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';
    root.setAttribute('data-theme', savedTheme);
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

async function fetchData() {
    const savedNamespaces = localStorage.getItem('kd_namespaces');
    const namespaces = savedNamespaces ? JSON.parse(savedNamespaces) : await api.getNamespaces();
    
    const savedStorage = localStorage.getItem('kd_storage');
    const storage = savedStorage ? JSON.parse(savedStorage) : await api.getStorageData();

    const files = await api.getFiles();
    
    store.setFiles(files);
    store.setStorage(storage);
    store.setNamespaces(namespaces);

    // Sync search input if it exists
    const searchInput = document.querySelector('.search-wrap input');
    if (searchInput && store.state.filters.search) {
        searchInput.value = store.state.filters.search;
    }
}

let searchTimeout;
function debounceSearch(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const results = await api.searchFiles(query);
        // Only update if search hasn't changed since request
        if (store.state.filters.search === query) {
            // We combine local search with API for simulation
            render();
        }
    }, 300);
}

function startIngestionSimulation() {
    setInterval(() => {
        const newFile = {
            id: Date.now(),
            name: `AutoIngest_${Math.floor(Math.random()*1000)}.vec`,
            creator: 'System Agent',
            role: 'Bot',
            vectors: Math.floor(Math.random() * 500) + 100,
            ingested: 'Just now',
            lastQueried: '-',
            type: 'blue',
            typeLabel: 'VEC'
        };
        
        const currentFiles = [...store.state.files];
        currentFiles.unshift(newFile);
        if (currentFiles.length > 10) currentFiles.pop();
        store.setFiles(currentFiles);

        // Update signals (mock UI update)
        const signals = document.querySelector('.signals-list');
        if (signals) {
            const newSignal = document.createElement('div');
            newSignal.className = 'signal-item';
            newSignal.innerHTML = `
                <div class="signal-dot blue"></div>
                <div class="signal-content">
                    <div class="signal-title">Auto-ingested ${newFile.name}</div>
                    <div class="signal-meta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${new Date().toLocaleTimeString()}</div>
                </div>
                <span class="signal-arrow">›</span>
            `;
            signals.prepend(newSignal);
            if (signals.children.length > 5) signals.lastElementChild.remove();
        }
    }, 15000); // Every 15 seconds
}

function render() {
    const state = store.state;
    
    // Apply filters
    let filteredFiles = state.files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(state.filters.search.toLowerCase());
        const matchesType = state.filters.type === 'all' || f.type === state.filters.type;
        return matchesSearch && matchesType;
    });

    renderFilesTable(filteredFiles);
    renderStorageWidget(state.storage);
    renderStorageCards(state.storage);
    renderNamespaces(state.namespaces);
}

function renderFilesTable(files) {
    const tbody = document.querySelector('.files-table tbody');
    if (!tbody) return;

    tbody.innerHTML = files.map(file => `
        <tr>
            <td><div class="cb ${file.id <= 2 ? 'checked' : ''}" data-id="${file.id}"></div></td>
            <td><div class="file-row-name"><span class="ftype-dot ${file.type}"></span><span class="fname">${file.name}</span></div></td>
            <td><div class="creator-cell"><div class="avatar-sm av-${file.type}">${file.creator.split(' ').map(n => n[0]).join('')}</div><div class="creator-info"><div class="creator-name">${file.creator}</div><div class="creator-role">${file.role}</div></div></div></td>
            <td class="size-cell">${file.vectors.toLocaleString()}</td>
            <td class="date-cell">${file.ingested}</td>
            <td class="date-cell">${file.lastQueried}</td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.cb').forEach(cb => {
        cb.addEventListener('click', () => {
            cb.classList.toggle('checked');
        });
    });
}

function renderStorageWidget(storage) {
    const widget = document.querySelector('.storage-widget');
    if (!widget || !storage.usagePercent) return;

    const usedText = widget.querySelector('.storage-used');
    const barFill = widget.querySelector('.storage-bar-fill');
    const capText = widget.querySelector('.storage-text');

    if (usedText) usedText.innerHTML = `${storage.totalIndexed} <span style="font-size:11px;font-weight:400;color:var(--text-secondary)">of ${storage.totalCapacity} indexed</span>`;
    if (barFill) barFill.style.width = `${storage.usagePercent}%`;
    if (capText) capText.innerText = `${storage.usagePercent}% vector capacity used`;
}

function renderStorageCards(storage) {
    const cards = document.querySelectorAll('.storage-card');
    if (cards.length === 0 || !storage.documents) return;

    const mapping = ['documents', 'embeddings', 'schemas', 'raw'];
    cards.forEach((card, index) => {
        const data = storage[mapping[index]];
        if (!data) return;

        const count = card.querySelector('.sc-count');
        const bar = card.querySelector('.sc-bar');
        const size = card.querySelector('.sc-size');

        if (count) count.innerText = `${data.vectors.toLocaleString()} ${index === 1 ? 'chunks' : index === 2 ? 'structures' : 'files'}`;
        if (bar) bar.style.width = `${data.percent}%`;
        if (size) size.innerText = `${data.size} of ${data.total}`;
    });
}

function renderNamespaces(namespaces) {
    const nsList = document.querySelector('.ns-list');
    if (!nsList) return;

    nsList.innerHTML = namespaces.map(ns => `
        <div class="ns-item" data-id="${ns.id}">
            <div class="ns-icon ${ns.type}">
                ${getNamespaceIcon(ns.type)}
            </div>
            <div class="ns-info">
                <div class="ns-name">${ns.name}</div>
                <div class="ns-meta"><span class="tag ${ns.type}">${ns.tag}</span><span class="sep">•</span><span style="color:var(--text-muted)">${ns.files} Files • ${ns.size}</span></div>
            </div>
            <span class="star ${ns.starred ? 'filled' : 'empty'}" data-id="${ns.id}">${ns.starred ? '★' : '☆'}</span>
            <span class="dot-menu" style="color:var(--text-muted);font-size:16px;letter-spacing:1px;">···</span>
        </div>
    `).join('');

    nsList.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(star.dataset.id);
            const namespaces = store.state.namespaces.map(ns => {
                if (ns.id === id) {
                    return { ...ns, starred: !ns.starred };
                }
                return ns;
            });
            store.setNamespaces(namespaces);
        });
    });
}

function getNamespaceIcon(type) {
    if (type === 'blue') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
    if (type === 'teal') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>';
}
