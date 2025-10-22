# Photo Upload Fix Summary

## Changes Made

### 1. Enhanced Photo Format Handling
Updated the FormData creation logic in `app/timesheet/[id].jsx` to better handle different photo formats:

```javascript
// Handle photos with proper React Native file format
if (key === 'foto') {
  if (Array.isArray(value) && value.length > 0) {
    value.forEach((photo, index) => {
      if (photo && photo.uri) {
        // React Native FormData file object format
        // Try different approaches for photo format
        let photoFile;
        
        if (photo.uri.startsWith('file://')) {
          // Local file - use as-is
          photoFile = {
            uri: photo.uri,
            type: 'image/jpeg',
            name: photo.fileName || photo.name || `photo_${index}.jpg`,
          };
        } else {
          // Asset from ImagePicker - ensure proper format
          photoFile = {
            uri: photo.uri,
            type: photo.type || 'image/jpeg',
            name: photo.fileName || photo.name || `photo_${index}.jpg`,
          };
        }
        
        dataForm.append(`foto[]`, photoFile);
      }
    });
  }
}
```

### 2. Updated API Call Configuration
Modified the API call to handle FormData properly:

```javascript
const response = await ApiFetch.post(
  `operation/timesheet/${timesheetId}/mytimesheet`,
  dataForm,
  {
    headers: {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data', // Explicitly set for React Native
    },
    // Important: Disable automatic transformation for FormData
    transformRequest: [(data, headers) => {
      // Remove Content-Type header to let React Native set it with boundary
      delete headers['Content-Type'];
      delete headers['Content-type'];
      return data;
    }],
  }
);
```

### 3. Enhanced Error Logging
Added comprehensive error logging to debug issues:

```javascript
console.log('🔥 PHOTO UPLOAD ERROR DETAILS:');
console.log('Error message:', error?.message);
console.log('Error status:', error?.response?.status);
console.log('Error status text:', error?.response?.statusText);
console.log('Error data:', error?.response?.data);
console.log('Error headers:', error?.response?.headers);
console.log('Request config:', error?.config);
```

## Current Status

- ✅ Photo upload UI is working correctly
- ✅ Camera and gallery access implemented
- ✅ Single photo restriction enforced
- ✅ FormData structure is properly created
- ✅ API endpoint is correct (POST `/operation/timesheet/:id/mytimesheet`)
- ✅ Enhanced error logging implemented
- ❌ Still getting 500 error from backend

## Likely Issues for 500 Error

1. **Backend Multipart Handling**: The backend may not be properly parsing React Native FormData format
2. **File Format Compatibility**: React Native sends files differently than web FormData
3. **Missing Required Fields**: Backend may expect additional fields not being sent
4. **File Size Limits**: Backend may have file size restrictions
5. **MIME Type Issues**: Backend may expect specific MIME types

## Next Steps

### 1. Test the Updated App
The app is already running with the updated code. Test photo upload by:
1. Opening a timesheet in edit mode
2. Adding/replacing a photo
3. Saving the timesheet
4. Check console logs for detailed error information

### 2. Backend Investigation
If still getting 500 errors:
1. Check backend server logs for detailed error messages
2. Verify the backend route `POST /operation/timesheet/:id/mytimesheet` exists
3. Ensure backend can handle multipart/form-data from React Native
4. Check if backend expects different field names (e.g., `foto` vs `photos`)

### 3. Alternative Approaches
If current approach still fails:
1. Try sending photos as base64 encoded strings
2. Use a different field name for photos
3. Test with a minimal FormData first (just photos, no other fields)
4. Consider using a dedicated file upload service

### 4. Debugging Commands
To monitor the app logs:
```bash
# For iOS simulator
npx expo run:ios

# Check console logs in Xcode or Expo Dev Tools
```

## Files Modified
- `app/timesheet/[id].jsx` - Enhanced photo upload handling and error logging

## Testing Checklist
- [ ] Test photo upload with camera
- [ ] Test photo upload from gallery  
- [ ] Test photo replacement
- [ ] Test photo removal
- [ ] Check console logs for detailed errors
- [ ] Verify backend receives FormData correctly
- [ ] Check backend logs for 500 error details