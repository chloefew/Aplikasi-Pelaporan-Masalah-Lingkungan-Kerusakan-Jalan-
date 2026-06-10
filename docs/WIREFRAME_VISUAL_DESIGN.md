# Wireframe & Visual Design — Aplikasi Pelaporan Masyarakat

## 1. Mobile App Screens

### Screen 1: Maps Home — Zoom Rendah (Cluster View)
```
┌─────────────────────────────────────┐
│ ← Menu   Pelaporan Masyarakat  ⚙    │  Height: 56px
├─────────────────────────────────────┤
│ [🔍 Cari lokasi...] [↻] [⊞ Filter]  │  Height: 48px
├─────────────────────────────────────┤
│                                     │
│              MAP VIEW               │  Height: 400px
│         (Leaflet Container)         │
│                                     │
│    [🔴 Cluster: 45 laporan]        │  Marker clusters visible
│                                     │  (zoom < 15)
│    [Pusat Jakarta]                 │
│                                     │
├─────────────────────────────────────┤
│ 📌 AREA: Jl. Sudirman               │  Height: 80px
│    Jalan Rusak • 45 laporan         │
│    Prioritas: 🔴 TINGGI             │  Bottom sheet
│    [Lihat Detail]                   │
└─────────────────────────────────────┘
         [+ LAPORKAN] ← FAB button (60px)
```

**Fitur UI:**
- Header dengan hamburger menu
- Search bar dengan icon refresh & filter
- Map full-responsive width
- Bottom sheet: group summary (swipe up untuk expand)
- FAB (Floating Action Button) di kanan bawah untuk + Laporkan

---

### Screen 2: Maps Home — Zoom Tinggi (Marker View)
```
┌─────────────────────────────────────┐
│ ← Menu   Pelaporan Masyarakat  ⚙    │
├─────────────────────────────────────┤
│ [🔍 Cari lokasi...] [↻] [⊞ Filter]  │
├─────────────────────────────────────┤
│                                     │
│              MAP VIEW               │  Zoom: 17
│         (Leaflet Container)         │
│                                     │
│    [🔴 Marker: Jln Rusak]          │  Individual markers
│    [🟡 Marker: Sampah]             │  (tidak cluster di zoom tinggi)
│    [🟠 Marker: Lampu Mati]         │
│                                     │
├─────────────────────────────────────┤
│ 📌 Jalan Rusak di Jl. Sudirman      │  Height: 120px
│    8 laporan • Terakhir: 2h lalu   │
│    ⭐ Priority: TINGGI              │  Bottom sheet
│    [Saya Juga] [Lihat Detail]       │  (auto expand saat marker click)
└─────────────────────────────────────┘
         [+ LAPORKAN]
```

---

### Screen 3: Marker Popup — Detail View (expanded)
```
┌─────────────────────────────────────┐
│ ← Back              [Share] [More]   │  Header: dark overlay
├─────────────────────────────────────┤
│ [Foto report] (high-res preview)    │  Height: 300px
│                                     │
│ 📷 Dapat dari: Reporter A • 2h lalu │  Photo attribution
├─────────────────────────────────────┤
│ JALAN RUSAK                         │  Title + category badge
│ Jl. Sudirman, Jakarta Pusat         │
│                                     │
│ 📍 -6.200000, 106.816000            │  Coordinates
│ 📏 Akurasi: ±10m                    │
│                                     │
│ 👥 8 LAPORAN SERUPA                 │
│    ├─ Laporan 1: Photo • 2h lalu    │  List recent reports
│    ├─ Laporan 2: Photo • 5h lalu    │  (swipeable gallery)
│    ├─ Laporan 3: Photo • 8h lalu    │
│    └─ ... (5+ more)                 │
│                                     │
│ 💬 Diskusi (3 komentar):            │  Comments thread
│    User A: "Sangat berbahaya!"      │
│    Admin: "Perbaikan minggu depan"  │
│    User B: "+1, kawasan ini urgent" │
│                                     │
├─────────────────────────────────────┤
│ ⭐ Priority: HIGH                   │  Priority badge
│ 📊 Skor: 12.5/20                    │  (8 reports, 2 days recent)
│                                     │
│ Status: 🟡 Open                     │
│ Assigned: Dinas PU Jakarta Pusat    │
│                                     │
├─────────────────────────────────────┤
│ [Saya Juga Melaporkan] [Laporkan]   │  Action buttons
│ [Bagikan] [Simpan]                  │
└─────────────────────────────────────┘
```

---

### Screen 4: Form Laporan — Step 1 (Kategori)
```
┌─────────────────────────────────────┐
│ Buat Laporan Baru  ×                │  Header with close
├─────────────────────────────────────┤
│ Step 1 / 3: Pilih Kategori          │  Progress indicator
├─────────────────────────────────────┤
│                                     │
│  ☐ Jalan Rusak                      │  Icon + label
│     (lubang, retak, aspal lepas)    │  (Responsive: can be grid)
│                                     │
│  ☐ Sampah                           │
│     (sampah liar, penuh, bau)       │
│                                     │
│  ☐ Lampu Mati                       │
│     (PJU mati, rusak, remang)       │
│                                     │
│  ☐ Lainnya                          │
│     [Text input untuk detail]       │  Expandable field
│                                     │
├─────────────────────────────────────┤
│ [Batal]                   [Lanjut]   │  Navigation
└─────────────────────────────────────┘
```

---

### Screen 5: Form Laporan — Step 2 (Foto & Lokasi)
```
┌─────────────────────────────────────┐
│ Buat Laporan Baru  ×                │
├─────────────────────────────────────┤
│ Step 2 / 3: Foto & Lokasi           │  Progress indicator
├─────────────────────────────────────┤
│                                     │
│ Unggah Foto (wajib)                 │
│ ┌─────────────────────────────────┐ │
│ │ [📷 Ambil Foto] [📁 Galeri]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Foto preview (jika sudah upload):   │
│ ┌─────────────────────────────────┐ │
│ │ [Foto preview terkompres]       │ │  Height: 200px
│ │ 123 KB • 1024x768               │ │
│ │ [Edit] [Hapus]                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Validasi Lokasi                     │
│ ┌─────────────────────────────────┐ │
│ │ [Gunakan Lokasi Saya] (GPS)     │ │
│ │ Lat: -6.200  Lon: 106.816       │ │  GPS status
│ │ Akurasi: ±8m • Update 2s ago    │ │
│ │ [🔄 Refresh Lokasi]             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ atau Pilih Manual:                  │
│ ┌─────────────────────────────────┐ │
│ │ [Mini Map Picker]               │ │  Height: 150px
│ │ (Leaflet mini, can drag pin)    │ │
│ │ Jl. Sudirman, Jakarta           │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ [Kembali]                 [Lanjut]   │
└─────────────────────────────────────┘
```

---

### Screen 6: Form Laporan — Step 3 (Deskripsi & Submit)
```
┌─────────────────────────────────────┐
│ Buat Laporan Baru  ×                │
├─────────────────────────────────────┤
│ Step 3 / 3: Deskripsi & Selesai     │  Progress indicator
├─────────────────────────────────────┤
│                                     │
│ RINGKASAN:                          │
│ ✓ Kategori: Jalan Rusak             │  Read-only summary
│ ✓ Foto: uploaded                    │
│ ✓ Lokasi: -6.200, 106.816 (±8m)    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│ Deskripsi Detail (opsional):        │
│ ┌─────────────────────────────────┐ │
│ │ [Text area]                     │ │
│ │ "Lubang besar di tengah jalan,  │ │
│ │  diameter ~1m, dalam ~30cm.     │ │
│ │  Sangat berbahaya untuk motor"  │ │  Height: 120px
│ │                                 │ │
│ │ Char: 87/500                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Opsi Tambahan:                      │
│ ☐ Lapor Anonim (hide my name)       │
│ ☐ Izinkan notif status update       │
│                                     │
├─────────────────────────────────────┤
│ [Kembali]          [KIRIM LAPORAN]  │  Submit button (primary)
└─────────────────────────────────────┘
```

---

### Screen 7: Notification Success
```
┌─────────────────────────────────────┐
│          (Overlay Modal)            │
│                                     │
│    ✓ BERHASIL DIKIRIM               │  Large checkmark icon
│                                     │
│    Terima kasih atas laporan Anda!  │
│                                     │
│    📌 Laporan Anda bergabung        │  Summary
│       dengan 7 laporan lain di      │
│       lokasi ini.                   │
│                                     │
│    👥 Anda adalah reporter ke-8     │
│       untuk masalah ini.            │
│                                     │
│    ⭐ Laporan ini sudah              │
│       PRIORITAS TINGGI!             │
│       Pemerintah akan segera        │
│       menindaklanjuti.              │
│                                     │
│    [Lihat di Peta] [Lanjut Lapor]   │
└─────────────────────────────────────┘
```

---

### Screen 8: Filter & Settings
```
┌─────────────────────────────────────┐
│ Filter Laporan  ×                   │
├─────────────────────────────────────┤
│                                     │
│ Kategori:                           │
│ ☑ Jalan Rusak                       │  Checkboxes
│ ☑ Sampah                            │
│ ☐ Lampu Mati                        │
│ ☐ Lainnya                           │
│                                     │
│ Status:                             │
│ ☑ Open                              │
│ ☑ In Progress                       │
│ ☑ Resolved                          │
│                                     │
│ Prioritas:                          │
│ ☑ Tinggi                            │
│ ☑ Sedang                            │
│ ☑ Rendah                            │
│                                     │
│ Jarak dari Saya:                    │
│ [Slider: <1km  <5km  <10km]  ◉ >10km│
│                                     │
│ Waktu Laporan:                      │
│ ☉ Semua waktu                       │  Radio buttons
│ ☐ 24 jam terakhir                   │
│ ☐ 7 hari terakhir                   │
│ ☐ 1 bulan terakhir                  │
│                                     │
├─────────────────────────────────────┤
│ [Reset Filter]        [Terapkan]    │
└─────────────────────────────────────┘
```

---

## 2. Desktop Admin Dashboard

### Main Dashboard Layout
```
┌──────────────────────────────────────────────────────────────────────┐
│ Logo  Dashboard  Analytics  Users  Reports  Settings  [Admin]  [Logout]│
├──────────────────────────────────────────────────────────────────────┤
│                          KPI SUMMARY BAR                              │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐             │
│ │ Total    │ Resolved │ Pending  │ High Pri │ Avg Time │             │
│ │ 523      │ 234 (45%)│ 289 (55%)│ 34 (13%) │ 3.2 days │             │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘             │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐                                                     │
│  │ PRIORITY    │   ┌────────────────────────────────────────────┐   │
│  │ QUEUE       │   │        MAP VIEW (Leaflet)                 │   │
│  │             │   │   [Heatmap overlay: red=hotspot]         │   │
│  │ 1. Jln Rusk │   │   [🔴 Cluster 45] [🟡 Marker 8]          │   │
│  │    12 lap   │   │   [🟠 Marker 3]                          │   │
│  │    ⚠ High   │   │                                           │   │
│  │ 2. Sampah   │   │   [Zoom level: 14]                       │   │
│  │    8 lap    │   │                                           │   │
│  │    ⚠ High   │   │   [Toggle Heatmap]                       │   │
│  │ 3. Lampu    │   │                                           │   │
│  │    5 lap    │   │                                           │   │
│  │    🔵 Med    │   │                                           │   │
│  │             │   │                                           │   │
│  │ [View All]  │   │                                           │   │
│  │ [Assign]    │   │                                           │   │
│  │ [Escalate]  │   │                                           │   │
│  └─────────────┘   └────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│  Filter: [Category ▼] [Status ▼] [Dinas ▼] [Date ▼]                 │
│  Search: [Cari lokasi/group...] [🔍] [Export CSV]                   │
├──────────────────────────────────────────────────────────────────────┤
│  TABLE: GROUP SUMMARY (paginated, sortable)                          │
│  ┌─────┬────────────┬───────┬──────┬─────────┬──────────┬───────────┐│
│  │ ID  │ Category   │ Loca- │Count │Priority │ Assigned │ Last  Up  ││
│  │     │            │ tion  │      │         │ to       │ date      ││
│  ├─────┼────────────┼───────┼──────┼─────────┼──────────┼───────────┤│
│  │ 1   │ Jalan Rusak│ Jl.S  │ 12   │ HIGH    │ Dinas PU │ 2h ago    ││
│  │ 2   │ Sampah     │ Blok M│  8   │ HIGH    │ (none)   │ 4h ago    ││
│  │ 3   │ Lampu      │ Jl.G  │  5   │ MEDIUM  │ Dinas LL │ 6h ago    ││
│  │ 4   │ Jalan Rusak│ Jl.T  │  3   │ LOW     │ Dinas PU │ 1d ago    ││
│  └─────┴────────────┴───────┴──────┴─────────┴──────────┴───────────┘│
│  [Prev] [1] [2] [3] [Next]                                           │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Group Detail Panel (Right Slide)
```
┌────────────────────────────────────────┐
│ GROUP DETAIL                    [← Back]│
├────────────────────────────────────────┤
│                                        │
│ JALAN RUSAK • 12 LAPORAN              │
│ Jl. Sudirman, Jakarta Pusat           │
│                                        │
│ 📍 -6.200, 106.816                    │
│ 📅 Dibuat: 2024-06-10 10:30           │
│ 🕐 Laporan terakhir: 2h ago           │
│                                        │
│ ⭐ Priority: HIGH (score: 12.5/20)    │
│ 🎯 Status: [Open ▼]                   │ ← Dropdown editable
│ 👤 Assign: [Dinas PU Jakarta ▼]       │ ← Dropdown editable
│ 📅 Deadline: 7 hari (auto)            │
│                                        │
│ ──────────────────────────────────────│
│                                        │
│ CATATAN INTERNAL:                     │
│ ┌──────────────────────────────────┐  │
│ │ [Text area untuk catatan admin]  │  │
│ │ "Area ini sudah multiple reports │  │
│ │  sebelumnya, urgent priority."   │  │
│ └──────────────────────────────────┘  │
│                                        │
│ ──────────────────────────────────────│
│                                        │
│ FOTO LAPORAN (Gallery):               │
│ [Foto 1] [Foto 2] [Foto 3] ...        │
│  ← prev   next →                      │
│ Dari: User A • 2h ago                 │
│                                        │
│ ──────────────────────────────────────│
│                                        │
│ LAPORAN TERBARU (5):                  │
│ 1. User A - 2h ago - [Foto]           │
│    "Lubang besar di tengah"           │
│ 2. User B - 5h ago - [Foto]           │
│    "Jalan rusak parah"                │
│ 3. User C - 8h ago - [Foto]           │
│    ... (2 more)                       │
│                                        │
│ ──────────────────────────────────────│
│                                        │
│ AKSI CEPAT:                           │
│ [Update Status]  [Send Notify]        │
│ [View in Maps]   [Export Data]        │
│ [Street View]    [Mark Resolved]      │
│                                        │
│ ──────────────────────────────────────│
│                                        │
│ ESTIMASI BIAYA:                       │
│ Rp 5.000.000  [Edit]                  │
│                                        │
│ ──────────────────────────────────────│
│                                        │
│ RIWAYAT PERUBAHAN:                    │
│ • 2024-06-10 14:00: Priority set HIGH │
│ • 2024-06-10 13:30: Assigned to PU    │
│                                        │
└────────────────────────────────────────┘
```

---

### Analytics View
```
┌──────────────────────────────────────────────────────────────────────┐
│ Analytics & Reporting                                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ DATE RANGE: [📅 2024-06-01] to [📅 2024-06-10]  [Reset]            │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CHART 1: Reports per Day (Line Chart)                           │ │
│ │                                                                 │ │
│ │ 60                                    *                        │ │
│ │ 50   *                         * *   *                         │ │
│ │ 40   * *       *   *           * * * *                         │ │
│ │ 30   * * *     * * * *   *     * * * *                         │ │
│ │ 20   * * * *   * * * * * * *   * * * *                         │ │
│ │ 10   * * * * * * * * * * * * * * * * *                         │ │
│ │  0   +─────────────────────────────────────────  (10 hari)    │ │
│ │      Jun 1  3  5  7  9  (dates)                              │ │
│ │ Trend: ↑ Meningkat                                            │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ CHART 2: Reports by Category (Pie Chart)                        │ │
│ │                                                                 │ │
│ │        ╭─────╮                                                 │ │
│ │       ╱       ╲        Jalan Rusak: 45% (234)                │ │
│ │      ╱  45%   ╲        Sampah: 35% (183)                    │ │
│ │     │           │       Lampu Mati: 15% (78)                │ │
│ │     │ ◇ Jalan ◇ │       Lainnya: 5% (26)                    │ │
│ │     │           │                                            │ │
│ │      ╲  35% 15% ╱                                            │ │
│ │       ╲        ╱                                              │ │
│ │        ╰──5%──╯                                               │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ ┌────────────────┬────────────────┬────────────────┐               │
│ │ Resolution Time│ User Satisfact │ Top 5 Areas    │               │
│ ├────────────────┼────────────────┼────────────────┤               │
│ │ Avg: 3.2 days  │ Avg: 4.2/5 ⭐  │ 1. Jl. Sudirman│               │
│ │ Median: 2 days │                │    45 reports  │               │
│ │ Mode: 1 day    │ ✓ 80% satisfied│ 2. Blok M      │               │
│ │ Max: 14 days   │ ✗ 5% dissatis. │    23 reports  │               │
│ │                │ ? 15% neutral  │ 3. Jl. Gatot   │               │
│ │ Target: <7d    │                │    18 reports  │               │
│ └────────────────┴────────────────┴────────────────┘               │
│                                                                      │
│ [Download CSV] [Generate PDF] [Export Excel]                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mobile Admin View (Simplified)

```
┌─────────────────────────────────────┐
│ ☰  Admin Dashboard         [⚙ More] │
├─────────────────────────────────────┤
│ Total: 523 | Pending: 289 | High: 34│
├─────────────────────────────────────┤
│              MAP                    │
│         [Cluster View]              │
├─────────────────────────────────────┤
│ PRIORITY QUEUE                      │
│ 1. Jln Rusak • 12  [Action ▼]       │
│ 2. Sampah • 8      [Action ▼]       │
│ 3. Lampu • 5       [Action ▼]       │
│                                     │
│ [Expand All] [Analytics]            │
└─────────────────────────────────────┘
```

---

## 4. Design System & Components

### Color Palette
```
Primary Colors:
- Blue: #007BFF (primary action)
- Green: #28A745 (success, resolved)
- Orange: #FFC107 (warning, in-progress)
- Red: #DC3545 (danger, high-priority)
- Gray: #6C757D (disabled, secondary)

Priority Badges:
- Low: #6C757D (gray)
- Medium: #FFC107 (orange)
- High: #DC3545 (red)
- Critical: #8B0000 (dark red)

Category Icons & Colors:
- Jalan Rusak: 🔴 #D32F2F (road icon)
- Sampah: 🟡 #F57C00 (trash icon)
- Lampu Mati: 🟠 #FBC02D (lightbulb icon)
- Lainnya: 🔵 #1976D2 (generic icon)
```

### Typography
```
Heading 1 (H1): 32px, bold, color #000
Heading 2 (H2): 24px, bold, color #000
Heading 3 (H3): 20px, semi-bold, color #333
Body: 14px, regular, color #333
Caption: 12px, regular, color #666
Button: 14px, semi-bold, uppercase

Font: Segoe UI, Roboto, sans-serif (system fonts)
```

### Spacing & Layout
```
Padding: 8px, 16px, 24px, 32px (multiples of 8)
Margin: 8px, 16px, 24px, 32px
Border radius: 4px (buttons), 8px (cards), 12px (modals)
Shadow: 0 2px 8px rgba(0,0,0,0.1) (elevated)
```

### Button Styles
```
Primary Button:
- Background: #007BFF
- Color: white
- Padding: 12px 24px
- Border: none
- Radius: 4px
- Hover: #0056b3 (darker)

Secondary Button:
- Background: transparent
- Color: #007BFF
- Border: 2px solid #007BFF
- Padding: 12px 24px

Danger Button:
- Background: #DC3545
- Color: white
- Padding: 12px 24px
```

---

## 5. Responsive Breakpoints

```
Mobile (xs): < 576px
  - Single column layout
  - Full-width buttons
  - Bottom sheet for details
  
Tablet (md): 576px - 768px
  - Two column (map + list side-by-side)
  - Adjusted spacing
  
Desktop (lg): > 768px
  - Three column (priority queue + map + detail panel)
  - Floating panels
  - Expanded tables
```

---

## 6. Accessibility Features

### Mobile Considerations
- Touch targets: min 44x44px (Android), 44x44pt (iOS)
- Readable text: min 16px base font
- Contrast ratio: WCAG AA (4.5:1 for normal text)

### Navigation
- Keyboard support: Tab/Shift+Tab, Enter, Esc
- Screen reader labels: aria-label for icons, semantic HTML
- Focus indicators: visible outline on interactive elements

### Color Not Only Signal
- Use icons alongside colors
- Red ≠ only signal; add text label like "Priority: HIGH"
