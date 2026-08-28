import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { grievanceApi } from '../../services/grievanceApi';

export const fetchGrievances = createAsyncThunk(
  'grievances/fetchGrievances',
  async (params, { rejectWithValue }) => {
    try {
      const data = await grievanceApi.getAll(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGrievanceById = createAsyncThunk(
  'grievances/fetchGrievanceById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await grievanceApi.getById(id);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitGrievance = createAsyncThunk(
  'grievances/submitGrievance',
  async (grievanceData, { rejectWithValue }) => {
    try {
      const data = await grievanceApi.create(grievanceData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGrievance = createAsyncThunk(
  'grievances/updateGrievance',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updated = await grievanceApi.update(id, data);
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGrievanceStatus = createAsyncThunk(
  'grievances/updateGrievanceStatus',
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const updated = await grievanceApi.updateStatus(id, statusData);
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const withdrawGrievance = createAsyncThunk(
  'grievances/withdrawGrievance',
  async ({ id, reason, citizenName }, { rejectWithValue }) => {
    try {
      const updated = await grievanceApi.update(id, {
        status: 'Withdrawn',
        resolutionDetails: `Citizen withdrawn: ${reason}`
      });

      // Add tracking entry
      await grievanceApi.addTracking({
        grievanceId: id,
        status: 'Withdrawn',
        message: `Grievance withdrawn by citizen. Reason: ${reason}`,
        updatedBy: citizenName || 'Citizen',
        updatedByRole: 'citizen'
      });

      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  currentGrievance: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedGrievanceId: null
};

const grievanceSlice = createSlice({
  name: 'grievances',
  initialState,
  reducers: {
    setCurrentGrievance: (state, action) => {
      state.currentGrievance = action.payload;
    },
    clearGrievanceError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchGrievances
      .addCase(fetchGrievances.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGrievances.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGrievances.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // fetchGrievanceById
      .addCase(fetchGrievanceById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGrievanceById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentGrievance = action.payload;
      })
      .addCase(fetchGrievanceById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // submitGrievance
      .addCase(submitGrievance.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.currentGrievance = action.payload;
      })
      // updateGrievance
      .addCase(updateGrievance.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (g) => g.id === action.payload.id || g.complaintId === action.payload.complaintId
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentGrievance?.id === action.payload.id) {
          state.currentGrievance = action.payload;
        }
      })
      // updateGrievanceStatus
      .addCase(updateGrievanceStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentGrievance?.id === action.payload.id) {
          state.currentGrievance = action.payload;
        }
      })
      // withdrawGrievance
      .addCase(withdrawGrievance.fulfilled, (state, action) => {
        const index = state.items.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentGrievance?.id === action.payload.id) {
          state.currentGrievance = action.payload;
        }
      });
  }
});

export const { setCurrentGrievance, clearGrievanceError } = grievanceSlice.actions;

export const selectAllGrievances = (state) => state.grievances.items;
export const selectCurrentGrievance = (state) => state.grievances.currentGrievance;
export const selectGrievanceStatus = (state) => state.grievances.status;
export const selectGrievanceError = (state) => state.grievances.error;

export default grievanceSlice.reducer;
