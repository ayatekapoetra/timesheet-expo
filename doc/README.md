# Expo Operator Driver App

Mobile application untuk operator dan driver equipment menggunakan Expo & React Native.

## 🚀 Quick Start

```bash
cd expooprdrv
npm install
npm start
```

Scan QR code dengan Expo Go app atau:
```bash
npm run android  # untuk Android
npm run ios      # untuk iOS
```

## 📁 Project Structure

```
expooprdrv/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   └── index.tsx      # Home screen
│   ├── auth/
│   │   └── login.tsx      # Login screen
│   └── _layout.tsx        # Root layout
├── assets/
│   ├── fonts/             # Poppins, Roboto
│   ├── images/            # 60+ equipment images
│   └── lottie/            # Loading animations
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AppScreen.tsx
│   │   ├── BtnMenuHome.tsx
│   │   └── LoadingTruck.tsx
│   ├── helpers/
│   │   ├── ApiFetch.ts    # Axios config
│   │   ├── UriPath.ts     # API endpoints
│   │   └── ThemesMode.ts  # Color themes
│   └── redux/
│       ├── store.ts
│       ├── authSlice.ts
│       ├── themeSlice.ts
│       └── equipmentSlice.ts
└── package.json
```

## ✨ Features

### Implemented ✅
- **Authentication**: Login dengan username/password + device UUID
- **Home Dashboard**: Profile, statistics cards, menu buttons dengan animations
- **AppHeader**: Custom header dengan notifications, theme toggle, sync status
- **Bottom Navigation**: 3-tab layout (TugasKu, Menu Utama, Pengaturan)
- **Settings Page**: Profile header, menu cards dengan icons
- **Timesheet Screen**: List view dengan floating action button
- **Absensi Screen**: Check In/Out buttons berbasis lokasi
- **Insentif Screen**: Summary card + detail breakdown
- **Dark/Light Mode**: Full theme switching dengan persistent storage
- **Redux State**: Auth, theme, equipment, alert
- **API Integration**: Axios dengan interceptors & AsyncStorage cache
- **Visual Design**: **100% match dengan mobile version**

### Coming Soon 🚧
- Timesheet create/edit forms
- Attendance dengan location tracking & camera
- Insentif calculation dengan real data
- Offline mode dengan SQLite
- Push notifications
- Filter & search functionality

## 🎨 Design System

### Colors
- **Light Mode**: Dark background (#202938)
- **Dark Mode**: Light background (#f2f4f7)
- **Primary**: Blue (#2DB9E8)
- **Success**: Green (#2B8F0C)
- **Warning**: Orange (#EE812C)

### Fonts
- **Poppins**: Light, Medium, SemiBold
- **Roboto**: Regular, Medium, Light

## 🔧 Configuration

### API Endpoint
Edit `src/helpers/UriPath.ts`:
```typescript
export const URIPATH = {
  apiuri: 'http://192.168.1.4:3003/api/',
  apiphoto: 'http://192.168.1.4:3003/',
};
```

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Full migration details
- [Features Status](./FEATURES.md) - Feature implementation checklist
- [Visual Guide](./VISUAL_GUIDE.md) - Complete visual design specifications
- [Changelog](./CHANGELOG.md) - Version history & updates
- [Install Guide](./INSTALL.md) - Installation instructions

## 🛠️ Tech Stack

- **Expo SDK**: ~54.0
- **React Native**: 0.81.4
- **TypeScript**: ~5.9.2
- **Redux Toolkit**: ^2.5.0
- **Axios**: ^1.7.9
- **React Navigation**: ^7.x
- **Expo Router**: ~6.0.11
- **Lottie**: ^7.2.0

## 📱 Compatibility

- **iOS**: 13.0+
- **Android**: 6.0+ (API 23+)
- **Node.js**: 18+

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

Private - MKG Internal Use Only
