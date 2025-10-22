# Instalasi Dependencies

## Quick Install

```bash
cd /Users/makkuragatama/Project/nextjs/ai-project/mkg/expooprdrv
npm install
```

## Jika Ada Error

Jika terjadi error peer dependencies, gunakan:

```bash
npm install --legacy-peer-deps
```

## Menjalankan Project

```bash
# Start Expo development server
npm start

# Atau langsung ke platform
npm run android
npm run ios
```

## Verifikasi Instalasi

Setelah install selesai, pastikan tidak ada error dan jalankan:

```bash
npm start
```

Kemudian scan QR code dengan Expo Go app di device Anda.

## Troubleshooting

### Metro Bundler Cache Issues
```bash
npm start -- --clear
```

### Reset Project
```bash
npm run reset-project
```
