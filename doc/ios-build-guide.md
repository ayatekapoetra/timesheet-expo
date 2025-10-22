# iOS Production Build Guide untuk Expo OPRDRV

## 📋 Requirements yang Diperlukan:

### 1. Apple Developer Account
- Apple Developer Program membership ($99/tahun)
- Login: https://developer.apple.com

### 2. iOS Credentials
- Distribution Certificate
- Provisioning Profile
- App Store Connect setup

## 🔧 Setup Langkah demi Langkah:

### Langkah 1: Update app.json
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.makkuragatam.expooprdrv",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Aplikasi membutuhkan akses kamera untuk proses absensi (check in/out)",
        "NSMicrophoneUsageDescription": "Aplikasi membutuhkan akses mikrofon untuk fungsi kamera",
        "NSLocationWhenInUseUsageDescription": "Aplikasi membutuhkan lokasi untuk validasi area absensi",
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

### Langkah 2: Setup Apple Developer Account
1. Login ke https://developer.apple.com
2. Buat App ID baru:
    - Bundle ID: com.makkuragatam.expooprdrv
   - App Name: OPRDRV

### Langkah 3: Generate Distribution Certificate
```bash
# Generate CSR (Certificate Signing Request)
openssl req -nodes -newkey rsa:2048 -keyout ios_distribution.key -out ios_distribution.csr -subj "/email=your-email@example.com, CN=Your Name, C=ID"
```

### Langkah 4: Build Commands
```bash
# Interactive setup (recommended first time)
eas build --platform ios --profile production

# Non-interactive (setelah setup complete)
eas build --platform ios --profile production --non-interactive
```

## 🚀 Alternative: TestFlight Distribution

### Build untuk TestFlight:
```bash
eas build --platform ios --profile preview
```

### Upload ke TestFlight:
```bash
eas submit --platform ios --profile preview
```

## 📱 Cara Share iOS App:

### Opsi 1: TestFlight (Recommended)
- Upload ke TestFlight
- Invite testers via email
- Maximum 10,000 testers
- Free untuk developer

### Opsi 2: Ad-Hoc Distribution
- Maximum 100 devices
- Perlu device UDID
- Good untuk internal testing

### Opsi 3: App Store
- Public distribution
- Apple review process
- Global distribution

## 🔑 Quick Setup Commands:

```bash
# 1. Login ke EAS
eas login

# 2. Setup credentials (interactive)
eas credentials

# 3. Build app
eas build --platform ios --profile production

# 4. Submit ke TestFlight
eas submit --platform ios
```

## ⚠️ Important Notes:

1. **Apple Developer Account** WAJIB untuk build iOS production
2. **Bundle Identifier** harus unik di App Store
3. **App Name** harus tersedia di App Store
4. **Encryption Export Compliance** perlu di-set di App Store Connect
5. **App Review** bisa memakan waktu 1-7 hari

## 📋 Checklist Sebelum Build:

- [ ] Apple Developer Account aktif
- [ ] Bundle ID tersedia
- [ ] App icon dan splash screen
- [ ] Privacy policy (jika perlu)
- [ ] App metadata lengkap
- [ ] Test devices UDID (untuk Ad-Hoc)