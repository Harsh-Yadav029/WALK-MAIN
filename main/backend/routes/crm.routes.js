// ═══════════════════════════════════════════════════════════════════════════════
// Walk The plan — B2B Sales CRM Routes
// Auth + RBAC + Lead Management + Bulk Upload + Call Logging + Audio + Signaling
// ═══════════════════════════════════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { parseLeadSpreadsheet, sanitizeLeadObject } = require('./crm-lead.parser');

const JWT_SECRET = process.env.JWT_SECRET || 'walk_the_plan_crm_secret_key_2026';

// ─── DB Schema Init ───────────────────────────────────────────────────────────
function initCrmDb(db) {
  // CRM Leads table
  db.run(`CREATE TABLE IF NOT EXISTS crm_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      source TEXT,
      status TEXT DEFAULT 'new',
      priority TEXT DEFAULT 'medium',
      assigned_to TEXT,
      notes TEXT,
      city TEXT,
      state TEXT,
      budget TEXT,
      requirement TEXT,
      follow_up_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      audio_url TEXT,
      tags TEXT
    )`, (err) => {
      if (err) console.error('[CRM] Error creating crm_leads table:', err.message);
      else console.log('[CRM] crm_leads table ready.');
    });

    // CRM Users table
    db.run(`CREATE TABLE IF NOT EXISTS crm_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'agent',
      password_hash TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      avatar_color TEXT
    )`, (err) => {
      if (err) {
        console.error('[CRM] Error creating crm_users table:', err.message);
      } else {
        console.log('[CRM] crm_users table ready.');
        // Seed default admin if none exists
        db.get('SELECT COUNT(*) as count FROM crm_users', (countErr, row) => {
          if (!countErr && (!row || row.count === 0)) {
            const hash = bcrypt.hashSync('walk@321', 10);
            db.run(
              'INSERT INTO crm_users (name, email, role, password_hash, is_active, department) VALUES (?, ?, ?, ?, 1, ?)',
              ['Admin', 'admin@walktheplan.in', 'admin', hash, 'Management']
            );
            console.log('[CRM] Seeded default administrator (admin@walktheplan.in / walk@321).');
          } else {
            // Ensure admin@walktheplan.in specifically exists
            db.get('SELECT id FROM crm_users WHERE email = ?', ['admin@walktheplan.in'], (adminErr, adminRow) => {
              if (!adminErr && !adminRow) {
                const hash = bcrypt.hashSync('walk@321', 10);
                db.run(
                  'INSERT INTO crm_users (name, email, role, password_hash, is_active, department) VALUES (?, ?, ?, ?, 1, ?)',
                  ['Admin', 'admin@walktheplan.in', 'admin', hash, 'Management']
                );
                console.log('[CRM] Seeded administrator (admin@walktheplan.in / walk@321).');
              }
            });
          }
        });
      }
    });

    // Safe migration: add department column if it doesn't exist
    db.run(`ALTER TABLE crm_users ADD COLUMN department TEXT`, () => {
      // Ignore error — column may already exist
    });

    // Lead activity log
    db.run(`CREATE TABLE IF NOT EXISTS crm_lead_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      user_id INTEGER,
      action TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('[CRM] Error creating crm_lead_activities table:', err.message);
      else console.log('[CRM] crm_lead_activities table ready.');
    });

    // Call logs table — stores WebRTC/browser call metadata & recording paths
    db.run(`CREATE TABLE IF NOT EXISTS crm_call_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      caller_id INTEGER,
      caller_name TEXT,
      direction TEXT DEFAULT 'outbound',
      status TEXT DEFAULT 'completed',
      duration_seconds INTEGER DEFAULT 0,
      recording_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) console.error('[CRM] Error creating crm_call_logs table:', err.message);
      else console.log('[CRM] crm_call_logs table ready.');
    });
}

// ─── Hardened Auth Middleware ─────────────────────────────────────────────────
// Strictly enforces JWT — rejects all unauthenticated requests with 401
function crmAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
}

// ─── Role-Based Access Control Middleware ─────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Requires role: ${roles.join(' or ')}.` });
    }
    next();
  };
}

// ─── Avatar Colors ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#E53935', '#D81B60', '#8E24AA', '#3949AB',
  '#1E88E5', '#00897B', '#43A047', '#FB8C00'
];
function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// ─── DB helpers (promisified) ──────────────────────────────────────────────────
let _db = null;

router.use((req, res, next) => {
  if (!_db) {
    const sqlite3 = require('sqlite3').verbose();
    const defaultDbPath = fs.existsSync(path.join(__dirname, '../database.db'))
      ? path.join(__dirname, '../database.db')
      : (fs.existsSync(path.join(__dirname, '../../main/backend/database.db'))
        ? path.join(__dirname, '../../main/backend/database.db')
        : path.join(__dirname, 'database.db'));
    const dbPath = process.env.DB_PATH || defaultDbPath;
    _db = new sqlite3.Database(dbPath);
  }
  req.crmDb = _db;
  next();
});

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ─── Multer Storage ───────────────────────────────────────────────────────────

// Audio notes storage (attached to leads)
const crmAudioDir = path.join(__dirname, 'uploads', 'crm-audio');
if (!fs.existsSync(crmAudioDir)) fs.mkdirSync(crmAudioDir, { recursive: true });

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, crmAudioDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `lead-${req.params.id || 'rec'}-${Date.now()}${ext}`);
  }
});
const audioUpload = multer({
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => cb(null, true)
});

// Call recording storage (WebRTC call recordings)
const crmCallsDir = path.join(__dirname, 'uploads', 'crm-calls');
if (!fs.existsSync(crmCallsDir)) fs.mkdirSync(crmCallsDir, { recursive: true });

const callRecordingStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, crmCallsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `call-${req.params.id || 'rec'}-${Date.now()}${ext}`);
  }
});
const callRecordingUpload = multer({
  storage: callRecordingStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB for call recordings
  fileFilter: (req, file, cb) => cb(null, true)
});

// CSV/Excel upload (in-memory)
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });


// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/crm/auth/login
router.post('/api/crm/auth/login', async (req, res) => {
  const db = req.crmDb;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await dbGet(
      db,
      'SELECT * FROM crm_users WHERE email = ? AND is_active = 1',
      [email.trim().toLowerCase()]
    );
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar_color: user.avatar_color,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_color: user.avatar_color,
        department: user.department,
      }
    });
  } catch (err) {
    console.error('[CRM] POST /api/crm/auth/login error:', err.message);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/crm/auth/me
router.get('/api/crm/auth/me', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const user = await dbGet(
      db,
      'SELECT id, name, email, phone, role, is_active, avatar_color, department, created_at FROM crm_users WHERE id = ?',
      [req.user.id]
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    console.error('[CRM] GET /api/crm/auth/me error:', err.message);
    res.status(500).json({ message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// CRM USER ROUTES (no delete — only create, read, update/deactivate)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/crm/users — create CRM user (Admin only)
router.post('/api/crm/users', crmAuth, requireRole('admin'), async (req, res) => {
  const db = req.crmDb;
  try {
    const { name, email, phone, role, password, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required.' });
    }
    const existing = await dbGet(db, 'SELECT id FROM crm_users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const password_hash = await bcrypt.hash(password, 10);
    const avatar_color = randomAvatarColor();
    const result = await dbRun(
      db,
      `INSERT INTO crm_users (name, email, phone, role, password_hash, avatar_color, department)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email.trim().toLowerCase(), phone || null, role || 'agent', password_hash, avatar_color, department || null]
    );
    res.status(201).json({ id: result.lastID, name, email, role: role || 'agent', avatar_color });
  } catch (err) {
    console.error('[CRM] POST /api/crm/users error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/users — list all CRM users
router.get('/api/crm/users', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const users = await dbAll(
      db,
      `SELECT id, name, email, phone, role, is_active, avatar_color, department, created_at
       FROM crm_users ORDER BY id DESC`
    );
    res.json({ users });
  } catch (err) {
    console.error('[CRM] GET /api/crm/users error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/crm/users/:id — update user (Admin only; deactivate is the only "removal")
router.put('/api/crm/users/:id', crmAuth, requireRole('admin'), async (req, res) => {
  const db = req.crmDb;
  try {
    const { name, phone, role, is_active, department } = req.body;
    const result = await dbRun(
      db,
      `UPDATE crm_users
       SET name       = COALESCE(?, name),
           phone      = COALESCE(?, phone),
           role       = COALESCE(?, role),
           is_active  = COALESCE(?, is_active),
           department = COALESCE(?, department)
       WHERE id = ?`,
      [name || null, phone || null, role || null,
      is_active != null ? is_active : null,
      department || null, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated.' });
  } catch (err) {
    console.error('[CRM] PUT /api/crm/users/:id error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/crm/users/:id/password — change user password (Admin only)
router.put('/api/crm/users/:id/password', crmAuth, requireRole('admin'), async (req, res) => {
  const db = req.crmDb;
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await dbRun(
      db,
      'UPDATE crm_users SET password_hash = ? WHERE id = ?',
      [password_hash, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'Password updated.' });
  } catch (err) {
    console.error('[CRM] PUT /api/crm/users/:id/password error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/crm/users/:id — delete user account (Admin only)
router.delete('/api/crm/users/:id', crmAuth, requireRole('admin'), async (req, res) => {
  const db = req.crmDb;
  try {
    const targetId = parseInt(req.params.id, 10);
    if (req.user && req.user.id === targetId) {
      return res.status(400).json({ message: 'Cannot delete your own active administrator account.' });
    }
    const targetUser = await dbGet(db, 'SELECT id, name, email FROM crm_users WHERE id = ?', [targetId]);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    // Clean up references in leads and call logs
    await dbRun(db, 'UPDATE crm_leads SET assigned_to = NULL WHERE assigned_to = ?', [String(targetId)]);
    await dbRun(db, 'UPDATE crm_call_logs SET caller_id = NULL WHERE caller_id = ?', [targetId]);

    await dbRun(db, 'DELETE FROM crm_users WHERE id = ?', [targetId]);
    res.json({ success: true, message: `User "${targetUser.name}" (${targetUser.email}) removed successfully.` });
  } catch (err) {
    console.error('[CRM] DELETE /api/crm/users/:id error:', err.message);
    res.status(500).json({ message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// CRM LEAD ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/crm/leads — paginated list with filters
router.get('/api/crm/leads', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;
    const status = req.query.status || '';
    const search = req.query.search || '';
    const assigned_to = req.query.assigned_to || '';
    const priority = req.query.priority || '';
    const source = req.query.source || '';
    let lead_category = req.query.lead_category || '';
    const start_date = req.query.start_date || '';
    const end_date = req.query.end_date || '';

    // Marketing role constraint: STRICTLY Meta Leads only
    if (req.user.role === 'marketing' || (req.user.department && req.user.department.toLowerCase() === 'marketing')) {
      lead_category = 'meta';
    }

    const conditions = [];
    const params = [];

    // Category filter (meta vs website)
    if (lead_category) {
      conditions.push('lead_category = ?');
      params.push(lead_category);
    }

    // Date range filter
    if (start_date) {
      conditions.push('date(created_at) >= date(?)');
      params.push(start_date);
    }
    if (end_date) {
      conditions.push('date(created_at) <= date(?)');
      params.push(end_date);
    }

    // Agents can only see their own assigned leads
    if (req.user.role === 'agent' && req.user.name) {
      conditions.push('(assigned_to = ? OR assigned_to IS NULL)');
      params.push(req.user.name);
    }

    if (status) { conditions.push('status = ?'); params.push(status); }
    if (priority) { conditions.push('priority = ?'); params.push(priority); }
    if (source) { conditions.push('source = ?'); params.push(source); }
    if (assigned_to) { conditions.push('assigned_to = ?'); params.push(assigned_to); }
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR city LIKE ? OR requirement LIKE ? OR meta_campaign_name LIKE ? OR studio_location LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like, like);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const totalRow = await dbGet(db, `SELECT COUNT(*) as total FROM crm_leads ${where}`, params);
    const total = totalRow ? totalRow.total : 0;
    const pages = Math.ceil(total / limit);

    const leads = await dbAll(
      db,
      `SELECT * FROM crm_leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ leads, total, pages, page, limit });
  } catch (err) {
    console.error('[CRM] GET /api/crm/leads error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/crm/leads — create lead manually
router.post('/api/crm/leads', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    if (req.user.role === 'marketing') {
      return res.status(403).json({ message: 'Marketing personnel have View-Only access to Meta Leads.' });
    }

    const {
      name, email, phone, source, status, priority, assigned_to, notes,
      city, state, budget, requirement, follow_up_date, tags,
      lead_category, meta_platform, floor_plan_status, plot_size,
      studio_location, package_service, payment_status, token_paid, balance_pending, razorpay_id, inquiry_details
    } = req.body;

    const result = await dbRun(
      db,
      `INSERT INTO crm_leads
         (name, email, phone, source, status, priority, assigned_to, notes,
          city, state, budget, requirement, follow_up_date, tags,
          lead_category, meta_platform, floor_plan_status, plot_size,
          studio_location, package_service, payment_status, token_paid, balance_pending, razorpay_id, inquiry_details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name || null, email || null, phone || null, source || null,
        status || 'Hot Lead', priority || 'medium', assigned_to || null,
        notes || null, city || null, state || null, budget || null,
        requirement || null, follow_up_date || null, tags || null,
        lead_category || 'meta', meta_platform || null, floor_plan_status || null, plot_size || null,
        studio_location || null, package_service || null, payment_status || null,
        token_paid || 0, balance_pending || 0, razorpay_id || null, inquiry_details || null
      ]
    );
    res.status(201).json({ id: result.lastID, message: 'Lead created successfully.' });
  } catch (err) {
    console.error('[CRM] POST /api/crm/leads error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/crm/leads/:id — update lead
router.put('/api/crm/leads/:id', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    if (req.user.role === 'marketing') {
      return res.status(403).json({ message: 'Marketing personnel have View-Only access to Meta Leads.' });
    }

    const fields = [
      'name', 'email', 'phone', 'source', 'status', 'priority',
      'assigned_to', 'notes', 'city', 'state', 'budget',
      'requirement', 'follow_up_date', 'tags',
      'lead_category', 'meta_platform', 'floor_plan_status', 'plot_size',
      'studio_location', 'package_service', 'payment_status', 'token_paid',
      'balance_pending', 'razorpay_id', 'inquiry_details'
    ];
    const setClauses = [];
    const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        setClauses.push(`${f} = ?`);
        params.push(req.body[f]);
      }
    }
    if (!setClauses.length) return res.status(400).json({ message: 'No fields to update.' });
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    await dbRun(db, `UPDATE crm_leads SET ${setClauses.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Lead updated successfully.' });
  } catch (err) {
    console.error('[CRM] PUT /api/crm/leads/:id error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/leads/meta-webhook — Meta Webhook Challenge verification
router.get('/api/crm/leads/meta-webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
    return res.send(req.query['hub.challenge']);
  }
  res.json({ status: 'active', message: 'Meta Ads Webhook Endpoint Live & Ready' });
});

// POST /api/crm/leads/meta-webhook — Ingest live leads from Meta Ads Manager / Google Sheets
router.post('/api/crm/leads/meta-webhook', async (req, res) => {
  const db = req.crmDb;
  try {
    // Meta Webhook Challenge verification
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.challenge']) {
      return res.send(req.query['hub.challenge']);
    }

    const payload = req.body || {};
    const name = payload.full_name || payload.name || payload.client_name || 'New Meta Lead';
    const email = payload.email || payload.email_address || null;
    const phone = payload.phone_number || payload.phone || null;
    const city = payload.city || payload.location || null;
    const platform = (payload.platform || 'ig').toLowerCase();
    const floor_plan_status = payload['what_is_your_floor_plan_status_?'] || payload.floor_plan_status || null;
    const plot_size = payload['what_is_your_plot_size_?'] || payload.plot_size || null;
    const ad_name = payload.ad_name || payload.ad_id || 'Meta Ad Campaign';
    const campaign_name = payload.campaign_name || payload.campaign_id || 'Walk The Plan 1:1';
    const status = payload.status || 'Hot Lead';

    const result = await dbRun(
      db,
      `INSERT INTO crm_leads 
        (name, email, phone, city, source, status, lead_category, meta_platform, floor_plan_status, plot_size, meta_ad_name, meta_campaign_name)
       VALUES (?, ?, ?, ?, ?, ?, 'meta', ?, ?, ?, ?, ?)`,
      [name, email, phone, city, `Meta Ads (${platform.toUpperCase()})`, status, platform, floor_plan_status, plot_size, ad_name, campaign_name]
    );

    res.status(201).json({ success: true, id: result.lastID, message: 'Meta Lead ingested successfully.' });
  } catch (err) {
    console.error('[CRM Webhook] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/crm/hr/stats — Human Resources Department Staff Analytics
router.get('/api/crm/hr/stats', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const totalRow = await dbGet(db, 'SELECT COUNT(*) as total FROM crm_users WHERE is_active = 1');
    const deptRows = await dbAll(db, `
      SELECT department, COUNT(*) as count 
      FROM crm_users 
      WHERE is_active = 1 
      GROUP BY department
    `);

    const departmentBreakdown = {
      sales: 0,
      marketing: 0,
      operations: 0,
      hr: 0,
      finance: 0,
      franchise: 0,
      management: 0
    };

    for (const r of deptRows) {
      const d = (r.department || '').toLowerCase();
      if (d.includes('sales')) departmentBreakdown.sales += r.count;
      else if (d.includes('market')) departmentBreakdown.marketing += r.count;
      else if (d.includes('operat')) departmentBreakdown.operations += r.count;
      else if (d.includes('hr') || d.includes('human')) departmentBreakdown.hr += r.count;
      else if (d.includes('finan')) departmentBreakdown.finance += r.count;
      else if (d.includes('franch')) departmentBreakdown.franchise += r.count;
      else departmentBreakdown.management += r.count;
    }

    const employees = await dbAll(
      db,
      'SELECT id, name, email, phone, role, department, is_active, created_at FROM crm_users ORDER BY department ASC, name ASC'
    );

    res.json({
      totalEmployees: totalRow ? totalRow.total : 0,
      departmentBreakdown,
      employees
    });
  } catch (err) {
    console.error('[CRM] GET /api/crm/hr/stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/crm/leads/:id — admin/manager only (deletes lead and associated audio files)
router.delete('/api/crm/leads/:id', crmAuth, requireRole('admin', 'manager'), async (req, res) => {
  const db = req.crmDb;
  try {
    const lead = await dbGet(db, 'SELECT id, audio_url FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });

    // Clean up attached audio file from disk
    if (lead.audio_url) {
      const filePath = path.join(__dirname, lead.audio_url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) { } }
    }

    // Clean up associated call recordings from disk
    const calls = await dbAll(db, 'SELECT id, recording_url FROM crm_call_logs WHERE lead_id = ?', [req.params.id]);
    for (const c of (calls || [])) {
      if (c.recording_url) {
        const callFilePath = path.join(__dirname, c.recording_url.replace(/^\//, ''));
        if (fs.existsSync(callFilePath)) { try { fs.unlinkSync(callFilePath); } catch (_) { } }
      }
    }

    await dbRun(db, 'DELETE FROM crm_call_logs WHERE lead_id = ?', [req.params.id]);
    await dbRun(db, 'DELETE FROM crm_lead_activities WHERE lead_id = ?', [req.params.id]);
    const result = await dbRun(db, 'DELETE FROM crm_leads WHERE id = ?', [req.params.id]);

    if (result.changes === 0) return res.status(404).json({ message: 'Lead not found.' });
    res.json({ success: true, message: 'Lead and associated audio files deleted successfully.' });
  } catch (err) {
    console.error('[CRM] DELETE /api/crm/leads/:id error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/crm/leads/bulk-delete — admin/manager only
router.post('/api/crm/leads/bulk-delete', crmAuth, requireRole('admin', 'manager'), async (req, res) => {
  const db = req.crmDb;
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array required.' });
    }
    let deleted = 0;
    for (const id of ids) {
      const lead = await dbGet(db, 'SELECT id, audio_url FROM crm_leads WHERE id = ?', [id]);
      if (lead) {
        if (lead.audio_url) {
          const filePath = path.join(__dirname, lead.audio_url.replace(/^\//, ''));
          if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) { } }
        }
        const calls = await dbAll(db, 'SELECT id, recording_url FROM crm_call_logs WHERE lead_id = ?', [id]);
        for (const c of (calls || [])) {
          if (c.recording_url) {
            const callFilePath = path.join(__dirname, c.recording_url.replace(/^\//, ''));
            if (fs.existsSync(callFilePath)) { try { fs.unlinkSync(callFilePath); } catch (_) { } }
          }
        }
        await dbRun(db, 'DELETE FROM crm_call_logs WHERE lead_id = ?', [id]);
        await dbRun(db, 'DELETE FROM crm_lead_activities WHERE lead_id = ?', [id]);
        await dbRun(db, 'DELETE FROM crm_leads WHERE id = ?', [id]);
        deleted++;
      }
    }
    res.json({ success: true, deleted, message: `Successfully deleted ${deleted} lead(s) and their audio.` });
  } catch (err) {
    console.error('[CRM] bulk delete leads error:', err.message);
    res.status(500).json({ message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// BULK LEAD UPLOAD (CSV / Excel / JSON)
// ═══════════════════════════════════════════════════════════════════════════════

const handleLeadUpload = async (req, res) => {
  const db = req.crmDb;

  // Agents cannot bulk upload
  if (req.user && req.user.role === 'agent') {
    return res.status(403).json({ message: 'Agents are not permitted to bulk upload leads.' });
  }

  let leadsToInsert = [];
  let parseErrors = [];

  try {
    const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);

    // ── Excel (.xlsx, .xls) / CSV / TSV file upload path ──
    if (uploadedFile) {
      const parsed = parseLeadSpreadsheet(uploadedFile.buffer, uploadedFile.originalname);
      leadsToInsert = parsed.leads || [];
      parseErrors = parsed.errors || [];
    }
    // ── JSON body path ──
    else if (req.body && (req.body.leads || Array.isArray(req.body) || req.body.name)) {
      let rawList = req.body.leads || req.body;
      if (typeof rawList === 'string') {
        try {
          rawList = JSON.parse(rawList);
        } catch {
          return res.status(400).json({ message: 'Invalid JSON in leads field.' });
        }
      }
      if (!Array.isArray(rawList)) {
        rawList = [rawList];
      }
      leadsToInsert = rawList.map(sanitizeLeadObject).filter(Boolean);
    } else {
      return res.status(400).json({ message: 'Provide an Excel (.xlsx/.xls) or CSV spreadsheet, or JSON leads array.' });
    }

    if (leadsToInsert.length === 0) {
      return res.status(400).json({
        message: 'No valid leads found in upload. Please ensure your file has at least Name, Phone, or Email columns.',
        parseErrors
      });
    }

    let inserted = 0;
    let skipped = 0;
    const errors = [];

    const stmt = db.prepare(
      `INSERT INTO crm_leads (
        name, email, phone, source, city, state, budget, requirement, status, priority, notes, follow_up_date, assigned_to,
        lead_category, meta_platform, floor_plan_status, plot_size, meta_ad_name, meta_campaign_name, studio_location, package_service, payment_status, token_paid, balance_pending, razorpay_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    // Wrap inserts in a SQLite transaction for fast and safe execution
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => (err ? reject(err) : resolve()));
    });

    try {
      for (const lead of leadsToInsert) {
        if (!lead.name && !lead.phone && !lead.email) {
          skipped++;
          continue;
        }

        try {
          await new Promise((resolve, reject) => {
            stmt.run([
              lead.name || null,
              lead.email || null,
              lead.phone || null,
              lead.source || 'Bulk Upload',
              lead.city || null,
              lead.state || null,
              lead.budget || null,
              lead.requirement || null,
              lead.status || 'Hot Lead',
              lead.priority || 'medium',
              lead.notes || null,
              lead.follow_up_date || null,
              lead.assigned_to || null,
              lead.lead_category || 'meta',
              lead.meta_platform || null,
              lead.floor_plan_status || null,
              lead.plot_size || null,
              lead.meta_ad_name || null,
              lead.meta_campaign_name || null,
              lead.studio_location || null,
              lead.package_service || null,
              lead.payment_status || null,
              lead.token_paid || 0,
              lead.balance_pending || 0,
              lead.razorpay_id || null
            ], function (err) {
              if (err) reject(err);
              else resolve();
            });
          });
          inserted++;
        } catch (e) {
          skipped++;
          errors.push({ lead: lead.name || lead.email || lead.phone, error: e.message });
        }
      }

      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => (err ? reject(err) : resolve()));
      });
    } catch (txErr) {
      await new Promise((resolve) => db.run('ROLLBACK', () => resolve()));
      throw txErr;
    } finally {
      stmt.finalize();
    }

    res.json({
      success: true,
      inserted,
      skipped,
      errors,
      total: leadsToInsert.length,
      message: `Successfully imported ${inserted} lead(s).`
    });
  } catch (err) {
    console.error('[CRM] upload error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

router.post('/api/crm/leads/upload', crmAuth, csvUpload.any(), handleLeadUpload);
router.post('/api/crm/leads/bulk-upload', crmAuth, csvUpload.any(), handleLeadUpload);


// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO NOTES (attached to individual leads)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/crm/leads/:id/audio
router.post('/api/crm/leads/:id/audio', crmAuth, audioUpload.any(), async (req, res) => {
  const db = req.crmDb;
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ message: 'No audio file uploaded.' });
    const lead = await dbGet(db, 'SELECT id, audio_url FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });

    // Remove old audio file if it exists
    if (lead.audio_url) {
      const oldPath = path.join(__dirname, lead.audio_url.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (_) { } }
    }

    const audio_url = `/uploads/crm-audio/${file.filename}`;
    await dbRun(db, 'UPDATE crm_leads SET audio_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [audio_url, req.params.id]);
    res.json({ audio_url, message: 'Audio note attached to lead.' });
  } catch (err) {
    console.error('[CRM] POST audio note error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/leads/:id/audio
router.get('/api/crm/leads/:id/audio', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const lead = await dbGet(db, 'SELECT id, name, audio_url, updated_at FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    const recordings = lead.audio_url ? [{
      id: lead.id,
      lead_id: lead.id,
      lead_name: lead.name,
      url: lead.audio_url,
      name: `Audio Note — ${lead.name || 'Lead #' + lead.id}`,
      created_at: lead.updated_at,
    }] : [];
    res.json({ audio_url: lead.audio_url, recordings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/audio — all audio notes across all leads
router.get('/api/crm/audio', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const rows = await dbAll(
      db,
      'SELECT id, name, phone, email, audio_url, updated_at FROM crm_leads WHERE audio_url IS NOT NULL AND audio_url != "" ORDER BY updated_at DESC'
    );
    const recordings = (rows || []).map(r => ({
      id: r.id,
      lead_id: r.id,
      lead_name: r.name,
      lead_phone: r.phone,
      url: r.audio_url,
      name: `Audio Note — ${r.name || 'Lead #' + r.id}`,
      created_at: r.updated_at,
    }));
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/crm/leads/:id/audio
router.delete('/api/crm/leads/:id/audio', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const lead = await dbGet(db, 'SELECT id, assigned_to, audio_url FROM crm_leads WHERE id = ?', [req.params.id]);
    if (!lead) return res.status(404).json({ message: 'Lead not found.' });
    if (req.user && req.user.role === 'agent' && lead.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Agents cannot delete audio of unassigned leads.' });
    }
    if (lead.audio_url) {
      const filePath = path.join(__dirname, lead.audio_url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) { } }
    }
    await dbRun(db, 'UPDATE crm_leads SET audio_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Audio note removed.' });
  } catch (err) {
    console.error('[CRM] DELETE audio error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/crm/audio/:id
router.delete('/api/crm/audio/:id', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const lead = await dbGet(db, 'SELECT id, assigned_to, audio_url FROM crm_leads WHERE id = ?', [req.params.id]);
    if (lead) {
      if (req.user && req.user.role === 'agent' && lead.assigned_to !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: Agents cannot delete audio of unassigned leads.' });
      }
      if (lead.audio_url) {
        const filePath = path.join(__dirname, lead.audio_url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) { } }
        await dbRun(db, 'UPDATE crm_leads SET audio_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);
      }
    }
    res.json({ success: true, message: 'Audio removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/crm/audio/bulk-delete — delete multiple audio notes (Admin / Manager)
router.post('/api/crm/audio/bulk-delete', crmAuth, requireRole('admin', 'manager'), async (req, res) => {
  const db = req.crmDb;
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'ids array required.' });
    let deleted = 0;
    for (const id of ids) {
      const lead = await dbGet(db, 'SELECT id, audio_url FROM crm_leads WHERE id = ?', [id]);
      if (lead && lead.audio_url) {
        const filePath = path.join(__dirname, lead.audio_url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) { } }
        await dbRun(db, 'UPDATE crm_leads SET audio_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        deleted++;
      }
    }
    res.json({ success: true, deleted, message: `Deleted ${deleted} audio note(s).` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// CALL LOGS (WebRTC browser-based calls)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/crm/calls — log a call
router.post('/api/crm/calls', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const { lead_id, direction, status, duration_seconds, notes } = req.body;
    const result = await dbRun(
      db,
      `INSERT INTO crm_call_logs (lead_id, caller_id, caller_name, direction, status, duration_seconds, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lead_id || null,
        req.user.id,
        req.user.name,
        direction || 'outbound',
        status || 'completed',
        duration_seconds || 0,
        notes || null,
      ]
    );
    res.status(201).json({ id: result.lastID, message: 'Call logged.' });
  } catch (err) {
    console.error('[CRM] POST /api/crm/calls error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/calls — paginated call log
router.get('/api/crm/calls', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;
    const lead_id = req.query.lead_id || '';

    const conditions = [];
    const params = [];

    // Agents only see their own calls
    if (req.user.role === 'agent') {
      conditions.push('c.caller_id = ?');
      params.push(req.user.id);
    }
    if (lead_id) { conditions.push('c.lead_id = ?'); params.push(lead_id); }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const totalRow = await dbGet(db, `SELECT COUNT(*) as total FROM crm_call_logs c ${where}`, params);
    const total = totalRow ? totalRow.total : 0;
    const pages = Math.ceil(total / limit);

    const calls = await dbAll(
      db,
      `SELECT c.*, l.name as lead_name, l.phone as lead_phone, l.email as lead_email
       FROM crm_call_logs c
       LEFT JOIN crm_leads l ON l.id = c.lead_id
       ${where}
       ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    res.json({ calls, total, pages, page, limit });
  } catch (err) {
    console.error('[CRM] GET /api/crm/calls error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/calls/:id — single call
router.get('/api/crm/calls/:id', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const call = await dbGet(
      db,
      `SELECT c.*, l.name as lead_name, l.phone as lead_phone
       FROM crm_call_logs c LEFT JOIN crm_leads l ON l.id = c.lead_id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!call) return res.status(404).json({ message: 'Call not found.' });
    res.json({ call });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/crm/calls/:id/recording — upload WebRTC call recording to VPS disk
router.post('/api/crm/calls/:id/recording', crmAuth, callRecordingUpload.any(), async (req, res) => {
  const db = req.crmDb;
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ message: 'No recording file uploaded.' });

    const call = await dbGet(db, 'SELECT id FROM crm_call_logs WHERE id = ?', [req.params.id]);
    if (!call) return res.status(404).json({ message: 'Call log not found.' });

    const recording_url = `/uploads/crm-calls/${file.filename}`;
    await dbRun(
      db,
      'UPDATE crm_call_logs SET recording_url = ? WHERE id = ?',
      [recording_url, req.params.id]
    );
    res.json({ recording_url, message: 'Call recording saved to VPS.' });
  } catch (err) {
    console.error('[CRM] POST call recording error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/calls/:id/recording
router.get('/api/crm/calls/:id/recording', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const call = await dbGet(db, 'SELECT * FROM crm_call_logs WHERE id = ?', [req.params.id]);
    if (!call) return res.status(404).json({ message: 'Call not found.' });
    res.json({ recording_url: call.recording_url, call });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/crm/calls/:id — update call (e.g. final duration after call ends)
router.put('/api/crm/calls/:id', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const { status, duration_seconds, notes } = req.body;
    await dbRun(
      db,
      `UPDATE crm_call_logs
       SET status           = COALESCE(?, status),
           duration_seconds = COALESCE(?, duration_seconds),
           notes            = COALESCE(?, notes)
       WHERE id = ?`,
      [status || null, duration_seconds != null ? duration_seconds : null, notes || null, req.params.id]
    );
    res.json({ message: 'Call updated.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/crm/calls/:id/recording — delete call audio recording from VPS (Admin / Manager)
router.delete('/api/crm/calls/:id/recording', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const call = await dbGet(db, 'SELECT id, caller_id, recording_url FROM crm_call_logs WHERE id = ?', [req.params.id]);
    if (!call) return res.status(404).json({ message: 'Call log not found.' });

    // Allow admin, manager, or the caller
    if (req.user.role === 'agent' && call.caller_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Agents can only delete their own call recordings.' });
    }

    if (call.recording_url) {
      const filePath = path.join(__dirname, call.recording_url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) { } }
      await dbRun(db, 'UPDATE crm_call_logs SET recording_url = NULL WHERE id = ?', [req.params.id]);
    }
    res.json({ success: true, message: 'Call recording deleted from VPS.' });
  } catch (err) {
    console.error('[CRM] DELETE call recording error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/crm/calls/:id — delete call log record & recording (Admin / Manager)
router.delete('/api/crm/calls/:id', crmAuth, requireRole('admin', 'manager'), async (req, res) => {
  const db = req.crmDb;
  try {
    const call = await dbGet(db, 'SELECT id, recording_url FROM crm_call_logs WHERE id = ?', [req.params.id]);
    if (!call) return res.status(404).json({ message: 'Call log not found.' });

    if (call.recording_url) {
      const filePath = path.join(__dirname, call.recording_url.replace(/^\//, ''));
      if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (_) { } }
    }
    await dbRun(db, 'DELETE FROM crm_call_logs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Call log and audio recording deleted.' });
  } catch (err) {
    console.error('[CRM] DELETE call log error:', err.message);
    res.status(500).json({ message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// WEBRTC SIGNALING (in-memory, polling-based — no external ws dependency)
// For production upgrade, replace with WebSocket-based signaling via `ws` package
// ═══════════════════════════════════════════════════════════════════════════════

const signalingRooms = {};

// POST /api/crm/signal/offer — caller posts SDP offer
router.post('/api/crm/signal/offer', crmAuth, (req, res) => {
  const { room_id, sdp } = req.body;
  if (!room_id || !sdp) return res.status(400).json({ message: 'room_id and sdp required' });
  signalingRooms[room_id] = {
    offer: sdp,
    offer_candidates: [],
    answer: null,
    answer_candidates: [],
    created_at: Date.now(),
  };
  res.json({ message: 'Offer stored', room_id });
});

// GET /api/crm/signal/offer — callee polls for offer
router.get('/api/crm/signal/offer', crmAuth, (req, res) => {
  const { room_id } = req.query;
  const room = signalingRooms[room_id];
  if (!room || !room.offer) return res.json({ offer: null, candidates: [] });
  res.json({ offer: room.offer, candidates: room.offer_candidates || [] });
});

// POST /api/crm/signal/answer — callee posts SDP answer
router.post('/api/crm/signal/answer', crmAuth, (req, res) => {
  const { room_id, sdp } = req.body;
  const room = signalingRooms[room_id];
  if (!room) return res.status(404).json({ message: 'Room not found. Offer not yet posted.' });
  room.answer = sdp;
  room.answer_candidates = [];
  res.json({ message: 'Answer stored' });
});

// GET /api/crm/signal/answer — caller polls for answer
router.get('/api/crm/signal/answer', crmAuth, (req, res) => {
  const { room_id } = req.query;
  const room = signalingRooms[room_id];
  if (!room || !room.answer) return res.json({ answer: null, candidates: [] });
  res.json({ answer: room.answer, candidates: room.answer_candidates || [] });
});

// POST /api/crm/signal/candidate — ICE candidate exchange
router.post('/api/crm/signal/candidate', crmAuth, (req, res) => {
  const { room_id, candidate, side } = req.body; // side: 'offer' | 'answer'
  const room = signalingRooms[room_id];
  if (!room) return res.status(404).json({ message: 'Room not found' });
  const arr = side === 'answer' ? 'answer_candidates' : 'offer_candidates';
  if (!room[arr]) room[arr] = [];
  room[arr].push(candidate);
  res.json({ message: 'ICE candidate added' });
});

// GET /api/crm/signal/candidates — poll for ICE candidates
router.get('/api/crm/signal/candidates', crmAuth, (req, res) => {
  const { room_id, side } = req.query;
  const room = signalingRooms[room_id];
  if (!room) return res.json({ candidates: [] });
  const arr = side === 'answer' ? 'answer_candidates' : 'offer_candidates';
  res.json({ candidates: room[arr] || [] });
});

// Cleanup stale signaling rooms every 30 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(signalingRooms).forEach(id => {
    if (now - (signalingRooms[id].created_at || 0) > 30 * 60 * 1000) {
      delete signalingRooms[id];
    }
  });
}, 30 * 60 * 1000);


// ═══════════════════════════════════════════════════════════════════════════════
// LEAD ACTIVITY LOG
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/crm/leads/:id/activity
router.post('/api/crm/leads/:id/activity', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const { action, note, user_id } = req.body;
    if (!action) return res.status(400).json({ message: 'action is required.' });
    const result = await dbRun(
      db,
      `INSERT INTO crm_lead_activities (lead_id, user_id, action, note) VALUES (?, ?, ?, ?)`,
      [req.params.id, user_id || req.user.id || null, action, note || null]
    );
    res.status(201).json({ id: result.lastID, message: 'Activity logged.' });
  } catch (err) {
    console.error('[CRM] POST activity error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/crm/leads/:id/activities
router.get('/api/crm/leads/:id/activities', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const activities = await dbAll(
      db,
      `SELECT a.*, u.name as user_name, u.avatar_color
       FROM crm_lead_activities a
       LEFT JOIN crm_users u ON u.id = a.user_id
       WHERE a.lead_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    res.json({ activities });
  } catch (err) {
    console.error('[CRM] GET activities error:', err.message);
    res.status(500).json({ message: err.message });
  }
});


// ═══════════════════════════════════════════════════════════════════════════════
// CRM STATS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/crm/stats — Dashboard telemetry with date & category filter
router.get('/api/crm/stats', crmAuth, async (req, res) => {
  const db = req.crmDb;
  try {
    const { start_date, end_date } = req.query;
    let lead_category = req.query.lead_category || '';

    if (req.user.role === 'marketing' || (req.user.department && req.user.department.toLowerCase() === 'marketing')) {
      lead_category = 'meta';
    }

    const conditions = [];
    const params = [];

    if (lead_category) {
      conditions.push('lead_category = ?');
      params.push(lead_category);
    }
    if (start_date) {
      conditions.push('date(created_at) >= date(?)');
      params.push(start_date);
    }
    if (end_date) {
      conditions.push('date(created_at) <= date(?)');
      params.push(end_date);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const platformWhere = conditions.length
      ? `WHERE ${conditions.join(' AND ')} AND meta_platform IS NOT NULL`
      : 'WHERE meta_platform IS NOT NULL';

    const [
      totalRow,
      statusRows,
      categoryRows,
      platformRows,
      totalCallsRow,
      activeUsersRow
    ] = await Promise.all([
      dbGet(db, `SELECT COUNT(*) as c FROM crm_leads ${where}`, params),
      dbAll(db, `SELECT status, COUNT(*) as c FROM crm_leads ${where} GROUP BY status`, params),
      dbAll(db, `SELECT lead_category, COUNT(*) as c FROM crm_leads ${where} GROUP BY lead_category`, params),
      dbAll(db, `SELECT meta_platform, COUNT(*) as c FROM crm_leads ${platformWhere} GROUP BY meta_platform`, params),
      dbGet(db, `SELECT COUNT(*) as c FROM crm_call_logs`),
      dbGet(db, `SELECT COUNT(*) as c FROM crm_users WHERE is_active = 1`)
    ]);

    const statusCounts = {};
    for (const r of statusRows) {
      if (r.status) statusCounts[r.status] = r.c;
    }

    const categories = { meta: 0, website: 0 };
    for (const r of categoryRows) {
      if (r.lead_category) categories[r.lead_category] = r.c;
    }

    const platforms = { fb: 0, ig: 0 };
    for (const r of platformRows) {
      if (r.meta_platform) platforms[r.meta_platform] = r.c;
    }

    res.json({
      total_leads: totalRow ? totalRow.c : 0,
      statusCounts,
      categories,
      platforms,
      total_calls: totalCallsRow ? totalCallsRow.c : 0,
      total_users: activeUsersRow ? activeUsersRow.c : 0,
      // Backward compatibility shortcuts
      new: statusCounts['Hot Lead'] || statusCounts['new'] || 0,
      contacted: statusCounts['Details Shared'] || statusCounts['contacted'] || 0,
      qualified: statusCounts['Interested'] || statusCounts['qualified'] || 0,
      converted: statusCounts['Converted'] || 0,
      lost: statusCounts['Non Relevant'] || statusCounts['lost'] || 0
    });
  } catch (err) {
    console.error('[CRM] GET /api/crm/stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});


// ─── Init helper (sets module-level _db reference) ───────────────────────────
function initCrmDbAndSetRef(db) {
  _db = db;
  initCrmDb(db);
}

module.exports = { router, initCrmDb: initCrmDbAndSetRef };
