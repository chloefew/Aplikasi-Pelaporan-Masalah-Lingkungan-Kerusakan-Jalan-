# Backend Architecture — Sistem Pelaporan Masyarakat

## 1. Arsitektur Umum

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLIC (Web/Mobile)                          │
│                      ↓ API calls ↓                              │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway / Load Balancer (NGINX / AWS ALB)                  │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│ │  Express.js      │  │  BullMQ Worker   │  │  Notification │  │
│ │  REST API        │  │  (Grouping Job)  │  │  Service      │  │
│ │  (POST/GET)      │  │  (Background)    │  │  (FCM/Email)  │  │
│ └────────┬─────────┘  └────────┬─────────┘  └───────────────┘  │
│          │                     │                     │           │
│          └─────────────────────┼─────────────────────┘           │
│                                │                                 │
│          ┌─────────────────────▼────────────────────┐            │
│          │  Postgres DB + PostGIS + Redis Cache    │            │
│          │  ┌────────────────────────────────────┐ │            │
│          │  │ Tables: reports, groups, users,    │ │            │
│          │  │ notifications, admin_actions       │ │            │
│          │  │ Indexes: geom (GIST), category,    │ │            │
│          │  │ status, created_at                 │ │            │
│          │  └────────────────────────────────────┘ │            │
│          └─────────────────────────────────────────┘            │
│                                │                                 │
│          ┌─────────────────────▼────────────────────┐            │
│          │  File Storage (S3-compatible)           │            │
│          │  - Report photos / proof images         │            │
│          │  - Admin action photos                  │            │
│          └─────────────────────────────────────────┘            │
│                                                                  │
│          ┌─────────────────────────────────────────┐            │
│          │  External Services Integration         │            │
│          │  - FCM (Firebase Cloud Messaging)      │            │
│          │  - SendGrid/Mailgun (Email)            │            │
│          │  - Google Maps / OpenStreetMap          │            │
│          │  - Webhook → e-government system       │            │
│          └─────────────────────────────────────────┘            │
│                                                                  │
│          ┌─────────────────────────────────────────┐            │
│          │  Monitoring & Logging                  │            │
│          │  - Prometheus (metrics)                │            │
│          │  - ELK Stack / Loki (logs)             │            │
│          │  - Sentry (error tracking)             │            │
│          └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Services — Penjelasan

### A. API Service (Express.js)
**Port:** 3000 (dev) / 80/443 (prod)

**Endpoints:**
```
✓ POST   /api/reports              → create report + queue grouping job
✓ GET    /api/reports              → list all reports (paginated)
✓ GET    /api/reports/:id          → detail report
✓ GET    /api/groups               → list groups (for map render)
✓ GET    /api/groups/:id           → detail group + latest reports
✓ POST   /api/groups/:id/confirm   → increment counter ("Saya juga lapor")
✓ GET    /api/stats                → stats (total, by category, heatmap)

[Admin only]
✓ POST   /api/admin/groups/:id/assign    → assign to dinas
✓ PATCH  /api/admin/groups/:id/status    → update status (open/in-progress/resolved)
✓ POST   /api/admin/groups/:id/notify    → send notification to reporters
✓ GET    /api/admin/priority-queue       → list high-priority groups
✓ GET    /api/admin/analytics/report     → export analytics

[Internal]
✓ POST   /api/worker/process-grouping    → trigger grouping worker
✓ POST   /api/worker/check-priority      → check & escalate priority
```

**Response format:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100, "limit": 20 },
  "timestamp": "2024-06-10T10:30:00Z"
}
```

### B. Database Schema (Postgres + PostGIS)

**reports table**
```sql
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,  -- UUID atau anonymized ID
  group_id BIGINT,           -- FK to report_groups
  category VARCHAR(50),      -- 'jalan', 'sampah', 'lampu', 'lainnya'
  description TEXT,
  place VARCHAR(255),        -- nama jalan, area
  photo_url TEXT,            -- S3 URL
  geom GEOMETRY(POINT, 4326),-- PostGIS geometry (lat/lon)
  status VARCHAR(50),        -- 'reported', 'grouped', 'in_action', 'resolved'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_reports_group_id ON reports(group_id);
CREATE INDEX idx_reports_geom ON reports USING GIST(geom);
CREATE INDEX idx_reports_category ON reports(category);
```

**report_groups table (clusters)**
```sql
CREATE TABLE report_groups (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(50),
  geom GEOMETRY(POINT, 4326),    -- centroid lokasi grup
  count INT DEFAULT 1,            -- jumlah laporan
  latest_report_id BIGINT,        -- FK to reports
  status VARCHAR(50),             -- 'open', 'in_progress', 'resolved'
  priority VARCHAR(20),           -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP,
  last_report_at TIMESTAMP,
  assigned_to VARCHAR(100),       -- nama dinas/pejabat
  internal_notes TEXT,            -- catatan admin
  estimated_cost DECIMAL(12,2),   -- estimasi biaya perbaikan
  resolved_at TIMESTAMP
);
CREATE INDEX idx_groups_geom ON report_groups USING GIST(geom);
CREATE INDEX idx_groups_priority ON report_groups(priority);
```

**group_reports table (many-to-many)**
```sql
CREATE TABLE group_reports (
  group_id BIGINT REFERENCES report_groups(id) ON DELETE CASCADE,
  report_id BIGINT REFERENCES reports(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, report_id)
);
```

**notifications table**
```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT,
  group_id BIGINT,
  type VARCHAR(50),           -- 'priority_high', 'status_update', 'resolved', etc.
  title VARCHAR(255),
  message TEXT,
  sent_at TIMESTAMP DEFAULT now(),
  read_at TIMESTAMP,
  channel VARCHAR(20)         -- 'push', 'email', 'sms'
);
```

### C. Grouping Logic (Background Worker)

**Trigger:** Saat POST /api/reports → enqueue job `process-grouping`

**Algorithm:**
```javascript
async function processGrouping(reportId) {
  const report = await Reports.findById(reportId);
  
  // 1. Query untuk candidate groups:
  // - Kategori SAMA
  // - Lokasi dalam radius 50m (ST_DWithin)
  // - Created dalam 30 hari terakhir
  const candidates = await db.query(`
    SELECT * FROM report_groups
    WHERE category = $1
    AND ST_DWithin(geom::geography, $2::geography, 50)
    AND created_at > now() - interval '30 days'
    ORDER BY last_report_at DESC
    LIMIT 1
  `, [report.category, `POINT(${report.lon} ${report.lat})`]);
  
  // 2. Jika ada candidate → attach + increment
  if (candidates.length > 0) {
    const group = candidates[0];
    await db.query(`
      INSERT INTO group_reports (group_id, report_id) VALUES ($1, $2)
    `, [group.id, report.id]);
    await db.query(`
      UPDATE report_groups 
      SET count = count + 1, 
          last_report_at = now(),
          latest_report_id = $1
      WHERE id = $2
    `, [report.id, group.id]);
  } else {
    // 3. Tidak ada → buat group baru
    const newGroup = await db.query(`
      INSERT INTO report_groups (category, geom, count, latest_report_id, created_at, last_report_at)
      VALUES ($1, $2::geometry, 1, $3, now(), now())
      RETURNING id
    `, [report.category, `POINT(${report.lon} ${report.lat})`, report.id]);
    
    await db.query(`
      INSERT INTO group_reports (group_id, report_id) VALUES ($1, $2)
    `, [newGroup.rows[0].id, report.id]);
  }
}
```

### D. Priority Scoring & Escalation (Worker — Periodic)

**Runs:** Setiap 6 jam atau manual trigger

```javascript
async function updatePriorityScores() {
  // Score formula:
  // score = (count_weight * count) + (recency_weight * recency_score) + (category_weight * category_severity)
  
  const groups = await db.query('SELECT * FROM report_groups WHERE status = "open"');
  
  for (const group of groups) {
    const count = group.count;
    const daysSinceLast = (Date.now() - new Date(group.last_report_at)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 10 - daysSinceLast);
    const categorySeverity = { 'jalan': 3, 'sampah': 1.5, 'lampu': 2 }[group.category] || 1;
    
    const score = (0.5 * count) + (0.3 * recencyScore) + (0.2 * categorySeverity * count);
    
    let priority = 'low';
    if (score >= 15) priority = 'critical';
    else if (score >= 10) priority = 'high';
    else if (score >= 5) priority = 'medium';
    
    // Update priority
    await db.query(
      'UPDATE report_groups SET priority = $1 WHERE id = $2',
      [priority, group.id]
    );
    
    // Trigger notifications if escalated
    if (group.priority === 'low' && priority === 'high') {
      await notificationService.sendToReporters(group.id, 
        `Laporan Anda sekarang prioritas TINGGI! ${group.count} orang lain melaporkan masalah serupa.`
      );
    }
  }
}
```

### E. Notification Service

**Channels:**
1. **FCM (Firebase Cloud Messaging)** → push notification
2. **Email** → SendGrid / Mailgun
3. **SMS** → Twilio / local provider
4. **In-app badge** → Redis pub/sub

**Example: Send to group reporters**
```javascript
async function notifyReporters(groupId, message, type = 'group_update') {
  // 1. Get all reporters in group
  const reporters = await db.query(`
    SELECT DISTINCT u.id, u.fcm_token, u.email, u.phone, u.notification_prefs
    FROM group_reports gr
    JOIN reports r ON gr.report_id = r.id
    JOIN users u ON r.user_id = u.id
    WHERE gr.group_id = $1
  `, [groupId]);
  
  // 2. Send via preferred channels
  for (const user of reporters) {
    const prefs = user.notification_prefs || {};
    
    if (prefs.push_enabled && user.fcm_token) {
      await fcm.send({
        token: user.fcm_token,
        notification: { title: 'Laporan Update', body: message },
        data: { type, group_id: groupId.toString() }
      });
    }
    
    if (prefs.email_enabled && user.email) {
      await emailService.send(user.email, 'Laporan Update', message);
    }
  }
  
  // 3. Log notification
  await db.query(`
    INSERT INTO notifications (group_id, type, message, sent_at, channel)
    VALUES ($1, $2, $3, now(), 'multi')
  `, [groupId, type, message]);
}
```

---

## 3. Performance & Scalability

### Caching Strategy (Redis)
```
- Map viewport clusters: cache by bbox + zoom (5 min TTL)
- Group detail: cache 10 min
- User notifications: cache 1 min
- Stats/analytics: cache 1 hour
```

### Database Optimization
```
- PostGIS GIST index → spatial queries fast
- Partitioning (optional): reports table by month
- Connection pooling: PgBouncer atau pgPool
- Read replicas untuk analytics queries
```

### Load Handling
```
- API: horizontal scale (multiple Express instances behind LB)
- Worker: scale BullMQ workers based on queue depth
- DB: Postgres replication + failover
- CDN: CloudFront for static tiles / cached API responses
```

---

## 4. Security & Privacy

### Authentication
- JWT tokens + refresh tokens
- Anonymous reporting: hash user IP + timestamp → pseudonymous ID
- 2FA untuk admin accounts

### Data Privacy
- Lat/lon rounded to ~10m (±500 accuracy loss acceptable)
- Personal photos: encrypted at rest, deleted per GDPR schedule
- IP logging: only for fraud detection, cleared monthly

### Rate Limiting
- Public API: 100 req/min per IP
- Report submission: 5 reports/day per user (spam prevention)
- Admin endpoints: 1000 req/min per user

### Audit Logging
- All admin actions logged: who changed what when
- Report status changes: logged with admin username
- Notification sends: logged for compliance

---

## 5. Deployment Pipeline

```
Git push → GitHub Actions → CI/CD pipeline
  1. Lint + test (Jest, Postgres testdb)
  2. Build Docker image
  3. Push to ECR
  4. Deploy to ECS/K8s (staging → manual approval → prod)
  5. Database migration (Flyway / Alembic)
  6. Smoke tests → alert if fail
```

---

## 6. Tech Stack (Recommended for Production)

| Layer | Component | Rationale |
|-------|-----------|-----------|
| API | Node.js + Express | Fast, async-friendly |
| Database | PostgreSQL + PostGIS | Geographic queries, reliability |
| Cache | Redis | Session, rate-limit, queue |
| Job Queue | BullMQ (Redis) | Background tasks, reliability |
| File Storage | AWS S3 / Minio | Scalable, durable |
| Notification | FCM + SendGrid | Reliable, battle-tested |
| Frontend | React / React-Leaflet | Component-driven, fast |
| Maps | Leaflet + OpenStreetMap / Google Maps | Clustering, interactive |
| DevOps | Docker + Kubernetes / ECS | Containerized, scalable |
| Monitoring | Prometheus + Grafana + Loki | Observable, alerts |
| CDN | CloudFront / Cloudflare | Fast delivery, DDoS protection |

---

## 7. Roadmap — Implementasi Bertahap

### Phase 1 (MVP, 2-3 minggu)
✓ API dasar (create report, get groups)
✓ Leaflet + clustering frontend
✓ File upload & storage (local disk, nanti S3)
✓ Grouping logic (spatial + category)
✓ Basic notifications (in-app badge)
✓ Admin dashboard (simple view-only)

### Phase 2 (4-6 minggu)
- Priority scoring + escalation worker
- Email + SMS notifications (SendGrid + Twilio)
- Admin: assign, status update, photo upload
- Analytics: basic stats & heatmap
- User authentication + profile
- Anonymous reporting option

### Phase 3 (7-10 minggu)
- Mobile app (React Native)
- Offline mode + sync
- Gamification (badges, leaderboard)
- Verifikasi crowd-sourced (voting on photos)
- Follow-up status tracking
- Advanced analytics (export PDF report)

### Phase 4 (ongoing)
- Machine learning: auto-categorize from photo
- Integration e-government (API webhook)
- Multi-bahasa support
- Real-time collaboration (admin team)
