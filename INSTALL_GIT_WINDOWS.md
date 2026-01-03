# Install Git on Windows - Quick Guide

You need Git to push code to GitHub. Here's the fastest way to install it.

---

## 🚀 Method 1: Install Git (5 minutes)

### Step 1: Download Git

1. **Go to:** https://git-scm.com/download/win
2. **Click:** "Download" button
3. **Wait for download** to complete

### Step 2: Install Git

1. **Run the installer** (Git-2.x.x-64-bit.exe)
2. **Click "Next"** through all prompts
3. **Use default settings** (they're perfect)
4. **Important:** Make sure "Git from the command line and also from 3rd-party software" is selected
5. **Click "Install"**
6. **Wait for installation** (1-2 minutes)
7. **Click "Finish"**

### Step 3: Restart PowerShell

1. **Close your current PowerShell window**
2. **Open a NEW PowerShell window**
3. **Test Git:**
   ```powershell
   git --version
   ```
   Should show: `git version 2.x.x`

### Step 4: Configure Git (One Time)

```powershell
# Set your name (replace with your name)
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your-email@example.com"
```

### Step 5: Now Push to GitHub

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add GitHub remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/beck-sftp-proxy.git

# Push
git branch -M main
git push -u origin main
```

**You'll be prompted for GitHub username and password (use Personal Access Token).**

---

## 🚀 Method 2: Use GitHub Desktop (Easier - No Command Line!)

If you don't want to use command line, GitHub Desktop is much easier!

### Step 1: Download GitHub Desktop

1. **Go to:** https://desktop.github.com/
2. **Click:** "Download for Windows"
3. **Run the installer**
4. **Follow installation wizard**

### Step 2: Sign In to GitHub

1. **Open GitHub Desktop**
2. **Sign in** with your GitHub account
3. **Authorize** GitHub Desktop

### Step 3: Add Your Project

1. **Click:** "File" → "Add Local Repository"
2. **Browse to:** `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`
3. **Click:** "Add Repository"

### Step 4: Create Repository on GitHub

1. **In GitHub Desktop:**
   - Click **"Publish repository"** button (top right)
   - **Name:** `beck-sftp-proxy`
   - **Description:** (optional) "SFTP Proxy Server"
   - ✅ **Check:** "Keep this code private" (recommended)
   - **Click:** "Publish Repository"

2. **GitHub Desktop will:**
   - Create the repository on GitHub
   - Push all your code
   - Done!

### Step 5: Connect to Railway

1. **In Railway:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Your `beck-sftp-proxy` repository should appear
   - Select it and deploy!

---

## ✅ Which Method Should You Use?

| Method | Difficulty | Time | Best For |
|-------|------------|------|----------|
| **GitHub Desktop** | ⭐ Very Easy | 5 min | Beginners |
| **Git Command Line** | ⭐⭐ Easy | 5 min | Developers |

**Recommendation:** Use **GitHub Desktop** - it's easier and does everything for you!

---

## 🆘 Troubleshooting

### Git Still Not Found After Installation

**Problem:** `git --version` still says command not found

**Solutions:**
1. **Close and reopen PowerShell** (required after Git installation)
2. **Restart your computer** (if still not working)
3. **Check PATH:** During Git installation, make sure "Git from the command line" was selected

### GitHub Desktop Can't Find Repository

**Problem:** GitHub Desktop says repository not found

**Solutions:**
- Make sure you selected the correct folder
- The folder should contain your project files
- Try "Add Local Repository" again

### Can't Push to GitHub

**Problem:** Authentication failed

**Solutions:**
- Use **Personal Access Token** (not password)
- See `QUICK_GITHUB_SETUP.md` for token creation
- Or use GitHub Desktop (handles authentication automatically)

---

## 🎯 Quick Decision Guide

**Use GitHub Desktop if:**
- ✅ You're not comfortable with command line
- ✅ You want the easiest option
- ✅ You want a visual interface

**Use Git Command Line if:**
- ✅ You're comfortable with PowerShell
- ✅ You want more control
- ✅ You're a developer

---

## ✅ Next Steps After Installation

1. ✅ Install Git or GitHub Desktop
2. ✅ Push code to GitHub
3. ✅ Connect Railway to GitHub
4. ✅ Deploy!

**See `QUICK_GITHUB_SETUP.md` for complete instructions!**

