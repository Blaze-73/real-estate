import api from './api';

const contactService = {
  send: async (contactData) => {
    const { data } = await api.post('/public/contact', contactData);
    return data;
  },
};

export default contactService;
