# Next Steps: Push to GitHub & Deploy to Railway

Git is installed! Now let's get your code on GitHub and deploy to Railway.

---

## 🚀 Step 1: Verify Git Works (30 seconds)

**Open a NEW PowerShell window** and test:

```powershell
git --version
```

**Should show:** `git version 2.x.x`

**If it works, continue! If not, restart your computer and try again.**

---

## ⚙️ Step 2: Configure Git (One Time - 30 seconds)

**In PowerShell, run:**

```powershell
# Replace with your actual name
git config --global user.name "Parker Sloan"

# Replace with your GitHub email
git config --global user.email "your-email@example.com"
```

---

## 📦 Step 3: Create GitHub Repository (1 minute)

1. **Go to:** https://github.com/new
2. **Repository name:** `beck-sftp-proxy`
3. **Visibility:** ✅ **Private** (recommended)
4. **IMPORTANT:** 
   - ❌ Don't check "Add a README file"
   - ❌ Don't check "Add .gitignore"
   - ❌ Don't check "Choose a license"
5. **Click:** "Create repository"

---

## 🔐 Step 4: Create Personal Access Token (2 minutes)

**GitHub requires a token (not password) for Git operations:**

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token" → "Generate new token (classic)"
3. **Name:** `Railway Deployment`
4. **Expiration:** Choose (90 days, 1 year, or no expiration)
5. **Scopes:** ✅ Check **"repo"** (full control of private repositories)
6. **Click:** "Generate token" (bottom of page)
7. **IMPORTANT:** Copy the token immediately! (You won't see it again)
8. **Save it somewhere safe** - you'll use it as your password

---

## 📤 Step 5: Push Your Code to GitHub (2 minutes)

**Open PowerShell in your project folder:**

```powershell
# Navigate to your project
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Initialize Git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - SFTP Proxy Server"

# Add GitHub as remote (REPLACE YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/beck-sftp-proxy.git

# Rename branch to main
git branch -M main

# Push to GitHub (you'll be prompted for username and password/token)
git push -u origin main
```

**When prompted:**
- **Username:** Your GitHub username
- **Password:** Paste your Personal Access Token (from Step 4)

**You should see:** `Writing objects: 100%` and success message!

---

## 🚂 Step 6: Deploy to Railway (2 minutes)

1. **In Railway Dashboard:**
   - Go to https://railway.app/
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**

2. **If you see "No repositories":**
   - Click **"Configure GitHub App"** or **"Connect GitHub"**
   - Authorize Railway to access your repositories
   - Select repositories (or all repositories)
   - Click **"Install"** or **"Authorize"**

3. **Select Your Repository:**
   - Your `beck-sftp-proxy` repository should appear
   - Click on it
   - Railway will automatically start deploying!

4. **Wait for deployment** (1-2 minutes)
   - Watch the logs
   - Wait for "Deployment successful"

---

## 🔧 Step 7: Configure Environment Variables (2 minutes)

1. **In Railway Dashboard:**
   - Click on your deployed service
   - Go to **"Variables"** tab

2. **Add these environment variables:**

   Click **"New Variable"** for each:

   ```
   SFTP_HOST = sftp.transfer.vauto.com
   SFTP_PORT = 22
   SFTP_USERNAME = your-sftp-username
   SFTP_PASSWORD = your-sftp-password
   SFTP_PATH = /MP15932.csv
   API_KEY = your-secret-api-key-here
   ```

   **Replace:**
   - `your-sftp-username` with your actual SFTP username
   - `your-sftp-password` with your actual SFTP password
   - `/MP15932.csv` with your actual CSV file path
   - `your-secret-api-key-here` with a random secure string

3. **Railway will automatically redeploy** when you add variables

---

## 🌐 Step 8: Get Your Public URL (30 seconds)

1. **In Railway Dashboard:**
   - Click on your service
   - Go to **"Settings"** tab
   - Scroll to **"Domains"** section

2. **Your URL will be:**
   - `https://your-app-name.up.railway.app`
   - Or: `https://your-project-name-production.up.railway.app`

3. **Optional - Custom Domain:**
   - Click **"Generate Domain"** for a shorter URL

---

## ✅ Step 9: Test Your Deployment (1 minute)

**Test in browser:**

1. **Health check:**
   ```
   https://your-app-name.up.railway.app/health
   ```
   Should return: `{"status":"ok",...}`

2. **CSV endpoint:**
   ```
   https://your-app-name.up.railway.app/csv?apiKey=your-api-key
   ```
   Should return your CSV data

---

## 🔄 Step 10: Update Chrome Extension (2 minutes)

1. **Open Chrome extension popup**
2. **Click Settings (⚙️)**
3. **Under "CSV Data Source", select "Auto-sync from URL"**
4. **Enter your Railway URL:**

   **For single store:**
   ```
   https://your-app-name.up.railway.app/csv
   ```

   **For multi-store (BECK CDJR):**
   ```
   https://your-app-name.up.railway.app/csv/beck-cdjr
   ```

5. **Enter API Key:** (the one you set in Railway)
6. **Enable auto-refresh**
7. **Click "Save Settings"**
8. **Verify vehicles appear in gallery**

---

## ✅ Checklist

- [ ] Git verified (`git --version` works)
- [ ] Git configured (name and email)
- [ ] GitHub repository created
- [ ] Personal Access Token created
- [ ] Code pushed to GitHub
- [ ] Railway connected to GitHub
- [ ] Repository selected in Railway
- [ ] Deployment successful
- [ ] Environment variables added
- [ ] Public URL obtained
- [ ] Endpoints tested
- [ ] Chrome extension updated
- [ ] Extension tested and working

---

## 🎉 You're Done!

Your server is now:
- ✅ On GitHub
- ✅ Deployed to Railway
- ✅ Publicly accessible via HTTPS
- ✅ Connected to your Chrome extension
- ✅ Ready for use!

---

## 🆘 Troubleshooting

### "Repository not found" when pushing

**Solution:**
- Check repository name matches exactly
- Verify you created the repository on GitHub
- Check your GitHub username is correct

### "Authentication failed" when pushing

**Solution:**
- Use Personal Access Token (not password)
- Make sure token has "repo" scope
- Copy token exactly (no extra spaces)

### "No repositories" in Railway

**Solution:**
- Click "Configure GitHub App" again
- Make sure you authorized Railway
- Refresh Railway page
- Check repository is on GitHub

### Deployment fails in Railway

**Solution:**
- Check Railway logs for errors
- Verify `package.json` exists with `start` script
- Check environment variables are set
- Make sure server code is in the repository

---

## 📝 Quick Reference

**Your Railway URL format:**
```
https://your-app-name.up.railway.app
```

**Extension CSV URL:**
```
https://your-app-name.up.railway.app/csv
```

**Or for multi-store:**
```
https://your-app-name.up.railway.app/csv/beck-cdjr
```

---

**Ready to proceed? Start with Step 1 and work through each step!** 🚀

