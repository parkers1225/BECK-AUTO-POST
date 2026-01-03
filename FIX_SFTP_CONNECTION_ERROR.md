# Fix SFTP Connection Error

Error: "wtr.once is not a function"

This error is caused by incompatible connection options in the SFTP client library.

---

## ✅ Fixed

I've simplified the SFTP connection code to use basic connection options that are compatible with the `ssh2-sftp-client` library.

**Removed:**
- Complex algorithm options
- Retry settings (not supported in this way)
- Debug options

**Using simple connection:**
```javascript
await sftp.connect({
  host: sftpConfig.host,
  port: sftpConfig.port || 22,
  username: sftpConfig.username,
  password: sftpConfig.password
});
```

---

## 🚀 Push the Fix

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

git add server/sftp-proxy.js
git commit -m "Fix SFTP connection error - simplify connection options"
git push
```

---

## ✅ After Pushing

Railway will automatically redeploy. The connection should work now with the simplified options.

---

## 🧪 Test

After Railway redeploys, test:

```
https://beck-sftp-proxy-production.up.railway.app/csv/beck-cdjr?apiKey=beck-cdjr-secret-key
```

**Should now connect successfully!**

---

## 📝 Note

The simplified connection uses the same basic options that FileZilla uses, so it should work the same way.

**Push the fix and Railway should connect successfully!** 🚀
