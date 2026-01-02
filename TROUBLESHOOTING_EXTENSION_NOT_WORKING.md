# Extension Not Working - Step-by-Step Troubleshooting

Follow these steps in order to diagnose and fix the issue.

## Step 1: Check Extension is Loaded

1. **Open Chrome Extensions Page:**
   - Go to: `chrome://extensions/`
   - Or: Menu (⋮) → Extensions → Manage extensions

2. **Find "Beck Auto-Post":**
   - Look for your extension in the list
   - Check if it shows any errors (red error badge)

3. **Check Extension Status:**
   - ✅ **Enabled** (toggle should be ON)
   - ✅ **No error messages** shown
   - ✅ **Developer mode** is enabled (top right toggle)

**If extension is NOT listed:**
- Click "Load unpacked"
- Select: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`
- Make sure you select the folder with `manifest.json` in it

**If extension shows an ERROR:**
- Click the "Errors" button or "Details" → "Errors"
- Copy the error message
- See Step 4 below

---

## Step 2: Check Extension Icon

1. **Look for Extension Icon:**
   - Check Chrome toolbar (top right)
   - Click the puzzle piece icon (🧩) if you don't see it
   - Look for "Beck Auto-Post" in the extensions menu

2. **If Icon is Missing:**
   - Check that `icons/beck-logo.png` exists
   - File should be at: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT\icons\beck-logo.png`

3. **If Icon Shows but is Grayed Out:**
   - Extension might be disabled
   - Go to `chrome://extensions/` and enable it

---

## Step 3: Try Opening Extension Popup

1. **Click the Extension Icon:**
   - Should open a side panel or popup

2. **What Should Happen:**
   - Side panel opens on the right side of Chrome
   - OR popup window appears
   - You should see "Beck Auto-Post" header with logo

3. **If Nothing Happens:**
   - Right-click the extension icon
   - Click "Inspect popup" (if available)
   - This opens DevTools - check for errors (see Step 4)

**If Side Panel Doesn't Open:**
- Try right-clicking extension icon → "Inspect popup"
- Check browser console (F12) for errors

---

## Step 4: Check for JavaScript Errors

### A. Check Extension Errors Page

1. Go to: `chrome://extensions/`
2. Find "Beck Auto-Post"
3. Click "Errors" button (if it shows an error)
4. **Copy the error message** - this tells us what's wrong

### B. Check Browser Console

1. **Open Extension Popup:**
   - Click the extension icon to open it

2. **Open Developer Tools:**
   - Press `F12` (or `Ctrl+Shift+I`)
   - OR right-click in the popup → "Inspect"

3. **Check Console Tab:**
   - Look for RED error messages
   - Common errors:
     - `Failed to load resource`
     - `Uncaught TypeError`
     - `Cannot read property of undefined`
     - `Module not found`

4. **Copy Any Errors:**
   - Right-click error → Copy
   - Or take a screenshot

### C. Check Background Service Worker

1. Go to: `chrome://extensions/`
2. Find "Beck Auto-Post"
3. Click "Inspect views: service worker" (if available)
4. Check Console tab for errors

---

## Step 5: Verify Required Files Exist

Check that all these files exist in your project folder:

**Required Files:**
```
✅ manifest.json
✅ popup.html
✅ popup.js
✅ popup.css
✅ background.js
✅ content.js
✅ icons/beck-logo.png
✅ utils/csvParser.js
✅ utils/vinMatcher.js
✅ utils/aiService.js
```

**To Check:**
1. Open File Explorer
2. Navigate to: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`
3. Verify all files above exist

**If Files Are Missing:**
- The extension won't work
- Re-download or restore missing files

---

## Step 6: Check Manifest.json is Valid

1. **Open `manifest.json` in a text editor**

2. **Verify it's valid JSON:**
   - Use an online validator: https://jsonlint.com/
   - Copy the entire contents and paste it there
   - Should show "Valid JSON"

3. **Common Issues:**
   - Missing commas
   - Extra commas
   - Missing quotes
   - Invalid syntax

---

## Step 7: Reload Extension

Sometimes the extension needs a fresh reload:

1. **Go to:** `chrome://extensions/`
2. **Find:** "Beck Auto-Post"
3. **Click:** The reload icon (🔄 circular arrow)
4. **Try opening extension again**

**If that doesn't work:**
1. **Remove extension:**
   - Click "Remove" on the extension
   - Confirm removal

2. **Re-add extension:**
   - Click "Load unpacked"
   - Select: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`

---

## Step 8: Check Browser Console for Specific Errors

Open the extension popup, then:

1. **Press F12** to open DevTools
2. **Go to Console tab**
3. **Look for these specific errors:**

### Error: "Failed to load resource"
- **Meaning:** A file is missing or path is wrong
- **Fix:** Check file paths in `popup.html` and `manifest.json`

### Error: "Uncaught TypeError: Cannot read property..."
- **Meaning:** JavaScript error in code
- **Fix:** Check the line number, might be a bug in popup.js or background.js

### Error: "Module not found" or "Cannot find module"
- **Meaning:** Missing utility file
- **Fix:** Verify `utils/` folder has all files

### Error: "chrome.runtime.sendMessage" errors
- **Meaning:** Background script not responding
- **Fix:** Check background.js for errors

---

## Step 9: Test Basic Functionality

Even if extension opens, test these:

1. **Settings Button:**
   - Click ⚙️ button
   - Settings panel should open
   - If not, check console for errors

2. **CSV Upload:**
   - Try uploading a CSV file
   - Should show "Successfully loaded X vehicles"
   - If error, check console

3. **Refresh Button:**
   - Click refresh icon
   - Should reload data
   - If nothing happens, check console

---

## Step 10: Common Fixes

### Fix 1: Clear Extension Cache
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Reload" on extension
4. Close and reopen Chrome

### Fix 2: Check File Permissions
- Make sure files are not read-only
- Right-click folder → Properties → Uncheck "Read-only"

### Fix 3: Verify Icon File
- Check `icons/beck-logo.png` exists
- Try replacing it with a simple PNG image
- Size: 128x128 pixels minimum

### Fix 4: Check Chrome Version
- Extension requires Chrome 88+
- Update Chrome if needed
- Go to: Menu → Help → About Google Chrome

---

## What to Report Back

If extension still doesn't work, please provide:

1. **Error messages** from `chrome://extensions/` (Errors button)
2. **Console errors** (F12 → Console tab)
3. **What happens** when you click extension icon:
   - Nothing happens?
   - Error message?
   - Blank page?
   - Something else?
4. **Screenshots** if possible

---

## Quick Diagnostic Checklist

Run through this quickly:

- [ ] Extension appears in `chrome://extensions/`
- [ ] Extension is enabled (toggle ON)
- [ ] No errors shown in extensions page
- [ ] Extension icon appears in toolbar
- [ ] Clicking icon opens popup/side panel
- [ ] No red errors in browser console (F12)
- [ ] All required files exist
- [ ] manifest.json is valid JSON
- [ ] Extension reloaded recently

**If all checked but still not working:**
- Check the specific error messages
- Follow the fixes for that specific error type

---

## Emergency: Complete Reset

If nothing works, try a complete reset:

1. **Remove extension completely:**
   - `chrome://extensions/` → Remove

2. **Close Chrome completely:**
   - Close all windows
   - Check Task Manager (Ctrl+Shift+Esc) for Chrome processes
   - End any remaining Chrome processes

3. **Reopen Chrome**

4. **Load extension fresh:**
   - `chrome://extensions/` → Load unpacked
   - Select project folder

5. **Test again**

---

**Let me know what errors you see and I'll help you fix them!**


