import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiFetch from '@/src/helpers/ApiFetch';
import SQLiteService from '@/src/database/SQLiteService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const initialState = {
  downloadStatus: {}, // { kategori: 'success', cabang: 'error', ... }
  isDownloading: false,
  lastSyncTime: null,
  errors: {}, // { kategori: 'Network error', ... }
  dataCounts: {}, // { kategori: 5, cabang: 3, ... }
};

// Helper function to ensure authentication
const ensureAuth = async () => {
  try {
    let token = await AsyncStorage.getItem('@token');
    
    if (!token) {
      
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

// Download specific data type
export const downloadSpecificData = createAsyncThunk(
  'download/downloadSpecificData',
  async (dataType, { rejectWithValue }) => {
    try {
      
      // Handle kategori as static data
      if (dataType === 'kategori') {
        const kategoriData = [
          { id: 'Barging', nama: 'Barging' },
          { id: 'Mining', nama: 'Mining' },
          { id: 'Rental', nama: 'Rental' },
        ];
        await SQLiteService.syncKategori(kategoriData);
        return { dataType, data: kategoriData, count: kategoriData.length };
      }
      
      // Ensure authentication
      await ensureAuth();

      // Define endpoints and sync functions
      const endpoints = {
        'cabang': { endpoint: '/master/cabang/list', sync: SQLiteService.syncCabang.bind(SQLiteService) },
        'penyewa': { endpoint: '/master/penyewa/list', sync: SQLiteService.syncPenyewa.bind(SQLiteService) },
        'equipment': { endpoint: '/master/equipment/list', sync: SQLiteService.syncEquipment.bind(SQLiteService) },
        'shift': { endpoint: '/master/shift/list', sync: SQLiteService.syncShift.bind(SQLiteService) },
        'longshift': { endpoint: '/master/longshift/list', sync: SQLiteService.syncLongshift.bind(SQLiteService) },
        'kegiatan': { endpoint: '/master/kegiatan', sync: SQLiteService.syncKegiatan.bind(SQLiteService) },
        'material': { endpoint: '/master/material-ritase/list', sync: SQLiteService.syncMaterial.bind(SQLiteService) },
        'lokasi': { endpoint: '/master/lokasi-kerja/list', sync: SQLiteService.syncLokasi.bind(SQLiteService) },
        'koordinatChecklog': { endpoint: '/mobile/lokasi-checklog', sync: SQLiteService.syncKoordinatChecklog.bind(SQLiteService) },
        'timesheet': { endpoint: '/operation/timesheet', sync: SQLiteService.syncTimesheetTop10.bind(SQLiteService) }
      };

      const config = endpoints[dataType];
      if (!config) {
        throw new Error(`Unknown data type: ${dataType}`);
      }

      // Fetch data from API
      const response = await ApiFetch.get(config.endpoint);
      
      // Extract data from response
      let apiData = response.data?.rows || response.data?.data || response.data || [];
      
      // Ensure we have an array
      if (!Array.isArray(apiData)) {
        if (apiData && typeof apiData === 'object') {
          const arrayProps = Object.keys(apiData).filter(key => Array.isArray(apiData[key]));
          if (arrayProps.length > 0) {
            apiData = apiData[arrayProps[0]];
          } else {
            apiData = [apiData];
          }
        } else {
          apiData = [];
        }
      }
      
      
      // Sync to SQLite
      if (apiData.length > 0 && config.sync) {
        try {
          const syncResult = await config.sync(apiData);
        } catch (syncError) {
          throw new Error(`Failed to sync ${dataType}: ${syncError.message}`);
        }
      } else {
      }
      
      return { dataType, data: apiData, count: apiData.length };
      
    } catch (error) {
      return rejectWithValue({
        dataType,
        error: error.response?.data?.message || error.message || 'Download failed',
      });
    }
  }
);

// Download all master data
export const downloadAllMasterData = createAsyncThunk(
  'download/downloadAllMasterData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      
      const dataTypes = [
        'kategori', 'cabang', 'penyewa', 'equipment',
        'shift', 'longshift', 'kegiatan', 'material', 'lokasi', 'koordinatChecklog', 'timesheet'
      ];
      
      const results = [];
      
      for (const dataType of dataTypes) {
        try {
          const result = await dispatch(downloadSpecificData(dataType)).unwrap();
          results.push({ success: true, ...result });
        } catch (error) {
          results.push({ success: false, ...error });
        }
      }
      
      const failedItems = results.filter(r => !r.success);
      if (failedItems.length > 0) {
      }
      
      return results;
      
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to download master data');
    }
  }
);

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    clearDownloadStatus: (state) => {
      state.downloadStatus = {};
      state.errors = {};
      state.dataCounts = {};
    },
    setDownloadStatus: (state, action) => {
      const { dataType, status } = action.payload;
      state.downloadStatus[dataType] = status;
    },
    clearError: (state, action) => {
      const dataType = action.payload;
      if (state.errors[dataType]) {
        delete state.errors[dataType];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // downloadSpecificData
      .addCase(downloadSpecificData.pending, (state, action) => {
        const dataType = action.meta.arg;
        state.downloadStatus[dataType] = 'loading';
        if (state.errors[dataType]) {
          delete state.errors[dataType];
        }
      })
      .addCase(downloadSpecificData.fulfilled, (state, action) => {
        const { dataType, count } = action.payload;
        state.downloadStatus[dataType] = 'success';
        state.dataCounts[dataType] = count;
        state.lastSyncTime = new Date().toISOString();
      })
      .addCase(downloadSpecificData.rejected, (state, action) => {
        const { dataType, error } = action.payload;
        state.downloadStatus[dataType] = 'error';
        state.errors[dataType] = error;
      })
      
      // downloadAllMasterData
      .addCase(downloadAllMasterData.pending, (state) => {
        state.isDownloading = true;
        // Set all to loading initially
        const dataTypes = [
          'kategori', 'cabang', 'penyewa', 'equipment',
          'shift', 'longshift', 'kegiatan', 'material', 'lokasi', 'koordinatChecklog', 'timesheet'
        ];
        dataTypes.forEach(type => {
          state.downloadStatus[type] = 'loading';
        });
      })
      .addCase(downloadAllMasterData.fulfilled, (state, action) => {
        state.isDownloading = false;
        state.lastSyncTime = new Date().toISOString();
        
        // Update status and counts based on results
        action.payload.forEach(result => {
          if (result.success) {
            state.downloadStatus[result.dataType] = 'success';
            state.dataCounts[result.dataType] = result.count;
          } else {
            state.downloadStatus[result.dataType] = 'error';
            state.errors[result.dataType] = result.error;
          }
        });
      })
      .addCase(downloadAllMasterData.rejected, (state, action) => {
        state.isDownloading = false;
        // Set all to error on overall failure
        const dataTypes = [
          'kategori', 'cabang', 'penyewa', 'equipment',
          'shift', 'longshift', 'kegiatan', 'material', 'lokasi', 'koordinatChecklog', 'timesheet'
        ];
        dataTypes.forEach(type => {
          state.downloadStatus[type] = 'error';
          state.errors[type] = action.payload;
        });
      });
  },
});

export const { 
  clearDownloadStatus, 
  setDownloadStatus, 
  clearError 
} = downloadSlice.actions;

export default downloadSlice.reducer;