# Fix: Unstaged Changes

You have unstaged changes. We need to commit them first, then remove the large file from history.

---

## 🚀 Step-by-Step Fix

Run these commands:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Check what files are changed
git status

# Add and commit the clean file
git add server/sftp-proxy.js
git commit -m "Add clean sftp-proxy.js file"

# Now remove large file from history
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch server/sftp-proxy.js" --prune-empty --tag-name-filter cat -- --all

# Force push
git push --force
```

---

## 🔄 Alternative: Stash Changes

If you want to keep changes separate:

```powershell
# Stash any other changes
git stash

# Run filter-branch
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch server/sftp-proxy.js" --prune-empty --tag-name-filter cat -- --all

# Add clean file
git add server/sftp-proxy.js
git commit -m "Add clean sftp-proxy.js"

# Force push
git push --force

# Restore stashed changes (if any)
git stash pop
```

---

**Run the first set of commands - commit the clean file, then run filter-branch!** 🚀
