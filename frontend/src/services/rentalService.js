import api from './api';

const unwrap = (res) => res.data?.data ?? res.data;

const rentalService = {
  getActive: async () => api.get('/rentals/active').then(unwrap),
  getUpcoming: async () => api.get('/rentals/upcoming').then(unwrap),
  getExpired: async () => api.get('/rentals/expired').then(unwrap),
  create: async (payload) => api.post('/rentals', payload).then(unwrap),
  remove: async (id) => api.delete(`/rentals/${id}`).then(unwrap),
};

export default rentalService;