import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiFetch from '@/src/helpers/ApiFetch';
import SQLiteService from '@/src/database/SQLiteService';

const initialState = {
  loading: false,
  error: null,
  data: [],
};

export const getPenyewa = createAsyncThunk(
  'penyewa/getPenyewa',
  async () => {
    try {
      const response = await ApiFetch.get('/master/penyewa/list');
      
      const data = response.data.rows || response.data.data || [];
      
      // Sync to SQLite
      try {
        await SQLiteService.syncPenyewa(data);
      } catch (dbError) {
      }
      
      // Save to AsyncStorage for offline mode (legacy)
      await AsyncStorage.setItem('@penyewa', JSON.stringify(data));
      
      return data;
    } catch (error) {
      
      // Try SQLite first
      try {
        const dbData = await SQLiteService.getPenyewa();
        if (dbData.length > 0) {
          return dbData;
        }
      } catch (dbError) {
      }
      
      // Fallback to AsyncStorage
      const local = await AsyncStorage.getItem('@penyewa');
      if (local) {
        return JSON.parse(local);
      }
      
      return [];
    }
  }
);

const penyewaSlice = createSlice({
  name: 'penyewa',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPenyewa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPenyewa.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getPenyewa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch penyewa';
      });
  },
});

export const { clearError } = penyewaSlice.actions;
export default penyewaSlice.reducer;