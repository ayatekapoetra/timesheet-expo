# Timesheet Filter Feature

## Overview
Fitur filter timesheet memungkinkan pengguna untuk memfilter data timesheet berdasarkan berbagai kriteria dengan menggunakan Redux untuk state management.

## Features

### 1. Default Filter (Login-based)
- **karyawan_id**: Otomatis diisi dari `auth.employee.id`
- **site_id**: Otomatis diisi dari `auth.employee.cabang.id`
- **startdate**: Default ke awal bulan berjalan
- **enddate**: Default ke hari ini

### 2. Manual Filters
- **penyewa_id**: Filter berdasarkan penyewa/customer
- **mainact**: Filter kategori (barging, mining, rental)
- **status**: Filter status (draft, submitted, approved, rejected)
- **equipment_id**: Filter berdasarkan equipment
- **shift_id**: Filter berdasarkan shift

## Technical Implementation

### Redux Structure
```javascript
// src/redux/timesheetFilterSlice.js
{
  karyawan_id: null,        // From auth.employee.id
  site_id: null,           // From auth.employee.cabang_id
  penyewa_id: '',          // Manual selection
  mainact: '',             // barging, mining, rental
  status: '',              // draft, submitted, approved, rejected
  equipment_id: '',        // Manual selection
  startdate: '',           // Date range start
  enddate: '',             // Date range end
  shift_id: '',            // Manual selection
  isFilterActive: false,   // UI state
  filterCount: 0,          // Number of active filters
}
```

### Components
1. **TimesheetFilter** (`src/components/TimesheetFilter.jsx`)
   - Modal filter dengan form input
   - Integration dengan master data (penyewa, equipment, shift)
   - Date picker untuk rentang tanggal
   - Real-time filter count

2. **Updated Timesheet Index** (`app/timesheet/index.jsx`)
   - Menggunakan filter dari Redux
   - Header menampilkan jumlah filter aktif
   - API call dengan parameter filter

### API Integration
```javascript
// Query parameters sent to API
{
  karyawan_id: 123,        // Required
  site_id: 456,           // Required
  startdate: '2025-01-01', // Required
  enddate: '2025-01-31',   // Required
  penyewa_id: '5',        // Optional
  mainact: 'mining',      // Optional
  status: 'approved',     // Optional
  equipment_id: '12',     // Optional
  shift_id: '2'           // Optional
}
```

## Usage

### 1. Access Filter
- Tap icon search di header Timesheet Harian
- Modal filter akan muncul dengan default values

### 2. Apply Filters
- **Date Range**: Pilih tanggal mulai dan selesai
- **Penyewa**: Pilih dari daftar penyewa
- **Kategori**: Pilih Barging, Mining, atau Rental
- **Status**: Pilih Draft, Submitted, Approved, atau Rejected
- **Equipment**: Pilih dari daftar equipment
- **Shift**: Pilih dari daftar shift

### 3. Filter Actions
- **Clear**: Reset semua filter manual (default values tetap)
- **Terapkan (X)**: Apply filter dan reload data
- **Close**: Tutup modal tanpa apply

## State Management

### Filter Initialization
```javascript
// Automatic when employee data available
useEffect(() => {
  if (employee && !timesheetFilter.karyawan_id) {
    dispatch(setDefaultFilter({ employee }));
  }
}, [employee, timesheetFilter.karyawan_id, dispatch]);
```

### Filter Updates
```javascript
// Individual field update
dispatch(updateFilter({ field: 'mainact', value: 'mining' }));

// Clear all manual filters
dispatch(clearFilters());
```

## UI Features

### Header Badge
- Menampilkan jumlah filter aktif: "TimeSheet Harian (3)"
- Hanya menampilkan count jika ada filter manual aktif

### Filter Modal
- **Section 1**: Default info (karyawan, site) - read-only
- **Section 2**: Date range picker
- **Section 3**: Manual filters dengan dropdown/picker
- **Footer**: Clear dan Apply buttons

### Responsive Design
- Modal responsive untuk berbagai ukuran layar
- Scrollable content untuk banyak filter options
- Dark/light mode support

## Data Flow

1. **Login**: Filter default di-set dari auth.employee
2. **Open Filter**: Modal muncul dengan current filter values
3. **Modify**: User ubah filter values
4. **Apply**: Filter di-update di Redux, API call triggered
5. **Reload**: Timesheet data di-load dengan filter baru
6. **Display**: Header update dengan filter count

## Benefits

1. **Consistent Filtering**: Centralized state dengan Redux
2. **Performance**: Efficient API calls dengan hanya parameter yang dibutuhkan
3. **User Experience**: Intuitive UI dengan real-time feedback
4. **Maintainability**: Clean separation antara UI, state, dan API logic
5. **Scalability**: Mudah menambah filter baru di masa depan

## Future Enhancements

1. **Saved Filters**: Allow users to save frequently used filter combinations
2. **Export**: Export filtered data to CSV/Excel
3. **Advanced Search**: Text search across multiple fields
4. **Filter Presets**: Quick filter buttons for common scenarios
5. **Analytics**: Filter usage analytics and suggestions