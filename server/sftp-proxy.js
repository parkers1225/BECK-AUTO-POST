/**
 * SFTP Proxy Server
 * Fetches CSV files from SFTP server and serves them via HTTP
 * Supports multi-store configuration
 */

const express = require('express');
const Client = require('ssh2-sftp-client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http');
const https = require('https');
const { URL } = require('url');
const users = require('./users');

// Cache TTL in milliseconds (default: 5 minutes)
const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_MINUTES || '5') * 60 * 1000;

// Allowed origins for CORS (comma-separated, default: * for backward compat)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null;

// Allowed domains for image proxy (prevents SSRF)
const IMAGE_PROXY_ALLOWED_DOMAINS = [
  'vehicle-photos-published.vauto.com',
  'vehicle-photos.vauto.com',
  'photos.vauto.com',
  'vauto.com',
  'assets.cai-media-management.com',
  'cai-media-management.com',
];

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (ALLOWED_ORIGINS) {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    // If origin is not in the list, don't set the header (browser will block)
  } else {
    // No restriction configured — allow all (backward compatible)
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '256kb' }));

if (!ALLOWED_ORIGINS) {
  console.warn('⚠️  CORS is open to all origins. Set ALLOWED_ORIGINS env var to restrict.');
}

// Load configuration from config.json file (supports multi-store)
let config = {};

try {
  const configPath = path.join(__dirname, 'config.json');
  if (process.env.STORES_CONFIG) {
    // Multi-store config from environment (preferred in production —
    // no config file needs to ship inside the image)
    config = { stores: JSON.parse(process.env.STORES_CONFIG), server: {} };
    Object.keys(config.stores).forEach(storeId => {
      const st = config.stores[storeId];
      st.sftp = st.sftp || {};
      st.sftp.host = process.env.SFTP_HOST || st.sftp.host;
      st.sftp.port = parseInt(process.env.SFTP_PORT) || st.sftp.port || 22;
      st.sftp.username = process.env.SFTP_USERNAME || st.sftp.username;
      st.sftp.password = process.env.SFTP_PASSWORD || st.sftp.password;
    });
    console.log(`✅ Loaded ${Object.keys(config.stores).length}-store configuration from STORES_CONFIG env`);
  } else if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Ensure config.server exists
    config.server = config.server || {};

    // If environment variables are set, override SFTP credentials for all stores
    if (process.env.SFTP_HOST) {
      // Override SFTP credentials in all stores
      if (config.stores) {
        // Multi-store configuration
        Object.keys(config.stores).forEach(storeId => {
          if (config.stores[storeId].sftp) {
            config.stores[storeId].sftp.host = process.env.SFTP_HOST || config.stores[storeId].sftp.host;
            config.stores[storeId].sftp.port = parseInt(process.env.SFTP_PORT) || config.stores[storeId].sftp.port || 22;
            config.stores[storeId].sftp.username = process.env.SFTP_USERNAME || config.stores[storeId].sftp.username;
            config.stores[storeId].sftp.password = process.env.SFTP_PASSWORD || config.stores[storeId].sftp.password;
          }
        });
        console.log('✅ Loaded multi-store configuration with environment variable overrides');
      } else if (config.sftp) {
        // Single-store configuration
        config.sftp.host = process.env.SFTP_HOST || config.sftp.host;
        config.sftp.port = parseInt(process.env.SFTP_PORT) || config.sftp.port || 22;
        config.sftp.username = process.env.SFTP_USERNAME || config.sftp.username;
        config.sftp.password = process.env.SFTP_PASSWORD || config.sftp.password;
        config.sftp.path = process.env.SFTP_PATH || config.sftp.path;
        console.log('✅ Loaded single-store configuration with environment variable overrides');
      }
    } else {
      console.log('✅ Loaded configuration from config.json (no environment variable overrides)');
    }
  } else {
    // No config.json, try environment variables for single store
    if (process.env.SFTP_HOST) {
      config = {
        sftp: {
          host: process.env.SFTP_HOST,
          port: parseInt(process.env.SFTP_PORT) || 22,
          username: process.env.SFTP_USERNAME,
          password: process.env.SFTP_PASSWORD,
          path: process.env.SFTP_PATH || '/MP15932.csv'
        },
        server: {
          port: PORT,
          apiKey: process.env.API_KEY || ''
        }
      };
      console.log('✅ Loaded single-store configuration from environment variables');
    } else {
      console.warn('⚠️  No config.json found and no environment variables set. Using defaults.');
      config = {
        sftp: {
          host: 'sftp.transfer.vauto.com',
          port: 22,
          username: '',
          password: '',
          path: '/MP15932.csv'
        },
        server: {
          port: PORT,
          apiKey: ''
        }
      };
    }
  }
} catch (error) {
  console.error('❌ Error loading config:', error.message);
  process.exit(1);
}

// Ensure config.server always exists (defensive)
config.server = config.server || {};

// Determine if multi-store or single-store
const isMultiStore = config.stores !== undefined;
let stores = {};

if (isMultiStore) {
  stores = config.stores;
} else {
  // Create single store from config
  stores = {
    'default': {
      name: 'Default Store',
      sftp: config.sftp,
      apiKey: config.server.apiKey
    }
  };
}

// Cache for CSV files (per store)
const csvCache = {};

// Initialize cache for each store
Object.keys(stores).forEach(storeId => {
  csvCache[storeId] = {
    content: null,
    hash: null,
    lastFetch: null,
    lastModified: null,
    size: 0
  };
});

/**
 * Calculate SHA256 hash of content
 */
function calculateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Check if the cache for a store is still fresh
 */
function isCacheFresh(storeId) {
  const cache = csvCache[storeId];
  if (!cache || !cache.content || !cache.lastFetch) return false;
  const age = Date.now() - cache.lastFetch.getTime();
  return age < CACHE_TTL_MS;
}

/**
 * Fetch CSV from SFTP for a specific store
 */
async function fetchCSVFromSFTP(storeId) {
  const store = stores[storeId];
  if (!store) {
    throw new Error(`Store ${storeId} not found`);
  }

  const sftpConfig = store.sftp;
  const sftp = new Client();

  try {
    console.log(`📌 Connecting to SFTP: ${sftpConfig.host} for store ${storeId}...`);
    await sftp.connect({
      host: sftpConfig.host,
      port: parseInt(sftpConfig.port) || 22,
      username: sftpConfig.username,
      password: sftpConfig.password
    });

    console.log(`📥 Fetching CSV: ${sftpConfig.path} for store ${storeId}...`);
    const csvContent = await sftp.get(sftpConfig.path);
    
    // Convert to string if it's a Buffer
    const csvString = Buffer.isBuffer(csvContent) ? csvContent.toString('utf8') : csvContent;
    
    // Get file stats
    let stats = {};
    try {
      stats = await sftp.stat(sftpConfig.path);
    } catch (statError) {
      console.warn(`⚠️  Could not get file stats for ${sftpConfig.path}:`, statError.message);
    }

    const hash = calculateHash(csvString);
    const now = new Date();

    // Update cache
    csvCache[storeId] = {
      content: csvString,
      hash: hash,
      lastFetch: now,
      lastModified: stats.modifyTime ? (typeof stats.modifyTime === 'number' ? new Date(stats.modifyTime) : stats.modifyTime) : now,
      size: stats.size || csvString.length
    };

    console.log(`✅ CSV fetched successfully for store ${storeId} (${csvString.length} bytes)`);
    return csvString;
  } catch (error) {
    console.error(`❌ Error fetching CSV for store ${storeId}:`, error.message);
    throw error;
  } finally {
    // Always close the SFTP connection, even if stat() or other operations fail
    try {
      await sftp.end();
    } catch (endError) {
      // Ignore close errors
    }
  }
}

/**
 * Verify API key
 */
function verifyApiKey(req, storeId) {
  const store = stores[storeId];
  if (!store) return false;

  // Get API key from query parameter or header
  const apiKey = req.query.apiKey || req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  // Check store-specific API key or global API key
  const storeApiKey = store.apiKey || config.server.apiKey;
  
  if (!storeApiKey) {
    // No API key configured, allow access
    return true;
  }

  return apiKey === storeApiKey;
}

// Fetch (if stale) and send a store's CSV with change-detection headers.
// Shared by the legacy /csv/:storeId route and the code-authed /feed route.
async function serveStoreCsv(res, storeId) {
  if (!isCacheFresh(storeId)) {
    try {
      await fetchCSVFromSFTP(storeId);
    } catch (error) {
      console.error(`Failed to fetch CSV for ${storeId}:`, error.message);
      if (csvCache[storeId].content) {
        console.log(`Using stale cached CSV for ${storeId}`);
      } else {
        return res.status(500).json({ error: 'Failed to fetch CSV from SFTP', message: error.message });
      }
    }
  }
  const cache = csvCache[storeId];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('X-CSV-Hash', cache.hash || '');
  res.setHeader('X-CSV-Last-Modified', (cache.lastModified instanceof Date ? cache.lastModified.toISOString() : (cache.lastModified ? new Date(cache.lastModified).toISOString() : '')));
  res.setHeader('X-CSV-Last-Fetch', cache.lastFetch?.toISOString() || '');
  res.setHeader('X-CSV-Size', cache.size || 0);
  res.setHeader('X-CSV-Cached', isCacheFresh(storeId) ? 'true' : 'false');
  res.send(cache.content);
}

// Health check endpoint (no authentication)
app.get('/health', (req, res) => {
  const storeList = Object.keys(stores).map(storeId => ({
    id: storeId,
    name: stores[storeId].name || storeId,
    available: csvCache[storeId].content !== null
  }));

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stores: storeList,
    multiStore: isMultiStore,
    aiConfigured: !!ANTHROPIC_API_KEY,   // boolean only — never exposes the key
    aiModel: ANTHROPIC_MODEL
  });
});

// List all stores
app.get('/stores', (req, res) => {
  const storeList = Object.keys(stores).map(storeId => ({
    id: storeId,
    name: stores[storeId].name || storeId,
    endpoint: `/csv/${storeId}`,
    available: csvCache[storeId].content !== null,
    lastFetch: csvCache[storeId].lastFetch
  }));

  res.json({
    stores: storeList,
    count: storeList.length
  });
});

// Get CSV for specific store
app.get('/csv/:storeId', async (req, res) => {
  const storeId = req.params.storeId;

  if (!stores[storeId]) {
    return res.status(404).json({ error: `Store ${storeId} not found` });
  }

  // Verify API key (legacy access path)
  if (!verifyApiKey(req, storeId)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or missing API key' });
  }

  return serveStoreCsv(res, storeId);
});

// Get CSV status for specific store
app.get('/csv/:storeId/status', (req, res) => {
  const storeId = req.params.storeId;

  if (!stores[storeId]) {
    return res.status(404).json({ error: `Store ${storeId} not found` });
  }

  const cache = csvCache[storeId];

  res.json({
    available: cache.content !== null,
    lastFetch: cache.lastFetch,
    lastModified: cache.lastModified,
    hash: cache.hash,
    size: cache.size,
    cached: cache.content !== null,
    cacheFresh: isCacheFresh(storeId),
    cacheTtlMinutes: CACHE_TTL_MS / 60000
  });
});

// Legacy endpoint for single-store (backward compatibility)
app.get('/csv', async (req, res) => {
  // Use first store or 'default'
  const storeId = Object.keys(stores)[0] || 'default';
  
  // Redirect to store-specific endpoint
  return res.redirect(`/csv/${storeId}${req.query.apiKey ? `?apiKey=${req.query.apiKey}` : ''}`);
});

// Image proxy endpoint - fetches images from external URLs and serves them through HTTPS
app.get('/image-proxy', async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Parse and validate the URL
    const url = new URL(imageUrl);

    // Security: Only allow known image host domains (prevent SSRF)
    const isAllowed = IMAGE_PROXY_ALLOWED_DOMAINS.some(domain =>
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );

    if (!isAllowed) {
      console.warn(`🚫 Image proxy blocked request to disallowed domain: ${url.hostname}`);
      return res.status(403).json({
        error: 'Domain not allowed',
        message: `Image proxy only allows requests to: ${IMAGE_PROXY_ALLOWED_DOMAINS.join(', ')}`
      });
    }

    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Fetch the image
    httpModule.get(imageUrl, (imageResponse) => {
      // Check if request was successful
      if (imageResponse.statusCode !== 200) {
        return res.status(imageResponse.statusCode).json({ 
          error: `Failed to fetch image: ${imageResponse.statusCode}` 
        });
      }

      // Set appropriate headers
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Stream the image data
      imageResponse.pipe(res);
    }).on('error', (error) => {
      console.error('Error fetching image:', error);
      res.status(500).json({ error: 'Failed to fetch image', message: error.message });
    });
  } catch (error) {
    console.error('Error parsing image URL:', error);
    res.status(400).json({ error: 'Invalid image URL', message: error.message });
  }
});

// ============================================================
//  User management: access codes + admin page (Railway Postgres)
// ============================================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function adminAuth(req, res, next) {
  if (!ADMIN_PASSWORD) return res.status(503).send('Admin not configured. Set ADMIN_PASSWORD on the server.');
  const m = (req.headers.authorization || '').match(/^Basic\s+(.+)$/i);
  if (m) {
    const decoded = Buffer.from(m[1], 'base64').toString('utf8');
    const pass = decoded.slice(decoded.indexOf(':') + 1);
    if (safeEqual(pass, ADMIN_PASSWORD)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Beck Auto-Post Admin"');
  return res.status(401).send('Authentication required');
}

function requireDb(res) {
  if (!users.isReady()) {
    res.status(503).json({ error: 'Database not connected yet. Add Postgres (DATABASE_URL) in Railway, then redeploy.' });
    return false;
  }
  return true;
}

// Validate an access code -> assigned store
app.post('/auth', async (req, res) => {
  try {
    if (!users.isReady()) return res.status(503).json({ success: false, error: 'User management not configured yet' });
    const code = (req.body && req.body.code) || req.query.code;
    const u = await users.lookupCode(code);
    if (!u) return res.status(401).json({ success: false, error: 'Invalid or inactive access code' });
    if (!stores[u.store]) return res.status(409).json({ success: false, error: `Assigned store "${u.store}" is not configured` });
    res.json({ success: true, store: u.store, storeName: stores[u.store].name || u.store, name: u.name });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Code-authenticated inventory feed (store comes from the code, never the client)
app.get('/feed', async (req, res) => {
  try {
    if (!users.isReady()) return res.status(503).json({ error: 'User management not configured yet' });
    const code = req.headers['x-access-code'] || req.query.code;
    const u = await users.lookupCode(code);
    if (!u) return res.status(401).json({ error: 'Invalid or inactive access code' });
    if (!stores[u.store]) return res.status(409).json({ error: `Assigned store "${u.store}" is not configured` });
    return serveStoreCsv(res, u.store);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin page + API (HTTP Basic Auth via ADMIN_PASSWORD)
app.get('/admin', adminAuth, (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/admin/api/users', adminAuth, async (req, res) => {
  if (!requireDb(res)) return;
  try { res.json(await users.listUsers()); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/admin/api/users', adminAuth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { name, store } = req.body || {};
    if (!stores[store]) return res.status(400).json({ error: 'Unknown store' });
    res.status(201).json(await users.addUser(name, store));
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.patch('/admin/api/users/:id', adminAuth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const f = req.body || {};
    if (f.store && !stores[f.store]) return res.status(400).json({ error: 'Unknown store' });
    res.json(await users.updateUser(req.params.id, f));
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/admin/api/users/:id', adminAuth, async (req, res) => {
  if (!requireDb(res)) return;
  try { await users.removeUser(req.params.id); res.status(204).end(); } catch (e) { res.status(400).json({ error: e.message }); }
});

// Boot the user DB (non-fatal if DATABASE_URL is absent)
users.initDb().catch(err => console.error('User DB init failed:', err.message));

// ============================================================
//  DealerMade gallery photos (public GraphQL API, no auth needed)
//  Returns every gallery photo for a vehicle by VIN + dealer domain.
// ============================================================
const DM_GRAPHQL = 'https://api.dealermade-next.com/v4/graphql';
const dmDomainCache = new Map();   // domain -> { id, exp }
const dmPhotoCache = new Map();    // vin|domain -> { urls, exteriorColor, interiorColor, exp }
const DM_DOMAIN_TTL = 12 * 60 * 60 * 1000;
const DM_PHOTO_TTL = 60 * 60 * 1000;

function dmPost(query, variables) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const u = new URL(DM_GRAPHQL);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) }
    }, (r) => {
      let buf = '';
      r.on('data', c => buf += c);
      r.on('end', () => {
        try {
          const j = JSON.parse(buf);
          if (j.errors) return reject(new Error(j.errors[0].message));
          resolve(j.data);
        } catch (e) { reject(new Error('Bad response from DealerMade')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('DealerMade request timed out')));
    req.write(data); req.end();
  });
}

function cleanDomain(d) {
  return String(d || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
}

async function dmDealerWebsiteId(domain) {
  const key = cleanDomain(domain);
  const c = dmDomainCache.get(key);
  if (c && c.exp > Date.now()) return c.id;
  const d = await dmPost('query($domain:String){dealerWebsiteForDomain(domain:$domain){id}}', { domain: key });
  const id = (d && d.dealerWebsiteForDomain && d.dealerWebsiteForDomain.id) || null;
  dmDomainCache.set(key, { id, exp: Date.now() + DM_DOMAIN_TTL });
  return id;
}

async function dmVehicle(vin, domain) {
  const id = await dmDealerWebsiteId(domain);
  if (!id) return { urls: [], exteriorColor: '', interiorColor: '', stockNumber: '' };
  const d = await dmPost(
    'query($vin:String!,$id:UUID!){vehicleByVinAndDealerWebsiteId(vin:$vin,dealerWebsiteId:$id){galleryPictureUrls exteriorColor interiorColor stockNumber}}',
    { vin, id });
  const v = d && d.vehicleByVinAndDealerWebsiteId;
  const urls = ((v && v.galleryPictureUrls) || [])
    .map(u => (typeof u === 'string' && u.startsWith('//')) ? 'https:' + u : u).filter(Boolean);
  return { urls, exteriorColor: (v && v.exteriorColor) || '', interiorColor: (v && v.interiorColor) || '', stockNumber: (v && v.stockNumber) || '' };
}

// GET /photos?vin=...&domain=...  ->  { photos: [url, ...] }   (access-code gated when DB is on)
app.get('/photos', async (req, res) => {
  try {
    if (users.isReady()) {
      const code = req.headers['x-access-code'] || req.query.code;
      const u = await users.lookupCode(code);
      if (!u) return res.status(401).json({ error: 'Invalid or inactive access code' });
    }
    const vin = String(req.query.vin || '').trim();
    const domain = cleanDomain(req.query.domain);
    if (!vin || !domain) return res.status(400).json({ error: 'vin and domain are required' });
    const ck = vin + '|' + domain;
    const cached = dmPhotoCache.get(ck);
    if (cached && cached.exp > Date.now()) {
      return res.json({ photos: cached.urls, exteriorColor: cached.exteriorColor, interiorColor: cached.interiorColor, stockNumber: cached.stockNumber, cached: true });
    }
    const dm = await dmVehicle(vin, domain);
    dmPhotoCache.set(ck, { ...dm, exp: Date.now() + DM_PHOTO_TTL });
    res.json({ photos: dm.urls, exteriorColor: dm.exteriorColor, interiorColor: dm.interiorColor, stockNumber: dm.stockNumber });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// ---------------------------------------------------------------------------
// AI description generation (Anthropic)
// The Anthropic key lives ONLY here in the proxy's env (ANTHROPIC_API_KEY),
// never in the extension. Reps with a valid access code get descriptions with
// zero key setup, and the key can't be extracted from the distributed extension.
// ---------------------------------------------------------------------------
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

function anthropicGenerate(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data),
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    }, (r) => {
      let buf = '';
      r.on('data', c => buf += c);
      r.on('end', () => {
        try {
          const j = JSON.parse(buf);
          if (r.statusCode >= 400) return reject(new Error((j.error && j.error.message) || `Anthropic error ${r.statusCode}`));
          const text = j.content && j.content[0] && j.content[0].text;
          resolve((text || '').trim());
        } catch (e) { reject(new Error('Bad response from Anthropic')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error('Anthropic request timed out')));
    req.write(data); req.end();
  });
}

function buildVehiclePrompt(v, userPrompt) {
  v = v || {};
  const info = `Vehicle Information:
- Year: ${v.year || 'N/A'}
- Make: ${v.make || 'N/A'}
- Model: ${v.model || 'N/A'}
- Trim: ${v.trim || 'N/A'}
- Price: $${v.price || 'N/A'}
- Mileage: ${v.mileage || 'N/A'} ${v.mileageUnit || 'miles'}
- Color: ${v.color || v.exterior_color || 'N/A'}
- Transmission: ${v.transmission || 'N/A'}
- Fuel Type: ${v.fuelType || 'N/A'}
- Body Style: ${v.bodyStyle || v.body || 'N/A'}
- Drivetrain: ${v.drivetrain || 'N/A'}
- Condition: ${v.condition || 'N/A'}
- VIN: ${v.vin || 'N/A'}

${v.description ? `Original Description (NOTE: Ignore any dealership names, phone numbers, or business references in this):\n${String(v.description).substring(0, 1000)}` : ''}`;

  return `You are an expert at writing engaging Facebook Marketplace listings for vehicles.

${info}

User's specific requirements: ${userPrompt || 'Create an engaging, professional description optimized for Facebook Marketplace'}

CRITICAL REQUIREMENTS - MUST FOLLOW:
- NEVER mention dealership name, dealership business name, or the word "dealership" anywhere in the description
- NEVER include any phone number in the description (even if present in original description)
- If the original description contains dealership info or phone numbers, completely exclude them
- ALWAYS end with a call-to-action directing buyers to "DM me on Facebook for more details" or similar Facebook messaging instruction
- Optimize specifically for Facebook Marketplace format (use emojis sparingly, short paragraphs, clear sections)

Please generate a compelling Facebook Marketplace listing description that:
1. Starts with an attention-grabbing headline
2. Highlights key features and selling points
3. Uses proper formatting with bullet points and line breaks for readability
4. Includes relevant details about condition, mileage, and features
5. Ends with: "DM me on Facebook for more details" or similar Facebook messaging instruction
6. Is optimized for Facebook Marketplace's format and audience (short paragraphs, easy to scan)
7. Is concise but comprehensive (aim for 300-500 words)
8. Uses a friendly, personal tone (as if selling as an individual, not a business)

Generate only the description text, no additional commentary.`;
}

// POST /generate-description  { vehicleData, userPrompt }  ->  { description }
// Access-code gated, same as /feed and /photos.
app.post('/generate-description', async (req, res) => {
  try {
    if (users.isReady()) {
      const code = req.headers['x-access-code'] || (req.body && req.body.code);
      const u = await users.lookupCode(code);
      if (!u) return res.status(401).json({ error: 'Invalid or inactive access code' });
    }
    if (!ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI is not configured on the server yet' });
    const { vehicleData, userPrompt } = req.body || {};
    if (!vehicleData) return res.status(400).json({ error: 'vehicleData is required' });
    const description = await anthropicGenerate(buildVehiclePrompt(vehicleData, userPrompt));
    if (!description) return res.status(502).json({ error: 'Empty response from AI' });
    res.json({ description });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SFTP Proxy Service running on port ${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET /health - Health check`);
  console.log(`   GET /stores - List all stores`);
  if (isMultiStore) {
    Object.keys(stores).forEach(storeId => {
      console.log(`   GET /csv/${storeId} - Fetch CSV for ${storeId}`);
    });
  } else {
    console.log(`   GET /csv - Fetch CSV (legacy)`);
  }
  console.log(`   GET /image-proxy?url=... - Image proxy endpoint`);
  console.log(`\n🔐 API Key: ${config.server.apiKey ? 'Configured' : 'Not set (open access)'}`);
  console.log(`🏪 Multi-Store: ${isMultiStore ? 'Yes' : 'No'}`);
  console.log(`📦 Stores: ${Object.keys(stores).join(', ')}`);
  console.log(`⏱️  Cache TTL: ${CACHE_TTL_MS / 60000} minutes`);
});

// Fetch initial CSV for all stores
Object.keys(stores).forEach(async (storeId) => {
  try {
    await fetchCSVFromSFTP(storeId);
  } catch (error) {
    console.error(`Failed to fetch initial CSV for ${storeId}:`, error.message);
  }
});