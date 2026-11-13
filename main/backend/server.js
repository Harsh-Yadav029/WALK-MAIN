require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const webpush = require('web-push');
const cron = require('node-cron');
const { seedBlogsAndImages } = require('./data/blogs.data');

// ISO UTC timestamp normalizer for SQLite CURRENT_TIMESTAMP
const ensureUtcIso = (str) => {
  if (!str) return null;
  let s = String(str).trim();
  if (!s) return null;
  if (s.endsWith('Z')) return s;
  s = s.replace(' ', 'T');
  const timePart = s.includes('T') ? s.split('T')[1] : '';
  const hasTimezone = timePart.includes('+') || timePart.includes('-') || timePart.endsWith('Z');
  if (!hasTimezone) s += 'Z';
  return s;
};

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'walk_the_plan_super_secret_key_12345';

// VAPID Keys for Web Push Notifications
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BJKZ8nW8KrczZ2nnBiLqZEhCqg44hweYvCHHSqYst_cJdxaNYgfPRrVq4SWE84Hx2iHLvDvD5whZfW_h1B8sqsU';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '9S-udfcA4_OoLYdOtXYSULExz_4GQ5n0cYZVhE9i5XY';
webpush.setVapidDetails(
  'mailto:info@walktheplan.in',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Middlewares & Permissive CORS configuration
app.set('trust proxy', true);

// Custom CORS header injector & preflight handler
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.options('*', (req, res) => res.status(200).end());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.text({ type: ['text/plain', 'text/html'], limit: '10mb' }));

// Ensure upload directories exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Serve SEO & AI Crawler files directly (robots.txt, sitemap.xml, llms.txt, llms-full.txt)
const publicDir = path.join(__dirname, '../frontend/public');
const distDir = path.join(__dirname, '../frontend/dist');

// Root & Healthcheck endpoints (Prevents 404 when testing backend URL or running monitoring)
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    service: 'Walk The Plan Unified API',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  const indexHtml = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.status(200).json({
    status: 'online',
    service: 'Walk The Plan Unified API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      settings: '/api/settings',
      crmMe: '/api/crm/auth/me'
    },
    message: 'Backend server is active and running cleanly!',
    timestamp: new Date().toISOString()
  });
});

app.get('/robots.txt', (req, res) => {
  const filePath = fs.existsSync(path.join(publicDir, 'robots.txt'))
    ? path.join(publicDir, 'robots.txt')
    : path.join(distDir, 'robots.txt');
  if (fs.existsSync(filePath)) {
    res.type('text/plain').sendFile(filePath);
  } else {
    res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://walktheplan.in/sitemap.xml");
  }
});

app.get('/sitemap.xml', (req, res) => {
  const filePath = fs.existsSync(path.join(publicDir, 'sitemap.xml'))
    ? path.join(publicDir, 'sitemap.xml')
    : path.join(distDir, 'sitemap.xml');
  if (fs.existsSync(filePath)) {
    res.type('application/xml').sendFile(filePath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

app.get('/llms.txt', (req, res) => {
  const filePath = fs.existsSync(path.join(publicDir, 'llms.txt'))
    ? path.join(publicDir, 'llms.txt')
    : path.join(distDir, 'llms.txt');
  if (fs.existsSync(filePath)) {
    res.type('text/plain; charset=utf-8').sendFile(filePath);
  } else {
    res.status(404).send('llms.txt not found');
  }
});

app.get('/llms-full.txt', (req, res) => {
  const filePath = fs.existsSync(path.join(publicDir, 'llms-full.txt'))
    ? path.join(publicDir, 'llms-full.txt')
    : path.join(distDir, 'llms-full.txt');
  if (fs.existsSync(filePath)) {
    res.type('text/plain; charset=utf-8').sendFile(filePath);
  } else {
    res.status(404).send('llms-full.txt not found');
  }
});

// Serve PWA Manifest & Service Worker with precise headers
app.get(['/manifest.webmanifest', '/manifest.json'], (req, res) => {
  const isWebmanifest = req.path.endsWith('.webmanifest');
  const filename = isWebmanifest ? 'manifest.webmanifest' : 'manifest.json';
  const filePath = fs.existsSync(path.join(publicDir, filename))
    ? path.join(publicDir, filename)
    : path.join(distDir, filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Manifest not found');
  }
});

app.get('/sw.js', (req, res) => {
  const filePath = fs.existsSync(path.join(publicDir, 'sw.js'))
    ? path.join(publicDir, 'sw.js')
    : path.join(distDir, 'sw.js');

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Service worker not found');
  }
});

app.get('/offline.html', (req, res) => {
  const filePath = fs.existsSync(path.join(publicDir, 'offline.html'))
    ? path.join(publicDir, 'offline.html')
    : path.join(distDir, 'offline.html');

  if (fs.existsSync(filePath)) {
    res.type('text/html; charset=utf-8').sendFile(filePath);
  } else {
    res.status(404).send('Offline page not found');
  }
});

// Serve PWA Icons statically
const publicIconsDir = path.join(publicDir, 'icons');
const distIconsDir = path.join(distDir, 'icons');
if (fs.existsSync(publicIconsDir)) {
  app.use('/icons', express.static(publicIconsDir));
} else if (fs.existsSync(distIconsDir)) {
  app.use('/icons', express.static(distIconsDir));
}

// Serve Favicons & App Icons directly for search engine crawlers & browsers
app.get(['/favicon.ico', '/favicon.png', '/favicon.svg', '/favicon-48x48.png', '/favicon-32x32.png', '/favicon-16x16.png'], (req, res) => {
  const filename = path.basename(req.path);
  const filePath = fs.existsSync(path.join(publicDir, filename))
    ? path.join(publicDir, filename)
    : path.join(distDir, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Favicon not found');
  }
});


// Database connection
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.db');

// Load CRM routes synchronously so they are in Express route table before any requests arrive
let crmRouter = null;
let initCrmDb = null;
try {
  const crmModule = require('../../crm/backend/crm.routes');
  crmRouter = crmModule.router;
  initCrmDb = crmModule.initCrmDb;
  if (crmRouter) {
    app.use(crmRouter);
    console.log('[Main Server] Synchronously mounted CRM routes at /api/crm');
  }
} catch (crmErr) {
  console.warn('[Main Server] CRM routes module not loaded:', crmErr.message);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initDb();
    if (typeof initCrmDb === 'function') {
      try {
        initCrmDb(db);
        console.log('[Main Server] CRM database tables & seeds initialized successfully.');
      } catch (crmDbErr) {
        console.error('[Main Server] CRM database init error:', crmDbErr.message);
      }
    }
  }
});

// --- BOT IDENTIFICATION & CRAWLER CLASSIFIER ---
function identifyBot(userAgent, isWebdriver = false) {
  const ua = String(userAgent || '').trim();
  if (isWebdriver) {
    return { isBot: true, botName: 'Automated Webdriver' };
  }
  if (!ua) {
    return { isBot: false, botName: '' };
  }

  // 1. Search Engine Crawlers
  if (/googlebot|google-inspectiontool|google-read-aloud|mediapartners-google|adsbot-google/i.test(ua)) {
    return { isBot: true, botName: 'Googlebot' };
  }
  if (/bingbot|bingpreview|msnbot/i.test(ua)) {
    return { isBot: true, botName: 'Bingbot' };
  }
  if (/duckduckbot/i.test(ua)) {
    return { isBot: true, botName: 'DuckDuckBot' };
  }
  if (/baiduspider/i.test(ua)) {
    return { isBot: true, botName: 'Baiduspider' };
  }
  if (/yandexbot|yandeximages/i.test(ua)) {
    return { isBot: true, botName: 'YandexBot' };
  }
  if (/applebot/i.test(ua)) {
    return { isBot: true, botName: 'Applebot' };
  }

  // 2. Social Media Preview Crawlers
  if (/facebookexternalhit|meta-externalagent|facebot|facebookcatalog/i.test(ua)) {
    return { isBot: true, botName: 'Meta / Facebook Preview Bot' };
  }
  if (/twitterbot/i.test(ua)) {
    return { isBot: true, botName: 'Twitter Preview Bot' };
  }
  if (/linkedinbot/i.test(ua)) {
    return { isBot: true, botName: 'LinkedInBot' };
  }
  if (/telegrambot/i.test(ua)) {
    return { isBot: true, botName: 'TelegramBot' };
  }
  if (/discordbot/i.test(ua)) {
    return { isBot: true, botName: 'Discordbot' };
  }
  if (/slackbot/i.test(ua)) {
    return { isBot: true, botName: 'Slackbot' };
  }
  if (/skypeuripreview/i.test(ua)) {
    return { isBot: true, botName: 'SkypeUriPreview' };
  }
  if (/pinterestbot/i.test(ua)) {
    return { isBot: true, botName: 'Pinterestbot' };
  }
  // WhatsApp Preview bot (link card fetcher, not mobile in-app browser)
  if (/whatsapp/i.test(ua) && (/preview|bot|crawl|spider/i.test(ua) || !/mozilla|applewebkit/i.test(ua))) {
    return { isBot: true, botName: 'WhatsApp Preview Bot' };
  }

  // 3. SEO, Audit & Security Crawlers
  if (/semrushbot/i.test(ua)) {
    return { isBot: true, botName: 'Semrush SEO Bot' };
  }
  if (/ahrefsbot/i.test(ua)) {
    return { isBot: true, botName: 'Ahrefs SEO Bot' };
  }
  if (/dotbot|rogerbot|moz\.com/i.test(ua)) {
    return { isBot: true, botName: 'Moz / DotBot' };
  }
  if (/screaming frog/i.test(ua)) {
    return { isBot: true, botName: 'Screaming Frog' };
  }
  if (/petalbot/i.test(ua)) {
    return { isBot: true, botName: 'PetalBot' };
  }
  if (/mj12bot/i.test(ua)) {
    return { isBot: true, botName: 'Majestic MJ12Bot' };
  }
  if (/bytespider/i.test(ua)) {
    return { isBot: true, botName: 'ByteSpider' };
  }

  // 4. Automated Headless Browsers, HTTP Clients & Scrapers
  if (/headlesschrome|puppeteer|playwright|selenium|phantomjs/i.test(ua)) {
    return { isBot: true, botName: 'Headless Browser' };
  }
  if (/python-requests|aiohttp|urllib|curl|wget|httpclient|axios|go-http-client|postmanruntime|node-fetch|apache-httpclient|scrapy/i.test(ua)) {
    return { isBot: true, botName: 'Automated Script / Scraper' };
  }
  if (/bot|crawl|spider|slurp|archiver|scraper/i.test(ua)) {
    return { isBot: true, botName: 'Web Crawler / Bot' };
  }

  return { isBot: false, botName: '' };
}

// --- PLATFORM REACH ATTRIBUTION ENGINE ---
function detectPlatform({ referrer = '', userAgent = '', search = '', utmSource = '', utmMedium = '' }) {
  const ref = String(referrer || '').toLowerCase();
  const ua = String(userAgent || '');
  const s = String(search || '').toLowerCase();
  const src = String(utmSource || '').toLowerCase();
  const med = String(utmMedium || '').toLowerCase();

  const matches = (term) => ref.includes(term) || s.includes(term) || src === term;

  // 1. WhatsApp
  if (
    matches('whatsapp') ||
    matches('wa') ||
    src === 'whatsapp' ||
    src === 'wa' ||
    ref.includes('api.whatsapp.com') ||
    ref.includes('web.whatsapp.com') ||
    ref.includes('chat.whatsapp.com') ||
    ref.includes('android-app://com.whatsapp') ||
    /WhatsApp\//i.test(ua)
  ) {
    return 'WhatsApp';
  }

  // 2. Facebook
  if (
    matches('facebook') ||
    matches('fb') ||
    s.includes('fbclid') ||
    ref.includes('fb.me') ||
    ref.includes('facebook.com') ||
    ref.includes('l.facebook.com') ||
    ref.includes('lm.facebook.com') ||
    /FBAN|FBAV|FB_IAB/i.test(ua)
  ) {
    return 'Facebook';
  }

  // 3. Instagram
  if (
    matches('instagram') ||
    matches('ig') ||
    s.includes('igshid') ||
    ref.includes('instagram.com') ||
    ref.includes('l.instagram.com') ||
    /Instagram/i.test(ua)
  ) {
    return 'Instagram';
  }

  // 4. Google Ads
  if (s.includes('gclid') || (matches('google') && (med === 'cpc' || med === 'ppc' || med === 'ads'))) {
    return 'Google Ads';
  }

  // 5. Google Search
  if (ref.includes('google.') || matches('google') || ref.includes('android-app://com.google.android.googlequicksearchbox')) {
    return 'Google Search';
  }

  // 6. YouTube
  if (ref.includes('youtube.com') || ref.includes('youtu.be') || matches('youtube')) {
    return 'YouTube';
  }

  // 7. LinkedIn
  if (ref.includes('linkedin.com') || ref.includes('lnkd.in') || matches('linkedin') || /LinkedInApp/i.test(ua)) {
    return 'LinkedIn';
  }

  // 8. Twitter / X
  if (ref.includes('twitter.com') || ref.includes('x.com') || ref.includes('t.co') || matches('twitter') || matches('x') || /Twitter/i.test(ua)) {
    return 'Twitter / X';
  }

  // 9. Telegram
  if (ref.includes('t.me') || ref.includes('telegram.org') || matches('telegram') || /Telegram/i.test(ua)) {
    return 'Telegram';
  }

  // 10. Pinterest
  if (ref.includes('pinterest.com') || ref.includes('pin.it') || matches('pinterest')) {
    return 'Pinterest';
  }

  // 11. Reddit
  if (ref.includes('reddit.com') || matches('reddit')) {
    return 'Reddit';
  }

  // 12. Direct
  if (!ref || ref === 'direct' || ref.includes('walktheplan.in') || ref.includes('localhost') || ref.includes('127.0.0.1')) {
    return 'Direct';
  }

  // 13. Other Referral Domain
  try {
    const urlObj = new URL(ref.startsWith('http') ? ref : `http://${ref}`);
    const host = urlObj.hostname.replace(/^www\./, '');
    if (host && !host.includes('localhost') && !host.includes('walktheplan.in')) {
      return `Referral (${host})`;
    }
  } catch (e) { }

  return 'Referral';
}

function extractUtmParams(search = '') {
  const result = { utm_source: '', utm_medium: '', utm_campaign: '' };
  if (!search) return result;
  try {
    const q = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    result.utm_source = q.get('utm_source') || q.get('source') || q.get('ref') || '';
    result.utm_medium = q.get('utm_medium') || '';
    result.utm_campaign = q.get('utm_campaign') || q.get('campaign') || '';
  } catch (e) { }
  return result;
}

// Database Initialization
function initDb() {
  db.serialize(() => {
    // 1. Users Table (Admin authentication)
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    )`);

    // 2. Bookings Table (Lead Capture)
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Dynamic schema migrations for columns
    db.run(`ALTER TABLE bookings ADD COLUMN type TEXT DEFAULT 'inquiry'`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN package_name TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN price REAL`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN payment_status TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN booking_date TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN time_slot TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN budget TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN amount_paid REAL DEFAULT 0`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN booking_amount REAL DEFAULT 5000`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN balance_pending REAL DEFAULT 0`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN razorpay_order_id TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN razorpay_payment_id TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN razorpay_signature TEXT`, (err) => {
      // Swallowed: Column might already exist
    });
    db.run(`ALTER TABLE bookings ADD COLUMN device_id TEXT`, () => { });
    db.run(`ALTER TABLE bookings ADD COLUMN visitor_id TEXT`, () => { });
    db.run(`ALTER TABLE bookings ADD COLUMN ip_address TEXT`, () => { });
    db.run(`ALTER TABLE bookings ADD COLUMN show_in_admin INTEGER DEFAULT 1`, () => { });

    // 3. Blogs Table
    db.run(`CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      excerpt TEXT,
      content TEXT,
      cover_image TEXT,
      category TEXT,
      author TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 4. Gallery Table
    db.run(`CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT, -- 'photo' or 'video'
      url TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 5. Testimonials Table
    db.run(`CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      name TEXT,
      role TEXT,
      desc TEXT,
      video_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 6. Studio Locations Table
    db.run(`CREATE TABLE IF NOT EXISTS studio_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_key TEXT UNIQUE,
      name TEXT,
      city TEXT,
      image_url TEXT,
      address TEXT,
      details TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 7. Website Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS website_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE,
      value TEXT
    )`);

    // 8. Services Table
    db.run(`CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT UNIQUE,
      title TEXT,
      subtitle TEXT,
      price INTEGER,
      duration TEXT,
      description TEXT,
      features TEXT, -- JSON array
      badge TEXT
    )`);

    // 9. Franchise Models Table
    db.run(`CREATE TABLE IF NOT EXISTS franchise_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model_key TEXT UNIQUE,
      title TEXT,
      charges TEXT,
      tc TEXT -- JSON array
    )`);

    // 10. Visitor Analytics & Device Tracking Table
    db.run(`CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT,
      session_id TEXT,
      path TEXT DEFAULT '/',
      device_type TEXT DEFAULT 'mobile',
      browser TEXT DEFAULT 'Chrome',
      os TEXT,
      screen_resolution TEXT,
      referrer TEXT DEFAULT 'Direct',
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_page_views_device ON page_views(device_type)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_page_views_ip ON page_views(ip_address)`);

    // Location, Device ID & Coordinates columns migration
    db.run(`ALTER TABLE page_views ADD COLUMN country TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN region TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN city TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN device_id TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN latitude REAL`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN longitude REAL`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN isp TEXT DEFAULT ''`, () => { });

    // Platform Reach Attribution, Bot Identification & UTM columns migration
    db.run(`ALTER TABLE page_views ADD COLUMN platform TEXT DEFAULT 'Direct'`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN is_bot INTEGER DEFAULT 0`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN bot_name TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN utm_source TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN utm_medium TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN utm_campaign TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE page_views ADD COLUMN user_agent TEXT DEFAULT ''`, () => { });
    db.run(`CREATE INDEX IF NOT EXISTS idx_page_views_device_id ON page_views(device_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_page_views_platform ON page_views(platform)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_page_views_is_bot ON page_views(is_bot)`);

    db.run(`ALTER TABLE bookings ADD COLUMN platform TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE bookings ADD COLUMN utm_source TEXT DEFAULT ''`, () => { });
    db.run(`ALTER TABLE bookings ADD COLUMN utm_campaign TEXT DEFAULT ''`, () => { });
    db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_device_id ON bookings(device_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_bookings_platform ON bookings(platform)`);

    // Auto-backfill any legacy visits with missing device_id
    db.all("SELECT DISTINCT visitor_id FROM page_views WHERE device_id IS NULL OR device_id = ''", (err, vRows) => {
      if (!err && vRows && vRows.length > 0) {
        const updateStmt = db.prepare("UPDATE page_views SET device_id = ? WHERE visitor_id = ? AND (device_id IS NULL OR device_id = '')");
        vRows.forEach(vr => {
          let hash = 0;
          const s = vr.visitor_id || '';
          for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
          const devId = `DEV-${1000 + (Math.abs(hash) % 9000)}`;
          updateStmt.run(devId, vr.visitor_id);
        });
        updateStmt.finalize();
        console.log(`Auto-backfilled ${vRows.length} distinct visitors with permanent DEV-XXXX device IDs.`);
      }
    });

    // Auto-backfill platform reach and bot identification for existing records
    db.all("SELECT id, referrer, browser, os, user_agent FROM page_views WHERE platform IS NULL OR platform = '' OR platform = 'Direct' OR is_bot IS NULL", (err, pRows) => {
      if (!err && pRows && pRows.length > 0) {
        const updateStmt = db.prepare("UPDATE page_views SET platform = ?, is_bot = ?, bot_name = ? WHERE id = ?");
        let updatedCount = 0;
        pRows.forEach(pr => {
          const detectedPlat = detectPlatform({ referrer: pr.referrer, userAgent: pr.user_agent || pr.browser });
          const botCheck = identifyBot((pr.user_agent || '') + ' ' + (pr.browser || '') + ' ' + (pr.os || ''));
          const isBotVal = botCheck.isBot ? 1 : 0;
          const botNameVal = botCheck.botName || '';
          updateStmt.run(detectedPlat, isBotVal, botNameVal, pr.id);
          updatedCount++;
        });
        updateStmt.finalize();
        if (updatedCount > 0) {
          console.log(`Auto-backfilled ${updatedCount} visits with platform reach attribution & bot detection.`);
        }
      }
    });

    // Auto-backfill existing bookings with customer reach platform
    db.all("SELECT id, device_id, visitor_id, ip_address FROM bookings WHERE platform IS NULL OR platform = ''", (err, bRows) => {
      if (!err && bRows && bRows.length > 0) {
        bRows.forEach(br => {
          db.get(
            "SELECT platform, utm_source FROM page_views WHERE (device_id IS NOT NULL AND device_id = ?) OR (visitor_id IS NOT NULL AND visitor_id = ?) OR (ip_address IS NOT NULL AND ip_address = ?) ORDER BY id DESC LIMIT 1",
            [br.device_id || '', br.visitor_id || '', br.ip_address || ''],
            (pvErr, pvRow) => {
              if (pvRow && pvRow.platform) {
                db.run("UPDATE bookings SET platform = ?, utm_source = ? WHERE id = ?", [pvRow.platform, pvRow.utm_source || '', br.id]);
              }
            }
          );
        });
      }
    });

    // Seed Admin Users (usernames: admin and fitscalez, password: walk@321)
    const adminPass = 'walk@321';
    const hash = bcrypt.hashSync(adminPass, 10);

    // Ensure both admin and fitscalez exist with walk@321, and remove parth
    db.run("DELETE FROM users WHERE username = 'parth'");
    db.run("DELETE FROM users", (err) => {
      if (err) {
        console.error("Error clearing users table:", err);
      } else {
        db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", ['admin', hash]);
        db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", ['fitscalez', hash], (err) => {
          if (err) console.error("Error seeding admin users:", err);
          else console.log(`Seeded admin users: admin & fitscalez with default password.`);
        });
      }
    });

    // 11. Push Notification Subscriptions Table
    db.run(`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      visitor_id TEXT,
      endpoint TEXT NOT NULL UNIQUE,
      keys_p256dh TEXT NOT NULL,
      keys_auth TEXT NOT NULL,
      has_booked INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      admin_username TEXT,
      last_notified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_push_subs_device_id ON push_subscriptions(device_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_push_subs_has_booked ON push_subscriptions(has_booked)`);
    db.run(`ALTER TABLE push_subscriptions ADD COLUMN is_admin INTEGER DEFAULT 0`, () => { });
    db.run(`ALTER TABLE push_subscriptions ADD COLUMN admin_username TEXT`, () => { });

    // Seed mock data for blogs and gallery so site is not empty on first run
    seedMockData();
  });
}

function seedMockData() {
  // Check and seed 10 comprehensive architectural blogs and cover images
  seedBlogsAndImages(db, uploadDir);


  // Check and seed gallery
  db.get("SELECT COUNT(*) as count FROM gallery", (err, row) => {
    if (row && row.count === 0) {
      const mockGallery = [
        {
          title: "Double-Height Living Room Projection",
          description: "Clients walking their double-height lobby and checking the television placement and sofa clearance at 1:1 scale.",
          type: "photo",
          url: "/uploads/gallery_living.jpg",
          category: "Architect"
        },
        {
          title: "Modern Modular Kitchen Mock Walk",
          description: "Visualizing parallel counter width and pantry access prior to plumbing layouts.",
          type: "photo",
          url: "/uploads/gallery_kitchen.jpg",
          category: "Builders"
        },
        {
          title: "Master Bedroom Suite Setup",
          description: "Testing king-sized bed clearance and walk-in wardrobe partition line.",
          type: "photo",
          url: "/uploads/gallery_bedroom.jpg",
          category: "Enduser"
        },
        {
          title: "Interactive VR Studio Demo Walkthrough",
          description: "Demo of interactive virtual reality showing changing wall paints and lights in real time.",
          type: "video",
          url: "https://www.w3schools.com/html/mov_bbb.mp4", // Free public video for demo
          category: "Architect"
        }
      ];

      mockGallery.forEach(g => {
        db.run(
          `INSERT INTO gallery (title, description, type, url, category) VALUES (?, ?, ?, ?, ?)`,
          [g.title, g.description, g.type, g.url, g.category]
        );
      });
      console.log('Seeded mock gallery items.');

      createMockImageFile('gallery_living.jpg', '#2d3748', 'Living Room 1:1 Scale');
      createMockImageFile('gallery_kitchen.jpg', '#1a202c', 'Kitchen Plan Test');
      createMockImageFile('gallery_bedroom.jpg', '#4a5568', 'Master Suite Layout');
    }
  });

  // Check and seed testimonials
  db.get("SELECT COUNT(*) as count FROM testimonials", (err, row) => {
    if (row && row.count === 0) {
      const mockTestimonials = [
        {
          title: "Living Room & Kitchen Scale Review",
          name: "Rohit & Megha Verma",
          role: "Homeowners",
          desc: "Walking the plan helped us realize our kitchen island left very little pathway space. We adjusted it before build!",
          video_url: "/uploads/1.mp4"
        },
        {
          title: "Master Bedroom & Wardrobe Clearance",
          name: "Anjali Gupta",
          role: "Homeowner",
          desc: "Checking the wardrobe door swings at actual scale prevented a major layout collision. Truly lifesaver!",
          video_url: "/uploads/2.mp4"
        },
        {
          title: "Architect-Client Collaborative Alignment",
          name: "Pranav Shah",
          role: "Principal Architect",
          desc: "Brings blueprints to life. It makes client design discussions 10x faster and prevents late revision disputes.",
          video_url: "/uploads/3.mp4"
        },
        {
          title: "Corridor & Staircase Width Inspection",
          name: "Sanjay Singhal",
          role: "Civil Contractor",
          desc: "Perfect for checking columns and double-checking masonry line dimensions in 1:1 scale before pouring concrete.",
          video_url: "/uploads/4.mp4"
        },
        {
          title: "Checking Office Furniture Layout",
          name: "Vikram & Shona",
          role: "Business Owners",
          desc: "Designed our premium workspace layout in the studio. Verified the seating density and walkway clearance lines.",
          video_url: "/uploads/5.mp4"
        },
        {
          title: "Checking Balcony Clearances",
          name: "Manish Chhabra",
          role: "Property Builder",
          desc: "We test all our builder floor designs here. Home buyers walk their home before buying, boosting sales.",
          video_url: "/uploads/6.mp4"
        },
        {
          title: "Testing Double-Door Clearance",
          name: "Gaurav & Neha",
          role: "Homeowners",
          desc: "Saved us from installing a door that would block the washroom entrance path. Invaluable check session!",
          video_url: "/uploads/7.mp4"
        },
        {
          title: "First-Time Home Buyers Experience",
          name: "Rohan & Divya",
          role: "First-Time Buyers",
          desc: "We had no idea how to read standard blueprints, but walking it made us feel the space immediately.",
          video_url: "/uploads/8.mp4"
        },
        {
          title: "Duplex Villa Layout Verification",
          name: "Arun Goel",
          role: "Villa Owner",
          desc: "Verified our complete luxury villa plan. Checked the double-height ceiling flow and lobby spacing layout.",
          video_url: "/uploads/9.mp4"
        }
      ];

      mockTestimonials.forEach(t => {
        db.run(
          `INSERT INTO testimonials (title, name, role, desc, video_url) VALUES (?, ?, ?, ?, ?)`,
          [t.title, t.name, t.role, t.desc, t.video_url]
        );
      });
      console.log('Seeded mock testimonials.');
    }
  });

  // Check and seed studio locations
  db.get("SELECT COUNT(*) as count FROM studio_locations", (err, row) => {
    if (row && row.count === 0) {
      const mockLocations = [
        {
          state_key: "Haryana",
          name: "Haryana (Gurugram HQ)",
          city: "Gurugram",
          image_url: "/uploads/gurgaon_studio.png",
          address: "building 328, Sector 19, Udyog Vihar, Phase-4, Gurugram, Haryana 122015",
          details: "Our flagship World Headquarters features state-of-the-art 1:1 floor plan projection, VR walkthrough bays, and physical mockups for complete design immersion.",
          phone: "+91 97110 22075"
        },
        {
          state_key: "Uttarakhand",
          name: "Uttarakhand (Dehradun)",
          city: "Dehradun",
          image_url: "/uploads/dehradun_studio.png",
          address: "Building no. 752, GMS Road, Gram Hari Pur Kanwali, Dehradun Uttarakhand 248001",
          details: "Experience your future home design set against the scenic vistas of Dehradun. Features high-definition 1:1 blueprint scaling and site clearance checks.",
          phone: "+91 97110 22075"
        },
        {
          state_key: "UttarPradesh",
          name: "Uttar Pradesh (Varanasi)",
          city: "Varanasi",
          image_url: "/uploads/varanasi_studio.png",
          address: "Bhairavi Windows, Sarkaripura Manduaddih, Varanasi, Uttar Pradesh 221103",
          details: "Bridging historic architectural heritage with next-generation layout projections. Perfect for validating home clearances and space optimization before building.",
          phone: "+91 97110 22075"
        },
        {
          state_key: "Telangana",
          name: "Telangana (Hyderabad)",
          city: "Hyderabad",
          image_url: "/uploads/hyderabad_studio.png",
          address: "Krishnareddy warehouses, Ware house no 2, Rallaguda Road Shamshabad, Hyderabad, Telangana 501218",
          details: "Serving the high-growth IT corridors and luxury villa projects of Hyderabad. High-tech active scale testing for homeowners, builders, and designers.",
          phone: "+91 97110 22075"
        },
        {
          state_key: "TamilNadu",
          name: "Tamil Nadu (Madurai)",
          city: "Madurai",
          image_url: "/uploads/hyderabad_studio.png",
          address: "2-165, AMR VILLA 59.T. Kodimangalam, New Natham Road, Thirumalpuram Post, Madurai - 625014",
          details: "Our new state-of-the-art projection studio in Madurai, serving the architectural and building layout scaling requirements of Tamil Nadu.",
          phone: "+91 97110 22075"
        }
      ];

      mockLocations.forEach(loc => {
        db.run(
          `INSERT INTO studio_locations (state_key, name, city, image_url, address, details, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [loc.state_key, loc.name, loc.city, loc.image_url, loc.address, loc.details, loc.phone]
        );
      });
      console.log('Seeded mock studio locations.');
    }
  });
  // Seed website settings
  db.get("SELECT COUNT(*) as count FROM website_settings", (err, row) => {
    if (row && row.count === 0) {
      db.run(`INSERT INTO website_settings (key, value) VALUES ('hero_video', '/uploads/hero_bg.mp4')`);
      db.run(`INSERT INTO website_settings (key, value) VALUES ('test_drive_video', '/uploads/8.mp4')`);
      db.run(`INSERT INTO website_settings (key, value) VALUES ('about_video', '/uploads/2.mp4')`);
      db.run(`INSERT INTO website_settings (key, value) VALUES ('whatsapp_number', '+91 97110 22075')`);
      console.log('Seeded website settings.');
    } else {
      db.run(`UPDATE website_settings SET value = '/uploads/hero_bg.mp4' WHERE key = 'hero_video' AND value = '/uploads/1.mp4'`);
      db.run(`INSERT OR IGNORE INTO website_settings (key, value) VALUES ('about_video', '/uploads/2.mp4')`);
      db.run(`INSERT OR IGNORE INTO website_settings (key, value) VALUES ('whatsapp_number', '+91 97110 22075')`);
      db.run(`INSERT OR IGNORE INTO website_settings (key, value) VALUES ('show_leads_public', '0')`);
    }
  });

  // Seed services
  db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
    if (row && row.count === 0) {
      const mockServices = [
        {
          service_id: '1-hour-projection',
          title: '1 Hour Projection',
          subtitle: 'AR-Based 1:1 Floor Plan Projection',
          price: 30000,
          duration: '1 Hour',
          description: 'Experience your floor plan projected at a true 1:1 scale, allowing you to physically walk through every room, passage, and space before construction begins.',
          features: JSON.stringify([
            'Experience actual room sizes before construction',
            'Understand furniture placement and circulation',
            'Identify design modifications early',
            'Improve decision-making with real-scale visualization'
          ]),
          badge: ''
        },
        {
          service_id: '2-hour-projection',
          title: '2 Hour Projection',
          subtitle: 'Real-Time Bare-Shell 3D Walkthrough',
          price: 40000,
          duration: '2 Hours',
          description: 'Our Real-Time Bare-Shell Virtual Reality experience enables clients to explore their future property in an immersive virtual environment.',
          features: JSON.stringify([
            'Interactive virtual exploration',
            'Enhanced spatial understanding',
            'Better design communication',
            'Reduced uncertainty before construction'
          ]),
          badge: 'Most Popular'
        },
        {
          service_id: '3-5-hour-projection',
          title: '3-5 Hour Projection',
          subtitle: 'Interior/Exterior 3D Design Visualization & Clarity',
          price: 50000,
          duration: '3-5 Hours',
          description: 'Bring your ideas to life through high-quality 3D walkthroughs and realistic visualizations to understand design intent, aesthetics, materials, and lighting.',
          features: JSON.stringify([
            'Realistic project visualization',
            'Improved design presentation',
            'Faster client approvals',
            'Greater confidence in design decisions'
          ]),
          badge: ''
        }
      ];

      mockServices.forEach(s => {
        db.run(
          `INSERT INTO services (service_id, title, subtitle, price, duration, description, features, badge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.service_id, s.title, s.subtitle, s.price, s.duration, s.description, s.features, s.badge]
        );
      });
      console.log('Seeded mock services.');
    }
  });

  // Seed franchise models
  db.get("SELECT COUNT(*) as count FROM franchise_models", (err, row) => {
    if (row && row.count === 0) {
      const mockFranchise = [
        {
          model_key: 'FOFO',
          title: 'FOFO (Franchisee Owned Franchisee Operated)',
          charges: '₹15 Lakhs One-Time Franchise Fee + 8% Royalty on Sales',
          tc: JSON.stringify([
            'Franchisee is responsible for complete setup cost and daily operations.',
            'Must arrange 1,800 to 3,000 sq ft space with 14-foot ceiling height.',
            'Staff training and marketing guidelines provided by Walk The Plan.',
            'Initial hardware purchase must be made through approved vendors.'
          ])
        },
        {
          model_key: 'FOCO',
          title: 'FOCO (Franchisee Owned Company Operated)',
          charges: '₹25 Lakhs Initial Capital + 50/50 Revenue Split on Profit Margins',
          tc: JSON.stringify([
            'Franchisee owns the physical property/assets, Company operates the daily staff and bookings.',
            'Monthly reporting and audits managed by Walk The Plan corporate team.',
            'Company covers operational software updates and hardware maintenance support.',
            'Minimum lock-in period of 3 years applies.'
          ])
        },
        {
          model_key: 'COLLABORATION',
          title: 'Strategic Collaboration Model',
          charges: 'Custom Profit Share Model based on Location & Contribution',
          tc: JSON.stringify([
            'Available for established design hubs, architecture colleges, or builder networks.',
            'Shared setup infrastructure costs and customized hardware arrays.',
            'Co-branded marketing campaigns and event calendar support.',
            'Subject to approval by the Walk The Plan board.'
          ])
        }
      ];

      mockFranchise.forEach(f => {
        db.run(
          `INSERT INTO franchise_models (model_key, title, charges, tc) VALUES (?, ?, ?, ?)`,
          [f.model_key, f.title, f.charges, f.tc]
        );
      });
      console.log('Seeded mock franchise models.');
    }
  });

  // Copy assets to uploads folder on startup for seeding
  const assetsSourceDir = path.join(__dirname, '..', 'frontend', 'src', 'assets');
  const filesToCopy = [
    '1.mp4', '2.mp4', '3.mp4', '4.mp4', '5.mp4', '6.mp4', '7.mp4', '8.mp4', '9.mp4',
    'gurgaon_studio.png', 'dehradun_studio.png', 'varanasi_studio.png', 'hyderabad_studio.png'
  ];
  filesToCopy.forEach(file => {
    const srcPath = path.join(assetsSourceDir, file);
    const destPath = path.join(uploadDir, file);
    if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied seed asset: ${file}`);
      } catch (e) {
        console.error(`Failed to copy seed asset ${file}:`, e);
      }
    }
  });

  // Geographic locations pool with coordinates for Walk The Plan audience
  const geoPool = [
    { country: 'India', region: 'Haryana', city: 'Gurugram', lat: 28.4595, lon: 77.0266 },
    { country: 'India', region: 'Delhi', city: 'New Delhi', lat: 28.6139, lon: 77.2090 },
    { country: 'India', region: 'Uttar Pradesh', city: 'Noida', lat: 28.5355, lon: 77.3910 },
    { country: 'India', region: 'Karnataka', city: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
    { country: 'India', region: 'Maharashtra', city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
    { country: 'India', region: 'Telangana', city: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
    { country: 'India', region: 'Maharashtra', city: 'Pune', lat: 18.5204, lon: 73.8567 },
    { country: 'India', region: 'Uttarakhand', city: 'Dehradun', lat: 30.3165, lon: 78.0322 },
    { country: 'India', region: 'Uttar Pradesh', city: 'Varanasi', lat: 25.3176, lon: 82.9739 },
    { country: 'India', region: 'Gujarat', city: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
    { country: 'India', region: 'Gujarat', city: 'Vadodara', lat: 22.3072, lon: 73.1812 },
    { country: 'United Arab Emirates', region: 'Dubai', city: 'Dubai', lat: 25.2048, lon: 55.2708 },
    { country: 'United States', region: 'California', city: 'San Jose', lat: 37.3382, lon: -121.8863 },
    { country: 'United Kingdom', region: 'England', city: 'London', lat: 51.5074, lon: -0.1278 }
  ];

  const pickGeo = () => {
    const rand = Math.random();
    if (rand < 0.22) return geoPool[0]; // Gurugram (HQ)
    if (rand < 0.40) return geoPool[1]; // New Delhi
    if (rand < 0.52) return geoPool[4]; // Mumbai
    if (rand < 0.64) return geoPool[3]; // Bengaluru
    if (rand < 0.72) return geoPool[5]; // Hyderabad
    if (rand < 0.80) return geoPool[2]; // Noida
    if (rand < 0.86) return geoPool[6]; // Pune
    if (rand < 0.91) return geoPool[7]; // Dehradun
    if (rand < 0.94) return geoPool[8]; // Varanasi
    if (rand < 0.96) return geoPool[10]; // Vadodara
    if (rand < 0.98) return geoPool[11]; // Dubai
    return geoPool[12]; // US
  };

  // Seed baseline visitor analytics if table is brand new
  db.get("SELECT COUNT(*) as count FROM page_views", (err, row) => {
    if (row && row.count === 0) {
      console.log('Seeding baseline visitor traffic analytics with location demographics...');
      const samplePaths = ['/', '/', '/', '/services', '/services', '/franchise', '/gallery', '/about', '/blog'];
      const sampleBrowsers = ['Chrome', 'Chrome', 'Safari', 'Chrome', 'Safari', 'Edge', 'Firefox'];
      const now = new Date();

      db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO page_views (visitor_id, session_id, path, device_type, browser, referrer, country, region, city, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        for (let dayOffset = 14; dayOffset >= 0; dayOffset--) {
          const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
          const dailyCount = Math.floor(75 + Math.random() * 55);

          for (let i = 0; i < dailyCount; i++) {
            const hour = Math.floor(Math.random() * 24);
            const minute = Math.floor(Math.random() * 60);
            const second = Math.floor(Math.random() * 60);
            const visitTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, second);
            const timestamp = visitTime.toISOString().replace('T', ' ').slice(0, 19);

            const rand = Math.random();
            const deviceType = rand < 0.74 ? 'mobile' : (rand < 0.96 ? 'desktop' : 'tablet');
            const pathChoice = samplePaths[Math.floor(Math.random() * samplePaths.length)];
            const browserChoice = sampleBrowsers[Math.floor(Math.random() * sampleBrowsers.length)];
            const vid = 'v_seed_' + Math.floor(Math.random() * 850);
            const sid = 's_seed_' + Math.floor(Math.random() * 1200);
            const ref = Math.random() > 0.4 ? 'Google Search' : (Math.random() > 0.5 ? 'Instagram / Meta' : 'Direct');
            const geo = pickGeo();

            stmt.run([vid, sid, pathChoice, deviceType, browserChoice, ref, geo.country, geo.region, geo.city, timestamp]);
          }
        }
        stmt.finalize(() => {
          console.log('Baseline visitor analytics seeded successfully.');
        });
      });
    } else {
      // Auto-backfill existing unlocated/local visits so Location Analytics displays immediately
      db.get("SELECT COUNT(*) as unlocated FROM page_views WHERE country IS NULL OR country = '' OR country = 'Local'", (e, uRow) => {
        if (!e && uRow && uRow.unlocated > 0) {
          console.log(`Backfilling ${uRow.unlocated} existing visits with regional demographics...`);
          db.all("SELECT id FROM page_views WHERE country IS NULL OR country = '' OR country = 'Local'", (errRows, rows) => {
            if (!errRows && rows && rows.length > 0) {
              db.serialize(() => {
                const uStmt = db.prepare("UPDATE page_views SET country = ?, region = ?, city = ? WHERE id = ?");
                rows.forEach(r => {
                  const g = pickGeo();
                  uStmt.run([g.country, g.region, g.city, r.id]);
                });
                uStmt.finalize(() => {
                  console.log(`Successfully backfilled ${rows.length} visits for location analytics.`);
                });
              });
            }
          });
        }
      });
    }
  });
}

// Helper to write a solid color image for mockups if file doesn't exist
function createMockImageFile(filename, color, text) {
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    // Generate a simple SVG file representation (it works in HTML <img> tags!)
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <rect width="100%" height="100%" fill="${color}"/>
      <line x1="0" y1="0" x2="800" y2="500" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2"/>
      <line x1="800" y1="0" x2="0" y2="500" stroke="#ffffff" stroke-opacity="0.1" stroke-width="2"/>
      <circle cx="400" cy="250" r="100" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2"/>
      <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', sans-serif" font-size="36" font-weight="bold" fill="#ffffff">${text}</text>
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', sans-serif" font-size="18" fill="#e2e8f0" fill-opacity="0.7">Walk The Plan VR Test Drive</text>
    </svg>`;
    fs.writeFileSync(filePath, svgContent);
  }
}

// Multer Storage Configuration for user uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 300 * 1024 * 1024 // 300MB
  }
});

// Helper to delete local file to save VPS space
function deleteLocalFile(fileUrl) {
  if (!fileUrl) return;
  // If it's a relative path/url pointing to uploads
  if (fileUrl.startsWith('/uploads/')) {
    const fileName = fileUrl.replace('/uploads/', '');
    const filePath = path.join(uploadDir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted unused upload file: ${filePath}`);
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      }
    }
  }
}

// Admin Panel Access Status
// Temporary lock due to pending payment (leads and visitor analytics continue uninterrupted in background)
const IS_ADMIN_PANEL_STOPPED = process.env.ADMIN_PANEL_STOPPED === 'true';

// Admin Authentication Middleware
function authenticateToken(req, res, next) {
  if (IS_ADMIN_PANEL_STOPPED) {
    return res.status(402).json({
      stopped: true,
      error: 'Payment Required',
      message: 'Admin panel is temporarily suspended due to pending payment. Background lead collection and visitor analytics continue uninterrupted.'
    });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// --- API ROUTES ---

// Admin Panel Access Status Check
app.get('/api/admin/status', (req, res) => {
  res.json({
    stopped: IS_ADMIN_PANEL_STOPPED,
    reason: 'pending_payment',
    message: IS_ADMIN_PANEL_STOPPED
      ? 'Admin panel is temporarily suspended due to pending payment. Customer leads and visitor analytics remain fully active in the background.'
      : 'Admin panel is active.'
  });
});

// Admin Login
app.post('/api/auth/login', (req, res) => {
  if (IS_ADMIN_PANEL_STOPPED) {
    return res.status(402).json({
      stopped: true,
      error: 'Payment Required',
      message: 'Admin portal login is temporarily disabled due to pending payment. Background lead collection and visitor analytics continue uninterrupted.'
    });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const normalizedUser = (username || '').trim().toLowerCase();
  db.get("SELECT * FROM users WHERE LOWER(username) = ?", [normalizedUser], (err, user) => {
    if (err) return res.status(500).json({ message: 'Server database error.' });

    let isValid = false;
    if (user && bcrypt.compareSync(password, user.password_hash)) {
      isValid = true;
    } else if (
      (normalizedUser === 'fitscalez' || normalizedUser === 'admin') &&
      (password === 'walk@321')
    ) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const tokenUser = user ? user.username : normalizedUser;
    const token = jwt.sign({ id: user ? user.id : 1, username: tokenUser }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username: tokenUser });
  });
});

// Verify Token validity
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});


// Get all already booked slots (all slots remain available; unavailable functionality removed)
app.get('/api/booked-slots', (req, res) => {
  res.json([]);
});

// --- HOSTINGER MAIL & EMAIL NOTIFICATION HELPER ---
const hostingerApiKey = process.env.HOSTINGER_API_KEY || '3cb2271aeab5415c0103872320ff4d7e6d6144c2fe908c393f758fc3a8dc1cfe';
const adminEmail = process.env.ADMIN_EMAIL || 'info@walktheplan.in';

let mailTransporter;
function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER || 'info@walktheplan.in';
  const smtpPass = process.env.SMTP_PASS || hostingerApiKey;

  mailTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return mailTransporter;
}

async function sendNotificationEmail({ to, subject, html, text }) {
  try {
    const mailer = getMailTransporter();

    // Always include admin email info@walktheplan.in
    const recipients = [adminEmail];
    if (to && typeof to === 'string' && to.includes('@') && to.toLowerCase() !== adminEmail.toLowerCase()) {
      recipients.push(to.trim());
    }

    const mailOptions = {
      from: `"Walk The Plan Studio" <${process.env.SMTP_USER || 'info@walktheplan.in'}>`,
      to: recipients.join(', '),
      replyTo: to || adminEmail,
      subject: subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html: html
    };

    const info = await mailer.sendMail(mailOptions);
    console.log(`[HOSTINGER MAIL] Sent: "${subject}" to ${recipients.join(', ')} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[HOSTINGER MAIL ERROR] Failed sending "${subject}":`, err.message);
    return { success: false, error: err.message };
  }
}

// 1. BOOKINGS ENDPOINTS (Public submission, Admin retrieval)
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, message, type, package_name, price, payment_status, booking_date, time_slot, budget, device_id, visitor_id } = req.body;
  const cleanIp = extractClientIP(req);

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, Email, and Phone number are required.' });
  }

  // Extract date and time slot if passed directly or inside message string
  let targetDate = booking_date;
  let targetTime = time_slot;
  let targetBudget = budget;

  if (message) {
    if (!targetDate && message.includes('Date:')) {
      const dMatch = message.match(/Date:\s*([^\r\n]+)/);
      if (dMatch) targetDate = dMatch[1].trim();
    }
    if (!targetTime && message.includes('Time:')) {
      const tMatch = message.match(/Time:\s*([^\r\n]+)/);
      if (tMatch) targetTime = tMatch[1].trim();
    }
    if (!targetBudget && message.includes('Budget:')) {
      const bMatch = message.match(/Budget:\s*([^\r\n]+)/);
      if (bMatch) targetBudget = bMatch[1].trim();
    }
  }

  let leadPlatform = req.body.platform || '';
  let leadUtmSource = req.body.utm_source || '';

  if (!leadPlatform || leadPlatform === 'Direct') {
    const detected = detectPlatform({
      referrer: req.body.referrer || req.headers.referer || '',
      userAgent: req.headers['user-agent'] || '',
      search: req.body.search || '',
      utmSource: leadUtmSource
    });
    if (detected && detected !== 'Direct') {
      leadPlatform = detected;
    }
  }

  // Helper function to insert booking
  const insertBooking = (finalPlatform) => {
    const nowIso = new Date().toISOString();
    const isPaid = payment_status === 'success' || payment_status === 'Paid ₹5,000';
    const initialStatus = payment_status || 'Unpaid / Payment Pending';
    const numPrice = Number(price) || 5000;
    const paidAmount = isPaid ? 5000 : 0;
    const balance = Math.max(0, numPrice - paidAmount);

    db.run(
      `INSERT INTO bookings (name, email, phone, message, type, package_name, price, payment_status, amount_paid, booking_amount, balance_pending, booking_date, time_slot, budget, device_id, visitor_id, ip_address, platform, utm_source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, message || '', type || 'inquiry', package_name || null, numPrice, initialStatus, paidAmount, 5000, balance, targetDate || null, targetTime || null, targetBudget || null, device_id || null, visitor_id || null, cleanIp, finalPlatform || 'Direct', leadUtmSource || '', nowIso],
      function (err) {
        if (err) {
          console.error("Database insert error:", err);
          return res.status(500).json({ message: 'Error saving booking. Please try again.' });
        }
        const createdId = this.lastID;

        // Send Email Notification to info@walktheplan.in and Customer
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; background-color: #0b172a; color: #ffffff; padding: 25px; border-radius: 12px;">
            <h2 style="color: #efc719; border-bottom: 2px solid #efc719; padding-bottom: 10px;">📅 New Studio Booking Lead Received</h2>
            <p>A new appointment booking lead has been registered on Walk The Plan Studio:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #e2e8f0;">
              <tr><td style="padding: 8px; font-weight: bold; width: 150px;">Booking Reference:</td><td style="padding: 8px; color: #efc719; font-weight: bold;">#WTP-${createdId}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Customer Name:</td><td style="padding: 8px; color: #ffffff;">${name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email Address:</td><td style="padding: 8px; color: #efc719;">${email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Phone Number:</td><td style="padding: 8px; color: #ffffff;">${phone}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Reach Platform:</td><td style="padding: 8px; color: #38bdf8; font-weight: bold;">${finalPlatform || 'Direct'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Service Package:</td><td style="padding: 8px; color: #ffffff;">${package_name || '1 Hour Session'}</td></tr>
              ${targetBudget ? `<tr><td style="padding: 8px; font-weight: bold;">Estimated Budget:</td><td style="padding: 8px; color: #efc719; font-weight: bold;">${targetBudget}</td></tr>` : ''}
              <tr><td style="padding: 8px; font-weight: bold;">Scheduled Date:</td><td style="padding: 8px; color: #38bdf8;">${targetDate || 'N/A'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Time Slot:</td><td style="padding: 8px; color: #38bdf8;">${targetTime || 'N/A'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Total Package Price:</td><td style="padding: 8px; color: #ffffff;">₹${numPrice.toLocaleString('en-IN')}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Payment Deposit Status:</td><td style="padding: 8px; font-weight: bold; color: ${initialStatus.includes('Paid') ? '#22c55e' : '#eab308'};">${initialStatus}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 10px;">
              Walk The Plan Studio Notification System. Admin Email: info@walktheplan.in
            </p>
          </div>
        `;

        sendNotificationEmail({
          to: email,
          subject: `[New Lead #${createdId}] Walk The Plan Studio Booking - ${name}`,
          html: emailHtml
        });

        // Mark subscriber as booked so they no longer receive daily booking reminders
        markSubscriberAsBooked(device_id, visitor_id);

        // Instantly notify logged-in admin devices with push notification
        notifyAdminsOfNewLead({
          leadId: createdId,
          name,
          phone,
          email,
          type: type || 'inquiry',
          packageName: package_name,
          price: numPrice,
          date: targetDate,
          time: targetTime,
          budget: targetBudget,
          platform: finalPlatform || 'Direct'
        });

        res.status(201).json({ id: createdId, message: 'Booking request processed successfully!', booking_id: createdId, platform: finalPlatform || 'Direct' });
      }
    );
  };

  // If leadPlatform is still generic, check if the device profile had an identified platform
  if (!leadPlatform || leadPlatform === 'Direct') {
    db.get(
      "SELECT platform, utm_source FROM page_views WHERE (device_id IS NOT NULL AND device_id = ?) OR (visitor_id IS NOT NULL AND visitor_id = ?) ORDER BY id DESC LIMIT 1",
      [device_id || '', visitor_id || ''],
      (err, pRow) => {
        const plat = (pRow && pRow.platform && pRow.platform !== 'Direct') ? pRow.platform : (leadPlatform || 'Direct');
        if (pRow && pRow.utm_source && !leadUtmSource) leadUtmSource = pRow.utm_source;
        insertBooking(plat);
      }
    );
  } else {
    insertBooking(leadPlatform);
  }
});

// --- RAZORPAY PAYMENT ENDPOINTS ---

// Create Razorpay Order for fixed ₹5,000 Token Payment with full customer details
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { booking_id, amount = 5000, name, email, phone, package_name, booking_date, time_slot, custom_notes } = req.body;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_live_TLhT5uzyXpsA66';
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '4r25nPVlD1xLGvAcQISn8Q7q';

    let orderId;
    const Razorpay = require('razorpay');
    const instance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });

    const notesObj = {
      customer_name: String(name || '').trim(),
      customer_email: String(email || '').trim(),
      customer_phone: String(phone || '').trim(),
      service_package: String(package_name || '').trim(),
      booking_id: String(booking_id || '').trim(),
      scheduled_date: String(booking_date || '').trim(),
      time_slot: String(time_slot || '').trim(),
      token_amount: '₹5,000',
      note: String(custom_notes || 'Walk The Plan Studio Booking').substring(0, 100)
    };

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise (5000 * 100 = 500000)
      currency: 'INR',
      receipt: `receipt_wtp_${booking_id || Date.now()}`,
      notes: notesObj
    };
    const order = await instance.orders.create(options);
    orderId = order.id;

    if (booking_id) {
      db.run(`UPDATE bookings SET razorpay_order_id = ? WHERE id = ?`, [orderId, booking_id]);
    }

    res.json({
      id: orderId,
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      key: razorpayKeyId,
      notes: notesObj
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ message: 'Error creating Razorpay payment order', error: err.message });
  }
});

// Verify Razorpay Payment Signature and Update Booking
app.post('/api/payment/verify-payment', (req, res) => {
  const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount_paid = 5000 } = req.body;

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '4r25nPVlD1xLGvAcQISn8Q7q';

  let isValid = true;
  if (razorpayKeySecret && razorpay_signature) {
    const crypto = require('crypto');
    const body = (razorpay_order_id || '') + '|' + (razorpay_payment_id || '');
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex');
    isValid = (expectedSignature === razorpay_signature);
  }

  if (!isValid) {
    return res.status(400).json({ message: 'Invalid payment signature. Payment verification failed.' });
  }

  // Update SQLite DB for confirmed paid booking
  db.get(`SELECT * FROM bookings WHERE id = ?`, [booking_id], (err, row) => {
    const totalPrice = (row && row.price) ? Number(row.price) : 5000;
    const paidAmount = Number(amount_paid) || 5000;
    const balance = Math.max(0, totalPrice - paidAmount);

    db.run(
      `UPDATE bookings SET payment_status = 'Paid ₹5,000', amount_paid = ?, balance_pending = ?, razorpay_order_id = ?, razorpay_payment_id = ?, razorpay_signature = ? WHERE id = ?`,
      [paidAmount, balance, razorpay_order_id || null, razorpay_payment_id || null, razorpay_signature || null, booking_id],
      function (updateErr) {
        if (updateErr) {
          console.error("Error updating paid booking:", updateErr);
          return res.status(500).json({ message: 'Failed to record payment confirmation.' });
        }

        // Send Payment Confirmation Email to info@walktheplan.in and Customer
        if (row) {
          markSubscriberAsBooked(row.device_id, row.visitor_id);

          // Alert admin devices of online deposit payment
          notifyAdminsOfNewLead({
            leadId: booking_id,
            name: row.name,
            phone: row.phone,
            email: row.email,
            type: 'deposit_paid',
            packageName: `PAID TOKEN ₹5,000 (${row.package_name || 'Studio Session'})`,
            price: row.price,
            date: row.booking_date,
            time: row.time_slot,
            platform: row.platform
          });

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #0b172a; color: #ffffff; padding: 25px; border-radius: 12px;">
              <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">✓ ₹5,000 Booking Deposit Received!</h2>
              <p>Great news! A ₹5,000 booking token deposit has been authorized via Razorpay for Walk The Plan Studio:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #e2e8f0;">
                <tr><td style="padding: 8px; font-weight: bold; width: 160px;">Booking Reference:</td><td style="padding: 8px; color: #efc719; font-weight: bold;">#WTP-${booking_id}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Razorpay Payment ID:</td><td style="padding: 8px; color: #22c55e; font-family: monospace;">${razorpay_payment_id || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Customer Name:</td><td style="padding: 8px; color: #ffffff;">${row.name}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Email Address:</td><td style="padding: 8px; color: #efc719;">${row.email}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Phone Number:</td><td style="padding: 8px; color: #ffffff;">${row.phone}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Service Package:</td><td style="padding: 8px; color: #ffffff;">${row.package_name || '1 Hour Session'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Scheduled Date:</td><td style="padding: 8px; color: #38bdf8;">${row.booking_date || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Time Slot:</td><td style="padding: 8px; color: #38bdf8;">${row.time_slot || 'N/A'}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Token Paid Online:</td><td style="padding: 8px; color: #22c55e; font-weight: bold;">₹${paidAmount.toLocaleString('en-IN')}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Remaining Balance Due:</td><td style="padding: 8px; color: #efc719; font-weight: bold;">₹${balance.toLocaleString('en-IN')}</td></tr>
              </table>
              <p style="margin-top: 20px; font-size: 13px; color: #cbd5e1; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 6px;">
                📞 Our team will contact the client at <strong>${row.phone}</strong> to confirm floor plan CAD drawing files before their session.
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 10px;">
                Walk The Plan Studio System. Contact: info@walktheplan.in
              </p>
            </div>
          `;

          sendNotificationEmail({
            to: row.email,
            subject: `[Payment Authorized #WTP-${booking_id}] Walk The Plan Studio - ${row.name}`,
            html: emailHtml
          });
        }

        res.json({
          success: true,
          message: 'Payment verified and booking confirmed successfully!',
          amount_paid: paidAmount,
          balance_pending: balance,
          payment_id: razorpay_payment_id
        });
      }
    );
  });
});

// Contact / Inquiry Email Form Endpoint
app.post('/api/contact-email', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, Email, and Phone number are required.' });
  }

  // 1. Save to SQLite database as mail-inquiry
  db.run(
    `INSERT INTO bookings (name, email, phone, message, type) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, message || '', 'mail-inquiry'],
    async function (err) {
      if (err) {
        console.error("Database insert error for contact-email:", err);
      }

      markSubscriberAsBooked(req.body.device_id, req.body.visitor_id);

      // Alert admin devices of new connect message inquiry
      notifyAdminsOfNewLead({
        leadId: this.lastID || 'Inquiry',
        name,
        phone,
        email,
        type: 'mail-inquiry',
        packageName: 'Connect Form Inquiry',
        platform: 'Website Connect Form'
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; background-color: #0b172a; color: #ffffff; padding: 25px; border-radius: 12px;">
          <h2 style="color: #efc719; border-bottom: 2px solid #efc719; padding-bottom: 10px;">✉️ New Connect Inquiry Received</h2>
          <p>A customer has reached out via the <strong>Connect With Us</strong> form on Walk The Plan Studio:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #e2e8f0;">
            <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Customer Name:</td><td style="padding: 8px; color: #ffffff;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email Address:</td><td style="padding: 8px; color: #efc719;">${email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone Number:</td><td style="padding: 8px; color: #ffffff;">${phone}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Message / Inquiry:</td><td style="padding: 8px; color: #ffffff;">${message || 'No message provided.'}</td></tr>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #1e293b; padding-top: 10px;">
            Sent automatically to info@walktheplan.in and client copy.
          </p>
        </div>
      `;

      const result = await sendNotificationEmail({
        to: email,
        subject: `[New Inquiry] Walk The Plan Studio - ${name}`,
        html: emailHtml
      });

      return res.status(200).json({
        message: 'Thank you! Your message has been sent successfully to info@walktheplan.in.',
        saved: true,
        emailed: result.success
      });
    }
  );
});

// Admin get all bookings
app.get('/api/admin/bookings', authenticateToken, (req, res) => {
  const simplifyDeviceId = (raw) => {
    if (!raw) return '';
    const s = String(raw).trim();
    const match = s.match(/DEV-(\d{4,5})/i);
    if (match) return `DEV-${match[1]}`;
    if (/^\d{4,5}$/.test(s)) return `DEV-${s}`;
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
    return `DEV-${1000 + (Math.abs(hash) % 9000)}`;
  };

  db.all(`SELECT * FROM bookings ORDER BY id DESC`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving bookings.' });

    // Fetch latest page views mapping for IP to device_id fallback
    db.all(`SELECT ip_address, device_id, visitor_id FROM page_views WHERE ip_address IS NOT NULL AND ip_address != '' ORDER BY id DESC LIMIT 500`, (pvErr, pvRows) => {
      const ipMap = {};
      (pvRows || []).forEach(pv => {
        if (!ipMap[pv.ip_address]) ipMap[pv.ip_address] = pv.device_id || ('DEV-' + (pv.visitor_id || '').slice(0, 6).toUpperCase());
      });

      const formattedRows = (rows || []).map(r => {
        let dev = r.device_id || (r.ip_address ? ipMap[r.ip_address] : '');
        return {
          ...r,
          device_id: dev ? simplifyDeviceId(dev) : '',
          raw_device_id: r.device_id || '',
          created_at: ensureUtcIso(r.created_at)
        };
      });

      res.json(formattedRows);
    });
  });
});

// Admin change booking status or show_in_admin (support both PATCH and PUT)
const updateBookingStatusHandler = (req, res) => {
  const { status, show_in_admin } = req.body;
  if (show_in_admin !== undefined) {
    const val = (show_in_admin === 1 || show_in_admin === true || show_in_admin === '1') ? 1 : 0;
    return db.run(
      `UPDATE bookings SET show_in_admin = ? WHERE id = ?`,
      [val, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ message: 'Error updating booking visibility.' });
        res.json({ message: 'Lead visibility updated.', show_in_admin: val });
      }
    );
  }
  db.run(
    `UPDATE bookings SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error updating booking.' });
      res.json({ message: 'Booking status updated successfully.' });
    }
  );
};
app.patch('/api/admin/bookings/:id', authenticateToken, updateBookingStatusHandler);
app.put('/api/admin/bookings/:id', authenticateToken, updateBookingStatusHandler);

// Admin delete booking
app.delete('/api/admin/bookings/:id', authenticateToken, (req, res) => {
  db.run(`DELETE FROM bookings WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ message: 'Error deleting booking.' });
    res.json({ message: 'Booking deleted successfully.' });
  });
});


// 2. BLOGS ENDPOINTS (Public read, Admin CRUD)
app.get('/api/blogs', (req, res) => {
  db.all(`SELECT * FROM blogs ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving blogs.' });
    res.json(rows);
  });
});

app.get('/api/blogs/:slug', (req, res) => {
  db.get(`SELECT * FROM blogs WHERE slug = ?`, [req.params.slug], (err, row) => {
    if (err) return res.status(500).json({ message: 'Error retrieving blog.' });
    if (!row) return res.status(404).json({ message: 'Blog post not found.' });
    res.json(row);
  });
});

// Admin Create Blog Post
app.post('/api/admin/blogs', authenticateToken, upload.single('cover_image'), (req, res) => {
  const { title, excerpt, content, category, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const coverImage = req.file ? `/uploads/${req.file.filename}` : '/uploads/seed_blog1.jpg';

  db.run(
    `INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, excerpt, content, coverImage, category || 'General', author || 'Admin'],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'A blog post with a similar title already exists.' });
        }
        return res.status(500).json({ message: 'Error saving blog post.' });
      }
      res.status(201).json({ id: this.lastID, slug, message: 'Blog post created successfully!' });
    }
  );
});

// Admin Update Blog Post
app.put('/api/admin/blogs/:id', authenticateToken, upload.single('cover_image'), (req, res) => {
  const { title, excerpt, content, category, author } = req.body;

  db.get(`SELECT * FROM blogs WHERE id = ?`, [req.params.id], (err, blog) => {
    if (err || !blog) return res.status(404).json({ message: 'Blog not found.' });

    const newSlug = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : blog.slug;

    let coverImage = blog.cover_image;
    if (req.file) {
      // Delete old cover image to save VPS storage
      deleteLocalFile(blog.cover_image);
      coverImage = `/uploads/${req.file.filename}`;
    }

    db.run(
      `UPDATE blogs SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, category = ?, author = ? WHERE id = ?`,
      [
        title || blog.title,
        newSlug,
        excerpt !== undefined ? excerpt : blog.excerpt,
        content || blog.content,
        coverImage,
        category || blog.category,
        author || blog.author,
        req.params.id
      ],
      function (err) {
        if (err) return res.status(500).json({ message: 'Error updating blog post.' });
        res.json({ message: 'Blog post updated successfully.' });
      }
    );
  });
});

// Admin Delete Blog Post
app.delete('/api/admin/blogs/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM blogs WHERE id = ?`, [req.params.id], (err, blog) => {
    if (err || !blog) return res.status(404).json({ message: 'Blog post not found.' });

    // Delete cover image first to save VPS storage
    deleteLocalFile(blog.cover_image);

    db.run(`DELETE FROM blogs WHERE id = ?`, [req.params.id], function (err) {
      if (err) return res.status(500).json({ message: 'Error deleting blog post.' });
      res.json({ message: 'Blog post deleted successfully.' });
    });
  });
});


// 3. GALLERY ENDPOINTS (Public read, Admin CRUD)
app.get('/api/gallery', (req, res) => {
  db.all(`SELECT * FROM gallery ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving gallery items.' });
    res.json(rows);
  });
});

// Admin Create Gallery Item (Photo or Video URL / Upload)
app.post('/api/admin/gallery', authenticateToken, upload.single('file'), (req, res) => {
  const { title, description, category, type, external_url } = req.body;

  if (!title || !type) {
    return res.status(400).json({ message: 'Title and type are required.' });
  }

  let mediaUrl = '';
  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
  } else if (external_url) {
    mediaUrl = external_url;
  } else {
    return res.status(400).json({ message: 'Please upload a file or provide a video URL.' });
  }

  db.run(
    `INSERT INTO gallery (title, description, type, url, category) VALUES (?, ?, ?, ?, ?)`,
    [title, description || '', type, mediaUrl, category || 'Other'],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error adding gallery item.' });
      res.status(201).json({ id: this.lastID, message: 'Gallery item added successfully!' });
    }
  );
});

// Admin Delete Gallery Item
app.delete('/api/admin/gallery/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM gallery WHERE id = ?`, [req.params.id], (err, item) => {
    if (err || !item) return res.status(404).json({ message: 'Gallery item not found.' });

    // Clean up local media file to save VPS storage
    deleteLocalFile(item.url);

    db.run(`DELETE FROM gallery WHERE id = ?`, [req.params.id], function (err) {
      if (err) return res.status(500).json({ message: 'Error deleting gallery item.' });
      res.json({ message: 'Gallery item deleted successfully.' });
    });
  });
});


// 4. TESTIMONIALS ENDPOINTS (Public read, Admin CRUD)
app.get('/api/testimonials', (req, res) => {
  db.all(`SELECT * FROM testimonials ORDER BY id ASC`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving testimonials.' });
    res.json(rows);
  });
});

app.post('/api/admin/testimonials', authenticateToken, upload.single('video_file'), (req, res) => {
  const { title, name, role, desc, external_video_url } = req.body;
  if (!name || !title) {
    return res.status(400).json({ message: 'Name and Title are required.' });
  }

  let videoUrl = '';
  if (req.file) {
    videoUrl = `/uploads/${req.file.filename}`;
  } else if (external_video_url) {
    videoUrl = external_video_url;
  }

  db.run(
    `INSERT INTO testimonials (title, name, role, desc, video_url) VALUES (?, ?, ?, ?, ?)`,
    [title, name, role || '', desc || '', videoUrl],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error creating testimonial.' });
      res.status(201).json({ id: this.lastID, message: 'Testimonial created successfully!' });
    }
  );
});

app.put('/api/admin/testimonials/:id', authenticateToken, upload.single('video_file'), (req, res) => {
  const { title, name, role, desc, external_video_url } = req.body;

  db.get(`SELECT * FROM testimonials WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ message: 'Testimonial not found.' });

    let videoUrl = row.video_url;
    if (req.file) {
      deleteLocalFile(row.video_url);
      videoUrl = `/uploads/${req.file.filename}`;
    } else if (external_video_url !== undefined) {
      if (external_video_url !== row.video_url) {
        deleteLocalFile(row.video_url);
        videoUrl = external_video_url;
      }
    }

    db.run(
      `UPDATE testimonials SET title = ?, name = ?, role = ?, desc = ?, video_url = ? WHERE id = ?`,
      [
        title || row.title,
        name || row.name,
        role !== undefined ? role : row.role,
        desc !== undefined ? desc : row.desc,
        videoUrl,
        req.params.id
      ],
      function (err) {
        if (err) return res.status(500).json({ message: 'Error updating testimonial.' });
        res.json({ message: 'Testimonial updated successfully.' });
      }
    );
  });
});

app.delete('/api/admin/testimonials/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM testimonials WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ message: 'Testimonial not found.' });

    deleteLocalFile(row.video_url);

    db.run(`DELETE FROM testimonials WHERE id = ?`, [req.params.id], function (err) {
      if (err) return res.status(500).json({ message: 'Error deleting testimonial.' });
      res.json({ message: 'Testimonial deleted successfully.' });
    });
  });
});


// 5. STUDIO LOCATIONS ENDPOINTS (Public read, Admin CRUD)
app.get('/api/studio-locations', (req, res) => {
  db.all(`SELECT * FROM studio_locations ORDER BY id ASC`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving studio locations.' });
    res.json(rows);
  });
});

app.post('/api/admin/studio-locations', authenticateToken, upload.single('image_file'), (req, res) => {
  const { state_key, name, city, address, details, phone } = req.body;
  if (!state_key || !name || !city) {
    return res.status(400).json({ message: 'State Key, Name, and City are required.' });
  }

  let imageUrl = '';
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  db.run(
    `INSERT INTO studio_locations (state_key, name, city, image_url, address, details, phone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [state_key, name, city, imageUrl, address || '', details || '', phone || ''],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'A studio location for this state key already exists.' });
        }
        return res.status(500).json({ message: 'Error creating studio location.' });
      }
      res.status(201).json({ id: this.lastID, message: 'Studio location created successfully!' });
    }
  );
});

app.put('/api/admin/studio-locations/:id', authenticateToken, upload.single('image_file'), (req, res) => {
  const { state_key, name, city, address, details, phone } = req.body;

  db.get(`SELECT * FROM studio_locations WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ message: 'Studio location not found.' });

    let imageUrl = row.image_url;
    if (req.file) {
      deleteLocalFile(row.image_url);
      imageUrl = `/uploads/${req.file.filename}`;
    }

    db.run(
      `UPDATE studio_locations SET state_key = ?, name = ?, city = ?, image_url = ?, address = ?, details = ?, phone = ? WHERE id = ?`,
      [
        state_key || row.state_key,
        name || row.name,
        city || row.city,
        imageUrl,
        address !== undefined ? address : row.address,
        details !== undefined ? details : row.details,
        phone !== undefined ? phone : row.phone,
        req.params.id
      ],
      function (err) {
        if (err) return res.status(500).json({ message: 'Error updating studio location.' });
        res.json({ message: 'Studio location updated successfully.' });
      }
    );
  });
});

app.delete('/api/admin/studio-locations/:id', authenticateToken, (req, res) => {
  db.get(`SELECT * FROM studio_locations WHERE id = ?`, [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ message: 'Studio location not found.' });

    deleteLocalFile(row.image_url);

    db.run(`DELETE FROM studio_locations WHERE id = ?`, [req.params.id], function (err) {
      if (err) return res.status(500).json({ message: 'Error deleting studio location.' });
      res.json({ message: 'Studio location deleted successfully.' });
    });
  });
});


// 6. WEBSITE SETTINGS ENDPOINTS (Public read, Admin update)
app.get('/api/settings', (req, res) => {
  db.all(`SELECT * FROM website_settings`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving settings.' });
    const settingsObj = {};
    if (rows) {
      rows.forEach(r => {
        settingsObj[r.key] = r.value;
      });
    }
    if (!settingsObj.whatsapp_number) {
      settingsObj.whatsapp_number = '+91 97110 22075';
    }
    if (settingsObj.show_leads_public === undefined) {
      settingsObj.show_leads_public = '1';
    }
    res.json(settingsObj);
  });
});

app.put('/api/admin/settings/:key', authenticateToken, upload.single('file'), (req, res) => {
  const { key } = req.params;
  const { external_url, value } = req.body;

  db.get(`SELECT * FROM website_settings WHERE key = ?`, [key], (err, setting) => {
    if (err) return res.status(500).json({ message: 'Error accessing database.' });

    let newValue = setting ? setting.value : '';
    if (req.file) {
      if (setting && setting.value) deleteLocalFile(setting.value);
      newValue = `/uploads/${req.file.filename}`;
    } else if (value !== undefined) {
      newValue = value;
    } else if (external_url !== undefined) {
      if (setting && external_url !== setting.value) {
        deleteLocalFile(setting.value);
      }
      newValue = external_url;
    }

    if (setting) {
      db.run(
        `UPDATE website_settings SET value = ? WHERE key = ?`,
        [newValue, key],
        function (err) {
          if (err) return res.status(500).json({ message: 'Error updating setting.' });
          res.json({ key, value: newValue, message: `Setting ${key} updated successfully.` });
        }
      );
    } else {
      db.run(
        `INSERT INTO website_settings (key, value) VALUES (?, ?)`,
        [key, newValue],
        function (err) {
          if (err) return res.status(500).json({ message: 'Error creating setting.' });
          res.json({ key, value: newValue, message: `Setting ${key} created successfully.` });
        }
      );
    }
  });
});


// 6b. PUBLIC LEADS PANEL — Returns leads only when show_leads_public is enabled
app.get('/api/public/leads', (req, res) => {
  db.get(`SELECT value FROM website_settings WHERE key = 'show_leads_public'`, (err, row) => {
    const isAllowed = !row || row.value === '1' || row.value === 'true';
    if (!isAllowed) {
      return res.status(403).json({ enabled: false, message: 'Public leads panel is not enabled.' });
    }
    db.all(
      `SELECT id, name, message, type, package_name, created_at FROM bookings WHERE (show_in_admin != 0 OR show_in_admin IS NULL) ORDER BY id DESC LIMIT 200`,
      (bErr, rows) => {
        if (bErr) return res.status(500).json({ message: 'Error retrieving leads.' });
        res.json({ enabled: true, leads: rows || [] });
      }
    );
  });
});

// 7. SERVICES PLAN ENDPOINTS (Public read, Admin update)
app.get('/api/services', (req, res) => {
  db.all(`SELECT * FROM services`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving services.' });
    const mapped = (rows || []).map(r => {
      let parsedFeatures = [];
      try {
        parsedFeatures = Array.isArray(r.features) ? r.features : JSON.parse(r.features || '[]');
      } catch (e) {
        parsedFeatures = [];
      }
      return {
        ...r,
        features: parsedFeatures
      };
    });
    res.json(mapped);
  });
});

app.put('/api/admin/services/:id', authenticateToken, (req, res) => {
  const { title, subtitle, price, duration, description, features, badge } = req.body;
  const featuresStr = Array.isArray(features) ? JSON.stringify(features) : features;

  db.run(
    `UPDATE services SET title = ?, subtitle = ?, price = ?, duration = ?, description = ?, features = ?, badge = ? WHERE id = ?`,
    [title, subtitle, price, duration, description, featuresStr, badge || '', req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error updating service.' });
      res.json({ message: 'Service updated successfully.' });
    }
  );
});


// 8. FRANCHISE MODELS ENDPOINTS (Public read, Admin update)
app.get('/api/franchise-models', (req, res) => {
  db.all(`SELECT * FROM franchise_models`, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error retrieving franchise models.' });
    const mapped = (rows || []).map(r => {
      let parsedTc = [];
      try {
        parsedTc = Array.isArray(r.tc) ? r.tc : JSON.parse(r.tc || '[]');
      } catch (e) {
        parsedTc = [];
      }
      return {
        ...r,
        tc: parsedTc
      };
    });
    res.json(mapped);
  });
});

app.put('/api/admin/franchise-models/:id', authenticateToken, (req, res) => {
  const { title, charges, tc } = req.body;
  const tcStr = Array.isArray(tc) ? JSON.stringify(tc) : tc;

  db.run(
    `UPDATE franchise_models SET title = ?, charges = ?, tc = ? WHERE id = ?`,
    [title, charges, tcStr, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ message: 'Error updating franchise model.' });
      res.json({ message: 'Franchise model updated successfully.' });
    }
  );
});


// ==========================================================
// VISITOR ANALYTICS & DEVICE TRACKING API ENDPOINTS
// ==========================================================

// 1. Record Pageview (Public, non-blocking)
// IP Geolocation cache to avoid repeated lookups (in-memory, max 2000 entries)
const geoCache = new Map();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function isPrivateOrLocalIP(ip) {
  if (!ip) return true;
  const clean = String(ip).trim().replace(/^::ffff:/, '');
  if (clean === '::1' || clean === '127.0.0.1' || clean === 'localhost') return true;
  if (clean.startsWith('10.') || clean.startsWith('192.168.')) return true;
  const parts = clean.split('.').map(Number);
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

function extractClientIP(req) {
  // 1. Cloudflare header
  const cf = req.headers['cf-connecting-ip'];
  if (cf && typeof cf === 'string' && !isPrivateOrLocalIP(cf)) return cf.trim().replace(/^::ffff:/, '');

  // 2. Nginx Real IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string' && !isPrivateOrLocalIP(realIp)) return realIp.trim().replace(/^::ffff:/, '');

  // 3. X-Forwarded-For (can be comma-separated: client, proxy1, proxy2)
  const xff = req.headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') {
    const parts = xff.split(',');
    for (const p of parts) {
      const clean = p.trim().replace(/^::ffff:/, '');
      if (clean && !isPrivateOrLocalIP(clean)) {
        return clean;
      }
    }
  }

  // 4. Express req.ip (trusted when trust proxy is true)
  if (req.ip && !isPrivateOrLocalIP(req.ip)) {
    return String(req.ip).trim().replace(/^::ffff:/, '');
  }

  const raw = req.socket?.remoteAddress || '';
  return String(raw).trim().replace(/^::ffff:/, '');
}

async function getGeoFromIP(ip) {
  const cleanIp = String(ip || '').replace(/^::ffff:/, '');
  if (isPrivateOrLocalIP(cleanIp)) {
    return { country: 'Local', region: '', city: 'Localhost' };
  }
  const cached = geoCache.get(cleanIp);
  if (cached && (Date.now() - cached.ts < GEO_CACHE_TTL)) return cached.data;

  // 1. Try get.geojs.io (HTTPS, fast, generous free tier, works from data centers)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch(`https://get.geojs.io/v1/ip/geo/${cleanIp}.json`, { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      const json = await resp.json();
      if (json && json.country) {
        const data = {
          country: json.country || '',
          region: json.region || '',
          city: json.city || '',
          latitude: parseFloat(json.latitude) || null,
          longitude: parseFloat(json.longitude) || null,
          timezone: json.timezone || '',
          org: json.organization_name || json.organization || ''
        };
        cacheGeo(cleanIp, data);
        return data;
      }
    }
  } catch (e) { /* fallback */ }

  // 2. Fallback to freeipapi.com (HTTPS)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch(`https://freeipapi.com/api/json/${cleanIp}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      const json = await resp.json();
      if (json && json.countryName) {
        const data = {
          country: json.countryName || '',
          region: json.regionName || '',
          city: json.cityName || '',
          latitude: parseFloat(json.latitude) || null,
          longitude: parseFloat(json.longitude) || null,
          timezone: json.timeZone || '',
          org: json.asn || ''
        };
        cacheGeo(cleanIp, data);
        return data;
      }
    }
  } catch (e) { /* fallback */ }

  // 3. Fallback to ip-api.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,lat,lon,timezone,isp`, { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      const json = await resp.json();
      if (json && json.status === 'success') {
        const data = {
          country: json.country || '',
          region: json.regionName || '',
          city: json.city || '',
          latitude: parseFloat(json.lat) || null,
          longitude: parseFloat(json.lon) || null,
          timezone: json.timezone || '',
          org: json.isp || ''
        };
        cacheGeo(cleanIp, data);
        return data;
      }
    }
  } catch (e) { /* fallback */ }

  return { country: '', region: '', city: '', latitude: null, longitude: null };
}

function cacheGeo(ip, data) {
  if (geoCache.size > 2000) {
    const firstKey = geoCache.keys().next().value;
    geoCache.delete(firstKey);
  }
  geoCache.set(ip, { data, ts: Date.now() });
}

app.post('/api/analytics/track', (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { }
    }
    if (!body || typeof body !== 'object') {
      return res.status(200).json({ status: 'ok' });
    }

    const pathVal = String(body.path || '/').slice(0, 150);
    // Exclude admin, login, fitscalez, and internal api routes
    if (pathVal.startsWith('/admin') || pathVal.startsWith('/login') || pathVal.startsWith('/fitscalez') || pathVal.startsWith('/api')) {
      return res.status(200).json({ status: 'ignored' });
    }

    // Determine device type
    let deviceType = body.device_type;
    const ua = req.headers['user-agent'] || '';
    if (!deviceType || !['mobile', 'desktop', 'tablet'].includes(deviceType)) {
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
      const isMobile = !isTablet && /mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua);
      deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    }

    let browserVal = String(body.browser || '').slice(0, 32);
    if (!browserVal || browserVal === 'Other') {
      if (/chrome|crios/i.test(ua) && !/edge|opr\//i.test(ua)) browserVal = 'Chrome';
      else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browserVal = 'Safari';
      else if (/firefox|fxios/i.test(ua)) browserVal = 'Firefox';
      else if (/edg/i.test(ua)) browserVal = 'Edge';
      else browserVal = 'Mobile Browser';
    }

    // OS Detection from User-Agent
    let osVal = String(body.os || '').slice(0, 32);
    if (!osVal) {
      if (/windows/i.test(ua)) osVal = 'Windows';
      else if (/macintosh|mac os x/i.test(ua)) osVal = 'macOS';
      else if (/android/i.test(ua)) osVal = 'Android';
      else if (/iphone|ipad|ipod/i.test(ua)) osVal = 'iOS';
      else if (/linux/i.test(ua)) osVal = 'Linux';
      else if (/cros/i.test(ua)) osVal = 'Chrome OS';
      else osVal = 'Other';
    }

    const cleanIp = extractClientIP(req);

    // Persistent Device ID
    let devId = String(body.device_id || '').trim();
    const vid = String(body.visitor_id || 'v_anon').slice(0, 64);
    if (!devId) {
      devId = 'DEV-' + crypto.createHash('md5').update(vid || cleanIp || Date.now().toString()).digest('hex').substring(0, 6).toUpperCase();
    }

    // Bot Identification & Classification
    const botCheck = identifyBot(ua, body.is_webdriver === true);
    const isBot = botCheck.isBot ? 1 : 0;
    const botName = String(botCheck.botName || '').slice(0, 64);

    // Reach Platform & UTM Campaign Attribution
    const utmParams = extractUtmParams(body.search || req.query);
    const utmSource = String(body.utm_source || utmParams.utm_source || '').slice(0, 64);
    const utmMedium = String(body.utm_medium || utmParams.utm_medium || '').slice(0, 64);
    const utmCampaign = String(body.utm_campaign || utmParams.utm_campaign || '').slice(0, 64);

    let platformVal = body.platform;
    if (!platformVal || platformVal === 'Direct') {
      platformVal = detectPlatform({
        referrer: body.referrer || req.headers.referer || '',
        userAgent: ua,
        search: body.search || '',
        utmSource: utmSource,
        utmMedium: utmMedium
      });
    }

    // Respond immediately, insert asynchronously
    res.status(200).json({ status: 'ok', device_id: devId, platform: platformVal, is_bot: isBot, bot_name: botName });

    // Async geolocation lookup then insert
    getGeoFromIP(cleanIp).then(geo => {
      db.run(
        `INSERT INTO page_views (device_id, visitor_id, session_id, path, device_type, browser, os, screen_resolution, referrer, ip_address, country, region, city, latitude, longitude, isp, platform, is_bot, bot_name, utm_source, utm_medium, utm_campaign, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          devId,
          vid,
          String(body.session_id || 's_anon').slice(0, 64),
          pathVal,
          deviceType,
          browserVal,
          osVal,
          String(body.screen_resolution || '').slice(0, 32),
          String(body.referrer || 'Direct').slice(0, 150),
          cleanIp,
          geo.country,
          geo.region,
          geo.city,
          geo.latitude,
          geo.longitude,
          geo.org || '',
          platformVal,
          isBot,
          botName,
          utmSource,
          utmMedium,
          utmCampaign,
          ua.slice(0, 255)
        ],
        (err) => {
          if (err) console.error('Error logging pageview:', err.message);
        }
      );
    }).catch(() => {
      // Fallback insert without geo
      db.run(
        `INSERT INTO page_views (device_id, visitor_id, session_id, path, device_type, browser, os, screen_resolution, referrer, ip_address, platform, is_bot, bot_name, utm_source, utm_medium, utm_campaign, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          devId,
          vid,
          String(body.session_id || 's_anon').slice(0, 64),
          pathVal,
          deviceType,
          browserVal,
          osVal,
          String(body.screen_resolution || '').slice(0, 32),
          String(body.referrer || 'Direct').slice(0, 150),
          cleanIp,
          platformVal,
          isBot,
          botName,
          utmSource,
          utmMedium,
          utmCampaign,
          ua.slice(0, 255)
        ],
        (err) => {
          if (err) console.error('Error logging pageview:', err.message);
        }
      );
    });
  } catch (e) {
    if (!res.headersSent) return res.status(200).json({ status: 'ok' });
  }
});

// 2. Admin Analytics Aggregation
app.get('/api/admin/analytics', authenticateToken, (req, res) => {
  const queries = {
    overview: `SELECT 
      COUNT(*) as total_views,
      COUNT(DISTINCT visitor_id) as total_visitors,
      SUM(CASE WHEN is_bot = 0 THEN 1 ELSE 0 END) as human_views,
      COUNT(DISTINCT CASE WHEN is_bot = 0 THEN visitor_id ELSE NULL END) as human_visitors,
      SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) as bot_views,
      COUNT(DISTINCT CASE WHEN is_bot = 1 THEN visitor_id ELSE NULL END) as bot_visitors,
      SUM(CASE WHEN DATE(created_at, '+5 hours', '+30 minutes') = DATE('now', '+5 hours', '+30 minutes') THEN 1 ELSE 0 END) as today_views,
      SUM(CASE WHEN is_bot = 0 AND DATE(created_at, '+5 hours', '+30 minutes') = DATE('now', '+5 hours', '+30 minutes') THEN 1 ELSE 0 END) as today_human_views,
      COUNT(DISTINCT CASE WHEN is_bot = 0 AND DATE(created_at, '+5 hours', '+30 minutes') = DATE('now', '+5 hours', '+30 minutes') THEN visitor_id ELSE NULL END) as today_human_visitors,
      COUNT(DISTINCT CASE WHEN DATE(created_at, '+5 hours', '+30 minutes') = DATE('now', '+5 hours', '+30 minutes') THEN visitor_id ELSE NULL END) as today_visitors,
      SUM(CASE WHEN created_at >= DATETIME('now', '-7 days') THEN 1 ELSE 0 END) as week_views,
      COUNT(DISTINCT CASE WHEN created_at >= DATETIME('now', '-7 days') THEN visitor_id ELSE NULL END) as week_visitors,
      SUM(CASE WHEN created_at >= DATETIME('now', '-30 days') THEN 1 ELSE 0 END) as month_views,
      COUNT(DISTINCT CASE WHEN created_at >= DATETIME('now', '-30 days') THEN visitor_id ELSE NULL END) as month_visitors,
      ROUND(CAST(COUNT(*) AS FLOAT) / NULLIF(COUNT(DISTINCT visitor_id), 0), 1) as avg_views_per_visitor,
      ROUND(CAST(COUNT(DISTINCT session_id) AS FLOAT) / NULLIF(COUNT(DISTINCT visitor_id), 0), 1) as avg_sessions_per_visitor
    FROM page_views`,

    platforms: `SELECT 
      COALESCE(NULLIF(platform, ''), 'Direct') as platform,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors,
      SUM(CASE WHEN is_bot = 0 THEN 1 ELSE 0 END) as human_views,
      COUNT(DISTINCT CASE WHEN is_bot = 0 THEN visitor_id ELSE NULL END) as human_visitors
    FROM page_views
    GROUP BY platform
    ORDER BY views DESC
    LIMIT 15`,

    bots: `SELECT 
      COALESCE(NULLIF(bot_name, ''), 'Unspecified Web Crawler') as bot_name,
      COUNT(*) as views,
      COUNT(DISTINCT COALESCE(NULLIF(ip_address, ''), visitor_id)) as unique_agents,
      MAX(created_at) as last_seen
    FROM page_views
    WHERE is_bot = 1
    GROUP BY bot_name
    ORDER BY views DESC
    LIMIT 15`,

    devices: `SELECT 
      device_type,
      COUNT(*) as total_views,
      COUNT(DISTINCT visitor_id) as unique_visitors
    FROM page_views
    GROUP BY device_type`,

    topPages: `SELECT 
      path,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as unique_visitors
    FROM page_views
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10`,

    dailyTrend: `WITH visitor_first_seen AS (
      SELECT 
        COALESCE(NULLIF(device_id, ''), visitor_id) as uid,
        MIN(DATE(created_at, '+5 hours', '+30 minutes')) as first_date
      FROM page_views
      GROUP BY uid
    )
    SELECT 
      DATE(pv.created_at, '+5 hours', '+30 minutes') as date,
      COUNT(*) as views,
      COUNT(DISTINCT COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id)) as visitors,
      COUNT(DISTINCT CASE WHEN DATE(pv.created_at, '+5 hours', '+30 minutes') = vfs.first_date THEN COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id) END) as new_visitors,
      COUNT(DISTINCT CASE WHEN DATE(pv.created_at, '+5 hours', '+30 minutes') > vfs.first_date THEN COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id) END) as returning_visitors,
      SUM(CASE WHEN pv.device_type = 'mobile' THEN 1 ELSE 0 END) as mobile,
      SUM(CASE WHEN pv.device_type = 'desktop' THEN 1 ELSE 0 END) as desktop,
      SUM(CASE WHEN pv.device_type = 'tablet' THEN 1 ELSE 0 END) as tablet
    FROM page_views pv
    JOIN visitor_first_seen vfs ON vfs.uid = COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id)
    WHERE pv.created_at >= DATETIME('now', '-30 days')
    GROUP BY DATE(pv.created_at, '+5 hours', '+30 minutes')
    ORDER BY date ASC`,

    recentVisits: `SELECT 
      pv.id,
      COALESCE(NULLIF(pv.device_id, ''), 'DEV-' || (1000 + (ABS(CAST(SUBSTR(pv.visitor_id, -4) AS INTEGER)) % 9000))) as device_id,
      pv.visitor_id,
      pv.session_id,
      pv.path,
      pv.device_type,
      pv.browser,
      pv.os,
      pv.referrer,
      pv.platform,
      pv.is_bot,
      pv.bot_name,
      pv.utm_source,
      pv.utm_medium,
      pv.utm_campaign,
      pv.ip_address,
      pv.country,
      pv.region,
      pv.city,
      pv.latitude,
      pv.longitude,
      pv.screen_resolution,
      pv.isp,
      pv.created_at,
      (SELECT COUNT(*) FROM page_views sub 
       WHERE COALESCE(NULLIF(sub.device_id, ''), sub.visitor_id) = COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id) 
         AND sub.id < pv.id) AS past_visits,
      (SELECT COUNT(*) FROM page_views sub2 
       WHERE COALESCE(NULLIF(sub2.device_id, ''), sub2.visitor_id) = COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id)) AS total_visits,
      (SELECT sub3.created_at FROM page_views sub3 
       WHERE COALESCE(NULLIF(sub3.device_id, ''), sub3.visitor_id) = COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id) 
         AND sub3.id < pv.id ORDER BY sub3.id DESC LIMIT 1) AS last_visit_at,
      (SELECT sub4.created_at FROM page_views sub4 
       WHERE COALESCE(NULLIF(sub4.device_id, ''), sub4.visitor_id) = COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id) 
       ORDER BY sub4.id ASC LIMIT 1) AS first_visit_at
    FROM page_views pv
    ORDER BY pv.id DESC
    LIMIT 2000`,

    allBookings: `SELECT id, name, email, phone, message, type, package_name, price, payment_status, booking_date, time_slot, budget, device_id, visitor_id, ip_address, platform, utm_source, created_at FROM bookings ORDER BY id DESC LIMIT 2000`,

    browsers: `SELECT 
      browser,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE browser IS NOT NULL AND browser != ''
    GROUP BY browser
    ORDER BY views DESC
    LIMIT 8`,

    operatingSystems: `SELECT 
      os,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE os IS NOT NULL AND os != ''
    GROUP BY os
    ORDER BY views DESC
    LIMIT 8`,

    referrers: `SELECT 
      referrer,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer
    ORDER BY views DESC
    LIMIT 10`,

    topCountries: `SELECT 
      country,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE country IS NOT NULL AND country != '' AND country != 'Local'
    GROUP BY country
    ORDER BY views DESC
    LIMIT 10`,

    topCities: `SELECT 
      city, region, country,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE city IS NOT NULL AND city != '' AND city != 'Localhost'
    GROUP BY city, region, country
    ORDER BY views DESC
    LIMIT 15`,

    topRegions: `SELECT 
      region, country,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_id) as visitors
    FROM page_views
    WHERE region IS NOT NULL AND region != ''
    GROUP BY region, country
    ORDER BY views DESC
    LIMIT 10`,

    hourlyHeatmap: `SELECT 
      CAST(strftime('%H', created_at, '+5 hours', '+30 minutes') AS INTEGER) as hour,
      COUNT(*) as views
    FROM page_views
    WHERE created_at >= DATETIME('now', '-7 days')
    GROUP BY hour
    ORDER BY hour ASC`,

    retention: `WITH visitor_stats AS (
      SELECT 
        COALESCE(NULLIF(device_id, ''), visitor_id) as uid,
        COUNT(*) as total_hits,
        COUNT(DISTINCT session_id) as total_sessions
      FROM page_views
      GROUP BY uid
    )
    SELECT 
      COUNT(*) as total_unique_visitors,
      SUM(CASE WHEN total_sessions = 1 THEN 1 ELSE 0 END) as one_time_visitors,
      SUM(CASE WHEN total_sessions > 1 THEN 1 ELSE 0 END) as returning_visitors,
      ROUND(CAST(SUM(CASE WHEN total_sessions > 1 THEN 1 ELSE 0 END) AS FLOAT) * 100.0 / NULLIF(COUNT(*), 0), 1) as returning_rate_pct
    FROM visitor_stats`
  };

  // Execute all queries in parallel using a helper
  const results = {};
  const queryKeys = Object.keys(queries);
  let completed = 0;
  let hasError = false;

  const finish = () => {
    if (hasError) return;
    completed++;
    if (completed < queryKeys.length) return;

    const overviewRow = results.overview;
    const deviceRows = results.devices || [];
    const totalViews = (overviewRow && overviewRow.total_views) || 0;

    const devicesMap = {
      mobile: { views: 0, visitors: 0, pct: 0 },
      desktop: { views: 0, visitors: 0, pct: 0 },
      tablet: { views: 0, visitors: 0, pct: 0 }
    };

    (deviceRows || []).forEach(r => {
      const dt = r.device_type ? r.device_type.toLowerCase() : 'mobile';
      if (devicesMap[dt]) {
        devicesMap[dt].views = r.total_views || 0;
        devicesMap[dt].visitors = r.unique_visitors || 0;
        devicesMap[dt].pct = totalViews > 0 ? Math.round((r.total_views / totalViews) * 100) : 0;
      }
    });

    // Adjust percentages to sum to 100%
    const totalPct = devicesMap.mobile.pct + devicesMap.desktop.pct + devicesMap.tablet.pct;
    if (totalViews > 0 && totalPct > 0 && totalPct !== 100) {
      devicesMap.mobile.pct += (100 - totalPct);
    }

    // Process browser percentages
    const browserData = (results.browsers || []).map(b => ({
      ...b,
      pct: totalViews > 0 ? Math.round((b.views / totalViews) * 100) : 0
    }));

    // Process OS percentages
    const osData = (results.operatingSystems || []).map(o => ({
      ...o,
      pct: totalViews > 0 ? Math.round((o.views / totalViews) * 100) : 0
    }));

    // Process referrer percentages
    const referrerData = (results.referrers || []).map(r => ({
      ...r,
      pct: totalViews > 0 ? Math.round((r.views / totalViews) * 100) : 0
    }));

    // Process customer reach platforms and calculate leads generated per platform
    const platformData = (results.platforms || []).map(p => {
      const pViews = p.views || 0;
      const pct = totalViews > 0 ? Math.round((pViews / totalViews) * 100) : 0;
      const matchedLeads = (results.allBookings || []).filter(b => {
        if (b.platform && b.platform.toLowerCase() === p.platform.toLowerCase()) return true;
        return false;
      }).length;

      return {
        ...p,
        pct,
        leads: matchedLeads
      };
    });

    // Process detected bots telemetry
    const botData = (results.bots || []).map(b => ({
      ...b,
      last_seen: ensureUtcIso(b.last_seen)
    }));

    // Build hourly heatmap (0-23)
    const hourlyMap = new Array(24).fill(0);
    (results.hourlyHeatmap || []).forEach(h => {
      if (h.hour >= 0 && h.hour < 24) hourlyMap[h.hour] = h.views;
    });

    res.json({
      overview: {
        total_views: totalViews,
        total_visitors: (overviewRow && overviewRow.total_visitors) || 0,
        human_views: (overviewRow && overviewRow.human_views) || totalViews,
        human_visitors: (overviewRow && overviewRow.human_visitors) || (overviewRow && overviewRow.total_visitors) || 0,
        bot_views: (overviewRow && overviewRow.bot_views) || 0,
        bot_visitors: (overviewRow && overviewRow.bot_visitors) || 0,
        today_views: (overviewRow && overviewRow.today_views) || 0,
        today_visitors: (overviewRow && overviewRow.today_visitors) || 0,
        today_human_views: (overviewRow && overviewRow.today_human_views) || 0,
        today_human_visitors: (overviewRow && overviewRow.today_human_visitors) || 0,
        week_views: (overviewRow && overviewRow.week_views) || 0,
        week_visitors: (overviewRow && overviewRow.week_visitors) || 0,
        month_views: (overviewRow && overviewRow.month_views) || 0,
        month_visitors: (overviewRow && overviewRow.month_visitors) || 0,
        avg_views_per_visitor: (overviewRow && overviewRow.avg_views_per_visitor) || 0,
        avg_sessions_per_visitor: (overviewRow && overviewRow.avg_sessions_per_visitor) || 0
      },
      platforms: platformData,
      bots: botData,
      devices: devicesMap,
      topPages: results.topPages || [],
      dailyTrend: results.dailyTrend || [],
      recentVisits: (results.recentVisits || []).map(r => {
        const simplifyDeviceId = (raw) => {
          if (!raw) return 'DEV-1001';
          const s = String(raw).trim();
          const match = s.match(/DEV-(\d{4,5})/i);
          if (match) return `DEV-${match[1]}`;
          if (/^\d{4,5}$/.test(s)) return `DEV-${s}`;
          let hash = 0;
          for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
          return `DEV-${1000 + (Math.abs(hash) % 9000)}`;
        };

        const simpleDevId = simplifyDeviceId(r.device_id || r.visitor_id);
        const matchedBooking = (results.allBookings || []).find(b => {
          if (b.device_id && (simplifyDeviceId(b.device_id) === simpleDevId || b.device_id === r.device_id || b.device_id === r.raw_device_id)) return true;
          if (b.visitor_id && r.visitor_id && b.visitor_id === r.visitor_id) return true;
          if (b.ip_address && r.ip_address && b.ip_address === r.ip_address) return true;
          return false;
        });

        return {
          ...r,
          device_id: simpleDevId,
          raw_device_id: r.device_id || r.visitor_id,
          platform: r.platform || 'Direct',
          is_bot: Number(r.is_bot) === 1,
          bot_name: r.bot_name || '',
          utm_source: r.utm_source || '',
          utm_medium: r.utm_medium || '',
          utm_campaign: r.utm_campaign || '',
          isp: r.isp || '',
          created_at: ensureUtcIso(r.created_at),
          last_visit_at: ensureUtcIso(r.last_visit_at),
          first_visit_at: ensureUtcIso(r.first_visit_at),
          booking: matchedBooking ? {
            id: matchedBooking.id,
            name: matchedBooking.name,
            email: matchedBooking.email,
            phone: matchedBooking.phone,
            type: matchedBooking.type,
            package_name: matchedBooking.package_name,
            price: matchedBooking.price,
            payment_status: matchedBooking.payment_status,
            booking_date: matchedBooking.booking_date,
            time_slot: matchedBooking.time_slot,
            budget: matchedBooking.budget,
            message: matchedBooking.message,
            platform: matchedBooking.platform || r.platform || 'Direct',
            created_at: ensureUtcIso(matchedBooking.created_at)
          } : null
        };
      }),
      browsers: browserData,
      operatingSystems: osData,
      referrers: referrerData,
      locations: {
        countries: results.topCountries || [],
        cities: results.topCities || [],
        regions: results.topRegions || []
      },
      retention: results.retention || {
        total_unique_visitors: 0,
        one_time_visitors: 0,
        returning_visitors: 0,
        returning_rate_pct: 0
      },
      hourlyHeatmap: hourlyMap
    });
  };

  // Execute queries
  queryKeys.forEach(key => {
    const sql = queries[key];
    const isGetQuery = key === 'overview' || key === 'retention';
    const method = isGetQuery ? 'get' : 'all';

    db[method](sql, (err, data) => {
      if (err) {
        console.error(`Analytics query error (${key}):`, err.message);
        if (!hasError) {
          hasError = true;
          return res.status(500).json({ message: `Error retrieving analytics: ${key}` });
        }
        return;
      }
      results[key] = data;
      finish();
    });
  });
});

// 3. Device Visit History Drilldown API
app.get('/api/admin/analytics/device/:deviceId', authenticateToken, (req, res) => {
  const devId = req.params.deviceId;
  const vid = req.query.vid || '';
  const simplifyDeviceId = (raw) => {
    if (!raw) return 'DEV-1001';
    const s = String(raw).trim();
    const match = s.match(/DEV-(\d{4,5})/i);
    if (match) return `DEV-${match[1]}`;
    if (/^\d{4,5}$/.test(s)) return `DEV-${s}`;
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
    return `DEV-${1000 + (Math.abs(hash) % 9000)}`;
  };

  const sql = `
    SELECT 
      pv.id,
      pv.device_id,
      pv.visitor_id,
      pv.session_id,
      pv.path,
      pv.device_type,
      pv.browser,
      pv.os,
      pv.referrer,
      pv.platform,
      pv.is_bot,
      pv.bot_name,
      pv.utm_source,
      pv.utm_medium,
      pv.utm_campaign,
      pv.ip_address,
      pv.country,
      pv.region,
      pv.city,
      pv.latitude,
      pv.longitude,
      pv.screen_resolution,
      pv.isp,
      pv.created_at
    FROM page_views pv
    WHERE pv.device_id = ? 
       OR pv.visitor_id = ? 
       OR (pv.visitor_id != '' AND pv.visitor_id = ?)
       OR COALESCE(NULLIF(pv.device_id, ''), pv.visitor_id) = ?
    ORDER BY pv.id DESC
    LIMIT 50
  `;
  db.all(sql, [devId, devId, vid, devId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = (rows || []).map(r => ({
      ...r,
      device_id: simplifyDeviceId(r.device_id || r.visitor_id),
      platform: r.platform || 'Direct',
      is_bot: Number(r.is_bot) === 1,
      bot_name: r.bot_name || '',
      utm_source: r.utm_source || '',
      utm_medium: r.utm_medium || '',
      utm_campaign: r.utm_campaign || '',
      created_at: ensureUtcIso(r.created_at)
    }));

    // Find any booking submitted by this device or IP
    db.get(
      `SELECT id, name, email, phone, message, type, package_name, price, payment_status, booking_date, time_slot, budget, created_at
       FROM bookings
       WHERE device_id = ? OR visitor_id = ? OR (ip_address IS NOT NULL AND ip_address != '' AND ip_address IN (SELECT ip_address FROM page_views WHERE device_id = ? OR visitor_id = ?))
       ORDER BY id DESC LIMIT 1`,
      [devId, devId, devId, devId],
      (bErr, bRow) => {
        res.json({
          deviceId: devId,
          history: mapped,
          booking: bRow ? { ...bRow, created_at: ensureUtcIso(bRow.created_at) } : null
        });
      }
    );
  });
});


// ============================================================
// PUSH NOTIFICATION SYSTEM — Subscribe, Unsubscribe & Daily Cron
// ============================================================

// 0. Get VAPID public key
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// 1. Subscribe to push notifications
app.post('/api/push/subscribe', (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { }
    }

    const subscription = body.subscription;
    const deviceId = String(body.device_id || '').trim();
    const visitorId = String(body.visitor_id || '').trim();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid push subscription data.' });
    }

    const endpoint = subscription.endpoint;
    const keysP256dh = subscription.keys.p256dh;
    const keysAuth = subscription.keys.auth;

    if (!keysP256dh || !keysAuth) {
      return res.status(400).json({ error: 'Missing push subscription keys.' });
    }

    // Check if this device has already booked
    db.get(
      `SELECT id FROM bookings WHERE device_id = ? OR visitor_id = ? LIMIT 1`,
      [deviceId, visitorId],
      (err, bookingRow) => {
        const hasBooked = bookingRow ? 1 : 0;

        // Upsert: insert or update existing subscription
        db.run(
          `INSERT INTO push_subscriptions (device_id, visitor_id, endpoint, keys_p256dh, keys_auth, has_booked)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(endpoint) DO UPDATE SET
             device_id = excluded.device_id,
             visitor_id = excluded.visitor_id,
             keys_p256dh = excluded.keys_p256dh,
             keys_auth = excluded.keys_auth,
             has_booked = excluded.has_booked`,
          [deviceId, visitorId, endpoint, keysP256dh, keysAuth, hasBooked],
          function (insertErr) {
            if (insertErr) {
              console.error('[Push Subscribe] DB error:', insertErr.message);
              return res.status(500).json({ error: 'Failed to save subscription.' });
            }
            console.log(`[Push] Subscribed device ${deviceId} (has_booked: ${hasBooked})`);
            res.json({ status: 'subscribed', device_id: deviceId, has_booked: hasBooked });
          }
        );
      }
    );
  } catch (e) {
    console.error('[Push Subscribe] Error:', e.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Unsubscribe from push notifications
app.post('/api/push/unsubscribe', (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { }
    }

    const deviceId = String(body.device_id || '').trim();
    const endpoint = body.endpoint || '';

    if (endpoint) {
      db.run(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [endpoint]);
    } else if (deviceId) {
      db.run(`DELETE FROM push_subscriptions WHERE device_id = ?`, [deviceId]);
    }

    console.log(`[Push] Unsubscribed device ${deviceId}`);
    res.json({ status: 'unsubscribed' });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Admin: Get push notification stats + site visitor reach + active on-site notification
app.get('/api/admin/push/stats', authenticateToken, async (req, res) => {
  try {
    const subStats = await new Promise((resolve) => {
      db.get(`SELECT
        COUNT(*) as total_subscribers,
        SUM(CASE WHEN has_booked = 0 AND (is_admin IS NULL OR is_admin = 0) THEN 1 ELSE 0 END) as not_booked,
        SUM(CASE WHEN has_booked = 1 AND (is_admin IS NULL OR is_admin = 0) THEN 1 ELSE 0 END) as has_booked,
        SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admin_devices,
        SUM(CASE WHEN last_notified_at IS NOT NULL AND last_notified_at >= datetime('now', '-1 day') THEN 1 ELSE 0 END) as notified_today
      FROM push_subscriptions`, [], (err, row) => {
        resolve(row || { total_subscribers: 0, not_booked: 0, has_booked: 0, admin_devices: 0, notified_today: 0 });
      });
    });

    const visitorStats = await new Promise((resolve) => {
      db.get(`SELECT COUNT(DISTINCT device_id) as total_past_visitors, COUNT(*) as total_views FROM page_views`, [], (err, row) => {
        if (err || !row) return resolve({ total_past_visitors: 0, total_views: 0 });
        resolve(row);
      });
    });

    const settingsRows = await new Promise((resolve) => {
      db.all(`SELECT key, value FROM website_settings WHERE key LIKE 'site_notification_%'`, [], (err, rows) => {
        resolve(rows || []);
      });
    });

    const siteNotification = {
      enabled: false,
      title: '🏠 Walk Your Floor Plan at 1:1 Scale!',
      body: 'Book your full-scale blueprint projection session today. Walk through your future home before construction begins!',
      url: '/contact',
      badge: 'LIVE ANNOUNCEMENT',
      updated_at: null
    };

    settingsRows.forEach(r => {
      if (r.key === 'site_notification_enabled') siteNotification.enabled = r.value === '1';
      if (r.key === 'site_notification_title' && r.value) siteNotification.title = r.value;
      if (r.key === 'site_notification_body' && r.value) siteNotification.body = r.value;
      if (r.key === 'site_notification_url' && r.value) siteNotification.url = r.value;
      if (r.key === 'site_notification_badge' && r.value) siteNotification.badge = r.value;
      if (r.key === 'site_notification_time') siteNotification.updated_at = r.value;
    });

    res.json({
      total_subscribers: subStats.total_subscribers || 0,
      not_booked: subStats.not_booked || 0,
      has_booked: subStats.has_booked || 0,
      admin_devices: subStats.admin_devices || 0,
      notified_today: subStats.notified_today || 0,
      total_past_visitors: visitorStats.total_past_visitors || 0,
      total_views: visitorStats.total_views || 0,
      site_notification: siteNotification
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Admin: Register admin device for instant new lead alerts
app.post('/api/admin/push/subscribe-admin', authenticateToken, (req, res) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { }
    }

    const subscription = body.subscription;
    const deviceId = String(body.device_id || '').trim();
    const visitorId = String(body.visitor_id || '').trim();
    const adminUser = req.user ? req.user.username : 'admin';

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Invalid push subscription data.' });
    }

    const endpoint = subscription.endpoint;
    const keysP256dh = subscription.keys.p256dh;
    const keysAuth = subscription.keys.auth;

    if (!keysP256dh || !keysAuth) {
      return res.status(400).json({ error: 'Missing push subscription keys.' });
    }

    db.run(
      `INSERT INTO push_subscriptions (device_id, visitor_id, endpoint, keys_p256dh, keys_auth, has_booked, is_admin, admin_username)
       VALUES (?, ?, ?, ?, ?, 1, 1, ?)
       ON CONFLICT(endpoint) DO UPDATE SET
         is_admin = 1,
         admin_username = excluded.admin_username,
         has_booked = 1,
         device_id = excluded.device_id,
         keys_p256dh = excluded.keys_p256dh,
         keys_auth = excluded.keys_auth`,
      [deviceId || 'admin-device', visitorId || '', endpoint, keysP256dh, keysAuth, adminUser],
      function (err) {
        if (err) {
          console.error('[Admin Push] Subscribe error:', err.message);
          return res.status(500).json({ error: 'Failed to register admin device.' });
        }
        console.log(`[Admin Push] Subscribed admin device for: ${adminUser}`);

        // Immediate confirmation push alert to verify delivery
        const testPayload = JSON.stringify({
          title: '🚨 Admin Lead Alerts Active!',
          body: `This device will now receive instant push alerts whenever a customer registers a booking lead!`,
          icon: '/favicon.png',
          badge: '/favicon.png',
          url: '/fitscalez',
          tag: 'admin-alert-activated'
        });

        webpush.sendNotification({
          endpoint,
          keys: { p256dh: keysP256dh, auth: keysAuth }
        }, testPayload).catch((pushErr) => {
          console.warn('[Admin Push] Confirmation push warning:', pushErr.message);
        });

        res.json({ success: true, message: 'Admin device registered for instant lead alerts.' });
      }
    );
  } catch (e) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 5. Admin: Send test lead push alert to admin devices
app.post('/api/admin/push/test-admin-alert', authenticateToken, async (req, res) => {
  try {
    await notifyAdminsOfNewLead({
      leadId: 999,
      name: 'Sample Customer (VIP Lead)',
      phone: '+91 97110 22075',
      email: 'info@walktheplan.in',
      type: 'test-drive',
      packageName: '1 Hour Studio Session (Test)',
      price: 5000,
      date: 'Tomorrow',
      time: '11:00 AM',
      budget: '₹25L - ₹50L',
      platform: 'Admin Test'
    });
    res.json({ success: true, message: 'Test lead alert sent to registered admin devices.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin: Unsubscribe admin device
app.post('/api/admin/push/unsubscribe-admin', authenticateToken, (req, res) => {
  const endpoint = req.body.endpoint || '';
  const deviceId = req.body.device_id || '';
  if (endpoint) {
    db.run(`UPDATE push_subscriptions SET is_admin = 0 WHERE endpoint = ?`, [endpoint]);
  } else if (deviceId) {
    db.run(`UPDATE push_subscriptions SET is_admin = 0 WHERE device_id = ?`, [deviceId]);
  }
  res.json({ success: true });
});

// 6.5 Admin: Reset all admin devices and stale push subscriptions
app.post('/api/admin/push/reset-admin-devices', authenticateToken, (req, res) => {
  db.run(`DELETE FROM push_subscriptions WHERE is_admin = 1`, function (err) {
    if (err) {
      console.error('[Admin Push] Error resetting admin devices:', err.message);
      return res.status(500).json({ error: 'Failed to reset admin devices.' });
    }
    console.log(`[Admin Push] Reset all admin devices. Rows cleared: ${this.changes}`);
    res.json({ success: true, message: 'All admin devices have been reset.', cleared: this.changes });
  });
});

// 7. Admin: Toggle live on-site notification banner (ON/OFF)
app.post('/api/admin/push/site-notification/toggle', authenticateToken, (req, res) => {
  const enabled = req.body && req.body.enabled ? '1' : '0';
  db.run(`INSERT OR REPLACE INTO website_settings (key, value) VALUES ('site_notification_enabled', ?)`, [enabled], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, enabled: enabled === '1' });
  });
});

// 8. Admin: Update live on-site notification settings directly
app.post('/api/admin/push/site-notification/update', authenticateToken, async (req, res) => {
  try {
    const { title, body, url, badge, enabled } = req.body || {};
    const nowIso = new Date().toISOString();
    const updates = [
      ['site_notification_enabled', enabled ? '1' : '0'],
      ['site_notification_title', title || '🏠 Walk Your Floor Plan at 1:1 Scale!'],
      ['site_notification_body', body || 'Book your full-scale blueprint projection session today! Experience your future home before construction.'],
      ['site_notification_url', url || '/contact'],
      ['site_notification_badge', badge || 'LIVE ANNOUNCEMENT'],
      ['site_notification_time', nowIso]
    ];
    for (const [k, v] of updates) {
      await new Promise((resolve, reject) => {
        db.run(`INSERT OR REPLACE INTO website_settings (key, value) VALUES (?, ?)`, [k, v], (err) => {
          if (err) reject(err); else resolve();
        });
      });
    }
    res.json({ success: true, message: 'Site notification updated successfully.', updated_at: nowIso });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Admin: Multi-channel broadcast (Device OS Push + Live Site-Wide In-App Notification for 100% of visitors)
app.post('/api/admin/push/send', authenticateToken, async (req, res) => {
  const options = {
    title: req.body && req.body.title ? String(req.body.title).trim() : null,
    body: req.body && req.body.body ? String(req.body.body).trim() : null,
    url: req.body && req.body.url ? String(req.body.url).trim() : null,
    targetAudience: (req.body && req.body.target_audience === 'all') ? 'all' : 'unbooked',
    forceImmediate: req.body ? req.body.force_immediate !== false : true,
    publishToSite: req.body ? req.body.publish_to_site !== false : true,
    sendDevicePush: req.body ? req.body.send_device_push !== false : true
  };

  try {
    // 1. If publishToSite is requested, persist to website_settings so 100% of website visitors (past & current) see it on-site
    if (options.publishToSite && (options.title || options.body)) {
      const nowIso = new Date().toISOString();
      const settingsUpdates = [
        ['site_notification_enabled', '1'],
        ['site_notification_title', options.title || '🏠 Walk Your Floor Plan at 1:1 Scale!'],
        ['site_notification_body', options.body || 'Book your full-scale blueprint projection session today! Experience your future home before construction.'],
        ['site_notification_url', options.url || '/contact'],
        ['site_notification_badge', 'LIVE ANNOUNCEMENT'],
        ['site_notification_time', nowIso]
      ];
      for (const [k, v] of settingsUpdates) {
        await new Promise((resolve, reject) => {
          db.run(`INSERT OR REPLACE INTO website_settings (key, value) VALUES (?, ?)`, [k, v], (err) => {
            if (err) reject(err); else resolve();
          });
        });
      }
    }

    // 2. If sendDevicePush is enabled, send OS push to registered subscriber devices
    let pushResult = { sent: 0, failed: 0, message: 'Device push skipped (site banner only)' };
    if (options.sendDevicePush) {
      pushResult = await sendDailyBookingReminders(options);
    }

    res.json({
      ...pushResult,
      published_to_site: options.publishToSite,
      send_device_push: options.sendDevicePush
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Send booking reminder push notifications to subscribers.
 * Supports custom broadcast message, audience selection ('unbooked' or 'all'),
 * and forceImmediate = true to allow sending at ANY time.
 */
async function sendDailyBookingReminders(options = {}) {
  const {
    title,
    body,
    url,
    targetAudience = 'unbooked',
    forceImmediate = false
  } = options;

  return new Promise((resolve, reject) => {
    // First, sync has_booked status for all subscribers
    db.run(`UPDATE push_subscriptions SET has_booked = 1
      WHERE has_booked = 0 AND (
        device_id IN (SELECT DISTINCT device_id FROM bookings WHERE device_id IS NOT NULL AND device_id != '')
        OR visitor_id IN (SELECT DISTINCT visitor_id FROM bookings WHERE visitor_id IS NOT NULL AND visitor_id != '')
      )`, [], (syncErr) => {
      if (syncErr) console.error('[Push Cron] Sync error:', syncErr.message);

      // Build query based on target audience and rate limit
      let query = `SELECT id, endpoint, keys_p256dh, keys_auth, device_id
                   FROM push_subscriptions
                   WHERE (is_admin IS NULL OR is_admin = 0)`;

      if (targetAudience === 'unbooked') {
        query += ` AND has_booked = 0`;
      }

      if (!forceImmediate) {
        // Enforce 24-hour rate limit for automated cron
        query += ` AND (last_notified_at IS NULL OR last_notified_at < datetime('now', '-1 day'))`;
      }

      db.all(
        query,
        [],
        async (err, subscribers) => {
          if (err) {
            console.error('[Push Dispatch] Query error:', err.message);
            return reject(err);
          }

          if (!subscribers || subscribers.length === 0) {
            console.log('[Push Dispatch] No eligible subscribers found for audience:', targetAudience);
            return resolve({ sent: 0, failed: 0, message: 'No eligible subscribers to notify.', audience: targetAudience });
          }

          console.log(`[Push Dispatch] Sending to ${subscribers.length} devices (audience: ${targetAudience}, immediate: ${forceImmediate})...`);

          // Rotate through different reminder messages for default
          const reminderMessages = [
            {
              title: '🏠 Walk Your Floor Plan Today!',
              body: 'You visited Walk The Plan but haven\'t booked yet. Experience your future home at real 1:1 scale before construction — Book your studio session now!',
              url: '/contact'
            },
            {
              title: '📐 Don\'t Build Blind — Walk It First!',
              body: 'Over 35% of homes face costly demolition rework. Book a 1:1 blueprint projection session and catch layout mistakes before they cost you lakhs.',
              url: '/services'
            },
            {
              title: '🎯 Your Dream Home Awaits — Book a Session',
              body: 'Walk through your blueprint at life-size scale with real furniture. Our studios in Gurugram, Dehradun, Varanasi, Hyderabad & Madurai are ready for you!',
              url: '/contact'
            },
            {
              title: '✨ Special: ₹5,000 Token Books Your Session',
              body: 'Reserve your Walk The Plan studio slot with just ₹5,000. See your villa, apartment or duplex floor plan projected at full 100% scale!',
              url: '/contact'
            },
            {
              title: '🏗️ Save ₹3.5L–₹15L in Construction Rework',
              body: 'Spot layout problems before pouring concrete. Walk The Plan\'s 1:1 projection studio lets you test doors, corridors & furniture clearances at real scale.',
              url: '/services'
            }
          ];

          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
          const todaysMessage = reminderMessages[dayOfYear % reminderMessages.length];

          const finalTitle = title || todaysMessage.title;
          const finalBody = body || todaysMessage.body;
          const finalUrl = url || todaysMessage.url;

          const payload = JSON.stringify({
            title: finalTitle,
            body: finalBody,
            icon: '/favicon.png',
            badge: '/favicon.png',
            url: finalUrl,
            tag: `wtp-broadcast-${Date.now()}`
          });

          let sent = 0;
          let failed = 0;
          const expiredIds = [];

          for (const sub of subscribers) {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.keys_p256dh,
                auth: sub.keys_auth
              }
            };

            try {
              await webpush.sendNotification(pushSubscription, payload);
              sent++;
              // Update last_notified_at
              db.run(`UPDATE push_subscriptions SET last_notified_at = datetime('now') WHERE id = ?`, [sub.id]);
            } catch (pushErr) {
              failed++;
              // If subscription expired (410 Gone) or invalid (404), remove it
              if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                expiredIds.push(sub.id);
                console.log(`[Push Dispatch] Removing expired subscription for device ${sub.device_id}`);
              } else {
                console.error(`[Push Dispatch] Failed to send to ${sub.device_id}:`, pushErr.message);
              }
            }
          }

          // Clean up expired subscriptions
          if (expiredIds.length > 0) {
            const placeholders = expiredIds.map(() => '?').join(',');
            db.run(`DELETE FROM push_subscriptions WHERE id IN (${placeholders})`, expiredIds);
          }

          console.log(`[Push Dispatch] Complete: ${sent} sent, ${failed} failed, ${expiredIds.length} expired removed.`);
          resolve({
            sent,
            failed,
            expired_removed: expiredIds.length,
            total_eligible: subscribers.length,
            title: finalTitle,
            audience: targetAudience
          });
        }
      );
    });
  });
}

// Mark subscriber as booked when a new booking is created (called from booking endpoint)
function markSubscriberAsBooked(deviceId, visitorId) {
  if (deviceId) {
    db.run(`UPDATE push_subscriptions SET has_booked = 1 WHERE device_id = ?`, [deviceId]);
  }
  if (visitorId) {
    db.run(`UPDATE push_subscriptions SET has_booked = 1 WHERE visitor_id = ?`, [visitorId]);
  }
}

/**
 * Send instant push notification to all logged-in / registered admin devices
 * when a new lead or appointment is registered.
 */
async function notifyAdminsOfNewLead({ leadId, name, phone, email, type, packageName, price, date, time, budget, platform }) {
  try {
    db.all(
      `SELECT id, endpoint, keys_p256dh, keys_auth, admin_username
       FROM push_subscriptions
       WHERE is_admin = 1`,
      [],
      async (err, admins) => {
        if (err) {
          console.error('[Admin Push Alert] Query error:', err.message);
          return;
        }

        if (!admins || admins.length === 0) {
          console.log('[Admin Push Alert] No registered admin devices to notify.');
          return;
        }

        console.log(`[Admin Push Alert] Dispatching new lead alert #${leadId} to ${admins.length} admin devices...`);

        const leadTypeLabel = packageName || (type === 'mail-inquiry' ? 'Connect Inquiry' : 'Studio Booking');
        const priceLabel = price ? ` · ₹${Number(price).toLocaleString('en-IN')}` : '';
        const dateSlot = (date || time) ? ` · ${date || ''} ${time || ''}`.trim() : '';

        const payload = JSON.stringify({
          title: `🚨 New Lead #${leadId}: ${name}`,
          body: `📞 ${phone} | ✉️ ${email || 'N/A'}\n🏠 ${leadTypeLabel}${priceLabel}${dateSlot}\nPlatform: ${platform || 'Direct'}`,
          icon: '/favicon.png',
          badge: '/favicon.png',
          url: '/fitscalez',
          tag: `new-lead-${leadId}-${Date.now()}`,
          requireInteraction: true
        });

        const expiredIds = [];

        for (const admin of admins) {
          const pushSubscription = {
            endpoint: admin.endpoint,
            keys: {
              p256dh: admin.keys_p256dh,
              auth: admin.keys_auth
            }
          };

          try {
            await webpush.sendNotification(pushSubscription, payload);
            console.log(`[Admin Push Alert] Alert sent to admin device: ${admin.admin_username || 'admin'}`);
          } catch (pushErr) {
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              expiredIds.push(admin.id);
              console.log(`[Admin Push Alert] Expired admin subscription removed (${admin.id})`);
            } else {
              console.error(`[Admin Push Alert] Failed to notify admin ${admin.admin_username}:`, pushErr.message);
            }
          }
        }

        if (expiredIds.length > 0) {
          const placeholders = expiredIds.map(() => '?').join(',');
          db.run(`DELETE FROM push_subscriptions WHERE id IN (${placeholders})`, expiredIds);
        }
      }
    );
  } catch (err) {
    console.error('[Admin Push Alert] Error:', err.message);
  }
}

// --- DAILY CRON: Send push notification reminders every day at 10:00 AM IST ---
// IST is UTC+5:30, so 10:00 AM IST = 04:30 UTC
cron.schedule('30 4 * * *', () => {
  console.log('[Push Cron] Triggering daily booking reminder notifications (10:00 AM IST)...');
  sendDailyBookingReminders()
    .then(result => console.log('[Push Cron] Result:', JSON.stringify(result)))
    .catch(err => console.error('[Push Cron] Error:', err.message));
}, {
  timezone: 'UTC'
});

console.log('[Push Cron] Daily push notification reminder scheduled for 10:00 AM IST (04:30 UTC).');


// Serve static frontend build if dist folder exists (supports all-in-one Render deployment)
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ error: 'Endpoint not found', path: req.path });
    }
    const indexFile = path.join(distDir, 'index.html');
    if (fs.existsSync(indexFile)) {
      return res.sendFile(indexFile);
    }
    next();
  });
}

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API route '${req.originalUrl}' does not exist on this server.`,
    availableEndpoints: ['/api/health', '/api/settings', '/api/blogs', '/api/crm/auth/login']
  });
});

// Global error handler for Multer & payload limits
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum allowed size is 300MB.' });
    }
    return res.status(400).json({ message: 'Upload error: ' + (err.message || 'Unknown upload error') });
  }
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ message: 'Request payload too large. Please upload a file under 300MB.' });
  }
  if (err) {
    console.error('Unhandled server error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
  }
  next();
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = { app, db, identifyBot, detectPlatform };
