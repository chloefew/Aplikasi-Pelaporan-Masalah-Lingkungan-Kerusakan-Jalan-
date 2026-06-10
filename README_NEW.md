# 🚗 Aplikasi Pelaporan Masyarakat — Sistem Peta Interaktif & Priority Management

![Status](https://img.shields.io/badge/status-MVP-yellow) ![Version](https://img.shields.io/badge/version-1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

**Aplikasi pelaporan masalah lingkungan & infrastruktur** dengan peta interaktif, pengelompokan cerdas laporan, dan sistem prioritas untuk mempercepat respons pemerintah.

## 🎯 Overview

Aplikasi memudahkan masyarakat melaporkan masalah seperti jalan rusak, sampah, lampu mati secara real-time dengan foto dan lokasi GPS. Sistem otomatis mengelompokkan laporan serupa dan memberikan prioritas tinggi jika banyak masyarakat melaporkan masalah yang sama. Pemerintah dapat memantau, menugaskan, dan memperbaharui status laporan secara transparan.

### ✨ Fitur Utama (MVP)

```
✅ Peta Interaktif         - Leaflet + OpenStreetMap + Marker Clustering
✅ Laporan Real-Time       - Geo-tagging dengan GPS + foto bukti
✅ Pengelompokan Otomatis  - Grup laporan by lokasi (radius 50m) + kategori
✅ Counter Laporan Serupa  - "Saya juga melaporkan" → real-time increment
✅ Priority Scoring        - Otomatis: semakin banyak laporan = prioritas tinggi
✅ Admin Dashboard         - Priority queue, assign, status tracking
✅ Status Timeline         - Transparansi: Open → In Progress → Resolved
✅ Notifikasi Publik       - Push notification saat laporan jadi prioritas/selesai
✅ Analytics & Heatmap     - Visualisasi hotspot masalah per lokasi/kategori
✅ Kategori Terstruktur    - Jalan Rusak, Sampah, Lampu Mati, Lainnya
```

---

## 🏗️ Tech Stack

| Layer | Technology | Alasan |
|-------|-----------|--------|
| **Frontend** | React / Vanilla JS + Leaflet | Fast, interactive, geospatial |
| **Maps** | Leaflet + MarkerCluster | Open-source, clustering, OpenStreetMap gratis |
| **Backend** | Node.js + Express | Async-first, fast, scalable |
| **Database** | Postgres + PostGIS | Spatial queries (ST_DWithin), production-ready |
| **Cache** | Redis | Session, rate-limit, clustering cache |
| **Workers** | BullMQ | Background grouping jobs, priority scoring |
| **Storage** | S3-compatible | Scalable photo storage |
| **Notifications** | FCM + Email | Push, email, optional SMS |
| **DevOps** | Docker + K8s/ECS | Container, auto-scale |

---

## 📁 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| [docs/API_SPEC.md](docs/API_SPEC.md) | Endpoint API lengkap (9 endpoint utama) |
| [docs/UI_UX_FLOW.md](docs/UI_UX_FLOW.md) | Flow pengguna, wireframe, user journey |
| [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md) | Arsitektur sistem, grouping algorithm, DB schema |
| [docs/WIREFRAME_VISUAL_DESIGN.md](docs/WIREFRAME_VISUAL_DESIGN.md) | UI visual, responsive design, accessibility |
| [docs/FITUR_TAMBAHAN.md](docs/FITUR_TAMBAHAN.md) | Roadmap Phase 2-4, gamification, analytics |
| [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) | Quick start, deployment checklist, next steps |

**🔥 Baca dulu:** [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) untuk overview cepat.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+ dengan PostGIS
- Redis 6+ (optional untuk dev)
- npm / yarn

### Setup Lokal (Development) — 5 Menit

**1. Clone & Install**
```bash
git clone <repo>
cd aplikasi-pelaporan
npm install
```

**2. Configure Environment**
```bash
cat > .env << EOF
PORT=3000
NODE_ENV=development
EOF
```

**3. Start Server (Development Mode)**
```bash
npm run dev
```

**4. Test Flow**
- Buka: http://localhost:3000
- Allow geolocation permission
- Click "+ Laporkan" → fill form → submit
- Check peta untuk marker & cluster

### Setup Production (dengan Postgres+PostGIS)

**1. Database Setup**
```bash
# Create database
createdb laporan_db

# Enable PostGIS
psql -d laporan_db -c "CREATE EXTENSION IF NOT EXISTS postgis"

# Run migrations
psql -d laporan_db -f db/schema.sql
```

**2. Environment**
```bash
cat > .env << EOF
PORT=3000
NODE_ENV=production
DB_URL=postgresql://user:pass@localhost:5432/laporan_db
REDIS_URL=redis://localhost:6379
EOF
```

**3. Start**
```bash
npm run start
```

Lihat detail: [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md#-quick-start--development)

---

## 📋 API Endpoints (MVP)

### Public Endpoints
```
POST   /api/reports              # Create report + auto-group
GET    /api/reports              # List reports (paginated)
GET    /api/groups               # List groups for map
GET    /api/groups/:id           # Group detail + latest reports
POST   /api/groups/:id/confirm   # "Saya juga melaporkan"
GET    /api/stats                # Stats & analytics
```

### Admin Endpoints (Protected)
```
POST   /api/admin/groups/:id/assign      # Assign to dinas
PATCH  /api/admin/groups/:id/status      # Update status
POST   /api/admin/groups/:id/notify      # Send notification
GET    /api/admin/priority-queue         # High-priority list
GET    /api/admin/analytics/report       # Export analytics
```

**Contoh Request:**
```bash
# Create report
curl -X POST http://localhost:3000/api/reports \
  -F "category=jalan" \
  -F "place=Jl. Sudirman" \
  -F "description=Lubang besar" \
  -F "latitude=-6.200" \
  -F "longitude=106.816" \
  -F "photo=@/path/to/photo.jpg"

# Get groups for map
curl http://localhost:3000/api/groups

# Increment counter
curl -X POST http://localhost:3000/api/groups/12345/confirm
```

Lihat detail: [docs/API_SPEC.md](docs/API_SPEC.md)

---

## 🎨 User Interface

### Mobile App (User Perspektif)

```
┌─────────────────────────────────┐
│ Pelaporan Masyarakat      ⚙ Menu│
├─────────────────────────────────┤
│ [🔍 Search] [↻ Refresh] [Filter]│
├─────────────────────────────────┤
│                                 │
│         MAP VIEW                │
│    [🔴 Cluster 45 laporan]     │
│    [🟡 Marker 8 laporan]       │
│                                 │
├─────────────────────────────────┤
│ 📌 Jalan Rusak • 8 laporan      │
│    Prioritas: 🔴 TINGGI         │
│ [Saya Juga] [Lihat Detail]      │
└─────────────────────────────────┘
         [+ LAPORKAN] ← FAB
```

### Admin Dashboard (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ Dashboard  Analytics  Users  [Admin] [Logout]       │
├─────────────────────────────────────────────────────┤
│ Total: 523 | Resolved: 234 | Pending: 289 | High: 34│
├──────────────┬───────────────────────────────────────┤
│ PRIORITY     │        MAP VIEW                       │
│ QUEUE        │   [Heatmap overlay visible]          │
│              │   [Cluster 45] [Marker 8]            │
│ 1. Jln Rusk  │                                       │
│    12 lapor  │                                       │
│    ⚠ High    │                                       │
│              │   [Group Detail Panel →]              │
│ 2. Sampah    │                                       │
│    8 lapor   │                                       │
│ 3. Lampu     │                                       │
│    5 lapor   │                                       │
└──────────────┴───────────────────────────────────────┘
```

Lihat visual detail: [docs/WIREFRAME_VISUAL_DESIGN.md](docs/WIREFRAME_VISUAL_DESIGN.md)

---

## 🔄 How It Works — Pengelompokan Laporan

### Scenario Lengkap

```
USER FLOW:
1. User submit: "Jalan rusak di Jl. Sudirman" + foto + GPS

2. BACKEND GROUPING:
   ✓ Query: "Find group dengan kategori='jalan' 
      dalam radius 50m, created <30 hari"
   ✓ If found: Attach + increment counter
   ✓ If not: Create group baru
   
3. PRIORITY SCORING:
   score = (0.5 * count) + (0.3 * recency) + (0.2 * severity)
   If score ≥ 10 → priority = HIGH → notify users
   
4. FRONTEND UPDATE:
   ✓ Map refresh: cluster count updated
   ✓ Popup: "Anda laporan ke-8! 8 orang melaporkan di sini."
   ✓ Badge: ⭐ Priority TINGGI
   
5. ADMIN SEES:
   ✓ Priority Queue: Jalan Rusak • 8 lapor • HIGH (top list)
   ✓ Click → detail panel: assign, update status
   ✓ Notify users: status changed
   
6. USERS NOTIFIED:
   ✓ Push: "Laporan Anda prioritas tinggi!"
   ✓ Timeline: Status → In Progress → Completed
   ✓ Rating: User rate puas/tidak puas
```

**Keuntungan:**
- Automatic deduplication (tidak ada double-report)
- Real-time collaboration (user lihat progress bersama)
- Data-driven priority (not bias, tapi fact-based)
- Transparent (users tahu status mereka)

Lihat algorithm detail: [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md#c-grouping-logic-background-worker)

---

## 📊 Data Model (Simplified)

**reports** — laporan individual  
```
id, user_id, group_id, category, lat, lon, photo_url, created_at
```

**report_groups** — clusters terkelompok  
```
id, category, lat, lon, count, priority, status, assigned_to, last_report_at
```

**Spatial Index** (PostGIS)
```
CREATE INDEX idx_groups_geom ON report_groups USING GIST(geom)
-- Enable fast ST_DWithin() queries
```

---

## 🎯 Success Metrics — Bagaimana Kita Measure Impact

```
User Engagement:
• DAU (Daily Active Users): >10,000 users/day
• Reports/day: >500
• Repeat reporter rate: >40%

Data Quality:
• Photo submission: >90%
• Geo accuracy: >95%
• Spam/duplicate rate: <5%

Government Efficiency:
• Avg time-to-resolution: <7 days (target)
• User satisfaction: >4.0/5 stars
• Cost savings: allocate budget based on actual data
```

---

## 🚀 Roadmap — Implementasi Bertahap

### ✅ Phase 1: MVP (Current)
- [x] Interactive maps + clustering
- [x] Report creation + auto-grouping
- [x] Real-time counter
- [x] Priority scoring
- [x] Admin dashboard basic
- [x] DB schema (Postgres+PostGIS)

### 🔄 Phase 2: Transparency (1-2 bulan)
- [ ] Status timeline (Open → In Progress → Resolved)
- [ ] Comments & discussion threads
- [ ] Heatmap analytics
- [ ] Gamification (badges, leaderboard)
- [ ] Email notifications (SendGrid)

### 📱 Phase 3: Mobile & Workflow (3-4 bulan)
- [ ] Native mobile app (React Native)
- [ ] Offline mode + sync
- [ ] Dinas/Department portal
- [ ] Photo before/after verification
- [ ] SMS notifications

### 🤖 Phase 4: Intelligence (5+ bulan)
- [ ] ML auto-categorization (from photo)
- [ ] Predictive analytics (forecast hotspots)
- [ ] E-government integration
- [ ] Multi-channel reporting (WhatsApp bot, USSD)
- [ ] Budget tracking & ROI reporting

Lihat detail: [docs/FITUR_TAMBAHAN.md](docs/FITUR_TAMBAHAN.md)

---

## 🛠️ Development Commands

```bash
# Start dev server (hot reload)
npm run dev

# Production build & start
npm run build
npm run start

# Run tests
npm run test

# Database migrations
npm run migrate

# Start background worker
npm run worker

# Code quality
npm run lint      # ESLint
npm run format    # Prettier
```

---

## 🔐 Security

- **Authentication:** JWT for admin users
- **Privacy:** Lat/lon rounded to ±10m, anonymous option
- **Data:** Photos encrypted, deleted per retention policy
- **Rate Limiting:** 100 req/min per IP, 5 reports/day per user
- **Validation:** GPS coords, image files only, max 10MB

---

## 📦 Deployment

### Docker

```bash
# Build image
docker build -t laporan:latest .

# Run container
docker run -p 3000:3000 \
  -e DB_URL=postgresql://... \
  -e NODE_ENV=production \
  lapor:latest
```

### Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Environment Variables
```
PORT=3000
NODE_ENV=production
DB_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
AWS_S3_BUCKET=my-bucket
FCM_KEY=firebase-key
SENDGRID_KEY=sendgrid-key
```

Deployment checklist: [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md#-deployment-checklist)

---

## 🤝 Contributing

1. Fork repo
2. Create branch: `git checkout -b feat/awesome-feature`
3. Commit: `git commit -m "Add awesome feature"`
4. Push: `git push origin feat/awesome-feature`
5. Pull Request

**Please:**
- Write tests untuk fitur baru
- Follow ESLint rules
- Update dokumentasi
- Keep commits atomic

---

## 📞 Support

- 🐛 **Bugs:** GitHub Issues
- 💡 **Features:** GitHub Discussions
- 📧 **Email:** support@laporan.app
- 📚 **Docs Issues:** Create PR

---

## 📄 License

MIT License — Lihat [LICENSE](LICENSE)

---

## 🙏 Credits

- [Leaflet.js](https://leafletjs.com/) — Interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) — Free tile data
- [PostGIS](https://postgis.net/) — Geospatial database
- [Express.js](https://expressjs.com/) — Web framework
- All contributors & beta testers

---

## 📌 Quick Links

| Butuh Apa | Lihat File |
|-----------|-----------|
| Overview cepat | [docs/IMPLEMENTATION_GUIDE.md](docs/IMPLEMENTATION_GUIDE.md) |
| Setup local | Quick Start (atas) |
| API spec | [docs/API_SPEC.md](docs/API_SPEC.md) |
| User flow | [docs/UI_UX_FLOW.md](docs/UI_UX_FLOW.md) |
| Backend arch | [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md) |
| UI wireframe | [docs/WIREFRAME_VISUAL_DESIGN.md](docs/WIREFRAME_VISUAL_DESIGN.md) |
| Roadmap | [docs/FITUR_TAMBAHAN.md](docs/FITUR_TAMBAHAN.md) |

---

**Last Updated:** 2024-06-10  
**Version:** 1.0 MVP  
**Status:** 🟡 In Active Development
