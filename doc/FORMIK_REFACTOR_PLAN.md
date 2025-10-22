# Formik Refactor Plan - Timesheet Form

## User Story

**As a user:**
1. Klik tombol "Buat TimeSheet"
2. Form dibuka dengan initialValues dari Redux `timesheetItemSlice`
3. User update form fields sesuai kebutuhan
4. User submit form
5. **On Submit:**
   - App dispatch data ke Redux (update state)
   - App kirim data ke API endpoint (POST/PUT)
   - **If Success:** Navigate ke list timesheet
   - **If Failed/Offline:** Simpan ke SQLite queue untuk retry nanti

## Current Implementation Analysis

### Current State Management
```javascript
// Redux State
const { form, submitting, validationErrors } = useAppSelector(state => state.timesheetItem);

// Update via dispatch
dispatch(updateField({ field: 'tanggal', value: date }));
dispatch(addKegiatan());
dispatch(updateKegiatan({ id, field, value }));
```

### Current Submission Flow
```javascript
const handleSubmit = async () => {
  // 1. Validate with Yup
  await timesheetValidationSchema.validate(form);
  
  // 2. Dispatch submit
  await dispatch(submitTimesheet(form)).unwrap();
  
  // 3. Navigate
  router.back();
};
```

## Proposed Formik Implementation

### 1. Formik Setup

```javascript
import { Formik, FieldArray } from 'formik';
import { timesheetValidationSchema } from './validation';

const initialValues = useAppSelector(state => state.timesheetItem.form);

<Formik
  initialValues={initialValues}
  validationSchema={timesheetValidationSchema}
  onSubmit={handleFormSubmit}
  enableReinitialize={true}
>
  {({ values, errors, touched, setFieldValue, handleSubmit }) => (
    <FormContent />
  )}
</Formik>
```

### 2. Form Fields Refactor

**Before (Redux dispatch):**
```javascript
<InputBox
  value={form.tanggal}
  onPress={() => {
    dispatch(updateField({ field: 'tanggal', value: date }));
  }}
/>
```

**After (Formik):**
```javascript
<InputBox
  value={values.tanggal}
  onPress={() => {
    setFieldValue('tanggal', date);
    // Also sync to Redux
    dispatch(updateField({ field: 'tanggal', value: date }));
  }}
/>
```

### 3. Kegiatan Array with FieldArray

**Before:**
```javascript
const addKegiatanItem = () => {
  dispatch(addKegiatan());
};

const removeKegiatanItem = (id) => {
  dispatch(removeKegiatan(id));
};

const updateKegiatanItem = (id, field, value) => {
  dispatch(updateKegiatan({ id, field, value }));
};
```

**After (Formik FieldArray):**
```javascript
<FieldArray name="kegiatan">
  {({ push, remove }) => (
    <>
      {values.kegiatan.map((item, index) => (
        <View key={index}>
          <InputBox
            value={values.kegiatan[index].kegiatan_nama}
            onPress={() => {
              setFieldValue(`kegiatan[${index}].kegiatan_id`, id);
              setFieldValue(`kegiatan[${index}].kegiatan_nama`, nama);
            }}
          />
          <TouchableOpacity onPress={() => remove(index)}>
            <Text>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity onPress={() => push(newKegiatanTemplate)}>
        <Text>Add Kegiatan</Text>
      </TouchableOpacity>
    </>
  )}
</FieldArray>
```

### 4. Submit Handler

```javascript
const handleFormSubmit = async (values, { setSubmitting }) => {
  try {
    console.log('[Formik] Submitting form...', values);
    
    // 1. Sync final values to Redux
    dispatch(setTimesheet(values));
    
    // 2. Submit to API
    const result = await dispatch(submitTimesheet(values)).unwrap();
    
    console.log('[Formik] Submit successful:', result);
    
    // 3. Navigate on success
    Alert.alert('Success', 'TimeSheet berhasil disimpan', [
      {
        text: 'OK',
        onPress: () => router.push('/timesheet'),
      },
    ]);
    
  } catch (error) {
    console.error('[Formik] Submit failed:', error);
    
    // Check if offline queue
    if (error === 'Disimpan ke antrian offline') {
      Alert.alert(
        'Offline Mode',
        'TimeSheet disimpan ke antrian offline. Data akan dikirim otomatis saat online.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/timesheet'),
          },
        ]
      );
    } else {
      Alert.alert('Error', error);
    }
  } finally {
    setSubmitting(false);
  }
};
```

### 5. Auto-Sync to Redux (Optional)

**Sync Formik values to Redux on every change:**
```javascript
useEffect(() => {
  // Debounce to avoid too many dispatches
  const timeoutId = setTimeout(() => {
    dispatch(setTimesheet(values));
  }, 300);
  
  return () => clearTimeout(timeoutId);
}, [values]);
```

Or sync only on specific fields:
```javascript
const handleFieldChange = (field, value) => {
  // Update Formik
  setFieldValue(field, value);
  
  // Sync to Redux
  dispatch(updateField({ field, value }));
};
```

## Implementation Steps

### Step 1: Wrap Form with Formik
```javascript
export default function CreateTimesheetPage() {
  const initialValues = useAppSelector(state => state.timesheetItem.form);
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={timesheetValidationSchema}
      onSubmit={handleFormSubmit}
      enableReinitialize={true}
    >
      {(formikProps) => (
        <TimesheetFormContent {...formikProps} />
      )}
    </Formik>
  );
}
```

### Step 2: Extract Form Content Component
```javascript
function TimesheetFormContent({
  values,
  errors,
  touched,
  setFieldValue,
  handleSubmit,
  isSubmitting,
}) {
  // All form UI here
  return (
    <AppScreen>
      <AppHeader ... />
      <ScrollView>
        {/* Form fields */}
      </ScrollView>
      <BtnActionSheet
        title={isSubmitting ? "Menyimpan..." : "Simpan TimeSheet"}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </AppScreen>
  );
}
```

### Step 3: Update All Input Components
```javascript
// Tanggal
<InputBox
  label="Tanggal :"
  value={values.tanggal ? moment(values.tanggal).format('DD MMM YYYY') : '-'}
  onPress={() => setShowDatePicker(true)}
  error={touched.tanggal && errors.tanggal}
/>

// DatePicker onSelect
<DatePickerModal
  onSelect={(date) => {
    setFieldValue('tanggal', date);
    dispatch(updateField({ field: 'tanggal', value: date }));
  }}
/>
```

### Step 4: Refactor Kegiatan Array
```javascript
<FieldArray name="kegiatan">
  {({ push, remove }) => (
    <View style={styles.kegiatanSection}>
      {values.kegiatan.map((item, index) => (
        <KegiatanItem
          key={item.id || index}
          item={item}
          index={index}
          values={values}
          errors={errors}
          touched={touched}
          setFieldValue={setFieldValue}
          onRemove={() => {
            remove(index);
            dispatch(removeKegiatan(item.id));
          }}
        />
      ))}
      
      <TouchableOpacity
        onPress={() => {
          const newKegiatan = {
            id: `temp_${Date.now()}`,
            kegiatan_id: null,
            material_id: null,
            lokasi_asal_id: null,
            lokasi_tujuan_id: null,
            starttime: '',
            endtime: '',
            quantity: 0,
            // ... other fields
          };
          push(newKegiatan);
          dispatch(addKegiatan());
        }}
      >
        <Text>Tambah Kegiatan</Text>
      </TouchableOpacity>
    </View>
  )}
</FieldArray>
```

### Step 5: Extract KegiatanItem Component
```javascript
function KegiatanItem({
  item,
  index,
  values,
  errors,
  touched,
  setFieldValue,
  onRemove,
}) {
  const kegiatanFieldName = `kegiatan[${index}]`;
  
  return (
    <View style={styles.kegiatanItem}>
      <View style={styles.kegiatanHeader}>
        <Text>Kegiatan #{index + 1}</Text>
        {values.kegiatan.length > 1 && (
          <TouchableOpacity onPress={onRemove}>
            <Ionicons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
      
      <InputBox
        label="Jenis Kegiatan :"
        value={values.kegiatan[index].kegiatan_nama || '-'}
        onPress={() => openKegiatanPicker(index)}
        error={
          touched.kegiatan?.[index]?.kegiatan_id && 
          errors.kegiatan?.[index]?.kegiatan_id
        }
      />
      
      {/* Other fields */}
    </View>
  );
}
```

### Step 6: Implement handleFormSubmit
```javascript
const handleFormSubmit = async (values, formikBag) => {
  const { setSubmitting, setErrors } = formikBag;
  
  try {
    console.log('[Formik] Form submit started');
    console.log('[Formik] Values:', values);
    
    // 1. Update Redux state dengan final values
    dispatch(setTimesheet(values));
    
    // 2. Submit ke API via Redux thunk
    const result = await dispatch(submitTimesheet(values)).unwrap();
    
    console.log('[Formik] API response:', result);
    
    // 3. Success - navigate
    Alert.alert('Sukses', 'TimeSheet berhasil disimpan', [
      {
        text: 'OK',
        onPress: () => router.push('/timesheet'),
      },
    ]);
    
  } catch (error) {
    console.error('[Formik] Submit error:', error);
    
    // Handle offline queue
    if (error === 'Disimpan ke antrian offline') {
      Alert.alert(
        'Mode Offline',
        'TimeSheet disimpan ke antrian. Akan dikirim otomatis saat online.',
        [{ text: 'OK', onPress: () => router.push('/timesheet') }]
      );
    } else {
      // Show error
      Alert.alert('Error', error);
      
      // Set Formik errors if validation error
      if (typeof error === 'object') {
        setErrors(error);
      }
    }
  } finally {
    setSubmitting(false);
  }
};
```

## Benefits of Formik Refactor

### 1. Cleaner State Management
- **Before:** Mix of Redux state + local state + direct mutations
- **After:** Single source of truth (Formik values) + Redux for persistence

### 2. Built-in Validation
- **Before:** Manual Yup validation + manual error state
- **After:** Formik handles validation automatically

### 3. Better Form Control
- **Before:** Multiple dispatches for each field update
- **After:** Formik manages all field updates, sync to Redux only when needed

### 4. Easier Testing
- **Before:** Need to mock Redux + dispatch
- **After:** Can test form logic separately from Redux

### 5. Nested Forms (FieldArray)
- **Before:** Manual array management with custom logic
- **After:** Formik FieldArray handles add/remove/reorder

## Hybrid Approach (Recommended)

Keep Redux for:
- ✅ Initial values
- ✅ Master data (penyewa, equipment, etc.)
- ✅ Submission logic (API call + offline queue)
- ✅ Global state persistence

Use Formik for:
- ✅ Form state management
- ✅ Validation
- ✅ Field updates
- ✅ Submit handling
- ✅ Error display

Sync Strategy:
```javascript
// Option 1: Sync on blur
<InputBox
  onBlur={() => {
    dispatch(updateField({ field, value: values[field] }));
  }}
/>

// Option 2: Sync on submit
const handleSubmit = async (values) => {
  dispatch(setTimesheet(values)); // Sync before submit
  await dispatch(submitTimesheet(values));
};

// Option 3: No sync (Formik only)
// Just pass values directly to submit
await dispatch(submitTimesheet(values));
```

## File Structure

```
app/timesheet/
├── create.jsx              # Main page with Formik wrapper
├── components/
│   ├── TimesheetForm.jsx   # Form content component
│   ├── KegiatanItem.jsx    # Kegiatan array item
│   └── FormFields.jsx      # Reusable form fields
├── hooks/
│   └── useTimesheetForm.js # Custom hook for form logic
└── validation.js           # Yup schema (existing)
```

## Migration Strategy

### Phase 1: Setup (No Breaking Changes)
1. Install/verify Formik
2. Create Formik wrapper (keep existing code working)
3. Test initial values loading

### Phase 2: Refactor Fields (Incremental)
1. Refactor basic fields (tanggal, penyewa, equipment)
2. Test each field
3. Refactor kegiatan array
4. Test array operations

### Phase 3: Submit Logic
1. Implement handleFormSubmit
2. Test online submission
3. Test offline queue
4. Test validation errors

### Phase 4: Cleanup
1. Remove unused Redux dispatches
2. Remove local state (if fully migrated)
3. Update documentation

## Testing Checklist

- [ ] Initial values load from Redux
- [ ] Field updates work correctly
- [ ] Kegiatan add/remove works
- [ ] Validation shows errors
- [ ] Submit online success → navigate
- [ ] Submit offline → save to queue
- [ ] Submit with errors → show alerts
- [ ] Form resets after submit
- [ ] Navigation works correctly
- [ ] Redux state syncs properly

---

**Status:** Planning Complete  
**Next Step:** Begin implementation  
**Priority:** High  
**Estimated Time:** 4-6 hours
