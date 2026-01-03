# Fix SFTP get() Method Error

Error: "wtr.once is not a function"

This error is caused by how we're calling `sftp.get()` - the method returns a Buffer, and we need to handle it correctly.

---

## ✅ Fixed

I've updated the code to:
1. **Downgrade library** to `ssh2-sftp-client@9.1.0` (more stable)
2. **Fix get() call** - Remove encoding parameter and handle Buffer conversion manually
3. **Convert Buffer to string** properly

**Updated code:**
```javascript
// Get file content (returns Buffer)
const csvContent = await sftp.get(sftpConfig.path);

// Convert to string if it's a Buffer
const csvString = Buffer.isBuffer(csvContent) ? csvContent.toString('utf8') : csvContent;
```

---

## 🚀 Push the Fix

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

git add server/package.json server/sftp-proxy.js
git commit -m "Fix SFTP get() method - handle Buffer conversion properly"
git push
```

---

## ✅ After Pushing

Railway will automatically redeploy and:
1. Install `ssh2-sftp-client@9.1.0`
2. Use the fixed `get()` method
3. Convert Buffer to string correctly
4. Fetch CSV files successfully

---

## 🧪 Test

After Railway redeploys, test:

```
https://beck-sftp-proxy-production.up.railway.app/csv/beck-cdjr?apiKey=beck-cdjr-secret-key
```

**Should now work!**

---

## 📝 What Changed

1. **Library version:** `^10.0.0` → `^9.1.0` (more stable)
2. **get() call:** Removed encoding parameter, handle Buffer manually
3. **String conversion:** Properly convert Buffer to UTF-8 string

**Push the fix and Railway should connect and fetch CSV files successfully!** 🚀
