# Changelog - Expo Operator Driver

## [1.0.1] - 2025-01-14

### ✨ Visual Design Update - 100% Match dengan Mobile

#### Added
- **AppHeader Component** dengan notification badge & theme toggle
- **Custom Bottom Tab Navigation** (TugasKu, Menu Utama, Pengaturan)
- **Settings/Pengaturan Page** dengan profile header & menu cards
- **Penugasan/TugasKu Page** placeholder
- **Timesheet Screen** dengan floating action button
- **Absensi Screen** dengan Check In/Out buttons
- **Insentif Screen** dengan summary & detail breakdown

#### Changed
- **Tab Bar Design**: Custom icons, colors, dan spacing identik dengan mobile
- **Home Screen**: Tambah AppHeader (sebelumnya tanpa header)
- **Navigation Structure**: 3-tab layout (TugasKu, Home, Settings)
- **Color Scheme**: 100% match dengan mobile (`appmode.txtcolor`, `appmode.container`)
- **Typography**: Konsisten dengan Poppins & Roboto

#### Visual Components Implemented
- ✅ Bottom tab dengan active/inactive states
- ✅ Header dengan back button, filter, theme, cloud status, notifications
- ✅ Profile avatar circle dalam settings
- ✅ Menu cards dengan icons & chevron
- ✅ Statistics cards dengan colored badges
- ✅ Action buttons dengan shadows
- ✅ Info cards dengan centered content
- ✅ Floating action button (FAB)
- ✅ Scroll animations (image zoom & opacity)

#### Technical Improvements
- Added `showsVerticalScrollIndicator={false}` untuk cleaner scroll
- Platform-specific shadows (iOS: shadow*, Android: elevation)
- Proper TypeScript types untuk semua components
- Reusable AppHeader component
- Consistent spacing & border radius

---

## [1.0.0] - 2025-01-13

### 🎉 Initial Migration dari React Native

#### Core Features
- **Redux State Management**: Auth, Theme, Equipment, Alert
- **Authentication**: Login screen dengan device UUID tracking
- **Home Dashboard**: Profile, statistics, menu buttons
- **API Integration**: Axios dengan interceptors
- **Assets**: 60+ images, custom fonts, lottie animations

#### Components
- AppScreen dengan SafeAreaView
- LoadingTruck dengan Lottie animation
- BtnMenuHome dengan dashed borders

#### Configuration
- API endpoints (`src/helpers/UriPath.ts`)
- Theme colors (`src/common/colorMode.ts`)
- Helper functions (`src/helpers/ThemesMode.ts`)

#### Dependencies
- Expo SDK ~54.0
- React Native 0.81.4
- Redux Toolkit ^2.5.0
- Axios ^1.7.9
- React Navigation ^7.x

---

## Roadmap

### Version 1.1.0 (Planned)
- [ ] Redux slices: lokasi, kegiatan, shift, cabang, dll
- [ ] Timesheet create/edit forms
- [ ] Absensi dengan location tracking & camera
- [ ] Insentif calculation logic
- [ ] Filter & search functionality

### Version 1.2.0 (Planned)
- [ ] Offline mode dengan SQLite
- [ ] Sync queue functionality
- [ ] Push notifications
- [ ] Voice input untuk timesheet
- [ ] Calendar picker

### Version 2.0.0 (Future)
- [ ] Advanced charts & graphs
- [ ] Performance optimization
- [ ] Background sync
- [ ] Biometric authentication
