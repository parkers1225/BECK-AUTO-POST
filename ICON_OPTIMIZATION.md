# Extension Icon Optimization

## Current Setup
The extension currently uses `beck-logo.png` for all icon sizes (16px, 48px, 128px). Chrome automatically scales it.

## To Maximize Icon Visibility:

### Option 1: Use High-Quality Source (Recommended)
1. Ensure `icons/beck-logo.png` is at least **128x128 pixels** (or larger)
2. Chrome will scale it down for smaller sizes
3. Higher resolution = sharper appearance at all sizes

### Option 2: Create Optimized Icon Sizes (Best Quality)
For the best appearance, create three optimized versions:

1. **icons/icon-16.png** (16x16px)
   - Simplify design - remove fine details
   - Use bold, high-contrast elements
   - Test at actual size to ensure readability

2. **icons/icon-48.png** (48x48px)
   - Medium detail level
   - Good balance of detail and clarity

3. **icons/icon-128.png** (128x128px)
   - Full detail version
   - Used for Chrome Web Store

Then update `manifest.json` to use these specific files instead of `beck-logo.png` for each size.

## Note on Toolbar Icon Size
- Chrome toolbar icons are **fixed at 16-20px** by the browser
- We cannot make them physically larger
- We can only ensure they're **sharp and clear** at that size
- Using a high-resolution source (128px+) ensures Chrome scales it down cleanly

## Quick Fix
If your `beck-logo.png` is smaller than 128x128, resize it to at least 128x128 pixels for best results.


