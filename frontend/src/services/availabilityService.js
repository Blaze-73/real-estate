import api from './api';

const availabilityService = {
  getCalendar: async (slug, month) => {
    const { data } = await api.get(`/public/properties/${slug}/calendar`, { params: { month } });
    return data;
  },
  getBlocks: async (propertyId) => {
    const { data } = await api.get(`/properties/${propertyId}/availability`);
    return data;
  },
  createBlock: async (propertyId, payload) => {
    const { data } = await api.post(`/properties/${propertyId}/availability`, payload);
    return data;
  },
  deleteBlock: async (blockId) => {
    const { data } = await api.delete(`/availability/${blockId}`);
    return data;
  },
  importIcs: async (propertyId, file) => {
    const form = new FormData();
    form.append('ical', file);
    const { data } = await api.post(`/properties/${propertyId}/ical-import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default availabilityService;