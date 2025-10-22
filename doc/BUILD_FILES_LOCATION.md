# Build Files Location Guide

## 📱 Current Build Files

### ✅ Available Files
```
📱 iOS IPA (TestFlight): expooprdrv-testflight.ipa
📦 Size: 35.6 MB
📍 Location: /Users/makkuragatama/Project/nextjs/ai-project/mkg/expooprdrv/expooprdrv-testflight.ipa
🔗 Source: https://expo.dev/artifacts/eas/vF9B2xtjoneZCvgH1spmZz.ipa
🎯 Purpose: TestFlight Internal Testing

📱 Android APK (Preview): expooprdrv-preview.apk
📦 Size: 137 MB
📍 Location: /Users/makkuragatama/Project/nextjs/ai-project/mkg/expooprdrv/expooprdrv-preview.apk
🔗 Source: https://expo.dev/artifacts/eas/iVoqidMsWxEbc51dy3ytHa.apk
🎯 Purpose: Android Internal Testing
```

### ❌ Missing Files
```
📦 Android AAB (Production): NOT AVAILABLE
📍 Reason: Keystore configuration needed
🎯 Purpose: Google Play Store submission
```

---

## 🔍 How to Find Build Files

### Method 1: EAS Build List
```bash
# List all builds
eas build:list

# Filter by platform
eas build:list --platform=android
eas build:list --platform=ios

# Get download URL
eas build:view [BUILD_ID]
```

### Method 2: EAS Download
```bash
# Download specific build
eas build:download [BUILD_ID]

# Download latest build
eas build:download --latest
```

### Method 3: Local Build Output
```bash
# Android local builds
find android/app/build -name "*.aab" -o -name "*.apk"

# iOS local builds (jika build lokal)
find ios/build -name "*.ipa"
```

---

## 📂 Default File Locations

### EAS Build (Cloud Storage)
```
🌐 Location: Expo EAS Servers
🔗 Access: Via download URLs
📊 Dashboard: https://expo.dev/accounts/ayateka/projects/expooprdrv/builds
⏰ Retention: 90 days
```

### Local Android Builds
```
📱 APK: android/app/build/outputs/apk/release/app-release.apk
📦 AAB: android/app/build/outputs/bundle/release/app-release.aab
📊 Logs: android/app/build/outputs/logs/
```

### Local iOS Builds
```
📱 IPA: ios/build/Build/Products/Release-iphoneos/*.ipa
📊 Logs: ios/build/
```

---

## 🚀 Getting AAB File for Play Store

### Option 1: EAS Production Build (Recommended)
```bash
# Step 1: Configure keystore
eas credentials:configure-build --platform android

# Step 2: Build production AAB
eas build --platform android --profile production

# Step 3: Download when ready
# Link provided in build output
```

### Option 2: Local Gradle Build
```bash
# Build AAB locally
cd android
./gradlew bundleRelease

# Find the file
find . -name "*.aab"
# Expected: android/app/build/outputs/bundle/release/app-release.aab
```

### Option 3: Use Existing APK for Testing
```bash
# Current APK can be used for:
# ✅ Internal testing
# ✅ Device testing
# ❌ Play Store submission (needs AAB)
```

---

## 📋 Build Status Summary

### Recent Builds
| Build ID | Platform | Profile | Status | File |
|----------|----------|---------|--------|------|
| 6aaf4b5a-6346-49da-b5a8-1f1d42a16380 | iOS | production | in queue | - |
| f050549c-acb3-460d-a9ec-e6adbeb83fd3 | iOS | production | finished | ✅ IPA |
| 911f97da-5637-42b3-8a9f-e09e2d0a543f | Android | preview | finished | ✅ APK |

### Next Actions
1. **Monitor iOS build**: Check completion of build 6aaf4b5a-6346-49da-b5a8-1f1d42a16380
2. **Configure Android keystore**: Setup for AAB production build
3. **Test existing files**: Use current APK/IPA for testing

---

## 🔧 Quick Commands

### Check Current Files
```bash
# List build files
ls -la expooprdrv-*

# Check file sizes
du -h expooprdrv-*
```

### Download from EAS
```bash
# iOS IPA
curl -L -o expooprdrv-ios.ipa "https://expo.dev/artifacts/eas/vF9B2xtjoneZCvgH1spmZz.ipa"

# Android APK
curl -L -o expooprdrv-android.apk "https://expo.dev/artifacts/eas/iVoqidMsWxEbc51dy3ytHa.apk"
```

### Build New Files
```bash
# iOS production
eas build --platform ios --profile production

# Android production (needs keystore)
eas build --platform android --profile production
```

---

*Last Updated: October 22, 2025*
*Files Location: /Users/makkuragatama/Project/nextjs/ai-project/mkg/expooprdrv/*