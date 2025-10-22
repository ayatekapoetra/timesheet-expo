# Offline Mode Debugging Guide

## Problem
When offline, bottom sheet pickers (kegiatan, material, lokasi) show empty data despite SQLite being populated.

## Recent Fixes Applied

### 1. SQLiteService.js
- ✅ Added `ensureInitialized()` calls to `getAll()` and `query()` methods
- ✅ Fixed error handling in `syncLokasi()` to prevent crashes on null data

### 2. Redux Slices
- ✅ Fixed syntax errors (extra closing braces) in all slices
- ✅ Added `getKegiatanOffline()`, `getMaterialOffline()`, `getLokasiOffline()` thunks
- ✅ Added AsyncStorage caching as fallback
- ✅ Fixed lokasiSlice missing extraReducers for offline thunk
- ✅ Added ID normalization for lokasi data

### 3. BottomSheetPicker Component
- ✅ Added `enableSourceSwitch` prop to show online/offline toggle
- ✅ Added `sourceMode` prop to track current mode ('online' or 'offline')
- ✅ Added `onChangeSource` callback for mode switching
- ✅ Enhanced logging to track data flow

### 4. CreateTimesheetPage
- ✅ Changed default source mode to 'offline'
- ✅ Added offline state management (offlineKegiatan, offlineMaterial, offlineLokasi)
- ✅ Load SQLite data directly on mount
- ✅ Added debug panel to check data counts
- ✅ Enhanced logging throughout

## How to Test

### Step 1: Download Data
1. Open the app and navigate to Settings > Download Data
2. Tap "Download Semua Data" button
3. Wait for all items to show success status
4. Check console logs for sync confirmation:
   ```
   [downloadSlice] Successfully synced kegiatan to SQLite
   [downloadSlice] Successfully synced material to SQLite
   [downloadSlice] Successfully synced lokasi to SQLite
   ```

### Step 2: Verify SQLite Data
1. Go to Create Timesheet page
2. Tap the "Tap untuk lihat data status" info panel
3. Check the alert dialog shows:
   - SQLite counts (should be > 0 if download succeeded)
   - Redux counts
   - Offline state counts

### Step 3: Test Offline Mode
1. On Create Timesheet page, select an equipment (this sets the kategori filter)
2. Tap "Jenis Kegiatan" field
3. In the bottom sheet:
   - Check the source switch shows "Offline" icon (server-outline)
   - Verify data appears in the list
   - Try toggling to "Online" mode to compare

### Step 4: Check Console Logs
Look for these key log patterns:

#### Data Loading:
```
[CreateTimesheet] Initial SQLite data loaded: { kegiatan: 50, material: 20, lokasi: 30 }
[CreateTimesheet] Offline state updated: { kegiatan: 50, material: 20, lokasi: 30 }
```

#### Source Toggle:
```
[CreateTimesheet] Source changed to: offline
[CreateTimesheet] SQLite data loaded: { kegiatan: 50, material: 20, lokasi: 30 }
[BottomSheetPicker] Rendered: { visible: true, dataLength: 50, sourceMode: 'offline' }
```

## Common Issues & Solutions

### Issue 1: Empty Data Despite Download Success
**Symptoms:**
- Download shows success
- SQLite debug shows count = 0
- Bottom sheet shows empty

**Diagnosis:**
```javascript
// Check if SQLite is actually initialized
const db = await SQLiteService.getKegiatan();
console.log('DB data:', db);
```

**Solution:**
- Ensure `ensureInitialized()` is called before queries
- Check `syncKegiatan()` is not throwing silent errors
- Verify API response structure matches expected format

### Issue 2: Filtering Removes All Data
**Symptoms:**
- Data shows in offline mode
- Selecting equipment makes data disappear
- Console shows "Filtered kegiatan for category X: 0 items"

**Diagnosis:**
The `selectKegiatanByEquipmentCategory` selector filters by `grpequipment` field.

**Solution:**
Check SQLite data structure:
```javascript
const kg = await SQLiteService.getKegiatan();
console.log('Sample kegiatan:', kg[0]);
// Should have: { id, nama, grpequipment: 'HE' | 'DT' | ... }
```

Ensure equipment kategori matches:
```javascript
// Equipment should have kategori: 'HE', 'DT', etc.
// Kegiatan should have grpequipment: 'HE', 'DT', etc.
```

### Issue 3: Data Doesn't Update After Toggle
**Symptoms:**
- Toggling source switch doesn't change data
- Bottom sheet stays empty or shows old data

**Diagnosis:**
```javascript
// Check if state is updating
useEffect(() => {
  console.log('Offline state changed:', offlineKegiatan.length);
}, [offlineKegiatan]);
```

**Solution:**
- Ensure `setOfflineKegiatan()` is called with fresh data
- Check `onChangeSource` handler is firing
- Verify SQLite returns data (not empty array)

### Issue 4: Redux vs Local State Mismatch
**Symptoms:**
- Redux state has data but bottom sheet is empty
- Or vice versa

**Current Implementation:**
- Redux state: Used for online mode
- Local state (offlineKegiatan, etc.): Used for offline mode
- Bottom sheet: Switches between them based on `sourceMode`

**Verification:**
```javascript
// In create.jsx, check both sources
console.log('Redux kegiatan:', kegiatanList?.length);
console.log('Local kegiatan:', offlineKegiatan?.length);
console.log('Current source:', kegiatanPicker.source);
```

## Data Flow Diagram

```
User Opens Create Timesheet
         ↓
loadMasterData() fires
         ↓
    ┌────┴────┐
    ↓         ↓
SQLite    Check Network
 Load         ↓
    ↓     If Online
    ↓    Fetch API
    ↓         ↓
    └────┬────┘
         ↓
  Set Offline State
  (offlineKegiatan, etc.)
         ↓
  Dispatch Redux Actions
         ↓
User Taps Kegiatan Field
         ↓
Bottom Sheet Opens
         ↓
   Source = offline?
    Yes ↓   ↓ No
Offline  Redux
  State   State
    ↓      ↓
 Display Data
```

## Equipment Category Filtering

When selecting kegiatan, the app filters based on equipment category:

```javascript
// Equipment has kategori field
{ id: 1, kode: 'EX001', kategori: 'HE' }

// Kegiatan has grpequipment field
{ id: 10, nama: 'LOADING', grpequipment: 'HE' }

// Filter matches: kategori === grpequipment
```

Categories:
- `HE` - Heavy Equipment (Excavator, Loader, etc.)
- `DT` - Dump Truck
- `BR` - Barging

If equipment kategori is not selected, filtering may fail.

## Next Steps If Still Not Working

1. **Verify API Response Structure**
   - Check if API returns data in expected format
   - Log raw response in downloadSlice

2. **Test SQLite Directly**
   - Use SQLite browser tool to inspect database
   - Check table schemas match service expectations

3. **Simplify Data Flow**
   - Remove Redux, load directly from SQLite
   - Bypass filtering temporarily to isolate issue

4. **Add More Granular Logging**
   - Log every step of data transformation
   - Track data from API → sync → SQLite → retrieval → display

5. **Check React Native Debugger**
   - Use Redux DevTools to inspect state changes
   - Use SQLite Inspector to view database content

## Files Modified in This Session

1. `src/database/SQLiteService.js` - Added ensureInitialized() calls
2. `src/redux/kegiatanSlice.js` - Fixed syntax, added offline thunk
3. `src/redux/materialSlice.js` - Fixed syntax, added offline thunk
4. `src/redux/lokasiSlice.js` - Added offline thunk and extraReducers
5. `src/components/BottomSheetPicker.jsx` - Added source switch UI
6. `app/timesheet/create.jsx` - Implemented offline mode with debug panel

## Success Criteria

✅ Download Data shows all items as "success"
✅ Debug panel shows SQLite counts > 0
✅ Bottom sheet shows data in offline mode
✅ Toggling source switch updates data
✅ Filtering by equipment kategori works
✅ Can select items and submit timesheet offline
