# PM2 Auto-Start Setup for Windows

Your proxy server is now running with PM2! Here's how to make it start automatically when Windows boots.

## Current Status ✅

- ✅ PM2 installed and configured
- ✅ Proxy server running: `http://10.26.1.230:3000/csv`
- ✅ PM2 configuration saved

## Option 1: Windows Startup Folder (Requires Login)

⚠️ **LIMITATION:** This only runs when YOU log in. If the computer is on but no one is logged in, the server won't run.

1. **Create a startup script:**
   - Press `Windows Key + R`
   - Type: `shell:startup`
   - Press Enter (this opens your Startup folder)

2. **Create a new file** in that folder called `start-sftp-proxy.bat`:
   - Right-click in the folder → New → Text Document
   - Rename it to `start-sftp-proxy.bat` (remove .txt extension)
   - Right-click → Edit

3. **Add this content:**
   ```batch
   @echo off
   cd /d "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
   pm2 resurrect
   ```

4. **Save and close**

Now the server will start automatically when you log in!

**Note:** If you need it to run WITHOUT logging in, use Option 2 or 3 below.

## Option 2: Windows Task Scheduler - Run at System Startup (Runs WITHOUT Login) ⭐ RECOMMENDED

This will run the server even when no one is logged in!

1. **Open Task Scheduler as Administrator:**
   - Press `Windows Key`
   - Type: `Task Scheduler`
   - Right-click "Task Scheduler" → "Run as administrator"
   - Click Yes when prompted

2. **Create Task (not Basic Task):**
   - Click "Create Task" in the right panel (NOT "Create Basic Task")
   - General Tab:
     - Name: `SFTP Proxy Server`
     - Description: `Auto-start SFTP proxy server - runs at system startup`
     - ✅ Check "Run whether user is logged on or not"
     - ✅ Check "Run with highest privileges"
     - Configure for: `Windows 10` (or your Windows version)

3. **Triggers Tab:**
   - Click "New..."
   - Begin the task: `At startup`
   - ✅ Check "Enabled"
   - Click OK

4. **Actions Tab:**
   - Click "New..."
   - Action: `Start a program`
   - Program/script: `C:\Windows\System32\cmd.exe`
   - Add arguments: `/c cd /d "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server" && pm2 resurrect`
   - Start in: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server`
   - Click OK

5. **Conditions Tab:**
   - ✅ Uncheck "Start the task only if the computer is on AC power"
   - ✅ Check "Wake the computer to run this task" (optional)
   - Click OK

6. **Settings Tab:**
   - ✅ Check "Allow task to be run on demand"
   - ✅ Check "Run task as soon as possible after a scheduled start is missed"
   - ✅ Check "If the task fails, restart every:" → Set to `1 minute`
   - Restart attempts: `3`
   - Click OK

7. **Enter your password when prompted** (for running as your user account)

**✅ Now the server will start at Windows boot, even if no one logs in!**

---

## Option 2B: Windows Task Scheduler - Run at User Login (Simpler)

If you only need it when you're logged in:

1. **Open Task Scheduler:**
   - Press `Windows Key + R`
   - Type: `taskschd.msc`
   - Press Enter

2. **Create Basic Task:**
   - Click "Create Basic Task" in the right panel
   - Name: `SFTP Proxy Server`
   - Description: `Auto-start SFTP proxy server via PM2`
   - Click Next

3. **Set Trigger:**
   - Select "When I log on"
   - Click Next

4. **Set Action:**
   - Select "Start a program"
   - Program/script: `C:\Windows\System32\cmd.exe`
   - Add arguments: `/c cd /d "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server" && pm2 resurrect`
   - Click Next

5. **Finish:**
   - Check "Open the Properties dialog..."
   - Click Finish

6. **Configure Properties:**
   - In the Properties window, check "Run with highest privileges"
   - Under "Conditions" tab, uncheck "Start the task only if the computer is on AC power"
   - Click OK

## Option 3: Manual PM2 Commands (Quick Start)

If you just want to start it manually when needed:

```powershell
# Navigate to server folder
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"

# Start the server
pm2 start sftp-proxy.js --name sftp-proxy

# Save the configuration
pm2 save
```

## Useful PM2 Commands

```powershell
# Check server status
pm2 status

# View logs
pm2 logs sftp-proxy

# Restart server
pm2 restart sftp-proxy

# Stop server
pm2 stop sftp-proxy

# Delete server from PM2
pm2 delete sftp-proxy

# Monitor server (real-time)
pm2 monit

# View detailed info
pm2 show sftp-proxy
```

## Verify It's Working

1. **Check PM2 status:**
   ```powershell
   pm2 status
   ```
   Should show `sftp-proxy` as `online`

2. **Test the endpoint:**
   - Open browser: `http://localhost:3000/health`
   - Should return: `{"status":"ok",...}`

3. **After reboot:**
   - If using Startup Folder or Task Scheduler, the server should start automatically
   - Check with: `pm2 status`

## Troubleshooting

### Server not starting after reboot:
- Check if PM2 is running: `pm2 status`
- If empty, run: `pm2 resurrect`
- Verify startup script/task is configured correctly

### Port 3000 already in use:
- Find the process: `netstat -ano | findstr :3000`
- Stop it: `Stop-Process -Id [PID] -Force`
- Restart PM2: `pm2 restart sftp-proxy`

### PM2 not found:
- PM2 should be installed globally
- If not, run: `npm install -g pm2`
- May need to restart terminal/PowerShell

## Current Configuration

- **Server URL (Local):** `http://localhost:3000/csv`
- **Server URL (Network):** `http://10.26.1.230:3000/csv`
- **PM2 Process Name:** `sftp-proxy`
- **Status:** Running ✅

---

## Option 3: Windows Service (Most Reliable - Runs Always)

For the most robust solution, convert it to a Windows Service using NSSM (Non-Sucking Service Manager):

1. **Download NSSM:**
   - Go to: https://nssm.cc/download
   - Download the latest release (nssm-2.24.zip)
   - Extract to a folder (e.g., `C:\nssm`)

2. **Install as Service:**
   - Open PowerShell as Administrator
   - Navigate to NSSM folder: `cd C:\nssm\win64` (or win32 for 32-bit)
   - Run:
     ```powershell
     .\nssm install SFTP-Proxy-Service "C:\Program Files\nodejs\node.exe" "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server\sftp-proxy.js"
     ```
   - Set working directory:
     ```powershell
     .\nssm set SFTP-Proxy-Service AppDirectory "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
     ```
   - Start the service:
     ```powershell
     .\nssm start SFTP-Proxy-Service
     ```

3. **Verify:**
   - Open Services (services.msc)
   - Find "SFTP-Proxy-Service"
   - Should be "Running" and set to "Automatic"

**✅ This runs as a true Windows Service - always available, even without login!**

---

## Which Option Should You Use?

- **Option 1 (Startup Folder):** ✅ Simple, but only runs when YOU log in
- **Option 2 (Task Scheduler - System Startup):** ✅ Runs at boot, even without login ⭐ **RECOMMENDED**
- **Option 3 (Windows Service):** ✅ Most reliable, professional solution

**For your use case (running even when not logged in):** Use **Option 2** or **Option 3**!

