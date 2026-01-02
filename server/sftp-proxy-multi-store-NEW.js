/**
 * SFTP to HTTP Proxy Service
 * Fetches CSV files from SFTP server and serves them via HTTP/HTTPS
 * 
 * Usage:
 *   npm install
 *   node sftp-proxy.js
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

// Cache for CSV content
let csvCache = {
  content: null,
  lastModified: null,
  hash: null,
  lastFetch: null
};

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
  if (config.server.apiKey) {
    const authHeader = req.headers.authorization;
    const apiKey = authHeader?.replace('Bearer ', '') || req.query.apiKey;
    
    if (apiKey !== config.server.apiKey) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
  }
  next();
};

/**
 * Fetch CSV from SFTP server
 */
async function fetchCSVFromSFTP() {
  const sftp = new Client();
  
  try {
    console.log(`Connecting to SFTP server: ${config.sftp.host}:${config.sftp.port}`);
    
    await sftp.connect({
      host: config.sftp.host,
      port: config.sftp.port || 22,
      username: config.sftp.username,
      password: config.sftp.password,
      readyTimeout: 10000
    });
    
    console.log('SFTP connected successfully');
    
    // Check if file exists
    const exists = await sftp.exists(config.sftp.path);
    if (!exists) {
      throw new Error(`CSV file not found at path: ${config.sftp.path}`);
    }
    
    // Get file stats
    const stats = await sftp.stat(config.sftp.path);
    console.log(`File found: ${config.sftp.path} (${stats.size} bytes, modified: ${stats.modifyTime})`);
    
    // Read file content using fastGet to temp file (more reliable)
    const tempFilePath = path.join(os.tmpdir(), `csv-${Date.now()}.tmp`);
    
    try {
      // Download file to temp location
      await sftp.fastGet(config.sftp.path, tempFilePath);
      
      // Read the temp file
      const csvString = fs.readFileSync(tempFilePath, 'utf8');
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempFilePath);
      } catch (unlinkErr) {
        // Ignore cleanup errors
      }
      
      // Calculate hash for change detection
      const hash = crypto.createHash('sha256').update(csvString).digest('hex');
      
      // Update cache
      csvCache = {
        content: csvString,
        lastModified: stats.modifyTime,
        hash: hash,
        lastFetch: new Date().toISOString()
      };
      
      console.log(`CSV fetched successfully (${csvString.length} chars, hash: ${hash.substring(0, 8)}...)`);
      
      await sftp.end();
      return csvString;
      
    } catch (getError) {
      // Clean up temp file on error
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (unlinkErr) {
        // Ignore cleanup errors
      }
      throw getError;
    }
    
    // Calculate hash for change detection
    const hash = crypto.createHash('sha256').update(csvString).digest('hex');
    
    // Update cache
    csvCache = {
      content: csvString,
      lastModified: stats.modifyTime,
      hash: hash,
      lastFetch: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('SFTP fetch error:', error.message);
    await sftp.end().catch(() => {}); // Ignore errors on close
    throw error;
  }
}

/**
 * GET /csv - Returns CSV file content
 */
app.get('/csv', authenticate, async (req, res) => {
  try {
    // Try to fetch fresh CSV
    try {
      const csvContent = await fetchCSVFromSFTP();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-CSV-Hash', csvCache.hash);
      res.setHeader('X-CSV-Last-Modified', csvCache.lastModified || '');
      res.setHeader('X-CSV-Last-Fetch', csvCache.lastFetch || '');
      res.send(csvContent);
    } catch (error) {
      // If fetch fails but we have cached content, serve cache
      if (csvCache.content) {
        console.warn(`SFTP fetch failed, serving cached CSV: ${error.message}`);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('X-CSV-Hash', csvCache.hash);
        res.setHeader('X-CSV-Last-Modified', csvCache.lastModified || '');
        res.setHeader('X-CSV-Last-Fetch', csvCache.lastFetch || '');
        res.setHeader('X-CSV-Cached', 'true');
        res.setHeader('X-CSV-Error', error.message);
        res.send(csvCache.content);
      } else {
        // No cache available, return error
        res.status(503).json({
          error: 'Failed to fetch CSV from SFTP',
          message: error.message
        });
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /csv/status - Returns CSV status information
 */
app.get('/csv/status', authenticate, (req, res) => {
  res.json({
    available: csvCache.content !== null,
    lastFetch: csvCache.lastFetch,
    lastModified: csvCache.lastModified,
    hash: csvCache.hash,
    size: csvCache.content ? csvCache.content.length : 0,
    cached: csvCache.content !== null
  });
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    csvAvailable: csvCache.content !== null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nðŸš€ SFTP Proxy Service running on port ${PORT}`);
  console.log(`ðŸ“¡ Endpoints:`);
  console.log(`   GET /csv - Fetch CSV file`);
  console.log(`   GET /csv/status - Get CSV status`);
  console.log(`   GET /health - Health check`);
  console.log(`\nâš™ï¸  Configuration:`);
  console.log(`   SFTP Host: ${config.sftp.host}:${config.sftp.port || 22}`);
  console.log(`   SFTP Path: ${config.sftp.path}`);
  console.log(`   API Key: ${config.server.apiKey ? 'Enabled' : 'Disabled'}`);
  console.log(`\nðŸ’¡ Tip: Make sure config.json is properly configured\n`);
  
  // Fetch CSV on startup
  fetchCSVFromSFTP().catch(error => {
    console.error('Failed to fetch CSV on startup:', error.message);
    console.log('Service will still run, but CSV will be unavailable until SFTP connection is restored.');
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


