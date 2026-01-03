# Quick GitHub Setup for Railway (5 Minutes)

If Railway says "no repository to deploy", you need to create a GitHub repository first. Here's the fastest way:

---

## 🚀 Step 1: Create GitHub Account (If Needed)

1. Go to **https://github.com/signup**
2. Create a free account
3. Verify your email

**Already have GitHub? Skip to Step 2.**

---

## 🚀 Step 2: Create Repository on GitHub (1 minute)

1. **Go to:** https://github.com/new
2. **Repository name:** `beck-sftp-proxy` (or any name you want)
3. **Description:** (optional) "SFTP Proxy Server for Chrome Extension"
4. **Visibility:** 
   - ✅ **Private** (recommended - keeps your code secure)
   - Or Public (if you don't mind sharing)
5. **IMPORTANT:** 
   - ❌ **Don't** check "Add a README file"
   - ❌ **Don't** check "Add .gitignore"
   - ❌ **Don't** check "Choose a license"
6. **Click:** **"Create repository"**

---

## 🚀 Step 3: Push Your Code to GitHub (3 minutes)

### Option A: Using PowerShell (Recommended)

**Open PowerShell in your project folder:**

```powershell
# Navigate to your project
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Check if Git is installed
git --version
```

**If Git is NOT installed:**
1. Download: https://git-scm.com/download/win
2. Install with default settings
3. Restart PowerShell

**If Git IS installed, continue:**

```powershell
# Initialize Git repository (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - SFTP Proxy Server"

# Add GitHub as remote (REPLACE YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/beck-sftp-proxy.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**You'll be prompted for:**
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (see below)

### Option B: Using GitHub Desktop (Easier)

1. **Download GitHub Desktop:**
   - https://desktop.github.com/
   - Install it

2. **Sign in to GitHub Desktop:**
   - Use your GitHub account

3. **Add your project:**
   - Click **"File"** → **"Add Local Repository"**
   - Browse to: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`
   - Click **"Add Repository"**

4. **Commit and Push:**
   - Enter commit message: "Initial commit"
   - Click **"Commit to main"**
   - Click **"Publish repository"**
   - Check **"Keep this code private"** (recommended)
   - Click **"Publish repository"**

---

## 🔐 Step 4: Create GitHub Personal Access Token

**GitHub no longer accepts passwords for Git operations. You need a token:**

1. **Go to:** https://github.com/settings/tokens
2. **Click:** **"Generate new token"** → **"Generate new token (classic)"**
3. **Name:** `Railway Deployment` (or any name)
4. **Expiration:** Choose duration (90 days, 1 year, or no expiration)
5. **Scopes:** Check **"repo"** (this gives access to repositories)
6. **Click:** **"Generate token"**
7. **IMPORTANT:** Copy the token immediately (you won't see it again!)
8. **Use this token as your password** when pushing code

**Save the token somewhere safe!**

---

## 🚀 Step 5: Connect Railway to GitHub (1 minute)

1. **In Railway Dashboard:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**

2. **Authorize Railway:**
   - Click **"Configure GitHub App"** or **"Connect GitHub"**
   - Authorize Railway to access your repositories
   - Select the repositories you want to give access to
   - Click **"Install"** or **"Authorize"**

3. **Select Your Repository:**
   - Your `beck-sftp-proxy` repository should now appear
   - Click on it
   - Railway will start deploying automatically!

---

## ✅ Verify It's Working

1. **Railway will automatically:**
   - Detect it's a Node.js project
   - Install dependencies
   - Start your server

2. **Check deployment:**
   - Watch the logs in Railway dashboard
   - Wait for "Deployment successful"

3. **Get your URL:**
   - Railway provides a URL like: `https://your-app.up.railway.app`
   - Click on your service → Settings → Domains

---

## 🆘 Troubleshooting

### "Repository not found" Error

**Problem:** GitHub can't find your repository

**Solutions:**
- Make sure you pushed code successfully
- Check repository name matches exactly
- Verify you're logged into correct GitHub account
- Try refreshing Railway page

### "Authentication failed" When Pushing

**Problem:** Can't push to GitHub

**Solutions:**
- Use Personal Access Token (not password)
- Make sure token has "repo" scope
- Check token hasn't expired

### "No repositories" in Railway

**Problem:** Railway doesn't show your repos

**Solutions:**
- Click "Configure GitHub App" again
- Make sure you authorized Railway
- Check you selected the right repositories
- Refresh Railway page

### Git Not Installed

**Problem:** `git --version` says command not found

**Solutions:**
- Download Git: https://git-scm.com/download/win
- Install with default settings
- Restart PowerShell
- Or use GitHub Desktop instead

---

## 📝 Quick Reference Commands

```powershell
# Navigate to project
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Initialize Git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Add GitHub remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/beck-sftp-proxy.git

# Push
git branch -M main
git push -u origin main
```

---

## ✅ Checklist

- [ ] GitHub account created
- [ ] Repository created on GitHub
- [ ] Git installed (or GitHub Desktop)
- [ ] Code pushed to GitHub
- [ ] Railway connected to GitHub
- [ ] Repository selected in Railway
- [ ] Deployment started

---

## 🎉 You're Done!

Once your code is on GitHub and Railway is connected:
1. Railway will automatically deploy
2. You'll get a public URL
3. Add environment variables
4. Update your Chrome extension

**Total time: ~5 minutes!**

---

**Need help? Check which step you're stuck on and let me know!**

