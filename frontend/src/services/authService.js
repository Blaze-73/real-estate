import api from './api';

const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
  updateProfile: async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};

export default authService;
