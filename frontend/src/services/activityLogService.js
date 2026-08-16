import api from './api';

const unwrap = (res) => res.data?.data ?? res.data;

const activityLogService = {
  getAll: async (params) => api.get('/activity-logs', { params }).then(unwrap),
};

export default activityLogService;