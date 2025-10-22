# Camera Loading State Implementation

## Overview
Implementasi loading state pada tombol "Ambil Foto" yang akan disabled dan menampilkan loading indicator saat menunggu response dari backend setelah check-in/check-out.

## Perubahan yang Dilakukan

### File: `app/absensi/camera-screen.jsx`

#### 1. Import ActivityIndicator
```javascript
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator  // ← Added
} from 'react-native';
```

#### 2. State Management
```javascript
const [ready, setReady] = useState(false);
const [isProcessing, setIsProcessing] = useState(false); // ← New state
```

#### 3. Button dengan Loading State
```javascript
<TouchableOpacity
  style={[
    styles.shutter,
    isProcessing && styles.shutterDisabled  // Tambah style disabled
  ]}
  onPress={async () => {
    if (isProcessing) return;  // Prevent double tap
    
    try {
      if (cameraRef.current) {
        setIsProcessing(true);  // Set loading true
        const photo = await cameraRef.current.takePhoto({ flash: 'off' });
        
        // onCapture akan handle submit ke backend
        // Loading state akan tetap aktif sampai backend response
        onCapture && await onCapture(photo);
        
        // Reset processing state setelah backend response
        setIsProcessing(false);
      }
    } catch (e) {
      setIsProcessing(false);  // Reset on error
      Alert.alert('Gagal mengambil foto');
    }
  }}
  disabled={isProcessing}  // Disable button saat processing
>
  {isProcessing ? (
    // Show loading indicator
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#FFFFFF" />
      <Text style={styles.loadingText}>Memproses...</Text>
    </View>
  ) : (
    // Show normal text
    <Text style={styles.shutterText}>Ambil Foto</Text>
  )}
</TouchableOpacity>
```

#### 4. Styles Baru
```javascript
shutter: {
  width: 140,
  height: 44,
  borderRadius: 22,
  backgroundColor: '#10B981',
  alignItems: 'center',
  justifyContent: 'center',
},
shutterDisabled: {
  backgroundColor: '#6B7280',  // Gray background when disabled
  opacity: 0.7,
},
shutterText: {
  color: 'white',
  fontWeight: '600',
},
loadingContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
loadingText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 14,
},
```

## Flow Diagram

```
User tap "Ambil Foto"
  ↓
Check if isProcessing (prevent double tap)
  ↓
setIsProcessing(true)
  ↓
Button → Disabled
Button → Show loading (spinner + "Memproses...")
Button → Background color gray
  ↓
Take photo from camera
  ↓
await onCapture(photo)
  ├─ Save to AsyncStorage
  ├─ Submit FormData to backend
  ├─ Wait for response (422, 200, etc)
  └─ Handle response/error
  ↓
setIsProcessing(false)
  ↓
Button → Enabled
Button → Show "Ambil Foto"
Button → Background color green
```

## Visual States

### State 1: Normal (Idle)
```
┌────────────────────────┐
│   🟢 Ambil Foto        │  ← Green background
└────────────────────────┘
   Enabled, tappable
```

### State 2: Processing (Loading)
```
┌────────────────────────┐
│   ⏳ Memproses...      │  ← Gray background, opacity 0.7
└────────────────────────┘
   Disabled, spinner visible
```

### State 3: After Success/Error
```
┌────────────────────────┐
│   🟢 Ambil Foto        │  ← Back to green
└────────────────────────┘
   Enabled again
```

## Backend Integration

### Check-In Flow dengan Loading
```javascript
// 1. User tap "Ambil Foto"
setIsProcessing(true);

// 2. Take photo
const photo = await cameraRef.current.takePhoto();

// 3. Submit to backend (button tetap disabled)
await onCapture(photo);
  ├─ handleCheckIn(photo)
  │   ├─ Create FormData
  │   ├─ POST /mobile/check-in-mobile/karyawan
  │   └─ Wait for response
  │
  ├─ Response Success (200)
  │   └─ Show success modal
  │
  └─ Response Error (422, 500, etc)
      └─ Show error modal with diagnostic message

// 4. Reset loading state
setIsProcessing(false);
```

## Error Handling

### Scenario 1: Photo Capture Error
```javascript
try {
  setIsProcessing(true);
  const photo = await cameraRef.current.takePhoto();
} catch (e) {
  setIsProcessing(false);  // ← Reset immediately
  Alert.alert('Gagal mengambil foto');
}
```

### Scenario 2: Backend Error (422)
```javascript
try {
  await handleCheckIn(photo);  // Will throw error
} catch (error) {
  // Error handled in handleCheckIn
  // Modal akan muncul dengan pesan dari backend
} finally {
  setIsProcessing(false);  // ← Reset after backend response
}
```

### Scenario 3: Network Error
```javascript
try {
  await apiFetch.post(...);
} catch (error) {
  // Network timeout atau connection lost
  setModal({ 
    title: 'Error', 
    body: error.message || 'Gagal terhubung ke server'
  });
} finally {
  setIsProcessing(false);  // ← Reset
}
```

## User Experience

### Before (Without Loading State)
- ❌ User tap "Ambil Foto"
- ❌ Bisa tap berkali-kali (double submit)
- ❌ Tidak ada feedback saat menunggu
- ❌ User bingung apakah sudah diproses

### After (With Loading State)
- ✅ User tap "Ambil Foto"
- ✅ Button langsung disabled (prevent double tap)
- ✅ Show "Memproses..." dengan spinner
- ✅ Visual feedback yang jelas
- ✅ Button enabled kembali setelah response

## Testing

### Manual Testing Steps

1. **Test Normal Flow**
   ```
   - Tap "Ambil Foto"
   - Verify: Button berubah jadi "Memproses..." dengan spinner
   - Verify: Button disabled (tidak bisa tap lagi)
   - Wait for backend response
   - Verify: Button kembali enabled dengan text "Ambil Foto"
   ```

2. **Test Double Tap Prevention**
   ```
   - Tap "Ambil Foto"
   - Cepat tap lagi berkali-kali
   - Verify: Hanya 1 request yang terkirim
   - Verify: Button tetap disabled sampai response
   ```

3. **Test Error Handling**
   ```
   - Matikan koneksi internet
   - Tap "Ambil Foto"
   - Verify: Button jadi "Memproses..."
   - Wait for timeout
   - Verify: Error modal muncul
   - Verify: Button kembali enabled
   ```

4. **Test Backend Error (422)**
   ```
   - Tap "Ambil Foto" (dengan data yang akan error 422)
   - Verify: Button jadi "Memproses..."
   - Backend return 422 dengan diagnostic message
   - Verify: Modal muncul dengan pesan error dari backend
   - Verify: Button kembali enabled
   ```

5. **Test Success Response**
   ```
   - Tap "Ambil Foto"
   - Verify: Loading state aktif
   - Backend return 200 success
   - Verify: Success modal muncul
   - Verify: Button enabled (jika masih di camera screen)
   ```

## Console Logs untuk Debugging

```javascript
// When button pressed
console.log('📸 Taking photo, isProcessing:', true);

// When photo taken
console.log('📸 Photo captured, submitting to backend...');

// When backend responds
console.log('✅ Backend response received');
console.log('📸 Reset isProcessing:', false);

// On error
console.error('❌ Error occurred');
console.log('📸 Reset isProcessing:', false);
```

## Props Flow

### CameraScreen Component
```javascript
<CameraScreen
  type="in"
  onClose={() => setShowCamera(false)}
  onCapture={async (photo) => {
    // This is ASYNC - will wait for backend
    await handleCheckIn(photo);
    
    // Button loading state will reset after this completes
  }}
/>
```

### Internal Flow
```javascript
// Inside CameraScreen
const handleShutterPress = async () => {
  setIsProcessing(true);  // 1. Set loading
  
  const photo = await takePhoto();  // 2. Take photo
  
  await onCapture(photo);  // 3. Wait for parent handler (backend call)
  
  setIsProcessing(false);  // 4. Reset loading after backend response
};
```

## Performance Considerations

1. **Prevent Memory Leaks**
   - Loading state direset di `finally` block
   - Component unmount tidak akan cause error

2. **User Feedback**
   - Immediate visual feedback (< 100ms)
   - Spinner untuk indicate progress
   - Disabled state untuk prevent confusion

3. **Network Handling**
   - Timeout handling di backend call
   - Error recovery dengan reset state
   - Clear error messages untuk user

## Future Improvements

1. ✅ Add progress bar untuk upload photo
2. ✅ Show upload percentage
3. ✅ Retry mechanism untuk failed uploads
4. ✅ Cancel upload functionality
5. ✅ Offline queue untuk check-in/check-out

## Dependencies

- ✅ React Native `ActivityIndicator` (built-in)
- ✅ No additional packages required

## Notes

- Loading state tetap aktif sampai `onCapture` promise resolved/rejected
- Parent component (`index.jsx`) menghandle backend call dengan `await`
- Error handling sudah proper dengan diagnostic message support
- Button color berubah untuk visual feedback yang jelas