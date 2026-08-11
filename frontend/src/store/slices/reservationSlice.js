import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reservationService from '../../services/reservationService';

export const fetchReservations = createAsyncThunk('reservations/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await reservationService.getAll();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reservations');
  }
});

export const createReservation = createAsyncThunk('reservations/create', async (data, { rejectWithValue }) => {
  try {
    return await reservationService.create(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create reservation');
  }
});

export const approveReservation = createAsyncThunk('reservations/approve', async (id, { rejectWithValue }) => {
  try {
    return await reservationService.approve(id);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to approve reservation');
  }
});

export const rejectReservation = createAsyncThunk('reservations/reject', async (id, { rejectWithValue }) => {
  try {
    return await reservationService.reject(id);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reject reservation');
  }
});

const reservationSlice = createSlice({
  name: 'reservations',
  initialState: { reservations: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchReservations.fulfilled, (state, action) => { state.loading = false; state.reservations = action.payload.reservations || action.payload.data || action.payload || []; })
      .addCase(fetchReservations.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createReservation.pending, (state) => { state.loading = true; })
      .addCase(createReservation.fulfilled, (state, action) => { state.loading = false; state.reservations.unshift(action.payload.reservation || action.payload.data || action.payload); })
      .addCase(createReservation.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(approveReservation.fulfilled, (state, action) => {
        const updated = action.payload.reservation || action.payload.data || action.payload;
        const idx = state.reservations.findIndex((r) => r._id === updated._id || r.id === updated.id);
        if (idx !== -1) state.reservations[idx] = updated;
      })
      .addCase(rejectReservation.fulfilled, (state, action) => {
        const updated = action.payload.reservation || action.payload.data || action.payload;
        const idx = state.reservations.findIndex((r) => r._id === updated._id || r.id === updated.id);
        if (idx !== -1) state.reservations[idx] = updated;
      });
  },
});

export const { clearError } = reservationSlice.actions;
export default reservationSlice.reducer;
