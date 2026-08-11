import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import clientService from '../../services/clientService';

export const fetchClients = createAsyncThunk('clients/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await clientService.getAll();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch clients');
  }
});

export const createClient = createAsyncThunk('clients/create', async (data, { rejectWithValue }) => {
  try {
    return await clientService.create(data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create client');
  }
});

export const updateClient = createAsyncThunk('clients/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await clientService.update(id, data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update client');
  }
});

export const deleteClient = createAsyncThunk('clients/delete', async (id, { rejectWithValue }) => {
  try {
    await clientService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete client');
  }
});

const clientSlice = createSlice({
  name: 'clients',
  initialState: { clients: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClients.fulfilled, (state, action) => { state.loading = false; state.clients = action.payload.clients || action.payload.data || action.payload || []; })
      .addCase(fetchClients.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createClient.pending, (state) => { state.loading = true; })
      .addCase(createClient.fulfilled, (state, action) => { state.loading = false; state.clients.unshift(action.payload.client || action.payload.data || action.payload); })
      .addCase(createClient.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateClient.pending, (state) => { state.loading = true; })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.client || action.payload.data || action.payload;
        const idx = state.clients.findIndex((c) => c._id === updated._id || c.id === updated.id);
        if (idx !== -1) state.clients[idx] = updated;
      })
      .addCase(updateClient.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteClient.pending, (state) => { state.loading = true; })
      .addCase(deleteClient.fulfilled, (state, action) => { state.loading = false; state.clients = state.clients.filter((c) => c._id !== action.payload && c.id !== action.payload); })
      .addCase(deleteClient.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearError } = clientSlice.actions;
export default clientSlice.reducer;
