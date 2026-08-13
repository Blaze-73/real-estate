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
};

export default availabilityService;