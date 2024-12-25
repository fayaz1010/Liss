import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchGroupMessages = createAsyncThunk(
  'chat/fetchGroupMessages',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/groups/${groupId}/messages`);
      return { groupId, messages: response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ groupId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/groups/${groupId}/messages`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  messages: {},
  activeGroupId: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveGroup: (state, action) => {
      state.activeGroupId = action.payload;
    },
    addMessage: (state, action) => {
      const { groupId, message } = action.payload;
      if (!state.messages[groupId]) {
        state.messages[groupId] = [];
      }
      state.messages[groupId].push(message);
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.groupId] = action.payload.messages;
      })
      .addCase(fetchGroupMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const groupId = action.payload.groupId;
        if (!state.messages[groupId]) {
          state.messages[groupId] = [];
        }
        state.messages[groupId].push(action.payload);
      });
  },
});

export const { setActiveGroup, addMessage, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
