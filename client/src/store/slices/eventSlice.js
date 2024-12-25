import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchGroupEvents = createAsyncThunk(
  'events/fetchGroupEvents',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/groups/${groupId}/events`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/groups/${eventData.groupId}/events`, eventData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ groupId, eventId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/groups/${groupId}/events/${eventId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async ({ groupId, eventId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/groups/${groupId}/events/${eventId}`);
      return { groupId, eventId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const respondToEvent = createAsyncThunk(
  'events/respondToEvent',
  async ({ groupId, eventId, response }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/groups/${groupId}/events/${eventId}/respond`, { response });
      return { groupId, eventId, response: res.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  events: {},
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEventResponse: (state, action) => {
      const { groupId, eventId, response } = action.payload;
      const event = state.events[groupId]?.find(e => e._id === eventId);
      if (event) {
        const responseIndex = event.responses.findIndex(r => r.user._id === response.user._id);
        if (responseIndex !== -1) {
          event.responses[responseIndex] = response;
        } else {
          event.responses.push(response);
        }
      }
    },
    updateEventInRealTime: (state, action) => {
      const { groupId, event } = action.payload;
      const events = state.events[groupId];
      if (events) {
        const index = events.findIndex(e => e._id === event._id);
        if (index !== -1) {
          events[index] = event;
        } else {
          events.push(event);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events[action.meta.arg] = action.payload;
      })
      .addCase(fetchGroupEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        if (!state.events[groupId]) {
          state.events[groupId] = [];
        }
        state.events[groupId].push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        const events = state.events[groupId];
        if (events) {
          const index = events.findIndex(e => e._id === action.payload._id);
          if (index !== -1) {
            events[index] = action.payload;
          }
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        const { groupId, eventId } = action.payload;
        const events = state.events[groupId];
        if (events) {
          state.events[groupId] = events.filter(e => e._id !== eventId);
        }
      })
      .addCase(respondToEvent.fulfilled, (state, action) => {
        const { groupId, eventId, response } = action.payload;
        const event = state.events[groupId]?.find(e => e._id === eventId);
        if (event) {
          const responseIndex = event.responses.findIndex(r => r.user._id === response.user._id);
          if (responseIndex !== -1) {
            event.responses[responseIndex] = response;
          } else {
            event.responses.push(response);
          }
        }
      });
  },
});

export const { addEventResponse, updateEventInRealTime } = eventSlice.actions;
export default eventSlice.reducer;
