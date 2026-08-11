import api from './api';

const notificationService = {
  getAll: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },
  markAsRead: async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },
};

export default notificationService;
