# Easiest Way to Deploy to Railway (No Git Command Line Needed!)

Since Git isn't installed, use **GitHub Desktop** - it's much easier and does everything for you!

---

## 🚀 Step-by-Step (10 Minutes Total)

### Step 1: Install GitHub Desktop (2 minutes)

1. **Download:** https://desktop.github.com/
2. **Run installer** and follow prompts
3. **Sign in** with your GitHub account (or create one)

### Step 2: Create Repository on GitHub (1 minute)

1. **Go to:** https://github.com/new
2. **Repository name:** `beck-sftp-proxy`
3. **Visibility:** ✅ **Private** (recommended)
4. **IMPORTANT:** Don't check any boxes (no README, no .gitignore)
5. **Click:** "Create repository"

### Step 3: Add Your Project to GitHub Desktop (2 minutes)

1. **Open GitHub Desktop**
2. **Click:** "File" → "Add Local Repository"
3. **Click:** "Choose..." button
4. **Navigate to:** `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`
5. **Click:** "Select Folder"
6. **If it says "This directory does not appear to be a Git repository":**
   - Click **"create a repository"** link
   - Name: `beck-sftp-proxy`
   - Click **"Create Repository"**

### Step 4: Commit and Push (2 minutes)

1. **In GitHub Desktop:**
   - You'll see all your files listed
   - **Bottom left:** Enter commit message: `Initial commit`
   - **Click:** "Commit to main" button

2. **Publish to GitHub:**
   - **Click:** "Publish repository" button (top right)
   - **Name:** `beck-sftp-proxy` (should be pre-filled)
   - ✅ **Check:** "Keep this code private"
   - **Click:** "Publish Repository"

3. **GitHub Desktop will:**
   - Push all your code to GitHub
   - Show "Published" when done

### Step 5: Connect Railway (1 minute)

1. **In Railway Dashboard:**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**

2. **If you see "No repositories":**
   - Click **"Configure GitHub App"** or **"Connect GitHub"**
   - Authorize Railway to access your repositories
   - Refresh the page

3. **Select Your Repository:**
   - Your `beck-sftp-proxy` repository should appear
   - Click on it
   - Railway will start deploying!

### Step 6: Configure Environment Variables (2 minutes)

1. **In Railway Dashboard:**
   - Click on your deployed service
   - Go to **"Variables"** tab

2. **Add these variables:**
   - `SFTP_HOST` = `sftp.transfer.vauto.com`
   - `SFTP_PORT` = `22`
   - `SFTP_USERNAME` = (your SFTP username)
   - `SFTP_PASSWORD` = (your SFTP password)
   - `SFTP_PATH` = `/MP15932.csv` (or your CSV path)
   - `API_KEY` = (create a random secret key)

3. **Railway will automatically redeploy**

### Step 7: Get Your URL (30 seconds)

1. **In Railway:**
   - Click on your service
   - Go to **"Settings"** → **"Domains"**
   - Your URL: `https://your-app-name.up.railway.app`

---

## ✅ Done!

Your server is now:
- ✅ On GitHub
- ✅ Deployed to Railway
- ✅ Publicly accessible
- ✅ Using HTTPS

**Total time: ~10 minutes!**

---

## 🔄 Updating Your Code Later

**Using GitHub Desktop:**
1. Make changes to your files
2. Open GitHub Desktop
3. Enter commit message
4. Click "Commit to main"
5. Click "Push origin" (top right)
6. Railway automatically redeploys!

---

## 🆘 Troubleshooting

### GitHub Desktop Won't Install

**Solution:**
- Make sure you have Windows 10/11
- Try downloading again
- Or use Git command line (see `INSTALL_GIT_WINDOWS.md`)

### Can't Find Repository in Railway

**Solution:**
- Make sure you authorized Railway to access GitHub
- Click "Configure GitHub App" again
- Refresh Railway page
- Check repository name matches exactly

### Repository Not Publishing

**Solution:**
- Check you're signed into GitHub Desktop
- Verify you have internet connection
- Try again - sometimes GitHub is slow

---

## 🎯 Why This Method is Best

✅ **No command line needed**  
✅ **Visual interface**  
✅ **Automatic authentication**  
✅ **Easy updates**  
✅ **Perfect for beginners**

---

**Ready to start? Download GitHub Desktop and follow the steps above!**

