# Fix All JSON Files Encoding

All JSON files need to be recreated without BOM (Byte Order Mark) for Railway to parse them correctly.

---

## ✅ Fixed Files

I've fixed:
- ✅ Root `package.json` - Recreated without BOM
- ✅ `railway.json` - Recreated without BOM  
- ✅ `server/package.json` - Recreated without BOM

---

## 🚀 Next Steps

### Push All Fixed Files:

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"

# Add all fixed files
git add package.json railway.json server/package.json

# Commit
git commit -m "Fix all JSON files encoding (remove BOM)"

# Push
git push
```

### Railway Will Redeploy

After pushing, Railway will:
1. ✅ Parse root `package.json` correctly
2. ✅ Parse `railway.json` correctly
3. ✅ Parse `server/package.json` correctly
4. ✅ Install dependencies
5. ✅ Start server

---

## 🔍 What Was Wrong

PowerShell's `Out-File` adds BOM (Byte Order Mark) to files, which breaks JSON parsing. All JSON files have been recreated using `System.IO.File.WriteAllText` with UTF-8 encoding without BOM.

---

## ✅ Verify

After pushing, check Railway logs:
- Should show "Installing dependencies"
- Should show "Starting server"
- Should show "SFTP Proxy Service running on port..."

**Push all the fixed files and Railway should work!** 🚀

