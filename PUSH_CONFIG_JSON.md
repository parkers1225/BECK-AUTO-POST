# Push config.json to GitHub

The `config.json` file is in `.gitignore`, so it wasn't pushed to GitHub. That's why Railway is showing "default" store instead of all 4 stores.

---

## ✅ Fixed

I've removed `config.json` from `.gitignore` so it can be committed.

---

## 🚀 Push to GitHub

Run these commands in your terminal:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Add config.json and updated .gitignore
git add server/config.json server/.gitignore

# Commit
git commit -m "Add multi-store config.json for Railway deployment"

# Push
git push
```

---

## ✅ After Pushing

Railway will automatically redeploy and:

1. ✅ Load `config.json` with all 4 stores
2. ✅ Health endpoint will show all 4 stores
3. ✅ All store endpoints will work

---

## 🧪 Verify

After Railway redeploys, test:

```
https://beck-sftp-proxy-production.up.railway.app/health
```

**Should now show:**
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

## 🔐 Security Note

The `config.json` file has placeholder values (`your-username`, `your-password`). These will be overridden by Railway environment variables, so it's safe to commit.

**After pushing, add environment variables in Railway:**
- `SFTP_USERNAME` = your actual username
- `SFTP_PASSWORD` = your actual password

These will override the placeholder values.

---

**Push the files and Railway will load all 4 stores!** 🚀
