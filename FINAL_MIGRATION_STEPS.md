# Final Migration Steps - PM2 Multi-Store Setup

## Quick Migration (3 Steps)

### Step 1: Switch to Multi-Store Config ✅

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"

# Backup current config
Copy-Item config.json config-single-store-backup.json

# Use multi-store config
Copy-Item config-multi-store.json config.json
```

### Step 2: Update Proxy Code

Since `sftp-proxy.js` is protected, you have two options:

**Option A: I'll provide complete code** (recommended)
- I'll give you the complete updated `sftp-proxy.js` code
- You copy/paste it to replace the current file

**Option B: Manual update** (if you prefer)
- I'll guide you through specific code changes
- You update sections manually

### Step 3: Restart PM2

```powershell
# Restart with updated code
pm2 restart sftp-proxy

# Check it's working
pm2 logs sftp-proxy --lines 20

# Test endpoints
curl http://localhost:3000/stores
```

---

## What You Need

1. ✅ Multi-store config ready (`config-multi-store.json`)
2. ⏳ Updated proxy code (I'll provide this)
3. ⏳ Restart PM2

---

## Ready to Proceed?

**I can provide the complete updated `sftp-proxy.js` code right now.**

The updated code will:
- ✅ Support all 4 stores (beck-cdjr, beck-chevy, beck-ford, beck-nissan)
- ✅ Add `/csv/:storeId` endpoints
- ✅ Add `/stores` endpoint  
- ✅ Be backward compatible
- ✅ Support per-store API keys

**Should I provide the complete code now?**


