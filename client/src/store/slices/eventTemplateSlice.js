import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTemplates = createAsyncThunk(
  'eventTemplates/fetchTemplates',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/groups/${groupId}/event-templates`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTemplate = createAsyncThunk(
  'eventTemplates/createTemplate',
  async ({ groupId, template }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/groups/${groupId}/event-templates`, template);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'eventTemplates/updateTemplate',
  async ({ groupId, templateId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/api/groups/${groupId}/event-templates/${templateId}`,
        updates
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'eventTemplates/deleteTemplate',
  async ({ groupId, templateId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/groups/${groupId}/event-templates/${templateId}`);
      return { groupId, templateId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  templates: {},
  loading: false,
  error: null,
};

const eventTemplateSlice = createSlice({
  name: 'eventTemplates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates[action.meta.arg] = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        if (!state.templates[groupId]) {
          state.templates[groupId] = [];
        }
        state.templates[groupId].push(action.payload);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        const templates = state.templates[groupId];
        if (templates) {
          const index = templates.findIndex(t => t._id === action.payload._id);
          if (index !== -1) {
            templates[index] = action.payload;
          }
        }
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        const { groupId, templateId } = action.payload;
        const templates = state.templates[groupId];
        if (templates) {
          state.templates[groupId] = templates.filter(t => t._id !== templateId);
        }
      });
  },
});

export default eventTemplateSlice.reducer;
