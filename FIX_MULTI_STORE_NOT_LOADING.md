# Fix: Multi-Store Not Loading

The server is showing "default" store instead of all 4 stores. This means `config.json` isn't being loaded on Railway.

---

## 🔍 Problem

Health endpoint shows:
```json
{
  "stores": [{"id": "default", ...}],
  "multiStore": false
}
```

**This means:** Server is using fallback single-store config, not loading `config.json`.

---

## ✅ Solution: Push config.json to GitHub

The `config.json` file needs to be committed and pushed to GitHub so Railway can access it.

### Step 1: Check if config.json is in .gitignore

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
Get-Content .gitignore
```

If `config.json` is listed, we need to either:
- Remove it from .gitignore (safe since it has placeholder values)
- Or create a `config.example.json` and use environment variables

### Step 2: Add config.json to Git

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Check if it's tracked
git ls-files server/config.json

# If not, add it
git add server/config.json

# Commit
git commit -m "Add multi-store config.json for Railway"

# Push
git push
```

### Step 3: Railway Will Redeploy

After pushing, Railway will:
1. Get the `config.json` file
2. Load all 4 stores
3. Health endpoint will show all 4 stores

---

## 🔧 Alternative: Use Environment Variables Only

If you don't want to commit `config.json`, we can update the server to build the multi-store config from environment variables.

**Would you like me to:**
- **Option A:** Push config.json (easier - recommended)
- **Option B:** Update server to use only environment variables (more secure)

---

## ✅ Quick Fix

**Most likely:** `config.json` wasn't pushed to GitHub.

**Fix:**
```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
git add server/config.json
git commit -m "Add multi-store configuration"
git push
```

**Then Railway will redeploy and show all 4 stores!**

---

## 🧪 Verify After Fix

After pushing and Railway redeploys:

```
https://beck-sftp-proxy-production.up.railway.app/health
```

**Should show:**
```json
{
  "status": "ok",
  "stores": [
    {"id": "beck-cdjr", "name": "BECK CDJR", ...},
    {"id": "beck-chevy", "name": "BECK CHEVY", ...},
    {"id": "beck-ford", "name": "BECK FORD", ...},
    {"id": "beck-nissan", "name": "BECK NISSAN", ...}
  ],
  "multiStore": true
}
```

---

**Push config.json to GitHub and Railway will load all 4 stores!** 🚀
