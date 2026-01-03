# Quick Setup: All 4 Stores on Railway

Your server is configured for all 4 stores! Here's the quick setup.

---

## ✅ What's Ready

- ✅ `server/config.json` - All 4 stores configured
- ✅ `server/sftp-proxy.js` - Updated to support multi-store
- ✅ Server supports environment variable overrides

---

## 🚀 3 Steps to Deploy

### Step 1: Push to GitHub

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

git add server/config.json server/sftp-proxy.js
git commit -m "Configure all 4 stores for Railway"
git push
```

### Step 2: Add Environment Variables in Railway

**Railway Dashboard → Your Service → Variables:**

Add these 4 variables:

```
SFTP_HOST = sftp.transfer.vauto.com
SFTP_PORT = 22
SFTP_USERNAME = your-actual-username
SFTP_PASSWORD = your-actual-password
```

**That's it!** These credentials will be used for all 4 stores.

### Step 3: Test

After Railway redeploys:

```
https://your-app.up.railway.app/health
```

Should show all 4 stores!

---

## 🏪 Store Endpoints

After deployment:

- **BECK CDJR:** `https://your-app.up.railway.app/csv/beck-cdjr?apiKey=beck-cdjr-secret-key`
- **BECK CHEVY:** `https://your-app.up.railway.app/csv/beck-chevy?apiKey=beck-chevy-secret-key`
- **BECK FORD:** `https://your-app.up.railway.app/csv/beck-ford?apiKey=beck-ford-secret-key`
- **BECK NISSAN:** `https://your-app.up.railway.app/csv/beck-nissan?apiKey=beck-nissan-secret-key`

---

## 📝 How It Works

1. **config.json** defines all 4 stores with their CSV file paths:
   - beck-cdjr → `/MP15932.csv`
   - beck-chevy → `/MP15933.csv`
   - beck-ford → `/MP15935.csv`
   - beck-nissan → `/MP15931.csv`

2. **Environment variables** override SFTP credentials for ALL stores

3. **Each store** uses:
   - Same SFTP host/username/password (from env vars)
   - Different CSV file path (from config.json)
   - Different API key (from config.json)

---

## ✅ Done!

**One Railway deployment = All 4 stores accessible!** 🎉

Push the files, add environment variables, and you're done!
