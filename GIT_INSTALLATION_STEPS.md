# Git Installation Steps - Follow Along Guide

This guide will walk you through installing Git and then pushing your code to GitHub.

---

## 📥 Step 1: Download Git

1. **Go to:** https://git-scm.com/download/win
2. **Click:** The big "Download" button
3. **Wait** for the download to complete (file: `Git-2.x.x-64-bit.exe`)

---

## 🔧 Step 2: Install Git

### Installation Wizard Steps:

1. **Run the installer** (double-click the downloaded file)

2. **License Agreement:**
   - Click **"Next"**

3. **Select Destination Location:**
   - Keep default location
   - Click **"Next"**

4. **Select Components:**
   - ✅ **IMPORTANT:** Make sure "Git from the command line and also from 3rd-party software" is checked
   - ✅ Keep "Git Bash Here" checked
   - ✅ Keep "Git GUI Here" checked
   - Click **"Next"**

5. **Choosing the default editor:**
   - Default is fine (Nano editor)
   - Or choose "Visual Studio Code" if you have it
   - Click **"Next"**

6. **Adjusting your PATH environment:**
   - ✅ **Select:** "Git from the command line and also from 3rd-party software"
   - This is the most important option!
   - Click **"Next"**

7. **Choosing HTTPS transport backend:**
   - Keep default (OpenSSL library)
   - Click **"Next"**

8. **Configuring the line ending conversions:**
   - Keep default: "Checkout Windows-style, commit Unix-style line endings"
   - Click **"Next"**

9. **Configuring the terminal emulator:**
   - Keep default: "Use Windows' default console window"
   - Click **"Next"**

10. **Configuring extra options:**
    - Keep defaults checked
    - Click **"Next"**

11. **Configuring experimental options:**
    - Leave unchecked (default)
    - Click **"Install"**

12. **Installation in progress:**
    - Wait 1-2 minutes
    - Don't close the window!

13. **Completing the Git Setup Wizard:**
    - ✅ Check "Launch Git Bash" if you want (optional)
    - Click **"Finish"**

---

## ✅ Step 3: Verify Installation

1. **Close your current PowerShell window** (important!)

2. **Open a NEW PowerShell window:**
   - Press `Windows Key + X`
   - Select "Windows PowerShell" or "Terminal"

3. **Test Git:**
   ```powershell
   git --version
   ```

   **You should see:** `git version 2.x.x` (version number)

   **If you see an error:**
   - Restart your computer
   - Try again

---

## ⚙️ Step 4: Configure Git (One Time Setup)

**Open PowerShell and run these commands:**

```powershell
# Set your name (replace "Your Name" with your actual name)
git config --global user.name "Your Name"

# Set your email (use your GitHub email address)
git config --global user.email "your-email@example.com"
```

**Example:**
```powershell
git config --global user.name "Parker Sloan"
git config --global user.email "parker.sloan@example.com"
```

---

## 🚀 Step 5: Push Your Code to GitHub

Now that Git is installed, follow these steps:

### Step 5a: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Repository name:** `beck-sftp-proxy`
3. **Description:** (optional) "SFTP Proxy Server"
4. **Visibility:** ✅ **Private** (recommended)
5. **IMPORTANT:** 
   - ❌ Don't check "Add a README file"
   - ❌ Don't check "Add .gitignore"
   - ❌ Don't check "Choose a license"
6. **Click:** "Create repository"

### Step 5b: Push Your Code

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

# Push to GitHub
git push -u origin main
```

### Step 5c: Authentication

When you run `git push`, you'll be prompted:

1. **Username:** Enter your GitHub username
2. **Password:** Enter a **Personal Access Token** (NOT your GitHub password)

**To create a Personal Access Token:**
1. Go to: https://github.com/settings/tokens
2. Click: "Generate new token" → "Generate new token (classic)"
3. Name: `Railway Deployment`
4. Expiration: Choose (90 days, 1 year, or no expiration)
5. Scopes: ✅ Check **"repo"**
6. Click: "Generate token"
7. **Copy the token immediately** (you won't see it again!)
8. **Use this token as your password** when pushing

---

## ✅ Step 6: Connect to Railway

1. **In Railway Dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Authorize Railway:**
   - Click "Configure GitHub App" or "Connect GitHub"
   - Authorize Railway to access your repositories
   - Select repositories (or all repositories)

3. **Select Your Repository:**
   - Your `beck-sftp-proxy` repository should appear
   - Click on it
   - Railway will start deploying!

---

## 🎉 You're Done!

After Git is installed and your code is on GitHub:
- ✅ Railway can see your repository
- ✅ You can deploy automatically
- ✅ Updates are easy (just `git push`)

---

## 🆘 Troubleshooting

### Git Command Not Found After Installation

**Problem:** `git --version` still says command not found

**Solutions:**
1. **Close and reopen PowerShell** (required!)
2. **Restart your computer** (if still not working)
3. **Check installation:** During Git install, make sure "Git from the command line" was selected
4. **Manual PATH check:**
   - Git should be in: `C:\Program Files\Git\cmd\`
   - If not, reinstall Git

### Authentication Failed When Pushing

**Problem:** Can't push to GitHub

**Solutions:**
- Use **Personal Access Token** (not password)
- Make sure token has "repo" scope
- Check token hasn't expired
- Try creating a new token

### "Repository not found" Error

**Problem:** GitHub can't find your repository

**Solutions:**
- Check repository name matches exactly
- Verify you're logged into correct GitHub account
- Make sure repository exists on GitHub
- Check URL is correct

---

## 📝 Quick Reference Commands

After Git is installed, you'll use these commands:

```powershell
# Navigate to project
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Initialize Git
git init

# Add files
git add .

# Commit
git commit -m "Your message here"

# Add GitHub remote
git remote add origin https://github.com/YOUR-USERNAME/beck-sftp-proxy.git

# Push to GitHub
git push -u origin main
```

---

## ✅ Installation Checklist

- [ ] Git downloaded
- [ ] Git installed (with "command line" option)
- [ ] PowerShell restarted
- [ ] Git verified (`git --version` works)
- [ ] Git configured (name and email)
- [ ] GitHub repository created
- [ ] Personal Access Token created
- [ ] Code pushed to GitHub
- [ ] Railway connected to GitHub
- [ ] Deployment started

---

## 🚀 Next Steps After Installation

1. ✅ Install Git (you're doing this now!)
2. ✅ Configure Git (name and email)
3. ✅ Create GitHub repository
4. ✅ Push code to GitHub
5. ✅ Connect Railway to GitHub
6. ✅ Deploy!

**See `QUICK_GITHUB_SETUP.md` for complete GitHub setup instructions!**

---

**Once Git is installed, come back and we'll push your code to GitHub!** 🎉

