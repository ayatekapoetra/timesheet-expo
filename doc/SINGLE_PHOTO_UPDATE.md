# Single Photo per Timesheet Update

## ✅ **Changes Made:**

### **1. Photo Logic Updated**
- **Single Photo Only**: Restrict to 1 photo per timesheet document
- **Replace Instead of Add**: New photos replace existing ones
- **Simplified Removal**: Remove all photos with single confirmation

### **2. UI Layout Changes**
- **Centered Photo**: Single large photo (200x200px) instead of grid
- **Updated Labels**: "Foto Timesheet" instead of photo count
- **Better Positioning**: Remove button adjusted for centered layout

### **3. User Experience**
- **Clear Feedback**: Success messages when photo added/removed
- **Intuitive Flow**: Replace existing photo rather than adding multiple
- **Clean Interface**: Focused on single photo document approach

## 🔧 **Technical Changes:**

### **Photo Handling Functions:**
```javascript
// Camera - replaces existing photo
setUploadedPhotos([newPhoto]);
dispatch(updateField({ field: 'foto', value: [newPhoto] }));

// Gallery - replaces existing photo  
setUploadedPhotos([newPhoto]);
dispatch(updateField({ field: 'foto', value: [newPhoto] }));

// Remove - clears all photos
setUploadedPhotos([]);
dispatch(updateField({ field: 'foto', value: [] }));
```

### **UI Components:**
- **Single Photo Display**: 200x200px centered image
- **No Grid Layout**: Removed FlatList, using simple View
- **Updated Styling**: Larger, more prominent photo display

### **User Feedback:**
- **Success Messages**: "Foto timesheet berhasil diperbarui"
- **Confirmation Dialogs**: Clear delete confirmation
- **Visual Updates**: Immediate UI feedback

## 📱 **New User Flow:**

1. **Edit Timesheet** → See existing photo (if any)
2. **Add Photo** → New photo replaces existing one
3. **View Photo** → Large, centered display
4. **Remove Photo** → Single confirmation removes all
5. **Save** → Single photo included in submission

## 🎯 **Benefits:**

- **Simplified Management**: One photo per document reduces complexity
- **Clear Documentation**: Each timesheet has one definitive photo
- **Better Performance**: Smaller data size, faster uploads
- **Cleaner UI**: Focused, uncluttered interface
- **Easier Validation**: Simpler backend processing

## 📋 **Updated Features:**

### **Photo Options Modal:**
- 📷 "Ambil Foto Timesheet" - Camera replaces existing
- 🖼️ "Pilih dari Galeri" - Gallery replaces existing

### **Photo Display:**
- **Large Format**: 200x200px for better visibility
- **Centered Layout**: Professional document appearance
- **Remove Button**: Positioned for single photo layout

### **Status Messages:**
- **Add**: "Foto timesheet berhasil diperbarui"
- **Remove**: "Foto timesheet berhasil dihapus"
- **Empty**: "Belum ada foto timesheet"

---

**Status:** ✅ **Complete - Single Photo per Document**

The timesheet edit now enforces a clean, professional approach with exactly one photo per timesheet document, making documentation consistent and manageable.