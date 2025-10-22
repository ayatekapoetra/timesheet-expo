# Setup Guide - Expo Operator Driver App

## Migrasi dari React Native ke Expo

Project ini telah dimigrasikan dari React Native (`mobile` folder) ke Expo dengan konfigurasi dan dependencies yang telah disesuaikan.

## Dependencies yang Telah Diupdate

### Core Dependencies (Updated)
- **Redux Toolkit**: `@reduxjs/toolkit@^2.5.0` (from v1.9.6)
- **React Redux**: `react-redux@^9.2.0` (from v8.1.3)
- **Redux**: `redux@^5.0.1` (from v4.2.1)
- **Redux Thunk**: `redux-thunk@^3.1.0` (from v2.4.2)
- **Axios**: `axios@^1.7.9` (from v1.6.2)
- **Moment**: `moment@^2.30.1` (from v2.29.4)
- **UUID**: `uuid@^11.0.3` (from v13.0.0)
- **Yup**: `yup@^1.7.1` (maintained)
- **Formik**: `formik@^2.4.6` (maintained)

### Navigation (Expo Compatible)
- **React Navigation Native**: `@react-navigation/native@^7.1.8`
- **React Navigation Bottom Tabs**: `@react-navigation/bottom-tabs@^7.4.0`
- **React Navigation Stack**: `@react-navigation/stack@^7.4.0`
- **React Navigation Native Stack**: `@react-navigation/native-stack@^7.4.0`
- **Expo Router**: `expo-router@~6.0.11`

### Expo Specific
- **Expo SDK**: `expo@~54.0.13`
- **Expo Location**: `expo-location@~18.0.6` (replaces @react-native-community/geolocation)
- **Expo Image Picker**: `expo-image-picker@~16.0.5` (replaces react-native-image-picker)
- **Expo Secure Store**: `expo-secure-store@~14.0.0` (for secure storage)
- **Expo Device**: `expo-device@~7.0.1` (replaces react-native-device-info)
- **Expo Font**: `expo-font@~14.0.9` (for custom fonts)
- **Lottie React Native**: `lottie-react-native@^7.2.0` (updated for Expo)

### React Native Community (Maintained)
- **Async Storage**: `@react-native-async-storage/async-storage@^2.1.0`
- **NetInfo**: `@react-native-community/netinfo@^11.4.1`
- **Geolocation**: `@react-native-community/geolocation@^3.4.0`
- **Masked View**: `@react-native-masked-view/masked-view@^0.3.1`

### UI & Charts
- **React Native Calendars**: `react-native-calendars@^1.1307.0`
- **React Native Gifted Charts**: `react-native-gifted-charts@^1.4.48`
- **React Native Maps**: `react-native-maps@~2.2.0` (Expo version)
- **React Native SVG**: `react-native-svg@^16.9.0`

### Utilities
- **Geolib**: `geolib@^3.3.4`
- **Underscore**: `underscore@^1.13.7`

## Structure yang Telah Dibuat

```
expooprdrv/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   ├── _layout.tsx        # Root layout dengan Redux Provider
│   └── modal.tsx
├── assets/
│   ├── fonts/             # Custom fonts dari mobile
│   ├── images/            # Semua images dari mobile
│   │   └── index.ts       # Image exports
│   └── lottie/            # Lottie animations
├── src/
│   ├── common/
│   │   └── colorMode.ts   # App color themes
│   ├── helpers/
│   │   ├── ApiFetch.ts    # Axios instance dengan interceptors
│   │   └── UriPath.ts     # API endpoints configuration
│   ├── redux/
│   │   ├── store.ts       # Redux store
│   │   ├── hooks.ts       # Typed Redux hooks
│   │   ├── authSlice.ts   # Authentication slice
│   │   └── themeSlice.ts  # Theme slice
│   └── services/
│       └── NetworkService.ts  # Network connectivity service
└── package.json           # Updated dependencies
```

## API Configuration

File: `src/helpers/UriPath.ts`
```typescript
export const URIPATH = {
  apiuri: 'http://192.168.1.4:3003/api/',
  apiphoto: 'http://192.168.1.4:3003/',
};
```

Endpoint sama dengan project mobile.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd expooprdrv
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Emulator**
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   ```

## Design & Assets

- **Fonts**: Poppins & Roboto (sama dengan mobile)
- **Images**: Semua images dari mobile telah di-copy
- **Colors**: Color scheme sama (dark/light mode support)
- **Icons**: Menggunakan `@expo/vector-icons`

## Key Changes dari React Native

1. **Navigation**: Menggunakan Expo Router file-based routing
2. **Device Info**: Menggunakan `expo-device` instead of `react-native-device-info`
3. **Image Picker**: Menggunakan `expo-image-picker`
4. **Location**: Menggunakan `expo-location` (optional, geolocation masih tersedia)
5. **Fonts**: Menggunakan `expo-font` untuk custom fonts
6. **Redux**: Updated ke latest stable versions

## Environment Setup

Pastikan environment Anda memiliki:
- Node.js >= 18
- Expo CLI
- Android Studio (untuk Android development)
- Xcode (untuk iOS development, hanya di macOS)

## Next Steps

1. Migrate screens dari mobile ke Expo Router structure
2. Setup authentication flow
3. Implement offline mode dengan SQLite (optional)
4. Configure push notifications
5. Setup Expo EAS Build untuk production builds
