# Fix: Dependencies Not Installed

Railway is starting the server but dependencies aren't installed. The issue is that Railway needs to run `npm install` in the server folder during the build phase.

---

## ✅ Fixed

I've updated `railway.json` to include a `buildCommand` that installs dependencies in the server folder before starting.

---

## 🚀 Next Steps

### Push the Fixed Files:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Add fixed files
git add package.json railway.json

# Commit
git commit -m "Fix dependency installation - add buildCommand to railway.json"

# Push
git push
```

### What Changed

**railway.json now includes:**
```json
{
  "build": {
    "buildCommand": "cd server && npm install"
  }
}
```

This tells Railway to:
1. **Build phase:** Run `cd server && npm install` (installs express, ssh2-sftp-client)
2. **Deploy phase:** Run `cd server && npm start` (starts the server)

---

## 🔍 What Was Wrong

Railway was:
- ✅ Running `npm start` from root
- ✅ Which runs `cd server && npm install && npm start`
- ❌ But Railway's build phase wasn't installing dependencies in server folder
- ❌ So when server started, express wasn't found

**Now Railway will:**
- ✅ Build: Install dependencies in server folder
- ✅ Deploy: Start server (dependencies already installed)

---

## ✅ Verify

After pushing, check Railway logs:
- Should show "Installing dependencies" in build phase
- Should show "express" and "ssh2-sftp-client" being installed
- Should show "Starting server"
- Should show "SFTP Proxy Service running on port..."

**Push the fixed files and Railway should work!** 🚀

