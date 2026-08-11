import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import reservationReducer from './slices/reservationSlice';
import clientReducer from './slices/clientSlice';
import dashboardReducer from './slices/dashboardSlice';
import notificationReducer from './slices/notificationSlice';
import settingReducer from './slices/settingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    reservations: reservationReducer,
    clients: clientReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
    settings: settingReducer,
  },
});

export default store;
