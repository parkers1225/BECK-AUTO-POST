# Fix Railway Deployment - Deploy from Server Folder

Railway is trying to deploy from the root directory, but your server code is in the `server/` folder. Here's how to fix it.

---

## 🔧 Solution: Configure Railway to Use Server Folder

### Option 1: Set Root Directory in Railway (Easiest)

1. **In Railway Dashboard:**
   - Click on your service
   - Go to **"Settings"** tab
   - Scroll to **"Root Directory"** section
   - Enter: `server`
   - Click **"Save"**

2. **Railway will automatically redeploy** with the correct directory

3. **That's it!** Railway will now look in the `server` folder for your code.

---

## 🔧 Option 2: Create railway.json (Alternative)

If Option 1 doesn't work, create a `railway.json` file in your repository root:

1. **Create file:** `railway.json` in the root of your project

2. **Add this content:**
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "cd server && npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Commit and push:**
   ```powershell
   git add railway.json
   git commit -m "Add Railway configuration"
   git push
   ```

4. **Railway will redeploy automatically**

---

## 🔧 Option 3: Move Server Files to Root (Not Recommended)

If you want to keep everything in root:

1. **Move server files to root:**
   ```powershell
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
   # Move server files to root
   Move-Item server\* .
   ```

2. **Update .gitignore** to exclude the server folder if needed

3. **Commit and push:**
   ```powershell
   git add .
   git commit -m "Move server files to root"
   git push
   ```

**Note:** This mixes extension files with server files. Not recommended.

---

## ✅ Recommended: Option 1 (Set Root Directory)

**This is the cleanest solution:**

1. **In Railway:**
   - Service → Settings → Root Directory
   - Enter: `server`
   - Save

2. **Verify your `server` folder has:**
   - `sftp-proxy.js` (your server file)
   - `package.json` (with dependencies and start script)
   - `Procfile` (optional but recommended)

3. **Railway will redeploy automatically**

---

## 📝 Verify Server Folder Structure

Your `server` folder should have:

```
server/
├── sftp-proxy.js       (your server code)
├── package.json        (with "start" script)
├── Procfile           (optional: web: node sftp-proxy.js)
└── config.json        (optional - use environment variables instead)
```

**Check `package.json` has:**
```json
{
  "scripts": {
    "start": "node sftp-proxy.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ssh2-sftp-client": "^10.0.0"
  }
}
```

---

## 🆘 Troubleshooting

### Railway Still Can't Find Server

**Problem:** Root directory set but still failing

**Solutions:**
- Verify `server` folder exists in GitHub repository
- Check `server/package.json` exists
- Verify `package.json` has `start` script
- Check Railway logs for specific errors

### "No start script" Error

**Problem:** Railway can't find start command

**Solutions:**
- Verify `server/package.json` has `"start": "node sftp-proxy.js"`
- Or create `Procfile` in `server` folder with: `web: node sftp-proxy.js`

### Deployment Still Fails

**Problem:** Other errors after setting root directory

**Solutions:**
- Check Railway logs for specific error
- Verify all dependencies in `package.json`
- Make sure `sftp-proxy.js` exists in `server` folder
- Check environment variables are set

---

## ✅ Quick Fix Checklist

- [ ] Go to Railway → Service → Settings
- [ ] Set Root Directory to: `server`
- [ ] Save changes
- [ ] Wait for redeployment
- [ ] Check logs for success
- [ ] Test health endpoint

---

## 🎯 After Fixing

Once Railway is configured correctly:

1. ✅ Railway will find `server/package.json`
2. ✅ Railway will run `npm install` in server folder
3. ✅ Railway will run `npm start` (which runs `node sftp-proxy.js`)
4. ✅ Your server will deploy successfully!

---

**Try Option 1 first - it's the easiest and cleanest solution!**

