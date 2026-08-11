import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async (_, { rejectWithValue }) => {
  try {
    return await dashboardService.getStats();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchRevenueData = createAsyncThunk('dashboard/fetchRevenue', async (_, { rejectWithValue }) => {
  try {
    return await dashboardService.getRevenue();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch revenue');
  }
});

export const fetchRentalStats = createAsyncThunk('dashboard/fetchRentalStats', async (_, { rejectWithValue }) => {
  try {
    return await dashboardService.getRentalStats();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch rental stats');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null, revenueData: [], rentalStats: null, loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload.stats || action.payload.data || action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchRevenueData.pending, (state) => { state.loading = true; })
      .addCase(fetchRevenueData.fulfilled, (state, action) => { state.loading = false; state.revenueData = action.payload.revenue || action.payload.data || action.payload || []; })
      .addCase(fetchRevenueData.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchRentalStats.pending, (state) => { state.loading = true; })
      .addCase(fetchRentalStats.fulfilled, (state, action) => { state.loading = false; state.rentalStats = action.payload.stats || action.payload.data || action.payload; })
      .addCase(fetchRentalStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
