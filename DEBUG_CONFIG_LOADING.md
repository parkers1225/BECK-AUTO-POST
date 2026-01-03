# Debug: Why config.json Isn't Loading

The server is still showing "default" store, which means `config.json` isn't being loaded on Railway.

---

## 🔍 Possible Issues

1. **config.json not pushed to GitHub** - Check if it was committed
2. **Server code not finding config.json** - Path might be wrong
3. **JSON parsing error** - config.json might have syntax errors
4. **Environment variables overriding** - SFTP_HOST env var might be triggering single-store mode

---

## ✅ Quick Check

### Check if config.json is in Git:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
git ls-files server/config.json
```

**If it shows the file:** It's tracked by Git  
**If nothing:** It's not tracked, need to add it

### Check Railway Logs:

In Railway Dashboard → Deploy Logs, look for:
- "✅ Loaded multi-store configuration"
- "❌ Error loading config"
- Any error messages about config.json

---

## 🔧 Solution: Force Add config.json

If config.json wasn't pushed:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Force add config.json (even if in .gitignore)
git add -f server/config.json

# Also add .gitignore update
git add server/.gitignore

# Commit
git commit -m "Force add config.json for Railway multi-store support"

# Push
git push
```

---

## 🔧 Alternative: Check Server Code

The server code might be checking for environment variables first and skipping config.json. Let me verify the loading order.

**The issue might be:** If `SFTP_HOST` environment variable is set, the server uses single-store mode instead of loading config.json.

**Solution:** Make sure environment variables are set AFTER config.json is loaded, or update server code to always load config.json first.

---

## 🧪 Test Locally First

Before pushing, test locally:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
node sftp-proxy.js
```

**Should show:**
- "✅ Loaded multi-store configuration from config.json"
- "Stores: beck-cdjr, beck-chevy, beck-ford, beck-nissan"

**If it shows "default":** The server code has an issue loading config.json.

---

## 📋 Next Steps

1. **Check if config.json is in Git** (command above)
2. **If not, force add it** (command above)
3. **Check Railway logs** for error messages
4. **Verify server code** loads config.json before checking env vars

**Let me know what you find and I'll help fix it!**
