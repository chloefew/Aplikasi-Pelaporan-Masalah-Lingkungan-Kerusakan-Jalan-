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

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '[]', 'utf-8');
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

const saveReports = (reports) => {
  fs.writeFileSync(dataFile, JSON.stringify(reports, null, 2), 'utf-8');
};

app.post('/api/reports', upload.single('photo'), (req, res) => {
  const { description = '', place = '', latitude, longitude } = req.body;

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

  res.json({ success: true, report });
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
