import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentApi } from '../../services/departmentApi';

export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const data = await departmentApi.getAll();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addDepartment = createAsyncThunk(
  'departments/addDepartment',
  async (deptData, { rejectWithValue }) => {
    try {
      const data = await departmentApi.create(deptData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updated = await departmentApi.update(id, data);
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const departmentSlice = createSlice({
  name: 'departments',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const index = state.items.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const selectAllDepartments = (state) => state.departments.items;
export const selectDepartmentStatus = (state) => state.departments.status;

export default departmentSlice.reducer;
