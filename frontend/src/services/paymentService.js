import api from './api';

const paymentService = {
  getAll: async (params) => {
    const { data } = await api.get('/payments', { params });
    return data;
  },
  markPaid: async (id) => {
    const { data } = await api.put(`/payments/${id}/mark-paid`);
    return data;
  },
};

export default paymentService;