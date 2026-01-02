# Migration Guide: From Localhost to Public Hosting

This guide explains what has been changed and what you need to do to make your server accessible to anyone with an internet connection.

---

## 📋 What Has Been Changed

### New Files Created:

1. **`PUBLIC_HOSTING_DEPLOYMENT.md`** - Complete deployment guide
   - Step-by-step instructions for Railway, Render, Fly.io
   - Environment variable configuration
   - Security best practices
   - Troubleshooting guide

2. **`QUICK_PUBLIC_HOSTING_SETUP.md`** - Quick 5-minute setup guide
   - Condensed version for fast deployment
   - Railway and Render quick start

3. **`MIGRATE_TO_PUBLIC_HOSTING.md`** - This file
   - Overview of changes
   - Migration steps

### Files Updated:

1. **`CONFIGURE_EXTENSIONS_FOR_STORES.md`**
   - Added public URL examples
   - Kept localhost for local development

2. **`STORE_CONFIGURATION.md`**
   - Added public URL examples alongside local URLs
   - Added note about replacing placeholder URL

3. **`DEPLOY_WITHOUT_CHROME_STORE.md`**
   - Updated employee configuration examples
   - Added both public and local network options

---

## 🎯 What You Need to Do

### Step 1: Choose a Hosting Service (5 minutes)

**Recommended:** Railway (easiest) or Render

- **Railway:** https://railway.app/ (Free tier available)
- **Render:** https://render.com/ (Free tier available)

See `QUICK_PUBLIC_HOSTING_SETUP.md` for fastest setup.

### Step 2: Prepare Your Server Code (10 minutes)

Your server code needs to read from environment variables. Check if `sftp-proxy.js` already does this, or update it:

```javascript
// Example: Read from environment variables
const config = {
  sftp: {
    host: process.env.SFTP_HOST || 'sftp.transfer.vauto.com',
    port: parseInt(process.env.SFTP_PORT) || 22,
    username: process.env.SFTP_USERNAME || '',
    password: process.env.SFTP_PASSWORD || '',
    path: process.env.SFTP_PATH || '/MP15932.csv'
  },
  server: {
    port: process.env.PORT || 3000,
    apiKey: process.env.API_KEY || 'default-key'
  }
};
```

### Step 3: Deploy to Hosting Service (15 minutes)

Follow the guide in `PUBLIC_HOSTING_DEPLOYMENT.md`:

1. Create account on hosting service
2. Connect GitHub repository (or upload code)
3. Configure environment variables
4. Deploy
5. Get your public URL

### Step 4: Update Extension Configuration (5 minutes per employee)

For each Chrome extension installation:

1. Open extension → Settings
2. Update CSV URL to your public URL:
   - **Before:** `http://localhost:3000/csv/beck-cdjr`
   - **After:** `https://your-app.up.railway.app/csv/beck-cdjr`
3. Verify API key matches
4. Save settings
5. Test that vehicles load

### Step 5: Update Documentation (Optional)

If you have custom documentation, update any references to:
- `localhost:3000` → Your public URL
- `10.26.1.230:3000` → Your public URL (or keep for local network)

---

## 🔄 Migration Options

### Option A: Full Migration (Recommended)

- Deploy to public hosting
- Update all extensions to use public URL
- Keep localhost for development only

**Benefits:**
- ✅ Works from anywhere
- ✅ No network restrictions
- ✅ Automatic HTTPS
- ✅ Professional setup

### Option B: Hybrid Approach

- Keep localhost for local network users
- Use public URL for remote employees

**Benefits:**
- ✅ Flexibility
- ✅ Can test locally
- ⚠️ Two configurations to maintain

### Option C: Development Only

- Keep using localhost for now
- Deploy to public hosting later

**Benefits:**
- ✅ No immediate changes needed
- ⚠️ Still limited to local network

---

## 📝 Before You Start Checklist

- [ ] Read `PUBLIC_HOSTING_DEPLOYMENT.md` or `QUICK_PUBLIC_HOSTING_SETUP.md`
- [ ] Choose hosting service (Railway recommended)
- [ ] Verify server code reads from environment variables
- [ ] Have SFTP credentials ready
- [ ] Have API keys ready
- [ ] GitHub repository ready (if using GitHub deployment)

---

## 🚀 Quick Start (Fastest Path)

1. **Go to Railway:** https://railway.app/
2. **Sign up** with GitHub
3. **New Project** → Deploy from GitHub
4. **Select your repo**
5. **Add environment variables:**
   - `SFTP_HOST`
   - `SFTP_USERNAME`
   - `SFTP_PASSWORD`
   - `SFTP_PATH`
   - `API_KEY`
6. **Get your URL:** `https://your-app.up.railway.app`
7. **Update extensions** to use the new URL

**Total time: ~15 minutes**

---

## 🔐 Security Reminders

1. **Never commit passwords to GitHub**
   - Use environment variables
   - Add `config.json` to `.gitignore`

2. **Use API keys**
   - Protect your endpoints
   - Different keys per store (if multi-store)

3. **Use HTTPS**
   - All hosting services provide this automatically
   - Never use HTTP in production

4. **Rotate credentials regularly**
   - Change API keys periodically
   - Update SFTP passwords if compromised

---

## 🆘 Need Help?

1. **Deployment issues:** See `PUBLIC_HOSTING_DEPLOYMENT.md` troubleshooting section
2. **Extension won't connect:** 
   - Verify URL uses HTTPS
   - Check API key matches
   - Test URL in browser first
3. **Server errors:** Check hosting service logs

---

## ✅ After Migration Checklist

- [ ] Server deployed and accessible
- [ ] Health check works: `https://your-app/health`
- [ ] CSV endpoint works: `https://your-app/csv`
- [ ] All extensions updated with new URL
- [ ] Extensions can fetch CSV successfully
- [ ] Employees can use extension from anywhere
- [ ] Documentation updated (if needed)

---

## 🎉 You're Done!

Once deployed, your server is accessible to:
- ✅ Anyone with an internet connection
- ✅ Remote employees
- ✅ Multiple locations
- ✅ No network restrictions

**Your extension will work from anywhere in the world!** 🌐

---

## 📚 Related Documentation

- **`PUBLIC_HOSTING_DEPLOYMENT.md`** - Complete deployment guide
- **`QUICK_PUBLIC_HOSTING_SETUP.md`** - Fast setup guide
- **`CONFIGURE_EXTENSIONS_FOR_STORES.md`** - Extension configuration
- **`STORE_CONFIGURATION.md`** - Store-specific settings

---

**Ready to deploy? Start with `QUICK_PUBLIC_HOSTING_SETUP.md` for the fastest setup!**

