import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import grievanceReducer from '../features/grievances/grievanceSlice';
import departmentReducer from '../features/departments/departmentSlice';
import officerReducer from '../features/officers/officerSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import {
  trackingSlice,
  feedbackSlice,
  userSlice,
  uiSlice
} from '../features/tracking/trackingAndMiscSlices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    grievances: grievanceReducer,
    departments: departmentReducer,
    officers: officerReducer,
    notifications: notificationReducer,
    tracking: trackingSlice.reducer,
    feedback: feedbackSlice.reducer,
    users: userSlice.reducer,
    ui: uiSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
