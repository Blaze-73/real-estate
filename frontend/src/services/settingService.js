import api from './api';

const settingService = {
  getAll: async () => {
    const { data } = await api.get('/public/settings');
    return data;
  },
  update: async (settingsData) => {
    const { data } = await api.put('/settings', settingsData);
    return data;
  },
};

export default settingService;
