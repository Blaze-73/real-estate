import api from './api';

const unwrap = (res) => res.data?.data ?? res.data;

const savedSearchService = {
  getAll: async () => api.get('/saved-searches').then((res) => res.data.data ?? []),
  store: async (payload) => api.post('/saved-searches', payload).then(unwrap),
  update: async (id, payload) => api.put(`/saved-searches/${id}`, payload).then(unwrap),
  remove: async (id) => api.delete(`/saved-searches/${id}`).then((r) => r.data),
  preview: async (id) => api.get(`/saved-searches/${id}/preview`).then((r) => r.data),
};

export default savedSearchService;