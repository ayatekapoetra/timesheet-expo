// Test script untuk validasi photo upload fix
// Simulasi FormData yang dikirim ke backend

console.log('=== TEST PHOTO UPLOAD FIX ===\n');

// Simulasi photo data dari AI Chat
const mockPhotoData = {
  uri: 'file:///path/to/photo.jpg',
  type: 'image/jpeg',
  fileName: 'timesheet_photo.jpg'
};

const mockCollectedData = {
  tanggal: '2025-10-21',
  activity: 'mining',
  foto: [mockPhotoData], // Array of photos
  photo: mockPhotoData.uri, // Single URI for display
  equipment_nama: 'Excavator',
  karyawan_id: '123'
};

console.log('1. Data Structure dari AI Chat:');
console.log('   collectedData.foto:', mockCollectedData.foto);
console.log('   collectedData.photo:', mockCollectedData.photo);

// Simulasi FormData creation (dari timesheetItemSlice.js)
function simulateFormDataCreation(formData) {
  console.log('\n2. FormData Creation Process:');
  
  const dataForm = {
    _parts: []
  };
  
  Object.keys(formData).forEach((key) => {
    const value = formData[key];
    
    // Skip complex objects
    const displayOnlyObjects = [
      'equipment', 'karyawan', 'penyewa', 'pelanggan', 
      'shift', 'longshift_obj', 'activity_obj', 'cabang'
    ];
    
    if (displayOnlyObjects.includes(key)) {
      console.log(`   ⏭️  Skipping ${key} (display object)`);
      return;
    }
    
    // Handle photo files
    if (key === 'foto' || key === 'photo') {
      if (value && Array.isArray(value) && value.length > 0) {
        value.forEach((photo, index) => {
          if (photo.uri) {
            const photoFile = {
              uri: photo.uri,
              type: photo.type || 'image/jpeg',
              name: photo.fileName || photo.name || `photo_${index}.jpg`,
            };
            // Use 'foto[]' field name as expected by backend
            dataForm._parts.push(['foto[]', photoFile]);
            console.log(`   📸 Adding photo[${index}]:`, photoFile);
          }
        });
      } else if (value && value.uri) {
        const photoFile = {
          uri: value.uri,
          type: value.type || 'image/jpeg',
          name: value.fileName || value.name || 'photo.jpg',
        };
        dataForm._parts.push(['foto[]', photoFile]);
        console.log(`   📸 Adding single photo:`, photoFile);
      }
    }
    // Handle primitive values
    else if (value !== null && value !== undefined && value !== '') {
      dataForm._parts.push([key, value.toString()]);
      console.log(`   📝 Adding ${key}: ${value}`);
    }
  });
  
  return dataForm;
}

const formDataResult = simulateFormDataCreation(mockCollectedData);

console.log('\n3. Final FormData Parts:');
formDataResult._parts.forEach(([key, value]) => {
  if (key === 'foto[]') {
    console.log(`   📸 ${key}:`, {
      uri: value.uri,
      type: value.type,
      name: value.name
    });
  } else {
    console.log(`   📝 ${key}: ${value}`);
  }
});

console.log('\n4. Expected Backend Format:');
console.log('   Field name: "foto[]" (as documented)');
console.log('   Value: File object with uri, type, name');
console.log('   Multiple photos: Multiple "foto[]" fields');

console.log('\n5. Validation:');
const photoFields = formDataResult._parts.filter(([key]) => key === 'foto[]');
console.log(`   ✅ Photo fields found: ${photoFields.length}`);
console.log(`   ✅ Field name correct: ${photoFields.length > 0 ? 'YES' : 'NO'}`);
console.log(`   ✅ File format correct: ${photoFields.every(p => p[1].uri && p[1].type && p[1].name) ? 'YES' : 'NO'}`);

console.log('\n=== TEST COMPLETED ===');