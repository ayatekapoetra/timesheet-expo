# Lokasi Kerja - Debugging Guide

## Masalah
Lokasi kerja tidak tampil di bottom sheet pada kegiatan items (lokasi_asal & lokasi_tujuan)

## Perbaikan yang Sudah Dilakukan

### 1. Preserve Source State (CRITICAL FIX)
**Masalah:** Ketika user tap lokasi_asal atau lokasi_tujuan, `setKegiatanPicker()` tidak menyertakan property `source`, sehingga nilai source menjadi undefined.

**Perbaikan di `app/timesheet/create.jsx`:**
```javascript
// SEBELUM (SALAH):
setKegiatanPicker({
  visible: true,
  kegiatanId: item.id,
  type: 'lokasi_asal',
  // source hilang!
});

// SESUDAH (BENAR):
setKegiatanPicker((prev) => ({
  visible: true,
  kegiatanId: item.id,
  type: 'lokasi_asal',
  source: prev.source, // preserve source
}));
```

### 2. Normalisasi Data di getLokasiOffline
**Masalah:** Data lokasi dari SQLite mungkin memiliki struktur yang tidak konsisten (id bisa number atau string)

**Perbaikan di `src/redux/lokasiSlice.js`:**
```javascript
export const getLokasiOffline = createAsyncThunk(
  'lokasi/getLokasiOffline',
  async () => {
    const dbData = await SQLiteService.getLokasi();
    // Normalize data
    const normalized = dbData.map(item => ({
      ...item,
      id: item.id?.toString?.() || item.id,
      nama: item.nama || '',
    }));
    return normalized;
  }
);
```

### 3. Enhanced Logging
Menambahkan comprehensive logging di berbagai layer:

**SQLiteService.js:**
```javascript
async getLokasi() {
  const result = await this.getAll('lokasis');
  console.log('[SQLiteService] getLokasi returned:', result.length, 'items');
  if (result.length > 0) {
    console.log('[SQLiteService] Sample lokasi:', result[0]);
  }
  return result;
}
```

**lokasiSlice.js:**
```javascript
.addCase(getLokasiOffline.fulfilled, (state, action) => {
  console.log('[lokasiSlice] Redux state updated:', action.payload.length);
  state.data = action.payload;
});
```

**create.jsx:**
```javascript
// Monitor Redux lokasiList
useEffect(() => {
  console.log('[CreateTimesheet] lokasiList updated:', lokasiList?.length);
  if (lokasiList?.length > 0) {
    console.log('[CreateTimesheet] Sample:', lokasiList[0]);
  }
}, [lokasiList]);

// Monitor offline state
useEffect(() => {
  console.log('[CreateTimesheet] offlineLokasi updated:', offlineLokasi.length);
  if (offlineLokasi.length > 0) {
    console.log('[CreateTimesheet] Sample:', offlineLokasi[0]);
  }
}, [offlineLokasi]);
```

### 4. Removed Filter yang Berlebihan
**SEBELUM:**
```javascript
data={
  kegiatanPicker.source === 'online' 
    ? (lokasiList || []) 
    : ((offlineLokasi || []).filter(x => x && x.id)) // filter ini bisa menghilangkan data valid
}
```

**SESUDAH:**
```javascript
data={(() => {
  const lokasiData = kegiatanPicker.source === 'online' 
    ? (lokasiList || []) 
    : (offlineLokasi || []);
  console.log('[CreateTimesheet] Lokasi data:', {
    source: kegiatanPicker.source,
    length: lokasiData.length
  });
  return lokasiData;
})()}
```

### 5. Enhanced Debug Panel
Menambahkan detail sample data di debug panel:
```javascript
if (lk.length > 0) {
  debugMsg += `\n\nSample Lokasi (SQLite):\nID: ${lk[0].id}\nNama: ${lk[0].nama}`;
}
```

## Cara Testing Step-by-Step

### Step 1: Download Data Lokasi
1. Buka app → Settings → Download Data
2. Scroll ke item "Lokasi"
3. Tap untuk download individual ATAU tap "Download Semua Data"
4. Tunggu status berubah menjadi ✓ (success)
5. Cek console log untuk konfirmasi:
   ```
   [downloadSlice] Successfully synced lokasi to SQLite: { successCount: X }
   ```

### Step 2: Verifikasi Data di SQLite
1. Buka Create Timesheet page
2. Tap debug panel "Tap untuk lihat data status"
3. Cek Alert dialog:
   - **SQLite Lokasi:** harus > 0
   - **Redux Lokasi:** harus > 0 (jika sudah load)
   - **Offline State Lokasi:** harus > 0
   - **Sample Lokasi:** harus tampil ID dan Nama

### Step 3: Test Lokasi Picker
1. Di Create Timesheet, isi data berikut:
   - Tanggal
   - Penyewa
   - Equipment (PENTING!)
   - Shift

2. Scroll ke section "Kegiatan #1"

3. Tap field **"Lokasi Asal"**

4. Perhatikan bottom sheet yang muncul:
   - Header harus menunjukkan "Pilih Lokasi Asal"
   - Toggle source harus muncul (icon cloud/server)
   - Current mode harus "Offline" (default)
   - List harus menampilkan data lokasi

5. Jika list kosong:
   - Tap toggle source untuk ganti ke "Online"
   - Jika tetap kosong, cek console log

### Step 4: Analisa Console Log

Cari log pattern berikut di console:

#### Saat buka picker:
```
[CreateTimesheet] Opening Lokasi Asal picker, current source: offline
[CreateTimesheet] Lokasi data for bottom sheet: { 
  source: 'offline', 
  type: 'lokasi_asal', 
  dataLength: 30 
}
[BottomSheetPicker] Data updated: { 
  title: 'Pilih Lokasi Asal', 
  length: 30 
}
```

#### Saat load data:
```
[CreateTimesheet] offlineLokasi updated: 30 items
[CreateTimesheet] Sample offline lokasi: { id: '1', nama: 'PIT 2A4' }
[SQLiteService] getLokasi returned: 30 items
[lokasiSlice] Redux state updated with offline data: 30 items
```

## Troubleshooting

### Issue 1: Bottom Sheet Kosong (Offline Mode)
**Diagnosis:**
```javascript
// Cek console log saat buka picker
[CreateTimesheet] Lokasi data for bottom sheet: { dataLength: 0 }
```

**Kemungkinan Penyebab:**
1. ❌ Data belum di-download
2. ❌ SQLite sync gagal
3. ❌ Offline state (offlineLokasi) kosong
4. ❌ Source mode tidak ter-preserve

**Solusi:**
```javascript
// 1. Download data lagi
// 2. Cek debug panel untuk konfirmasi SQLite count
// 3. Tap refresh button di header
// 4. Toggle source switch beberapa kali
```

### Issue 2: Bottom Sheet Kosong (Online Mode)
**Diagnosis:**
```javascript
// Cek Redux state
[CreateTimesheet] lokasiList (Redux) updated: 0 items
```

**Kemungkinan Penyebab:**
1. ❌ API endpoint error
2. ❌ Network offline
3. ❌ Redux thunk tidak dipanggil
4. ❌ Token expired

**Solusi:**
```javascript
// 1. Cek network status
// 2. Re-login
// 3. Cek API response di Network tab
// 4. Dispatch getLokasi() manual
```

### Issue 3: Source Mode Berubah ke Undefined
**Diagnosis:**
```javascript
[CreateTimesheet] Opening Lokasi Asal picker, current source: undefined
```

**Kemungkinan Penyebab:**
❌ `setKegiatanPicker()` tidak preserve `prev.source`

**Solusi:**
Sudah diperbaiki! Pastikan semua `setKegiatanPicker()` menggunakan:
```javascript
setKegiatanPicker((prev) => ({
  ...props,
  source: prev.source // WAJIB
}));
```

### Issue 4: Data Ada di SQLite tapi Tidak Muncul
**Diagnosis:**
```javascript
// SQLite punya data
[SQLiteService] getLokasi returned: 30 items

// Tapi offline state kosong
[CreateTimesheet] offlineLokasi updated: 0 items
```

**Kemungkinan Penyebab:**
❌ `loadMasterData()` tidak memanggil SQLite read
❌ `setOfflineLokasi()` tidak dipanggil

**Solusi:**
```javascript
// Cek loadMasterData() di create.jsx
const loadMasterData = async () => {
  const SQLiteService = (await import('@/src/database/SQLiteService')).default;
  const lk = await SQLiteService.getLokasi();
  setOfflineLokasi(lk || []); // PASTIKAN INI DIPANGGIL
};
```

### Issue 5: Filter Menghilangkan Data Valid
**Diagnosis:**
```javascript
// Sebelum filter: 30 items
// Sesudah filter: 0 items
```

**Kemungkinan Penyebab:**
❌ Filter `.filter(x => x && x.id)` menghilangkan data dengan id = 0 atau false

**Solusi:**
SUDAH DIPERBAIKI! Filter sudah dihapus di line 768.

## Data Flow Lokasi

```
User Tap "Lokasi Asal"
         ↓
setKegiatanPicker({
  visible: true,
  type: 'lokasi_asal',
  source: prev.source ← PRESERVE!
})
         ↓
BottomSheetPicker Render
         ↓
    source === 'offline'?
    Yes ↓       ↓ No
offlineLokasi  lokasiList (Redux)
         ↓          ↓
    Display in FlatList
```

## Expected Console Output (Success Case)

```
[CreateTimesheet] Initial SQLite data loaded: { lokasi: 30 }
[CreateTimesheet] offlineLokasi updated: 30 items
[CreateTimesheet] Sample offline lokasi: { id: '1', nama: 'PIT 2A4', ... }

[User taps Lokasi Asal]

[CreateTimesheet] Opening Lokasi Asal picker, current source: offline
[CreateTimesheet] Lokasi data for bottom sheet: {
  source: 'offline',
  type: 'lokasi_asal',
  dataLength: 30,
  sample: { id: '1', nama: 'PIT 2A4' }
}
[BottomSheetPicker] Rendered: {
  visible: true,
  title: 'Pilih Lokasi Asal',
  dataLength: 30,
  sourceMode: 'offline',
  firstItem: { id: '1', nama: 'PIT 2A4' }
}
[BottomSheetPicker] Data updated: {
  title: 'Pilih Lokasi Asal',
  length: 30,
  sample: { id: '1', nama: 'PIT 2A4' }
}
```

## Success Criteria

✅ Debug panel menunjukkan SQLite Lokasi > 0
✅ Debug panel menunjukkan Offline State Lokasi > 0
✅ Console log tidak ada error saat download
✅ Console log menunjukkan "Opening Lokasi Asal picker, current source: offline"
✅ Console log menunjukkan "Lokasi data for bottom sheet: { dataLength: > 0 }"
✅ Bottom sheet menampilkan list lokasi
✅ Bisa search lokasi
✅ Bisa select lokasi dan nama tersimpan di form
✅ Toggle source switch berfungsi (online ↔ offline)

## Files Modified

1. `app/timesheet/create.jsx` - Fixed setKegiatanPicker to preserve source
2. `src/redux/lokasiSlice.js` - Added normalization in getLokasiOffline
3. `src/database/SQLiteService.js` - Enhanced getLokasi logging
4. `src/components/BottomSheetPicker.jsx` - Enhanced data logging

## Next Actions if Still Fails

1. Clear app data & reinstall
2. Check SQLite database file directly with inspector tool
3. Add breakpoint in BottomSheetPicker render
4. Verify API response structure matches expected format
5. Test with mock data to isolate issue (DB vs UI)
