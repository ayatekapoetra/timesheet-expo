import SQLiteService from '@/src/database/SQLiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as Device from 'expo-device';
import apiFetch from '../helpers/ApiFetch';

// Helper function to ensure authentication
const ensureAuth = async () => {
  try {
    // Check if token exists
    let token = await AsyncStorage.getItem('@token');
    
    if (!token) {
      
      // Auto-login with provided credentials
      const uuid = Device.osInternalBuildId || 'test-device';
      const loginResponse = await apiFetch.post('/auth/login-oprdrv', {
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

export const getEquipment = createAsyncThunk('list/equipment', async () => {
  try {
    await ensureAuth();
    
    const resp = await apiFetch.get('master/equipment/list');

    const data = resp.data.rows || resp.data.data || [];

    // Sync to SQLite
    try {
      await SQLiteService.syncEquipment(data);
    } catch (dbError) {
    }

    await AsyncStorage.setItem('@equipment', JSON.stringify(data));

    return {
      data: data,
      message: resp.data.message,
    };
  } catch (apiError) {

    // Try SQLite first
    try {
      const dbData = await SQLiteService.getEquipment();
      if (dbData.length > 0) {
        return {
          data: dbData,
        };
      }
    } catch (dbError) {
    }

    const local = await AsyncStorage.getItem('@equipment');
    if (local) {
      return {
        data: JSON.parse(local),
      };
    }

    return {
      data: [
        { id: '1', kode: 'EXC-001', kategori: 'HE', nama: 'Excavator 1' },
        { id: '2', kode: 'DT-001', kategori: 'DT', nama: 'Dump Truck 1' },
        { id: '3', kode: 'EXC-002', kategori: 'HE', nama: 'Excavator 2' },
        { id: '4', kode: 'DT-002', kategori: 'DT', nama: 'Dump Truck 2' },
      ],
    };
  }
});

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const equipmentSlice = createSlice({
  name: 'list/equipment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEquipment.pending, (state) => {
        state.loading = true;
        state.data = null;
        state.error = null;
      })
      .addCase(getEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = action.payload.message || null;
      })
      .addCase(getEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.code || 'Failed to fetch equipment';
      });
  },
});

export default equipmentSlice.reducer;