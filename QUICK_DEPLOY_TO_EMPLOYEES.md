# Quick Employee Deployment Guide

## 🚀 Fastest Method: Manual Installation (5 Minutes Per Employee)

### Step 1: Distribute the Extension

**Option A: Email the ZIP file**
- Send `beck-auto-post-extension-v1.0.0.zip` to employees
- Or share via network drive/OneDrive/Google Drive

**Option B: Network Share**
- Place ZIP file on shared network drive
- Give employees access to: `\\server\shared\beck-extension\beck-auto-post-extension-v1.0.0.zip`

---

### Step 2: Employee Installation Instructions

**Send these instructions to each employee:**

#### Installation Steps:

1. **Download/Extract the Extension**
   - If you received a ZIP file, extract it to a folder (e.g., `C:\Users\YourName\beck-extension`)
   - Keep this folder - don't delete it!

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Type in address bar: `chrome://extensions/`
   - Press Enter

3. **Enable Developer Mode**
   - Toggle the switch in the top-right corner that says "Developer mode"
   - It should turn blue/on

4. **Load the Extension**
   - Click the "Load unpacked" button (top left)
   - Navigate to the extracted extension folder
   - Select the folder and click "Select Folder"
   - The extension should now appear in your extensions list!

5. **Pin the Extension**
   - Click the puzzle piece icon (🧩) in Chrome toolbar
   - Find "Beck Auto-Post" in the list
   - Click the pin icon to keep it visible

6. **Configure for Your Store**
   - Click the extension icon
   - Click the Settings (⚙️) button
   - Enter your store's information (see below)

---

### Step 3: Store Configuration

**Each employee needs to configure for their specific store:**

#### BECK CDJR Employees:
- **CSV URL:** `http://10.26.1.230:3000/csv/beck-cdjr`
- **API Key:** `beck-cdjr-secret-key`
- **Auto-refresh:** ✅ Check this box
- **Refresh Interval:** 15 minutes

#### BECK CHEVY Employees:
- **CSV URL:** `http://10.26.1.230:3000/csv/beck-chevy`
- **API Key:** `beck-chevy-secret-key`
- **Auto-refresh:** ✅ Check this box
- **Refresh Interval:** 15 minutes

#### BECK FORD Employees:
- **CSV URL:** `http://10.26.1.230:3000/csv/beck-ford`
- **API Key:** `beck-ford-secret-key`
- **Auto-refresh:** ✅ Check this box
- **Refresh Interval:** 15 minutes

#### BECK NISSAN Employees:
- **CSV URL:** `http://10.26.1.230:3000/csv/beck-nissan`
- **API Key:** `beck-nissan-secret-key`
- **Auto-refresh:** ✅ Check this box
- **Refresh Interval:** 15 minutes

**After entering settings, click "Save Settings"**

---

## 📦 Alternative: Automated Installation Script

If you want to automate the installation, I can create a PowerShell script that employees can run. This would:
- Extract the extension automatically
- Install it to Chrome
- Configure it for their store

**Would you like me to create this automated script?**

---

## ✅ Verification

After installation, employees should:
1. See the extension icon in Chrome toolbar
2. Click it and see vehicles in the photo gallery
3. See "Updated [time]" status message
4. Be able to generate descriptions

---

## 🔄 Updates

When you need to update the extension:
1. Create a new ZIP file
2. Send to employees
3. They need to:
   - Go to `chrome://extensions/`
   - Click "Reload" on the extension
   - Or remove and reinstall

**For automatic updates, publish to Chrome Web Store (see below)**

---

## 🌐 Better Option: Chrome Web Store (Recommended for Production)

For easier deployment and automatic updates:

1. **Publish to Chrome Web Store** (as Unlisted)
   - One-time $5 developer fee
   - Employees just click a link to install
   - Automatic updates
   - No manual ZIP distribution

2. **Benefits:**
   - ✅ Employees install with one click
   - ✅ Automatic updates (no re-installation needed)
   - ✅ Professional deployment
   - ✅ Works across all devices

**See `CHROME_WEB_STORE_PUBLISHING.md` for full instructions**

---

## 🆘 Troubleshooting

### Extension Won't Load
- Make sure Developer mode is enabled
- Check that you selected the correct folder (should contain `manifest.json`)
- Try closing and reopening Chrome

### Can't See Extension Icon
- Click puzzle piece icon (🧩) in toolbar
- Find "Beck Auto-Post" and pin it

### "Failed to fetch CSV" Error
- Check you're on company network
- Verify CSV URL is correct for your store
- Verify API key is correct
- Try accessing: `http://10.26.1.230:3000/health` in browser

### Wrong Store's Inventory
- Check CSV URL matches your store
- Check API key matches your store
- Re-save settings

---

## 📋 Deployment Checklist

- [ ] ZIP file created (`beck-auto-post-extension-v1.0.0.zip`)
- [ ] ZIP file distributed to employees (email/network share)
- [ ] Installation instructions sent
- [ ] Store configuration guide sent
- [ ] Employees have installed extension
- [ ] Employees have configured for their store
- [ ] Verified extension working for each store
- [ ] Documented any issues

---

## 📞 Support

If employees have issues:
1. Check `EMPLOYEE_INSTALLATION_GUIDE.md` for detailed troubleshooting
2. Verify network connectivity to `http://10.26.1.230:3000`
3. Check Chrome version (should be recent)
4. Contact IT if network/server issues

---

**Ready to deploy? The ZIP file is ready at: `beck-auto-post-extension-v1.0.0.zip`**


