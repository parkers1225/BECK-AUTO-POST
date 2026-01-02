# PM2 Multi-Store Setup Guide

This guide will help you update your existing PM2 proxy to support all 4 stores.

## Current Status
- ✅ PM2 running with single-store proxy
- ✅ Multi-store config ready (`config-multi-store.json`)
- ⏳ Need to update proxy code for multi-store

## Step 1: Backup Current Setup

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
# Backup already created: sftp-proxy-backup.js
```

## Step 2: Update Configuration

Switch to multi-store config:

```powershell
# Backup current single-store config
Copy-Item config.json config-single-store-backup.json

# Use multi-store config
Copy-Item config-multi-store.json config.json
```

## Step 3: Update Proxy Code

The proxy needs to be updated to support:
- `/csv/:storeId` endpoints
- Multi-store configuration loading
- Per-store caching

**Option A: Manual Update** (see code changes below)
**Option B: Use Updated File** (I'll provide the complete updated file)

## Step 4: Restart PM2

```powershell
# Stop current proxy
pm2 stop sftp-proxy

# Delete old process
pm2 delete sftp-proxy

# Start with updated code
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
pm2 start sftp-proxy.js --name sftp-proxy

# Save PM2 config
pm2 save
```

## Step 5: Test Endpoints

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

## Code Changes Required

The proxy needs these key changes:

1. **Load multi-store config** - Support both old and new format
2. **Per-store caching** - Separate cache for each store
3. **Store routing** - `/csv/:storeId` endpoint
4. **Store listing** - `/stores` endpoint

## Quick Migration Commands

```powershell
# 1. Backup
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
Copy-Item config.json config-single-store-backup.json
Copy-Item config-multi-store.json config.json

# 2. Update proxy code (see next section)

# 3. Restart
pm2 restart sftp-proxy

# 4. Verify
pm2 logs sftp-proxy
```

## Extension Configuration

After proxy is updated, configure each store's extension:

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

## Troubleshooting

### Store Not Found Error
- Verify store ID in config.json matches URL
- Check store ID spelling (case-sensitive)

### Wrong CSV File
- Verify SFTP path in config for that store
- Check CSV file exists on SFTP server

### PM2 Not Starting
- Check logs: `pm2 logs sftp-proxy`
- Verify config.json is valid JSON
- Check for syntax errors in proxy code


