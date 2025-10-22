import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLiteService from '@/src/database/SQLiteService';
import NetworkService from '@/src/services/NetworkService';
import { downloadAllMasterData } from './downloadSlice';

const SYNC_CACHE_KEY = '@last_sync_time';
const SYNC_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const initialState = {
  syncing: false,
  syncProgress: 0,
  syncStatus: null,
  lastSyncTime: null,
  error: null,
  needsSync: true,
};

export const checkSyncNeeded = createAsyncThunk(
  'sync/checkSyncNeeded',
  async () => {
    try {
      const lastSyncStr = await AsyncStorage.getItem(SYNC_CACHE_KEY);
      
      if (!lastSyncStr) {
        return { needsSync: true, lastSyncTime: null };
      }
      
      const lastSyncTime = parseInt(lastSyncStr, 10);
      const now = Date.now();
      const elapsed = now - lastSyncTime;
      
      const needsSync = elapsed > SYNC_TTL;
      
      return { 
        needsSync, 
        lastSyncTime: new Date(lastSyncTime).toISOString() 
      };
    } catch (error) {
      return { needsSync: true, lastSyncTime: null };
    }
  }
);

export const syncMasterDataOnLogin = createAsyncThunk(
  'sync/syncMasterDataOnLogin',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      
      // Check network first
      const isOnline = await NetworkService.checkConnection();
      
      if (!isOnline) {
        return { 
          success: false, 
          message: 'Offline - using cached data',
          offline: true 
        };
      }
      
      // Check if sync is needed
      const syncCheck = await dispatch(checkSyncNeeded()).unwrap();
      
      if (!syncCheck.needsSync) {
        return { 
          success: true, 
          message: 'Data is up to date',
          skipped: true 
        };
      }
      
      
      // Download all master data
      const result = await dispatch(downloadAllMasterData()).unwrap();
      
      // Update last sync time
      const now = Date.now();
      await AsyncStorage.setItem(SYNC_CACHE_KEY, now.toString());
      
      const successCount = result.filter(r => r.success).length;
      const totalCount = result.length;
      
      if (successCount === 0) {
        throw new Error('All sync operations failed');
      }
      
      return {
        success: true,
        message: `Synced ${successCount}/${totalCount} data types`,
        results: result,
        lastSyncTime: new Date(now).toISOString()
      };
      
    } catch (error) {
      return rejectWithValue(error.message || 'Sync failed');
    }
  }
);

export const forceSyncMasterData = createAsyncThunk(
  'sync/forceSyncMasterData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      
      // Check network
      const isOnline = await NetworkService.checkConnection();
      
      if (!isOnline) {
        throw new Error('Tidak ada koneksi internet');
      }
      
      // Download all master data
      const result = await dispatch(downloadAllMasterData()).unwrap();
      
      // Update last sync time
      const now = Date.now();
      await AsyncStorage.setItem(SYNC_CACHE_KEY, now.toString());
      
      const successCount = result.filter(r => r.success).length;
      const totalCount = result.length;
      
      return {
        success: true,
        message: `Berhasil memperbaharui ${successCount}/${totalCount} data`,
        results: result,
        lastSyncTime: new Date(now).toISOString()
      };
      
    } catch (error) {
      return rejectWithValue(error.message || 'Gagal memperbaharui data');
    }
  }
);

export const clearSyncCache = createAsyncThunk(
  'sync/clearSyncCache',
  async () => {
    try {
      await AsyncStorage.removeItem(SYNC_CACHE_KEY);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }
);

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    clearSyncError: (state) => {
      state.error = null;
    },
    updateSyncProgress: (state, action) => {
      state.syncProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkSyncNeeded
      .addCase(checkSyncNeeded.fulfilled, (state, action) => {
        state.needsSync = action.payload.needsSync;
        state.lastSyncTime = action.payload.lastSyncTime;
      })
      
      // syncMasterDataOnLogin
      .addCase(syncMasterDataOnLogin.pending, (state) => {
        state.syncing = true;
        state.syncProgress = 0;
        state.syncStatus = 'syncing';
        state.error = null;
      })
      .addCase(syncMasterDataOnLogin.fulfilled, (state, action) => {
        state.syncing = false;
        state.syncProgress = 100;
        state.syncStatus = 'success';
        state.needsSync = false;
        state.lastSyncTime = action.payload.lastSyncTime || new Date().toISOString();
        state.error = null;
      })
      .addCase(syncMasterDataOnLogin.rejected, (state, action) => {
        state.syncing = false;
        state.syncProgress = 0;
        state.syncStatus = 'failed';
        state.error = action.payload || 'Sync failed';
      })
      
      // forceSyncMasterData
      .addCase(forceSyncMasterData.pending, (state) => {
        state.syncing = true;
        state.syncProgress = 0;
        state.syncStatus = 'syncing';
        state.error = null;
      })
      .addCase(forceSyncMasterData.fulfilled, (state, action) => {
        state.syncing = false;
        state.syncProgress = 100;
        state.syncStatus = 'success';
        state.needsSync = false;
        state.lastSyncTime = action.payload.lastSyncTime;
        state.error = null;
      })
      .addCase(forceSyncMasterData.rejected, (state, action) => {
        state.syncing = false;
        state.syncProgress = 0;
        state.syncStatus = 'failed';
        state.error = action.payload || 'Sync failed';
      })
      
      // clearSyncCache
      .addCase(clearSyncCache.fulfilled, (state) => {
        state.lastSyncTime = null;
        state.needsSync = true;
        state.syncStatus = null;
      });
  },
});

export const { clearSyncError, updateSyncProgress } = syncSlice.actions;
export default syncSlice.reducer;
