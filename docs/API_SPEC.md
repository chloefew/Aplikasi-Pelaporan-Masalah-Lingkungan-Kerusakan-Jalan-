API Spec — Minimal untuk fitur peta & grouping

POST /api/reports
- Deskripsi: Buat laporan baru (dengan foto dan lokasi)
- Content-Type: multipart/form-data
- Fields: category (string), place, description, latitude, longitude, photo (file)
- Response: { success: true, report }

GET /api/reports
- Deskripsi: Ambil daftar laporan mentah (all)
- Response: [ { id, category, place, description, latitude, longitude, photo, createdAt } ]

GET /api/groups
- Deskripsi: Ambil daftar group (untuk ditampilkan di peta/cluster)
- Response: [ { id, category, latitude, longitude, count, reports[], lastReportAt, priority } ]

POST /api/groups/:id/confirm
- Deskripsi: "Saya juga melaporkan" — increment counter untuk group
- Response: { success: true, group }

Notes:
- Untuk production gunakan Postgres+PostGIS dan worker background untuk grouping/skor prioritas.
- Threshold prioritas, notifikasi, dan escalation di-handle oleh worker/service terpisah.
