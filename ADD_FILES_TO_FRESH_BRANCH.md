# Add Files to Fresh Branch

After `git rm -rf .`, the files are removed from Git but should still exist on disk.

---

## 🚀 Add All Files Back

Run these commands:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Add all files (Git will only add what exists)
git add .

# Or add specific files if they exist
git add server/
git add *.json
git add .gitignore

# Check what's staged
git status

# Commit
git commit -m "Initial commit - clean files only"

# Delete old main branch
git branch -D main

# Rename current branch to main
git branch -m main

# Force push
git push -f origin main
```

---

## 🔍 If Files Don't Exist

If the files were actually deleted, you may need to restore them from backup or recreate them.

**Check if files exist:**
```powershell
# Check server folder
dir server

# Check root files
dir *.json
```

---

**Run `git add .` to add all existing files!** 🚀
