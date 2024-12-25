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
      .addCase(updateGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(group => group._id === action.payload._id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup?._id === action.payload._id) {
          state.currentGroup = action.payload;
        }
      })
      // Delete group
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(group => group._id !== action.payload);
        if (state.currentGroup?._id === action.payload) {
          state.currentGroup = null;
        }
      })
      // Add member
      .addCase(addGroupMember.fulfilled, (state, action) => {
        const group = state.groups.find(g => g._id === action.payload._id);
        if (group) {
          group.members = action.payload.members;
        }
        if (state.currentGroup?._id === action.payload._id) {
          state.currentGroup.members = action.payload.members;
        }
      });
  },
});

export const { clearGroupError, setCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;
