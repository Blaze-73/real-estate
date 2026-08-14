import api from './api';

const unwrap = (res) => res.data?.data ?? res.data;

export const fetchPropertyReviews = (slug) =>
  api.get(`/public/properties/${slug}/reviews`).then(unwrap);

export const submitPropertyReview = (slug, payload) =>
  api.post(`/public/properties/${slug}/reviews`, payload).then(unwrap);

export const fetchAdminReviews = (params = {}) =>
  api.get('/reviews', { params }).then(unwrap);

export const approveReview = (id) =>
  api.put(`/reviews/${id}/approve`).then(unwrap);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`).then(unwrap);