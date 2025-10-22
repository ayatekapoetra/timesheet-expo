import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  show: false,
  status: null,
  title: null,
  subtitle: null,
};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    applyAlert: (state, action) => {
      state.show = true;
      state.status = action.payload.status;
      state.title = action.payload.title;
      state.subtitle = action.payload.subtitle || null;
    },
    closeAlert: (state) => {
      state.show = false;
      state.status = null;
      state.title = null;
      state.subtitle = null;
    },
  },
});

export const { closeAlert, applyAlert } = alertSlice.actions;

export default alertSlice.reducer;