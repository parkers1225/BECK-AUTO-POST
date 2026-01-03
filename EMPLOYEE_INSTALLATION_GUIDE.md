# Employee Installation Guide - Beck Auto-Post Extension

Simple, step-by-step guide for employees to install and configure the Chrome extension.

## Quick Install (2 Minutes)

### Step 1: Install Extension

1. **Click this link:** [Chrome Web Store Link - Will be provided after publishing]

2. **Click "Add to Chrome"**
   - Blue button on the Chrome Web Store page
   - Click "Add Extension" when prompted

3. **Extension Installed!**
   - You'll see a confirmation message
   - Extension icon appears in Chrome toolbar

### Step 2: Configure for Your Store

1. **Open Extension**
   - Click the extension icon in Chrome toolbar (top right)
   - Or click the puzzle piece icon → Beck Auto-Post

2. **Open Settings**
   - Click the Settings (⚙️) button in the top right

3. **Configure CSV Source**
   - Under "CSV Data Source", select **"Auto-sync from URL (Recommended)"**
   - Make sure the radio button is selected

4. **Enter Your Store's Information**

   **Find your store below and enter the information:**

   ---

   ### BECK CDJR Employees

   - **CSV URL:** `http://10.26.1.230:3000/csv/beck-cdjr`
   - **API Key:** `beck-cdjr-secret-key`
   - **Auto-refresh:** ✅ Check this box
   - **Refresh Interval:** 15 minutes (default)

   ---

   ### BECK CHEVY Employees

   - **CSV URL:** `http://10.26.1.230:3000/csv/beck-chevy`
   - **API Key:** `beck-chevy-secret-key`
   - **Auto-refresh:** ✅ Check this box
   - **Refresh Interval:** 15 minutes (default)

   ---

   ### BECK FORD Employees

   - **CSV URL:** `http://10.26.1.230:3000/csv/beck-ford`
   - **API Key:** `beck-ford-secret-key`
   - **Auto-refresh:** ✅ Check this box
   - **Refresh Interval:** 15 minutes (default)

   ---

   ### BECK NISSAN Employees

   - **CSV URL:** `http://10.26.1.230:3000/csv/beck-nissan`
   - **API Key:** `beck-nissan-secret-key`
   - **Auto-refresh:** ✅ Check this box
   - **Refresh Interval:** 15 minutes (default)

   ---

5. **Save Settings**
   - Scroll down and click **"Save Settings"**
   - Wait for confirmation message
   - Extension will automatically load your store's inventory

6. **Verify It's Working**
   - You should see vehicles appear in the photo gallery
   - Status should show "Updated [time]"
   - If you see vehicles, you're all set! ✅

---

## Troubleshooting

### Extension Won't Install

**Problem:** "Add to Chrome" button doesn't work

**Solutions:**
- Make sure you're using Google Chrome (not Edge, Firefox, etc.)
- Update Chrome to latest version
- Try in incognito mode
- Check if corporate policies block extensions

---

### Can't Find Extension After Installing

**Problem:** Extension icon not visible

**Solutions:**
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "Beck Auto-Post" in the list
3. Click the pin icon to keep it visible

---

### "Failed to fetch CSV" Error

**Problem:** Extension can't load inventory

**Solutions:**
1. **Check URL is correct**
   - Make sure you entered the exact URL for your store
   - Check for typos

2. **Check API Key is correct**
   - Verify you entered the correct API key for your store
   - No extra spaces

3. **Check Network Connection**
   - Make sure you're on the company network
   - Try accessing: `http://10.26.1.230:3000/health` in browser
   - Should show status page

4. **Contact IT Support**
   - If network/server is down
   - If firewall is blocking access

---

### Wrong Store's Inventory Showing

**Problem:** Seeing vehicles from different store

**Solution:**
- Check CSV URL has correct store ID
- Verify API key matches your store
- Re-save settings

---

### Extension Not Updating

**Problem:** Inventory not refreshing

**Solutions:**
1. **Check Auto-Refresh is Enabled**
   - Go to Settings
   - Make sure "Enable auto-refresh" is checked

2. **Manual Refresh**
   - Click the refresh button (🔄) in extension
   - This forces an immediate update

3. **Check Status**
   - Look at sync status indicator
   - Should show last update time

---

## Using the Extension

### Daily Workflow

1. **Open Extension**
   - Click extension icon
   - View your store's inventory

2. **Select Vehicle**
   - Browse photo gallery
   - Click on a vehicle

3. **Generate Description**
   - Click "Generate Description"
   - Wait for AI to create description
   - Review and edit if needed

4. **Post to Facebook Marketplace**
   - Go to Facebook Marketplace
   - Click "Create New Listing"
   - Extension will help fill in details

### Tips

- ✅ Extension auto-updates inventory every 15 minutes
- ✅ You can manually refresh anytime
- ✅ Descriptions are AI-generated and customizable
- ✅ All data stays on your computer/server

---

## Need Help?

**Contact:**
- IT Support: [Your IT Contact]
- Extension Support: [Your Support Email]

**Common Issues:**
- Can't install → Check Chrome version
- Can't load inventory → Check network/server
- Wrong inventory → Check store configuration
- Extension not working → Try reloading extension

---

## Quick Reference

**Extension Link:** [Will be provided after Chrome Web Store publishing]

**Your Store Configuration:**
- Store: [Your Store Name]
- URL: [Your Store URL]
- API Key: [Your Store API Key]

**Save this information for reference!**

---

**That's it! You're ready to use Beck Auto-Post! 🚀**


