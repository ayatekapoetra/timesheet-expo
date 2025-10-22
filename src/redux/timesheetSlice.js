import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiFetch from '@/src/helpers/ApiFetch';

// Initial State
const initialState = {
  loading: false,
  error: null,
  data: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async Thunks
export const getTimesheets = createAsyncThunk(
  'timesheet/getTimesheets',
  async (params) => {
    try {
      const response = await ApiFetch.get('/operation/timesheet', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to fetch timesheets';
    }
  }
);

export const getTimesheetById = createAsyncThunk(
  'timesheet/getTimesheetById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ApiFetch.get(`/operation/timesheet/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch timesheet');
    }
  }
);

export const deleteTimesheet = createAsyncThunk(
  'timesheet/deleteTimesheet',
  async (id) => {
    try {
      await ApiFetch.delete(`/operation/timesheet/${id}`);
      return id;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to delete timesheet';
    }
  }
);

// Slice
const timesheetSlice = createSlice({
  name: 'timesheet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Get Timesheets
    builder
      .addCase(getTimesheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        // Handle API response structure: { rows: { data: [...] } }
        const payload = action.payload;
        const responseData = payload.rows?.data || payload.rows || payload.data || payload || [];
        state.data = Array.isArray(responseData) ? responseData : [];
        state.pagination = {
          ...state.pagination,
          total: payload.rows?.count || payload.count || payload.total || state.data.length,
        };
      })
      .addCase(getTimesheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch timesheets';
      });

    // Get Timesheet by ID
    builder
      .addCase(getTimesheetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimesheetById.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific item in the data array if it exists
        if (state.data) {
          const index = state.data.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.data[index] = action.payload;
          }
        }
      })
      .addCase(getTimesheetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch timesheet';
      });

    // Delete Timesheet
    builder
      .addCase(deleteTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        if (state.data) {
          state.data = state.data.filter(item => item.id !== action.payload);
        }
      })
      .addCase(deleteTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete timesheet';
      });
  },
});

export const {
  clearError,
  setPagination,
  resetState,
} = timesheetSlice.actions;

export default timesheetSlice.reducer;