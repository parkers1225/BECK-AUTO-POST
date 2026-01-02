# Configure Chrome Extensions for Each Store

This guide will help you configure the Chrome extension for each of the 4 stores.

## Store Configuration Summary

| Store | Store ID | CSV URL | API Key |
|-------|----------|---------|---------|
| BECK CDJR | `beck-cdjr` | `https://your-app.up.railway.app/csv/beck-cdjr` | `beck-cdjr-secret-key` |
| BECK CHEVY | `beck-chevy` | `https://your-app.up.railway.app/csv/beck-chevy` | `beck-chevy-secret-key` |
| BECK FORD | `beck-ford` | `https://your-app.up.railway.app/csv/beck-ford` | `beck-ford-secret-key` |
| BECK NISSAN | `beck-nissan` | `https://your-app.up.railway.app/csv/beck-nissan` | `beck-nissan-secret-key` |

**For Local Development:** Use `http://localhost:3000/csv/[store-id]`  
**For Network Access:** Use `http://10.26.1.230:3000/csv/[store-id]`  
**For Public Access:** Use `https://your-app.up.railway.app/csv/[store-id]` (see `PUBLIC_HOSTING_DEPLOYMENT.md`)

---

## Step-by-Step Configuration

### For Each Store:

1. **Open Chrome and Load Extension**
   - Go to `chrome://extensions/`
   - Make sure "Developer mode" is enabled (top right)
   - Click "Load unpacked"
   - Select your extension folder: `C:\Users\parker.sloan\FB MARKETPLACE PROJECT`

2. **Open Extension Popup**
   - Click the extension icon in Chrome toolbar
   - Click the Settings (⚙️) button in the top right

3. **Configure CSV Source**
   - Under "CSV Data Source", select **"Auto-sync from URL (Recommended)"**
   - Make sure the radio button is selected

4. **Enter Store-Specific URL**
   - In the "CSV URL" field, enter the store's URL (see table above)
   - Example for BECK CDJR: `http://localhost:3000/csv/beck-cdjr`
   - **Important:** Use the exact store ID in the URL

5. **Enter API Key**
   - In the "API Key (Optional)" field, enter the store's API key (see table above)
   - Example for BECK CDJR: `beck-cdjr-secret-key`

6. **Configure Auto-Refresh**
   - ✅ Check "Enable auto-refresh" (should be checked by default)
   - Set refresh interval (default: 15 minutes)
   - This determines how often the extension checks for CSV updates

7. **Save Settings**
   - Scroll down and click **"Save Settings"**
   - You should see a success message
   - The extension will automatically fetch the CSV

8. **Verify CSV Loaded**
   - After saving, the extension should automatically fetch the CSV
   - You should see:
     - Status message: "Successfully loaded X vehicles"
     - Vehicles appearing in the photo gallery
     - Sync status indicator showing "Updated [time]"

---

## Detailed Configuration for Each Store

### BECK CDJR Extension

**Settings:**
- CSV URL: `http://localhost:3000/csv/beck-cdjr`
- API Key: `beck-cdjr-secret-key`
- Auto-refresh: ✅ Enabled
- Refresh Interval: 15 minutes

**Network URL (if accessing from another computer):**
- CSV URL: `http://10.26.1.230:3000/csv/beck-cdjr`

---

### BECK CHEVY Extension

**Settings:**
- CSV URL: `http://localhost:3000/csv/beck-chevy`
- API Key: `beck-chevy-secret-key`
- Auto-refresh: ✅ Enabled
- Refresh Interval: 15 minutes

**Network URL:**
- CSV URL: `http://10.26.1.230:3000/csv/beck-chevy`

---

### BECK FORD Extension

**Settings:**
- CSV URL: `http://localhost:3000/csv/beck-ford`
- API Key: `beck-ford-secret-key`
- Auto-refresh: ✅ Enabled
- Refresh Interval: 15 minutes

**Network URL:**
- CSV URL: `http://10.26.1.230:3000/csv/beck-ford`

---

### BECK NISSAN Extension

**Settings:**
- CSV URL: `http://localhost:3000/csv/beck-nissan`
- API Key: `beck-nissan-secret-key`
- Auto-refresh: ✅ Enabled
- Refresh Interval: 15 minutes

**Network URL:**
- CSV URL: `http://10.26.1.230:3000/csv/beck-nissan`

---

## Testing Each Extension

After configuring each extension, test it:

1. **Open Extension Popup**
   - Click the extension icon

2. **Check Status**
   - Look for sync status indicator (top right)
   - Should show "Updated [time]" or "Up to date"

3. **Verify Vehicles Loaded**
   - Check photo gallery shows vehicles
   - Count should match the store's inventory

4. **Test Manual Refresh**
   - Click the refresh button (🔄)
   - Should fetch latest CSV

5. **Check Browser Console** (if issues)
   - Press F12
   - Go to Console tab
   - Look for any errors

---

## Troubleshooting

### Extension Shows "Failed to fetch CSV"

**Possible Causes:**
1. Wrong URL - Check store ID matches exactly
2. Wrong API key - Verify API key matches store
3. Proxy not running - Check `pm2 status`
4. Network issue - Try `localhost` vs network IP

**Solutions:**
- Verify proxy is running: `pm2 status`
- Test endpoint directly: `curl "http://localhost:3000/csv/beck-cdjr?apiKey=beck-cdjr-secret-key"`
- Check browser console (F12) for specific error
- Verify URL has correct store ID

### Extension Shows "Using cached data"

**This is normal if:**
- CSV hasn't changed (hash matches)
- Or fetch failed but old data available

**To force refresh:**
- Click refresh button (🔄)
- Or wait for next auto-refresh interval

### Wrong Store's Inventory Showing

**Cause:** Wrong store ID in URL

**Solution:**
- Check CSV URL has correct store ID
- Verify API key matches the store
- Re-save settings

### Network Access Issues

**If accessing from another computer:**

1. **Use Network IP:**
   - Replace `localhost` with `10.26.1.230`
   - Example: `http://10.26.1.230:3000/csv/beck-cdjr`

2. **Check Firewall:**
   - Windows Firewall may block port 3000
   - Allow port 3000 through firewall

3. **Verify Proxy is Network-Accessible:**
   - Test from another computer: `curl http://10.26.1.230:3000/health`
   - Should return health status

---

## Quick Reference Card

### BECK CDJR
```
URL: http://localhost:3000/csv/beck-cdjr
API: beck-cdjr-secret-key
```

### BECK CHEVY
```
URL: http://localhost:3000/csv/beck-chevy
API: beck-chevy-secret-key
```

### BECK FORD
```
URL: http://localhost:3000/csv/beck-ford
API: beck-ford-secret-key
```

### BECK NISSAN
```
URL: http://localhost:3000/csv/beck-nissan
API: beck-nissan-secret-key
```

---

## Verification Checklist

After configuring all extensions:

- [ ] BECK CDJR extension loads vehicles
- [ ] BECK CHEVY extension loads vehicles
- [ ] BECK FORD extension loads vehicles
- [ ] BECK NISSAN extension loads vehicles
- [ ] All extensions show "Updated [time]" status
- [ ] Auto-refresh is enabled for all
- [ ] Each extension shows correct store's inventory
- [ ] Manual refresh works for all stores

---

## Next Steps

1. ✅ Configure each store's extension (follow steps above)
2. ✅ Test each extension loads correct inventory
3. ✅ Verify auto-refresh is working
4. ✅ Train store staff on using the extension
5. ✅ Monitor with `pm2 logs sftp-proxy` if needed

---

**Need help?** Check:
- Browser console (F12) for errors
- PM2 logs: `pm2 logs sftp-proxy`
- Proxy health: `curl http://localhost:3000/health`
- Store list: `curl http://localhost:3000/stores`


