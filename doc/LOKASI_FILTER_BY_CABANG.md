# Filter Lokasi Kerja Berdasarkan Cabang User

## Overview

Lokasi kerja sekarang **otomatis ter-filter** berdasarkan cabang user yang sedang login. User hanya akan melihat lokasi yang sesuai dengan cabang mereka.

## Implementasi

### 1. Redux Selector

**File:** `src/redux/lokasiSlice.js`

**Function:** `selectLokasiByUserCabang`

```javascript
export const selectLokasiByUserCabang = (state) => {
  const lokasi = state.lokasi?.data || [];
  const employee = state.auth?.employee;
  
  if (!employee || !employee.cabang || !employee.cabang.id) {
    console.log('[lokasiSlice] No employee cabang data, returning all lokasi');
    return lokasi;
  }
  
  const userCabangId = employee.cabang.id.toString();
  
  const filtered = lokasi.filter(item => {
    const itemCabangId = item.cabang_id?.toString();
    return itemCabangId === userCabangId;
  });
  
  console.log('[lokasiSlice] Filter by cabang:', {
    userCabangId,
    totalLokasi: lokasi.length,
    filtered: filtered.length,
    userCabang: employee.cabang.nama
  });
  
  return filtered;
};
```

**How It Works:**
1. Get lokasi data dari Redux state
2. Get employee data (termasuk cabang_id)
3. Filter lokasi dimana `lokasi.cabang_id === employee.cabang.id`
4. Return filtered data

### 2. Local Filter Function

**File:** `app/timesheet/create.jsx`

**Function:** `filterLokasiByUserCabang`

```javascript
const filterLokasiByUserCabang = (lokasiData) => {
  if (!employee || !employee.cabang || !employee.cabang.id) {
    console.log('[CreateTimesheet] No employee cabang data, returning all lokasi');
    return lokasiData;
  }
  
  const userCabangId = employee.cabang.id.toString();
  
  const filtered = lokasiData.filter(item => {
    const itemCabangId = item.cabang_id?.toString();
    return itemCabangId === userCabangId;
  });
  
  console.log('[CreateTimesheet] Filtered lokasi by cabang:', {
    userCabangId,
    userCabangNama: employee.cabang.nama,
    totalLokasi: lokasiData.length,
    filteredCount: filtered.length
  });
  
  return filtered;
};
```

**Why Local Function?**
- Redux selector untuk online mode (data dari API)
- Local function untuk offline mode (data dari SQLite state)
- Konsistensi filter di kedua mode

### 3. Application di Bottom Sheet

**File:** `app/timesheet/create.jsx`

**Location:** BottomSheetPicker data prop

```javascript
data={(() => {
  if (kegiatanPicker.type === 'kegiatan') {
    // Kegiatan: filter by equipment kategori
    return selectKegiatanByEquipmentCategory(...);
  } else if (kegiatanPicker.type === 'material') {
    // Material: no filter
    return materialList;
  } else {
    // Lokasi: filter by user cabang
    let lokasiData = kegiatanPicker.source === 'online' 
      ? (lokasiList || []) 
      : (offlineLokasi || []);
    
    // Apply cabang filter
    const filteredLokasi = filterLokasiByUserCabang(lokasiData);
    
    return filteredLokasi;
  }
})()}
```

## Data Structure

### Employee Data

```javascript
{
  id: 123,
  nama: "John Doe",
  cabang: {
    id: 2,                    // ← Used for filtering
    nama: "Cabang Jakarta",
    kode: "JKT",
    initial: "JKT"
  },
  section: "Operator",
  bisnis: {
    initial: "MRT"
  }
}
```

### Lokasi Data

```javascript
{
  id: 7,
  nama: "STOCK PILE",
  cabang_id: 2,              // ← Matched with employee.cabang.id
  kode: "07",
  type: "STP",
  abbr: "#A",
  sts_jarak: "",
  aktif: "Y"
}
```

**Matching Logic:**
```javascript
employee.cabang.id.toString() === lokasi.cabang_id.toString()
```

## Filter Flow

### Online Mode (API Data)

```
User taps "Lokasi Asal"
    ↓
Open BottomSheetPicker
    ↓
Get lokasiList from Redux
    ↓
Apply filterLokasiByUserCabang()
    ↓
    ├─ employee.cabang.id = 2
    ├─ Total lokasi: 50
    └─ Filtered: 15 (where cabang_id = 2)
    ↓
Display 15 lokasi in list
```

### Offline Mode (SQLite Data)

```
User taps "Lokasi Asal"
    ↓
Open BottomSheetPicker
    ↓
Get offlineLokasi from state
    ↓
Apply filterLokasiByUserCabang()
    ↓
    ├─ employee.cabang.id = 2
    ├─ Total lokasi: 50
    └─ Filtered: 15 (where cabang_id = 2)
    ↓
Display 15 lokasi in list
```

## Console Logging

### When Filter Applied

```javascript
[CreateTimesheet] Filtered lokasi by cabang: {
  userCabangId: "2",
  userCabangNama: "Cabang Jakarta",
  totalLokasi: 50,
  filteredCount: 15
}

[CreateTimesheet] Lokasi data for bottom sheet: {
  source: 'offline',
  type: 'lokasi_asal',
  totalData: 50,
  filteredData: 15,
  userCabang: "Cabang Jakarta",
  sample: { id: 7, nama: 'STOCK PILE', cabang_id: 2, ... }
}
```

### When Data Loaded

```javascript
[CreateTimesheet] Offline state updated: {
  kegiatan: 50,
  material: 30,
  lokasi: 50
}

[CreateTimesheet] Lokasi IDs: [
  { id: '7', nama: 'STOCK PILE', cabang_id: 2 },
  { id: '26', nama: '1B', cabang_id: 2 },
  { id: '27', nama: '3B', cabang_id: 3 },
  ...
]

[CreateTimesheet] Lokasi filter preview: {
  total: 50,
  filteredForUserCabang: 15,
  userCabang: "Cabang Jakarta"
}
```

## Empty State Handling

### When No Lokasi for User's Cabang

**UI Message:**
```
Tidak ada lokasi untuk cabang [Cabang Name]. 
Coba ganti sumber data.
```

**Example:**
```
Tidak ada lokasi untuk cabang Jakarta. 
Coba ganti sumber data.
```

**Causes:**
1. User's cabang tidak memiliki lokasi di database
2. Data belum di-sync
3. Filter terlalu strict (possible data issue)

## Testing Guide

### Test 1: User dengan Cabang Jakarta (ID: 2)

**Setup:**
```javascript
employee = {
  nama: "John Doe",
  cabang: {
    id: 2,
    nama: "Cabang Jakarta"
  }
}

lokasi = [
  { id: 1, nama: 'PIT A', cabang_id: 2 },  // ✅ Match
  { id: 2, nama: 'PIT B', cabang_id: 2 },  // ✅ Match
  { id: 3, nama: 'PIT C', cabang_id: 3 },  // ❌ No match
  { id: 4, nama: 'PIT D', cabang_id: 1 },  // ❌ No match
]
```

**Expected Result:**
- User sees: PIT A, PIT B (2 items)
- User does NOT see: PIT C, PIT D

**Steps:**
1. Login sebagai user dengan cabang Jakarta
2. Buka Create Timesheet
3. Tap "Lokasi Asal"
4. Verify hanya melihat lokasi dengan cabang_id = 2

### Test 2: User dengan Cabang Bandung (ID: 3)

**Setup:**
```javascript
employee = {
  nama: "Jane Doe",
  cabang: {
    id: 3,
    nama: "Cabang Bandung"
  }
}
```

**Expected Result:**
- User sees: PIT C (1 item)
- User does NOT see: PIT A, PIT B, PIT D

### Test 3: Multiple Cabang Same Location

**Setup:**
```javascript
lokasi = [
  { id: 5, nama: 'CRUSHER', cabang_id: 2 },
  { id: 6, nama: 'CRUSHER', cabang_id: 3 },  // Same name, different cabang
]

employee_jakarta = { cabang: { id: 2 } }
employee_bandung = { cabang: { id: 3 } }
```

**Expected Result:**
- Jakarta user sees: CRUSHER (ID: 5)
- Bandung user sees: CRUSHER (ID: 6)

### Test 4: No Employee Data

**Setup:**
```javascript
employee = null
// or
employee = { cabang: null }
// or
employee = { cabang: { id: null } }
```

**Expected Result:**
- Filter disabled
- User sees ALL lokasi (no filter)
- Console log: "No employee cabang data, returning all lokasi"

### Test 5: Online/Offline Toggle

**Steps:**
1. Open "Lokasi Asal" picker (offline mode)
2. Verify filtered data
3. Toggle to online mode
4. Verify filtered data (should be same)
5. Toggle back to offline
6. Verify filtered data (should be consistent)

## Debug Commands

### Check Employee Data

```javascript
// In React Native Debugger or console:
const employee = store.getState().auth.employee;
console.log('Employee:', employee);
console.log('Cabang ID:', employee?.cabang?.id);
console.log('Cabang Nama:', employee?.cabang?.nama);
```

### Check Lokasi Data

```javascript
// Check Redux lokasi
const lokasiList = store.getState().lokasi.data;
console.log('Total lokasi:', lokasiList.length);
console.log('Sample:', lokasiList[0]);

// Check filtered
const filtered = lokasiList.filter(l => 
  l.cabang_id?.toString() === employee.cabang.id.toString()
);
console.log('Filtered for user cabang:', filtered.length);
console.log('Filtered items:', filtered);
```

### Check SQLite Data

```javascript
import SQLiteService from '@/src/database/SQLiteService';

const lokasi = await SQLiteService.getLokasi();
console.log('SQLite lokasi:', lokasi.length);

// Check cabang_id distribution
const cabangGroups = lokasi.reduce((acc, l) => {
  const cid = l.cabang_id || 'null';
  acc[cid] = (acc[cid] || 0) + 1;
  return acc;
}, {});
console.log('Lokasi per cabang:', cabangGroups);
// Output: { '2': 15, '3': 10, '1': 5, ... }
```

## Troubleshooting

### Issue 1: All Lokasi Filtered Out (Empty List)

**Symptoms:**
- Bottom sheet shows "Tidak ada lokasi untuk cabang X"
- Console shows: filteredCount: 0

**Diagnosis:**
```javascript
// Check if employee.cabang.id matches any lokasi.cabang_id
const employee = store.getState().auth.employee;
const lokasi = store.getState().lokasi.data;

console.log('User cabang_id:', employee.cabang.id);
console.log('Lokasi cabang_ids:', [...new Set(lokasi.map(l => l.cabang_id))]);
```

**Possible Causes:**
1. ❌ User's cabang_id tidak ada di data lokasi
2. ❌ Type mismatch (number vs string)
3. ❌ Data belum di-sync

**Solutions:**
1. Verify data di database
2. Force refresh data
3. Check if cabang_id is null/undefined

### Issue 2: Filter Not Applied

**Symptoms:**
- User sees ALL lokasi (not filtered)
- Console shows: "No employee cabang data, returning all lokasi"

**Diagnosis:**
```javascript
const employee = store.getState().auth.employee;
console.log('Employee:', employee);
console.log('Has cabang?', !!employee?.cabang);
console.log('Has cabang.id?', !!employee?.cabang?.id);
```

**Possible Causes:**
1. ❌ Employee data not loaded
2. ❌ Employee.cabang is null
3. ❌ Employee.cabang.id is undefined

**Solutions:**
1. Verify login successful
2. Check auth state in Redux
3. Re-login to refresh employee data

### Issue 3: Wrong Lokasi Shown

**Symptoms:**
- User sees lokasi dari cabang lain

**Diagnosis:**
```javascript
// Check filter logic
const employee = store.getState().auth.employee;
const lokasi = store.getState().lokasi.data;

const userCabangId = employee.cabang.id.toString();
const wrongItems = lokasi.filter(l => 
  l.cabang_id?.toString() !== userCabangId
);

console.log('Wrong items shown:', wrongItems);
```

**Possible Causes:**
1. ❌ Filter function not called
2. ❌ Type conversion issue
3. ❌ Stale data in state

**Solutions:**
1. Check console logs for filter calls
2. Force re-render component
3. Clear cache & reload data

## Performance Considerations

### Filter Performance

**Current Implementation:**
```javascript
// O(n) - Linear time
const filtered = lokasiData.filter(item => 
  item.cabang_id?.toString() === userCabangId
);
```

**Performance:**
- Typical dataset: 50-200 lokasi
- Filter time: <1ms (negligible)
- Re-filter on every render: ✅ Acceptable (pure function)

### Optimization (Future)

If dataset grows (>1000 items), consider:

1. **Memoization:**
```javascript
import { useMemo } from 'react';

const filteredLokasi = useMemo(() => 
  filterLokasiByUserCabang(lokasiData),
  [lokasiData, employee?.cabang?.id]
);
```

2. **Pre-filtered State:**
```javascript
// Store filtered data separately
const [filteredLokasi, setFilteredLokasi] = useState([]);

useEffect(() => {
  setFilteredLokasi(filterLokasiByUserCabang(offlineLokasi));
}, [offlineLokasi, employee?.cabang?.id]);
```

## Future Enhancements

### 1. Multi-Cabang Support

Allow user dengan multiple cabang to see lokasi from all their cabangs:

```javascript
employee = {
  cabangs: [
    { id: 2, nama: 'Jakarta' },
    { id: 3, nama: 'Bandung' }
  ]
}

const filtered = lokasi.filter(l => 
  employee.cabangs.some(c => c.id.toString() === l.cabang_id?.toString())
);
```

### 2. Admin Override

Admin user bisa lihat ALL lokasi:

```javascript
const filterLokasiByUserCabang = (lokasiData) => {
  // Admin bypass filter
  if (employee?.role === 'admin' || employee?.is_admin) {
    return lokasiData;
  }
  
  // Normal filter for regular users
  return lokasiData.filter(...);
};
```

### 3. Cross-Cabang Lokasi

Support lokasi yang accessible dari multiple cabang:

```javascript
lokasi = {
  id: 1,
  nama: 'CRUSHER REGIONAL',
  cabang_ids: [2, 3, 5],  // Multiple cabang
  primary_cabang_id: 2
}

const filtered = lokasi.filter(l => {
  if (l.cabang_ids) {
    return l.cabang_ids.includes(userCabangId);
  }
  return l.cabang_id === userCabangId;
});
```

## Changelog

### v1.2.0 (Current)
- ✅ Implemented lokasi filter by user cabang
- ✅ Added local filter function
- ✅ Added Redux selector
- ✅ Enhanced empty state message
- ✅ Added comprehensive logging

### v1.1.0 (Previous)
- Fixed lokasi picker empty issue
- Added offline support

---

**Implementation Date:** 2025-10-18  
**Status:** ✅ IMPLEMENTED  
**Version:** v1.2.0  
**Author:** AI Assistant
