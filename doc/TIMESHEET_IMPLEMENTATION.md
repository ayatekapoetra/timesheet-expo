# Timesheet Feature Implementation Guide

## 📋 Overview

Implementasi fitur **Timesheet** yang identik dengan mobile version, meliputi:
1. **List Screen** - Daftar timesheet dengan filter
2. **Create Screen** - Form create timesheet
3. **Show/Detail Screen** - View & edit timesheet detail

---

## 🗂️ File Structure

```
app/timesheet/
├── index.tsx           # List screen (main)
├── create.tsx          # Create/Form screen
├── [id].tsx            # Detail/Show screen
└── filter.tsx          # Filter modal

src/components/
├── CardTimesheet.tsx   # Timesheet card component
├── InputActionSheet.tsx # Action sheet for selects
├── BtnActionSheet.tsx  # Bottom sheet button
└── InputTeksNarasi.tsx # Textarea component

src/redux/
├── timesheetSlice.ts   # Timesheet state management
└── timesheetItemSlice.ts # Form state management
```

---

## 🎨 Visual Components dari Mobile

### 1. **List Screen Components**

#### CardTimesheet
```typescript
// Visual struktur:
┌─────────────────────────────────┐
│ Senin, 14 Jan 2025         [Icon]│ Date + status badge
├─────────────────────────────────┤
│ 👤 John Doe         🔧 EX-001  │ Operator + Equipment
│ 🏢 PT Client        ⏰ 7.5 Jam │ Client + Hours
├─────────────────────────────────┤
│ 📍 Pit A → Pit B               │ Lokasi
│ 🛠️ Loading                     │ Activity
│ ⛽ 250 L   📊 8.5 HM          │ BBM + SMU
└─────────────────────────────────┘
```

**Props needed**:
- `item.date_ops` - Tanggal
- `item.karyawan.nama` - Nama operator
- `item.equipment.kode` - Kode equipment
- `item.pelanggan.nama` - Client
- `item.starttime`, `item.endtime` - Waktu
- `item.status` - Status (badge color)
- `item.bbm` - BBM
- `item.smustart`, `item.smufinish` - SMU

#### Filter Sheet
```typescript
// Filter fields:
- Date Start & Date End
- Shift (select)
- Pengawas (select)
- Status (pending/approved/rejected)
```

### 2. **Create Screen Components**

#### Form Sections
```
1. Informasi Umum
   - Tanggal (date picker)
   - Cabang (select)
   - Penyewa (select)
   - Equipment (select)
   
2. Waktu & Shift
   - Shift (select)
   - Long Shift (select)
   - Operator (select)
   
3. SMU/HM
   - SMU Start (input number)
   - SMU Finish (input number)
   - Used SMU (auto calculate)
   
4. BBM & Tools
   - Refuel BBM (input number)
   - Equipment Tool (input)
   
5. Kegiatan (Array Field)
   - Jenis Kegiatan (select)
   - Material (select - for DT only)
   - Lokasi Asal (select)
   - Lokasi Tujuan (select - for DT only)
   - Start Time (time picker)
   - End Time (time picker)
   - Quantity (input number)
   - [+ Tambah Kegiatan button]
   
6. Tambahan
   - Foto (image picker)
   - Keterangan (textarea)
   
[Submit Button]
```

#### Input Components Needed
- `InputActionSheet` - Select dengan bottom sheet
- `BtnActionSheet` - Tombol action sheet
- `DatePicker` - Date & time picker
- `InputTeksNarasi` - Textarea
- `ImagePicker` - Upload foto

### 3. **Show/Detail Screen**

Similar dengan Create, tapi:
- Read-only jika status = approved
- Editable jika status = pending
- Show approval info jika ada
- Delete button jika pending

---

## 🔧 Technical Implementation

### Step 1: Redux Slices

**timesheetSlice.ts**:
```typescript
interface TimesheetState {
  loading: boolean;
  error: string | null;
  data: Timesheet[] | null;
  filter: FilterState;
}

// Actions:
- getTimesheets (async thunk)
- setFilter
- clearFilter
```

**timesheetItemSlice.ts**:
```typescript
interface TimesheetItemState {
  form: TimesheetForm;
  loading: boolean;
  error: string | null;
}

// Actions:
- initTimesheet
- setTimesheet
- addKegiatan
- removeKegiatan
- updateKegiatan
- submitTimesheet (async thunk)
```

### Step 2: API Endpoints

```typescript
// List
GET /operation/timesheet
  params: {
    karyawan_id,
    dateStart,
    dateEnd,
    shift,
    pengawas_id
  }

// Create
POST /operation/timesheet
  body: TimesheetForm

// Show
GET /operation/timesheet/:id

// Update
PUT /operation/timesheet/:id
  body: TimesheetForm

// Delete
DELETE /operation/timesheet/:id
```

### Step 3: Components

**CardTimesheet.tsx**:
```typescript
interface CardTimesheetProps {
  item: Timesheet;
  onPress: () => void;
}

// Visual elements:
- Date header dengan status badge
- Operator + Equipment row
- Client + Hours row
- Location info
- Activity info
- BBM + SMU info
- Border bottom colored by status
```

**InputActionSheet.tsx**:
```typescript
interface InputActionSheetProps {
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
  required?: boolean;
  icon?: string;
}

// Bottom sheet select component
```

### Step 4: Validation

**Yup Schema**:
```typescript
const timesheetSchema = Yup.object().shape({
  tanggal: Yup.date().required(),
  cabang_id: Yup.number().required(),
  penyewa_id: Yup.number().required(),
  equipment_id: Yup.number().required(),
  shift_id: Yup.number().required(),
  smustart: Yup.number().required(),
  smufinish: Yup.number().required()
    .min(Yup.ref('smustart')),
  usedsmu: Yup.number().required(),
  bbm: Yup.number().required(),
  kegiatan: Yup.array().of(
    Yup.object().shape({
      kegiatan_id: Yup.string().required(),
      lokasi_id: Yup.string().required(),
      starttime: Yup.date().required(),
      endtime: Yup.date().required(),
      quantity: Yup.number().required(),
    })
  ).min(1, 'Minimal 1 kegiatan')
});
```

---

## 🎨 Color & Style Standards

### Status Colors
```typescript
const statusColors = {
  pending: '#f09d27',    // Warning orange
  approved: '#2B8F0C',   // Success green
  rejected: '#dc2626',   // Error red
  draft: '#96a2b4',      // Muted gray
};
```

### Card Style
```typescript
const cardStyle = {
  borderBottomWidth: 3,
  borderBottomColor: statusColors[status],
  padding: 12,
  marginBottom: 8,
  backgroundColor: isDark ? '#374151' : '#FFFFFF',
  borderRadius: 8,
};
```

### Form Style
```typescript
const inputStyle = {
  height: 50,
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  fontFamily: 'Roboto-Regular',
  fontSize: 15,
  borderColor: appmode.boxlinecolor[mode][1],
  backgroundColor: isDark ? '#374151' : '#FFFFFF',
};
```

---

## 📱 Screen Layouts

### List Screen (`index.tsx`)
```
┌─────────────────────────────────┐
│ ← TimeSheet          🔍 🌓 ☁️ 🔔│ AppHeader
├─────────────────────────────────┤
│ [Filter Button]                 │ Filter trigger
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ CardTimesheet #1            │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │ FlatList
│ │ CardTimesheet #2            │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ CardTimesheet #3            │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│              [+]                │ FAB (Floating Action Button)
└─────────────────────────────────┘
```

### Create Screen (`create.tsx`)
```
┌─────────────────────────────────┐
│ ← Buat TimeSheet       🌓 ☁️ 🔔│ AppHeader
├─────────────────────────────────┤
│ ScrollView                      │
│ ┌─────────────────────────────┐ │
│ │ Informasi Umum              │ │
│ │ [Tanggal]                   │ │
│ │ [Cabang]                    │ │
│ │ [Penyewa]                   │ │
│ │ [Equipment]                 │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Waktu & Shift               │ │
│ │ [Shift]                     │ │
│ │ [Operator]                  │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Kegiatan #1                 │ │
│ │ [Jenis]  [Lokasi]          │ │
│ │ [Start]  [End]  [Qty]      │ │
│ │            [x] Delete       │ │
│ └─────────────────────────────┘ │
│ [+ Tambah Kegiatan]             │
│                                 │
│ [Submit Button]                 │
└─────────────────────────────────┘
```

### Show Screen (`[id].tsx`)
```
┌─────────────────────────────────┐
│ ← Detail TimeSheet     🌓 ☁️ 🔔│ AppHeader
├─────────────────────────────────┤
│ [Status Badge: Approved]        │
├─────────────────────────────────┤
│ ScrollView (same as create)     │
│ ... form fields (read-only) ... │
│                                 │
│ [Edit Button] (if pending)      │
│ [Delete Button] (if pending)    │
└─────────────────────────────────┘
```

---

## 🚀 Implementation Priority

### Phase 1: Core Components ✅
1. ✅ CardTimesheet component
2. ✅ List screen dengan filter
3. ✅ Redux timesheet slice
4. ✅ API integration

### Phase 2: Form Components 🟡
1. InputActionSheet
2. BtnActionSheet
3. Date/Time pickers
4. Image picker

### Phase 3: CRUD Operations 🟡
1. Create screen
2. Show/detail screen
3. Edit functionality
4. Delete functionality

### Phase 4: Advanced Features ⚪
1. Offline mode
2. Photo upload
3. Validation
4. Error handling

---

## 📚 Dependencies Needed

Already installed ✅:
- `formik` - Form management
- `yup` - Validation
- `moment` - Date formatting
- `axios` - API calls
- `expo-image-picker` - Photos
- `react-native-calendars` - Date picker

Need to add:
- `@gorhom/bottom-sheet` - Bottom sheets (optional)
- Or use custom modal implementation

---

## 🎯 Next Steps

1. **Implement CardTimesheet component** ✅ (Priority 1)
2. **Update list screen** ✅ (Priority 1)
3. **Create redux slices** (Priority 2)
4. **Build form inputs** (Priority 2)
5. **Implement create screen** (Priority 3)
6. **Implement show screen** (Priority 3)

---

Karena ini adalah implementasi yang sangat besar, saya akan membuat secara bertahap:
1. Komponen dasar (CardTimesheet)
2. List screen fungsional
3. Create form
4. Show/detail screen

Apakah Anda ingin saya mulai dengan komponen Card dan List screen dulu?
