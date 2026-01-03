# Final Setup: All 4 Stores on Railway

Your server is now configured to support all 4 stores with different CSV file paths.

---

## ✅ What's Been Created

1. **`server/config.json`** - Multi-store configuration with all 4 stores:
   - beck-cdjr → `/MP15932.csv`
   - beck-chevy → `/MP15933.csv`
   - beck-ford → `/MP15935.csv`
   - beck-nissan → `/MP15931.csv`

2. **Updated `server/sftp-proxy.js`** - Now supports:
   - Loading multi-store config from config.json
   - Overriding SFTP credentials from environment variables
   - All 4 store endpoints

---

## 🚀 Next Steps

### Step 1: Update config.json with Placeholder Values

The config.json currently has placeholder values. Update them:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
```

Edit `config.json` and replace:
- `your-username` → Your actual SFTP username
- `your-password` → Your actual SFTP password

**OR** use environment variables (recommended - see Step 2).

### Step 2: Push to GitHub

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Add files
git add server/config.json server/sftp-proxy.js

# Commit
git commit -m "Add multi-store configuration for all 4 stores"

# Push
git push
```

### Step 3: Add Environment Variables in Railway

**In Railway Dashboard → Variables:**

Add these (they will override config.json values):

```
SFTP_HOST = sftp.transfer.vauto.com
SFTP_PORT = 22
SFTP_USERNAME = your-actual-sftp-username
SFTP_PASSWORD = your-actual-sftp-password
```

**How it works:**
- Server loads `config.json` with all 4 stores and file paths
- Environment variables override SFTP credentials for ALL stores
- Each store keeps its own CSV file path and API key

### Step 4: Railway Will Redeploy

After adding environment variables, Railway automatically redeploys.

---

## 🏪 Store Endpoints

After deployment, you'll have:

### BECK CDJR
```
https://your-app.up.railway.app/csv/beck-cdjr?apiKey=beck-cdjr-secret-key
```
**Fetches:** `/MP15932.csv` from SFTP

### BECK CHEVY
```
https://your-app.up.railway.app/csv/beck-chevy?apiKey=beck-chevy-secret-key
```
**Fetches:** `/MP15933.csv` from SFTP

### BECK FORD
```
https://your-app.up.railway.app/csv/beck-ford?apiKey=beck-ford-secret-key
```
**Fetches:** `/MP15935.csv` from SFTP

### BECK NISSAN
```
https://your-app.up.railway.app/csv/beck-nissan?apiKey=beck-nissan-secret-key
```
**Fetches:** `/MP15931.csv` from SFTP

---

## 🔄 Update Chrome Extensions

### BECK CDJR Extension:
- CSV URL: `https://your-app.up.railway.app/csv/beck-cdjr`
- API Key: `beck-cdjr-secret-key`

### BECK CHEVY Extension:
- CSV URL: `https://your-app.up.railway.app/csv/beck-chevy`
- API Key: `beck-chevy-secret-key`

### BECK FORD Extension:
- CSV URL: `https://your-app.up.railway.app/csv/beck-ford`
- API Key: `beck-ford-secret-key`

### BECK NISSAN Extension:
- CSV URL: `https://your-app.up.railway.app/csv/beck-nissan`
- API Key: `beck-nissan-secret-key`

---

## ✅ How It Works

1. **Server loads `config.json`** → Gets all 4 stores with file paths
2. **Environment variables override** → SFTP credentials applied to all stores
3. **Each store uses:**
   - Same SFTP host/username/password (from env vars)
   - Different CSV file path (from config.json)
   - Different API key (from config.json)

---

## 🧪 Test All Stores

After deployment, test each store:

```bash
# Health check (shows all stores)
curl https://your-app.up.railway.app/health

# List stores
curl https://your-app.up.railway.app/stores

# Test each store
curl "https://your-app.up.railway.app/csv/beck-cdjr?apiKey=beck-cdjr-secret-key"
curl "https://your-app.up.railway.app/csv/beck-chevy?apiKey=beck-chevy-secret-key"
curl "https://your-app.up.railway.app/csv/beck-ford?apiKey=beck-ford-secret-key"
curl "https://your-app.up.railway.app/csv/beck-nissan?apiKey=beck-nissan-secret-key"
```

---

## 📋 Checklist

- [x] Multi-store config.json created
- [x] Server code updated to support multi-store
- [ ] config.json updated with actual SFTP username (or use env vars)
- [ ] Files pushed to GitHub
- [ ] Environment variables added in Railway
- [ ] Railway redeployed
- [ ] All 4 store endpoints tested
- [ ] Chrome extensions updated

---

## 🎉 Summary

**One Railway deployment serves all 4 stores:**
- ✅ Same SFTP server and credentials
- ✅ Different CSV file paths per store
- ✅ Different API keys per store
- ✅ All accessible via public HTTPS URL

**Push the files and add environment variables - you're done!** 🚀
