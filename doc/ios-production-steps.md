# 🍏 iOS Production Build - Langkah demi Langkah

## ✅ Status Saat Ini:
- ✅ Preview build berhasil (simulator)
- ✅ Link preview tersedia
- ❌ Production build perlu credentials setup

## 📋 Langkah-Langkah Production Build:

### 1. Apple Developer Account (WAJIB)
```bash
# Jika belum punya:
# 1. Daftar di https://developer.apple.com/programs/
# 2. Bayar $99/tahun
# 3. Verifikasi email dan identitas
```

### 2. Setup App di App Store Connect
```bash
# 1. Login ke https://appstoreconnect.apple.com
# 2. Buat App baru:
#    - Name: OPRDRV
#    - Bundle ID: com.makkuragatam.expooprdrv
#    - Platform: iOS
#    - Category: Business atau Productivity
```

### 3. Generate Distribution Certificate
```bash
# Di Mac Anda:
# 1. Buka Keychain Access
# 2. Keychain Access > Certificate Assistant > Request a Certificate From a Certificate Authority
# 3. Email: email@developer.com
# 4. Common Name: OPRDRV Distribution
# 5. Save CSR file
```

### 4. Create Provisioning Profile
```bash
# Di Apple Developer Portal:
# 1. Certificates, Identifiers & Profiles
# 2. Profiles > Distribution
# 3. Create new profile:
#    - Type: App Store
#    - App ID: com.makkuragatam.expooprdrv
#    - Certificate: Pilih certificate yang dibuat
```

### 5. Build Commands
```bash
# Interactive setup (pertama kali)
eas build --platform ios --profile production

# Setelah setup complete
eas build --platform ios --profile production --non-interactive
```

## 🚀 Alternative: TestFlight (Recommended untuk Testing)

### Build untuk TestFlight:
```bash
eas build --platform ios --profile preview
```

### Upload ke TestFlight:
```bash
eas submit --platform ios
```

## 📱 Cara Share iOS App:

### ✅ Cara 1: Preview Build (Sudah Available)
- **Link**: https://expo.dev/accounts/ayateka/projects/expooprdrv/builds/581184dd-c818-4a95-bbe9-facec2d1bbe3
- **Cara pakai**: Buka link di iPhone/iPad
- **Limit**: Hanya untuk simulator development

### 🎯 Cara 2: TestFlight (Best untuk Team Testing)
1. Build dengan `eas build --platform ios --profile preview`
2. Submit ke TestFlight dengan `eas submit --platform ios`
3. Invite testers via email
4. Maximum 10,000 testers
5. Free untuk developer

### 🏪 Cara 3: App Store Production
1. Setup Apple Developer Account
2. Build production dengan credentials
3. Submit ke App Store
4. Review process 1-7 hari
5. Global distribution

## 🔧 Quick Commands:

```bash
# 1. Preview build (untuk testing)
eas build --platform ios --profile preview

# 2. Production build (butuh credentials)
eas build --platform ios --profile production

# 3. Submit ke TestFlight
eas submit --platform ios

# 4. Submit ke App Store
eas submit --platform ios --profile production
```

## 📋 Requirements Checklist:

### Untuk Preview Build:
- [x] ✅ Expo account
- [x] ✅ Basic app configuration
- [x] ✅ Link preview available

### Untuk Production Build:
- [ ] ❌ Apple Developer Account ($99/tahun)
- [ ] ❌ Distribution Certificate
- [ ] ❌ Provisioning Profile
- [ ] ❌ App Store Connect setup
- [ ] ❌ App metadata lengkap

## 💡 Rekomendasi:

1. **Untuk Internal Testing**: Gunakan preview build + TestFlight
2. **Untuk Client Demo**: Gunakan TestFlight (lebih professional)
3. **Untuk Public Release**: Gunakan App Store production

## 🎉 Next Steps:

1. **Testing Sekarang**: Share preview build link ke team
2. **Setup Apple Developer**: Jika mau production build
3. **TestFlight Setup**: Untuk distribusi yang lebih mudah

---

## 📞 Link Preview Build (Sudah Siap!):

**URL**: https://expo.dev/accounts/ayateka/projects/expooprdrv/builds/581184dd-c818-4a95-bbe9-facec2d1bbe3

**Cara Pakai**:
1. Buka link di iPhone/iPad Safari
2. Tap "Install" 
3. Follow instructions
4. App akan terinstall di device

**Note**: Preview build hanya untuk development, tidak untuk production distribusi.