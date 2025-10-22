import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Default filter values based on auth.employee
  karyawan_id: null, // Will be set from auth.employee.id
  site_id: null, // Will be set from auth.employee.cabang_id
  
  // Manual filter options
  penyewa_id: '',
  mainact: '', // barging, rental, mining
  status: '', // draft, submitted, approved, rejected
  equipment_id: '',
  
  // Date filters
  startdate: '', // Will default to start of current month
  enddate: '', // Will default to today
  
  // Additional filters
  shift_id: '',
  
  // UI state
  isFilterActive: false,
  filterCount: 0,
};

const timesheetFilterSlice = createSlice({
  name: 'timesheetFilter',
  initialState,
  reducers: {
    // Set default values from auth
    setDefaultFilter: (state, action) => {
      const { employee } = action.payload;
      state.karyawan_id = employee?.id || null;
      state.site_id = employee?.cabang?.id || null;
      
      // Set default dates
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      state.startdate = startOfMonth.toISOString().split('T')[0];
      state.enddate = today.toISOString().split('T')[0];
    },
    
    // Update individual filter values
    updateFilter: (state, action) => {
      const { field, value } = action.payload;
      state[field] = value;
      
      // Update filter count
      state.filterCount = calculateFilterCount(state);
      state.isFilterActive = state.filterCount > 0;
    },
    
    // Update multiple filters at once
    updateMultipleFilters: (state, action) => {
      const filters = action.payload;
      Object.keys(filters).forEach(key => {
        if (key in state) {
          state[key] = filters[key];
        }
      });
      
      // Update filter count
      state.filterCount = calculateFilterCount(state);
      state.isFilterActive = state.filterCount > 0;
    },
    
    // Clear all filters (except defaults)
    clearFilters: (state) => {
      const keepDefaults = {
        karyawan_id: state.karyawan_id,
        site_id: state.site_id,
        startdate: state.startdate,
        enddate: state.enddate,
      };
      
      return {
        ...initialState,
        ...keepDefaults,
        filterCount: 0,
        isFilterActive: false,
      };
    },
    
    // Reset to initial state
    resetFilter: () => initialState,
  },
});

// Helper function to calculate active filter count
const calculateFilterCount = (state) => {
  let count = 0;
  
  // Count non-default filters
  if (state.penyewa_id) count++;
  if (state.mainact) count++;
  if (state.status) count++;
  if (state.equipment_id) count++;
  if (state.shift_id) count++;
  
  return count;
};

export const {
  setDefaultFilter,
  updateFilter,
  updateMultipleFilters,
  clearFilters,
  resetFilter,
} = timesheetFilterSlice.actions;

export default timesheetFilterSlice.reducer;