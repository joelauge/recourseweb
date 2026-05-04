// Application State Management
export const store = {
    state: {
        files: [],
        namespaces: [],
        storage: {},
        filters: JSON.parse(localStorage.getItem('kd_filters')) || {
            type: 'all',
            search: ''
        }
    },
    
    listeners: [],
    
    subscribe(callback) {
        this.listeners.push(callback);
    },
    
    notify() {
        this.listeners.forEach(callback => callback(this.state));
    },
    
    setFiles(files) {
        this.state.files = files;
        this.notify();
    },

    setNamespaces(namespaces) {
        this.state.namespaces = namespaces;
        // Save starred status if needed, or we just save the whole array for simplicity
        localStorage.setItem('kd_namespaces', JSON.stringify(namespaces));
        this.notify();
    },
    
    setStorage(storage) {
        this.state.storage = storage;
        localStorage.setItem('kd_storage', JSON.stringify(storage));
        this.notify();
    },
    
    setFilter(key, value) {
        this.state.filters[key] = value;
        localStorage.setItem('kd_filters', JSON.stringify(this.state.filters));
        this.notify();
    }
};
