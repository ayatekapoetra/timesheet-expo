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

// Get kegiatan from API and sync to SQLite
export const getKegiatan = createAsyncThunk(
  'kegiatan/getKegiatan',
  async () => {
    try {
      await ensureAuth();
      
      // Fetch from API
      const response = await ApiFetch.get('/master/kegiatan');
      
      const apiData = response.data.rows || response.data.data || response.data || [];
      
      // Sync to SQLite and cache to AsyncStorage for offline usage
      if (apiData.length > 0) {
        try {
          await SQLiteService.syncKegiatan(apiData);
        } catch (syncErr) {
        }
        try {
          await AsyncStorage.setItem('@kegiatan', JSON.stringify(apiData));
        } catch (_e) {}
        return apiData;
      }
      
      // If API data is empty, try SQLite
      const dbData = await SQLiteService.getKegiatan();
      
      return dbData;
    } catch (error) {
      
      // Fallback to SQLite then AsyncStorage
      try {
        const dbData = await SQLiteService.getKegiatan();
        if (dbData.length > 0) return dbData;
      } catch (dbError) {
      }
      try {
        const local = await AsyncStorage.getItem('@kegiatan');
        if (local) return JSON.parse(local);
      } catch (_e) {}
      
      
      // Return mock data for testing (matching API structure)
      return [
          { id: 13, level: 'BC', type: 'mining', grpequipment: 'HE', grpmaterial: 'ore', ctg: 'potential-income', subctg: 'pro', abbr: 'estafet', nama: 'ESTAFET', aktif: 'Y' },
          { id: 9, level: 'BC', type: 'mining', grpequipment: 'HE', grpmaterial: 'ore', ctg: 'potential-income', subctg: 'pro', abbr: 'galian ob', nama: 'GALIAN OB', aktif: 'Y' },
          { id: 13, level: 'BC', type: 'mining', grpequipment: 'HE', grpmaterial: 'ore', ctg: 'general-cost', subctg: 'mhr', abbr: 'loading', nama: 'LOADING', aktif: 'Y' },
          { id: 29, level: 'FA', type: 'mining', grpequipment: 'DT', grpmaterial: 'ob', ctg: 'general-cost', subctg: 'unpro', abbr: 'hauling', nama: 'HAULING OB', aktif: 'Y' },
          { id: 30, level: 'FB', type: 'mining', grpequipment: 'DT', grpmaterial: 'ore', ctg: 'potential-income', subctg: 'pro', abbr: 'hauling', nama: 'HAULING ORE', aktif: 'Y' },
          { id: 31, level: 'FC', type: 'mining', grpequipment: 'DT', grpmaterial: 'oth', ctg: 'specific-cost', subctg: 'unpro', abbr: 'hauling', nama: 'HAULING OTH', aktif: 'Y' }
        ];
      }
    }
  );

// Get kegiatan only from SQLite (offline)
export const getKegiatanOffline = createAsyncThunk(
  'kegiatan/getKegiatanOffline',
  async () => {
    try {
      const dbData = await SQLiteService.getKegiatan();
      return dbData;
    } catch (error) {
      return [];
    }
  }
);

// Create or update kegiatan
export const createOrUpdateKegiatan = createAsyncThunk(
  'kegiatan/createOrUpdateKegiatan',
  async (data) => {
    try {
      const result = await SQLiteService.upsert('kegiatans', data);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Failed to save kegiatan');
    }
  }
);

const kegiatanSlice = createSlice({
  name: 'kegiatan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add local reducers for real-time updates
    addKegiatan: (state, action) => {
      state.data.push(action.payload);
    },
    updateKegiatan: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.data.findIndex(item => item.id === id);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updates };
      }
    },
    removeKegiatan: (state, action) => {
      const id = action.payload;
      state.data = state.data.filter(item => item.id !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      // getKegiatan
      .addCase(getKegiatan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKegiatan.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getKegiatan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch kegiatan';
      })
      // getKegiatanOffline
      .addCase(getKegiatanOffline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKegiatanOffline.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getKegiatanOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get kegiatan from database';
      })
      // createOrUpdateKegiatan
      .addCase(createOrUpdateKegiatan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateKegiatan.fulfilled, (state, action) => {
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
      .addCase(createOrUpdateKegiatan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save kegiatan';
      });
  },
});

export const { 
  clearError, 
  addKegiatan, 
  updateKegiatan, 
  removeKegiatan 
} = kegiatanSlice.actions;

// Selector to get kegiatan filtered by equipment category
export const selectKegiatanByEquipmentCategory = (state, equipmentCategory) => {
  if (!state.kegiatan?.data || !equipmentCategory) {
    return state.kegiatan?.data || [];
  }
  
  return state.kegiatan.data.filter(kegiatan => 
    kegiatan.grpequipment === equipmentCategory
  );
};

export default kegiatanSlice.reducer;