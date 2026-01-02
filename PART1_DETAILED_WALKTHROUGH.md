# PART 1: Setting Up the HTTP Proxy Service - DETAILED WALKTHROUGH

This guide will walk you through every single step with exact commands and what to expect.

---

## STEP 1: Navigate to the Server Directory

### What You Need to Do:
Find and open the `server` folder in your project.

### Detailed Instructions:

**Option A: Using File Explorer (Windows)**
1. Open File Explorer (Windows key + E)
2. Navigate to: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`
3. Double-click the `server` folder to open it
4. You should see these files:
   - `sftp-proxy.js`
   - `config.example.json`
   - `package.json`
   - `README.md`

**Option B: Using Command Prompt/Terminal**
1. Press `Windows Key + R`
2. Type: `cmd` and press Enter
3. Type this command (press Enter after each line):
   ```cmd
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
   ```
4. You should see the prompt change to show you're in the server folder
5. Type: `dir` (Windows) or `ls` (Mac/Linux) to see the files

**What You Should See:**
```
sftp-proxy.js
config.example.json
package.json
README.md
```

**✅ Checkpoint:** If you see these 4 files, you're in the right place! Move to Step 2.

---

## STEP 2: Check if Node.js is Installed

### What You Need to Do:
Verify that Node.js is installed on your computer.

### Detailed Instructions:

1. **Open Command Prompt or Terminal:**
   - Press `Windows Key + R`
   - Type: `cmd`
   - Press Enter

2. **Check Node.js Version:**
   Type this command and press Enter:
   ```cmd
   node --version
   ```

3. **What You Should See:**

   **✅ GOOD - Node.js is installed:**
   ```
   v18.17.0
   ```
   (Your version number might be different - that's okay! Any version 14 or higher works)
   
   **❌ BAD - Node.js is NOT installed:**
   ```
   'node' is not recognized as an internal or external command
   ```

### If Node.js is NOT Installed:

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Click the big green "LTS" button (recommended version)
   - This will download an installer

2. **Install Node.js:**
   - Run the downloaded installer
   - Click "Next" through all the prompts (default settings are fine)
   - Click "Install"
   - Wait for installation to complete
   - Click "Finish"

3. **Verify Installation:**
   - Close and reopen Command Prompt
   - Type: `node --version`
   - You should now see a version number

**✅ Checkpoint:** You should see a version number like `v18.17.0` or similar. Move to Step 3.

---

## STEP 3: Install Dependencies

### What You Need to Do:
Install the required packages (express and ssh2-sftp-client) that the proxy service needs.

### Detailed Instructions:

1. **Open Command Prompt/Terminal in the server folder:**
   - Press `Windows Key + R`
   - Type: `cmd`
   - Press Enter
   - Type this command to navigate to the server folder:
     ```cmd
     cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server
     ```
   - Press Enter

2. **Verify You're in the Right Folder:**
   Type: `dir` and press Enter
   
   You should see:
   ```
   sftp-proxy.js
   config.example.json
   package.json
   README.md
   ```

3. **Install Dependencies:**
   Type this command and press Enter:
   ```cmd
   npm install
   ```

4. **What Will Happen:**
   - npm will start downloading packages
   - You'll see lots of text scrolling by
   - This may take 1-3 minutes depending on your internet speed
   - Be patient - don't close the window!

5. **What You Should See:**

   **✅ SUCCESS - Installation Complete:**
   ```
   added 150 packages in 45s
   ```
   (The numbers will be different, but you should see "added X packages")

   You'll also see a new folder appear: `node_modules` (this contains all the installed packages)

   **❌ ERROR - If You See Errors:**
   
   **Error: "npm is not recognized"**
   - Node.js wasn't installed correctly
   - Reinstall Node.js from step 2
   
   **Error: "Cannot find package.json"**
   - You're not in the right folder
   - Make sure you're in: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server`
   - Type `dir` to verify you see `package.json`

6. **Verify Installation:**
   Type: `dir` and press Enter
   
   You should now see:
   ```
   node_modules          <-- NEW FOLDER (this is good!)
   sftp-proxy.js
   config.example.json
   package.json
   README.md
   ```

**✅ Checkpoint:** You should see a `node_modules` folder. This means dependencies are installed! Move to Step 4.

---

## STEP 4: Create Configuration File

### What You Need to Do:
Copy the example config file and create your actual config file.

### Detailed Instructions:

**Option A: Using File Explorer (Easiest)**

1. **Open File Explorer:**
   - Navigate to: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server`

2. **Copy the Example File:**
   - Right-click on `config.example.json`
   - Click "Copy" (or press Ctrl+C)

3. **Paste the Copy:**
   - Right-click in an empty area of the folder
   - Click "Paste" (or press Ctrl+V)
   - You'll see a new file: `config.example - Copy.json`

4. **Rename the Copy:**
   - Right-click on `config.example - Copy.json`
   - Click "Rename"
   - Delete everything and type: `config.json`
   - Press Enter
   - Windows will ask: "Are you sure you want to change the file extension?"
   - Click "Yes"

**Option B: Using Command Prompt**

1. **Open Command Prompt in the server folder:**
   ```cmd
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
   ```

2. **Copy the File:**
   Type this command and press Enter:
   ```cmd
   copy config.example.json config.json
   ```

3. **Verify:**
   Type: `dir` and press Enter
   
   You should see:
   ```
   config.json          <-- NEW FILE (this is what we want!)
   config.example.json
   node_modules
   package.json
   sftp-proxy.js
   README.md
   ```

**✅ Checkpoint:** You should see `config.json` in the folder. Move to Step 5.

---

## STEP 5: Edit Configuration File

### What You Need to Do:
Open `config.json` and fill in your SFTP server details.

### Detailed Instructions:

1. **Open config.json:**
   - Right-click on `config.json`
   - Click "Open with" → Choose a text editor:
     - **Notepad** (simple, comes with Windows)
     - **Notepad++** (better, if you have it)
     - **VS Code** (best, if you have it)
     - **Any text editor** will work

2. **What You'll See:**
   The file will look like this:
   ```json
   {
     "sftp": {
       "host": "sftp.example.com",
       "port": 22,
       "username": "your-username",
       "password": "your-password",
       "path": "/path/to/vehicles.csv"
     },
     "server": {
       "port": 3000,
       "apiKey": "optional-api-key-for-authentication"
     }
   }
   ```

3. **Edit Each Field:**

   **A. SFTP Host:**
   - Find: `"host": "sftp.example.com"`
   - Replace `sftp.example.com` with your actual SFTP server address
   - Example: `"host": "ftp.mycompany.com"` or `"host": "192.168.1.100"`
   - **Keep the quotes!**

   **B. SFTP Port:**
   - Find: `"port": 22`
   - Usually this is 22 (default SFTP port)
   - Only change if your SFTP server uses a different port
   - **No quotes around the number!**

   **C. SFTP Username:**
   - Find: `"username": "your-username"`
   - Replace `your-username` with your actual SFTP username
   - Example: `"username": "parker"` or `"username": "admin"`
   - **Keep the quotes!**

   **D. SFTP Password:**
   - Find: `"password": "your-password"`
   - Replace `your-password` with your actual SFTP password
   - Example: `"password": "MySecurePass123!"`
   - **Keep the quotes!**
   - **⚠️ WARNING:** This file contains your password. Don't share it or commit it to version control!

   **E. CSV File Path:**
   - Find: `"path": "/path/to/vehicles.csv"`
   - Replace `/path/to/vehicles.csv` with the actual path to your CSV file on the SFTP server
   - Examples:
     - `"path": "/data/vehicles.csv"`
     - `"path": "/home/user/vehicles.csv"`
     - `"path": "/export/beck_vehicles.csv"`
   - **Keep the quotes!**
   - **Important:** This is the path ON THE SFTP SERVER, not on your computer!

   **F. Server Port (Optional):**
   - Find: `"port": 3000`
   - This is the port the proxy service will run on
   - 3000 is fine for local testing
   - Only change if port 3000 is already in use

   **G. API Key (Optional but Recommended):**
   - Find: `"apiKey": "optional-api-key-for-authentication"`
   - Replace with a random secure string
   - Example: `"apiKey": "my-secret-key-12345-abcde"`
   - This adds security - only requests with this key can access your CSV
   - **Keep the quotes!**

4. **Example of Completed config.json:**
   ```json
   {
     "sftp": {
       "host": "sftp.beckauto.com",
       "port": 22,
       "username": "parker",
       "password": "MySecurePassword123!",
       "path": "/exports/vehicles.csv"
     },
     "server": {
       "port": 3000,
       "apiKey": "beck-auto-secret-key-2024"
     }
   }
   ```

5. **Save the File:**
   - Press `Ctrl + S` (or File → Save)
   - Close the text editor

6. **Verify the File is Valid JSON:**
   - Make sure you have:
     - Opening `{` and closing `}`
     - Commas between items (but NOT after the last item)
     - Quotes around all text values
     - No quotes around numbers
   - You can use an online JSON validator: https://jsonlint.com/
   - Copy your config.json content and paste it there to check

**Common Mistakes to Avoid:**
- ❌ Missing quotes around text values
- ❌ Extra comma after the last item in a section
- ❌ Missing comma between items
- ❌ Using backslashes `\` instead of forward slashes `/` in the path
- ❌ Typos in field names (must be exactly: host, port, username, password, path)

**✅ Checkpoint:** Your `config.json` should have all your real SFTP information filled in. Double-check for typos! Move to Step 6.

---

## STEP 6: Start the Proxy Service

### What You Need to Do:
Run the proxy service so it can fetch CSV files from your SFTP server.

### Detailed Instructions:

1. **Open Command Prompt in the server folder:**
   - Press `Windows Key + R`
   - Type: `cmd`
   - Press Enter
   - Type:
     ```cmd
     cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
     ```
   - Press Enter

2. **Start the Service:**
   Type this command and press Enter:
   ```cmd
   npm start
   ```

3. **What You Should See:**

   **✅ SUCCESS - Service Started:**
   ```
   🚀 SFTP Proxy Service running on port 3000
   📡 Endpoints:
      GET /csv - Fetch CSV file
      GET /csv/status - Get CSV status
      GET /health - Health check

   ⚙️  Configuration:
      SFTP Host: sftp.beckauto.com:22
      SFTP Path: /exports/vehicles.csv
      API Key: Enabled

   💡 Tip: Make sure config.json is properly configured

   Connecting to SFTP server: sftp.beckauto.com:22
   SFTP connected successfully
   File found: /exports/vehicles.csv (12345 bytes, modified: ...)
   CSV fetched successfully (12345 chars, hash: abc12345...)
   ```

   **❌ ERROR - Common Issues:**

   **Error: "Cannot find module 'express'"**
   - Dependencies weren't installed
   - Go back to Step 3 and run `npm install` again

   **Error: "Cannot find config.json"**
   - You're not in the right folder
   - Make sure you're in the `server` folder
   - Verify `config.json` exists with `dir`

   **Error: "ECONNREFUSED" or "Connection refused"**
   - SFTP server is unreachable
   - Check your SFTP host address
   - Check your internet connection
   - Verify SFTP server is running

   **Error: "Authentication failed"**
   - Wrong username or password
   - Double-check your credentials in `config.json`
   - Make sure there are no extra spaces

   **Error: "File not found" or "ENOENT"**
   - Wrong CSV file path
   - Verify the path in `config.json` is correct
   - Check the path uses forward slashes `/` not backslashes `\`

4. **Keep the Terminal Open:**
   - **IMPORTANT:** Don't close this Command Prompt window!
   - The service needs to keep running
   - If you close it, the service stops
   - You can minimize it, but don't close it

5. **What the Service is Doing:**
   - It's now listening on port 3000
   - It can fetch CSV from your SFTP server
   - It's ready to serve CSV to the Chrome extension

**✅ Checkpoint:** You should see the service running message and "CSV fetched successfully". The terminal should stay open and show the service is running. Move to Step 7.

---

## STEP 7: Test the Proxy Service

### What You Need to Do:
Verify the proxy service is working by testing it in a web browser.

### Detailed Instructions:

1. **Open a Web Browser:**
   - Chrome, Firefox, Edge - any browser works

2. **Test Health Endpoint:**
   - In the address bar, type: `http://localhost:3000/health`
   - Press Enter
   
   **What You Should See:**
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-15T10:30:00.000Z",
     "csvAvailable": true
   }
   ```
   
   **If you see this:** ✅ The service is running correctly!

3. **Test CSV Endpoint:**
   - In the address bar, type: `http://localhost:3000/csv`
   - Press Enter
   
   **What You Should See:**
   
   **✅ SUCCESS:**
   - Your CSV file content displayed in the browser
   - It should look like:
     ```
     vehicle_id,make,model,year,price,...
     1C4SJRBP7RS126541,Jeep,Wrangler,2024,35000,...
     ...
     ```
   - Or it might download as a file (that's also fine!)
   
   **❌ ERROR - If You See:**
   
   **"Failed to fetch CSV from SFTP"**
   - Check the terminal for error messages
   - Verify SFTP credentials in `config.json`
   - Test SFTP connection manually
   
   **"Cannot GET /csv"**
   - Service might not be running
   - Check the terminal window
   - Restart with `npm start`
   
   **"This site can't be reached" or "Connection refused"**
   - Service is not running
   - Go back to Step 6 and start it
   - Make sure you didn't close the terminal

4. **Check the Terminal:**
   - Look at the Command Prompt window where you ran `npm start`
   - You should see log messages about the requests
   - Example:
     ```
     GET /health 200
     GET /csv 200
     ```

**✅ Checkpoint:** Both `/health` and `/csv` endpoints should work. You should see your CSV data. If everything works, **PART 1 IS COMPLETE!** 🎉

---

## TROUBLESHOOTING GUIDE

### Problem: "node is not recognized"
**Solution:** Node.js isn't installed or not in PATH
- Reinstall Node.js from nodejs.org
- Restart Command Prompt after installation

### Problem: "npm is not recognized"
**Solution:** npm comes with Node.js, reinstall Node.js

### Problem: "Cannot find module 'express'"
**Solution:** Dependencies not installed
- Run `npm install` in the server folder
- Make sure you see `node_modules` folder

### Problem: "ECONNREFUSED" when starting service
**Solution:** SFTP server connection issue
- Check SFTP host address is correct
- Verify internet connection
- Test SFTP manually: `sftp username@host`

### Problem: "Authentication failed"
**Solution:** Wrong credentials
- Double-check username and password in `config.json`
- Make sure no extra spaces
- Verify credentials work with SFTP client

### Problem: "File not found" or "ENOENT"
**Solution:** Wrong CSV file path
- Verify path in `config.json` is correct
- Use forward slashes `/` not backslashes `\`
- Path should start with `/` (absolute path)
- Test path exists on SFTP server

### Problem: Port 3000 already in use
**Solution:** Another program is using port 3000
- Change port in `config.json` to something else (e.g., 3001)
- Or stop the program using port 3000

### Problem: Service starts but CSV endpoint returns error
**Solution:** Check terminal for specific error
- Look for SFTP connection errors
- Verify CSV file exists at specified path
- Check file permissions on SFTP server

---

## NEXT STEPS

Once Part 1 is complete and the proxy service is running:

1. **Keep the terminal open** (service must keep running)
2. **Move to Part 2:** Configure the Chrome Extension
3. **Use this URL in the extension:** `http://localhost:3000/csv`

---

## QUICK REFERENCE

**Commands to Remember:**
```cmd
# Navigate to server folder
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"

# Install dependencies
npm install

# Start the service
npm start

# Stop the service
Press Ctrl+C
```

**Important URLs:**
- Health check: `http://localhost:3000/health`
- CSV endpoint: `http://localhost:3000/csv`
- Status: `http://localhost:3000/csv/status`

**Files You Created/Modified:**
- `config.json` - Contains your SFTP credentials (KEEP SECRET!)
- `node_modules/` - Installed packages (don't edit)

---

**You've completed Part 1!** The proxy service is now running and ready to serve CSV data to your Chrome extension. 🚀


