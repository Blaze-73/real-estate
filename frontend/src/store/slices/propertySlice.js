import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import propertyService from '../../services/propertyService';

export const fetchProperties = createAsyncThunk('properties/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await propertyService.getAll(params);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch properties');
  }
});

export const fetchProperty = createAsyncThunk('properties/fetchOne', async (slug, { rejectWithValue }) => {
  try {
    return await propertyService.getOne(slug);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch property');
  }
});

export const fetchFeatured = createAsyncThunk('properties/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    return await propertyService.getFeatured();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured properties');
  }
});

export const createProperty = createAsyncThunk('properties/create', async (propertyData, { rejectWithValue }) => {
  try {
    return await propertyService.create(propertyData);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create property');
  }
});

export const updateProperty = createAsyncThunk('properties/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await propertyService.update(id, data);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update property');
  }
});

export const deleteProperty = createAsyncThunk('properties/delete', async (id, { rejectWithValue }) => {
  try {
    await propertyService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete property');
  }
});

const propertySlice = createSlice({
  name: 'properties',
  initialState: {
    properties: [],
    property: null,
    similar: [],
    featured: [],
    loading: false,
    error: null,
    pagination: { page: 1, pages: 1, total: 0 },
  },
  reducers: {
    clearProperty: (state) => { state.property = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties || action.payload.data || [];
        state.pagination = action.payload.pagination || { page: 1, pages: 1, total: 0 };
      })
      .addCase(fetchProperties.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProperty.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload.property || action.payload.data || action.payload;
        state.similar = action.payload.similar || [];
      })
      .addCase(fetchProperty.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeatured.pending, (state) => { state.loading = true; })
      .addCase(fetchFeatured.fulfilled, (state, action) => { state.loading = false; state.featured = action.payload.properties || action.payload.data || action.payload || []; })
      .addCase(fetchFeatured.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createProperty.pending, (state) => { state.loading = true; })
      .addCase(createProperty.fulfilled, (state, action) => { state.loading = false; state.properties.unshift(action.payload.property || action.payload.data || action.payload); })
      .addCase(createProperty.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateProperty.pending, (state) => { state.loading = true; })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.property || action.payload.data || action.payload;
        const idx = state.properties.findIndex((p) => p._id === updated._id || p.id === updated.id);
        if (idx !== -1) state.properties[idx] = updated;
        if (state.property?._id === updated._id || state.property?.id === updated.id) state.property = updated;
      })
      .addCase(updateProperty.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteProperty.pending, (state) => { state.loading = true; })
      .addCase(deleteProperty.fulfilled, (state, action) => { state.loading = false; state.properties = state.properties.filter((p) => p._id !== action.payload && p.id !== action.payload); })
      .addCase(deleteProperty.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearProperty, clearError } = propertySlice.actions;
export default propertySlice.reducer;
