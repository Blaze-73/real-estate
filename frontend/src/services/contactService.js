import api from './api';

const contactService = {
  send: async (contactData) => {
    const { data } = await api.post('/public/contact', contactData);
    return data;
  },

  revealPhone: async (slug, contactData) => {
    const { data } = await api.post(`/public/properties/${slug}/reveal-phone`, contactData);
    return data;
  },

  list: async (params) => {
    const { data } = await api.get('/contacts', { params });
    return data;
  },

  markRead: async (id) => {
    const { data } = await api.put(`/contacts/${id}/read`);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/contacts/${id}`);
    return data;
  },
};

export default contactService;
