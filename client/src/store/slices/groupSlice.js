import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/groups');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/groups', groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, groupData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/groups/${groupId}`);
      return groupId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addGroupMember = createAsyncThunk(
  'groups/addMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/groups/${groupId}/members`, { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
  posts: {},
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    addPost: (state, action) => {
      const { groupId, post } = action.payload;
      if (!state.posts[groupId]) {
        state.posts[groupId] = [];
      }
      state.posts[groupId].push(post);
    },
    updatePost: (state, action) => {
      const { groupId, postId, updates } = action.payload;
      const posts = state.posts[groupId];
      if (posts) {
        const postIndex = posts.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          posts[postIndex] = { ...posts[postIndex], ...updates };
        }
      }
    },
    removePost: (state, action) => {
      const { groupId, postId } = action.payload;
      const posts = state.posts[groupId];
      if (posts) {
        state.posts[groupId] = posts.filter(post => post.id !== postId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Update group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex(group => group._id === action.payload._id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup?._id === action.payload._id) {
          state.currentGroup = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Delete group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
        delete state.posts[action.payload];
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Add member
      .addCase(addGroupMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGroupMember.fulfilled, (state, action) => {
        state.loading = false;
        const group = state.groups.find(g => g._id === action.payload._id);
        if (group) {
          group.members = action.payload.members;
        }
        if (state.currentGroup?._id === action.payload._id) {
          state.currentGroup.members = action.payload.members;
        }
      })
      .addCase(addGroupMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearGroupError, setCurrentGroup, addPost, updatePost, removePost } = groupSlice.actions;
export default groupSlice.reducer;
