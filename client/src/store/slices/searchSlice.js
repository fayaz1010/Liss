import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const searchAll = createAsyncThunk(
  'search/searchAll',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  results: {
    groups: [],
    lists: [],
    items: [],
    users: [],
  },
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.results = initialState.results;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchAll.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
