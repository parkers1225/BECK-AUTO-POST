# Migration Instructions: Update to Multi-Store

## Automated Migration Script

I've created a migration script, but since the proxy file is protected, here's the **simplest approach**:

## Option 1: Manual File Replacement (Recommended)

1. **Backup current file:**
   ```powershell
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
   Copy-Item sftp-proxy.js sftp-proxy-backup-before-multi-store.js
   ```

2. **I'll provide the complete updated code** - You can copy/paste it to replace `sftp-proxy.js`

3. **Switch config:**
   ```powershell
   Copy-Item config.json config-single-store-backup.json
   Copy-Item config-multi-store.json config.json
   ```

4. **Restart PM2:**
   ```powershell
   pm2 restart sftp-proxy
   ```

## Option 2: Use Provided Complete File

I can provide the **complete updated `sftp-proxy.js`** file content that you can:
- Copy the entire content
- Replace your current `sftp-proxy.js` with it
- It's backward compatible (works with old config too)

## What the Updated Code Does

✅ Supports multi-store config format  
✅ Maintains backward compatibility with single-store  
✅ Adds `/csv/:storeId` endpoints  
✅ Adds `/stores` endpoint  
✅ Per-store caching  
✅ Per-store API key support  

## Ready to Proceed?

**Choose one:**
1. I'll provide the complete updated code (you copy/paste)
2. I'll create a PowerShell script to do the replacement
3. You manually update specific sections (I'll guide you)

Which do you prefer?


