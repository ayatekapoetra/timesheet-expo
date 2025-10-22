import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiFetch from '../helpers/ApiFetch';

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password, uuid }, { rejectWithValue }) => {
    let resp = null;
    try {
      resp = await apiFetch.post('/auth/login-oprdrv', {
        username,
        password,
        uuid,
      });
      
      if (resp?.data?.data?.token) {
        await AsyncStorage.setItem('@token', resp?.data?.data?.token);
        await AsyncStorage.setItem('@user', JSON.stringify(resp?.data?.user));
        await AsyncStorage.setItem('@employee', JSON.stringify(resp?.data?.employee));

        return resp.data;
      } else if (resp?.data?.diagnostic?.error) {
        return rejectWithValue(resp.data.diagnostic.message);
      } else {
        return rejectWithValue('Login gagal, silakan coba lagi');
      }
    } catch (error) {
      
      if (error?.response?.status === 401) {
        return rejectWithValue('Username atau password salah');
      } else if (error?.response?.status === 403) {
        return rejectWithValue(error?.response?.data?.message || 'Anda tidak memiliki akses untuk masuk kedalam aplikasi ini');
      } else if (error?.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (error?.message === 'Network Error') {
        return rejectWithValue('Tidak dapat terhubung ke server. Periksa koneksi internet Anda');
      } else {
        return rejectWithValue('Terjadi kesalahan, silakan coba lagi');
      }
    }
  },
);

export const restoreAuth = createAsyncThunk(
  'auth/restoreAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const userStr = await AsyncStorage.getItem('@user');
      const employeeStr = await AsyncStorage.getItem('@employee');
      
      if (token && userStr && employeeStr) {
        const user = JSON.parse(userStr);
        const employee = JSON.parse(employeeStr);
        
        return {
          data: {
            type: 'bearer',
            token,
          },
          user,
          employee,
        };
      }
      
      return rejectWithValue('No stored auth data');
    } catch (error) {
      return rejectWithValue('Failed to restore auth');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await AsyncStorage.removeItem('@token');
      await AsyncStorage.removeItem('@user');
      await AsyncStorage.removeItem('@employee');
    } catch (error) {
    }
  }
);

export const updateEmployeeLocal = createAsyncThunk(
  'auth/updateEmployeeLocal',
  async (partial, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const current = state.auth?.employee || {};
      const merged = { ...current, ...partial };
      await AsyncStorage.setItem('@employee', JSON.stringify(merged));
      return merged;
    } catch (e) {
      return rejectWithValue('Failed to update local employee');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  token: null,
  user: null,
  employee: null,
};

const authSlice = createSlice({
  name: 'auth/login',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.employee = null;
        state.token = null;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        
        state.loading = false;
        state.token = action.payload.data.token;
        state.user = action.payload.user;
        state.employee = action.payload.employee;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        
        state.loading = false;
        state.token = null;
        state.user = null;
        state.employee = null;
        state.error = action.payload || action.error.message || 'Login gagal';
      })
      // Restore Auth
      .addCase(restoreAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreAuth.fulfilled, (state, action) => {
        
        state.loading = false;
        state.token = action.payload.data.token;
        state.user = action.payload.user;
        state.employee = action.payload.employee;
        state.error = null;
      })
      .addCase(restoreAuth.rejected, (state) => {
        state.loading = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.employee = null;
        state.error = null;
      })
      // Local update employee
      .addCase(updateEmployeeLocal.fulfilled, (state, action) => {
        state.employee = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;