# Deploy Extension Without Chrome Web Store Approval

This guide covers **all methods** to deploy the Beck Auto-Post extension to employees' PCs without going through Google's approval process.

---

## 🚀 Method 1: Manual Installation (Easiest - 5 minutes per employee)

**Best for:** Small teams (1-10 employees), quick deployment

### Step 1: Distribute the ZIP File

**Option A: Email**
- Send `beck-auto-post-extension-v1.0.0.zip` to each employee
- Or share via OneDrive/Google Drive/Dropbox

**Option B: Network Share**
- Place ZIP on shared drive: `\\server\shared\beck-extension\beck-auto-post-extension-v1.0.0.zip`
- Give employees read access

### Step 2: Employee Installation

**Send these instructions to employees:**

1. **Extract the ZIP file**
   - Right-click `beck-auto-post-extension-v1.0.0.zip`
   - Select "Extract All..."
   - Choose a location (e.g., `C:\Users\YourName\beck-extension`)
   - **Important:** Keep this folder - don't delete it!

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Type in address bar: `chrome://extensions/`
   - Press Enter

3. **Enable Developer Mode**
   - Toggle the switch in the top-right: **"Developer mode"**
   - It should turn blue/on

4. **Load the Extension**
   - Click **"Load unpacked"** button (top left)
   - Navigate to the extracted folder
   - Select the folder and click **"Select Folder"**
   - Extension should now appear in the list!

5. **Pin the Extension**
   - Click the puzzle piece icon (🧩) in Chrome toolbar
   - Find "Beck Auto-Post"
   - Click the pin icon to keep it visible

6. **Configure for Your Store**
   - Click the extension icon
   - Click Settings (⚙️)
   - Enter your store's configuration (see Store Configuration below)

---

## 🤖 Method 2: Automated PowerShell Script (Recommended)

**Best for:** Medium teams (10-50 employees), IT support

### For IT/Admin:

1. **Distribute the script and ZIP file**
   - Send `install-extension.ps1` and `beck-auto-post-extension-v1.0.0.zip` to employees
   - Or place on network share

2. **Employee runs the script:**
   ```powershell
   # Right-click install-extension.ps1
   # Select "Run with PowerShell"
   # Follow the prompts
   ```

The script will:
- ✅ Check if Chrome is installed
- ✅ Extract the extension automatically
- ✅ Copy to permanent location
- ✅ Open Chrome extensions page
- ✅ Guide user through final steps

### Employee Instructions:

1. **Download both files:**
   - `install-extension.ps1`
   - `beck-auto-post-extension-v1.0.0.zip`

2. **Run the installer:**
   - Right-click `install-extension.ps1`
   - Select **"Run with PowerShell"**
   - If prompted, click "Yes" to allow script execution
   - Follow the on-screen instructions

3. **Complete installation in Chrome:**
   - Chrome extensions page will open automatically
   - Enable Developer mode
   - Click "Load unpacked"
   - Navigate to the folder shown in the script
   - Click "Select Folder"

4. **Configure extension** (see Store Configuration below)

---

## 🏢 Method 3: Enterprise Group Policy Deployment (Best for Large Teams)

**Best for:** Large organizations (50+ employees), IT-managed environments

### Requirements:
- Windows Active Directory / Group Policy
- IT Administrator access
- Chrome Enterprise (or Chrome for Business)

### Step 1: Create CRX File (Optional but Recommended)

A CRX file is a packaged Chrome extension that's easier to deploy:

```powershell
# Run this on a development machine with Chrome installed
# Navigate to chrome://extensions/
# Enable Developer mode
# Click "Pack extension"
# Select the extension folder (beck-auto-post-extension-package)
# Click "Pack Extension"
# This creates a .crx file
```

### Step 2: Deploy via Group Policy

1. **Create Group Policy Object (GPO)**
   - Open Group Policy Management Console
   - Create new GPO: "Chrome Extension - Beck Auto-Post"

2. **Configure Extension Installation**
   - Navigate to: `Computer Configuration > Policies > Administrative Templates > Google > Google Chrome > Extensions`
   - Enable: **"Configure the list of force-installed apps and extensions"**
   - Click "Show" and add:
     ```
     Extension ID: [Get from chrome://extensions/ after loading]
     Update URL: [Leave empty for local deployment]
     ```

3. **Alternative: Use ExtensionInstallForcelist**
   - Policy: `ExtensionInstallForcelist`
   - Value: `[Extension ID];https://clients2.google.com/service/update2/crx`

4. **Deploy Extension Files**
   - Copy extension folder to network share: `\\server\deploy\beck-extension\`
   - Or distribute CRX file

5. **Link GPO to OU**
   - Link the GPO to appropriate Organizational Units
   - Force update: `gpupdate /force`

### Step 3: User Configuration

Users will need to:
1. Restart Chrome (extension auto-installs)
2. Configure extension settings (see Store Configuration below)

**Note:** For enterprise deployment, you may want to pre-configure settings using Chrome policies or a configuration script.

---

## 📦 Method 4: Create CRX File for Easier Distribution

**Best for:** Any deployment method, makes installation simpler

### Creating a CRX File:

1. **Load extension in Chrome first:**
   - Extract ZIP to a folder
   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the extension folder

2. **Pack the extension:**
   - Still on `chrome://extensions/`
   - Click **"Pack extension"** button
   - Extension root directory: Select your extension folder
   - Private key file: Leave empty (first time)
   - Click **"Pack Extension"**

3. **Result:**
   - You'll get a `.crx` file
   - Save this file for distribution

### Installing CRX File:

**Method A: Drag and Drop**
- Open `chrome://extensions/`
- Enable Developer mode
- Drag the `.crx` file into the extensions page
- Click "Add Extension" when prompted

**Method B: Direct Install**
- Double-click the `.crx` file
- Chrome will prompt to install
- Click "Add Extension"

**Note:** Chrome may show a warning about "unpacked extensions" - this is normal for non-store extensions. Users can click "Keep" to proceed.

---

## ⚙️ Store Configuration

After installation, each employee needs to configure the extension for their specific store:

### BECK CDJR Employees:
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-cdjr`
- **CSV URL (Local Network):** `http://10.26.1.230:3000/csv/beck-cdjr`
- **API Key:** `beck-cdjr-secret-key`
- **Auto-refresh:** ✅ Enabled
- **Refresh Interval:** 15 minutes

### BECK CHEVY Employees:
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-chevy`
- **CSV URL (Local Network):** `http://10.26.1.230:3000/csv/beck-chevy`
- **API Key:** `beck-chevy-secret-key`
- **Auto-refresh:** ✅ Enabled
- **Refresh Interval:** 15 minutes

### BECK FORD Employees:
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-ford`
- **CSV URL (Local Network):** `http://10.26.1.230:3000/csv/beck-ford`
- **API Key:** `beck-ford-secret-key`
- **Auto-refresh:** ✅ Enabled
- **Refresh Interval:** 15 minutes

### BECK NISSAN Employees:
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-nissan`
- **CSV URL (Local Network):** `http://10.26.1.230:3000/csv/beck-nissan`
- **API Key:** `beck-nissan-secret-key`
- **Auto-refresh:** ✅ Enabled
- **Refresh Interval:** 15 minutes

**Note:** 
- **Public URL** works from anywhere with internet (recommended for remote employees)
- **Local Network URL** only works on company network
- Replace `your-app.up.railway.app` with your actual public hosting URL
- See `PUBLIC_HOSTING_DEPLOYMENT.md` for deployment instructions

**Configuration Steps:**
1. Click extension icon
2. Click Settings (⚙️)
3. Select "Auto-sync from URL (Recommended)"
4. Enter CSV URL and API Key for your store
5. Enable auto-refresh
6. Click "Save Settings"
7. Verify vehicles appear in gallery

---

## 🔄 Updating the Extension

When you need to update the extension:

### For Manual Installation:
1. Extract new ZIP file
2. Go to `chrome://extensions/`
3. Find "Beck Auto-Post" extension
4. Click **"Reload"** button (circular arrow icon)
5. Or remove and reinstall

### For Automated Script:
1. Run `install-extension.ps1` again with new ZIP
2. Script will replace old version

### For Enterprise Deployment:
1. Update extension files on network share
2. Push new GPO or run `gpupdate /force`
3. Users restart Chrome

---

## ✅ Verification Checklist

After installation, verify:

- [ ] Extension icon appears in Chrome toolbar
- [ ] Extension opens when clicked
- [ ] Settings can be accessed
- [ ] CSV URL and API Key configured correctly
- [ ] Vehicles appear in photo gallery
- [ ] Status shows "Updated [time]"
- [ ] Extension can generate descriptions
- [ ] Extension can fill Facebook Marketplace forms

---

## 🆘 Troubleshooting

### Extension Won't Load

**Problem:** "Manifest file is missing or unreadable"

**Solutions:**
- Make sure you selected the folder containing `manifest.json`
- Don't select a parent folder or ZIP file
- Check that Developer mode is enabled
- Try extracting ZIP to a new location

### "This extension may have been corrupted" Warning

**Problem:** Chrome shows warning about extension

**Solutions:**
- This is normal for non-store extensions
- Click "Keep" or "Add Extension" to proceed
- If it persists, re-extract the ZIP file

### Extension Disappears After Chrome Restart

**Problem:** Extension unloads after closing Chrome

**Solutions:**
- Make sure extension folder still exists
- Don't delete the extracted folder
- Re-load the extension if needed
- Consider using permanent location (Method 2 script does this)

### "Failed to fetch CSV" Error

**Problem:** Extension can't load inventory

**Solutions:**
1. Check you're on company network
2. Verify CSV URL is correct for your store
3. Verify API key is correct
4. Test URL in browser: `http://10.26.1.230:3000/health`
5. Check firewall isn't blocking port 3000
6. Grant permission when prompted (extension will request access)

### Permission Denied Errors

**Problem:** Extension can't access CSV URL or images

**Solutions:**
- Extension will prompt for permission - click "Allow"
- If prompt doesn't appear, go to `chrome://extensions/`
- Find "Beck Auto-Post"
- Click "Details"
- Check "Host permissions" section
- Manually grant permissions if needed

### Wrong Store's Inventory

**Problem:** Seeing vehicles from different store

**Solutions:**
- Check CSV URL matches your store
- Check API key matches your store
- Re-save settings
- Clear extension storage and reconfigure

---

## 📋 Deployment Comparison

| Method | Best For | Setup Time | Maintenance | Difficulty |
|--------|----------|------------|-------------|------------|
| **Manual Installation** | Small teams (1-10) | 5 min/user | Manual updates | ⭐ Easy |
| **PowerShell Script** | Medium teams (10-50) | 2 min/user | Run script again | ⭐⭐ Medium |
| **Group Policy** | Large orgs (50+) | 1-2 hours IT | Push updates | ⭐⭐⭐ Advanced |
| **CRX File** | Any method | 3 min/user | Re-distribute | ⭐ Easy |

---

## 🔐 Security Notes

- **Developer Mode Required:** All methods require Developer mode (except Group Policy)
- **Warning Messages:** Chrome will show warnings for non-store extensions - this is normal
- **Permissions:** Extension will request permissions when accessing CSV URLs or images
- **Network Access:** Extension needs network access to fetch CSV data
- **Local Storage:** Extension stores settings locally in Chrome

---

## 📞 Support

**For IT/Admin:**
- Check `QUICK_DEPLOY_TO_EMPLOYEES.md` for quick reference
- Check `EMPLOYEE_INSTALLATION_GUIDE.md` for user-facing guide

**For Employees:**
- See `EMPLOYEE_INSTALLATION_GUIDE.md` for detailed instructions
- Contact IT if network/server issues occur

---

## 🎯 Quick Start

**Fastest deployment (5 minutes per employee):**

1. ✅ ZIP file ready: `beck-auto-post-extension-v1.0.0.zip`
2. ✅ Send ZIP to employees (email/network share)
3. ✅ Send installation instructions (this guide, Method 1)
4. ✅ Employees install and configure
5. ✅ Done!

**For automated deployment:**

1. ✅ Use `install-extension.ps1` script
2. ✅ Distribute script + ZIP file
3. ✅ Employees run script
4. ✅ Employees configure extension
5. ✅ Done!

---

**Ready to deploy? The ZIP file is at: `beck-auto-post-extension-v1.0.0.zip`**

