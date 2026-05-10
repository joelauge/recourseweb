import { useState, useEffect, useCallback, useRef } from 'react';

export function useKnowDB(options = {}) {
  const { currentPrefix = '', selectedVectorStore = 'global', selectedTags = [] } = options;
  
  const [files, setFiles] = useState([]);
  const [vectorStores, setVectorStores] = useState([]);
  const [fileStatuses, setFileStatuses] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const lastEventTimestampRef = useRef({});

  const fetchVectorStores = useCallback(async () => {
    try {
      const res = await fetch('/v1/vector_stores');
      if (!res.ok) throw new Error(`Fetch vector stores failed: ${res.status}`);
      const data = await res.json();
      if (data.data) {
        setVectorStores(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch vector stores", e);
    }
  }, []);

  const fetchFiles = useCallback(async (prefix = currentPrefix, vsId = selectedVectorStore, tags = selectedTags) => {
    try {
      let url = vsId === 'global'
        ? '/v1/files'
        : `/v1/vector_stores/${encodeURIComponent(vsId)}/files`;

      const params = new URLSearchParams();
      if (prefix) params.append('prefix', prefix);
      if (tags.length > 0) params.append('tags', tags.join(','));

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch files failed: ${res.status}`);
      const data = await res.json();
      if (data.data) {
        setFiles(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch files", e);
    }
  }, [currentPrefix, selectedVectorStore, JSON.stringify(selectedTags)]);

  const uploadFile = useCallback(async (file, customName = '', pathPrefix = '', vsId = selectedVectorStore) => {
    const formData = new FormData();
    const fileName = customName || file.name || 'blob';
    const finalName = currentPrefix ? `${currentPrefix}${pathPrefix}${fileName}` : `${pathPrefix}${fileName}`;
    
    formData.append('file', file, finalName);
    
    if (vsId !== 'global') {
      formData.append('vector_store_id', vsId);
    }

    try {
      const res = await fetch('/v1/files', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      fetchFiles();
    } catch (err) {
      console.error("Upload failed", err);
      throw err;
    }
  }, [currentPrefix, selectedVectorStore, fetchFiles]);

  const deleteFile = useCallback(async (fileId) => {
    try {
      const res = await fetch(`/v1/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      fetchFiles();
    } catch (err) {
      console.error("Delete failed", err);
      throw err;
    }
  }, [fetchFiles]);

  const performSearch = useCallback(async (params) => {
    const { 
      query, mode, field, file, 
      maxDistance = 1.1, limit = 10, offset = 0, 
      vsId = selectedVectorStore,
      fileIds = [],
      tags = []
    } = params;
    
    // Map 'visual' to 'vision' for backend compatibility
    const finalField = field === 'visual' ? 'vision' : field;
    
    setIsSearching(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (query) formData.append('text', query);
        formData.append('max_distance', maxDistance.toString());
        formData.append('limit', limit.toString());
        formData.append('offset', offset.toString());
        formData.append('mode', mode);
        formData.append('search_field', finalField);
        if (fileIds.length > 0) formData.append('file_ids', fileIds.join(','));
        if (tags.length > 0) formData.append('tags', tags.join(','));
        if (vsId !== 'global') formData.append('vector_store_id', vsId);

        res = await fetch('/search', { method: 'POST', body: formData });
      } else {
        let url = `/search?query=${encodeURIComponent(query)}&max_distance=${maxDistance}&mode=${mode}&limit=${limit}&offset=${offset}&search_field=${finalField}&include_binary=false`;
        if (vsId !== 'global') url += `&vector_store_id=${encodeURIComponent(vsId)}`;
        if (fileIds.length > 0) url += `&file_ids=${encodeURIComponent(fileIds.join(','))}`;
        if (tags.length > 0) url += `&tags=${encodeURIComponent(tags.join(','))}`;
        res = await fetch(url);
      }

      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      setSearchResults(data.atoms || []);
      return data;
    } catch (err) {
      console.error("Search failed", err);
      throw err;
    } finally {
      setIsSearching(false);
    }
  }, [selectedVectorStore]);

  // SSE Listener
  useEffect(() => {
    const url = currentPrefix ? `/events?prefix=${encodeURIComponent(currentPrefix)}` : '/events';
    const eventSource = new EventSource(url);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.id && data.action) fetchVectorStores();

        if (data.uri && data.status) {
          if (data.timestamp) {
            const lastTs = lastEventTimestampRef.current[data.uri];
            if (lastTs && data.timestamp < lastTs) return;
            lastEventTimestampRef.current[data.uri] = data.timestamp;
          }

          const mappedStatus = (data.status === 'ready' || data.status === 'completed') ? 'processed' : data.status;

          setFileStatuses(prev => ({
            ...prev,
            [data.uri]: {
              status: mappedStatus,
              chunks_processed: data.chunks_processed,
              chunks_total: data.chunks_total
            }
          }));

          if (mappedStatus === 'processed') fetchFiles();
        }
      } catch (err) {
        console.error("Error parsing SSE", err);
      }
    };

    return () => eventSource.close();
  }, [currentPrefix, fetchFiles, fetchVectorStores]);

  return {
    files,
    vectorStores,
    fileStatuses,
    isSearching,
    searchResults,
    fetchFiles,
    fetchVectorStores,
    uploadFile,
    performSearch,
    deleteFile
  };
}
