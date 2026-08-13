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
  quote: async (slug, dates) => {
    const { data } = await api.post(`/public/properties/${slug}/quote`, dates);
    return data;
  },
  book: async (slug, bookingData) => {
    const { data } = await api.post(`/public/properties/${slug}/book`, bookingData);
    return data;
  },
  calendar: async (slug, month) => {
    const { data } = await api.get(`/public/properties/${slug}/calendar`, { params: { month } });
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
  uploadImages: async (id, files) => {
    const form = new FormData();
    files.forEach((file) => form.append('images[]', file));
    const { data } = await api.post(`/properties/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  setPrimaryImage: async (imageId) => {
    const { data } = await api.patch(`/property-images/${imageId}/primary`);
    return data;
  },
  deleteImage: async (imageId) => {
    const { data } = await api.delete(`/property-images/${imageId}`);
    return data;
  },
};

export default propertyService;
