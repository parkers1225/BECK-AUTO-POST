# CSV Auto-Sync Setup Guide

This guide explains how to set up automatic CSV linking and updating for the Beck Auto-Post extension.

## Overview

The extension now supports automatic CSV synchronization from an SFTP server via an HTTP proxy service. The CSV data is automatically fetched and updated in the background, keeping your vehicle listings current.

## Architecture

1. **SFTP Server** - Contains your vehicle CSV file
2. **HTTP Proxy Service** - Fetches CSV from SFTP and serves it via HTTP/HTTPS
3. **Chrome Extension** - Automatically fetches CSV from the proxy and updates vehicle data

## Setup Instructions

### Step 1: Deploy the HTTP Proxy Service

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the service:
   ```bash
   cp config.example.json config.json
   ```
   
   Edit `config.json` with your SFTP credentials:
   ```json
   {
     "sftp": {
       "host": "your-sftp-server.com",
       "port": 22,
       "username": "your-username",
       "password": "your-password",
       "path": "/path/to/vehicles.csv"
     },
     "server": {
       "port": 3000,
       "apiKey": "optional-api-key-for-security"
     }
   }
   ```

4. Start the service:
   ```bash
   npm start
   ```

   The service will run on port 3000 (or your configured port) and be accessible at:
   - `http://your-server:3000/csv` - CSV endpoint
   - `http://your-server:3000/csv/status` - Status endpoint
   - `http://your-server:3000/health` - Health check

### Step 2: Configure the Extension

1. Open the extension popup
2. Click the Settings (⚙️) button
3. Under "CSV Data Source", select **"Auto-sync from URL (Recommended)"**
4. Enter your proxy service URL (e.g., `https://your-server.com:3000/csv`)
5. Configure auto-refresh:
   - Enable/disable auto-refresh
   - Set refresh interval (default: 15 minutes)
6. Click "Save Settings"

### Step 3: Verify Setup

1. After saving settings, the extension will automatically fetch CSV data
2. Check the status indicator in the main panel (top right) for sync status
3. Verify vehicles are loaded in the photo gallery

## Features

### Automatic Updates

- **On Extension Open**: CSV is automatically fetched when you open the extension
- **Background Refresh**: CSV is updated periodically in the background (even when popup is closed)
- **Change Detection**: Only updates when CSV content actually changes (using hash comparison)
- **Smart Caching**: Falls back to cached data if fetch fails

### Status Indicators

- **Last Update Time**: Shown in settings panel and main panel
- **Sync Status**: Real-time status indicator showing last sync time or errors
- **Error Handling**: Clear error messages for network failures, invalid CSV, etc.

### Error Handling

- Network failures: Retries with cached data
- Invalid CSV: Shows error, keeps previous data
- SFTP connection failure: Proxy serves cached CSV if available
- CORS errors: Properly configured CORS headers in proxy

## Troubleshooting

### CSV Not Updating

1. Check that the proxy service is running
2. Verify the CSV URL in settings is correct
3. Check browser console (F12) for error messages
4. Verify SFTP credentials in proxy config.json

### Proxy Service Issues

1. Check proxy service logs for SFTP connection errors
2. Verify SFTP host, port, username, and password
3. Test SFTP connection manually: `sftp user@host`
4. Check firewall rules allow outbound SFTP connections

### Extension Not Fetching

1. Verify CSV URL is configured in settings
2. Check that auto-refresh is enabled
3. Check browser console for fetch errors
4. Verify host permissions in manifest.json (should allow http://*/* and https://*/*)

## Security Considerations

1. **Never commit `config.json`** - Contains SFTP credentials
2. **Use HTTPS** - Deploy proxy behind reverse proxy with SSL
3. **API Key** - Enable API key authentication in production
4. **Firewall** - Restrict access to proxy service
5. **SFTP Credentials** - Use SSH keys instead of passwords when possible

## Deployment Options

### Option 1: Self-Hosted Server
- Deploy on VPS or internal server
- Full control, requires server management
- Use PM2 for production: `pm2 start sftp-proxy.js`

### Option 2: Cloud Functions
- AWS Lambda, Google Cloud Functions, Azure Functions
- Serverless, auto-scaling
- Pay-per-use

### Option 3: Docker
- Containerize the proxy service
- Easy deployment and scaling
- See server/README.md for Docker setup

## API Endpoints

### GET /csv
Returns CSV file content with headers:
- `X-CSV-Hash`: SHA256 hash for change detection
- `X-CSV-Last-Modified`: Last modified time from SFTP
- `X-CSV-Last-Fetch`: When CSV was last fetched

### GET /csv/status
Returns status information:
```json
{
  "available": true,
  "lastFetch": "2024-01-15T10:30:00.000Z",
  "lastModified": "2024-01-15T09:00:00.000Z",
  "hash": "abc123...",
  "size": 12345,
  "cached": false
}
```

### GET /health
Health check endpoint (no authentication required)

## Migration from File Upload

The extension still supports manual file upload as a fallback option. You can:
- Switch between URL-based and file-based CSV loading
- Use file upload for testing or one-time imports
- Use URL-based for automatic updates

## Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Check proxy service logs
3. Verify SFTP connection and CSV file path
4. Ensure all settings are correctly configured


