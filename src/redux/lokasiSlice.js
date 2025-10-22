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

export const getLokasi = createAsyncThunk(
  'lokasi/getLokasi',
  async () => {
    try {
      await ensureAuth();
      
      const response = await ApiFetch.get('/master/lokasi-kerja/list');
      
      const apiData = response.data.rows || response.data.data || response.data || [];
      
      if (apiData.length > 0) {
        try {
          await SQLiteService.syncLokasi(apiData);
        } catch (syncErr) {
        }
        try { await AsyncStorage.setItem('@lokasi', JSON.stringify(apiData)); } catch (_e) {}
        return apiData;
      }
      
      const dbData = await SQLiteService.getLokasi();
      
      // normalize id to string
      const normalized = dbData.map(i => ({ ...i, id: i.id?.toString?.() || i.id }));
      return normalized;
    } catch (error) {
      
      try {
        const dbData = await SQLiteService.getLokasi();
        return dbData;
      } catch (dbError) {
        return [
          { id: 7, cabang_id: 2, kode: '07', type: 'STP', abbr: '#A', nama: 'STOCK PILE', sts_jarak: '', aktif: 'Y' },
          { id: 26, cabang_id: 2, kode: '26', type: 'PIT', abbr: '', nama: '1B', sts_jarak: '', aktif: 'Y' },
          { id: 27, cabang_id: 2, kode: '27', type: 'PIT', abbr: '', nama: '3B', sts_jarak: '', aktif: 'Y' },
          { id: 2, cabang_id: 2, kode: '02', type: 'PIT', abbr: '2A3', nama: 'PIT 2A3', sts_jarak: 'J', aktif: 'Y' },
          { id: 1, cabang_id: 2, kode: '01', type: 'PIT', abbr: '2A4', nama: 'PIT 2A4', sts_jarak: 'J', aktif: 'Y' },
          { id: 13, cabang_id: 2, kode: '13', type: 'PLG', abbr: 'CRUSHER', nama: 'CRUSHER ALJ', sts_jarak: '', aktif: 'Y' }
        ];
      }
    }
  }
);

// Get lokasi only from SQLite (offline)
export const getLokasiOffline = createAsyncThunk(
  'lokasi/getLokasiOffline',
  async () => {
    try {
      const dbData = await SQLiteService.getLokasi();
      // Normalize id to ensure consistency
      const normalized = dbData.map(item => ({
        ...item,
        id: item.id?.toString?.() || item.id,
        nama: item.nama || '',
      }));
      return normalized;
    } catch (error) {
      return [];
    }
  }
);

const lokasiSlice = createSlice({
  name: 'lokasi',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLokasi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLokasi.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getLokasi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lokasi';
      })
      .addCase(getLokasiOffline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLokasiOffline.fulfilled, (state, action) => {
        if (action.payload.length > 0) {
        }
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getLokasiOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get lokasi from database';
      });
  },
});

export const { clearError } = lokasiSlice.actions;

// Selector to filter lokasi by user's cabang_id
export const selectLokasiByUserCabang = (state) => {
  const lokasi = state.lokasi?.data || [];
  const employee = state.auth?.employee;
  
  if (!employee || !employee.cabang || !employee.cabang.id) {
    return lokasi;
  }
  
  const userCabangId = employee.cabang.id.toString();
  
  const filtered = lokasi.filter(item => {
    const itemCabangId = item.cabang_id?.toString();
    return itemCabangId === userCabangId;
  });
  
  return filtered;
};

export default lokasiSlice.reducer;