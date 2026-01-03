# Next Steps - Getting Your Extension Running

Follow these steps to get your Facebook Marketplace Auto-Poster extension up and running:

## Step 1: Create Extension Icons

You have two options:

### Option A: Use the Icon Generator (Easiest)
1. Open `create-icons.html` in your web browser
2. Click "Download All Icons"
3. Move the downloaded files to the `icons` folder:
   - `icon-16.png` → `icons/icon-16.png`
   - `icon-48.png` → `icons/icon-48.png`
   - `icon-128.png` → `icons/icon-128.png`

### Option B: Create Your Own Icons
1. Create three PNG images (16x16, 48x48, 128x128 pixels)
2. Use any image editor (Paint, Photoshop, GIMP, or online tools)
3. Save them as `icon-16.png`, `icon-48.png`, `icon-128.png` in the `icons` folder
4. A simple car/vehicle icon works well

## Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Type `chrome://extensions/` in the address bar
   - OR go to Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension:**
   - Click "Load unpacked" button
   - Navigate to and select the `FB MARKETPLACE PROJECT` folder
   - The extension should appear in your extensions list

4. **Verify Installation:**
   - You should see "Facebook Marketplace Vehicle Auto-Poster" in your extensions
   - The extension icon should appear in your Chrome toolbar

## Step 3: Get an AI API Key

Choose one service:

### OpenAI (Recommended)
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (you won't see it again!)

### Anthropic Claude
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

## Step 4: Configure the Extension

1. **Open the Extension:**
   - Click the extension icon in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon (🧩) and pin the extension

2. **Access Settings:**
   - Click the settings (⚙️) button in the extension popup

3. **Enter Your API Key:**
   - Select your AI service (OpenAI or Anthropic)
   - Paste your API key
   - Click "Save Settings"
   - You should see a success message

## Step 5: Test with Your CSV File

1. **Prepare Your CSV:**
   - Make sure your CSV has a `vehicle_id` or `vin` column
   - Ensure VINs are exactly 17 characters
   - Include vehicle photos (either URLs in CSV or local files named with VIN)

2. **Upload CSV:**
   - Click "Choose CSV File" in the extension
   - Select your CSV file
   - Wait for "Successfully loaded X vehicles" message

3. **Select a Vehicle:**
   - Click "Load Photos from CSV" to see photos from URLs
   - OR click "Upload Local Photos" and select photos named with VINs
   - Click on a photo to select that vehicle

4. **Generate Description:**
   - Enter a prompt (e.g., "Create an engaging description highlighting fuel economy")
   - Click "Generate Description"
   - Wait for the AI to generate the description
   - Review and copy if needed

5. **Post to Marketplace:**
   - Click "Open Facebook Marketplace"
   - Once the page loads, click "Fill Marketplace Form" in the extension
   - Review the auto-filled form
   - Upload photos manually if needed
   - Submit the listing

## Troubleshooting

### Extension Won't Load
- **Error: "Manifest file is missing or unreadable"**
  - Make sure you selected the correct folder (FB MARKETPLACE PROJECT)
  - Verify `manifest.json` exists in the root folder

- **Error: "Could not load extension"**
  - Check that all icon files exist in the `icons` folder
  - Verify icon files are PNG format

### CSV Not Loading
- **"VIN column not found"**
  - Make sure your CSV has a column named `vehicle_id` or `vin`
  - Check the column name spelling (case-sensitive)

- **"No vehicles loaded"**
  - Verify VINs are exactly 17 characters
  - Check that VINs don't contain invalid characters (I, O, Q are not allowed)

### Photos Not Matching
- **"No vehicle found for VIN"**
  - Ensure photo filename contains the VIN
  - VIN should be 17 characters (e.g., `1C4SJRBP7RS126541.jpg`)
  - Check that the VIN matches exactly with CSV data

### AI Description Not Generating
- **"API key not configured"**
  - Go to settings and enter your API key
  - Make sure you clicked "Save Settings"

- **"Failed to generate description"**
  - Verify your API key is correct
  - Check that you have credits/quota available
  - Try a different AI service

### Form Not Auto-Filling
- **"Please navigate to Facebook Marketplace first"**
  - Make sure you're on `facebook.com/marketplace/create`
  - Try refreshing the page

- **Form partially filled**
  - Facebook's UI may have changed
  - Some fields may need manual entry
  - Check browser console (F12) for errors

## Quick Test Checklist

- [ ] Icons created and in `icons` folder
- [ ] Extension loaded in Chrome
- [ ] API key configured in settings
- [ ] CSV file uploaded successfully
- [ ] Vehicle photo selected
- [ ] AI description generated
- [ ] Marketplace form auto-filled

## Need More Help?

1. **Check Browser Console:**
   - Press F12 to open Developer Tools
   - Look for error messages in the Console tab

2. **Check Extension Errors:**
   - Go to `chrome://extensions/`
   - Click "Errors" button if extension shows an error

3. **Verify File Structure:**
   ```
   FB MARKETPLACE PROJECT/
   ├── manifest.json
   ├── popup.html
   ├── popup.css
   ├── popup.js
   ├── content.js
   ├── background.js
   ├── icons/
   │   ├── icon-16.png
   │   ├── icon-48.png
   │   └── icon-128.png
   └── utils/
       ├── csvParser.js
       ├── vinMatcher.js
       └── aiService.js
   ```

You're all set! Start by creating the icons and loading the extension.



