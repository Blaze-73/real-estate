import api from './api';

const reservationService = {
  getAll: async () => {
    const { data } = await api.get('/reservations');
    return data;
  },
  create: async (reservationData) => {
    const { data } = await api.post('/reservations', reservationData);
    return data;
  },
  approve: async (id) => {
    const { data } = await api.put(`/reservations/${id}/approve`);
    return data;
  },
  reject: async (id) => {
    const { data } = await api.put(`/reservations/${id}/reject`);
    return data;
  },
};

export default reservationService;
