# Check-In & Check-Out Implementation

## Overview
Implementasi fitur check-in dan check-out karyawan dengan upload foto selfie menggunakan endpoint `/mobile/check-in-mobile/karyawan` dan `/mobile/check-out-mobile/karyawan`.

## Perubahan yang Dilakukan

### File: `app/absensi/index.jsx`

#### 1. State Management Baru
```javascript
const { user, employee } = useAppSelector(state => state.auth);
const [isSubmitting, setIsSubmitting] = useState(false);
```

#### 2. Fungsi Check-In
```javascript
const handleCheckIn = async (photo) => {
  // Get device unique ID
  const uniqueId = await DeviceInfo.getUniqueId();
  
  // Get current location
  const location = await Location.getCurrentPositionAsync({ 
    accuracy: Location.Accuracy.Balanced 
  });
  
  // Create FormData
  const formData = new FormData();
  
  // Add photo selfie
  formData.append('photo', {
    uri: `file://${photo.path}`,
    type: 'image/jpeg',
    name: `checkin_${Date.now()}.jpg`,
  });
  
  // Add pin dari employee
  formData.append('pin', employee?.pin || '');
  
  // Add device_id
  formData.append('device_id', uniqueId);
  
  // Add location (optional)
  formData.append('latitude', location.coords.latitude.toString());
  formData.append('longitude', location.coords.longitude.toString());
  
  // Submit to API
  const response = await apiFetch.post('/mobile/check-in-mobile/karyawan', formData);
}
```

#### 3. Fungsi Check-Out
```javascript
const handleCheckOut = async (photo) => {
  // Similar to handleCheckIn but uses different endpoint
  const response = await apiFetch.post('/mobile/check-out-mobile/karyawan', formData);
}
```

#### 4. Update onCapture Handler
```javascript
onCapture={async (photo) => {
  await AsyncStorage.setItem('@last_selfie', JSON.stringify(photo));
  
  // Submit check-in/check-out
  if (camType === 'in') {
    await handleCheckIn(photo);
  } else {
    await handleCheckOut(photo);
  }
  
  setShowCamera(false);
}}
```

#### 5. Loading State pada Buttons
```javascript
<TouchableOpacity
  disabled={isSubmitting}
  style={{ opacity: isSubmitting ? 0.6 : 1 }}>
  <Text>{isSubmitting ? 'Memproses...' : 'Check In'}</Text>
</TouchableOpacity>
```

## API Endpoints

### Check-In Endpoint
```
POST /mobile/check-in-mobile/karyawan
```

**FormData Parameters:**
- `photo` (file) - Foto selfie karyawan (JPEG)
- `pin` (string) - PIN karyawan dari `employee.pin`
- `device_id` (string) - Unique device ID
- `latitude` (string) - Latitude lokasi check-in (optional)
- `longitude` (string) - Longitude lokasi check-in (optional)

**Headers:**
```javascript
{
  'Content-Type': 'multipart/form-data'
}
```

### Check-Out Endpoint
```
POST /mobile/check-out-mobile/karyawan
```

**FormData Parameters:** (sama dengan Check-In)
- `photo` (file) - Foto selfie karyawan (JPEG)
- `pin` (string) - PIN karyawan dari `employee.pin`
- `device_id` (string) - Unique device ID
- `latitude` (string) - Latitude lokasi check-out (optional)
- `longitude` (string) - Longitude lokasi check-out (optional)

## Flow Proses

### Check-In Flow
1. User tap tombol **"Check In"**
2. Validasi:
   - ✅ Fake GPS check
   - ✅ Radius check (dalam area checklog)
   - ✅ Device ID match check
   - ✅ Camera permission
3. Buka kamera selfie (front camera)
4. User ambil foto selfie
5. Foto disimpan ke AsyncStorage
6. Submit FormData ke endpoint check-in:
   - Photo selfie
   - PIN karyawan
   - Device ID
   - Lokasi GPS (lat/lng)
7. Tampilkan success/error message
8. Tutup kamera

### Check-Out Flow
(Sama dengan Check-In flow, tapi menggunakan endpoint check-out)

## Error Handling

### Client-Side Validation Errors
```javascript
// Fake GPS detected
'System Detect Fake GPS'

// Outside radius
'Posisi anda berada diluar lokasi Checklog'

// Device ID mismatch
'Perangkat yang anda gunakan tidak terdaftar'

// Camera permission denied
'Izin kamera diperlukan untuk melanjutkan'
```

### API Errors
```javascript
// Handle API response errors
let errorMessage = 'Gagal melakukan check-in';
if (error?.response?.data?.message) {
  errorMessage = error.response.data.message;
} else if (error?.response?.data?.error) {
  errorMessage = error.response.data.error;
}
```

## Console Logging

### Check-In Logs
```
📸 Submitting Check-In: {
  pin: "123456",
  device_id: "abc123xyz",
  latitude: -6.123456,
  longitude: 106.123456
}

✅ Check-In Response: {...}
```

### Error Logs
```
❌ Check-In Error: {...}
```

## Testing

### Manual Testing Steps

1. **Test Check-In Normal Flow**
   ```
   - Login ke aplikasi
   - Pastikan berada di area checklog
   - Tap "Check In"
   - Ambil foto selfie
   - Verify: Muncul "Check-In berhasil dicatat"
   ```

2. **Test Check-Out Normal Flow**
   ```
   - Login ke aplikasi
   - Pastikan sudah check-in sebelumnya
   - Tap "Check Out"
   - Ambil foto selfie
   - Verify: Muncul "Check-Out berhasil dicatat"
   ```

3. **Test Fake GPS Detection**
   ```
   - Enable fake GPS
   - Tap "Check In"
   - Verify: Muncul warning "System Detect Fake GPS"
   ```

4. **Test Outside Radius**
   ```
   - Berada di luar area checklog
   - Tap "Check In"
   - Verify: Muncul "Posisi anda berada diluar lokasi Checklog"
   ```

5. **Test Device ID Mismatch**
   ```
   - Login dengan device berbeda
   - Tap "Check In"
   - Verify: Muncul warning device tidak terdaftar
   ```

6. **Test Without PIN**
   ```
   - Employee tidak punya PIN
   - Tap "Check In"
   - Verify: Request tetap terkirim dengan pin kosong
   ```

### Backend Testing dengan Postman

```bash
POST /mobile/check-in-mobile/karyawan

FormData:
- photo: [file] checkin_selfie.jpg
- pin: "123456"
- device_id: "abc123xyz"
- latitude: "-6.123456"
- longitude: "106.123456"

Headers:
- Authorization: Bearer <token>
```

## Data Flow Diagram

```
User → Tap Check-In
  ↓
Validations (GPS, Radius, Device ID)
  ↓
Open Camera (Front)
  ↓
Take Selfie Photo
  ↓
Create FormData:
  - photo (file)
  - pin (from employee)
  - device_id (from DeviceInfo)
  - latitude/longitude (from Location)
  ↓
POST /mobile/check-in-mobile/karyawan
  ↓
Backend Process
  ↓
Response Success/Error
  ↓
Show Modal (Success/Error)
  ↓
Close Camera
```

## Dependencies

- ✅ `react-native-device-info` - Get unique device ID
- ✅ `expo-location` - Get GPS coordinates
- ✅ `react-native-vision-camera` - Take selfie photo
- ✅ `@react-native-async-storage/async-storage` - Save last selfie
- ✅ `axios` (ApiFetch) - API calls

## Security Features

1. **Fake GPS Detection** - Prevent location spoofing
2. **Radius Validation** - Ensure user is in checklog area
3. **Device ID Verification** - Prevent device switching
4. **Photo Requirement** - Mandatory selfie for attendance
5. **PIN Verification** - Employee authentication

## Troubleshooting

### Photo tidak terkirim
**Penyebab**: Format URI foto tidak sesuai
**Solusi**: 
```javascript
// Pastikan URI menggunakan file:// prefix
uri: `file://${photo.path}`
```

### Device ID tidak match
**Penyebab**: User ganti device atau data tidak sync
**Solusi**: Hubungi HRD untuk reset device ID

### Check-In gagal meskipun di area
**Penyebab**: Data koordinat checklog belum tersinkron
**Solusi**: 
```javascript
// Refresh koordinat checklog dari server
await AsyncStorage.removeItem('@koordinatChecklog');
// Re-fetch data
```

### Response 401 Unauthorized
**Penyebab**: Token expired atau tidak valid
**Solusi**: Re-login user

## Future Improvements

1. ✅ Offline mode support (save to local, sync later)
2. ✅ Photo preview before submit
3. ✅ History check-in/check-out
4. ✅ Push notification after successful check-in
5. ✅ Face recognition validation
6. ✅ QR Code attendance option

## Notes

- **Check-Out endpoint** mungkin perlu disesuaikan jika backend menggunakan endpoint berbeda
- **PIN validation** dilakukan di backend, pastikan backend handle empty PIN
- **Location data** bersifat optional, tapi recommended untuk audit trail
- **Photo size** pastikan backend dapat handle file size yang besar (compress jika perlu)