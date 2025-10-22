# Build & Release Apps Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [iOS Release](#ios-release)
- [Android Release](#android-release)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This document covers the complete process of building and releasing the Expo React Native app `expooprdrv` to both Apple App Store/TestFlight and Google Play Store.

### Project Information
- **Project Name**: expooprdrv
- **Bundle ID**: `com.makkuragatam.expooprdrv`
- **Current Version**: `1.0.1`
- **Build Number**: `1`
- **EAS Project ID**: `717802b8-1446-48ce-8995-99385258c2c4`
- **Expo SDK**: `54.0.0`
- **React Native**: `81` (New Architecture enabled)

---

## 📚 Prerequisites

### Required Accounts & Subscriptions

#### Apple Developer Account
- **Cost**: $99/year
- **Registration**: [developer.apple.com](https://developer.apple.com)
- **Verification Time**: 1-2 business days
- **Required for**: App Store distribution, TestFlight

#### Google Play Console
- **Cost**: $25 (one-time)
- **Registration**: [play.google.com/console](https://play.google.com/console)
- **Verification Time**: 1-2 business days
- **Required for**: Play Store distribution

### Development Environment
```bash
# Required tools
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
eas --version   # >= 3.0.0

# Install EAS CLI if not installed
npm install -g eas-cli

# Login to EAS
eas login
```

---

## 🔨 Build Process

### Build Profiles Configuration

The project uses the following build profiles in `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### Build Commands

#### Development Builds
```bash
# Development build with Expo Go
eas build --profile development

# Development build for specific platform
eas build --platform ios --profile development
eas build --platform android --profile development
```

#### Preview Builds (Testing)
```bash
# Preview build for internal testing
eas build --profile preview

# Platform-specific preview builds
eas build --platform ios --profile preview    # For TestFlight
eas build --platform android --profile preview # For internal testing
```

#### Production Builds (Store Release)
```bash
# Production build for app stores
eas build --profile production

# Platform-specific production builds
eas build --platform ios --profile production    # For App Store
eas build --platform android --profile production # For Play Store
```

### Build Status Monitoring

```bash
# List all builds
eas build:list

# Check specific build status
eas build:list --limit=5 --platform=ios
eas build:list --limit=5 --platform=android

# View build logs
eas build:view [BUILD_ID]
```

---

## 🍎 iOS Release

### Step 1: Build iOS Production

```bash
# Build IPA for App Store
eas build --platform ios --profile production

# Example output:
# Build ID: 6aaf4b5a-6346-49da-b5a8-1f1d42a16380
# Status: in queue/finished
# Download: https://expo.dev/artifacts/eas/vF9B2xtjoneZCvgH1spmZz.ipa
```

### Step 2: Submit to App Store Connect

```bash
# Submit to App Store (after build completion)
eas submit --platform ios --profile production
```

### Step 3: App Store Connect Setup

#### Create New App
1. Login to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to **My Apps** → **+** → **New App**
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: Expo OPR Driver
   - **Primary Language**: English
   - **Bundle ID**: `com.makkuragatam.expooprdrv`
   - **SKU**: EXPOOPRDRV001

#### TestFlight Configuration
1. **Internal Testing**:
   - Upload IPA build
   - Add internal testers (max 100)
   - Wait for processing (1-2 hours)
   
2. **External Testing** (Optional):
   - Create external testing group
   - Add external testers
   - Submit for review (24-48 hours)

#### App Store Submission
1. **App Information**:
   - App name, description, keywords
   - Category: Business or Productivity
   - Age rating

2. **App Metadata**:
   - App icon: 1024x1024 PNG
   - Screenshots: All device sizes required
   - Privacy policy URL
   - Support URL
   - Marketing URL (optional)

3. **Pricing & Availability**:
   - Price: Free or Paid
   - Availability: All countries or specific
   - Release date

4. **Review Submission**:
   - Complete all required fields
   - Submit for Review
   - Review time: 1-7 business days

### iOS Build Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Build | 30-60 minutes | EAS build process |
| Upload | 5-10 minutes | Transfer to App Store Connect |
| Processing | 1-2 hours | Apple processing |
| TestFlight Review | 1-2 hours | Internal testing approval |
| App Store Review | 1-7 days | Full review process |

---

## 🤖 Android Release

### Step 1: Configure Android Keystore

#### Option A: Generate New Keystore
```bash
# Generate new keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore expooprdrv.jks \
  -alias expooprdrv \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Move keystore to project directory
mv expooprdrv.jks ./keystore/
```

#### Option B: Configure Existing Keystore
```bash
# Configure keystore with EAS
eas credentials:configure-build --platform android

# Follow prompts to provide:
# - Keystore file path
# - Keystore password
# - Key alias
# - Key password
```

### Step 2: Build Android Production

```bash
# Build AAB for Play Store
eas build --platform android --profile production

# Example output:
# Build ID: [BUILD_ID]
# Status: finished
# Download: https://expo.dev/artifacts/eas/[BUILD_ID].aab
```

### Step 3: Submit to Google Play

```bash
# Submit to Play Store (after build completion)
eas submit --platform android --profile production
```

### Step 4: Google Play Console Setup

#### Create New App
1. Login to [Google Play Console](https://play.google.com/console)
2. Click **Create app**
3. Fill in app details:
   - **App name**: Expo OPR Driver
   - **Package name**: `com.makkuragatam.expooprdrv`
   - **App language**: English
   - **Free or paid**: Free
   - **App category**: Business

#### Store Listing
1. **Store presence**:
   - App name (30 characters)
   - Short description (80 characters)
   - Full description (4000 characters)
   
2. **Graphics**:
   - App icon: 512x512 PNG
   - Feature graphic: 1024x500 JPG
   - Screenshots: 2-8 per device type
   
3. **Categorization**:
   - Category: Business
   - Tags: Relevant keywords

#### Content Rating
1. Complete content rating questionnaire
2. Get IARC rating certificate
3. Apply rating to all regions

#### Release Tracks

##### Internal Testing
```bash
# Upload AAB to internal testing
# Add tester email addresses
# Opt-in URL for testers
```

##### Closed Testing
```bash
# Create testing track
# Add testers via email or Google Groups
# Manage test versions
```

##### Open Testing
```bash
# Public beta testing
# Available to anyone who joins
# Collect feedback before full release
```

##### Production Release
```bash
# Full public release
# Requires review approval
# Rollout percentage control
```

### Android Build Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Build | 20-40 minutes | EAS build process |
| Upload | 5-10 minutes | Transfer to Play Console |
| Processing | 30-60 minutes | Google processing |
| Internal Testing | Immediate | No review required |
| Production Review | 1-3 days | Full review process |

---

## 🛠 Troubleshooting

### Common Build Issues

#### iOS Build Issues
```bash
# Issue: Build stuck in queue
eas build:list --platform=ios
# Check build logs for errors

# Issue: Code signing errors
eas credentials:configure-build --platform=ios
# Verify Apple Developer certificates

# Issue: Missing entitlements
# Check app.json for required permissions
```

#### Android Build Issues
```bash
# Issue: Keystore configuration errors
eas credentials:configure-build --platform android
# Verify keystore file and passwords

# Issue: Gradle build failures
# Check android/gradle.properties
# Verify Android SDK installation

# Issue: New Architecture compatibility
# Temporarily disable in app.json if needed:
# "newArchEnabled": false
```

### Submission Issues

#### App Store Rejections
- **Common reasons**: Missing metadata, incomplete screenshots, policy violations
- **Solution**: Review rejection reasons, fix issues, resubmit

#### Play Store Rejections
- **Common reasons**: Permission misuse, security issues, policy violations
- **Solution**: Address policy compliance, update app, resubmit

---

## 📋 Best Practices

### Pre-Release Checklist

#### Code Quality
```bash
# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run tests
npm test

# Check bundle size
npx expo-optimize
```

#### Testing
- [ ] Manual testing on real devices
- [ ] Test all major features
- [ ] Test offline functionality
- [ ] Test permissions handling
- [ ] Test crash scenarios

#### Store Assets
- [ ] App icons in all required sizes
- [ ] Screenshots for all device types
- [ ] Feature graphics
- [ ] Privacy policy
- [ ] Support documentation

### Version Management

#### Semantic Versioning
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

#### Version Increment Strategy
```bash
# Patch version (bug fixes)
npm version patch  # 1.0.1 → 1.0.2

# Minor version (new features)
npm version minor  # 1.0.1 → 1.1.0

# Major version (breaking changes)
npm version major  # 1.0.1 → 2.0.0
```

### Release Strategy

#### Staged Rollout
1. **Internal Testing**: Development team only
2. **Closed Testing**: Selected beta users
3. **Open Testing**: Public beta
4. **Production**: Full release with staged rollout

#### Rollout Planning
```bash
# Android staged rollout
# Week 1: 1% of users
# Week 2: 5% of users
# Week 3: 20% of users
# Week 4: 100% of users

# iOS immediate release
# All users at once (no staged rollout)
```

---

## 📊 Current Build Status

### Recent Builds

| Build ID | Platform | Profile | Status | Download |
|----------|----------|---------|--------|----------|
| 6aaf4b5a-6346-49da-b5a8-1f1d42a16380 | iOS | production | in queue | - |
| f050549c-acb3-460d-a9ec-e6adbeb83fd3 | iOS | production | finished | [IPA](https://expo.dev/artifacts/eas/vF9B2xtjoneZCvgH1spmZz.ipa) |
| 911f97da-5637-42b3-8a9f-e09e2d0a543f | Android | preview | finished | [APK](https://expo.dev/artifacts/eas/iVoqidMsWxEbc51dy3ytHa.apk) |

### Next Actions

1. **Monitor iOS Build**: Check completion of build `6aaf4b5a-6346-49da-b5a8-1f1d42a16380`
2. **Configure Android Keystore**: Set up credentials for production builds
3. **Test Existing Builds**: Use available preview builds for testing
4. **Prepare Store Metadata**: Create app descriptions and assets

---

## 📞 Support & Resources

### Documentation
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect Guide](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

### Useful Commands
```bash
# Quick build status
eas build:list --limit=3

# Project configuration
eas config

# Credentials management
eas credentials

# Environment variables
eas env:list
```

### Emergency Contacts
- **EAS Support**: Through Expo dashboard
- **Apple Developer Support**: developer.apple.com/support
- **Google Play Support**: support.google.com/googleplay

---

*Last Updated: October 21, 2025*
*Document Version: 1.0.0*