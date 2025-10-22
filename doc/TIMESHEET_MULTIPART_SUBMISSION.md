# Timesheet Submission - Multipart Form Data

## Overview

Timesheet submission sekarang menggunakan **multipart/form-data** untuk support file upload (foto) dan mengirim data dalam format yang kompatibel dengan backend API.

## Implementation

### File Modified
**`src/redux/timesheetItemSlice.js`** - submitTimesheet thunk

### Changes

#### Before (JSON)
```javascript
export const submitTimesheet = createAsyncThunk(
  'timesheetItem/submitTimesheet',
  async (formData, { rejectWithValue }) => {
    const response = await ApiFetch.post('/operation/timesheet', formData);
    // Sent as JSON
  }
);
```

#### After (Multipart Form-Data)
```javascript
export const submitTimesheet = createAsyncThunk(
  'timesheetItem/submitTimesheet',
  async (formData, { rejectWithValue }) => {
    // Create FormData
    const dataForm = new FormData();
    
    // Add all fields
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      
      if (key === 'kegiatan' || key === 'items') {
        dataForm.append(key, JSON.stringify(value));
      } else if (key === 'foto' || key === 'photo') {
        // Handle file uploads
        if (value && value.uri) {
          dataForm.append('foto', {
            uri: value.uri,
            type: value.type || 'image/jpeg',
            name: value.name || 'photo.jpg',
          });
        }
      } else {
        dataForm.append(key, value.toString());
      }
    });
    
    // Submit with multipart headers
    const response = await ApiFetch.post(
      'operation/timesheet',
      dataForm,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
);
```

## Data Structure

### FormData Fields

| Field | Type | Format | Example |
|-------|------|--------|---------|
| id | String | Plain | "123" |
| tanggal | String | Date | "2025-10-18" |
| penyewa_id | String | Number | "48" |
| equipment_id | String | Number | "48" |
| shift_id | String | Number | "1" |
| smustart | String | Number | "2000.00" |
| smufinish | String | Number | "2100.00" |
| usedsmu | String | Number | "100" |
| bbm | String | Number | "0.00" |
| keterangan | String | Text | "Test timesheet" |
| kegiatan | String | JSON | "[{...}, {...}]" |
| items | String | JSON | "[{...}, {...}]" |
| foto | File/Object | File | { uri, type, name } |

### Kegiatan Array (Sent as JSON string)

```javascript
dataForm.append('kegiatan', JSON.stringify([
  {
    id: "temp_123",
    kegiatan_id: 13,
    material_id: 7,
    lokasi_asal_id: 1,
    lokasi_tujuan_id: 2,
    starttime: "07:00",
    endtime: "15:00",
    starttime_full: "2025-10-18 07:00:00",
    endtime_full: "2025-10-18 15:00:00",
    smustart: 2000,
    smufinish: 2100,
    quantity: 10,
    // ... other fields
  },
  // ... more kegiatan items
]));
```

### Photo Upload (Multiple Files)

```javascript
// Single photo
dataForm.append('foto', {
  uri: 'file:///path/to/photo.jpg',
  type: 'image/jpeg',
  name: 'photo.jpg',
});

// Multiple photos
photos.forEach((photo, index) => {
  dataForm.append(`foto[${index}]`, {
    uri: photo.uri,
    type: photo.type || 'image/jpeg',
    name: photo.name || `photo_${index}.jpg`,
  });
});
```

## API Request

### HTTP Request
```http
POST /operation/timesheet HTTP/1.1
Host: api.example.com
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Cache-Control: no-cache
Authorization: Bearer <token>

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="tanggal"

2025-10-18
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="penyewa_id"

48
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="kegiatan"

[{"id":"temp_123","kegiatan_id":13,...}]
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="foto"; filename="photo.jpg"
Content-Type: image/jpeg

<binary data>
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

## Code Flow

### Create Timesheet Flow

```
User Fills Form
    ↓
User Taps "Simpan"
    ↓
Validation (Yup schema)
    ↓
dispatch(submitTimesheet(formData))
    ↓
Create FormData Object
    ↓
Add All Fields
    ├─ Primitive values → .toString()
    ├─ kegiatan array → JSON.stringify()
    ├─ items array → JSON.stringify()
    └─ foto files → File objects
    ↓
POST /operation/timesheet
    ↓
    ├─ Success → Navigate back
    │            Show success alert
    │
    └─ Network Error → Save to SQLite outbox
                       Show offline message
```

### Edit Timesheet Flow

```
User Edits Timesheet
    ↓
dispatch(submitTimesheet(formData))
    ↓
Create FormData Object
    ↓
PUT /operation/timesheet/{id}
    ↓
    ├─ Success → Navigate back
    └─ Error → Show error message
```

## Field Mapping

### Fields Sent to Server

**Basic Fields:**
```javascript
{
  id: formData.id,
  tanggal: formData.tanggal,
  date_ops: formData.date_ops,
  penyewa_id: formData.penyewa_id,
  equipment_id: formData.equipment_id,
  shift_id: formData.shift_id,
  karyawan_id: formData.karyawan_id,
  smustart: formData.smustart,
  smufinish: formData.smufinish,
  usedsmu: formData.usedsmu,
  bbm: formData.bbm,
  longshift: formData.longshift,
  keterangan: formData.keterangan,
  status: formData.status,
  // ... other fields
}
```

**Complex Fields (JSON stringified):**
```javascript
{
  kegiatan: JSON.stringify(formData.kegiatan),
  items: JSON.stringify(formData.items),
}
```

**Files:**
```javascript
{
  foto: {
    uri: 'file://...',
    type: 'image/jpeg',
    name: 'photo.jpg'
  }
}
```

### Fields NOT Sent (Display Objects)

These are excluded from submission:
```javascript
{
  equipment: { ... },      // Display only
  karyawan: { ... },       // Display only
  penyewa: { ... },        // Display only
  pelanggan: { ... },      // Display only
  shift: { ... },          // Display only
  longshift_obj: { ... },  // Display only
  activity_obj: { ... },   // Display only
  
  // Display fields (redundant with _id fields)
  operator_nama: "...",
  penyewa_nama: "...",
  equipment_nama: "...",
  shift_nama: "...",
  cabang_nama: "...",
}
```

## Error Handling

### Network Error (Offline Queue)

```javascript
try {
  const response = await ApiFetch.post(...);
  return response.data;
} catch (error) {
  if (error.message === 'Network Error') {
    // Save to SQLite outbox
    const SQLiteService = await import('@/src/database/SQLiteService');
    await SQLiteService.outboxEnqueue('timesheet', uniqueKey, formData);
    return rejectWithValue('Disimpan ke antrian offline');
  }
  
  return rejectWithValue(error.message);
}
```

### Server Error (5xx)

```javascript
const code = error?.response?.status;

if (code && code >= 500) {
  // Save to offline queue
  await SQLiteService.outboxEnqueue('timesheet', uniqueKey, formData);
  return rejectWithValue('Disimpan ke antrian offline');
}
```

### Validation Error (4xx)

```javascript
if (code && code >= 400 && code < 500) {
  // Show validation error to user
  const message = error?.response?.data?.message;
  return rejectWithValue(message);
}
```

## Photo Upload Support

### Single Photo

```javascript
// In form state
form.foto = {
  uri: 'file:///storage/emulated/0/DCIM/Camera/IMG_001.jpg',
  type: 'image/jpeg',
  name: 'IMG_001.jpg',
};

// In FormData
dataForm.append('foto', {
  uri: form.foto.uri,
  type: form.foto.type,
  name: form.foto.name,
});
```

### Multiple Photos

```javascript
// In form state
form.foto = [
  { uri: 'file://...photo1.jpg', type: 'image/jpeg', name: 'photo1.jpg' },
  { uri: 'file://...photo2.jpg', type: 'image/jpeg', name: 'photo2.jpg' },
];

// In FormData
form.foto.forEach((photo, index) => {
  dataForm.append(`foto[${index}]`, {
    uri: photo.uri,
    type: photo.type,
    name: photo.name,
  });
});
```

## Console Logging

### Success Flow
```
[submitTimesheet] Preparing data for submission...
[submitTimesheet] FormData prepared, submitting...
[submitTimesheet] Submission successful: { success: true, ... }
```

### Offline Queue Flow
```
[submitTimesheet] Preparing data for submission...
[submitTimesheet] FormData prepared, submitting...
[submitTimesheet] Submission failed: Network Error
[submitTimesheet] Saving to offline queue...
[SQLiteService] Outbox enqueue: timesheet_1697654321_0.123
```

### Error Flow
```
[submitTimesheet] Preparing data for submission...
[submitTimesheet] FormData prepared, submitting...
[submitTimesheet] Submission failed: Validation Error
Error: Penyewa wajib diisi
```

## Testing Guide

### Test 1: Submit New Timesheet (Online)

**Steps:**
1. Fill all required fields
2. Add kegiatan items
3. Tap "Simpan"

**Expected:**
- FormData created with all fields
- POST request with multipart/form-data
- Success response
- Navigate back to list
- Alert: "TimeSheet berhasil disimpan"

**Verify:**
```javascript
// Check console
[submitTimesheet] Preparing data for submission...
[submitTimesheet] FormData prepared, submitting...
[submitTimesheet] Submission successful: { ... }
```

### Test 2: Submit with Photo

**Steps:**
1. Fill form
2. Upload photo
3. Tap "Simpan"

**Expected:**
- FormData includes photo file
- Photo uploaded to server
- Success response

**Verify:**
```javascript
// Check FormData
dataForm has 'foto' field with:
{
  uri: "file://...",
  type: "image/jpeg",
  name: "photo.jpg"
}
```

### Test 3: Submit Offline (Network Error)

**Steps:**
1. Turn off WiFi/data
2. Fill form
3. Tap "Simpan"

**Expected:**
- Network error caught
- Data saved to SQLite outbox
- Alert: "Disimpan ke antrian offline"

**Verify:**
```javascript
const outbox = await SQLiteService.outboxList('timesheet');
console.log('Outbox items:', outbox.length); // Should be > 0
```

### Test 4: Edit Existing Timesheet

**Steps:**
1. Open existing timesheet
2. Modify fields
3. Tap "Simpan"

**Expected:**
- FormData created
- PUT request to /operation/timesheet/{id}
- Success response

**Verify:**
```javascript
// Check request
PUT /operation/timesheet/123
Content-Type: multipart/form-data
```

## Backend Requirements

### API Endpoint

```
POST /operation/timesheet
PUT /operation/timesheet/{id}
```

### Expected Headers

```
Content-Type: multipart/form-data
Cache-Control: no-cache
Authorization: Bearer <token>
```

### Expected Fields

The backend should expect:
- All primitive fields as strings
- `kegiatan` as JSON string (needs JSON.parse)
- `items` as JSON string (needs JSON.parse)
- `foto` as file upload

### Backend Processing Example (PHP)

```php
// Get form data
$tanggal = $_POST['tanggal'];
$penyewa_id = $_POST['penyewa_id'];
$kegiatan = json_decode($_POST['kegiatan'], true); // Parse JSON

// Handle file upload
if (isset($_FILES['foto'])) {
    $foto = $_FILES['foto'];
    $uploadPath = 'uploads/' . $foto['name'];
    move_uploaded_file($foto['tmp_name'], $uploadPath);
}
```

## Troubleshooting

### Issue 1: FormData Empty

**Symptom:** Server receives empty request

**Diagnosis:**
```javascript
// Add logging before submit
console.log('FormData keys:', Object.keys(formData));
console.log('FormData values:', formData);
```

**Solution:**
- Ensure form is populated
- Check all required fields exist

### Issue 2: Photo Not Uploaded

**Symptom:** Photo field is empty on server

**Diagnosis:**
```javascript
// Check photo format
console.log('Photo:', form.foto);
// Should be: { uri: '...', type: '...', name: '...' }
```

**Solution:**
- Ensure photo has uri, type, name
- Check file permissions
- Verify file exists at uri

### Issue 3: Kegiatan Not Parsed

**Symptom:** Backend can't parse kegiatan array

**Diagnosis:**
```javascript
// Check JSON structure
console.log('Kegiatan JSON:', JSON.stringify(formData.kegiatan));
```

**Solution:**
- Backend needs to JSON.parse the kegiatan field
- Ensure kegiatan is valid JSON

## Future Enhancements

### 1. Progress Indicator for Upload

```javascript
const response = await ApiFetch.post(
  'operation/timesheet',
  dataForm,
  {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log('Upload progress:', percentCompleted + '%');
    },
  }
);
```

### 2. Compress Images Before Upload

```javascript
import * as ImageManipulator from 'expo-image-manipulator';

const compressedImage = await ImageManipulator.manipulateAsync(
  photo.uri,
  [{ resize: { width: 1024 } }],
  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
);

dataForm.append('foto', {
  uri: compressedImage.uri,
  type: 'image/jpeg',
  name: 'photo.jpg',
});
```

### 3. Retry Failed Submissions

```javascript
const retrySubmission = async () => {
  const outbox = await SQLiteService.outboxList('timesheet');
  
  for (const item of outbox) {
    try {
      const payload = JSON.parse(item.payload);
      await dispatch(submitTimesheet(payload)).unwrap();
      await SQLiteService.outboxDelete(item.id);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }
};
```

## Changelog

### v1.2.1 (Current)
- ✅ Implemented multipart/form-data submission
- ✅ Added photo upload support
- ✅ Enhanced error handling
- ✅ Added comprehensive logging

### v1.2.0 (Previous)
- Lokasi filter by cabang
- Auto-sync on login

---

**Implementation Date:** 2025-10-18  
**Status:** ✅ IMPLEMENTED  
**Version:** v1.2.1  
**Author:** AI Assistant
