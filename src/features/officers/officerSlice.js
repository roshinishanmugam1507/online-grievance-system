import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { officerApi } from '../../services/officerApi';

export const fetchOfficers = createAsyncThunk(
  'officers/fetchOfficers',
  async (params, { rejectWithValue }) => {
    try {
      const data = await officerApi.getAll(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addOfficer = createAsyncThunk(
  'officers/addOfficer',
  async (officerData, { rejectWithValue }) => {
    try {
      const data = await officerApi.create(officerData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOfficer = createAsyncThunk(
  'officers/updateOfficer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updated = await officerApi.update(id, data);
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const officerSlice = createSlice({
  name: 'officers',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOfficers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOfficers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOfficers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addOfficer.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateOfficer.fulfilled, (state, action) => {
        const index = state.items.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const selectAllOfficers = (state) => state.officers.items;
export const selectOfficerStatus = (state) => state.officers.status;

export default officerSlice.reducer;
