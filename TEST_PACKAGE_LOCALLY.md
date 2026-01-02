# Test Package Locally - Quick Guide

## Step 1: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Type in address bar: `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch (top right)
   - Should turn blue/on

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT\beck-auto-post-extension-package`
   - Click "Select Folder"

4. **Verify Extension Loaded**
   - Should see "Beck Auto-Post" in extensions list
   - Should show version 1.0.0
   - Should be enabled (toggle on)

## Step 2: Test Extension

1. **Open Extension**
   - Click extension icon in Chrome toolbar
   - Or click puzzle piece (🧩) → Beck Auto-Post

2. **Test Basic Functionality**
   - Extension should open
   - Settings button should work
   - Interface should load

3. **Test Configuration**
   - Open Settings
   - Try configuring CSV URL
   - Verify settings save

4. **Check for Errors**
   - Open Chrome DevTools (F12)
   - Go to Console tab
   - Look for any errors

## Step 3: Verify Package Contents

The package should contain:
- ✅ manifest.json
- ✅ popup.html
- ✅ popup.js
- ✅ popup.css
- ✅ background.js
- ✅ content.js
- ✅ icons/ folder
- ✅ utils/ folder

## If Issues Found

**Extension won't load:**
- Check manifest.json is valid JSON
- Check all required files present
- Check Chrome console for errors

**Extension loads but doesn't work:**
- Check browser console (F12)
- Verify all files loaded
- Check permissions in manifest

**Need to update package:**
- Fix issues in source files
- Re-run: `create-production-package.ps1`
- Test again

## Next: Create Privacy Policy

Once package is tested and working, we'll create the privacy policy.


