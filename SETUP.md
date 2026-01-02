# Quick Setup Guide

## Prerequisites

1. **Chrome Browser** (latest version)
2. **CSV file** with vehicle data (see README.md for format)
3. **AI API Key** (OpenAI or Anthropic)

## Installation Steps

### 1. Create Extension Icons

Before loading the extension, you need to create icon files:

1. Create three PNG images:
   - `icons/icon-16.png` (16x16 pixels)
   - `icons/icon-48.png` (48x48 pixels)
   - `icons/icon-128.png` (128x128 pixels)

2. You can use any image editor or online tool to create simple icons
3. A car/vehicle icon works well for this extension

### 2. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `FB MARKETPLACE PROJECT` folder
5. The extension should appear in your extensions list

### 3. Configure Extension

1. Click the extension icon in your Chrome toolbar
2. Click the settings (⚙️) button
3. Select your AI service:
   - **OpenAI** - Requires API key from https://platform.openai.com/api-keys
   - **Anthropic** - Requires API key from https://console.anthropic.com/
4. Enter your API key
5. Click "Save Settings"

### 4. Prepare Your CSV File

Ensure your CSV has:
- A column named `vehicle_id` or `vin` with 17-character VINs
- Vehicle photos named with VIN (e.g., `1C4SJRBP7RS126541.jpg`)
- Or include `image[0].url` column with photo URLs

### 5. Test the Extension

1. Upload your CSV file
2. Select a vehicle photo
3. Generate an AI description
4. Navigate to Facebook Marketplace
5. Click "Fill Marketplace Form"

## Troubleshooting

**Extension won't load:**
- Make sure all icon files exist (16px, 48px, 128px)
- Check that manifest.json is valid JSON

**CSV not parsing:**
- Verify VIN column exists and is named `vehicle_id` or `vin`
- Check that VINs are exactly 17 characters

**Photos not matching:**
- Ensure photo filenames contain the VIN
- VIN should be 17 alphanumeric characters

**Form not filling:**
- Make sure you're on Facebook Marketplace create page
- URL should contain `/marketplace/create`
- Facebook UI may have changed - check browser console (F12)

## Next Steps

See README.md for detailed usage instructions and feature documentation.



