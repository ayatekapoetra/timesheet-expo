# Build Instructions for Expo OPRDRV App

## Cara 1: Development Sharing (Mudah & Cepat)

### Langkah-langkah:
1. Jalankan development server dengan tunnel:
   ```bash
   npx expo start --tunnel
   ```

2. Share link tunnel yang dihasilkan (format: exp://xxx.tunnel.expo.dev:80)

3. Pengguna bisa install Expo Go dan scan QR code

### Keuntungan:
- ✅ Instant sharing
- ✅ No build process
- ✅ Real-time updates
- ✅ Gratis

### Kekurangan:
- ❌ Memerlukan Expo Go
- ❌ Tidak offline
- ❌ Ukuran app besar

---

## Cara 2: Build APK Production

### Persiapan:
1. Setup Android Keystore:
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Update eas.json dengan credentials:
   ```bash
   eas credentials
   ```

### Build Commands:
```bash
# Build preview APK (internal testing)
eas build --platform android --profile preview

# Build production APK (Google Play)
eas build --platform android --profile production
```

### Download & Share:
1. Download dari link EAS build results
2. Upload ke Google Drive, Dropbox, atau file sharing
3. Share link download

---

## Cara 3: Web Build

### Build:
```bash
npx expo export --platform web
```

### Deploy:
- Upload ke Netlify, Vercel, atau GitHub Pages
- Share URL web app

---

## Cara 4: App Store/Play Store

### Requirements:
- Apple Developer Account ($99/tahun)
- Google Play Console Account ($25 sekali)

### Build & Submit:
```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios

# Android  
eas build --platform android --profile production
eas submit --platform android
```

---

## Rekomendasi untuk Development:

1. **Testing Team**: Gunakan Cara 1 (Expo Go + Tunnel)
2. **Client Demo**: Gunakan Cara 2 (APK Preview)  
3. **Production**: Gunakan Cara 4 (App Store/Play Store)