/**
 * SFTP to HTTP Proxy Service - Multi-Store Version
 * Fetches CSV files from SFTP server for multiple stores and serves them via HTTP/HTTPS
 * 
 * Usage:
 *   npm install
 *   node sftp-proxy.js
 * 
 * Endpoints:
 *   GET /csv/:storeId - Get CSV for specific store
 *   GET /csv/:storeId/status - Get status for specific store
 *   GET /stores - List all available stores
 *   GET /health - Health check
 */

const express = require('express');
const Client = require('ssh2-sftp-client');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Load configuration
let config;
try {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    console.error('ERROR: config.json not found. Please copy config.example.json to config.json and configure it.');
    process.exit(1);
  }
} catch (error) {
  console.error('ERROR: Failed to load config.json:', error.message);
  process.exit(1);
}

// Support both old single-store and new multi-store config formats
const isMultiStore = config.stores !== undefined;
let stores = {};

if (isMultiStore) {
  // Multi-store configuration
  stores = config.stores;
  console.log(`âœ… Multi-store mode: ${Object.keys(stores).length} stores configured`);
} else {
  // Legacy single-store configuration - convert to multi-store format
  const storeId = config.store?.id || 'default';
  stores[storeId] = {
    name: config.store?.name || 'Default Store',
    sftp: config.sftp
  };
  if (config.server?.apiKey) {
    stores[storeId].apiKey = config.server.apiKey;
  }
  console.log(`âœ… Single-store mode (legacy): converted to store ID '${storeId}'`);
}

// Cache for CSV content per store
const csvCache = {};

// Initialize cache for each store
Object.keys(stores).forEach(storeId => {
  csvCache[storeId] = {
    content: null,
    lastModified: null,
    hash: null,
    lastFetch: null
  };
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Optional API key authentication middleware
const authenticate = (req, res, next) => {
  const storeId = req.params.storeId || req.query.storeId;
  const store = stores[storeId];
  
  // Check for API key (per-store or global)
  const apiKey = store?.apiKey || config.server?.apiKey;
  
  if (apiKey) {
    const authHeader = req.headers.authorization;
    const providedKey = authHeader?.replace('Bearer ', '') || req.query.apiKey;
    
    if (providedKey !== apiKey) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
  }
  next();
};

/**
 * Fetch CSV from SFTP server for a specific store
 */
async function fetchCSVFromSFTP(storeId) {
  const store = stores[storeId];
  if (!store) {
    throw new Error(`Store '${storeId}' not found`);
  }
  
  const sftp = new Client();
  const storeConfig = store.sftp;
  
  try {
    console.log(`[${storeId}] Connecting to SFTP server: ${storeConfig.host}:${storeConfig.port || 22}`);
    
    await sftp.connect({
      host: storeConfig.host,
      port: storeConfig.port || 22,
      username: storeConfig.username,
      password: storeConfig.password,
      readyTimeout: 10000
    });
    
    console.log(`[${storeId}] SFTP connected successfully`);
    
    // Check if file exists
    const exists = await sftp.exists(storeConfig.path);
    if (!exists) {
      throw new Error(`CSV file not found at path: ${storeConfig.path}`);
    }
    
    // Get file stats
    const stats = await sftp.stat(storeConfig.path);
    console.log(`[${storeId}] File found: ${storeConfig.path} (${stats.size} bytes, modified: ${stats.modifyTime})`);
    
    // Read file content using fastGet to temp file (more reliable)
    const tempFilePath = path.join(os.tmpdir(), `csv-${storeId}-${Date.now()}.tmp`);
    
    try {
      await sftp.fastGet(storeConfig.path, tempFilePath);
      const csvContent = fs.readFileSync(tempFilePath, 'utf8');
      fs.unlinkSync(tempFilePath); // Clean up temp file
      
      // Calculate hash for change detection
      const hash = crypto.createHash('sha256').update(csvContent).digest('hex');
      
      // Update cache
      csvCache[storeId] = {
        content: csvContent,
        lastModified: stats.modifyTime,
        hash: hash,
        lastFetch: new Date()
      };
      
      console.log(`[${storeId}] CSV fetched successfully (${csvContent.length} chars, hash: ${hash.substring(0, 8)}...)`);
      
      return csvContent;
    } catch (readError) {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw readError;
    }
  } catch (error) {
    console.error(`[${storeId}] SFTP error:`, error.message);
    throw error;
  } finally {
    try {
      await sftp.end();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

/**
 * GET /stores - List all available stores
 */
app.get('/stores', (req, res) => {
  const storeList = Object.keys(stores).map(storeId => ({
    id: storeId,
    name: stores[storeId].name,
    csvPath: stores[storeId].sftp.path
  }));
  
  res.json({
    stores: storeList,
    count: storeList.length
  });
});

/**
 * GET /csv/:storeId - Returns CSV file content for specific store
 */
app.get('/csv/:storeId', authenticate, async (req, res) => {
  const storeId = req.params.storeId;
  
  if (!stores[storeId]) {
    return res.status(404).json({ error: `Store '${storeId}' not found` });
  }
  
  try {
    // Try to fetch fresh CSV
    try {
      const csvContent = await fetchCSVFromSFTP(storeId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-CSV-Hash', csvCache[storeId].hash);
      res.setHeader('X-CSV-Last-Modified', csvCache[storeId].lastModified || '');
      res.setHeader('X-CSV-Last-Fetch', csvCache[storeId].lastFetch.toISOString());
      res.setHeader('X-Store-Id', storeId);
      res.send(csvContent);
    } catch (error) {
      // If fetch fails but we have cached content, serve that
      if (csvCache[storeId].content) {
        console.warn(`[${storeId}] SFTP fetch failed, serving cached CSV: ${error.message}`);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('X-CSV-Hash', csvCache[storeId].hash);
        res.setHeader('X-CSV-Last-Modified', csvCache[storeId].lastModified || '');
        res.setHeader('X-CSV-Last-Fetch', csvCache[storeId].lastFetch.toISOString());
        res.setHeader('X-Store-Id', storeId);
        res.setHeader('X-CSV-Cached', 'true');
        res.send(csvCache[storeId].content);
      } else {
        // No cache available, return error
        res.status(503).json({
          error: 'CSV unavailable',
          message: error.message,
          storeId: storeId
        });
      }
    }
  } catch (error) {
    console.error(`[${storeId}] Error serving CSV:`, error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /csv/:storeId/status - Returns CSV status information for specific store
 */
app.get('/csv/:storeId/status', authenticate, (req, res) => {
  const storeId = req.params.storeId;
  
  if (!stores[storeId]) {
    return res.status(404).json({ error: `Store '${storeId}' not found` });
  }
  
  const cache = csvCache[storeId];
  res.json({
    storeId: storeId,
    storeName: stores[storeId].name,
    available: cache.content !== null,
    lastFetch: cache.lastFetch,
    lastModified: cache.lastModified,
    hash: cache.hash,
    size: cache.content ? cache.content.length : 0,
    cached: cache.content !== null
  });
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  const storeStatuses = {};
  let totalAvailable = 0;
  
  Object.keys(stores).forEach(storeId => {
    const available = csvCache[storeId].content !== null;
    if (available) totalAvailable++;
    storeStatuses[storeId] = {
      name: stores[storeId].name,
      available: available
    };
  });
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stores: Object.keys(stores).length,
    available: totalAvailable,
    storeStatuses: storeStatuses
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nðŸš€ SFTP Proxy Service (Multi-Store) running on port ${PORT}`);
  console.log(`ðŸ“¡ Endpoints:`);
  console.log(`   GET /csv/:storeId - Fetch CSV file for store`);
  console.log(`   GET /csv/:storeId/status - Get CSV status for store`);
  console.log(`   GET /stores - List all available stores`);
  console.log(`   GET /health - Health check`);
  console.log(`\nâš™ï¸  Configuration:`);
  console.log(`   Stores: ${Object.keys(stores).length}`);
  Object.keys(stores).forEach(storeId => {
    const store = stores[storeId];
    console.log(`   - ${storeId}: ${store.name} â†’ ${store.sftp.path}`);
  });
  console.log(`   API Key: ${config.server?.apiKey ? 'Enabled' : 'Disabled'}`);
  console.log(`\nðŸ’¡ Tip: Make sure config.json is properly configured\n`);
  
  // Fetch CSV for all stores on startup (in background)
  Object.keys(stores).forEach(storeId => {
    fetchCSVFromSFTP(storeId).catch(error => {
      console.error(`[${storeId}] Failed to fetch CSV on startup:`, error.message);
      console.log(`[${storeId}] Service will still run, but CSV will be unavailable until SFTP connection is restored.`);
    });
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
