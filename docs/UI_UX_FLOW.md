# UI/UX Flow — Aplikasi Pelaporan Masyarakat

## 1. User Flow (Pengguna Biasa)

### A. Flow Membuat Laporan Baru
```
1. User membuka aplikasi → Peta ditampilkan (pusat kota default atau geolokasi user)
2. User menekan tombol "+ Laporkan" (fixed button di atas peta)
   ↓
3. Modal/halaman form laporan terbuka dengan 3 langkah:
   Step 1: Pilih kategori (Jalan Rusak, Sampah, Lampu Mati, Lainnya)
   Step 2: Unggah foto bukti (camera/gallery)
   Step 3: Validasi lokasi (auto GPS atau drag pin di peta)
   ↓
4. User ketik deskripsi singkat dan kirim
5. Sistem melakukan grouping otomatis:
   - Cari group serupa (kategori sama + radius 50m)
   - Jika ada → increment counter, attach report ke group
   - Jika tidak → buat group baru
   ↓
6. Popup konfirmasi: "Laporan berhasil dikirim. 
   Anda adalah reporter ke-X untuk masalah ini."
   ↓
7. User kembali ke peta (peta auto-refresh, marker/cluster update)
```

### B. Flow Melihat Laporan di Peta
```
1. User melihat peta dengan:
   - Individual markers (zoom tinggi, few reports)
   - Cluster groups (zoom rendah, many reports) → tampil nomor count
   ↓
2. User klik marker/cluster:
   Popup muncul:
   ┌─────────────────────────────────────────────────┐
   │ [Jalan Rusak] • 8 laporan • Terakhir: 2 jam lalu│
   ├─────────────────────────────────────────────────┤
   │ [Foto thumbnail]                                 │
   │ "Jalan berlubang di Jl. Sudirman"                │
   │                                                  │
   │ 📍 Lat/Lon: -6.200, 106.816                     │
   │ ⭐ Priority: TINGGI (≥5 laporan dalam 7 hari)  │
   ├─────────────────────────────────────────────────┤
   │ [Saya Juga Melaporkan] [Lihat Semua] [Laporkan] │
   └─────────────────────────────────────────────────┘
   ↓
3a. Klik "Saya Juga Melaporkan":
    - Counter increment (+1)
    - Popup update real-time
    - Notifikasi: "Terima kasih, suara Anda tercatat"
    
3b. Klik "Lihat Semua":
    - Side panel terbuka → list 5-10 laporan terakhir
    - Setiap item: foto kecil + deskripsi + waktu
    
3c. Klik "Laporkan" (laporan masalah baru serupa):
    - Form terbuka (pre-fill kategori)
```

### C. Flow Notifikasi (Opsional Push)
```
User menerima notifikasi push saat:
1. Group mereka mencapai prioritas TINGGI (≥ 5 laporan dalam 7 hari)
   → Pesan: "Laporan Anda sudah prioritas! 8 orang melaporkan masalah serupa."
   → Klik → buka peta ke grup tersebut
   
2. Status laporan berubah (dari Open → In Progress → Resolved)
   → Pesan: "Pemerintah sedang menindaklanjuti laporan Anda" atau "Terselesaikan!"
```

---

## 2. Admin/Dinas Flow

### A. Login & Dashboard Awal
```
1. Admin login → Dashboard terbuka dengan:
   - Peta (sama seperti public, tetapi dengan admin overlay)
   - Priority Queue (panel kanan): daftar grup prioritas tinggi
   - Stats bar (top): total laporan, resolved, pending, avg response time
   ↓
2. Filter/search: 
   - Pilih kategori, rentang waktu, status
   - Geom filter: search by lokasi/kecamatan
```

### B. Tindak Lanjut Laporan
```
1. Admin klik group di priority queue atau peta
2. Detail panel terbuka:
   ┌────────────────────────────────────────────┐
   │ Group Detail: Jalan Rusak • 12 laporan     │
   ├────────────────────────────────────────────┤
   │ Status: [Open ▼]  Priority: HIGH           │
   │ Assign to: [Dinas Pekerjaan Umum ▼]        │
   │ Response deadline: [Auto: 7 hari]          │
   │ Internal notes: [text area]                 │
   │ Estimated cost: [currency input]           │
   ├────────────────────────────────────────────┤
   │ Latest 5 reports:                          │
   │ [Report 1] by User A - 2h ago              │
   │ [Report 2] by User B - 4h ago              │
   │ ... (swipeable gallery)                    │
   ├────────────────────────────────────────────┤
   │ [Update Status] [Send Notification]        │
   │ [View in Street View] [Export CSV]         │
   └────────────────────────────────────────────┘
   ↓
3. Admin ubah status:
   Open → In Progress → Completed → Verified
   Setiap change → auto-notify user + update on public map
   
4. Admin klik [Send Notification]:
   - Pilih template atau tulis custom message
   - Tekan send → FCM/SMS to all reporters in group
```

### C. Analytics & Reporting
```
1. Analytics panel:
   - Heatmap: hotspot area dengan masalah paling banyak
   - Time-series: laporan per hari/minggu/bulan (trend)
   - Top categories: pie chart → jalan rusak 40%, sampah 35%, lampu 15%, lain 10%
   - Avg response time per category & dinas
   - Export: CSV/PDF report untuk presentasi
   
2. Custom report builder:
   - Filter: date range, category, location, status
   - Output: PDF atau Excel (dengan charts)
```

---

## 3. Wireframe Deskripsi (ASCII-ish)

### Mobile View — Peta Utama
```
┌─────────────────────────────────────────────┐
│ [☰ Menu]  Pelaporan Jalan     [⚙ Pengaturan]│  ← Header
├─────────────────────────────────────────────┤
│   [🔍 Search lokasi] [↻ Refresh] [⊡ Filters]│  ← Control bar
├─────────────────────────────────────────────┤
│                                             │
│                   MAP                       │  ← Leaflet map
│          [🔴 Marker 8 laporan]             │  ← Cluster/marker visible
│             [🟡 Cluster 45]                │
│                                             │
│     [Lokasi user: Jl. Sudirman]            │
├─────────────────────────────────────────────┤
│ 📌 Jalan Rusak • 8 laporan • 2h lalu       │  ← Bottom sheet
│    [Foto] Jalan berlubang besar            │     (swipeable)
│    ⭐ Priority: TINGGI                     │
│ [Saya Juga] [Lihat Semua]                  │
└─────────────────────────────────────────────┘
                    [+ Laporkan]                  ← FAB (floating action button)
```

### Desktop View — Admin Dashboard
```
┌──────────────────────────────────────────────────────────────────┐
│ [📊 Dashboard] [📍 Map] [📊 Analytics] [👥 Users]  [Logout]      │ ← Nav bar
├──────────────────────────────────────────────────────────────────┤
│  Total: 523 | Resolved: 234 | Pending: 289 | Avg Response: 3.2d │ ← Stats
├──────┬──────────────────────────────────────────────────────────┤
│      │                                                          │
│Pri-  │                     MAP VIEW                            │
│ority │         [Heatmap overlay: red=hotspot]                 │
│Queue │     [🔴 Cluster 45] [🟡 Marker 8]                     │
│      │                                                          │
│ 1.   │                                                          │
│ Jln  ├──────────────────────────────────────────────────────────┤
│ Rusk │ Filters: [Category ▼] [Status ▼] [Date ▼]              │
│ 12   │ [Search lokasi...] [Export] [Assign Bulk]               │
│ Lap  │                                                          │
│      │ Detail Panel (right-slide):                             │
│ 2.   │ ┌────────────────────────────────────┐                 │
│ Smph │ │ Jalan Rusak • 12 laporan          │                 │
│ 8    │ │ Status: [In Progress ▼]           │                 │
│ Lap  │ │ Assign: Dinas PU ✓                │                 │
│      │ │ [Gallery: 5 foto]                 │                 │
│ 3.   │ │ [Update] [Notify] [View SV]       │                 │
│ Lampu│ └────────────────────────────────────┘                 │
│ 5    │                                                          │
│ Lap  │                                                          │
├──────┤                                                          │
│ More │                                                          │
└──────┴──────────────────────────────────────────────────────────┘
```

---

## 4. Interaksi Detail — Popup & Forms

### Popup on Marker Click (Mobile)
```
┌──────────────────────────────────────┐
│ [X] Tutup                            │
├──────────────────────────────────────┤
│ [Foto laporan]                       │
│                                      │
│ Jalan Rusak                          │
│ Jl. Sudirman, Jakarta                │
│ 8 laporan • Prioritas TINGGI         │
│ Terakhir: 2 jam lalu                 │
├──────────────────────────────────────┤
│ Deskripsi dari laporan terbaru:      │
│ "Lubang besar di tengah jalan,       │
│  berbahaya untuk motor..."           │
│                                      │
│ Lokasi: -6.200, 106.816              │
│ Koordinat presisi: ±10m              │
├──────────────────────────────────────┤
│ [Saya Juga Melaporkan]               │
│ [Lihat Semua Laporan (8)]            │
│ [Laporkan Masalah Baru]              │
└──────────────────────────────────────┘
```

### Form Laporan (3 Steps)
```
STEP 1/3: KATEGORI
┌──────────────────────────────────┐
│ Pilih Kategori Masalah           │
├──────────────────────────────────┤
│ ☐ Jalan Rusak (pot hole, retak)  │
│ ☐ Sampah (tumpukan, sampah liar) │
│ ☐ Lampu Mati (penerangan rusak)  │
│ ☐ Lainnya (specify)              │
│   [Text input untuk "Lainnya"]    │
├──────────────────────────────────┤
│           [Lanjut]               │
└──────────────────────────────────┘

STEP 2/3: FOTO & LOKASI
┌──────────────────────────────────┐
│ Unggah Foto Bukti                │
├──────────────────────────────────┤
│ [📷 Ambil Foto] [📁 Dari Galeri] │
│ (Preview: [Foto akan tampil sini])│
├──────────────────────────────────┤
│ Validasi Lokasi                  │
├──────────────────────────────────┤
│ [Gunakan Lokasi Saya]            │
│ Lat: -6.200  Lon: 106.816        │
│ Akurasi: ±8m  Waktu: 2s ago      │
│                                  │
│ atau:                            │
│ [Mini Map Picker]  [Drag pin]    │
├──────────────────────────────────┤
│  [Kembali]       [Lanjut]        │
└──────────────────────────────────┘

STEP 3/3: DESKRIPSI & SUBMIT
┌──────────────────────────────────┐
│ Deskripsi Detail (opsional)      │
├──────────────────────────────────┤
│ [Text area]                      │
│ "Lubang besar di tengah jalan... │
│  berbahaya..."                   │
│ Char: 45/500                     │
├──────────────────────────────────┤
│ ☐ Lapor Anonim                   │
│ ☐ Izinkan notifikasi status      │
├──────────────────────────────────┤
│  [Kembali]     [KIRIM LAPORAN]   │
└──────────────────────────────────┘
```

---

## 5. User Journey — Dari Lapor Hingga Notifikasi Resolved

```
Day 1:
- User A lapor (jalan rusak) di Jl. Sudirman
  → Group baru dibuat, counter=1

- User B, C, D, E (hari yang sama) lapor di lokasi sama
  → Attach ke group, counter=5 → PRIORITY: HIGH

- Notifikasi terkirim ke User A, B, C, D, E:
  "Laporan Anda termasuk prioritas tinggi! 
   5 orang lain melaporkan masalah serupa."

Day 2-3:
- Admin melihat group di priority queue
- Admin assign ke Dinas PU, update status → "In Progress"
- User A-E notif: "Pemerintah sedang menindaklanjuti..."
- Admin post photo/update progress: "Perbaikan segera dilakukan"

Day 7:
- Admin mark: status → "Completed", post after-photo
- User A-E notif: "Laporan Anda telah diselesaikan ✓"
- Group di peta update: status badge = "✓ Selesai"
```

---

## 6. Accessibility & Responsive Design

- **Mobile-first**: peta full-width, bottom sheet untuk detail
- **Desktop**: side panel untuk filter/detail, map center, queue right
- **Tablet**: hybrid layout
- **Dark mode support**: untuk penggunaan malam hari
- **Text alternatives**: image reports + caption/description
- **Keyboard nav**: tab/enter untuk form, map bisa di-navigate dengan arrow keys
- **Multilingual**: Indonesian (id-ID) default, support English
