# Fix: API Key Field and Auto-Sync Issues

## Issues Fixed

### 1. API Key Field Not Appearing
**Problem**: The API key input field was not visible when selecting "Auto-sync from URL" option.

**Root Cause**: 
- The `toggleCSVSource()` function was defined inside `setupEventListeners()`, making it inaccessible when `loadSettings()` tried to call it
- The visibility styles weren't being applied consistently

**Solution**:
- Moved `toggleCSVSource()` to global scope so it can be called from anywhere
- Enhanced visibility setting to explicitly set `display`, `visibility`, `opacity`, and `height` properties
- Ensured API key input field gets proper visibility styling when URL source is selected
- Added explicit styling for the API key input when the URL group is shown

### 2. Auto-Sync Not Functional
**Problem**: The auto-refresh mechanism wasn't working properly.

**Root Cause**:
- Alarm setup might not have been verified
- Missing startup handler for service worker
- Insufficient logging to debug issues

**Solution**:
- Added alarm verification after creation to ensure it was set up correctly
- Added `chrome.runtime.onStartup` listener to re-establish alarms when service worker wakes
- Enhanced logging throughout the auto-refresh flow
- Improved error handling in `fetchCSVInBackground()`

## Changes Made

### `popup.js`
1. **Made `toggleCSVSource()` global**: Moved function outside `setupEventListeners()` so it's accessible globally
2. **Enhanced visibility handling**: Added explicit styling for API key input and URL group
3. **Improved `loadSettings()`**: Better integration with `toggleCSVSource()` to ensure proper visibility

### `background.js`
1. **Alarm verification**: Added check to verify alarm was created successfully
2. **Startup handler**: Added `onStartup` listener to re-establish alarms when extension starts
3. **Enhanced logging**: Added detailed console logs for debugging auto-refresh flow
4. **Better error handling**: Improved error catching in alarm-triggered CSV fetches

## Testing Instructions

### Test API Key Field Visibility
1. Open the extension popup
2. Click the Settings button (gear icon)
3. Select "Auto-sync from URL (Recommended)" radio button
4. **Expected**: The CSV URL input field AND the API Key input field should both be visible
5. Enter a CSV URL and optionally an API key
6. Save settings
7. **Expected**: Settings save successfully and fields remain visible

### Test Auto-Sync
1. Configure CSV URL and API key in settings
2. Enable "Enable auto-refresh" checkbox
3. Set refresh interval (e.g., 15 minutes)
4. Save settings
5. Open browser console (F12) and check background service worker logs
6. **Expected**: You should see:
   - "Background: Auto-refresh alarm set for every X minutes"
   - "Background: Alarm verified: ..."
7. Wait for the interval or manually trigger by checking alarms in `chrome://extensions` → Service Worker → Inspect
8. **Expected**: CSV should be fetched automatically and popup should show updated data

### Manual Testing of Auto-Sync
1. Open Chrome DevTools (F12)
2. Go to Extensions page (`chrome://extensions`)
3. Find "Beck Auto-Post" extension
4. Click "Service Worker" link to open background script console
5. Configure auto-sync in settings
6. In the service worker console, you should see:
   ```
   Background: Auto-refresh alarm set for every 15 minutes
   Background: Alarm verified: {name: "csvAutoRefresh", ...}
   ```
7. To test immediately, you can manually trigger the alarm or wait for the interval

## Verification Checklist

- [ ] API key field appears when "Auto-sync from URL" is selected
- [ ] API key field is hidden when "Upload local file" is selected
- [ ] Settings save correctly with API key
- [ ] Auto-refresh alarm is created (check service worker console)
- [ ] CSV is fetched automatically at the configured interval
- [ ] Last update time is displayed correctly
- [ ] CSV sync status indicator shows in main panel

## Troubleshooting

### API Key Field Still Not Visible
1. Check browser console for errors
2. Verify `toggleCSVSource()` is being called (check console logs)
3. Try manually clicking the radio buttons
4. Reload the extension

### Auto-Sync Not Working
1. Open service worker console (see Manual Testing above)
2. Check for alarm creation messages
3. Verify alarm exists: In service worker console, run:
   ```javascript
   chrome.alarms.getAll(console.log)
   ```
4. Check for errors in `fetchCSVInBackground()`
5. Verify CSV URL and API key are correct
6. Check network tab for failed requests

## Next Steps

If issues persist:
1. Check browser console for JavaScript errors
2. Check service worker console for background script errors
3. Verify manifest.json has `"alarms"` permission
4. Ensure CSV URL is accessible and returns valid CSV data
5. Verify API key is correct if required by proxy service
