# Logo Setup Instructions

## Adding the Beck Auto-Post Logo

### 1. Logo File for Header
- Save your chosen logo design as `icons/beck-logo.png`
- Recommended size: 64x64 pixels or larger (will be scaled to 32px height)
- **IMPORTANT for Transparency:**
  - Format: PNG-24 with alpha channel (not PNG-8)
  - Make sure the background layer is transparent/deleted in your image editor
  - When exporting, choose "PNG" with "Transparency" enabled
  - Test the file: open it in an image viewer - you should see a checkered/transparent background
  - Avoid saving as JPG or PNG-8 as these don't support true transparency

### 2. Extension Icons
You'll need to create three icon sizes from your logo for the Chrome extension:
- `icons/icon-16.png` - 16x16 pixels
- `icons/icon-48.png` - 48x48 pixels  
- `icons/icon-128.png` - 128x128 pixels

These are used by Chrome for:
- Browser toolbar icon (16px)
- Extension management page (48px)
- Chrome Web Store (128px)

### 3. Logo Design Recommendations
Based on the three designs shown:
- **Left Logo** (Gear with car and graph): Good for showing automation/process
- **Middle Logo** (Split B with car): Clean, modern, works well at small sizes
- **Right Logo** (Tablet with car and cart): Emphasizes online/marketplace aspect

Choose the one that works best at small icon sizes (16x16).

### 4. After Adding Files
1. Place your logo file in the `icons/` folder
2. Create the three icon sizes and save them as `icon-16.png`, `icon-48.png`, and `icon-128.png`
3. Reload the extension in Chrome (chrome://extensions → Reload)
4. The logo should now appear in the header and as the extension icon

