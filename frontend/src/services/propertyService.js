import api from './api';

const propertyService = {
  getAll: async (params) => {
    const { data } = await api.get('/public/properties', { params });
    return data;
  },
  getOne: async (slug) => {
    const { data } = await api.get(`/public/properties/${slug}`);
    return data;
  },
  getFeatured: async () => {
    const { data } = await api.get('/public/properties/featured');
    return data;
  },
  create: async (propertyData) => {
    const { data } = await api.post('/properties', propertyData);
    return data;
  },
  update: async (id, propertyData) => {
    const { data } = await api.put(`/properties/${id}`, propertyData);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/properties/${id}`);
    return data;
  },
};

export default propertyService;
