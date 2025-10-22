import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiFetch from '@/src/helpers/ApiFetch';
import SQLiteService from '@/src/database/SQLiteService';

const initialState = {
  loading: false,
  error: null,
  data: [],
};

export const getShift = createAsyncThunk(
  'shift/getShift',
  async () => {
    try {
      const response = await ApiFetch.get('/master/shift/list');
      const data = response.data.rows || response.data.data || [];
      
      // Sync to SQLite
      try {
        await SQLiteService.syncShift(data);
      } catch (dbError) {
      }
      
      await AsyncStorage.setItem('@shift', JSON.stringify(data));
      return data;
    } catch (error) {
      // Try SQLite first
      try {
        const dbData = await SQLiteService.getShift();
        if (dbData.length > 0) {
          return dbData;
        }
      } catch (dbError) {
      }
      
      const local = await AsyncStorage.getItem('@shift');
      if (local) return JSON.parse(local);
      return [];
    }
  }
);

const shiftSlice = createSlice({
  name: 'shift',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShift.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shift';
      });
  },
});

export const { clearError } = shiftSlice.actions;
export default shiftSlice.reducer;