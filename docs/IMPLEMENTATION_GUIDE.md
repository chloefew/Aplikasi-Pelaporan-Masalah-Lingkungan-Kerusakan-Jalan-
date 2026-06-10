# Project Summary & Implementation Guide

## 📋 Ringkasan Proyek

**Aplikasi:** Sistem Pelaporan Masyarakat dengan Peta Interaktif  
**Tujuan:** Memudahkan masyarakat melaporkan masalah lingkungan (jalan rusak, sampah, lampu mati) dan membantu pemerintah mengambil keputusan berbasis data.

**Core Features (MVP):**
✅ Interactive map dengan Leaflet + OpenStreetMap  
✅ Marker clustering untuk group laporan by lokasi & kategori  
✅ Real-time counter laporan serupa ("Saya juga melaporkan")  
✅ Priority scoring & escalation otomatis  
✅ Admin dashboard dengan priority queue  
✅ Status timeline & notifikasi publik  
✅ Analytics & heatmap for government

---

## 🏗️ Arsitektur Teknis

### Stack Rekomendasi
```
Frontend:  React/Vue + React-Leaflet
Backend:   Node.js/Express + Postgres + PostGIS + Redis
Maps:      Leaflet + MarkerCluster + OpenStreetMap
Workers:   BullMQ (background jobs)
Storage:   AWS S3 / Minio (photos)
Push:      FCM (Firebase Cloud Messaging)
DevOps:    Docker + Kubernetes/ECS
```

### Database Schema (Postgres+PostGIS)
Lihat: [docs/BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md#3-performance--scalability)

### API Endpoints (9 utama)
```
POST   /api/reports              → create report + queue grouping
GET    /api/reports              → list reports
GET    /api/groups               → list groups (map clusters)
GET    /api/groups/:id           → group detail
POST   /api/groups/:id/confirm   → increment counter
GET    /api/stats                → stats & analytics
[Admin] POST /api/admin/groups/:id/assign   → assign to dinas
[Admin] PATCH /api/admin/groups/:id/status  → update status
[Admin] GET /api/admin/priority-queue       → high-priority list
```

---

## 📱 UI/UX Flow

### User Journey (3 langkah utama)

**1. Lapor Masalah**
```
Open App → Peta + GPS
   ↓
Tekan "+ Laporkan" → Form (kategori → foto → lokasi)
   ↓
Submit → Grouping otomatis → Popup konfirmasi
```

**2. Lihat Laporan di Peta**
```
Zoom out → Cluster visible (45 laporan)
   ↓
Klik cluster → Popup (counter, detail)
   ↓
"Saya Juga" → Counter increment
```

**3. Tindak Lanjut (Admin)**
```
Admin login → Dashboard (peta + priority queue)
   ↓
Klik group → Detail panel (assign, status update)
   ↓
Update status → Auto-notify reporters
```

Lihat detail: [docs/UI_UX_FLOW.md](UI_UX_FLOW.md)

---

## 🎨 Wireframe & Design

**Mobile Screens:**
- Home map (cluster & marker views)
- Marker detail popup (foto, counter, actions)
- Report form (3-step wizard)
- Success notification
- Filter & settings

**Desktop Admin:**
- Dashboard (KPI summary + map + priority queue)
- Group detail panel (assign, status, notes)
- Analytics view (charts, heatmap)
- Bulk actions & workflows

Lihat visual: [docs/WIREFRAME_VISUAL_DESIGN.md](WIREFRAME_VISUAL_DESIGN.md)

---

## 🚀 Fitur Tambahan (Roadmap)

### Phase 2 (1-2 bulan)
✓ Status timeline + notifications  
✓ Comments & discussion threads  
✓ Heatmap & analytics  
✓ Gamification (badges, leaderboard, points)  

### Phase 3 (3-4 bulan)
✓ Photo before/after verification  
✓ Dinas/Department portal  
✓ Mobile app (React Native)  
✓ Offline mode & sync  

### Phase 4 (5+ bulan)
✓ E-government API integration  
✓ Multi-channel reporting (WhatsApp, SMS)  
✓ Predictive analytics & ML  
✓ Budget tracking & cost estimation  

Lihat detail: [docs/FITUR_TAMBAHAN.md](FITUR_TAMBAHAN.md)

---

## 📊 Success Metrics

```
User Engagement:
• DAU (Daily Active Users): >10,000 users/day
• Reports per day: >500
• Repeat reporter rate: >40%

Data Quality:
• Photo submission: >90%
• Geo accuracy: >95%
• Duplicate rate: <5%

Admin Effectiveness:
• Avg time-to-resolution: <7 days
• User satisfaction: >4.0/5 stars
• Re-open rate: <10%
```

---

## 🛠️ Quick Start — Development

### 1. Setup Environment
```bash
# Clone repo
git clone <repo>
cd aplikasi-pelaporan

# Install dependencies
npm install

# Create .env
cat > .env << EOF
PORT=3000
NODE_ENV=development
DB_URL=postgresql://user:pass@localhost:5432/laporan
REDIS_URL=redis://localhost:6379
S3_BUCKET=my-bucket
FCM_KEY=your-firebase-key
EOF
```

### 2. Database Setup (Postgres+PostGIS)
```bash
# Connect to postgres
psql postgresql://localhost:5432

# Create DB
CREATE DATABASE laporan;

# Enable PostGIS
\c laporan
CREATE EXTENSION postgis;

# Run migrations
npm run migrate
```

### 3. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 4. Test Basic Flow
```bash
# 1. Open http://localhost:3000 in browser
# 2. Click "+ Laporkan"
# 3. Select category → upload photo → submit
# 4. Check GET /api/groups in console to verify grouping
# 5. Admin: http://localhost:3000/admin (create test account first)
```

---

## 📁 Project Structure

```
├── public/
│   ├── index.html         (main page with map)
│   ├── app.js            (frontend logic: map, form, groups)
│   ├── style.css         (styling)
│   └── admin.html        (admin dashboard - WIP)
├── server.js             (Express app, API routes)
├── groups.json           (temp storage for groups - use DB in prod)
├── reports.json          (temp storage for reports - use DB in prod)
├── uploads/              (temp photo storage - use S3 in prod)
├── db/
│   └── schema.sql        (Postgres+PostGIS schema)
├── docs/
│   ├── API_SPEC.md
│   ├── UI_UX_FLOW.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── WIREFRAME_VISUAL_DESIGN.md
│   ├── FITUR_TAMBAHAN.md
│   └── IMPLEMENTATION_GUIDE.md (this file)
├── package.json
└── README.md
```

---

## 🔄 Grouping Logic Explained

**Algorithm (saat laporan baru dikirim):**

```
1. Receive: POST /api/reports { category, lat, lon, photo, description }

2. Spatial query (radius 50m):
   SELECT * FROM groups 
   WHERE category = $1 
   AND ST_DWithin(geom, point, 50m)
   AND created_at > now() - 30 days

3. If match found:
   - Attach report to existing group
   - Increment count
   - Update last_report_at & centroid
   
4. Else:
   - Create new group with count=1
   - Attach report
   
5. Check priority:
   score = (0.5 * count) + (0.3 * recency) + (0.2 * severity)
   IF score >= 10 → priority=HIGH → notify reporters

6. Return: success + group summary
```

**Benefits:**
- Automatic deduplication
- Real-time aggregation
- Transparent to end-user ("8 orang melaporkan masalah ini")
- Enable priority routing

---

## 🔐 Security Considerations

### Authentication
- Public: anon users dapat lapor (no auth) atau optional sign-in
- Admin: JWT + password (2FA recommended)
- API: rate limiting (100 req/min per IP)

### Privacy
- Lat/lon rounded to ±10m (privacy-preserving)
- Personal photos encrypted at rest
- Anonymous reporting option
- GDPR compliance: delete photos after 30 days

### Data Validation
- File upload: image only, max 10MB
- GPS: must be valid lat/lon (-90 to 90, -180 to 180)
- Description: 1-500 chars, no scripts

---

## 📈 Performance & Scaling

### Optimization
- DB indexes: GIST on geometry, B-tree on category/status/created_at
- Caching: Redis cache for map clusters (5 min TTL)
- Pagination: 20 items per page (reports/groups)
- Async: grouping & notifications via worker queue

### Scale Strategy
```
1,000 reports/day: Single server OK, local file storage
10,000 reports/day: Multi-server (load balanced), Postgres required
100,000+ reports/day: Kubernetes, S3 storage, read replicas, analytics DB separate
```

---

## 🚀 Deployment Checklist

- [ ] Database: Postgres+PostGIS setup + backups
- [ ] Storage: S3 / Minio configured + CDN
- [ ] Auth: JWT keys rotated, 2FA for admin
- [ ] Monitoring: Prometheus/Grafana + Sentry
- [ ] Logging: ELK / Loki setup
- [ ] CI/CD: GitHub Actions → Docker → ECS/K8s
- [ ] SSL: HTTPS certificates (Let's Encrypt)
- [ ] Backup: Daily database snapshots
- [ ] Capacity: Load tested for expected traffic
- [ ] Security: OWASP top 10 audit + penetration testing

---

## 📞 Support & Maintenance

### Regular Tasks
- Monitor uptime: alerts if API down >1 min
- Database maintenance: VACUUM, ANALYZE weekly
- Security patches: OS + dependencies monthly
- User feedback: check comments/ratings daily
- Admin training: demos for new dinas users

### Escalation Path
- User issue → Support team → Engineering
- Bug in production → Page on-call engineer
- High-priority group → Auto-escalate to supervisor

---

## 🎯 Next Steps

### Immediate (Week 1-2)
1. ✅ Finalize API spec & database schema
2. Setup Postgres + PostGIS + Redis locally
3. Implement grouping worker (BullMQ)
4. Build admin dashboard UI
5. Test end-to-end flow

### Short-term (Week 3-4)
1. Push notifications (FCM setup)
2. Email notifications (SendGrid)
3. Photo upload to S3
4. Priority scoring automation
5. Analytics dashboard

### Medium-term (Week 5-8)
1. Status timeline UI
2. Comments/discussion threads
3. Gamification (badges, leaderboard)
4. Mobile app (React Native)
5. Offline mode

### Long-term (Week 9+)
1. E-government API integration
2. Multi-channel reporting (WhatsApp bot)
3. ML auto-categorization
4. Predictive analytics
5. Budget tracking module

---

## 📚 References & Resources

- **Leaflet.js docs:** https://leafletjs.com/
- **MarkerCluster:** https://github.com/Leaflet/Leaflet.markercluster
- **PostGIS:** https://postgis.net/documentation/
- **Express.js guide:** https://expressjs.com/
- **Firebase Cloud Messaging:** https://firebase.google.com/docs/cloud-messaging
- **Material Design 3:** https://m3.material.io/

---

## ❓ FAQ

**Q: Kenapa Leaflet dan bukan Google Maps?**
A: Leaflet open-source, gratis, tidak perlu API key, dan clustering sudah support. Google Maps bisa diganti nanti kalau butuh Street View.

**Q: Berapa cost untuk scale ke 100k users?**
A: ~$500-1000/bulan untuk AWS (RDS, S3, EC2, ALB). Dengan OSM gratis + self-hosted, bisa <$300.

**Q: Bagaimana handle laporan palsu/spam?**
A: Rate limiting per user (5 reports/day), community voting, admin moderation, trust score system.

**Q: Bisa offline mode di web?**
A: Ya, dengan Service Workers + IndexedDB. Sync saat online. Lebih mudah di mobile app.

**Q: Integrasi dengan e-Lapor pemerintah?**
A: Via webhook / scheduled sync. Admin set mapping antara kategori lokal ↔ e-Lapor categories.

---

## 👥 Team Roles & Responsibilities

| Role | Tasks |
|------|-------|
| **Backend Dev** | API, database, grouping logic, worker jobs |
| **Frontend Dev** | React, maps, forms, responsiveness |
| **DevOps** | Infra, CI/CD, monitoring, backups |
| **PM/Product** | Roadmap, stakeholder comms, metrics tracking |
| **QA** | Test scripts, bug triage, performance testing |
| **UX Designer** | Wireframes, user research, accessibility audit |

---

**Last Updated:** 2024-06-10  
**Version:** 1.0 (MVP spec)  
**Author:** Design & Development Team

---

*Dokumentasi ini adalah living document. Update saat ada perubahan requirement atau lessons learned dari implementation.*
