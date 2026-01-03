# Step-by-Step Setup Guide: CSV Auto-Sync

This guide will walk you through setting up automatic CSV synchronization from your SFTP server to the Beck Auto-Post extension.

---

## PART 1: Setting Up the HTTP Proxy Service

### Step 1: Navigate to the Server Directory

1. Open your file explorer or terminal
2. Navigate to your project folder: `FB MARKETPLACE PROJECT`
3. Go into the `server` folder (we just created this)

### Step 2: Install Node.js (if not already installed)

1. Check if Node.js is installed:
   - Open a terminal/command prompt
   - Type: `node --version`
   - If you see a version number (like v18.0.0), you're good!
   - If you get an error, install Node.js from: https://nodejs.org/

### Step 3: Install Dependencies

1. Open a terminal/command prompt in the `server` folder
2. Run this command:
   ```bash
   npm install
   ```
3. Wait for it to finish (it will download express and ssh2-sftp-client packages)
4. You should see a `node_modules` folder appear

### Step 4: Create Configuration File

1. In the `server` folder, you should see `config.example.json`
2. Copy it and rename the copy to `config.json`:
   - **Windows**: Right-click `config.example.json` → Copy → Paste → Rename to `config.json`
   - **Mac/Linux**: In terminal: `cp config.example.json config.json`

### Step 5: Edit Configuration File

1. Open `config.json` in a text editor (Notepad, VS Code, etc.)
2. Replace the example values with your actual SFTP information:

```json
{
  "sftp": {
    "host": "YOUR-SFTP-SERVER.com",
    "port": 22,
    "username": "your-username",
    "password": "your-password",
    "path": "/path/to/your/vehicles.csv"
  },
  "server": {
    "port": 3000,
    "apiKey": "your-optional-api-key-here"
  }
}
```

**Important:**
- Replace `YOUR-SFTP-SERVER.com` with your actual SFTP server address
- Replace `your-username` with your SFTP username
- Replace `your-password` with your SFTP password
- Replace `/path/to/your/vehicles.csv` with the exact path to your CSV file on the SFTP server
- The `apiKey` is optional but recommended for security

### Step 6: Start the Proxy Service

1. In the terminal (still in the `server` folder), run:
   ```bash
   npm start
   ```

2. You should see output like:
   ```
   🚀 SFTP Proxy Service running on port 3000
   📡 Endpoints:
      GET /csv - Fetch CSV file
      GET /csv/status - Get CSV status
      GET /health - Health check
   ```

3. **Keep this terminal window open** - the service needs to keep running!

### Step 7: Test the Proxy Service

1. Open a web browser
2. Go to: `http://localhost:3000/health`
   - You should see: `{"status":"ok","timestamp":"...","csvAvailable":true}`
3. Go to: `http://localhost:3000/csv`
   - You should see your CSV file content displayed

**If you see errors:**
- Check that your SFTP credentials in `config.json` are correct
- Verify the CSV file path exists on the SFTP server
- Check the terminal for error messages

---

## PART 2: Deploying the Proxy Service (Choose One Option)

### Option A: Run Locally (For Testing)

- Keep the terminal open and the service running
- Your URL will be: `http://localhost:3000/csv`
- **Note**: This only works on your computer

### Option B: Deploy to a Server (For Production)

You need to deploy the proxy service to a server that's always online. Here are options:

#### Option B1: Deploy to a VPS/Cloud Server

1. Upload the `server` folder to your server (via FTP, SCP, etc.)
2. SSH into your server
3. Install Node.js on the server
4. Run `npm install` in the server folder
5. Use PM2 to keep it running:
   ```bash
   npm install -g pm2
   pm2 start sftp-proxy.js --name sftp-proxy
   pm2 save
   pm2 startup
   ```
6. Your URL will be: `http://your-server-ip:3000/csv` or `https://your-domain.com/csv` (if you set up a domain)

#### Option B2: Deploy as Cloud Function

- AWS Lambda, Google Cloud Functions, or Azure Functions
- See `server/README.md` for more details

**For now, if you're just testing, use Option A (localhost)**

---

## PART 3: Configuring the Chrome Extension

### Step 1: Reload the Extension

1. Open Chrome
2. Go to `chrome://extensions/`
3. Find "Beck Auto-Post" extension
4. Click the refresh/reload icon (🔄) to reload the extension with new code

### Step 2: Open Extension Settings

1. Click the extension icon in Chrome toolbar
2. Click the Settings (⚙️) button in the top right

### Step 3: Configure CSV Source

1. Under "CSV Data Source", you'll see two options:
   - **"Auto-sync from URL (Recommended)"** ← Select this one
   - "Upload local file"

2. Click the radio button next to **"Auto-sync from URL (Recommended)"**

### Step 4: Enter CSV URL

1. In the "CSV URL" field, enter your proxy service URL:
   - **If running locally**: `http://localhost:3000/csv`
   - **If deployed to server**: `http://your-server:3000/csv` or `https://your-domain.com/csv`

2. Make sure the URL is correct (no trailing slash needed)

### Step 5: Configure Auto-Refresh

1. Check the box next to **"Enable auto-refresh"** (should be checked by default)
2. Set the refresh interval (default is 15 minutes)
   - This is how often the extension checks for CSV updates
   - You can change it to any number between 1 and 1440 minutes

### Step 6: Save Settings

1. Scroll down and click **"Save Settings"**
2. You should see a success message
3. The settings panel will close automatically after 1 second

### Step 7: Verify CSV Loaded

1. After saving, the extension should automatically fetch the CSV
2. You should see:
   - A status message: "Successfully loaded X vehicles"
   - Vehicles appearing in the photo gallery
   - A sync status indicator in the top right showing "Updated [time]"

---

## PART 4: Testing and Verification

### Test 1: Manual Refresh

1. Click the refresh button (🔄) in the extension popup
2. The CSV should refresh and show updated status

### Test 2: Check Status Indicator

1. Look at the top right of the "Select Vehicle" section
2. You should see a small status text showing:
   - "Updated [time]" (green) = Success
   - "Error: ..." (red) = Problem
   - "Last sync: [time]" (gray) = Info

### Test 3: Check Settings

1. Open settings again (⚙️ button)
2. Scroll to "CSV Data Source"
3. Verify:
   - "Auto-sync from URL" is selected
   - Your CSV URL is displayed
   - Auto-refresh is enabled
   - Last update time is shown

### Test 4: Background Refresh

1. Close the extension popup
2. Wait for the refresh interval (e.g., 15 minutes)
3. Reopen the extension
4. Check if the "Last update" time has changed

---

## PART 5: Troubleshooting

### Problem: "Failed to fetch CSV" Error

**Solutions:**
1. Check that the proxy service is running (terminal should show it's running)
2. Verify the CSV URL in settings is correct
3. Test the URL in a browser: `http://localhost:3000/csv`
4. Check browser console (F12 → Console) for detailed error messages

### Problem: Proxy Service Won't Start

**Solutions:**
1. Make sure Node.js is installed: `node --version`
2. Make sure you ran `npm install` in the server folder
3. Check that port 3000 is not already in use
4. Verify `config.json` exists and is valid JSON

### Problem: SFTP Connection Failed

**Solutions:**
1. Double-check SFTP credentials in `config.json`
2. Verify the CSV file path is correct
3. Test SFTP connection manually:
   ```bash
   sftp your-username@your-sftp-server.com
   ```
4. Check firewall allows outbound SFTP connections

### Problem: CSV Not Updating

**Solutions:**
1. Check that auto-refresh is enabled in settings
2. Verify the refresh interval is set (not 0)
3. Check browser console for errors
4. Manually click refresh button to test

### Problem: Extension Shows "Using cached data"

**Solutions:**
1. This means the fetch failed but old data is available
2. Check proxy service is running
3. Check CSV URL is correct
4. Look at browser console for the actual error

---

## PART 6: Daily Usage

Once everything is set up:

1. **Keep the proxy service running** (or deploy it to a server that's always on)
2. **Open the extension** - CSV will auto-fetch on open
3. **Select a vehicle** from the gallery
4. **Generate description** and post to Marketplace as usual

The CSV will automatically update:
- Every time you open the extension
- Periodically in the background (based on your interval setting)
- Only when the CSV content actually changes (smart change detection)

---

## Quick Reference

### Proxy Service Commands

```bash
# Start service
npm start

# Stop service
Press Ctrl+C in the terminal

# Install dependencies (if needed)
npm install
```

### Extension Settings Location

- Click extension icon → Settings (⚙️) button
- CSV URL: Enter your proxy service URL
- Auto-refresh: Enable and set interval
- Save Settings: Click to save

### Important URLs

- **Health Check**: `http://localhost:3000/health`
- **CSV Endpoint**: `http://localhost:3000/csv`
- **Status Endpoint**: `http://localhost:3000/csv/status`

---

## Need Help?

1. Check browser console (F12 → Console) for errors
2. Check proxy service terminal for errors
3. Verify all configuration values are correct
4. Test each component individually (SFTP, proxy, extension)

---

**You're all set!** The extension will now automatically sync CSV data from your SFTP server. 🎉


