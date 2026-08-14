import api from './api';

const unwrap = (res) => res.data?.data ?? res.data;

const wishlistService = {
  getAll: async () => api.get('/wishlist').then(unwrap),
  toggle: async (slug) => api.post(`/wishlist/${slug}`).then((r) => r.data),
  remove: async (slug) => api.delete(`/wishlist/${slug}`).then((r) => r.data),
};

export default wishlistService;