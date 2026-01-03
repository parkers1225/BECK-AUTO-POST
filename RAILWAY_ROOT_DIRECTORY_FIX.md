# Railway Root Directory - How to Set It

If you don't see "Root Directory" in Railway settings, here are alternative ways to configure it.

---

## 🔍 Method 1: Check Different Locations

### Location A: Service Settings

1. **In Railway Dashboard:**
   - Click on your **service** (not the project)
   - Click **"Settings"** tab
   - Look for **"Root Directory"** or **"Working Directory"**
   - It might be under **"Deploy"** section

### Location B: Service Configuration

1. **In Railway Dashboard:**
   - Click on your service
   - Look for **"Configure"** or **"Settings"** button
   - Check **"Deploy"** or **"Build"** sections

### Location C: Project Settings

1. **In Railway Dashboard:**
   - Click on your **project** (top level)
   - Go to **"Settings"**
   - Look for service-specific settings

---

## 🔧 Method 2: Use railway.json (Recommended)

If you can't find the setting, create a `railway.json` file in your repository root:

### Step 1: Create railway.json

**In your project root** (not in server folder), create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
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

### Step 2: Push to GitHub

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Create railway.json
@'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
'@ | Out-File -FilePath "railway.json" -Encoding utf8

# Add and commit
git add railway.json
git commit -m "Add Railway configuration for server folder"
git push
```

### Step 3: Railway will automatically redeploy

Railway will read `railway.json` and use the `startCommand` to run from the server folder.

---

## 🔧 Method 3: Update package.json in Root

Create a `package.json` in the root that runs the server:

### Step 1: Create Root package.json

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

@'
{
  "name": "beck-marketplace-project",
  "version": "1.0.0",
  "scripts": {
    "start": "cd server && npm start"
  }
}
'@ | Out-File -FilePath "package.json" -Encoding utf8

# Add and commit
git add package.json
git commit -m "Add root package.json for Railway"
git push
```

Railway will detect the root `package.json` and run `npm start`, which will change to the server folder and start the server.

---

## 🔧 Method 4: Use Railway CLI

If you have Railway CLI installed:

```powershell
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Link to your project
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
railway link

# Set root directory
railway variables set RAILWAY_ROOT_DIRECTORY=server
```

---

## 🔧 Method 5: Move Server Files to Root (Last Resort)

If nothing else works, you can move server files to the root:

**⚠️ Warning:** This mixes extension files with server files, but it will work.

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Copy server files to root
Copy-Item server\sftp-proxy.js .
Copy-Item server\package.json .
Copy-Item server\Procfile .

# Update package.json to remove "cd server" if you used it
```

Then Railway will find `package.json` in the root and deploy it.

---

## ✅ Recommended Solution: railway.json

**I recommend Method 2 (railway.json)** - it's the cleanest and most reliable.

### Quick Setup:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Create railway.json
@'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd server && npm start"
  }
}
'@ | Out-File -FilePath "railway.json" -Encoding utf8

# Commit and push
git add railway.json
git commit -m "Configure Railway to use server folder"
git push
```

---

## 🆘 Still Can't Find It?

**Try these:**

1. **Check Railway Documentation:**
   - https://docs.railway.app/develop/config
   - Search for "root directory" or "working directory"

2. **Contact Railway Support:**
   - They can help you find the setting
   - Or confirm if the UI has changed

3. **Use railway.json:**
   - This always works regardless of UI changes
   - It's the recommended method

---

## 📝 What railway.json Does

The `railway.json` file tells Railway:
- ✅ Build using NIXPACKS (auto-detects Node.js)
- ✅ Start command: `cd server && npm start`
- ✅ This runs `npm install` in root, then `cd server && npm start`

**This is the same as setting Root Directory to `server`!**

---

## ✅ Next Steps

1. **Create `railway.json`** in project root (see Method 2 above)
2. **Push to GitHub**
3. **Railway will automatically redeploy**
4. **Check logs** to verify it's working

**The railway.json method is the most reliable!** 🚀

