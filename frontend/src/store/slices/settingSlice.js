import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import settingService from '../../services/settingService';

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    return await settingService.getAll();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch settings');
  }
});

export const updateSettings = createAsyncThunk('settings/update', async (data, { rejectWithValue }) => {
  try {
    return await settingService.update(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update settings');
  }
});

const settingSlice = createSlice({
  name: 'settings',
  initialState: { settings: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.loading = true; })
      .addCase(fetchSettings.fulfilled, (state, action) => { state.loading = false; state.settings = action.payload.settings || action.payload.data || action.payload; })
      .addCase(fetchSettings.rejected, (state) => { state.loading = false; })
      .addCase(updateSettings.pending, (state) => { state.loading = true; })
      .addCase(updateSettings.fulfilled, (state, action) => { state.loading = false; state.settings = action.payload.settings || action.payload.data || action.payload; })
      .addCase(updateSettings.rejected, (state) => { state.loading = false; });
  },
});

export default settingSlice.reducer;
