import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { grievanceApi } from '../../services/grievanceApi';
import { feedbackApi } from '../../services/feedbackApi';
import { userApi } from '../../services/userApi';

// Tracking Thunks
export const fetchTrackingHistory = createAsyncThunk(
  'tracking/fetchTrackingHistory',
  async (grievanceId, { rejectWithValue }) => {
    try {
      const data = await grievanceApi.getTracking(grievanceId);
      return { grievanceId, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTrackingUpdate = createAsyncThunk(
  'tracking/addTrackingUpdate',
  async (trackingData, { rejectWithValue }) => {
    try {
      const data = await grievanceApi.addTracking(trackingData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const trackingSlice = createSlice({
  name: 'tracking',
  initialState: {
    historyByGrievance: {},
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackingHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTrackingHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.historyByGrievance[action.payload.grievanceId] = action.payload.data;
      })
      .addCase(addTrackingUpdate.fulfilled, (state, action) => {
        const gId = action.payload.grievanceId;
        if (!state.historyByGrievance[gId]) {
          state.historyByGrievance[gId] = [];
        }
        state.historyByGrievance[gId].push(action.payload);
      });
  }
});

// Feedback Thunks
export const fetchFeedback = createAsyncThunk(
  'feedback/fetchFeedback',
  async (params, { rejectWithValue }) => {
    try {
      const data = await feedbackApi.getAll(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'feedback/submitFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const data = await feedbackApi.create(feedbackData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedback.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  }
});

// Users Thunk
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userApi.getAll();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

// UI & Toast Slice
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    toasts: []
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    showToast: (state, action) => {
      // payload: { id, title, message, type: 'success'|'danger'|'info'|'warning', duration }
      const toast = {
        id: action.payload.id || Date.now().toString(36),
        title: action.payload.title || 'Notification',
        message: action.payload.message || '',
        type: action.payload.type || 'info',
        duration: action.payload.duration || 3500
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    }
  }
});

export const { toggleSidebar, setSidebarOpen, showToast, removeToast } = uiSlice.actions;
