# Product Requirements Document (PRD)
## AI-Powered Timesheet Assistant for Heavy Equipment Operators

---

## 1. EXECUTIVE SUMMARY

### 1.1 Project Overview
Aplikasi mobile berbasis React Native Expo yang memungkinkan operator alat berat dan driver dump truck untuk melakukan entry timesheet harian melalui conversational AI assistant. AI akan memandu user step-by-step untuk mengisi data timesheet dengan validasi real-time terhadap master data dari backend.

### 1.2 Goals & Objectives
- **Primary Goal**: Mempermudah dan mempercepat proses entry timesheet operator
- **Secondary Goals**:
  - Mengurangi error input data (salah nama, equipment, kegiatan)
  - Meningkatkan user adoption melalui UX yang familiar (chat-like)
  - Memastikan data integrity dengan validasi terhadap master data

### 1.3 Success Metrics
- Entry timesheet < 2 menit per record
- Error rate < 5%
- User satisfaction score > 4/5
- Daily active usage > 80% dari total operator

---

## 2. USER PERSONAS

### Persona 1: Operator Alat Berat
- **Nama**: Budi (35 tahun)
- **Latar Belakang**: Operator excavator dengan 10 tahun pengalaman
- **Tech Savviness**: Medium (familiar dengan WhatsApp, tidak terbiasa dengan form kompleks)
- **Pain Points**: 
  - Form tradisional terlalu banyak field
  - Sering lupa detail kegiatan di akhir shift
  - Kesulitan mengingat kode equipment
- **Needs**: Interface sederhana, cepat, dan intuitif

### Persona 2: Driver Dump Truck
- **Nama**: Ahmad (28 tahun)
- **Latar Belakang**: Driver dump truck 5 tahun
- **Tech Savviness**: High (aktif di social media)
- **Pain Points**:
  - Input timesheet di akhir hari membosankan
  - Harus mencari dari dropdown panjang
- **Needs**: Quick input, minimal tap/typing

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Core Features

#### Feature 1: Conversational AI Entry
**Description**: AI assistant memandu user untuk input timesheet melalui chat interface

**User Stories**:
- As an operator, I want to chat with AI to fill my timesheet, so I don't have to navigate complex forms
- As an operator, I want AI to remember my previous entries, so I can quickly repeat common tasks
- As an operator, I want AI to validate my input immediately, so I don't make mistakes

**Acceptance Criteria**:
- AI dapat memahami natural language input (Bahasa Indonesia)
- AI menampilkan quick reply buttons untuk pilihan field
- AI melakukan validasi real-time terhadap master data
- AI dapat handle typo dan memberikan suggestions
- User dapat edit data sebelum final submission

#### Feature 2: Guided Step-by-Step Flow
**Description**: AI menggunakan state machine untuk memandu conversation secara terstruktur

**Conversation Steps**:
1. **Greeting & Date Selection**
   - AI menyapa dan menanyakan tanggal operational
   - Default: hari ini
   - Validasi: tidak boleh future date > 1 hari

2. **Shift Selection**
   - AI menampilkan pilihan shift (Quick Reply)
   - Options: Pagi (06:00-14:00), Siang (14:00-22:00), Malam (22:00-06:00)
   - Validasi: harus pilih salah satu

3. **Employee Selection**
   - AI menanyakan nama karyawan
   - Tampilkan autocomplete/suggestions dari master data
   - Fuzzy matching untuk handle typo
   - Konfirmasi dengan tampilkan: Nama Lengkap, ID, Posisi

4. **Equipment Selection**
   - AI menanyakan equipment yang digunakan
   - Filter equipment berdasarkan posisi karyawan (operator → alat berat, driver → dump truck)
   - Tampilkan: Kode Equipment, Nama, Status
   - Validasi: equipment harus available (tidak sedang maintenance)

5. **Activity Selection**
   - AI menanyakan kegiatan yang dilakukan
   - Tampilkan kategori kegiatan dari master data
   - Options bisa multiple (loading, hauling, standby, etc.)
   - Input durasi per kegiatan (dalam jam)

6. **Additional Details** (Optional)
   - Lokasi kerja
   - Material yang diangkut (untuk dump truck)
   - Jarak tempuh (untuk dump truck)
   - Catatan tambahan

7. **Confirmation & Summary**
   - AI menampilkan summary semua data
   - User konfirmasi atau edit
   - Submit ke backend

**Acceptance Criteria**:
- Setiap step memiliki validasi
- User dapat "back" ke step sebelumnya
- User dapat cancel dan start over
- Progress indicator terlihat
- Data tersimpan temporary (draft) jika user exit

#### Feature 3: Master Data Integration
**Description**: Sinkronisasi dan validasi data terhadap backend

**Master Data Required**:
- **Employees**: ID, Nama, Posisi, Status (Active/Inactive)
- **Equipment**: Kode, Nama, Jenis, Status (Available/Maintenance/In Use)
- **Shifts**: Nama, Waktu Mulai, Waktu Selesai
- **Activities**: Kode, Nama, Kategori
- **Locations**: Kode, Nama Site

**API Endpoints Needed**:
```
GET /api/master/employees
GET /api/master/equipment?type={operator|driver}
GET /api/master/shifts
GET /api/master/activities
GET /api/master/locations

POST /api/timesheet/validate
POST /api/timesheet/submit
GET /api/timesheet/draft/:userId
PUT /api/timesheet/draft/:userId
```

**Acceptance Criteria**:
- Master data di-cache local (AsyncStorage)
- Sync setiap app launch atau manual refresh
- Offline mode: gunakan cached data
- Validasi client-side dan server-side

#### Feature 4: Smart Suggestions & Learning
**Description**: AI memberikan suggestions berdasarkan historical data user

**Features**:
- Quick action: "Ulangi timesheet kemarin"
- Frequently used equipment ditampilkan di atas
- Common activity patterns di-suggest
- Auto-fill lokasi berdasarkan shift sebelumnya

**Acceptance Criteria**:
- Suggestions muncul max 3 detik setelah step dimulai
- Accuracy suggestions > 70%
- User dapat ignore suggestions

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Tech Stack

**Frontend**:
- React Native (Expo SDK 50+)
- TypeScript
- State Management: Zustand / Redux Toolkit
- Chat UI: react-native-gifted-chat
- Storage: AsyncStorage / expo-sqlite
- API Client: Axios
- Date handling: date-fns

**AI Integration**:
- Google Gemini API (gemini-1.5-flash)
- Alternative: Groq API (Llama 3)
- Fallback: Rule-based chatbot

**Backend** (Assumed existing):
- RESTful API
- Authentication: JWT
- Master data endpoints available

### 4.2 Project Structure

```
/src
  /components
    /chat
      - ChatBubble.tsx
      - QuickReply.tsx
      - InputToolbar.tsx
    /common
      - Button.tsx
      - LoadingSpinner.tsx
  /screens
    - ChatScreen.tsx
    - TimesheetHistoryScreen.tsx
    - SettingsScreen.tsx
  /services
    - aiService.ts
    - apiService.ts
    - validationService.ts
  /store
    - chatStore.ts
    - masterDataStore.ts
    - userStore.ts
  /utils
    - dateUtils.ts
    - fuzzyMatch.ts
    - promptBuilder.ts
  /types
    - timesheet.types.ts
    - masterData.types.ts
  /constants
    - prompts.ts
    - config.ts
```

### 4.3 Data Models

```typescript
// Timesheet Entry
interface TimesheetEntry {
  id: string;
  tanggal: string; // ISO date
  shift: 'pagi' | 'siang' | 'malam';
  employeeId: string;
  employeeName: string;
  equipmentId: string;
  equipmentName: string;
  activities: Activity[];
  location?: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved';
  createdAt: string;
  submittedAt?: string;
}

interface Activity {
  activityId: string;
  activityName: string;
  duration: number; // in hours
  details?: string;
}

// Chat Message
interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: number;
    name: string;
    avatar?: string;
  };
  quickReplies?: QuickReplies;
  system?: boolean;
}

// Conversation State
interface ConversationState {
  currentStep: ConversationStep;
  collectedData: Partial<TimesheetEntry>;
  validationErrors: string[];
  isProcessing: boolean;
}

enum ConversationStep {
  GREETING = 'greeting',
  DATE_INPUT = 'date_input',
  SHIFT_INPUT = 'shift_input',
  EMPLOYEE_INPUT = 'employee_input',
  EQUIPMENT_INPUT = 'equipment_input',
  ACTIVITY_INPUT = 'activity_input',
  DETAILS_INPUT = 'details_input',
  CONFIRMATION = 'confirmation',
  COMPLETED = 'completed'
}
```

---

## 5. AI CONVERSATION DESIGN

### 5.1 System Prompt Template

```
Kamu adalah asisten digital untuk membantu operator alat berat dan driver dump truck mengisi timesheet harian mereka.

KARAKTERISTIK:
- Ramah, profesional, dan efisien
- Berbicara dalam Bahasa Indonesia yang natural
- Tidak bertele-tele, langsung to the point
- Supportive dan patient dengan user

ATURAN KETAT:
1. Ikuti conversation flow step-by-step, jangan skip
2. HANYA terima input yang valid sesuai master data
3. Jika input tidak valid, berikan 2-3 suggestions terdekat
4. Selalu konfirmasi sebelum lanjut ke step berikutnya
5. Gunakan Quick Replies untuk pilihan terbatas (< 5 options)
6. Untuk pilihan banyak (> 5), minta user ketik dan lakukan fuzzy matching
7. Jika user bingung, berikan contoh konkret
8. Jika user ingin edit data sebelumnya, arahkan ke step tersebut

CURRENT CONTEXT:
- Current Step: {currentStep}
- Collected Data: {collectedData}
- Master Data Available: {masterDataSummary}
- User History: {userHistory}

TASK:
{specificTaskForCurrentStep}
```

### 5.2 Response Format Guideline

**Good Response Examples**:
```
✅ "Baik, shift Pagi (06:00-14:00) untuk hari ini. Siapa nama operatornya?"

✅ "Saya menemukan 3 operator dengan nama mirip:
   1. Budi Santoso (OP-001)
   2. Budi Hermawan (OP-045)
   3. Budiman (OP-102)
   Pilih nomor yang sesuai, atau ketik nama lengkap."

✅ "Oke, Budi Santoso menggunakan Excavator EX-340. Kegiatan apa yang dilakukan hari ini?"
```

**Bad Response Examples**:
```
❌ "Terima kasih atas informasinya! Saya sangat senang membantu Anda..." (too verbose)

❌ "Data sudah dicatat" (without confirmation summary)

❌ "Silakan pilih equipment dari list berikut: [50 items]" (too many, should use search)
```

### 5.3 Error Handling Responses

```typescript
const errorResponses = {
  INVALID_DATE: "Tanggal tidak valid. Tanggal tidak boleh lebih dari 1 hari ke depan. Silakan input ulang.",
  
  EMPLOYEE_NOT_FOUND: "Nama {input} tidak ditemukan. Maksud Anda:\n{suggestions}\natau ketik nama lengkap.",
  
  EQUIPMENT_UNAVAILABLE: "Equipment {equipment} sedang maintenance. Pilih equipment lain:\n{alternatives}",
  
  INVALID_DURATION: "Durasi tidak valid. Total durasi kegiatan tidak boleh melebihi {shiftDuration} jam.",
  
  NETWORK_ERROR: "Koneksi bermasalah. Data disimpan sebagai draft. Coba lagi nanti.",
  
  AI_ERROR: "Maaf, saya sedang kesulitan memproses. Silakan ketik ulang atau gunakan menu pilihan."
};
```

---

## 6. UI/UX DESIGN SPECIFICATIONS

### 6.1 Screen Layouts

#### Chat Screen
```
┌─────────────────────────────────┐
│  ← AI Timesheet Assistant    ⋮ │ ← Header
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────┐       │
│  │ AI: Halo! Mau input │       │ ← AI Message
│  │ timesheet untuk     │       │
│  │ tanggal berapa?     │       │
│  └─────────────────────┘       │
│              09:30              │
│                                 │
│       ┌─────────────────────┐  │
│       │ User: Hari ini      │  │ ← User Message
│       └─────────────────────┘  │
│              09:31              │
│                                 │
│  ┌─────────────────────┐       │
│  │ AI: Baik, 20 Okt    │       │
│  │ 2025. Shift apa?    │       │
│  │                     │       │
│  │ [Pagi] [Siang]      │       │ ← Quick Replies
│  │      [Malam]        │       │
│  └─────────────────────┘       │
│              09:31              │
│                                 │
│  📌 Step 2/7: Pilih Shift      │ ← Progress
├─────────────────────────────────┤
│  Ketik pesan...            [>] │ ← Input
└─────────────────────────────────┘
```

### 6.2 Component Specifications

#### Quick Reply Button
- Height: 44px
- Padding: 12px 20px
- Border radius: 22px
- Background: Primary color (#007AFF)
- Text: White, 15px, Medium weight
- Max width: 45% screen width
- Margin: 8px between buttons

#### Chat Bubble
- AI Bubble: Left-aligned, Light gray background (#F0F0F0)
- User Bubble: Right-aligned, Primary color background
- Border radius: 18px
- Padding: 12px 16px
- Max width: 75% screen width
- Shadow: subtle (elevation 2)

#### Progress Indicator
- Show current step / total steps
- Progress bar (visual)
- Icon per step
- Color: Green (completed), Blue (current), Gray (pending)

### 6.3 Color Palette

```
Primary: #007AFF (iOS Blue)
Secondary: #5856D6 (Purple)
Success: #34C759 (Green)
Warning: #FF9500 (Orange)
Error: #FF3B30 (Red)
Background: #FFFFFF
Surface: #F2F2F7
Text Primary: #000000
Text Secondary: #8E8E93
Border: #C6C6C8
```

### 6.4 Typography

```
Heading: SF Pro Display, 24px, Bold
Body: SF Pro Text, 16px, Regular
Caption: SF Pro Text, 13px, Regular
Button: SF Pro Text, 15px, Medium
```

---

## 7. VALIDATION RULES

### 7.1 Field Validations

| Field | Validation Rules | Error Message |
|-------|-----------------|---------------|
| Tanggal | - Not null<br>- Not future (max +1 day)<br>- Format: YYYY-MM-DD | "Tanggal tidak valid" |
| Shift | - Must be from master data<br>- One of: pagi, siang, malam | "Pilih shift yang tersedia" |
| Employee | - Must exist in master data<br>- Status = Active<br>- Fuzzy match threshold: 80% | "Karyawan tidak ditemukan" |
| Equipment | - Must exist in master data<br>- Status = Available<br>- Type match employee position | "Equipment tidak tersedia" |
| Activity | - Must exist in master data<br>- Duration > 0<br>- Total duration ≤ shift duration | "Durasi tidak valid" |
| Duration | - Number only<br>- Range: 0.5 - 12 hours<br>- Increment: 0.5 hour | "Durasi harus 0.5-12 jam" |

### 7.2 Business Rules

1. **Duplicate Prevention**: User tidak bisa submit timesheet untuk tanggal + shift + employee yang sama dua kali
2. **Equipment Assignment**: Satu equipment hanya bisa digunakan satu operator per shift
3. **Total Duration**: Total durasi semua activities tidak boleh > durasi shift + 1 jam (toleransi overtime)
4. **Historical Limit**: Timesheet hanya bisa diinput untuk max 3 hari ke belakang
5. **Draft Expiry**: Draft timesheet otomatis terhapus setelah 7 hari

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### 8.1 Performance
- App launch time: < 2 seconds
- AI response time: < 3 seconds (95th percentile)
- Master data sync: < 5 seconds
- Smooth scrolling: 60 FPS
- App size: < 50 MB

### 8.2 Reliability
- Offline mode: Full functionality dengan cached data
- Auto-save draft: Every 30 seconds
- Network retry: 3 attempts with exponential backoff
- Error recovery: Graceful degradation ke rule-based chatbot jika AI gagal

### 8.3 Security
- JWT authentication
- API keys stored in secure storage (expo-secure-store)
- No sensitive data in logs
- HTTPS only for API calls
- Input sanitization untuk prevent injection

### 8.4 Compatibility
- iOS: 13.0+
- Android: 7.0+ (API 24+)
- Screen sizes: 4.7" - 6.7"
- Orientations: Portrait only

### 8.5 Accessibility
- Font scaling support
- High contrast mode
- Screen reader compatible
- Minimum touch target: 44x44 px

---

## 9. DEVELOPMENT PHASES

### Phase 1: Foundation (Week 1-2)
**Goal**: Setup project dan core infrastructure

**Deliverables**:
- Expo project initialized dengan TypeScript
- Folder structure setup
- Navigation setup (React Navigation)
- Authentication flow (mock)
- API service layer
- Basic UI components
- State management setup

**Definition of Done**:
- App runs on iOS & Android
- Can navigate between screens
- API service can make mock requests
- State persists across app restarts

### Phase 2: Master Data & Validation (Week 2-3)
**Goal**: Integrasi dengan backend master data

**Deliverables**:
- Master data API integration
- Local caching with AsyncStorage
- Sync mechanism
- Validation service
- Fuzzy matching utility
- Error handling framework

**Definition of Done**:
- Master data loads and caches successfully
- Validation works offline
- Fuzzy matching accuracy > 80%
- Proper error messages shown

### Phase 3: Chat Interface (Week 3-4)
**Goal**: Implement chat UI and basic conversation

**Deliverables**:
- Chat screen with react-native-gifted-chat
- Custom message components
- Quick reply buttons
- Progress indicator
- Input toolbar
- Message history persistence

**Definition of Done**:
- Chat UI looks good and smooth
- Can send/receive messages
- Quick replies work
- Messages persist

### Phase 4: AI Integration (Week 4-5)
**Goal**: Integrate AI and implement conversation flow

**Deliverables**:
- Google Gemini API integration
- Prompt builder utility
- Conversation state machine
- AI response parser
- Context management
- Fallback to rule-based

**Definition of Done**:
- AI responds appropriately to user input
- Follows conversation flow
- Validates against master data
- Handles errors gracefully

### Phase 5: Timesheet Flow (Week 5-6)
**Goal**: Complete end-to-end timesheet entry

**Deliverables**:
- All conversation steps implemented
- Step-by-step validation
- Draft save/restore
- Confirmation screen
- Submit to backend
- Success/error feedback

**Definition of Done**:
- Can complete full timesheet entry
- Data validated and submitted
- Draft works offline
- User receives clear feedback

### Phase 6: Smart Features (Week 6-7)
**Goal**: Add intelligence and UX enhancements

**Deliverables**:
- Historical data analysis
- Smart suggestions
- Quick actions (repeat last entry)
- Edit previous step
- Search and filter in master data
- Performance optimizations

**Definition of Done**:
- Suggestions appear and are relevant
- Quick actions work
- Search is fast
- App feels snappy

### Phase 7: Testing & Polish (Week 7-8)
**Goal**: Testing, bug fixes, and UI polish

**Deliverables**:
- Unit tests (>70% coverage)
- Integration tests
- Manual testing on devices
- Bug fixes
- UI/UX refinements
- Performance tuning
- Documentation

**Definition of Done**:
- All critical bugs fixed
- App tested on 10+ devices
- Performance targets met
- Documentation complete

---

## 10. TESTING STRATEGY

### 10.1 Test Cases

#### Unit Tests
- Validation functions
- Fuzzy matching algorithm
- Date utilities
- Prompt builder
- API response parsers

#### Integration Tests
- API service with mock backend
- State management flows
- AI service with mock responses
- Navigation flows

#### E2E Tests (Critical Paths)
1. Complete timesheet entry (happy path)
2. Entry with validation errors
3. Draft save and restore
4. Offline mode
5. Edit previous step
6. Cancel and restart

### 10.2 Test Data

```typescript
// Mock Master Data
const mockEmployees = [
  { id: 'OP-001', nama: 'Budi Santoso', posisi: 'Operator', status: 'Active' },
  { id: 'DR-001', nama: 'Ahmad Hidayat', posisi: 'Driver', status: 'Active' },
  // ... 50+ entries
];

const mockEquipment = [
  { id: 'EX-340', nama: 'Excavator Hitachi ZX-340', type: 'excavator', status: 'Available' },
  { id: 'DT-120', nama: 'Dump Truck Hino 500', type: 'dump_truck', status: 'Available' },
  // ... 30+ entries
];
```

---

## 11. DEPLOYMENT & MONITORING

### 11.1 Deployment Strategy
- Expo EAS Build for production builds
- Over-the-air (OTA) updates for bug fixes
- Staged rollout: Internal → Beta → Production
- App Store & Play Store submission

### 11.2 Monitoring & Analytics
- Crashlytics for crash reporting
- Analytics events:
  - `timesheet_started`
  - `timesheet_completed`
  - `timesheet_abandoned`
  - `validation_error`
  - `ai_response_time`
  - `api_error`

### 11.3 Success Metrics Dashboard
- Daily active users
- Timesheet completion rate
- Average completion time
- Error rate per step
- AI accuracy (user edit rate)
- API response times

---

## 12. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI API rate limit hit | High | Medium | Implement caching, fallback to rule-based, queue requests |
| Poor AI response quality | High | Medium | Extensive prompt engineering, validation layer, user feedback loop |
| Backend API downtime | High | Low | Offline mode, local draft storage, retry mechanism |
| User adoption low | Medium | Medium | User training, onboarding tutorial, collect feedback early |
| Performance issues | Medium | Medium | Code optimization, lazy loading, profiling |
| Complex validation logic | Medium | High | Thorough testing, clear error messages, logging |

---

## 13. FUTURE ENHANCEMENTS (Post-MVP)

### Phase 2 Features
- Voice input (speech-to-text)
- Photo attachment (bukti kegiatan)
- Multi-language support
- Bulk entry (multiple days)
- Report generation
- Admin dashboard
- Push notifications (reminder)
- Widget for quick entry

### Phase 3 Features
- Predictive analytics (recommend optimal activities)
- Integration dengan payroll system
- Equipment maintenance alerts
- Real-time collaboration
- Offline-first architecture dengan sync

---

## 14. GLOSSARY

- **Timesheet**: Catatan harian aktivitas kerja operator
- **Shift**: Periode waktu kerja (Pagi/Siang/Malam)
- **Equipment**: Alat berat atau kendaraan yang dioperasikan
- **Activity**: Jenis kegiatan yang dilakukan (loading, hauling, dll)
- **Master Data**: Data referensi dari backend (employees, equipment, dll)
- **Draft**: Timesheet yang belum disubmit, tersimpan lokal
- **Fuzzy Matching**: Algoritma untuk mencocokkan teks dengan toleransi typo
- **Quick Reply**: Button pilihan cepat dalam chat interface

---

## 15. APPENDIX

### A. API Contract Examples

**Request: Submit Timesheet**
```json
POST /api/timesheet/submit
{
  "tanggal": "2025-10-20",
  "shift": "pagi",
  "employeeId": "OP-001",
  "equipmentId": "EX-340",
  "activities": [
    {
      "activityId": "ACT-001",
      "duration": 6.5,
      "details": "Loading material di zona A"
    },
    {
      "activityId": "ACT-002",
      "duration": 1.5,
      "details": "Standby"
    }
  ],
  "location": "Site A",
  "notes": "Cuaca cerah"
}
```

**Response: Success**
```json
{
  "success": true,
  "data": {
    "id": "TS-20251020-001",
    "status": "submitted",
    "submittedAt": "2025-10-20T14:30:00Z"
  }
}
```

**Response: Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid",
    "details": [
      {
        "field": "equipmentId",
        "message": "Equipment sedang maintenance"
      }
    ]
  }
}
```

### B. Conversation Examples

**Example 1: Happy Path**
```
AI: Halo Budi! Mau input timesheet untuk tanggal berapa?
User: Hari ini
AI: Baik, 20 Oktober 2025. Shift apa?
    [Pagi] [Siang] [Malam]
User: *tap Pagi*
AI: Shift Pagi (06:00-14:00). Siapa nama operatornya?
User: Budi
AI: Maksud Anda Budi Santoso (OP-001)?
    [Ya, Benar] [Bukan, Cari Lagi]
User: *tap Ya, Benar*
AI: Oke, Budi Santoso. Equipment apa yang digunakan?
User: Excavator 340
AI: Excavator Hitachi ZX-340 (EX-340). Benar?
    [Ya] [Pilih Lain]
User: *tap Ya*
AI: Kegiatan hari ini apa saja? (bisa pilih lebih dari satu)
    [Loading] [Hauling] [Grading] [Standby] [Lainnya]
User: *tap Loading*
AI: Kegiatan Loading berapa jam?
User: 6 jam
AI: 6 jam Loading. Ada kegiatan lain?
    [Tambah Kegiatan] [Tidak, Lanjut]
User: *tap Tambah Kegiatan*
AI: Kegiatan apa lagi?
    [Loading] [Hauling] [Grading] [Standby] [Lainnya]
User: *tap Standby*
AI: Standby berapa jam?
User: 2 jam
AI: 2 jam Standby. Ada kegiatan lain?
    [Tambah Kegiatan] [Tidak, Lanjut]
User: *tap Tidak, Lanjut*
AI: Lokasi kerja di mana? (opsional)
User: Site A
AI: Ada catatan tambahan? (opsional)
User: Tidak
AI: Baik! Ini ringkasan timesheet Anda:

    📅 Tanggal: 20 Oktober 2025
    ⏰ Shift: Pagi (06:00-14:00)
    👤 Operator: Budi Santoso (OP-001)
    🚜 Equipment: Excavator Hitachi ZX-340
    📋 Kegiatan:
       • Loading - 6 jam
       • Standby - 2 jam
    📍 Lokasi: Site A
    
    Total: 8 jam

    Apakah data sudah benar?
    [Submit] [Edit] [Cancel]
User: *tap Submit*
AI: ✅ Timesheet berhasil disimpan! ID: TS-20251020-001
    
    [Input Lagi] [Lihat History] [Selesai]
```

**Example 2: Error Handling**
```
AI: Equipment apa yang digunakan?
User: Excavator rusak
AI: Equipment "Excavator rusak" tidak ditemukan. Maksud Anda:
    1. Excavator Hitachi ZX-340 (EX-340)
    2. Excavator Komatsu PC-200 (EX-200)
    3. Excavator CAT 320 (EX-320)
    
    Pilih nomor atau ketik nama equipment.
User: 1
AI: Maaf, Excavator Hitachi ZX-340 (EX-340) sedang maintenance sampai 22 Oktober. Pilih equipment lain:
    1. Excavator Komatsu PC-200 (EX-200) - Available
    2.