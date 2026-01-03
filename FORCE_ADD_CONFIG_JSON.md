# Force Add config.json to GitHub

The `config.json` file needs to be in GitHub for Railway to load it. Since it was in `.gitignore`, it wasn't committed.

---

## 🚀 Solution: Force Add config.json

Run these commands in your terminal:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Force add config.json (even if it was in .gitignore)
git add -f server/config.json

# Also add the updated .gitignore
git add server/.gitignore

# Commit
git commit -m "Add multi-store config.json for Railway deployment"

# Push
git push
```

---

## ✅ After Pushing

Railway will automatically redeploy. Check the logs - you should see:
- "✅ Loaded multi-store configuration from config.json"
- "Stores: beck-cdjr, beck-chevy, beck-ford, beck-nissan"

---

## 🧪 Verify

After Railway redeploys (wait 1-2 minutes), test:

```
https://beck-sftp-proxy-production.up.railway.app/health
```

**Should now show:**
```json
{
  "status": "ok",
  "stores": [
    {"id": "beck-cdjr", "name": "BECK CDJR", "available": false},
    {"id": "beck-chevy", "name": "BECK CHEVY", "available": false},
    {"id": "beck-ford", "name": "BECK FORD", "available": false},
    {"id": "beck-nissan", "name": "BECK NISSAN", "available": false}
  ],
  "multiStore": true
}
```

---

## 🔍 Check Railway Logs

After pushing, check Railway Deploy Logs for:
- ✅ "✅ Loaded multi-store configuration"
- ❌ Any errors about config.json not found
- ❌ JSON parsing errors

---

## 📝 Why This Happened

1. `config.json` was in `.gitignore` (to protect passwords)
2. It wasn't committed to Git
3. Railway doesn't have the file
4. Server falls back to "default" store

**The fix:** Force add it (it's safe - has placeholder values that will be overridden by env vars).

---

**Run the commands above and Railway will load all 4 stores!** 🚀
