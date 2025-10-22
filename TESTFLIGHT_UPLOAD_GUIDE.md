# TestFlight Upload Guide

## 🚀 Current Status
✅ IPA file berhasil di-download: `expooprdrv-testflight.ipa` (35.6MB)
❌ EAS Submit sedang outage untuk iOS
✅ File siap untuk manual upload

## 📱 Manual Upload Options

### Option 1: Transporter App (Recommended)
1. **Download Transporter** dari Mac App Store (jika belum ada)
2. **Buka Transporter app**
3. **Drag & drop** file `expooprdrv-testflight.ipa`
4. **Sign in** dengan Apple Developer account
5. **Click "Deliver"**
6. Tunggu upload selesai

### Option 2: App Store Connect (Web)
1. Login ke [App Store Connect](https://appstoreconnect.apple.com)
2. **My Apps** → Pilih "Expo OPR Driver" (atau create new app)
3. **TestFlight** tab
4. **Internal Testing** → **+** → **Add Build**
5. **Choose file** → Upload `expooprdrv-testflight.ipa`
6. Tunggu processing (1-2 jam)

### Option 3: Xcode Organizer
1. **Buka Xcode**
2. **Window** → **Organizer**
3. **Archives** tab
4. **Distribute App**
5. **App Store Connect**
6. **Upload** → Pilih IPA file

## 📋 Setelah Upload

### Setup TestFlight Internal Testing
1. **App Store Connect** → **TestFlight** → **Internal Testing**
2. **Add Testers**:
   - Masukkan email Apple ID
   - Role: Admin, App Manager, or Developer
   - Maximum 100 testers
3. **Send Invitations**
4. **Install TestFlight** di device tester
5. **Accept invitation** via email

## 🎯 Quick Steps

### Jika App Belum Ada di App Store Connect:
```bash
1. Login App Store Connect
2. My Apps → + → New App
3. Platform: iOS
4. Name: Expo OPR Driver
5. Bundle ID: com.makkuragatam.expooprdrv
6. SKU: EXPOOPRDRV001
```

### Jika App Sudah Ada:
```bash
1. Login App Store Connect
2. My Apps → Expo OPR Driver
3. TestFlight → Internal Testing
4. + Add Build
5. Upload expooprdrv-testflight.ipa
```

## ⏱ Timeline
- Upload: 5-15 menit
- Processing: 1-2 jam
- Testing: Ready setelah processing

## 📞 Next Steps
1. Upload IPA menggunakan salah satu method di atas
2. Add internal testers
3. Test di real devices
4. Collect feedback
5. Fix bugs jika ada

## 🔧 File Location
IPA file tersimpan di: `/Users/makkuragatama/Project/nextjs/ai-project/mkg/expooprdrv/expooprdrv-testflight.ipa`

---
*Ready to upload! 🚀*