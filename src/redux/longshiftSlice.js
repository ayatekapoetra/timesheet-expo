import SQLiteService from '@/src/database/SQLiteService';
import ApiFetch from '@/src/helpers/ApiFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  data: [],
};

export const getLongshift = createAsyncThunk(
  'longshift/getLongshift',
  async () => {
    try {
      const response = await ApiFetch.get('/master/longshift/list');
      const data = response.data.rows || response.data.data || [];
      
      // Sync to SQLite (create table if needed)
      try {
        // Create longshifts table if not exists
        await SQLiteService.db.execAsync(`
          CREATE TABLE IF NOT EXISTS longshifts (
            id TEXT PRIMARY KEY,
            nama TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s', 'now')),
            updated_at INTEGER DEFAULT (strftime('%s', 'now'))
          )
        `);
        
        // Sync data
        const batch = [];
        for (const item of data) {
          batch.push(SQLiteService.upsert('longshifts', {
            id: item.id.toString(),
            nama: item.nama
          }));
        }
        await Promise.all(batch);
      } catch (dbError) {
      }
      
      await AsyncStorage.setItem('@longshift', JSON.stringify(data));
      return data;
    } catch (error) {
      // Try SQLite first
      try {
        const dbData = await SQLiteService.getAll('longshifts');
        if (dbData.length > 0) {
          return dbData;
        }
      } catch (dbError) {
      }
      
      const local = await AsyncStorage.getItem('@longshift');
      if (local) return JSON.parse(local);
      return [];
    }
  }
);

const longshiftSlice = createSlice({
  name: 'longshift',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLongshift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLongshift.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getLongshift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch longshift';
      });
  },
});

export const { clearError } = longshiftSlice.actions;
export default longshiftSlice.reducer;