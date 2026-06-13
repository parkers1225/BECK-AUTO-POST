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
    multiStore: isMultiStore
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

  // Verify API key
  if (!verifyApiKey(req, storeId)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or missing API key' });
  }

  // Only fetch from SFTP if cache is stale or empty
  if (!isCacheFresh(storeId)) {
    try {
      await fetchCSVFromSFTP(storeId);
    } catch (error) {
      console.error(`Failed to fetch CSV for ${storeId}:`, error.message);
      
      // If we have cached content, use it (even if stale)
      if (csvCache[storeId].content) {
        console.log(`Using stale cached CSV for ${storeId}`);
      } else {
        return res.status(500).json({ 
          error: 'Failed to fetch CSV from SFTP',
          message: error.message 
        });
      }
    }
  } else {
    console.log(`📦 Serving cached CSV for ${storeId} (age: ${Math.round((Date.now() - csvCache[storeId].lastFetch.getTime()) / 1000)}s)`);
  }

  const cache = csvCache[storeId];
  
  // Set response headers
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('X-CSV-Hash', cache.hash || '');
  res.setHeader('X-CSV-Last-Modified', (cache.lastModified instanceof Date ? cache.lastModified.toISOString() : (cache.lastModified ? new Date(cache.lastModified).toISOString() : '')));
  res.setHeader('X-CSV-Last-Fetch', cache.lastFetch?.toISOString() || '');
  res.setHeader('X-CSV-Size', cache.size || 0);
  res.setHeader('X-CSV-Cached', isCacheFresh(storeId) ? 'true' : 'false');

  // Send CSV content
  res.send(cache.content);
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