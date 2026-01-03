# Single Proxy Multi-Store Setup

This guide shows how to run **one proxy server** that serves **multiple stores**, where each store has its own CSV file on the SFTP server.

## Architecture

```
Single Proxy Server
├── Store 1 → /csv/store-001 → SFTP:/MP15932.csv
├── Store 2 → /csv/store-002 → SFTP:/MP15933.csv
└── Store 3 → /csv/store-003 → SFTP:/MP15934.csv
```

## Advantages

✅ **Centralized Management** - One server to manage  
✅ **Resource Efficient** - Single Node.js process  
✅ **Easier Updates** - Update once, all stores benefit  
✅ **Simpler Deployment** - Deploy to one location  

## Disadvantages

⚠️ **Single Point of Failure** - If proxy goes down, all stores affected  
⚠️ **Network Dependency** - All stores need network access to proxy  
⚠️ **More Complex Configuration** - Need to manage multiple store configs  

---

## Step 1: Update Configuration Format

Create a multi-store configuration file:

**File: `server/config.json`**
```json
{
  "stores": {
    "store-001": {
      "name": "Beck Auto - Downtown",
      "sftp": {
        "host": "sftp.transfer.vauto.com",
        "port": 22,
        "username": "beckcdj",
        "password": "PASSWORD",
        "path": "/MP15932.csv"
      }
    },
    "store-002": {
      "name": "Beck Auto - North",
      "sftp": {
        "host": "sftp.transfer.vauto.com",
        "port": 22,
        "username": "beckcdj",
        "password": "PASSWORD",
        "path": "/MP15933.csv"
      }
    },
    "store-003": {
      "name": "Beck Auto - South",
      "sftp": {
        "host": "sftp.transfer.vauto.com",
        "port": 22,
        "username": "beckcdj",
        "password": "PASSWORD",
        "path": "/MP15934.csv"
      }
    }
  },
  "server": {
    "port": 3000,
    "apiKey": "shared-api-key-or-per-store"
  }
}
```

---

## Step 2: Update Proxy Server Code

The proxy needs to be modified to:
1. Load multi-store configuration
2. Accept store ID in URL path
3. Maintain separate caches per store
4. Route to correct CSV file based on store ID

**New Endpoints:**
- `GET /csv/:storeId` - Get CSV for specific store
- `GET /csv/:storeId/status` - Get status for specific store
- `GET /stores` - List all available stores
- `GET /health` - Health check (unchanged)

---

## Step 3: Update Chrome Extension

The extension needs to include store ID in the CSV URL:

**Extension Settings:**
- CSV URL: `http://your-proxy-server:3000/csv/store-001`
- API Key: `shared-api-key`

Or use query parameter:
- CSV URL: `http://your-proxy-server:3000/csv?storeId=store-001`
- API Key: `shared-api-key`

---

## Implementation Options

### Option A: URL Path Parameter (Recommended)

**Endpoint:** `/csv/:storeId`

**Example:**
```
http://localhost:3000/csv/store-001
http://localhost:3000/csv/store-002
```

**Pros:**
- Clean URLs
- Easy to understand
- RESTful design

**Cons:**
- Requires proxy code modification

### Option B: Query Parameter

**Endpoint:** `/csv?storeId=store-001`

**Example:**
```
http://localhost:3000/csv?storeId=store-001
http://localhost:3000/csv?storeId=store-002
```

**Pros:**
- Minimal code changes
- Backward compatible

**Cons:**
- Less clean URLs
- Store ID can be forgotten

### Option C: Subdomain or Path Prefix

**Example:**
```
http://store-001.proxy-server.com/csv
http://store-002.proxy-server.com/csv
```

**Pros:**
- Very clean
- Easy to understand

**Cons:**
- Requires DNS/routing setup
- More complex deployment

---

## Quick Start

1. **Update config.json** with multi-store format (see above)

2. **Update proxy code** to support store routing (see implementation below)

3. **Start proxy:**
   ```bash
   npm start
   ```

4. **Test endpoints:**
   ```bash
   curl http://localhost:3000/csv/store-001
   curl http://localhost:3000/csv/store-002
   curl http://localhost:3000/stores
   ```

5. **Configure extensions:**
   - Store 1 Extension: `http://proxy-server:3000/csv/store-001`
   - Store 2 Extension: `http://proxy-server:3000/csv/store-002`

---

## Security Considerations

### Option 1: Shared API Key
- All stores use same API key
- Simpler, but less secure
- If one store's key is compromised, all stores affected

### Option 2: Per-Store API Keys
- Each store has unique API key
- More secure
- Requires API key mapping in config

**Config with per-store keys:**
```json
{
  "stores": {
    "store-001": {
      "apiKey": "store-001-secret-key",
      ...
    },
    "store-002": {
      "apiKey": "store-002-secret-key",
      ...
    }
  }
}
```

---

## Deployment

### Centralized Server

Deploy the proxy to a central server that all stores can access:

1. **Choose deployment location:**
   - Cloud server (AWS, Azure, GCP)
   - Internal company server
   - VPS

2. **Deploy proxy:**
   ```bash
   # Copy server folder to server
   scp -r server/ user@server:/path/to/
   
   # SSH into server
   ssh user@server
   
   # Install and start
   cd /path/to/server
   npm install
   pm2 start sftp-proxy.js --name multi-store-proxy
   ```

3. **Configure firewall:**
   - Allow port 3000 (or your chosen port)
   - Restrict access to store networks if possible

4. **Set up domain (optional):**
   - Point domain to server IP
   - Use HTTPS with reverse proxy (nginx)

### Network Requirements

- All stores need network access to proxy server
- If stores are on different networks, proxy must be internet-accessible
- Consider VPN for security

---

## Monitoring

### Health Checks

```bash
# Check all stores
curl http://proxy-server:3000/health

# Check specific store
curl http://proxy-server:3000/csv/store-001/status
```

### Logs

Monitor proxy logs for:
- Store-specific errors
- SFTP connection issues
- Cache hits/misses per store

---

## Troubleshooting

### Store Not Found

**Error:** `Store 'store-001' not found`

**Solution:**
- Verify store ID in config.json
- Check store ID in URL matches config
- Check for typos in store ID

### Wrong CSV File

**Issue:** Store getting wrong inventory

**Solution:**
- Verify SFTP path in config for that store
- Check store ID in extension settings
- Verify CSV file exists on SFTP server

### Network Access Issues

**Issue:** Store can't reach proxy

**Solution:**
- Check firewall rules
- Verify proxy is running
- Test network connectivity
- Check if proxy is on same network or internet-accessible

---

## Migration from Per-Store Proxies

If you're migrating from one-proxy-per-store:

1. **Collect all store configs:**
   - Store IDs
   - CSV file paths
   - API keys (if per-store)

2. **Create multi-store config:**
   - Combine into single config.json
   - Verify all store IDs are unique

3. **Deploy centralized proxy:**
   - Set up on central server
   - Test all store endpoints

4. **Update extensions:**
   - Change CSV URL to include store ID
   - Update API key if changed
   - Test each store

5. **Decommission old proxies:**
   - Stop per-store proxy instances
   - Remove old deployments

---

## Next Steps

1. ✅ Decide on URL format (path vs query parameter)
2. ✅ Update proxy code (see implementation guide)
3. ✅ Create multi-store config.json
4. ✅ Deploy to central server
5. ✅ Update all store extensions
6. ✅ Test all stores
7. ✅ Monitor and maintain

---

**Need the code implementation?** See the updated `sftp-proxy.js` with multi-store support!


