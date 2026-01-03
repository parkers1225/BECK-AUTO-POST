# Complete Updated Proxy Code - Ready to Copy!

## ✅ File Created: `sftp-proxy-NEW-MULTI-STORE.js`

The complete updated multi-store proxy code has been created in:
**`server/sftp-proxy-NEW-MULTI-STORE.js`**

## Quick Migration Steps

### 1. Backup Current File
```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
Copy-Item sftp-proxy.js sftp-proxy-backup-before-multi-store.js
```

### 2. Replace with New Code
```powershell
# Copy the new file over the old one
Copy-Item sftp-proxy-NEW-MULTI-STORE.js sftp-proxy.js -Force
```

### 3. Switch to Multi-Store Config
```powershell
# Backup current config
Copy-Item config.json config-single-store-backup.json

# Use multi-store config
Copy-Item config-multi-store.json config.json
```

### 4. Restart PM2
```powershell
pm2 restart sftp-proxy

# Check logs
pm2 logs sftp-proxy --lines 30
```

### 5. Test It!
```powershell
# List all stores
curl http://localhost:3000/stores

# Test each store
curl "http://localhost:3000/csv/beck-cdjr?apiKey=beck-cdjr-secret-key"
curl "http://localhost:3000/csv/beck-chevy?apiKey=beck-chevy-secret-key"
curl "http://localhost:3000/csv/beck-ford?apiKey=beck-ford-secret-key"
curl "http://localhost:3000/csv/beck-nissan?apiKey=beck-nissan-secret-key"

# Health check
curl http://localhost:3000/health
```

## What the Updated Code Does

✅ **Multi-Store Support** - Handles all 4 stores  
✅ **Backward Compatible** - Still works with old single-store config  
✅ **Per-Store Caching** - Separate cache for each store  
✅ **Per-Store API Keys** - Each store can have its own API key  
✅ **New Endpoints:**
   - `GET /csv/:storeId` - Get CSV for specific store
   - `GET /csv/:storeId/status` - Get status for store
   - `GET /stores` - List all stores
   - `GET /health` - Health check (shows all stores)

## All-in-One Migration Command

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"

# Backup
Copy-Item sftp-proxy.js sftp-proxy-backup-before-multi-store.js
Copy-Item config.json config-single-store-backup.json

# Update files
Copy-Item sftp-proxy-NEW-MULTI-STORE.js sftp-proxy.js -Force
Copy-Item config-multi-store.json config.json -Force

# Restart
pm2 restart sftp-proxy

# Test
curl http://localhost:3000/stores
```

## Extension Configuration

After migration, update each store's Chrome extension:

**BECK CDJR:**
- CSV URL: `http://localhost:3000/csv/beck-cdjr`
- API Key: `beck-cdjr-secret-key`

**BECK CHEVY:**
- CSV URL: `http://localhost:3000/csv/beck-chevy`
- API Key: `beck-chevy-secret-key`

**BECK FORD:**
- CSV URL: `http://localhost:3000/csv/beck-ford`
- API Key: `beck-ford-secret-key`

**BECK NISSAN:**
- CSV URL: `http://localhost:3000/csv/beck-nissan`
- API Key: `beck-nissan-secret-key`

---

**Ready to migrate?** Just run the commands above! 🚀


