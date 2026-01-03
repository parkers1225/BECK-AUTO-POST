# Railway Multi-Store Configuration Guide

Your server supports all 4 stores! Here's how to configure them in Railway using environment variables.

---

## 🏪 Store Configuration

| Store ID | Store Name | SFTP CSV File | API Key |
|----------|------------|---------------|---------|
| `beck-cdjr` | BECK CDJR | `/MP15932.csv` | `beck-cdjr-secret-key` |
| `beck-chevy` | BECK CHEVY | `/MP15933.csv` | `beck-chevy-secret-key` |
| `beck-ford` | BECK FORD | `/MP15935.csv` | `beck-ford-secret-key` |
| `beck-nissan` | BECK NISSAN | `/MP15931.csv` | `beck-nissan-secret-key` |

---

## 🔧 Option 1: Use config.json (Recommended)

The easiest way is to create a `config.json` file in the server folder with all 4 stores, then use environment variables only for the SFTP password (if it's the same for all stores).

### Step 1: Create Multi-Store config.json

I'll create a `config.json` file that you can commit to GitHub (without passwords), then override passwords with environment variables.

### Step 2: Add Environment Variables in Railway

Add these in Railway → Variables:

```
SFTP_HOST = sftp.transfer.vauto.com
SFTP_PORT = 22
SFTP_USERNAME = your-sftp-username
SFTP_PASSWORD = your-sftp-password
```

The server will use these for all stores.

---

## 🔧 Option 2: All Environment Variables

If you prefer to configure everything via environment variables, we can update the server code to read all 4 stores from environment variables.

---

## 📝 Current Server Capabilities

Your server already supports:
- ✅ Multi-store configuration (from config.json)
- ✅ Per-store CSV file paths
- ✅ Per-store API keys
- ✅ Endpoints: `/csv/beck-cdjr`, `/csv/beck-chevy`, `/csv/beck-ford`, `/csv/beck-nissan`
- ✅ Store listing: `/stores`
- ✅ Health check: `/health`

---

## 🚀 Quick Setup for Railway

### Method A: Commit config.json (Easier)

1. **Create `server/config.json`** with all 4 stores (I'll create this)
2. **Add environment variables** in Railway:
   - `SFTP_HOST`
   - `SFTP_USERNAME`  
   - `SFTP_PASSWORD`
3. **Server will use config.json** for store structure
4. **Server will use environment variables** for SFTP credentials

### Method B: All Environment Variables (More Secure)

1. **Update server code** to read all 4 stores from environment variables
2. **Add all variables** in Railway (one per store)
3. **No config.json needed**

---

## ✅ Recommended: Method A

I'll create a `config.json` file that:
- ✅ Defines all 4 stores
- ✅ Uses environment variables for SFTP credentials
- ✅ Can be committed to GitHub (no passwords in file)
- ✅ Easy to maintain

**Should I create the config.json file now?**

---

## 📋 Environment Variables Needed

**For Method A (config.json approach):**
```
SFTP_HOST = sftp.transfer.vauto.com
SFTP_PORT = 22
SFTP_USERNAME = your-username
SFTP_PASSWORD = your-password
```

**For Method B (all environment variables):**
```
SFTP_HOST = sftp.transfer.vauto.com
SFTP_PORT = 22
SFTP_USERNAME = your-username
SFTP_PASSWORD = your-password
BECK_CDJR_API_KEY = beck-cdjr-secret-key
BECK_CHEVY_API_KEY = beck-chevy-secret-key
BECK_FORD_API_KEY = beck-ford-secret-key
BECK_NISSAN_API_KEY = beck-nissan-secret-key
```

---

## 🎯 Next Steps

1. **I'll create the multi-store config.json** (Method A - recommended)
2. **You add environment variables** in Railway
3. **Push config.json** to GitHub
4. **Railway redeploys** with all 4 stores
5. **Test each store endpoint**

**Ready for me to create the config.json file?**
