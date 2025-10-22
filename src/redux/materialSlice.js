import SQLiteService from '@/src/database/SQLiteService';
import ApiFetch from '@/src/helpers/ApiFetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Device from 'expo-device';

const initialState = {
  loading: false,
  error: null,
  data: [],
};

// Helper function to ensure authentication
const ensureAuth = async () => {
  try {
    // Check if token exists
    let token = await AsyncStorage.getItem('@token');
    
    if (!token) {
      
      // Auto-login with provided credentials
      const uuid = Device.osInternalBuildId || 'test-device';
      const loginResponse = await ApiFetch.post('/auth/login-oprdrv', {
        username: '12izal',
        password: 'mrt123',
        uuid,
      });
      
      if (loginResponse?.data?.data?.token) {
        token = loginResponse.data.data.token;
        await AsyncStorage.setItem('@token', token);
      } else {
        throw new Error('Auto-login failed');
      }
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Get material from API and sync to SQLite
export const getMaterial = createAsyncThunk(
  'material/getMaterial',
  async () => {
    try {
      await ensureAuth();
      
      // Fetch from API - use correct endpoint
      const response = await ApiFetch.get('/master/material-ritase/list');
      
      const apiData = response.data.rows || response.data.data || response.data || [];
      
      // Sync to SQLite for offline usage
      if (apiData.length > 0) {
        try {
          await SQLiteService.syncMaterial(apiData);
        } catch (syncErr) {
        }
        try { await AsyncStorage.setItem('@material', JSON.stringify(apiData)); } catch (_e) {}
        return apiData;
      }
      
      // If API data is empty, try SQLite
      const dbData = await SQLiteService.getMaterial();
      
      return dbData;
    } catch (error) {
      
      // Fallback to SQLite then AsyncStorage
      try {
        const dbData = await SQLiteService.getMaterial();
        if (dbData.length > 0) return dbData;
      } catch (dbError) {
      }
      try {
        const local = await AsyncStorage.getItem('@material');
        if (local) return JSON.parse(local);
      } catch (_e) {}
      
      
      // Return mock data for testing (matching API structure)
      return [
          { id: 7, abbr: 'SAPROLITE', nama: 'Saprolit Basah', coefisien: 3, aktif: 'Y', kategori: 'produksi' },
          { id: 8, abbr: 'SAPROLITE', nama: 'Saprolit Kering', coefisien: 2.5, aktif: 'Y', kategori: 'produksi' },
          { id: 9, abbr: 'LIMONITE', nama: 'Limonit Basah', coefisien: 4, aktif: 'Y', kategori: 'non produksi' },
          { id: 10, abbr: 'LIMONITE', nama: 'Limonit Kering', coefisien: 3.5, aktif: 'Y', kategori: 'non produksi' },
          { id: 11, abbr: 'OB', nama: 'Overburden', coefisien: 2, aktif: 'Y', kategori: 'produksi' },
          { id: 12, abbr: 'QUARRY', nama: 'Quarry', coefisien: 3, aktif: 'Y', kategori: 'produksi' }
        ];
      }
    }
  );

// Get material only from SQLite (offline)
export const getMaterialOffline = createAsyncThunk(
  'material/getMaterialOffline',
  async () => {
    try {
      const dbData = await SQLiteService.getMaterial();
      return dbData;
    } catch (error) {
      return [];
    }
  }
);

// Create or update material
export const createOrUpdateMaterial = createAsyncThunk(
  'material/createOrUpdateMaterial',
  async (data) => {
    try {
      const result = await SQLiteService.upsert('materials', data);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to save material');
    }
  }
);

const materialSlice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add local reducers for real-time updates
    addMaterial: (state, action) => {
      state.data.push(action.payload);
    },
    updateMaterial: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.data.findIndex(item => item.id === id);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updates };
      }
    },
    removeMaterial: (state, action) => {
      const id = action.payload;
      state.data = state.data.filter(item => item.id !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      // getMaterial
      .addCase(getMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch material';
      })
      // getMaterialOffline
      .addCase(getMaterialOffline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterialOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getMaterialOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get material from database';
      })
      // createOrUpdateMaterial
      .addCase(createOrUpdateMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateMaterial.fulfilled, (state, action) => {
        state.loading = false;
        // Update or add in local state
        const index = state.data.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        } else {
          state.data.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createOrUpdateMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save material';
      });
  },
});

export const { 
  clearError, 
  addMaterial, 
  updateMaterial, 
  removeMaterial 
} = materialSlice.actions;

export default materialSlice.reducer;