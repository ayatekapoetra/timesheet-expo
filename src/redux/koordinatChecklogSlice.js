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

export const getKoordinatChecklog = createAsyncThunk(
  'koordinatChecklog/getKoordinatChecklog',
  async () => {
    try {
      await ensureAuth();

      const response = await ApiFetch.get('/mobile/lokasi-checklog');

      const apiData = response.data.rows || response.data.data || response.data || [];

      if (apiData.length > 0) {
        try {
          await SQLiteService.syncKoordinatChecklog(apiData);
        } catch (syncErr) {
        }
        try { await AsyncStorage.setItem('@koordinatChecklog', JSON.stringify(apiData)); } catch (_e) {}
        return apiData;
      }

      const dbData = await SQLiteService.getKoordinatChecklog();

      // normalize id to string
      const normalized = dbData.map(i => ({ ...i, id: i.id?.toString?.() || i.id }));
      return normalized;
    } catch (error) {

      try {
        const dbData = await SQLiteService.getKoordinatChecklog();
        return dbData;
      } catch (dbError) {
        return [];
      }
    }
  }
);

// Get koordinatChecklog only from SQLite (offline)
export const getKoordinatChecklogOffline = createAsyncThunk(
  'koordinatChecklog/getKoordinatChecklogOffline',
  async () => {
    try {
      const dbData = await SQLiteService.getKoordinatChecklog();
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

const koordinatChecklogSlice = createSlice({
  name: 'koordinatChecklog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getKoordinatChecklog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKoordinatChecklog.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getKoordinatChecklog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch koordinat checklog';
      })
      .addCase(getKoordinatChecklogOffline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKoordinatChecklogOffline.fulfilled, (state, action) => {
        if (action.payload.length > 0) {
        }
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getKoordinatChecklogOffline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get koordinat checklog from database';
      });
  },
});

export const { clearError } = koordinatChecklogSlice.actions;

// Selector to filter koordinatChecklog by user's cabang_id
export const selectKoordinatChecklogByUserCabang = (state) => {
  const koordinatChecklog = state.koordinatChecklog?.data || [];
  const employee = state.auth?.employee;

  if (!employee || !employee.cabang || !employee.cabang.id) {
    return koordinatChecklog;
  }

  const userCabangId = employee.cabang.id.toString();

  const filtered = koordinatChecklog.filter(item => {
    const itemCabangId = item.cabang_id?.toString();
    return itemCabangId === userCabangId;
  });

  return filtered;
};

export default koordinatChecklogSlice.reducer;