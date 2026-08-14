import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistService from '../../services/wishlistService';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    return await wishlistService.getAll();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load wishlist');
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (slug, { rejectWithValue }) => {
  try {
    return await wishlistService.toggle(slug);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    slugs: [],
    loading: false,
    loaded: false,
  },
  reducers: {
    resetWishlist: (state) => {
      state.slugs = [];
      state.loaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.slugs = (action.payload || []).map((p) => p.slug).filter(Boolean);
      })
      .addCase(fetchWishlist.rejected, (state) => { state.loading = false; })
      .addCase(toggleWishlist.pending, (state, action) => {
        const slug = action.meta.arg;
        state.slugs = state.slugs.includes(slug)
          ? state.slugs.filter((s) => s !== slug)
          : [...state.slugs, slug];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const slug = action.meta.arg;
        if (action.payload?.saved) {
          if (!state.slugs.includes(slug)) state.slugs.push(slug);
        } else {
          state.slugs = state.slugs.filter((s) => s !== slug);
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        const slug = action.meta.arg;
        state.slugs = state.slugs.includes(slug)
          ? state.slugs.filter((s) => s !== slug)
          : [...state.slugs, slug];
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;