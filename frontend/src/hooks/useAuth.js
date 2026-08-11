import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, loadUser, updateProfile, clearError } from '../store/slices/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login: (credentials) => dispatch(login(credentials)),
    register: (userData) => dispatch(register(userData)),
    logout: () => dispatch(logout()),
    loadUser: () => dispatch(loadUser()),
    updateProfile: (userData) => dispatch(updateProfile(userData)),
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth;
