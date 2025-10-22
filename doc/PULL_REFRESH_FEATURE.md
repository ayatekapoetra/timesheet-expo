# Pull-to-Refresh Feature untuk Timesheet Detail

## Ringkasan Implementasi

Menambahkan fitur pull-to-refresh pada halaman detail timesheet untuk memuat ulang data dari server saat dalam mode online, khususnya untuk memperbarui foto timesheet setelah upload.

## Perubahan yang Dilakukan

### 1. Import Dependencies
```javascript
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
```

### 2. State Management Baru
```javascript
const [refreshing, setRefreshing] = useState(false);
const [isOnline, setIsOnline] = useState(true);
```

### 3. Network Status Monitoring
```javascript
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected);
  });

  return () => unsubscribe();
}, []);
```

### 4. Fungsi Refresh
```javascript
const onRefresh = useCallback(async () => {
  if (!isOnline) {
    Alert.alert('Offline', 'Tidak dapat memuat ulang data saat offline');
    return;
  }

  setRefreshing(true);
  try {
    const timesheetId = form?.id || timesheet?.id;
    
    // Fetch fresh data from API
    const response = await ApiFetch.get(`operation/timesheet/${timesheetId}`);
    
    if (response.data && response.data.data) {
      const freshData = response.data.data;
      
      // Update local state
      setTimesheetData(freshData);
      dispatch(setTimesheet(freshData));
      
      // Update photos dengan normalisasi URL
      let photos = [];
      if (freshData.foto && Array.isArray(freshData.foto)) {
        photos = freshData.foto;
      } else if (freshData.photo && Array.isArray(freshData.photo)) {
        photos = freshData.photo;
      }
      
      const normalizedPhotos = photos.map(photo => {
        if (typeof photo === 'string') {
          return { uri: photo.startsWith('http') ? photo : `${URIPATH.apiphoto}${photo}` };
        } else if (photo.url) {
          return { uri: photo.url.startsWith('http') ? photo.url : `${URIPATH.apiphoto}${photo.url}` };
        } else if (photo.uri) {
          return photo;
        }
        return photo;
      });
      
      setUploadedPhotos(normalizedPhotos);
    }
  } catch (error) {
    Alert.alert('Error', 'Gagal memuat ulang data timesheet');
  } finally {
    setRefreshing(false);
  }
}, [isOnline, form, timesheet, dispatch]);
```

### 5. ScrollView dengan RefreshControl
```javascript
<ScrollView
  style={[styles.container, { backgroundColor: isDark ? '#1F2937' : '#f2f4f7' }]}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      enabled={isOnline && !isEditing}
      colors={['#2563eb']}
      tintColor="#2563eb"
      title={isOnline ? "Tarik untuk memuat ulang..." : "Offline"}
      titleColor={isDark ? '#9ca3af' : '#6b7280'}
    />
  }>
```

### 6. Auto-Refresh Setelah Save
```javascript
// Di dalam handleSave setelah upload berhasil
setIsEditing(false);
setIsSaving(false);

// Refresh data after successful save
await onRefresh();

Alert.alert(
  'Berhasil',
  'Timesheet berhasil diperbarui. Data telah dimuat ulang.',
  [{ text: 'OK' }]
);
```

## Fitur Utama

### ✅ Pull-to-Refresh
- Tarik layar ke bawah untuk memuat ulang data
- Hanya aktif saat **online mode**
- Hanya aktif saat **tidak dalam mode edit**
- Menampilkan indikator loading saat refresh

### ✅ Auto-Refresh After Save
- Setelah berhasil upload foto, data otomatis di-refresh
- Foto yang baru diupload langsung muncul tanpa perlu back & masuk lagi
- Alert menginformasikan bahwa data telah dimuat ulang

### ✅ Offline Handling
- Deteksi status koneksi secara real-time
- Tampilkan pesan jika user mencoba refresh saat offline
- Disable pull-to-refresh saat offline

### ✅ Photo Normalization
- Mendukung berbagai format foto dari backend:
  - String URL langsung
  - Object dengan property `url`
  - Object dengan property `uri`
- Auto-prepend base URL jika foto adalah path relatif
- Logging untuk debugging foto yang dimuat

## Cara Menggunakan

### 1. Refresh Manual
1. Buka halaman detail timesheet
2. Tarik layar ke bawah (pull down)
3. Data akan dimuat ulang dari server
4. Foto terbaru akan muncul jika ada perubahan

### 2. Auto-Refresh After Upload
1. Edit timesheet
2. Upload foto baru
3. Klik Simpan
4. Data otomatis di-refresh
5. Foto baru langsung muncul di UI

## Debugging

### Console Logs
```
🔄 Refreshing timesheet data for ID: xxx
✅ Fresh data received: {...}
📸 Updated photos after refresh: [...]
❌ Error refreshing timesheet: ...
```

### Troubleshooting

**Foto tidak muncul setelah save:**
1. Cek console log untuk melihat response dari backend
2. Pastikan backend mengembalikan URL foto yang benar
3. Cek format foto yang dikembalikan backend (string atau object)

**Pull-to-refresh tidak bekerja:**
1. Pastikan device dalam online mode
2. Pastikan tidak dalam edit mode
3. Cek network status di console

**Error saat refresh:**
1. Cek endpoint API: `GET operation/timesheet/:id`
2. Pastikan backend endpoint tersedia
3. Cek authorization token masih valid

## Dependencies

- ✅ `@react-native-community/netinfo`: ^11.4.1 (sudah terinstall)
- ✅ React Native `RefreshControl` (built-in)

## File yang Dimodifikasi

- `app/timesheet/[id].jsx` - Halaman detail timesheet

## Testing Checklist

- [ ] Pull-to-refresh saat online
- [ ] Pull-to-refresh disabled saat offline
- [ ] Pull-to-refresh disabled saat edit mode
- [ ] Auto-refresh setelah save berhasil
- [ ] Foto muncul setelah upload
- [ ] Foto muncul setelah pull-to-refresh
- [ ] Error handling saat refresh gagal
- [ ] Network status detection bekerja

## Next Steps

Jika foto masih tidak muncul setelah implementasi ini:
1. Periksa format response dari backend
2. Pastikan backend mengembalikan URL foto yang lengkap
3. Cek apakah foto di-save dengan benar di backend
4. Test dengan Postman untuk melihat response backend