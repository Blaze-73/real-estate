import api from './api';

const clientService = {
  getAll: async () => {
    const { data } = await api.get('/clients');
    return data;
  },
  create: async (clientData) => {
    const { data } = await api.post('/clients', clientData);
    return data;
  },
  update: async (id, clientData) => {
    const { data } = await api.put(`/clients/${id}`, clientData);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/clients/${id}`);
    return data;
  },
};

export default clientService;
