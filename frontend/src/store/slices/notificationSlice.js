import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await notificationService.getAll();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    return await notificationService.markAsRead(id);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark notification');
  }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    return await notificationService.markAllAsRead();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unreadCount: 0, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload.notifications || action.payload.data || action.payload || [];
        state.notifications = data;
        state.unreadCount = data.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const updated = action.payload.notification || action.payload.data || action.payload;
        const idx = state.notifications.findIndex((n) => n._id === updated._id || n.id === updated.id);
        if (idx !== -1) state.notifications[idx] = { ...state.notifications[idx], read: true };
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
