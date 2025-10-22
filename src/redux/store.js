import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import authReducer from './authSlice';
import alertReducer from './alertSlice';
import equipmentReducer from './equipmentSlice';
import timesheetReducer from './timesheetSlice';
import timesheetItemReducer from './timesheetItemSlice';
import penyewaReducer from './penyewaSlice';
import shiftReducer from './shiftSlice';
import longshiftReducer from './longshiftSlice';
import kegiatanReducer from './kegiatanSlice';
import lokasiReducer from './lokasiSlice';
import materialReducer from './materialSlice';
import koordinatChecklogReducer from './koordinatChecklogSlice';
import downloadReducer from './downloadSlice';
import syncReducer from './syncSlice';
import timesheetFilterReducer from './timesheetFilterSlice';

const store = configureStore({
  reducer: {
    themes: themeReducer,
    auth: authReducer,
    alert: alertReducer,
    equipment: equipmentReducer,
    timesheet: timesheetReducer,
    timesheetItem: timesheetItemReducer,
    penyewa: penyewaReducer,
    shift: shiftReducer,
    longshift: longshiftReducer,
    kegiatan: kegiatanReducer,
    lokasi: lokasiReducer,
    material: materialReducer,
    koordinatChecklog: koordinatChecklogReducer,
    download: downloadReducer,
    sync: syncReducer,
    timesheetFilter: timesheetFilterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export default store;