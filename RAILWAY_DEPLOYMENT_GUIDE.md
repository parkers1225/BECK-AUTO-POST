# Railway Deployment Guide - RECOMMENDED

**Railway is the BEST choice for your SFTP proxy server.** This guide will get you deployed in 15 minutes.

---

## ✅ Why Railway is Best for Your Application

1. **Easiest Setup** - 5 minutes, no server management
2. **Free Tier** - $5 free credit monthly, perfect for testing
3. **Automatic HTTPS** - SSL certificates handled automatically
4. **GitHub Integration** - Deploy automatically on code push
5. **Zero Maintenance** - Railway manages everything
6. **Perfect for Node.js** - Optimized for your exact use case
7. **Environment Variables** - Secure credential management
8. **Auto-scaling** - Handles traffic automatically

---

## 🚀 Step-by-Step Deployment (15 Minutes)

### Step 1: Sign Up for Railway (2 minutes)

1. Go to **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended) or email
4. Verify your email if needed

### Step 2: Prepare Your Server Code (3 minutes)

**Check if your server code exists:**

1. Navigate to your server folder:
   ```powershell
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
   ```

2. **Verify you have these files:**
   - `sftp-proxy.js` (your server code)
   - `package.json` (with dependencies)

3. **Create/Update `package.json`:**

   If it doesn't exist or needs updating, create it:
   ```json
   {
     "name": "sftp-proxy",
     "version": "1.0.0",
     "description": "SFTP Proxy Server for Chrome Extension",
     "main": "sftp-proxy.js",
     "scripts": {
       "start": "node sftp-proxy.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "ssh2-sftp-client": "^10.0.0"
     },
     "engines": {
       "node": ">=14.0.0"
     }
   }
   ```

4. **Create `Procfile`** (for Railway):

   Create a file named `Procfile` (no extension) in your server folder:
   ```
   web: node sftp-proxy.js
   ```

5. **Update `sftp-proxy.js` to use environment variables:**

   Your server should read from environment variables. Update the port:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

   And update config to read from environment:
   ```javascript
   const config = {
     sftp: {
       host: process.env.SFTP_HOST || configFile.sftp.host,
       port: parseInt(process.env.SFTP_PORT) || configFile.sftp.port,
       username: process.env.SFTP_USERNAME || configFile.sftp.username,
       password: process.env.SFTP_PASSWORD || configFile.sftp.password,
       path: process.env.SFTP_PATH || configFile.sftp.path
     },
     server: {
       port: PORT,
       apiKey: process.env.API_KEY || configFile.server.apiKey
     }
   };
   ```

### Step 3: Push to GitHub (If Not Already) (5 minutes)

**If your code is already on GitHub, skip to Step 4.**

1. **Initialize Git (if needed):**
   ```powershell
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository:**
   - Go to https://github.com/new
   - Create a new repository (e.g., "beck-sftp-proxy")
   - **Don't** initialize with README (you already have files)

3. **Push to GitHub:**
   ```powershell
   git remote add origin https://github.com/your-username/beck-sftp-proxy.git
   git branch -M main
   git push -u origin main
   ```

### Step 4: Deploy to Railway (3 minutes)

1. **In Railway Dashboard:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**

2. **Select Your Repository:**
   - Choose the repository with your server code
   - Railway will auto-detect it's a Node.js project

3. **Railway will automatically:**
   - Detect `package.json`
   - Run `npm install`
   - Start your server using the `start` script
   - Assign a public URL

### Step 5: Configure Environment Variables (2 minutes)

1. **In Railway Dashboard:**
   - Click on your deployed service
   - Go to **"Variables"** tab

2. **Add these environment variables:**

   Click **"New Variable"** and add each:

   ```
   SFTP_HOST = sftp.transfer.vauto.com
   SFTP_PORT = 22
   SFTP_USERNAME = your-sftp-username
   SFTP_PASSWORD = your-sftp-password
   SFTP_PATH = /MP15932.csv
   API_KEY = your-secret-api-key-here
   ```

   **Important:**
   - Replace `your-sftp-username` with your actual SFTP username
   - Replace `your-sftp-password` with your actual SFTP password
   - Replace `/MP15932.csv` with your actual CSV path
   - Replace `your-secret-api-key-here` with a secure random string

3. **Railway will automatically redeploy** when you add variables

### Step 6: Get Your Public URL (1 minute)

1. **In Railway Dashboard:**
   - Click on your service
   - Go to **"Settings"** tab
   - Scroll to **"Domains"** section

2. **You'll see your Railway URL:**
   - Format: `https://your-app-name.up.railway.app`
   - Or: `https://your-project-name-production.up.railway.app`

3. **Optional - Custom Domain:**
   - Click **"Generate Domain"** for a shorter URL
   - Or add your own domain if you have one

### Step 7: Test Your Deployment (1 minute)

1. **Test Health Endpoint:**
   ```
   https://your-app-name.up.railway.app/health
   ```
   Should return: `{"status":"ok",...}`

2. **Test CSV Endpoint:**
   ```
   https://your-app-name.up.railway.app/csv?apiKey=your-api-key
   ```
   Should return your CSV data

3. **For Multi-Store:**
   ```
   https://your-app-name.up.railway.app/csv/beck-cdjr?apiKey=your-api-key
   ```

---

## 🔧 Update Your Chrome Extension

### Step 1: Open Extension Settings

1. Click extension icon in Chrome
2. Click **Settings (⚙️)** button

### Step 2: Update CSV URL

1. Under **"CSV Data Source"**, select **"Auto-sync from URL"**
2. Enter your Railway URL:

   **For single store:**
   ```
   https://your-app-name.up.railway.app/csv
   ```

   **For multi-store (BECK CDJR):**
   ```
   https://your-app-name.up.railway.app/csv/beck-cdjr
   ```

   **For multi-store (BECK CHEVY):**
   ```
   https://your-app-name.up.railway.app/csv/beck-chevy
   ```

   **For multi-store (BECK FORD):**
   ```
   https://your-app-name.up.railway.app/csv/beck-ford
   ```

   **For multi-store (BECK NISSAN):**
   ```
   https://your-app-name.up.railway.app/csv/beck-nissan
   ```

3. **Enter API Key:** (the one you set in Railway)
4. **Enable auto-refresh**
5. **Click "Save Settings"**

### Step 3: Test Extension

1. Extension should automatically fetch CSV
2. Verify vehicles appear in gallery
3. Check sync status shows "Updated [time]"

---

## 🔐 Security Best Practices

### 1. Use Strong API Keys

Generate a secure random string for your API key:
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use an online generator: https://randomkeygen.com/

### 2. Never Commit Secrets

**Create `.gitignore` in your server folder:**
```
config.json
.env
node_modules/
*.log
```

### 3. Use Different API Keys Per Store

If you have multiple stores, use different API keys:
- `BECK_CDJR_API_KEY`
- `BECK_CHEVY_API_KEY`
- etc.

### 4. Rotate Credentials Regularly

- Change API keys every 3-6 months
- Update SFTP passwords if compromised

---

## 📊 Railway Pricing

### Free Tier (Perfect for Testing)
- **$5 free credit** per month
- Enough for ~500 hours of runtime
- Perfect for your use case

### Paid Plans (If Needed)
- **Hobby:** $5/month - More resources
- **Pro:** $20/month - Production workloads

**For your SFTP proxy, the free tier is likely sufficient!**

---

## 🔄 Updating Your Code

### Automatic Deployment

1. **Make changes to your code**
2. **Commit and push to GitHub:**
   ```powershell
   git add .
   git commit -m "Update server code"
   git push
   ```
3. **Railway automatically redeploys** (usually within 1-2 minutes)

### Manual Redeploy

1. Go to Railway dashboard
2. Click on your service
3. Click **"Redeploy"** button

---

## 🐛 Troubleshooting

### Deployment Fails

**Problem:** Build fails or deployment errors

**Solutions:**
- Check `package.json` has correct `start` script
- Verify `Procfile` exists and is correct
- Check Railway logs (click "View Logs" in dashboard)
- Ensure Node.js version is 14+ (add to `package.json`)

### Server Starts But Returns Errors

**Problem:** Health check works but CSV endpoint fails

**Solutions:**
- Verify SFTP credentials in environment variables
- Check Railway logs for connection errors
- Test SFTP connection manually
- Verify CSV path is correct

### Extension Can't Connect

**Problem:** Extension shows "Failed to fetch CSV"

**Solutions:**
- Verify URL uses `https://` (not `http://`)
- Check API key matches Railway environment variable
- Test URL in browser first
- Check browser console (F12) for errors
- Verify Railway service is running (check dashboard)

### CORS Errors

**Problem:** Browser blocks requests

**Solutions:**
- Add CORS headers to your server code:
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

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] Server code pushed to GitHub
- [ ] `package.json` has `start` script
- [ ] `Procfile` created
- [ ] Server code reads from environment variables
- [ ] Deployed to Railway
- [ ] Environment variables configured
- [ ] Public URL obtained
- [ ] Health endpoint tested
- [ ] CSV endpoint tested
- [ ] Extension updated with new URL
- [ ] Extension tested and working

---

## 🎉 You're Done!

Your server is now:
- ✅ Accessible from anywhere with internet
- ✅ Using automatic HTTPS
- ✅ Automatically deploying from GitHub
- ✅ Fully managed by Railway
- ✅ Ready for production use

**Total setup time: ~15 minutes!**

---

## 📞 Need Help?

1. **Railway Documentation:** https://docs.railway.app/
2. **Railway Discord:** https://discord.gg/railway
3. **Check Railway Logs:** Dashboard → Your Service → Logs
4. **Test Endpoints:** Use browser or curl

---

## 🚀 Next Steps

1. ✅ Deploy to Railway (follow this guide)
2. ✅ Update all Chrome extensions with new URL
3. ✅ Test from different locations
4. ✅ Share URL with your team
5. ✅ Monitor Railway dashboard for usage

**Your SFTP proxy is now publicly accessible!** 🌐

