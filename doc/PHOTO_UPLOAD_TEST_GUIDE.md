# Photo Upload Testing Guide

## ✅ Implementation Status

### **Completed Fixes:**
1. **FormData Structure** - Fixed in `timesheetItemSlice.js:101-117`
2. **Content-Type Header** - Removed manual header (React Native auto-sets)
3. **Photo Object Creation** - Proper uri/type/name structure
4. **Debug Logging** - Added console logs for tracking

### **Files Modified:**
- `src/redux/timesheetItemSlice.js` - FormData fixes
- `app/timesheet/ai-chat.jsx` - Photo handling (already correct)

## 🧪 How to Test Photo Upload

### **1. Start the App**
```bash
npm start
# or
expo start
```

### **2. Navigate to Timesheet Creation**
- Go to Timesheet tab
- Tap "Buat Timesheet Baru"
- Follow the AI chat flow

### **3. Add Photos**
- When prompted for photos, use:
  - 📷 Camera button to take new photos
  - 🖼️ Gallery button to select existing photos
- Add multiple photos to test array handling

### **4. Complete the Form**
- Fill all required fields through AI chat
- Type "selesai" when done adding photos
- Review and submit the timesheet

### **5. Monitor Console Logs**
Open debugger and watch for:
```
📸 FormData contents being sent:
📸 foto[]: {uri: "...", type: "image/jpeg", name: "..."}
📸 API Response: {...}
```

## 🎯 Expected Behavior

### **Success Indicators:**
1. ✅ Photos display in chat after selection
2. ✅ Console shows FormData with foto[] array
3. ✅ No Content-Type header errors
4. ✅ Backend responds with success message
5. ✅ Timesheet saved with photos

### **Debugging Info:**
- Photos stored in `collectedData.foto[]` array
- Each photo has: `uri`, `type`, `fileName`
- FormData uses `foto[]` key for multiple files
- API endpoint: `POST operation/timesheet/mobile`

## 🚨 If Photos Still Fail

### **Check Backend:**
1. **Server Status:** `http://192.168.1.11:3003` reachable?
2. **Endpoint:** `/operation/timesheet/mobile` exists?
3. **Multipart Handling:** Server processes `foto[]` array?

### **Check Network:**
1. **WiFi Connection:** Same network as backend server?
2. **Firewall:** Port 3003 open?
3. **CORS:** Backend allows mobile app requests?

### **Check Photo Data:**
```javascript
// In console debugger, check:
console.log('Photos:', collectedData.foto);
// Should show array of objects with uri, type, fileName
```

## 📱 Test Scenarios

### **Scenario 1: Single Photo**
- Take 1 photo with camera
- Complete form
- Verify submission success

### **Scenario 2: Multiple Photos**
- Add 3+ photos from gallery
- Complete form  
- Verify all photos uploaded

### **Scenario 3: Mixed Sources**
- 1 photo from camera
- 2 photos from gallery
- Complete form
- Verify all photos uploaded

### **Scenario 4: No Photos**
- Skip photo upload
- Complete form
- Verify submission works without photos

## 🔍 Advanced Debugging

### **Network Inspector:**
Use React Native debugger or Flipper to inspect:
- Request headers
- FormData body
- Response status/data

### **Backend Logs:**
Check server logs for:
- Received FormData
- File processing
- Any errors during photo handling

## ✅ Validation Checklist

- [ ] Photos display in UI after selection
- [ ] Console logs show FormData structure
- [ ] No Content-Type header errors
- [ ] Backend receives foto[] array
- [ ] Photos saved successfully
- [ ] Timesheet created with photo references

---

**Status:** 🚀 **Ready for Testing**

The photo upload implementation is complete with proper FormData handling, debugging, and error handling. Test in the actual app to verify backend communication.