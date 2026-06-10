const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const uploadsDir = path.join(__dirname, 'uploads');
const dataFile = path.join(__dirname, 'reports.json');
const groupsFile = path.join(__dirname, 'groups.json');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '[]', 'utf-8');
}
if (!fs.existsSync(groupsFile)) {
  fs.writeFileSync(groupsFile, '[]', 'utf-8');
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const loadReports = () => {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  } catch (error) {
    return [];
  }
};

const loadGroups = () => {
  try {
    return JSON.parse(fs.readFileSync(groupsFile, 'utf-8'));
  } catch (error) {
    return [];
  }
};

const saveGroups = (groups) => {
  fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2), 'utf-8');
};

const saveReports = (reports) => {
  fs.writeFileSync(dataFile, JSON.stringify(reports, null, 2), 'utf-8');
};

app.post('/api/reports', upload.single('photo'), (req, res) => {
  const { description = '', place = '', latitude, longitude, category = 'umum' } = req.body;

  if (!req.file || !latitude || !longitude) {
    return res.status(400).json({ error: 'Lokasi dan foto wajib diisi.' });
  }

  const report = {
    id: Date.now(),
    description,
    place,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    photo: `/uploads/${req.file.filename}`,
    createdAt: new Date().toISOString()
  };

  const reports = loadReports();
  reports.unshift(report);
  saveReports(reports);

  // Grouping: spatial + category
  try {
    const groups = loadGroups();
    const R_METERS = 50; // radius to group (meters)

    const toRad = (deg) => deg * Math.PI / 180;
    const haversineMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // m
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // find candidate group same category within radius
    let matched = null;
    for (const g of groups) {
      if (g.category !== category) continue;
      const d = haversineMeters(g.latitude, g.longitude, report.latitude, report.longitude);
      if (d <= R_METERS) {
        matched = g;
        break;
      }
    }

    if (matched) {
      matched.count = (matched.count || 1) + 1;
      matched.lastReportAt = report.createdAt;
      matched.reports = matched.reports || [];
      matched.reports.unshift(report.id);
      // optional: update centroid (simple average)
      matched.latitude = (matched.latitude + report.latitude) / 2;
      matched.longitude = (matched.longitude + report.longitude) / 2;
    } else {
      const newGroup = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        category,
        latitude: report.latitude,
        longitude: report.longitude,
        count: 1,
        reports: [report.id],
        createdAt: report.createdAt,
        lastReportAt: report.createdAt,
        priority: 'low'
      };
      groups.unshift(newGroup);
    }

    saveGroups(groups);
  } catch (err) {
    console.error('Grouping error', err);
  }

  res.json({ success: true, report });
});

// Get grouped reports for map (clusters)
app.get('/api/groups', (req, res) => {
  res.json(loadGroups());
});

// Increment group counter ("Saya juga melaporkan")
app.post('/api/groups/:id/confirm', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const groups = loadGroups();
  const g = groups.find(x => x.id === id);
  if (!g) return res.status(404).json({ error: 'Group tidak ditemukan' });
  g.count = (g.count || 1) + 1;
  g.lastReportAt = new Date().toISOString();
  saveGroups(groups);
  res.json({ success: true, group: g });
});

app.get('/api/reports', (req, res) => {
  res.json(loadReports());
});

app.use('/uploads', express.static(uploadsDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
