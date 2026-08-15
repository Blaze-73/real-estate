import api from './api';

const dealService = {
  list: async (params = {}) => {
    const { data } = await api.get('/deals', { params });
    return data;
  },
  stats: async () => {
    const { data } = await api.get('/deals/stats');
    return data;
  },
  store: async (payload) => {
    const { data } = await api.post('/deals', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/deals/${id}`, payload);
    return data;
  },
  destroy: async (id) => {
    const { data } = await api.delete(`/deals/${id}`);
    return data;
  },
};

export default dealService;