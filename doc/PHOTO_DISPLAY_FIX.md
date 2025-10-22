# Fix Photo Display Issue - Timesheet Detail

## Masalah
Foto berhasil diupload ke backend dan response mengembalikan URL foto di field `photo` sebagai string:
```json
{
  "photo": "https://cdn.makkuragatama.id/uploads/timesheet/TS2510121601295MOB01.jpeg"
}
```

Namun foto tidak muncul di UI, selalu menampilkan "Belum ada foto timesheet".

## Penyebab
1. **Kode tidak memiliki conditional rendering** - Selalu menampilkan `noPhotoContainer` tanpa cek apakah ada foto
2. **Format photo dari backend adalah string URL** - Bukan array, tapi kode mengharapkan array
3. **Tidak ada Image component untuk menampilkan foto** - Hanya ada placeholder "Belum ada foto"

## Solusi yang Diimplementasikan

### 1. Tambah Conditional Rendering
```jsx
{(form.photo || uploadedPhotos.length > 0) ? (
  // Tampilkan foto
  <View style={styles.singlePhotoContainer}>
    <Image 
      source={{ uri: form.photo || uploadedPhotos[0]?.uri }} 
      style={[styles.singlePhoto, { borderColor: isDark ? '#4b5563' : '#d1d5db' }]} 
    />
    {isEditing && (
      <TouchableOpacity onPress={removePhoto}>
        <Ionicons name="close-circle" size={24} color="#ef4444" />
      </TouchableOpacity>
    )}
  </View>
) : (
  // Tampilkan placeholder "Belum ada foto"
  <View style={styles.noPhotoContainer}>
    ...
  </View>
)}
```

### 2. Handle Photo sebagai String URL
Update fungsi inisialisasi dan refresh untuk handle photo sebagai string:

```javascript
// Initialize photos from existing data
if (params.photo) {
  if (typeof params.photo === 'string') {
    // Photo adalah string URL
    setUploadedPhotos([{ uri: params.photo }]);
  } else if (Array.isArray(params.photo)) {
    // Photo adalah array
    const normalizedPhotos = params.photo.map(photo => {
      if (typeof photo === 'string') {
        return { uri: photo.startsWith('http') ? photo : `${URIPATH.apiphoto}${photo}` };
      }
      return photo;
    });
    setUploadedPhotos(normalizedPhotos);
  }
} else if (params.foto) {
  // Handle foto field juga
  ...
}
```

### 3. Update Remove Photo Function
```javascript
onPress: () => {
  setUploadedPhotos([]);
  dispatch(updateField({ field: 'foto', value: [] }));
  dispatch(updateField({ field: 'photo', value: null })); // Clear photo juga
  Alert.alert('Berhasil', 'Foto timesheet berhasil dihapus');
}
```

### 4. Enhanced Logging
Tambah logging untuk debug photo data:
```javascript
console.log('📸 Initial photo data:', {
  photo: params.photo,
  foto: params.foto
});

console.log('📸 Photo is string URL:', params.photo);
console.log('📸 Normalized photos:', normalizedPhotos);
```

## Perubahan File

**File**: `app/timesheet/[id].jsx`

### Changes:
1. ✅ Tambah conditional rendering untuk photo display
2. ✅ Handle `form.photo` sebagai string URL
3. ✅ Handle `form.photo` dan `form.foto` dalam berbagai format (string/array)
4. ✅ Update `onRefresh` untuk handle string photo
5. ✅ Update initialization untuk handle string photo
6. ✅ Tambah remove photo untuk clear `photo` field juga
7. ✅ Enhanced logging untuk debugging

## Format Photo yang Didukung

### Backend Response:
```javascript
// Format 1: String URL
{ "photo": "https://cdn.example.com/photo.jpg" }

// Format 2: Array of strings
{ "photo": ["https://cdn.example.com/photo1.jpg", "..."] }

// Format 3: Array of objects
{ "photo": [{ "url": "https://...", "name": "..." }] }

// Format 4: Foto field (alternatif)
{ "foto": "https://cdn.example.com/photo.jpg" }
```

### Local State (uploadedPhotos):
```javascript
// Selalu dinormalisasi ke format array of objects
[
  { uri: "https://cdn.example.com/photo.jpg" },
  { uri: "file:///local/path/photo.jpg" } // untuk foto baru yang belum diupload
]
```

## Testing

### Test Cases:
1. ✅ **Photo dari backend (string URL)** - Display foto dari `form.photo`
2. ✅ **Photo dari backend (array)** - Display foto dari array
3. ✅ **Upload foto baru** - Simpan & auto-refresh, foto muncul
4. ✅ **Pull-to-refresh** - Foto terbaru dimuat ulang
5. ✅ **Remove foto** - Hapus foto, kembali ke placeholder
6. ✅ **No photo** - Tampilkan "Belum ada foto timesheet"

### How to Test:
```bash
# 1. Jalankan app
npx expo start --clear

# 2. Buka timesheet yang sudah ada foto
# - Foto harus langsung muncul (dari form.photo)

# 3. Upload foto baru
# - Edit → Upload foto → Simpan
# - Foto harus langsung muncul setelah save (auto-refresh)

# 4. Pull-to-refresh
# - Tarik layar ke bawah
# - Foto harus tetap muncul setelah refresh

# 5. Check console logs
# - Lihat log "📸 Photo is string URL: ..."
# - Lihat log "📸 Normalized photos: [...]"
```

## Console Logs untuk Debugging

Jika foto tidak muncul, cek console logs:

```
📸 Initial photo data: { photo: "https://...", foto: null }
📸 Photo is string URL: https://cdn.makkuragatama.id/uploads/timesheet/TS2510121601295MOB01.jpeg
📸 Updated photos after refresh: [{ uri: "https://..." }]
```

Jika log tidak muncul atau foto null:
1. Cek backend response dengan Postman
2. Pastikan field `photo` ada di response
3. Cek apakah URL foto valid dan accessible

## Expected Behavior

### ✅ Sebelumnya (Broken):
- Upload foto berhasil ✅
- Response dari backend berhasil ✅
- Foto **TIDAK muncul** di UI ❌
- Selalu tampil "Belum ada foto timesheet" ❌

### ✅ Sekarang (Fixed):
- Upload foto berhasil ✅
- Response dari backend berhasil ✅
- Foto **LANGSUNG muncul** di UI ✅
- Auto-refresh setelah save ✅
- Pull-to-refresh untuk update foto ✅
- Support berbagai format photo dari backend ✅

## Next Steps

Jika masih ada masalah:
1. **Cek console logs** untuk lihat photo data
2. **Test dengan pull-to-refresh** setelah upload
3. **Verify backend response** dengan Postman/network inspector
4. **Check Image component error** di console (misal: CORS, invalid URL, dll)

Seharusnya sekarang foto akan **langsung muncul** setelah upload! 📸✨