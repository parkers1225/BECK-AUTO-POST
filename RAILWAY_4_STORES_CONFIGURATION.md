# Railway Configuration for All 4 Stores

Your server is configured to support all 4 stores with different CSV file paths.

---

## 🏪 Store Configuration

| Store ID | Store Name | SFTP CSV File | Endpoint | API Key |
|----------|------------|---------------|----------|---------|
| `beck-cdjr` | BECK CDJR | `/MP15932.csv` | `/csv/beck-cdjr` | `beck-cdjr-secret-key` |
| `beck-chevy` | BECK CHEVY | `/MP15933.csv` | `/csv/beck-chevy` | `beck-chevy-secret-key` |
| `beck-ford` | BECK FORD | `/MP15935.csv` | `/csv/beck-ford` | `beck-ford-secret-key` |
| `beck-nissan` | BECK NISSAN | `/MP15931.csv` | `/csv/beck-nissan` | `beck-nissan-secret-key` |

---

## ✅ Configuration Created

I've created:
- ✅ `server/config.json` - Multi-store configuration with all 4 stores
- ✅ Updated server code to support environment variable replacement

---

## 🔧 Railway Environment Variables

Add these in Railway → Variables:

```
SFTP_HOST = sftp.transfer.vauto.com
SFTP_PORT = 22
SFTP_USERNAME = your-sftp-username
SFTP_PASSWORD = your-sftp-password
```

**That's it!** The server will use these credentials for all 4 stores.

---

## 📤 Push config.json to GitHub

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Add config.json
git add server/config.json server/sftp-proxy.js

# Commit
git commit -m "Add multi-store configuration for all 4 stores"

# Push
git push
```

---

## 🚀 After Deployment

Your server will have these endpoints:

### Health Check
```
GET https://your-app.up.railway.app/health
```

### List All Stores
```
GET https://your-app.up.railway.app/stores
```

### Get CSV for Each Store

**BECK CDJR:**
```
GET https://your-app.up.railway.app/csv/beck-cdjr?apiKey=beck-cdjr-secret-key
```

**BECK CHEVY:**
```
GET https://your-app.up.railway.app/csv/beck-chevy?apiKey=beck-chevy-secret-key
```

**BECK FORD:**
```
GET https://your-app.up.railway.app/csv/beck-ford?apiKey=beck-ford-secret-key
```

**BECK NISSAN:**
```
GET https://your-app.up.railway.app/csv/beck-nissan?apiKey=beck-nissan-secret-key
```

---

## 🔄 Update Chrome Extensions

### For BECK CDJR Employees:
- CSV URL: `https://your-app.up.railway.app/csv/beck-cdjr`
- API Key: `beck-cdjr-secret-key`

### For BECK CHEVY Employees:
- CSV URL: `https://your-app.up.railway.app/csv/beck-chevy`
- API Key: `beck-chevy-secret-key`

### For BECK FORD Employees:
- CSV URL: `https://your-app.up.railway.app/csv/beck-ford`
- API Key: `beck-ford-secret-key`

### For BECK NISSAN Employees:
- CSV URL: `https://your-app.up.railway.app/csv/beck-nissan`
- API Key: `beck-nissan-secret-key`

---

## ✅ How It Works

1. **Server loads `config.json`** - Contains all 4 stores with file paths
2. **Replaces environment variables** - `${SFTP_HOST}` → actual value from Railway
3. **Each store uses same SFTP credentials** - But different CSV file paths
4. **Per-store API keys** - Each store has its own API key for security

---

## 🔐 Security

- ✅ Passwords stored in Railway environment variables (not in code)
- ✅ Per-store API keys (each store has different key)
- ✅ HTTPS automatically enabled
- ✅ CORS enabled for Chrome extension

---

## 📋 Checklist

- [x] Multi-store config.json created
- [x] Server code updated to support environment variables
- [ ] config.json pushed to GitHub
- [ ] Environment variables added in Railway
- [ ] Railway redeployed
- [ ] All 4 store endpoints tested
- [ ] Chrome extensions updated

---

## 🎉 Ready!

Your server is configured for all 4 stores. Just:
1. Push `config.json` to GitHub
2. Add environment variables in Railway
3. Test each store endpoint
4. Update Chrome extensions

**All 4 stores will be accessible from one Railway deployment!** 🚀
