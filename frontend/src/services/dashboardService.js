import api from './api';

const dashboardService = {
  getStats: async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
  },
  getRevenue: async () => {
    const { data } = await api.get('/dashboard/revenue');
    return data;
  },
  getRentalStats: async () => {
    const { data } = await api.get('/dashboard/rental-stats');
    return data;
  },
};

export default dashboardService;
