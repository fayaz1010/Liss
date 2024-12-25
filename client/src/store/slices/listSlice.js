import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchLists = createAsyncThunk(
  'lists/fetchLists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/lists');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createList = createAsyncThunk(
  'lists/createList',
  async (listData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/lists', listData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ listId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/lists/${listId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (listId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/lists/${listId}`);
      return listId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createItem = createAsyncThunk(
  'lists/createItem',
  async ({ listId, itemData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/lists/${listId}/items`, itemData);
      return { listId, item: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateItemProgress = createAsyncThunk(
  'lists/updateItemProgress',
  async ({ listId, itemId, progress }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/lists/${listId}/items/${itemId}/progress`, {
        progress,
      });
      return { listId, itemId, progress, progressHistory: response.data.progressHistory };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const assignItem = createAsyncThunk(
  'lists/assignItem',
  async ({ listId, itemId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/lists/${listId}/items/${itemId}/assign`, {
        userId,
      });
      return { listId, itemId, assignee: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  lists: [],
  items: {},
  loading: false,
  error: null,
};

const listSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    updateProgress: (state, action) => {
      const { listId, itemId, progress } = action.payload;
      const list = state.lists.find(l => l._id === listId);
      if (list) {
        const item = list.items.find(i => i._id === itemId);
        if (item) {
          item.progress = progress;
        }
      }
    },
    addProgressHistory: (state, action) => {
      const { listId, itemId, entry } = action.payload;
      const list = state.lists.find(l => l._id === listId);
      if (list) {
        const item = list.items.find(i => i._id === itemId);
        if (item) {
          if (!item.progressHistory) {
            item.progressHistory = [];
          }
          item.progressHistory.unshift(entry);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
        // Organize items by list ID for easier access
        state.items = action.payload.reduce((acc, list) => {
          acc[list._id] = list.items;
          return acc;
        }, {});
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
        state.items[action.payload._id] = action.payload.items;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        const index = state.lists.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.lists[index] = action.payload;
          state.items[action.payload._id] = action.payload.items;
        }
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter(l => l._id !== action.payload);
        delete state.items[action.payload];
      })
      .addCase(createItem.fulfilled, (state, action) => {
        const { listId, item } = action.payload;
        const list = state.lists.find(l => l._id === listId);
        if (list) {
          list.items.push(item);
          state.items[listId].push(item);
        }
      })
      .addCase(updateItemProgress.fulfilled, (state, action) => {
        const { listId, itemId, progress, progressHistory } = action.payload;
        const list = state.lists.find(l => l._id === listId);
        if (list) {
          const item = list.items.find(i => i._id === itemId);
          if (item) {
            item.progress = progress;
            item.progressHistory = progressHistory;
          }
        }
        const items = state.items[listId];
        if (items) {
          const item = items.find(i => i._id === itemId);
          if (item) {
            item.progress = progress;
            item.progressHistory = progressHistory;
          }
        }
      })
      .addCase(assignItem.fulfilled, (state, action) => {
        const { listId, itemId, assignee } = action.payload;
        const list = state.lists.find(l => l._id === listId);
        if (list) {
          const item = list.items.find(i => i._id === itemId);
          if (item) {
            item.assignees.push(assignee);
          }
        }
        const items = state.items[listId];
        if (items) {
          const item = items.find(i => i._id === itemId);
          if (item) {
            item.assignees.push(assignee);
          }
        }
      });
  },
});

export const { updateProgress, addProgressHistory } = listSlice.actions;
export default listSlice.reducer;
