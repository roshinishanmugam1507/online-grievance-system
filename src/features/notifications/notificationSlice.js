import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../../services/notificationApi';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const data = await notificationApi.getAll(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      const data = await notificationApi.markAsRead(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllNotificationsRead',
  async (userId, { rejectWithValue }) => {
    try {
      await notificationApi.markAllAsRead(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notifData, { rejectWithValue }) => {
    try {
      const data = await notificationApi.create(notifData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.items[index].read = true;
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state, action) => {
        const userId = action.payload;
        state.items.forEach((n) => {
          if (!userId || n.userId === userId) {
            n.read = true;
          }
        });
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  }
});

export const selectAllNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.items.filter((n) => !n.read).length;

export default notificationSlice.reducer;
