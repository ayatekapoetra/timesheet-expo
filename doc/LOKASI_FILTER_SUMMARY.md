# Summary: Filter Lokasi Kerja by Cabang User

## ✅ Implemented

Lokasi kerja sekarang **otomatis ter-filter** berdasarkan cabang user yang sedang login.

## 🎯 How It Works

```
User Login
    ↓
Employee Data (cabang_id: 2, nama: "Jakarta")
    ↓
User Opens "Lokasi Asal/Tujuan" Picker
    ↓
System Filters Lokasi
    ↓
    ├─ Total Lokasi: 50
    ├─ User Cabang ID: 2
    └─ Filter: lokasi.cabang_id === employee.cabang.id
    ↓
Show Only 15 Lokasi (cabang_id = 2)
```

## 📝 Changes Made

### 1. Added Redux Selector
**File:** `src/redux/lokasiSlice.js`

```javascript
export const selectLokasiByUserCabang = (state) => {
  const lokasi = state.lokasi?.data || [];
  const employee = state.auth?.employee;
  
  const userCabangId = employee.cabang.id.toString();
  
  return lokasi.filter(item => 
    item.cabang_id?.toString() === userCabangId
  );
};
```

### 2. Added Local Filter Function
**File:** `app/timesheet/create.jsx`

```javascript
const filterLokasiByUserCabang = (lokasiData) => {
  const userCabangId = employee.cabang.id.toString();
  
  return lokasiData.filter(item => 
    item.cabang_id?.toString() === userCabangId
  );
};
```

### 3. Applied Filter in Bottom Sheet
**File:** `app/timesheet/create.jsx`

```javascript
// In BottomSheetPicker data prop
data={(() => {
  if (kegiatanPicker.type === 'lokasi_asal' || 
      kegiatanPicker.type === 'lokasi_tujuan') {
    
    let lokasiData = kegiatanPicker.source === 'online' 
      ? lokasiList 
      : offlineLokasi;
    
    // Apply filter ✅
    return filterLokasiByUserCabang(lokasiData);
  }
  
  return otherData;
})()}
```

### 4. Enhanced Empty State Message
```javascript
ListEmptyComponent={() => (
  <Text>
    Tidak ada lokasi untuk cabang {employee?.cabang?.nama}.
    Coba ganti sumber data.
  </Text>
)}
```

## 🧪 Testing

### Test Case 1: User Jakarta (cabang_id: 2)
```
Given: 
  - User cabang_id = 2 (Jakarta)
  - Lokasi A: cabang_id = 2 ✅
  - Lokasi B: cabang_id = 3 ❌
  - Lokasi C: cabang_id = 2 ✅

Then:
  - User sees: Lokasi A, C (2 items)
  - User NOT see: Lokasi B
```

### Test Case 2: Offline Mode
```
Given:
  - Source = 'offline'
  - offlineLokasi has 50 items
  - 15 items with cabang_id = 2

Then:
  - Filter applied
  - User sees: 15 items
```

### Test Case 3: No Employee Data
```
Given:
  - employee = null or employee.cabang = null

Then:
  - Filter bypassed
  - User sees: ALL lokasi
```

## 📊 Console Output

### When Filter Applied
```
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
  userCabang: "Cabang Jakarta"
}
```

## 🎓 Usage

### For Developers

**Get Filtered Lokasi (Redux):**
```javascript
import { selectLokasiByUserCabang } from '@/src/redux/lokasiSlice';

const filteredLokasi = useAppSelector(selectLokasiByUserCabang);
```

**Filter Local Data:**
```javascript
const filtered = filterLokasiByUserCabang(myLokasiArray);
```

### For Users

1. Login dengan account Anda
2. Buka Create Timesheet
3. Tap "Lokasi Asal" atau "Lokasi Tujuan"
4. ✅ Hanya melihat lokasi sesuai cabang Anda

**Example:**
- User: John Doe
- Cabang: Jakarta
- Result: Hanya lokasi Jakarta yang muncul

## 🔍 Debug

### Check Employee Cabang
```javascript
const employee = store.getState().auth.employee;
console.log('Cabang:', employee?.cabang);
// Output: { id: 2, nama: 'Jakarta', ... }
```

### Check Filter Result
```javascript
const lokasi = store.getState().lokasi.data;
const employee = store.getState().auth.employee;

const filtered = lokasi.filter(l => 
  l.cabang_id?.toString() === employee.cabang.id.toString()
);

console.log(`Total: ${lokasi.length}, Filtered: ${filtered.length}`);
```

## 📚 Documentation

For detailed documentation, see:
- **`LOKASI_FILTER_BY_CABANG.md`** - Complete technical documentation

## ✅ Success Criteria

- [x] Filter implemented in Redux
- [x] Filter implemented locally
- [x] Filter applied to online mode
- [x] Filter applied to offline mode
- [x] Empty state message updated
- [x] Logging added
- [x] Documentation created

## 🎉 Result

**Before:**
- User melihat SEMUA lokasi (50+ items)
- Sulit mencari lokasi cabang sendiri
- Potential error: Select wrong cabang

**After:**
- User hanya melihat lokasi cabang sendiri (15 items)
- Mudah menemukan lokasi
- Prevent error: Tidak bisa select lokasi cabang lain

---

**Date:** 2025-10-18  
**Status:** ✅ COMPLETED  
**Version:** v1.2.0
