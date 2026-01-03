# Quick Public Hosting Setup (5 Minutes)

**Railway is the BEST choice for your application.** This is the fastest way to get your server publicly accessible.

---

## 🚀 Railway - RECOMMENDED (Best Choice)

### Step 1: Sign Up & Deploy (3 minutes)

1. Go to https://railway.app/
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Connect GitHub and select your repository
4. Railway auto-detects Node.js and deploys

### Step 2: Add Environment Variables (1 minute)

In Railway dashboard → Your Service → Variables:

```
SFTP_HOST=sftp.transfer.vauto.com
SFTP_PORT=22
SFTP_USERNAME=your-username
SFTP_PASSWORD=your-password
SFTP_PATH=/MP15932.csv
API_KEY=your-secret-key-here
```

**Note:** Update your server code to read from `process.env.SFTP_HOST` etc. if it doesn't already.

### Step 3: Get Your Public URL (30 seconds)

1. Railway provides: `https://your-app-name.up.railway.app`
2. Click Settings → Generate Domain (optional custom domain)

### Step 4: Update Extension (30 seconds)

1. Open extension → Settings
2. CSV URL: `https://your-app-name.up.railway.app/csv`
3. API Key: (the one you set above)
4. Save Settings

**Done!** ✅

---

## 🔄 Alternative: Render (Same Process)

1. Go to https://render.com/
2. New → Web Service → Connect GitHub
3. Build: `npm install`
4. Start: `node sftp-proxy.js`
5. Add environment variables (same as above)
6. Deploy → Get URL: `https://your-app.onrender.com`

---

## 📝 Required Server Code Updates

Your `sftp-proxy.js` should use environment variables:

```javascript
const PORT = process.env.PORT || 3000;

const config = {
  sftp: {
    host: process.env.SFTP_HOST || 'sftp.transfer.vauto.com',
    port: parseInt(process.env.SFTP_PORT) || 22,
    username: process.env.SFTP_USERNAME || 'default',
    password: process.env.SFTP_PASSWORD || '',
    path: process.env.SFTP_PATH || '/path/to/file.csv'
  },
  server: {
    port: PORT,
    apiKey: process.env.API_KEY || 'default-key'
  }
};
```

---

## ✅ Test Your Deployment

```bash
# Health check
curl https://your-app.up.railway.app/health

# CSV endpoint
curl https://your-app.up.railway.app/csv?apiKey=your-key

# Multi-store
curl https://your-app.up.railway.app/csv/beck-cdjr?apiKey=your-key
```

---

## 🔐 Security Reminder

- ✅ Use HTTPS (automatic on all hosting services)
- ✅ Use API keys (required for production)
- ✅ Never commit passwords to GitHub
- ✅ Use environment variables for secrets

---

## 🆘 Quick Troubleshooting

**Deployment fails?**
- Check `package.json` has `"start": "node sftp-proxy.js"`
- Verify Node.js version (14+)

**Extension can't connect?**
- Use HTTPS (not HTTP)
- Check API key matches
- Test URL in browser first

**CORS errors?**
- Add CORS headers to server (see full guide)

---

**For detailed instructions, see `PUBLIC_HOSTING_DEPLOYMENT.md`**

