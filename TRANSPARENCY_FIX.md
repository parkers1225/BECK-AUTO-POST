# Fixing Logo Transparency Issues

## If the logo still shows a white/colored background:

### Step 1: Verify the PNG File
1. Open `icons/beck-logo.png` in an image viewer (Windows Photos, Preview, etc.)
2. **Check:** Do you see a checkered/transparent background, or a solid color?
3. If you see a solid color (white/black), the file doesn't have true transparency

### Step 2: Re-export with True Transparency

**In Photoshop:**
1. Make sure your logo layer has NO background layer
2. Hide or delete any white/colored background layers
3. File → Export → Export As → PNG
4. **Check "Transparency" checkbox**
5. Save as `beck-logo.png`

**In GIMP:**
1. Remove background layer or make it transparent
2. File → Export As → Choose .png
3. **Check "Save color values from transparent pixels"**
4. Export

**In Online Tools (like Photopea, Canva, etc.):**
1. Remove background layer
2. Export as PNG
3. Make sure "Transparent background" option is enabled

**Using ImageMagick (command line):**
```bash
convert input.png -alpha on -channel alpha -evaluate set 100% beck-logo.png
```

### Step 3: Test the File
1. Open the exported PNG in a web browser (drag and drop)
2. You should see a checkered/transparent background
3. If you see white/colored, the transparency wasn't saved correctly

### Step 4: Alternative - Use SVG (Best for Logos)
If PNG transparency continues to be an issue, consider using SVG format:
- SVG natively supports transparency
- Scales perfectly at any size
- Smaller file size
- Update HTML to: `<img src="icons/beck-logo.svg" ...>`

### Step 5: Verify in Extension
1. Save the properly transparent PNG to `icons/beck-logo.png`
2. Reload the extension in Chrome
3. The logo should now show transparent over the blue gradient header

## Quick Test
Open the PNG file in Chrome browser directly:
- Right-click `icons/beck-logo.png` → Open with → Chrome
- If you see transparency in Chrome, it should work in the extension
- If you see a white background in Chrome, the file needs to be re-exported


