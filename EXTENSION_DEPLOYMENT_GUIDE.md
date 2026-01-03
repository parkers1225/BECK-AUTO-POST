# Chrome Extension Deployment Guide

This guide covers the best ways to deploy the Chrome extension to employee computers across all stores.

## Deployment Options Comparison

| Method | Difficulty | Control | Updates | Best For |
|--------|-----------|---------|---------|----------|
| **Manual Installation** | ⭐ Easy | ⭐⭐ Medium | Manual | Small teams, testing |
| **Chrome Web Store** | ⭐⭐⭐ Moderate | ⭐⭐⭐ High | Automatic | Public/Unlisted |
| **Enterprise Policy** | ⭐⭐⭐⭐ Complex | ⭐⭐⭐⭐⭐ Full | Automatic | Large orgs, managed Chrome |
| **Group Policy (Windows)** | ⭐⭐⭐⭐ Complex | ⭐⭐⭐⭐⭐ Full | Automatic | Windows domain |
| **Network Share + Script** | ⭐⭐ Easy | ⭐⭐⭐ Medium | Semi-auto | Small-medium teams |
| **Chrome Extension ID** | ⭐⭐ Easy | ⭐⭐⭐ Medium | Manual | Quick deployment |

---

## Option 1: Manual Installation (Simplest)

### Best For:
- ✅ Small teams (< 10 employees)
- ✅ Testing/initial rollout
- ✅ Non-technical users
- ✅ Quick deployment

### Steps:

1. **Package Extension**
   ```powershell
   # Create ZIP file of extension
   Compress-Archive -Path "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\*" `
     -DestinationPath "beck-auto-post-extension.zip" `
     -Exclude "node_modules","server","*.md"
   ```

2. **Distribute to Employees**
   - Email the ZIP file
   - Or share via network drive
   - Or use file sharing service (OneDrive, Google Drive)

3. **Installation Instructions for Employees**
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the extracted extension folder

### Pros:
- ✅ Simple, no IT setup needed
- ✅ Works immediately
- ✅ No approval process

### Cons:
- ❌ Manual process for each employee
- ❌ Updates require re-installation
- ❌ No centralized management

---

## Option 2: Chrome Web Store (Recommended for Production)

### Best For:
- ✅ Multiple stores/employees
- ✅ Automatic updates
- ✅ Professional deployment
- ✅ Easy management

### Steps:

#### A. Prepare Extension for Store

1. **Create Extension Package**
   ```powershell
   # Create clean package (exclude dev files)
   $packagePath = "beck-auto-post-extension-package"
   New-Item -ItemType Directory -Path $packagePath -Force
   
   # Copy only needed files
   Copy-Item "manifest.json" $packagePath
   Copy-Item "popup.html" $packagePath
   Copy-Item "popup.js" $packagePath
   Copy-Item "popup.css" $packagePath
   Copy-Item "background.js" $packagePath
   Copy-Item "content.js" $packagePath
   Copy-Item "icons" $packagePath -Recurse
   Copy-Item "utils" $packagePath -Recurse
   
   # Create ZIP
   Compress-Archive -Path "$packagePath\*" `
     -DestinationPath "beck-auto-post-extension.zip"
   ```

2. **Update manifest.json** (if needed)
   - Ensure version number is set
   - Add store-appropriate details

#### B. Publish to Chrome Web Store

1. **Create Developer Account**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Pay one-time $5 registration fee
   - Create account

2. **Upload Extension**
   - Click "New Item"
   - Upload ZIP file
   - Fill in store listing details
   - Choose visibility:
     - **Public** - Anyone can find and install
     - **Unlisted** - Only people with link can install (Recommended)
     - **Private** - Only specific users

3. **Submit for Review**
   - Chrome reviews extensions (usually 1-3 days)
   - Once approved, it's live

#### C. Distribute to Employees

**Option A: Unlisted Link**
- Share the Chrome Web Store link with employees
- They click "Add to Chrome"
- Extension installs automatically
- Updates automatically

**Option B: Enterprise Policy** (if using managed Chrome)
- Add extension ID to Chrome Enterprise policy
- Extension auto-installs for all users

### Pros:
- ✅ Automatic updates
- ✅ Professional deployment
- ✅ Easy for employees (just click link)
- ✅ Centralized management
- ✅ Works across all devices

### Cons:
- ❌ $5 registration fee
- ❌ Review process (1-3 days)
- ❌ Need to maintain store listing

---

## Option 3: Enterprise Policy (Best for Large Organizations)

### Best For:
- ✅ Large organizations
- ✅ Managed Chrome (Google Workspace)
- ✅ Centralized control
- ✅ Automatic deployment

### Requirements:
- Google Workspace account
- Chrome Enterprise/Education
- Admin access to Google Admin Console

### Steps:

1. **Package Extension** (same as Option 2)

2. **Upload to Chrome Web Store** (as Unlisted)

3. **Configure Enterprise Policy**
   - Go to Google Admin Console
   - Navigate to: Devices → Chrome → Apps and extensions
   - Click "Manage force-installed apps"
   - Add extension by ID or URL
   - Set to "Force install" or "Allow install"

4. **Deploy**
   - Extension automatically installs on all managed Chrome browsers
   - Updates automatically

### Pros:
- ✅ Automatic deployment
- ✅ Centralized management
- ✅ Force-install capability
- ✅ Automatic updates
- ✅ No user action needed

### Cons:
- ❌ Requires Google Workspace
- ❌ Requires admin access
- ❌ More complex setup

---

## Option 4: Group Policy (Windows Domain)

### Best For:
- ✅ Windows domain environments
- ✅ Active Directory
- ✅ IT-managed computers

### Steps:

1. **Package Extension** (same as Option 2)

2. **Create Group Policy**
   - Open Group Policy Management
   - Create new policy or edit existing
   - Navigate to: Computer Configuration → Policies → Administrative Templates → Google → Google Chrome → Extensions
   - Enable "Configure the list of force-installed extensions"
   - Add extension ID and update URL

3. **Deploy**
   - Link policy to appropriate OUs
   - Extension installs on next policy refresh

### Pros:
- ✅ Automatic deployment
- ✅ Centralized control
- ✅ Works with Windows domain
- ✅ No user action needed

### Cons:
- ❌ Requires Windows domain
- ❌ Requires Group Policy access
- ❌ More complex setup

---

## Option 5: Network Share + Installation Script (Hybrid)

### Best For:
- ✅ Small-medium teams
- ✅ Network file share available
- ✅ Some IT support
- ✅ Quick deployment

### Steps:

1. **Create Network Share**
   ```powershell
   # Share extension folder on network
   # Example: \\server\shared\beck-extension
   ```

2. **Create Installation Script**
   ```powershell
   # install-extension.ps1
   $extensionPath = "\\server\shared\beck-extension"
   $chromeExtPath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Extensions"
   
   # Copy extension to Chrome extensions folder
   # Or use Chrome's --load-extension flag
   ```

3. **Distribute Script**
   - Email script to employees
   - Or run via Group Policy
   - Or include in onboarding

### Pros:
- ✅ Semi-automated
- ✅ Centralized source
- ✅ Can update source, employees re-run script

### Cons:
- ❌ Still requires some user action
- ❌ Updates not automatic
- ❌ Requires network access

---

## Option 6: Chrome Extension ID Method (Quick Deploy)

### Best For:
- ✅ Quick deployment
- ✅ Employees already have extension installed
- ✅ Just need to update/configure

### Steps:

1. **Get Extension ID**
   - Install extension once manually
   - Go to `chrome://extensions/`
   - Note the Extension ID

2. **Share Configuration**
   - Create configuration file with store-specific settings
   - Employees import settings
   - Or use extension's settings sync

### Pros:
- ✅ Quick for existing installs
- ✅ Just configure, don't reinstall

### Cons:
- ❌ Still need initial installation
- ❌ Not for new deployments

---

## Recommended Approach for Your Situation

### For Multiple Stores with Employees:

**Best Option: Chrome Web Store (Unlisted)**

**Why:**
1. ✅ Professional deployment
2. ✅ Automatic updates (critical for multi-store)
3. ✅ Easy for employees (just click link)
4. ✅ Centralized management
5. ✅ Works across all devices
6. ✅ No IT overhead per employee

**Implementation Steps:**

1. **Package Extension**
   ```powershell
   # Create clean package
   # Exclude: node_modules, server, .md files, etc.
   ```

2. **Publish to Chrome Web Store**
   - Create developer account ($5 one-time)
   - Upload as "Unlisted"
   - Get approval (1-3 days)

3. **Distribute Links Per Store**
   - BECK CDJR employees: Share link + store config
   - BECK CHEVY employees: Share link + store config
   - BECK FORD employees: Share link + store config
   - BECK NISSAN employees: Share link + store config

4. **Store-Specific Configuration**
   - Each employee configures their extension with their store's URL/API key
   - Or create store-specific extension packages

---

## Store-Specific Deployment Strategy

### Option A: Single Extension, Store-Specific Config

**Approach:**
- One extension published to Chrome Web Store
- Each employee configures with their store's settings
- Configuration guide provided

**Pros:**
- ✅ One extension to maintain
- ✅ Easy updates
- ✅ Flexible

**Cons:**
- ❌ Employees must configure correctly
- ❌ Risk of wrong store configuration

### Option B: Store-Specific Extensions

**Approach:**
- Create 4 separate extension packages
- Each pre-configured for specific store
- Publish all 4 to Chrome Web Store (unlisted)

**Pros:**
- ✅ No configuration needed
- ✅ Less user error
- ✅ Clear separation

**Cons:**
- ❌ 4 extensions to maintain
- ❌ More complex updates

**Recommended: Option A** (single extension with configuration guide)

---

## Quick Start: Manual Deployment (For Now)

If you need to deploy quickly before Chrome Web Store:

1. **Create Deployment Package**
   ```powershell
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
   
   # Create clean package
   $exclude = @("node_modules", "server", "*.md", ".git", ".cursorignore")
   Compress-Archive -Path * `
     -DestinationPath "beck-auto-post-extension.zip" `
     -Force
   ```

2. **Create Installation Guide**
   - Simple step-by-step instructions
   - Include store-specific configuration
   - Email to employees

3. **Distribute**
   - Email ZIP + instructions
   - Or share via network drive
   - Or use file sharing service

4. **Follow Up**
   - Verify installations
   - Help with configuration
   - Collect feedback

---

## Deployment Checklist

### Pre-Deployment
- [ ] Extension tested and working
- [ ] Store configurations documented
- [ ] Installation instructions created
- [ ] Package created (ZIP or Chrome Web Store)

### Deployment
- [ ] Distribute to employees
- [ ] Provide configuration guide
- [ ] Verify installations
- [ ] Test each store's extension

### Post-Deployment
- [ ] Monitor for issues
- [ ] Collect feedback
- [ ] Plan for updates
- [ ] Document common issues

---

## Employee Installation Instructions Template

I can create a simple, employee-friendly installation guide. Would you like me to create that?

---

## Next Steps

1. **Decide on deployment method** (recommend Chrome Web Store)
2. **Package extension** (I can help create the package)
3. **Create employee instructions** (I can create this)
4. **Deploy and test**
5. **Monitor and support**

**Which deployment method would you like to use?** I can help you implement any of these!


