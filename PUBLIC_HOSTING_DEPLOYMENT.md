# Deploy Proxy Server to Public Hosting (Accessible to Anyone)

This guide will help you deploy your SFTP proxy server to a public hosting service so it's accessible to anyone with an internet connection, not just on your local network.

---

## 🚀 Quick Start - Choose Your Hosting Service

**Recommended Options:**
1. **Railway** (Easiest) - Free tier available, automatic HTTPS ⭐ **BEST CHOICE**
2. **Render** (Easy) - Free tier available, automatic HTTPS  
3. **Heroku** (Popular) - Paid plans only (no free tier)
4. **Fly.io** (Fast) - Free tier available
5. **DigitalOcean App Platform** (Reliable) - Paid plans
6. **Hostinger VPS** (Advanced) - Requires manual setup, see `HOSTINGER_DEPLOYMENT.md`

**For this guide, we'll use Railway (recommended for beginners) or Render.**

**Note:** Hostinger shared hosting won't work - you need VPS for Node.js. See `HOSTINGER_DEPLOYMENT.md` for details.

---

## Option 1: Deploy to Railway (Recommended - Easiest)

### Step 1: Create Railway Account

1. Go to https://railway.app/
2. Click "Start a New Project"
3. Sign up with GitHub (recommended) or email

### Step 2: Prepare Your Server for Deployment

1. **Navigate to your server folder:**
   ```powershell
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
   ```

2. **Create a `Procfile` (if it doesn't exist):**
   Create a file named `Procfile` (no extension) with this content:
   ```
   web: node sftp-proxy.js
   ```

3. **Update `package.json` to include start script:**
   Open `package.json` and ensure it has:
   ```json
   {
     "name": "sftp-proxy",
     "version": "1.0.0",
     "scripts": {
       "start": "node sftp-proxy.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "ssh2-sftp-client": "^10.0.0"
     }
   }
   ```

4. **Update server code to use PORT environment variable:**
   Your `sftp-proxy.js` should use:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```
   (Most hosting services set the PORT automatically)

### Step 3: Deploy to Railway

1. **In Railway dashboard, click "New Project"**
2. **Select "Deploy from GitHub repo"** (recommended) or "Empty Project"
3. **If using GitHub:**
   - Connect your GitHub account
   - Select your repository
   - Railway will auto-detect Node.js
4. **If using Empty Project:**
   - Click "Empty Project"
   - Click "Add Service" → "GitHub Repo"
   - Select your repository

### Step 4: Configure Environment Variables

1. **In Railway, go to your service → Variables tab**
2. **Add these environment variables:**
   - `PORT` - Railway sets this automatically (don't override)
   - `NODE_ENV=production`

3. **For SFTP credentials, you have two options:**

   **Option A: Use Railway Variables (Recommended)**
   - Add variables for SFTP config:
     - `SFTP_HOST=sftp.transfer.vauto.com`
     - `SFTP_PORT=22`
     - `SFTP_USERNAME=your-username`
     - `SFTP_PASSWORD=your-password`
     - `SFTP_PATH=/MP15932.csv`
   
   **Option B: Use config.json (Less Secure)**
   - Upload your `config.json` to Railway
   - Railway will read it from the project

### Step 5: Update Server Code for Environment Variables (If Needed)

If your server code reads from `config.json`, you may need to update it to also read from environment variables:

```javascript
// Example: Read from environment variables if available
const config = {
  sftp: {
    host: process.env.SFTP_HOST || configFile.sftp.host,
    port: parseInt(process.env.SFTP_PORT) || configFile.sftp.port,
    username: process.env.SFTP_USERNAME || configFile.sftp.username,
    password: process.env.SFTP_PASSWORD || configFile.sftp.password,
    path: process.env.SFTP_PATH || configFile.sftp.path
  },
  server: {
    port: process.env.PORT || 3000,
    apiKey: process.env.API_KEY || configFile.server.apiKey
  }
};
```

### Step 6: Deploy

1. **Railway will automatically deploy when you:**
   - Push to GitHub (if connected)
   - Or click "Deploy" in the dashboard

2. **Wait for deployment to complete** (2-5 minutes)

3. **Get your public URL:**
   - Railway provides a URL like: `https://your-app-name.up.railway.app`
   - Click on your service → Settings → Generate Domain
   - Or use the default: `https://your-project-name-production.up.railway.app`

### Step 7: Test Your Deployment

1. **Health check:**
   ```
   https://your-app-name.up.railway.app/health
   ```

2. **CSV endpoint:**
   ```
   https://your-app-name.up.railway.app/csv
   ```

3. **For multi-store:**
   ```
   https://your-app-name.up.railway.app/csv/beck-cdjr?apiKey=your-api-key
   ```

---

## Option 2: Deploy to Render (Alternative - Also Easy)

### Step 1: Create Render Account

1. Go to https://render.com/
2. Sign up with GitHub (recommended) or email

### Step 2: Create New Web Service

1. **Click "New +" → "Web Service"**
2. **Connect your GitHub repository** (or use public repo)
3. **Configure:**
   - **Name:** `sftp-proxy` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node sftp-proxy.js`
   - **Plan:** Free (or paid for better performance)

### Step 3: Add Environment Variables

1. **In Render dashboard, go to Environment tab**
2. **Add variables:**
   - `SFTP_HOST=sftp.transfer.vauto.com`
   - `SFTP_PORT=22`
   - `SFTP_USERNAME=your-username`
   - `SFTP_PASSWORD=your-password`
   - `SFTP_PATH=/MP15932.csv`
   - `API_KEY=your-api-key` (optional)

### Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (3-5 minutes)
3. **Get your URL:** `https://your-app-name.onrender.com`

### Step 5: Test

Same as Railway - test `/health` and `/csv` endpoints.

---

## Option 3: Deploy to Fly.io (Fast & Free)

### Step 1: Install Fly CLI

```powershell
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Create Fly App

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
fly launch
```

Follow the prompts to create your app.

### Step 3: Configure Secrets

```powershell
fly secrets set SFTP_HOST=sftp.transfer.vauto.com
fly secrets set SFTP_PORT=22
fly secrets set SFTP_USERNAME=your-username
fly secrets set SFTP_PASSWORD=your-password
fly secrets set SFTP_PATH=/MP15932.csv
fly secrets set API_KEY=your-api-key
```

### Step 4: Deploy

```powershell
fly deploy
```

### Step 5: Get Your URL

```powershell
fly open
```

Or check dashboard: `https://fly.io/apps/your-app-name`

---

## 🔧 Updating Extension Configuration

After deploying, update your Chrome extension to use the public URL:

### Step 1: Get Your Public URL

From your hosting service, you'll get a URL like:
- Railway: `https://your-app.up.railway.app`
- Render: `https://your-app.onrender.com`
- Fly.io: `https://your-app.fly.dev`

### Step 2: Update Extension Settings

1. **Open Chrome extension popup**
2. **Click Settings (⚙️)**
3. **Under "CSV Data Source", select "Auto-sync from URL"**
4. **Enter your public URL:**

   **For single store:**
   ```
   https://your-app.up.railway.app/csv
   ```

   **For multi-store (BECK CDJR):**
   ```
   https://your-app.up.railway.app/csv/beck-cdjr
   ```

   **For multi-store (BECK CHEVY):**
   ```
   https://your-app.up.railway.app/csv/beck-chevy
   ```

   **For multi-store (BECK FORD):**
   ```
   https://your-app.up.railway.app/csv/beck-ford
   ```

   **For multi-store (BECK NISSAN):**
   ```
   https://your-app.up.railway.app/csv/beck-nissan
   ```

5. **Enter API Key** (if configured)
6. **Enable auto-refresh**
7. **Click "Save Settings"**

### Step 3: Test Extension

1. Extension should fetch CSV from public URL
2. Verify vehicles appear in gallery
3. Check sync status shows "Updated [time]"

---

## 🔐 Security Best Practices

### 1. Use Environment Variables for Secrets

**Never commit passwords or API keys to GitHub!**

- Use hosting service's environment variables
- Keep `config.json` out of version control
- Add `config.json` to `.gitignore`

### 2. Use API Keys

Always use API keys to protect your endpoints:

```javascript
// In your server code
const apiKey = req.query.apiKey || req.headers['x-api-key'];
if (apiKey !== config.server.apiKey) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 3. Use HTTPS

All hosting services provide HTTPS automatically. Always use `https://` URLs, never `http://`.

### 4. Rotate Credentials

- Change API keys regularly
- Update SFTP passwords if compromised
- Use different API keys per store

---

## 📝 Updating Documentation

After deployment, update these files to use your public URL:

1. **CONFIGURE_EXTENSIONS_FOR_STORES.md** - Replace `localhost:3000` with your public URL
2. **STORE_CONFIGURATION.md** - Update example URLs
3. **DEPLOY_WITHOUT_CHROME_STORE.md** - Update configuration examples

**Example updates:**

**Before:**
```
http://localhost:3000/csv/beck-cdjr
```

**After:**
```
https://your-app.up.railway.app/csv/beck-cdjr
```

---

## 🐛 Troubleshooting

### Deployment Fails

**Problem:** Build fails or deployment errors

**Solutions:**
- Check that `package.json` has correct dependencies
- Verify `Procfile` or start command is correct
- Check build logs in hosting dashboard
- Ensure Node.js version is compatible (14+)

### Server Starts But Returns Errors

**Problem:** Health check works but CSV endpoint fails

**Solutions:**
- Verify SFTP credentials in environment variables
- Check SFTP server allows connections from hosting IP
- Test SFTP connection manually
- Check server logs in hosting dashboard

### Extension Can't Connect

**Problem:** Extension shows "Failed to fetch CSV"

**Solutions:**
- Verify public URL is correct (use HTTPS)
- Check API key matches server configuration
- Verify hosting service is running (check dashboard)
- Test URL in browser first
- Check browser console for CORS errors

### CORS Errors

**Problem:** Browser blocks requests due to CORS

**Solutions:**
- Add CORS headers to your server:
  ```javascript
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
  ```

---

## 📊 Hosting Service Comparison

| Service | Free Tier | HTTPS | Ease of Use | Best For |
|---------|-----------|-------|-------------|----------|
| **Railway** | ✅ Yes | ✅ Auto | ⭐⭐⭐⭐⭐ | Beginners ⭐ **BEST** |
| **Render** | ✅ Yes | ✅ Auto | ⭐⭐⭐⭐ | Beginners |
| **Fly.io** | ✅ Yes | ✅ Auto | ⭐⭐⭐ | Advanced |
| **Heroku** | ❌ No | ✅ Auto | ⭐⭐⭐⭐ | Popular choice |
| **DigitalOcean** | ❌ No | ✅ Auto | ⭐⭐⭐ | Production |
| **Hostinger VPS** | ❌ No | ⚙️ Manual | ⭐⭐ | Full control |

---

## ✅ Deployment Checklist

- [ ] Created hosting account
- [ ] Prepared server code (Procfile, package.json)
- [ ] Deployed to hosting service
- [ ] Configured environment variables
- [ ] Tested public URL endpoints
- [ ] Updated extension configuration
- [ ] Tested extension with public URL
- [ ] Updated documentation
- [ ] Verified HTTPS is working
- [ ] Set up API keys for security

---

## 🎯 Next Steps

1. **Deploy your server** using one of the options above
2. **Get your public URL** from the hosting service
3. **Update extension configuration** in all Chrome extensions
4. **Test thoroughly** to ensure everything works
5. **Share the public URL** with your team

**Your server is now accessible to anyone with an internet connection!** 🌐

---

## 📞 Support

If you encounter issues:
1. Check hosting service logs
2. Test endpoints in browser
3. Verify environment variables
4. Check extension browser console (F12)
5. Review this guide's troubleshooting section

