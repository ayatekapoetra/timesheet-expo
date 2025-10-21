import ApiFetch from '@/src/helpers/ApiFetch';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

// Initial Form State
const initialFormState = {
    "id": null,
    "tanggal": new Date().toISOString().split('T')[0],
    "kategori": "",
    "cabang_id": "",
    "cabang_nama": "",
    "cabang": null,
    "equipment_id": "",
    "equipment_nama": "",
    "equipment_kategori": "",
    "equipment": null,
    "penyewa_id": "",
    "penyewa_nama": "",
    "penyewa": null,
    "overtime": "ls0",
    "longshift_id": 0,
    "longshift_nama": "",
    "shift_id": "",
    "shift_nama": "",
    "shift": null,
    "karyawan_id": "",
    "karyawan": null,
    "operator_id": "",
    "operator_nama": "",
    "activity": "",
    "smustart": 0,
    "smufinish": 0,
    "usedsmu": 0,
    "bbm": 0,
    "keterangan": "",
    "photo": "",
    "foto": [],
    "kegiatan": []
};

// Initial State
const initialState = {
  form: initialFormState,
  loading: false,
  submitting: false,
  error: null,
  validationErrors: {},
};

// Async Thunks
export const submitTimesheet = createAsyncThunk(
  'timesheetItem/submitTimesheet',
  async (formData, { rejectWithValue }) => {
    try {
      const isEdit = !!formData.id;
      
      // Prepare FormData for multipart/form-data
      const dataForm = new FormData();
      

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        
        // Skip complex objects (display only objects)
        const displayOnlyObjects = [
          'equipment', 'karyawan', 'penyewa', 'pelanggan', 
          'shift', 'longshift_obj', 'activity_obj', 'cabang'
        ];
        
        if (displayOnlyObjects.includes(key)) {
          // Skip display objects
          return;
        }
        
        // Skip id if null (for new timesheet)
        if (key === 'id' && !value) {
          return;
        }
        
        // Skip empty meta fields
        if ((key === 'status' || key === 'kode' || key === 'created_at' || key === 'updated_at' || key === 'date_ops') && !value) {
          return;
        }
        
        // Skip empty kategori field
        if (key === 'kategori' && value === '') {
          return;
        }
        
        // Handle kegiatan/items array
        if (key === 'kegiatan' || key === 'items') {
          dataForm.append(key, JSON.stringify(value));
        } 
        // Handle photo files - use 'foto[]' as expected by backend
        else if (key === 'foto' || key === 'photo') {
          if (value && Array.isArray(value) && value.length > 0) {
            value.forEach((photo, index) => {
              if (photo.uri) {
                // Create file object for React Native FormData
                const photoFile = {
                  uri: photo.uri,
                  type: photo.type || 'image/jpeg',
                  name: photo.fileName || photo.name || `photo_${index}.jpg`,
                };
                // Use 'foto[]' field name as expected by backend
                dataForm.append('foto[]', photoFile);
              }
            });
          } else if (value && value.uri) {
            // Create file object for single photo
            const photoFile = {
              uri: value.uri,
              type: value.type || 'image/jpeg',
              name: value.fileName || value.name || 'photo.jpg',
            };
            dataForm.append('foto[]', photoFile);
          }
          // Skip empty photo arrays/strings
        } 
        // Handle primitive values
        else if (value !== null && value !== undefined && value !== '') {
          dataForm.append(key, value.toString());
        }
      });
      
      // Debug: Log FormData contents
      console.log('📸 FormData contents being sent:');
      for (let [key, value] of dataForm._parts) {
        if (key.includes('foto')) {
          console.log(`📸 ${key}:`, value);
        }
      }
      
      let response;
      if (isEdit) {
        // For edit, use PUT with multipart
        // Note: Don't set Content-Type header for FormData in React Native
        response = await ApiFetch.put(
          `operation/timesheet/${formData.id}`,
          dataForm,
          {
            headers: {
              'Cache-Control': 'no-cache',
              // Remove Content-Type header to let React Native set it properly
            },
          }
        );
      } else {
        // For create, use POST with multipart
        response = await ApiFetch.post(
          'operation/timesheet/mobile',
          dataForm,
          {
            headers: {
              'Cache-Control': 'no-cache',
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data', // Explicitly set for React Native
            },
          }
        );
      }
      
      console.log('📸 API Response:', response.data);
      return response.data;
      
    } catch (error) {
      const code = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || 'Gagal mengirim timesheet';
      
      // If network error or server error, save to offline queue
      if (message === 'Network Error' || (code && code >= 500)) {
        try {
          const SQLiteService = (await import('@/src/database/SQLiteService')).default;
          const uniqueKey = `timesheet_${Date.now()}_${Math.random()}`;
          await SQLiteService.outboxEnqueue('timesheet', uniqueKey, formData);
          return rejectWithValue('Disimpan ke antrian offline');
        } catch (e) {
          return rejectWithValue(message);
        }
      }
      
      return rejectWithValue(message);
    }
  }
);

export const getTimesheetForEdit = createAsyncThunk(
  'timesheetItem/getTimesheetForEdit',
  async (id) => {
    try {
      const response = await ApiFetch.get(`operation/timesheet/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to fetch timesheet for edit';
    }
  }
);

// Slice
const timesheetItemSlice = createSlice({
  name: 'timesheetItem',
  initialState,
  reducers: {
    initTimesheet: (state) => {
      // Create a fresh copy for new timesheet
      state.form = {
        ...initialFormState,
        id: null, // Reset ID for new timesheet
        kode: '', // Reset kode for new timesheet
        date_ops: new Date().toISOString().split('T')[0], // Set to today
        tanggal: new Date().toISOString().split('T')[0], // Set to today
        status: 'draft', // Set to draft for new timesheet
        keterangan: '', // Clear keterangan
        kegiatan: [], // Clear activities
        items: [], // Clear items
      };
      state.error = null;
      state.validationErrors = {};
    },
    
    setTimesheet: (state, action) => {
      const incomingData = action.payload;
      
      // Map kegiatan/items to ensure proper structure with display fields
      const kegiatanData = incomingData.kegiatan || incomingData.items || [];
      const mappedKegiatan = kegiatanData.map(item => ({
        ...item,
        // Ensure display fields for kegiatan items
        kegiatan_nama: item.kegiatan?.nama || item.kegiatan_nama || item.activity_name || '',
        material_nama: item.material?.nama || item.material_nama || item.material_name || '',
        lokasi_asal_nama: item.lokasi?.nama || item.lokasi_asal_nama || item.from_location || '',
        lokasi_tujuan_nama: item.lokasiTujuan?.nama || item.lokasi_to_obj?.nama || item.lokasi_tujuan_nama || item.to_location || '',
        
        // Ensure quantity field
        quantity: item.quantity || item.ritase || 0,
        
        // Preserve nested objects if they exist
        kegiatan: item.kegiatan || null,
        material: item.material || null,
        lokasi: item.lokasi || null,
        lokasiTujuan: item.lokasiTujuan || item.lokasi_to_obj || null,
      }));
      
      state.form = {
        ...state.form,
        ...incomingData,
        operator_nama: incomingData.karyawan?.nama || incomingData.operator_nama || state.form.operator_nama,
        penyewa_nama: incomingData.penyewa?.nama || incomingData.pelanggan?.nama || incomingData.penyewa_nama || state.form.penyewa_nama,
        equipment_nama: incomingData.equipment?.kode || incomingData.equip_kode || incomingData.equipment_nama || state.form.equipment_nama,
        shift_nama: incomingData.shift?.nama || incomingData.shift_nama || state.form.shift_nama,
        cabang_nama: incomingData.cabang_nama || state.form.cabang_nama,
        kegiatan: mappedKegiatan,
        items: mappedKegiatan,
      };
    },
    
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
      
      // Auto calculate used SMU when smustart or smufinish changes
      if (field === 'smustart' || field === 'smufinish') {
        const smustart = parseFloat(state.form.smustart) || 0;
        const smufinish = parseFloat(state.form.smufinish) || 0;
        state.form.usedsmu = smufinish - smustart;
      }
      
      // Auto-update kdunit when equipment_id changes
      if (field === 'equipment_id' && state.form.equipment) {
        state.form.kdunit = state.form.equipment.kode || '';
      }
      
      // Auto-update date_ops when tanggal changes
      if (field === 'tanggal') {
        state.form.date_ops = value;
      }
      
      // Clear validation error for this field
      if (state.validationErrors[field]) {
        delete state.validationErrors[field];
      }
    },
    
    addKegiatan: (state) => {
      const newId = `temp_${Date.now()}_${Math.random()}`;
      const newKegiatan = {
        id: newId,
        timesheet_id: state.form.id,
        lokasi_id: null,
        lokasi_asal_id: null,
        lokasi_tujuan_id: null,
        seq: '',
        lokasi_to: null,
        kegiatan_id: null,
        material_id: null,
        starttime: '',
        endtime: '',
        timetot: '0.00',
        smustart: state.form.smustart,
        smufinish: state.form.smufinish,
        usedsmu: state.form.usedsmu.toString(),
        ritase: 0,
        created_at: '',
        updated_at: '',
        // Related objects
        lokasi: null,
        kegiatan: null,
        material: null,
        lokasiTujuan: null,
        lokasi_to_obj: null,
        // Display fields
        kegiatan_nama: '',
        material_nama: '',
        lokasi_asal_nama: '',
        lokasi_tujuan_nama: '',
      };
      state.form.kegiatan.push(newKegiatan);
      console.log('newKegiatan---', newKegiatan);
      
      // Also add to items array for consistency
      state.form.items.push({...newKegiatan});
    },
    
    removeKegiatan: (state, action) => {
      const id = action.payload;
      state.form.kegiatan = state.form.kegiatan.filter(item => item.id !== id);
      state.form.items = state.form.items.filter(item => item.id !== id);
    },
    
    updateKegiatan: (state, action) => {
      const { id, field, value } = action.payload;
      const kegiatanIndex = state.form.kegiatan.findIndex(item => item.id === id);
      const itemIndex = state.form.items.findIndex(item => item.id === id);
      
      if (kegiatanIndex !== -1) {
        state.form.kegiatan[kegiatanIndex][field] = value;
        
        // Also update the corresponding item in items array
        if (itemIndex !== -1) {
          state.form.items[itemIndex][field] = value;
        }
        
        // Auto-update nested objects when _nama fields are updated
        if (field === 'kegiatan_nama') {
          if (!state.form.kegiatan[kegiatanIndex].kegiatan) {
            state.form.kegiatan[kegiatanIndex].kegiatan = {};
          }
          state.form.kegiatan[kegiatanIndex].kegiatan.nama = value;
          if (itemIndex !== -1) {
            if (!state.form.items[itemIndex].kegiatan) {
              state.form.items[itemIndex].kegiatan = {};
            }
            state.form.items[itemIndex].kegiatan.nama = value;
          }
        }
        
        if (field === 'material_nama') {
          if (!state.form.kegiatan[kegiatanIndex].material) {
            state.form.kegiatan[kegiatanIndex].material = {};
          }
          state.form.kegiatan[kegiatanIndex].material.nama = value;
          if (itemIndex !== -1) {
            if (!state.form.items[itemIndex].material) {
              state.form.items[itemIndex].material = {};
            }
            state.form.items[itemIndex].material.nama = value;
          }
        }
        
        if (field === 'lokasi_asal_nama') {
          if (!state.form.kegiatan[kegiatanIndex].lokasi) {
            state.form.kegiatan[kegiatanIndex].lokasi = {};
          }
          state.form.kegiatan[kegiatanIndex].lokasi.nama = value;
          if (itemIndex !== -1) {
            if (!state.form.items[itemIndex].lokasi) {
              state.form.items[itemIndex].lokasi = {};
            }
            state.form.items[itemIndex].lokasi.nama = value;
          }
        }
        
        if (field === 'lokasi_tujuan_nama') {
          if (!state.form.kegiatan[kegiatanIndex].lokasiTujuan) {
            state.form.kegiatan[kegiatanIndex].lokasiTujuan = {};
          }
          state.form.kegiatan[kegiatanIndex].lokasiTujuan.nama = value;
          if (itemIndex !== -1) {
            if (!state.form.items[itemIndex].lokasiTujuan) {
              state.form.items[itemIndex].lokasiTujuan = {};
            }
            state.form.items[itemIndex].lokasiTujuan.nama = value;
          }
        }
        
        // Auto-calculate timetot when starttime or endtime changes
        if (field === 'starttime' || field === 'endtime') {
          const starttime = state.form.kegiatan[kegiatanIndex].starttime;
          const endtime = state.form.kegiatan[kegiatanIndex].endtime;
          if (starttime && endtime) {
            // Calculate duration in hours
            // Format: "YYYY-MM-DD HH:mm"
            const start = moment(starttime, 'YYYY-MM-DD HH:mm');
            const end = moment(endtime, 'YYYY-MM-DD HH:mm');
            const duration = end.diff(start, 'hours', true);
            state.form.kegiatan[kegiatanIndex].timetot = duration.toFixed(2);
            if (itemIndex !== -1) {
              state.form.items[itemIndex].timetot = duration.toFixed(2);
            }
          }
        }
        
        // Sync usedsmu with parent form
        if (field === 'smustart' || field === 'smufinish') {
          const smustart = parseFloat(state.form.kegiatan[kegiatanIndex].smustart) || 0;
          const smufinish = parseFloat(state.form.kegiatan[kegiatanIndex].smufinish) || 0;
          const usedsmu = smufinish - smustart;
          state.form.kegiatan[kegiatanIndex].usedsmu = usedsmu.toString();
          if (itemIndex !== -1) {
            state.form.items[itemIndex].usedsmu = usedsmu.toString();
          }
        }
      }
    },
    
    setValidationError: (state, action) => {
      state.validationErrors = action.payload;
    },
    
    clearValidationError: (state, action) => {
      if (state.validationErrors[action.payload]) {
        delete state.validationErrors[action.payload];
      }
    },
    
    clearAllValidationErrors: (state) => {
      state.validationErrors = {};
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Submit Timesheet
    builder
      .addCase(submitTimesheet.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitTimesheet.fulfilled, (state) => {
        state.submitting = false;
        // Don't reset form automatically, let the component handle navigation
      })
      .addCase(submitTimesheet.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || action.error.message || 'Gagal mengirim timesheet';
      });

    // Get Timesheet for Edit
    builder
      .addCase(getTimesheetForEdit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTimesheetForEdit.fulfilled, (state, action) => {
        state.loading = false;
        state.form = action.payload;
      })
      .addCase(getTimesheetForEdit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch timesheet';
      });
  },
});

export const {
  initTimesheet,
  setTimesheet,
  updateField,
  addKegiatan,
  removeKegiatan,
  updateKegiatan,
  setValidationError,
  clearValidationError,
  clearAllValidationErrors,
  setError,
  resetState,
} = timesheetItemSlice.actions;

export default timesheetItemSlice.reducer;