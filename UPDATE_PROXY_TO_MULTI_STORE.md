# Update Proxy to Multi-Store - Quick Guide

## What We're Doing

Updating your existing `sftp-proxy.js` to support all 4 stores with these endpoints:
- `/csv/beck-cdjr` → BECK CDJR inventory
- `/csv/beck-chevy` → BECK CHEVY inventory  
- `/csv/beck-ford` → BECK FORD inventory
- `/csv/beck-nissan` → BECK NISSAN inventory
- `/stores` → List all stores
- `/health` → Health check (updated)

## Quick Steps

### 1. Switch to Multi-Store Config

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"

# Backup current single-store config
Copy-Item config.json config-single-store-backup.json

# Use multi-store config
Copy-Item config-multi-store.json config.json
```

### 2. Update Proxy Code

I'll provide the complete updated `sftp-proxy.js` file. The key changes:

1. **Loads multi-store config** - Supports both old and new format
2. **Per-store caching** - Separate cache object for each store
3. **Store routing** - `/csv/:storeId` endpoint
4. **Store listing** - `/stores` endpoint  
5. **Backward compatible** - Still works with old single-store config

### 3. Restart PM2

```powershell
# Stop current proxy
pm2 stop sftp-proxy

# Restart with updated code
pm2 restart sftp-proxy

# Check logs
pm2 logs sftp-proxy --lines 50
```

### 4. Test

```powershell
# List stores
curl http://localhost:3000/stores

# Test each store
curl "http://localhost:3000/csv/beck-cdjr?apiKey=beck-cdjr-secret-key"
```

## Key Code Changes

The updated proxy will:

1. **Detect config format:**
   ```javascript
   const isMultiStore = config.stores !== undefined;
   ```

2. **Initialize per-store cache:**
   ```javascript
   const csvCache = {};
   Object.keys(stores).forEach(storeId => {
     csvCache[storeId] = { content: null, ... };
   });
   ```

3. **Add store routing:**
   ```javascript
   app.get('/csv/:storeId', authenticate, async (req, res) => {
     const storeId = req.params.storeId;
     // Fetch and serve that store's CSV
   });
   ```

## Ready to Update?

The complete updated code is ready. Should I:
1. ✅ Show you the complete updated file to copy?
2. ✅ Create a migration script?
3. ✅ Walk you through the changes step-by-step?

Let me know and I'll provide the updated code!


