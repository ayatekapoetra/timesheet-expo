# 📱 Upload ke TestFlight - Complete Guide

## Langkah 1: Cek App Store Connect

1. Login ke: https://appstoreconnect.apple.com
2. Klik "My Apps"
3. Cari app dengan Bundle ID: `com.makkuragatam.expooprdrv`

### Jika App BELUM ADA:
1. Klik tombol "+" → "New App"
2. Isi form:
   - Platform: iOS
   - Name: Expo OPR Driver (atau nama lain)
   - Primary Language: English
   - Bundle ID: `com.makkuragatam.expooprdrv`
   - SKU: EXPOOPRDRV001 (atau kode unik lain)
3. Klik "Create"

### Jika App SUDAH ADA:
Lanjut ke Langkah 2

---

## Langkah 2: Upload IPA via Transporter

### Option A: Using Transporter App (Recommended)

1. **Download Transporter:**
   - Buka Mac App Store
   - Cari "Transporter"
   - Download & Install (gratis)

2. **Upload IPA:**
   - Buka Transporter app
   - Sign in dengan Apple ID Anda
   - Klik tombol "+" atau drag & drop file IPA
   - IPA File: https://expo.dev/artifacts/eas/uRorWK5wQMnHBwtqbgRbci.ipa
   - Klik "Deliver"
   - Tunggu upload selesai (5-10 menit)

### Option B: Using Command Line (Alternative)

```bash
# Download IPA
curl -L -o expooprdrv.ipa https://expo.dev/artifacts/eas/uRorWK5wQMnHBwtqbgRbci.ipa

# Upload via xcrun (memerlukan Xcode)
xcrun altool --upload-app \
  --type ios \
  --file expooprdrv.ipa \
  --username "YOUR_APPLE_ID" \
  --password "APP_SPECIFIC_PASSWORD"
```

**Note:** Untuk app-specific password:
- Login ke https://appleid.apple.com
- Security → App-Specific Passwords
- Generate new password

---

## Langkah 3: Tunggu Processing

Setelah upload:
1. IPA akan diproses oleh Apple (5-15 menit)
2. Anda akan dapat email notification
3. Build akan muncul di TestFlight tab

---

## Langkah 4: Setup TestFlight

1. Di App Store Connect, buka app Anda
2. Klik tab "TestFlight"
3. Build baru akan muncul di "iOS Builds"
4. Klik build tersebut

### Add Internal Testers:
1. Klik "Internal Testing" di sidebar
2. Klik "+" untuk add tester
3. Masukkan email Anda
4. Klik "Add"
5. Centang build yang ingin di-test
6. Email invitation akan dikirim

### Export Compliance:
Jika ditanya tentang encryption:
- Pilih "No" jika app tidak menggunakan encryption khusus
- Atau ikuti wizard yang ada

---

## Langkah 5: Install di iPhone

1. **Download TestFlight app:**
   - Buka App Store di iPhone
   - Cari "TestFlight"
   - Download (gratis dari Apple)

2. **Accept Invitation:**
   - Cek email untuk invitation
   - Tap "View in TestFlight"
   - Atau buka TestFlight app dan lihat available apps

3. **Install App:**
   - Di TestFlight app, tap app Anda
   - Tap "Install"
   - App akan terinstall

4. **Test App:**
   - Buka app dari home screen
   - Test semua fitur termasuk kamera!

---

## Troubleshooting

### "Build tidak muncul di TestFlight"
- Tunggu 5-15 menit untuk processing
- Cek email untuk notification
- Refresh halaman App Store Connect

### "Invalid Binary"
- Pastikan Bundle ID match
- Pastikan version & build number unik
- Cek error di email notification

### "Missing Compliance"
- Lengkapi export compliance questionnaire
- Biasanya pilih "No" untuk internal use

