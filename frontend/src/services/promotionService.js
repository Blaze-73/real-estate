import api from './api';

const promotionService = {
  list: async (params = {}) => {
    const { data } = await api.get('/promotions', { params });
    return data;
  },
  store: async (payload) => {
    const { data } = await api.post('/promotions', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/promotions/${id}`, payload);
    return data;
  },
  destroy: async (id) => {
    const { data } = await api.delete(`/promotions/${id}`);
    return data;
  },
};

export default promotionService;