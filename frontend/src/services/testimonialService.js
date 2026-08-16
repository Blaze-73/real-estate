import api from './api';

const unwrap = (res) => res.data?.data ?? res.data;

const testimonialService = {
  getAll: async () => api.get('/public/testimonials', { params: { active_only: true } }).then(unwrap),
  listAdmin: async (params) => api.get('/testimonials', { params }).then(unwrap),
  create: async (payload) => api.post('/testimonials', payload).then(unwrap),
  update: async (id, payload) => api.put(`/testimonials/${id}`, payload).then(unwrap),
  remove: async (id) => api.delete(`/testimonials/${id}`).then(unwrap),
};

export default testimonialService;