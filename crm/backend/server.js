require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const CRM_PORT = process.env.PORT || process.env.CRM_PORT || 5002;

// DB path — shared with main/backend if present, or local database.db
const defaultDbPath = fs.existsSync(path.join(__dirname, '../../main/backend/database.db'))
  ? path.join(__dirname, '../../main/backend/database.db')
  : path.join(__dirname, 'database.db');
const DB_PATH = process.env.DB_PATH || defaultDbPath;

// Ensure upload directories exist
const audioUploadDir = path.join(__dirname, 'uploads/crm-audio');
const callUploadDir = path.join(__dirname, 'uploads/crm-calls');
[audioUploadDir, callUploadDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to shared SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[CRM Server] Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log(`[CRM Server] Connected to database at ${DB_PATH}`);
});

// Mount CRM routes — pass db instance
const { router: crmRouter, initCrmDb } = require('./crm.routes');
initCrmDb(db);
app.use(crmRouter);

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large.' });
    return res.status(400).json({ message: 'Upload error: ' + (err.message || 'Unknown') });
  }
  if (err) {
    console.error('[CRM Server] Unhandled error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
  }
  next();
});

if (require.main === module) {
  app.listen(CRM_PORT, () => {
    console.log(`[CRM Server] Running on http://localhost:${CRM_PORT}`);
  });
}

module.exports = { app, db };

