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
  checkout: async (bookingReference) => {
    const { data } = await api.post('/public/payments/checkout', { booking_reference: bookingReference });
    return data;
  },
  preview: async (token) => {
    const { data } = await api.post('/public/payments/preview', { token });
    return data;
  },
  callback: async (payload) => {
    const { data } = await api.post('/public/payments/callback', payload);
    return data;
  },
};

export default paymentService;