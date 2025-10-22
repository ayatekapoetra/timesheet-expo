# Fitur Download Data Master

## 📋 **Deskripsi Fitur**
Fitur ini memungkinkan user untuk melakukan download manual data master dari API ke SQLite untuk memastikan ketersediaan data offline dan kontrol atas sinkronisasi data.

## 🎯 **Data yang Didownload**
1. **Kategori** - Data kategori pekerjaan (Barging, Mining, Rental)
2. **Cabang** - Data cabang perusahaan
3. **Penyewa** - Data penyewa/customer
4. **Equipment** - Data alat berat beserta kategori
5. **Shift** - Data shift kerja
6. **Longshift** - Data longshift
7. **Kegiatan** - Data jenis kegiatan dengan filter equipment
8. **Material** - Data material dengan koefisien
9. **Lokasi** - Data lokasi kerja (PIT, STP, PLG, dll)
10. **Timesheet Saya** - Top 10 timesheet milik user

## 🎨 **Komponen UI**

### 1. **Header Section**
- Informasi sinkronisasi terakhir
- Timestamp kapan terakhir download

### 2. **Download All Button**
- Tombol untuk download semua data sekaligus
- Progress indicator saat proses berlangsung
- Status visual (loading/success/error)

### 3. **Data Items List**
Setiap item data memiliki:
- **Icon** sesuai jenis data
- **Nama data** (Kategori, Equipment, dll)
- **Progress bar** dengan warna status:
  - 🔵 Blue = Loading
  - 🟢 Green = Success  
  - 🔴 Red = Error
  - ⚪ Gray = Pending
- **Status text** (Berhasil/Gagal/Mengunduh...)
- **Jumlah data** yang berhasil didownload
- **Error message** dengan tombol retry (jika gagal)
- **Action button** (Download/Update)

## 🔧 **Fitur Utama**

### 1. **Download Individual**
User dapat mendownload data satu per satu dengan menekan tombol pada setiap item.

### 2. **Download All**
Download semua data master sekaligus dengan satu tombol.

### 3. **Error Handling**
- Menampilkan pesan error spesifik untuk setiap item
- Tombol retry untuk mencoba kembali download yang gagal
- Visual feedback yang jelas untuk status error

### 4. **Progress Tracking**
- Real-time progress bar untuk setiap item
- Status update saat proses berlangsung
- Informasi jumlah data yang berhasil diunduh

### 5. **Offline Support**
- Data tersimpan di SQLite untuk akses offline
- Timestamp last sync untuk tracking
- Fallback ke data lokal jika API tidak accessible

## 📱 **User Experience Flow**

1. **Buka Screen** → User masuk ke Download Data screen
2. **Lihat Status** → Melihat status dan jumlah data saat ini
3. **Pilih Aksi**:
   - **Download All** untuk semua data
   - **Download Individual** untuk data spesifik
4. **Monitor Progress** → Melihat progress real-time
5. **Handle Error** → Jika gagal, bisa retry per item
6. **Selesai** → Data tersimpan dan tersedia offline

## 🛠️ **Technical Implementation**

### Redux State Management
```javascript
{
  downloadStatus: {
    kategori: 'success',
    equipment: 'loading',
    kegiatan: 'error'
  },
  isDownloading: false,
  lastSyncTime: '2025-01-17T10:30:00Z',
  errors: {
    kegiatan: 'Network timeout'
  },
  dataCounts: {
    kategori: 3,
    equipment: 15
  }
}
```

### API Endpoints
- `GET /master/kategori` → Kategori data
- `GET /master/cabang/list` → Cabang data
- `GET /master/penyewa/list` → Penyewa data
- `GET /master/equipment/list` → Equipment data
- `GET /master/shift/list` → Shift data
- `GET /master/longshift/list` → Longshift data
- `GET /master/kegiatan` → Kegiatan data
- `GET /master/material-ritase/list` → Material data
- `GET /master/lokasi-kerja/list` → Lokasi data
- `GET /timesheet/my-top10` → Top 10 timesheet user

### SQLite Tables
- `kategoris` - Data kategori
- `cabangs` - Data cabang
- `penyewas` - Data penyewa
- `equipments` - Data equipment
- `shifts` - Data shift
- `longshifts` - Data longshift
- `kegiatans` - Data kegiatan (dengan grpequipment)
- `materials` - Data material (dengan coefisien)
- `lokasis` - Data lokasi (dengan type)
- `timesheets` - Data timesheet

## 🎨 **Visual Design**

### Color Scheme
- **Loading**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Pending**: Gray (#6b7280)

### Animations
- Spinning icon untuk loading state
- Smooth progress bar transitions
- Fade in/out untuk status changes

### Responsive Design
- Optimized untuk mobile screens
- Touch-friendly buttons dan controls
- Clear visual hierarchy

## 🔄 **Integration Points**

### 1. **Timesheet Creation**
Data yang didownload digunakan di:
- Equipment picker dengan filtering
- Kegiatan picker berdasarkan equipment
- Material dan lokasi selection

### 2. **Offline Mode**
App dapat berfungsi offline dengan:
- Master data dari SQLite
- Fallback handling
- Sync status indicators

## 📊 **Monitoring & Logging**

### Console Logs
- `[downloadSlice] Downloading {dataType}...`
- `[downloadSlice] Fetched {count} {dataType} items`
- `[SQLiteService] Syncing {dataType} data: {count} items`

### Error Tracking
- Network errors
- API response errors
- SQLite sync errors
- Timeout handling

## 🚀 **Future Enhancements**

1. **Background Sync** - Automatic sync di background
2. **Delta Sync** - Hanya download data yang berubah
3. **Compression** - Compress data untuk faster download
4. **Batch Processing** - Process data dalam batch untuk large datasets
5. **Sync Scheduling** - Jadwal otomatis untuk sync harian/mingguan