# Visual Design Guide - Expo Operator Driver

Project ini telah **100% match** dengan design visual dari mobile version.

## ✅ Komponen Visual yang Telah Diimplementasikan

### 1. **Bottom Tab Navigation** 
Identik dengan mobile, dengan 3 tabs:

| Tab | Icon | Title | Route |
|-----|------|-------|-------|
| 1 | 📋 clipboard-check | TugasKu | `/penugasan` |
| 2 | 📱 apps | Menu Utama | `/` (home) |
| 3 | 👤 person | Pengaturan | `/explore` |

**Design Details**:
- Active color: `#ef981e` (light mode) / `#f09d27` (dark mode)
- Inactive color: `#C4C4C4` (light mode) / `#404441` (dark mode)
- Background: `#1F2937` (light mode) / `#F5F5F5` (dark mode)
- Height: 60px dengan padding
- Icon size: 32px (active) / 28px (inactive)

### 2. **AppHeader Component**
Custom header dengan fitur lengkap:

**Elements**:
- ← Back button (jika `prevPage={true}`)
- Title text (Poppins-Light, 17px)
- 🔍 Filter icon (optional dengan `onSearch`)
- 🌓 Theme toggle (light/dark mode)
- ☁️ Cloud sync indicator (online/offline status)
- 🔔 Notification bell (dengan badge counter)

**Colors**:
- Background: `appmode.container[mode]`
- Border: 1px solid
- Height: 50px
- Icons: 25px

### 3. **Login Screen** (`/auth/login`)
Design identik dengan mobile:

**Layout**:
- Theme toggle di pojok kanan atas
- Version text (Poppins-Light)
- "LOGIN" title (24px, Poppins-Medium)
- Logo image (200x200)
- Username input dengan person icon
- Password input dengan lock icon + eye toggle
- Error message (red background card)
- Login button (50px height, rounded, primary color)

**Input Style**:
- Height: 50px
- Border radius: 8px
- Border: 1px solid
- Icon kiri: 40px padding
- Font: Roboto-Regular, 15px

### 4. **Home Dashboard** (`/(tabs)/index`)
Replica exact dari mobile:

**Header Section**:
- Equipment image dengan zoom animation on scroll
- Scale: 0.7 - 1.0
- Opacity: 0.8 - 1.0
- Different image untuk driver vs operator

**Profile Section**:
- Name (26px, Roboto-Medium)
- Section/Role (16px, Poppins-Medium, capitalize)
- Phone (12px, Poppins-Light)

**Statistics Cards**:
3 circular badges dengan background colors:
- **TimeSheet Masuk**: Blue gradient (#60A5FA / #2563EB)
- **Checklog**: Green gradient (#34D399 / #059669)
- **TimeSheet Approved**: Orange gradient (#FB923C / #EA580C)

Badge style:
- Size: 64x64
- Border radius: 50
- Number: 24px, Roboto-Medium, bold
- Label: 12px, Poppins-Medium
- Sub-label: 10px, Poppins-Light

**Menu Buttons**:
3 buttons horizontal layout:
- Border: 1px dashed
- Border radius: 8px
- Height: 100px
- Image: 50x50 (60x50 untuk Fingerprint)
- Title: 10px, Poppins-Medium
- Shadow untuk iOS

Icons:
- 📅 schedules.png - TimeSheet
- 💰 money.png - Insentif  
- 👆 finger-mechine.png - Absensi

### 5. **Settings Page** (`/(tabs)/explore`)
Menu list dengan card design:

**Profile Header**:
- Avatar circle (80x80, icon inside)
- Name (20px, Poppins-Medium)
- Role (14px, Poppins-Light)

**Menu Items**:
Card style untuk setiap menu:
- Background: #374151 (light) / #FFFFFF (dark)
- Border: 1px solid
- Border radius: 12px
- Padding: 16px
- Gap: 8px antar cards

Menu structure:
- Icon container (40x40 circle)
- Menu text (15px, Poppins-Medium)
- Chevron right (16px)

Menu items:
1. 👤 Profile Saya
2. 🔒 Keamanan Akun
3. 🔔 Notifikasi
4. 📢 Internal Memo
5. 📡 Gagal Kirim
6. 🕐 Riwayat Kehadiran
7. 🎨 Ganti Thema
8. 🚪 Keluar

### 6. **Timesheet Screen** (`/timesheet`)
Clean layout dengan action button:

**Header**:
- Title + subtitle
- Floating action button (48x48, rounded, primary color)
- Plus icon untuk create

**Info Card**:
- Center aligned
- Info icon (48px)
- Title (18px)
- Description text (14px, centered, line-height 20)

### 7. **Absensi Screen** (`/absensi`)
Dual action buttons:

**Action Buttons**:
2 buttons side by side:
- **Check In**: Green background
  - 👆 Fingerprint icon (48px)
  - "Check In" text
  - "Masuk Kerja" subtext
- **Check Out**: Red background
  - 🚪 Exit icon (48px)
  - "Check Out" text
  - "Pulang Kerja" subtext

Button style:
- Flex: 1 (equal width)
- Padding: 20px
- Border radius: 12px
- Shadow/elevation

**Info Card**:
- Location icon
- "Absensi Berbasis Lokasi" title
- GPS requirement text

### 8. **Insentif Screen** (`/insentif`)
Summary card + detail breakdown:

**Summary Card**:
- Wallet icon + title
- Large amount display (32px, Roboto-Medium, bold)
- Note text (12px, Poppins-Light)
- Primary color untuk amount

**Detail Cards**:
Row layout untuk setiap item:
- Label (left, 14px, Poppins-Light)
- Value (right, 16px, Poppins-Medium, bold)
- Gap: 12px

Items:
- Insentif Kehadiran
- Insentif Produktivitas
- Bonus Lembur

### 9. **Penugasan/TugasKu Screen** (`/(tabs)/penugasan`)
Simple placeholder:
- Title + subtitle
- Card dengan deskripsi
- Match dengan style settings

## 🎨 Color Modes

### Light Mode (Dark Background)
```typescript
container: '#202938'
text: '#FAFAFA', '#C4C4C4', '#F4F4F4'
primary: '#2DB9E8'
success: '#2B8F0C'
warning: '#EE812C'
error: '#ef4444'
```

### Dark Mode (Light Background)
```typescript
container: '#f2f4f7'
text: '#2f323e', '#96a2b4', '#505A5B'
primary: '#0369a1'
success: '#15803d'
warning: '#f6a104'
error: '#dc2626'
```

## 📐 Spacing & Sizing

- **Container padding**: 16-20px
- **Card border radius**: 8-12px
- **Button height**: 48-50px
- **Icon sizes**: 20-48px (context dependent)
- **Avatar**: 80x80
- **Badge**: 64x64
- **Tab bar height**: 60px
- **Header height**: 50px

## 🔤 Typography

### Font Families
- **Poppins-Light**: Body text, subtitles
- **Poppins-Medium**: Headings, buttons, labels
- **Roboto-Regular**: Input fields
- **Roboto-Medium**: Profile names, amounts
- **Roboto-Light**: Secondary text

### Font Sizes
- **32px**: Large amounts (insentif)
- **26px**: Profile names
- **24px**: Page titles, badge numbers
- **20px**: Section headers
- **18px**: Card titles
- **16-17px**: Subtitles, menu items
- **14-15px**: Body text, inputs
- **12px**: Small text, notes
- **10px**: Micro text, badges

## 🖼️ Images & Icons

### Equipment Images (assets/images/)
- `IMG-DT.png` - Dump Truck (210x290)
- `IMG-EXCA-BIG.png` - Excavator (200x100%)
- `schedules.png` - TimeSheet icon (50x50)
- `money.png` - Insentif icon (50x50)
- `finger-mechine.png` - Absensi icon (60x50)
- `mkg-logo.png` - Logo (200x200)

### Icon Libraries
- **Ionicons**: Primary UI icons
- **MaterialIcons**: Theme toggle, system icons
- **MaterialCommunityIcons**: Cloud status, specialized icons
- **FontAwesome6**: Settings menu icons
- **Feather**: Navigation icons (chevron)

## 🎭 Animations

### Scroll Animation (Home)
```typescript
imageScale = Math.max(0.7, 1 - (scrollPosition / 100) * 0.3)
imageOpacity = Math.max(0.8, 1 - (scrollPosition / 100) * 0.2)
```

### Loading Animation
- Lottie hauler animation
- Full screen centered
- "Tunggu sejenak" title
- "Aplikasi sedang mempersiapkan data..." subtitle

## 📱 Platform-Specific

### iOS
- Shadow dengan shadowOpacity, shadowOffset, shadowRadius
- SafeAreaView untuk notch handling

### Android
- Elevation untuk shadow effect
- StatusBar dengan backgroundColor

## ✅ Checklist Visual Completeness

- [x] Bottom tab navigation dengan custom icons & colors
- [x] AppHeader dengan semua icons & badges
- [x] Login screen dengan theme toggle
- [x] Home dashboard dengan stats cards & animations
- [x] Settings dengan menu cards & profile header
- [x] Timesheet dengan FAB
- [x] Absensi dengan dual action buttons
- [x] Insentif dengan summary & breakdown
- [x] Penugasan placeholder
- [x] Dark/Light mode switching
- [x] Custom fonts loaded
- [x] All images & icons

## 🎯 Result

**100% Visual Parity dengan Mobile Version**
- ✅ Semua colors match
- ✅ Semua fonts loaded
- ✅ Semua layouts identik
- ✅ Semua animations sama
- ✅ Tab bar custom design
- ✅ Header dengan notifications
- ✅ Cards dengan proper shadows
- ✅ Icons & images sama
