# Chrome Web Store Publishing Guide

Complete guide to publish the Beck Auto-Post extension to Chrome Web Store for production deployment.

## Prerequisites

- ✅ Extension package created (run `create-production-package.ps1`)
- ✅ Google account
- ✅ $5 one-time developer registration fee
- ✅ Extension tested and working

---

## Step 1: Create Chrome Web Store Developer Account

1. **Go to Chrome Web Store Developer Dashboard**
   - Visit: https://chrome.google.com/webstore/devconsole
   - Sign in with your Google account

2. **Pay Registration Fee**
   - Click "Pay Registration Fee"
   - Pay $5 one-time fee (credit card or PayPal)
   - This is a one-time payment, not recurring

3. **Complete Developer Account Setup**
   - Accept terms of service
   - Complete profile information
   - Verify email if needed

**Time:** 5-10 minutes

---

## Step 2: Prepare Extension Package

### A. Create Production Package

```powershell
cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT"
.\create-production-package.ps1
```

This creates:
- `beck-auto-post-extension-package/` - Folder to review
- `beck-auto-post-extension-v1.0.0.zip` - ZIP file for upload

### B. Test Package Locally

1. **Load in Chrome (Developer Mode)**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `beck-auto-post-extension-package` folder
   - Verify extension works correctly

2. **Test ZIP File**
   - Extract ZIP to temp folder
   - Load unpacked from temp folder
   - Verify everything works

**Important:** Test thoroughly before submitting!

---

## Step 3: Prepare Store Listing Materials

### Required Information:

1. **Extension Name**
   - `Beck Auto-Post` (or your preferred name)

2. **Short Description** (132 characters max)
   - Example: "Automate Facebook Marketplace vehicle listings with AI-powered descriptions and CSV integration"

3. **Detailed Description** (up to 16,000 characters)
   - See `STORE_LISTING_DESCRIPTION.md` (I'll create this)

4. **Category**
   - Productivity or Business

5. **Language**
   - English (United States)

6. **Privacy Policy URL** (Required)
   - You'll need to create a privacy policy
   - See `PRIVACY_POLICY_TEMPLATE.md` (I'll create this)

7. **Screenshots** (Required)
   - At least 1 screenshot (1280x800 or 640x400)
   - Up to 5 screenshots
   - See `SCREENSHOT_GUIDE.md` (I'll create this)

8. **Promotional Images** (Optional but recommended)
   - Small tile: 440x280
   - Large tile: 920x680
   - Marquee: 1400x560

9. **Icon** (Required)
   - 128x128 PNG
   - Already have: `icons/beck-logo.png`

---

## Step 4: Upload Extension

1. **Go to Developer Dashboard**
   - https://chrome.google.com/webstore/devconsole
   - Click "New Item"

2. **Upload ZIP File**
   - Click "Choose file"
   - Select `beck-auto-post-extension-v1.0.0.zip`
   - Click "Upload"
   - Wait for upload to complete

3. **Fill in Store Listing**

   **Basic Information:**
   - Name: `Beck Auto-Post`
   - Summary: (short description)
   - Description: (detailed description)
   - Category: Productivity or Business
   - Language: English (United States)

   **Privacy:**
   - Privacy Policy URL: (your privacy policy URL)
   - Single purpose: Yes (if applicable)
   - Permissions justification: (explain why each permission is needed)

   **Media:**
   - Icon: Upload `icons/beck-logo.png` (128x128)
   - Screenshots: Upload at least 1 screenshot
   - Promotional images: (optional)

   **Distribution:**
   - Visibility: **Unlisted** (Recommended)
     - Unlisted = Only people with link can install
     - Public = Anyone can find and install
   - Regions: All regions (or select specific)
   - Pricing: Free

4. **Review and Submit**
   - Review all information
   - Check for errors/warnings
   - Click "Submit for Review"

---

## Step 5: Review Process

### Timeline:
- **Initial Review:** 1-3 business days
- **Updates:** Usually faster (hours to 1 day)

### What Chrome Reviews:
- ✅ Extension functionality
- ✅ Security and permissions
- ✅ Privacy policy compliance
- ✅ Content policy compliance
- ✅ User data handling

### Possible Outcomes:

**Approved:**
- Extension goes live
- You receive email notification
- Share link with employees

**Rejected (with feedback):**
- Review feedback provided
- Fix issues and resubmit
- Usually quick turnaround

**Request for More Information:**
- Chrome may ask questions
- Respond promptly
- Usually about permissions or privacy

---

## Step 6: After Approval

### Get Extension Link

1. **Go to Developer Dashboard**
2. **Click on your extension**
3. **Copy the "Chrome Web Store" link**
   - Example: `https://chrome.google.com/webstore/detail/extension-id/...`

### Distribute to Employees

**Option A: Email Distribution**
- Send email with:
  - Extension link
  - Store-specific configuration guide
  - Installation instructions

**Option B: Create Store-Specific Landing Pages**
- Create simple HTML page per store
- Include extension link
- Include store-specific configuration
- Share page URL with employees

**Option C: QR Code**
- Generate QR code for extension link
- Print and post at each store
- Employees scan and install

---

## Step 7: Store-Specific Configuration

After employees install, they need to configure:

### BECK CDJR Employees:
- CSV URL: `http://your-server:3000/csv/beck-cdjr`
- API Key: `beck-cdjr-secret-key`

### BECK CHEVY Employees:
- CSV URL: `http://your-server:3000/csv/beck-chevy`
- API Key: `beck-chevy-secret-key`

### BECK FORD Employees:
- CSV URL: `http://your-server:3000/csv/beck-ford`
- API Key: `beck-ford-secret-key`

### BECK NISSAN Employees:
- CSV URL: `http://your-server:3000/csv/beck-nissan`
- API Key: `beck-nissan-secret-key`

**See:** `CONFIGURE_EXTENSIONS_FOR_STORES.md` for detailed instructions

---

## Step 8: Updates and Maintenance

### Updating Extension

1. **Make Changes**
   - Update code
   - Increment version in `manifest.json`
   - Test thoroughly

2. **Create New Package**
   ```powershell
   .\create-production-package.ps1
   ```

3. **Upload Update**
   - Go to Developer Dashboard
   - Click on extension
   - Click "Package" tab
   - Upload new ZIP file
   - Submit update

4. **Automatic Distribution**
   - Chrome automatically updates installed extensions
   - Employees get update within hours
   - No action needed from employees

---

## Important Notes

### Privacy Policy (Required)

Chrome requires a privacy policy URL. Options:

1. **Create Simple Privacy Policy**
   - Host on your website
   - Or use GitHub Pages (free)
   - Or use privacy policy generator

2. **What to Include:**
   - What data is collected
   - How data is used
   - Data storage and security
   - Third-party services (OpenAI, Anthropic)
   - User rights

**See:** `PRIVACY_POLICY_TEMPLATE.md` (I'll create this)

### Permissions Justification

Be prepared to explain each permission:

- `activeTab` - To interact with Facebook Marketplace pages
- `storage` - To store CSV data and settings locally
- `scripting` - To inject content scripts
- `sidePanel` - To show extension interface
- `alarms` - For auto-refresh functionality
- `host_permissions` - To fetch CSV from proxy server and AI APIs

### Unlisted vs Public

**Unlisted (Recommended):**
- ✅ Only people with link can install
- ✅ Not searchable in Chrome Web Store
- ✅ More control over who installs
- ✅ Better for internal/employee use

**Public:**
- ✅ Anyone can find and install
- ✅ Searchable in Chrome Web Store
- ✅ More visibility
- ⚠️ Less control

---

## Troubleshooting

### Submission Rejected

**Common Reasons:**
- Missing privacy policy
- Permissions not justified
- Extension doesn't work as described
- Security issues

**Solution:**
- Read feedback carefully
- Fix issues
- Resubmit

### Extension Not Updating

**Check:**
- Version number incremented in manifest.json
- ZIP file uploaded correctly
- Update approved by Chrome

### Employees Can't Install

**Check:**
- Link is correct
- Extension is approved and live
- Chrome browser is up to date
- No corporate policies blocking installation

---

## Checklist Before Submitting

- [ ] Extension tested and working
- [ ] Production package created
- [ ] ZIP file tested locally
- [ ] Store listing description written
- [ ] Privacy policy created and hosted
- [ ] Screenshots prepared
- [ ] Icon ready (128x128)
- [ ] Permissions justified
- [ ] Version number set in manifest.json
- [ ] All files included in package
- [ ] No dev files in package
- [ ] Extension name finalized

---

## Next Steps

1. ✅ Run `create-production-package.ps1`
2. ✅ Create privacy policy
3. ✅ Prepare screenshots
4. ✅ Write store listing description
5. ✅ Create Chrome Web Store developer account
6. ✅ Upload and submit
7. ✅ Wait for approval (1-3 days)
8. ✅ Distribute to employees

---

**Ready to publish?** Let's create all the supporting materials!


