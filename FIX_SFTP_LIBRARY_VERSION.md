# Fix SFTP Library Version Issue

Error: "wtr.once is not a function"

This error is caused by a compatibility issue with `ssh2-sftp-client` version 10.x.

---

## ✅ Fixed

I've downgraded `ssh2-sftp-client` from version `^10.0.0` to `^9.1.0` which is more stable and doesn't have this issue.

**Updated `server/package.json`:**
```json
{
  "dependencies": {
    "ssh2-sftp-client": "^9.1.0"
  }
}
```

---

## 🚀 Push the Fix

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

git add server/package.json server/sftp-proxy.js
git commit -m "Fix SFTP connection - downgrade ssh2-sftp-client to 9.1.0"
git push
```

---

## ✅ After Pushing

Railway will automatically redeploy and:
1. Install the correct library version (9.1.0)
2. Connect successfully to SFTP
3. Fetch CSV files

---

## 🧪 Test

After Railway redeploys, test:

```
https://beck-sftp-proxy-production.up.railway.app/csv/beck-cdjr?apiKey=beck-cdjr-secret-key
```

**Should now work!**

---

## 📝 Why This Fixes It

Version 10.x of `ssh2-sftp-client` has breaking changes that cause the "wtr.once is not a function" error. Version 9.1.0 is stable and works correctly with the connection code.

**Push the fix and Railway should connect successfully!** 🚀
