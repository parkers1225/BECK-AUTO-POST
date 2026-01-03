# Multi-Store Deployment Guide

This guide explains how to deploy the SFTP proxy server and Chrome extension at multiple store locations, where each store has its own inventory CSV file.

## Architecture Overview

**Recommended Approach: One Proxy Per Store**

Each store location should run its own proxy server instance, configured to fetch that store's specific CSV file. This provides:
- ✅ **Security Isolation** - Each store's data is separate
- ✅ **Reliability** - One store's issues don't affect others
- ✅ **Network Isolation** - Each store uses its local network
- ✅ **Simple Management** - Standardized deployment process

```
Store 1: Proxy → SFTP:/store1/inventory.csv → Extension
Store 2: Proxy → SFTP:/store2/inventory.csv → Extension
Store 3: Proxy → SFTP:/store3/inventory.csv → Extension
```

---

## Deployment Options

### Option 1: Per-Store Configuration Files (Recommended)

Each store has its own `config.json` file with store-specific settings.

### Option 2: Environment Variables

Use environment variables to configure each store (better for Docker deployments).

### Option 3: Store ID Parameter

Single proxy that routes to different CSV files based on store ID (more complex, not recommended).

---

## Option 1: Per-Store Configuration (Recommended)

### Step 1: Create Store Configuration Template

Create a configuration template for each store:

**File: `server/config.template.json`**
```json
{
  "store": {
    "id": "STORE_ID",
    "name": "Store Name",
    "location": "City, State"
  },
  "sftp": {
    "host": "sftp.transfer.vauto.com",
    "port": 22,
    "username": "STORE_USERNAME",
    "password": "STORE_PASSWORD",
    "path": "/STORE_CSV_FILE.csv"
  },
  "server": {
    "port": 3000,
    "apiKey": "STORE_API_KEY"
  }
}
```

### Step 2: Store-Specific Setup Process

For each new store location:

1. **Copy the server folder** to the store's computer
2. **Create store-specific config.json:**
   ```bash
   cd server
   cp config.template.json config.json
   ```

3. **Edit config.json with store-specific values:**
   ```json
   {
     "store": {
       "id": "store-001",
       "name": "Beck Auto - Downtown",
       "location": "Dallas, TX"
     },
     "sftp": {
       "host": "sftp.transfer.vauto.com",
       "port": 22,
       "username": "beckcdj",
       "password": "STORE_SPECIFIC_PASSWORD",
       "path": "/MP15932.csv"  // Store 1's CSV file
     },
     "server": {
       "port": 3000,
       "apiKey": "store-001-secret-key"
     }
   }
   ```

4. **Install and start:**
   ```bash
   npm install
   npm start
   ```

5. **Configure extension:**
   - CSV URL: `http://localhost:3000/csv` (or store's local IP)
   - API Key: `store-001-secret-key`

### Step 3: Store Inventory Mapping

Create a master inventory file mapping stores to their CSV files:

**File: `STORE_INVENTORY_MAP.md`**
```markdown
# Store Inventory File Mapping

| Store ID | Store Name | SFTP CSV Path | Port | API Key |
|----------|------------|---------------|------|---------|
| store-001 | Beck Auto - Downtown | /MP15932.csv | 3000 | store-001-key |
| store-002 | Beck Auto - North | /MP15933.csv | 3000 | store-002-key |
| store-003 | Beck Auto - South | /MP15934.csv | 3000 | store-003-key |
```

---

## Option 2: Environment Variables (Docker-Friendly)

### Step 1: Update Docker Compose for Multi-Store

Create store-specific docker-compose files:

**File: `server/docker-compose.store-001.yml`**
```yaml
version: '3.8'

services:
  sftp-proxy-store-001:
    build: .
    container_name: sftp-proxy-store-001
    restart: always
    ports:
      - "3000:3000"
    environment:
      - STORE_ID=store-001
      - STORE_NAME=Beck Auto - Downtown
      - SFTP_HOST=sftp.transfer.vauto.com
      - SFTP_PORT=22
      - SFTP_USERNAME=beckcdj
      - SFTP_PASSWORD=${SFTP_PASSWORD}
      - SFTP_PATH=/MP15932.csv
      - SERVER_PORT=3000
      - API_KEY=store-001-secret-key
      - NODE_ENV=production
    volumes:
      - ./config.json:/app/config.json:ro
    networks:
      - proxy-network

networks:
  proxy-network:
    driver: bridge
```

### Step 2: Update sftp-proxy.js to Support Environment Variables

The proxy should check environment variables first, then fall back to config.json:

```javascript
// Load configuration from environment or file
const config = {
  store: {
    id: process.env.STORE_ID || configFile.store?.id,
    name: process.env.STORE_NAME || configFile.store?.name
  },
  sftp: {
    host: process.env.SFTP_HOST || configFile.sftp.host,
    port: parseInt(process.env.SFTP_PORT) || configFile.sftp.port,
    username: process.env.SFTP_USERNAME || configFile.sftp.username,
    password: process.env.SFTP_PASSWORD || configFile.sftp.password,
    path: process.env.SFTP_PATH || configFile.sftp.path
  },
  server: {
    port: parseInt(process.env.SERVER_PORT) || configFile.server.port,
    apiKey: process.env.API_KEY || configFile.server.apiKey
  }
};
```

---

## Deployment Checklist for New Store

### Pre-Deployment

- [ ] Identify store's CSV file path on SFTP server
- [ ] Get store's SFTP credentials (if different per store)
- [ ] Generate unique API key for the store
- [ ] Determine store's local network IP address
- [ ] Verify store computer has Node.js installed (or Docker)

### Deployment Steps

1. **Copy server files to store computer:**
   ```powershell
   # Copy entire server folder to store location
   # Or use deployment script
   ```

2. **Create store-specific config.json:**
   - Use template
   - Fill in store-specific values
   - Verify JSON syntax

3. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Test connection:**
   ```bash
   npm start
   # Verify: http://localhost:3000/health
   ```

5. **Set up auto-start:**
   - Use PM2, Docker, or Task Scheduler
   - Verify auto-start works after reboot

6. **Configure Chrome Extension:**
   - Install extension
   - Open settings
   - CSV URL: `http://localhost:3000/csv` (or store's IP)
   - API Key: Store's API key
   - Save settings

7. **Verify end-to-end:**
   - Extension loads CSV
   - Vehicles appear in gallery
   - Auto-refresh works

### Post-Deployment

- [ ] Document store configuration
- [ ] Add to store inventory map
- [ ] Test auto-start after reboot
- [ ] Verify network accessibility (if needed)
- [ ] Train store staff on basic troubleshooting

---

## Store Configuration Management

### Centralized Configuration File

Create a master configuration file for all stores:

**File: `stores-config.json`**
```json
{
  "stores": [
    {
      "id": "store-001",
      "name": "Beck Auto - Downtown",
      "location": "Dallas, TX",
      "sftp": {
        "host": "sftp.transfer.vauto.com",
        "username": "beckcdj",
        "password": "PASSWORD_1",
        "path": "/MP15932.csv"
      },
      "proxy": {
        "port": 3000,
        "apiKey": "store-001-secret-key"
      },
      "network": {
        "localIP": "10.26.1.230"
      }
    },
    {
      "id": "store-002",
      "name": "Beck Auto - North",
      "location": "Plano, TX",
      "sftp": {
        "host": "sftp.transfer.vauto.com",
        "username": "beckcdj",
        "password": "PASSWORD_2",
        "path": "/MP15933.csv"
      },
      "proxy": {
        "port": 3000,
        "apiKey": "store-002-secret-key"
      },
      "network": {
        "localIP": "10.26.2.150"
      }
    }
  ]
}
```

### Deployment Script

Create a script to generate store-specific configs:

**File: `server/generate-store-config.js`**
```javascript
const fs = require('fs');
const path = require('path');

const storesConfig = require('../stores-config.json');
const storeId = process.argv[2];

if (!storeId) {
  console.error('Usage: node generate-store-config.js <store-id>');
  process.exit(1);
}

const store = storesConfig.stores.find(s => s.id === storeId);

if (!store) {
  console.error(`Store ${storeId} not found in stores-config.json`);
  process.exit(1);
}

const config = {
  store: {
    id: store.id,
    name: store.name,
    location: store.location
  },
  sftp: store.sftp,
  server: {
    port: store.proxy.port,
    apiKey: store.proxy.apiKey
  }
};

const configPath = path.join(__dirname, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log(`✅ Generated config.json for ${store.name}`);
console.log(`   Store ID: ${store.id}`);
console.log(`   CSV Path: ${store.sftp.path}`);
console.log(`   Port: ${store.proxy.port}`);
```

**Usage:**
```bash
node generate-store-config.js store-001
```

---

## Port Management

If multiple stores are on the same network, use different ports:

| Store | Port | URL |
|-------|------|-----|
| Store 1 | 3000 | http://10.26.1.230:3000/csv |
| Store 2 | 3001 | http://10.26.2.150:3001/csv |
| Store 3 | 3002 | http://10.26.3.100:3002/csv |

Update `config.json` for each store:
```json
{
  "server": {
    "port": 3001,  // Different port per store
    "apiKey": "store-002-secret-key"
  }
}
```

---

## Security Best Practices

1. **Unique API Keys Per Store:**
   - Generate strong, unique API keys
   - Store in secure location
   - Never commit to version control

2. **SFTP Credentials:**
   - Use store-specific credentials if possible
   - Or use shared credentials with proper access controls
   - Never commit credentials to version control

3. **Network Security:**
   - Use API keys (required)
   - Consider firewall rules
   - Use HTTPS if exposing to internet (reverse proxy)

4. **Configuration Files:**
   - Keep `config.json` in `.gitignore`
   - Use `config.example.json` as template
   - Document store-specific values separately

---

## Troubleshooting Multi-Store Setup

### Issue: Wrong CSV File Loaded

**Solution:**
- Verify `config.json` has correct `sftp.path`
- Check SFTP server file structure
- Verify store ID matches configuration

### Issue: Port Conflicts

**Solution:**
- Use different ports per store
- Check `netstat -ano | findstr :PORT`
- Update `config.json` with unique port

### Issue: Extension Can't Connect

**Solution:**
- Verify proxy is running: `pm2 status` or `docker ps`
- Check URL is correct (localhost vs network IP)
- Verify API key matches
- Check Windows Firewall

### Issue: Multiple Stores on Same Network

**Solution:**
- Use different ports (3000, 3001, 3002, etc.)
- Or use different computers per store
- Or use Docker with different container names

---

## Quick Reference

### Store Setup Command Sequence

```bash
# 1. Copy server folder to store computer
# 2. Navigate to server folder
cd server

# 3. Generate store config (if using script)
node generate-store-config.js store-001

# 4. Or manually edit config.json
notepad config.json

# 5. Install dependencies
npm install

# 6. Test run
npm start

# 7. Set up auto-start (choose one)
# PM2:
pm2 start sftp-proxy.js --name sftp-proxy-store-001
pm2 save

# Docker:
docker-compose up -d

# 8. Verify
curl http://localhost:3000/health
```

### Extension Configuration Per Store

```
Store 1:
- CSV URL: http://localhost:3000/csv
- API Key: store-001-secret-key

Store 2:
- CSV URL: http://localhost:3001/csv
- API Key: store-002-secret-key
```

---

## Next Steps

1. ✅ Create store configuration template
2. ✅ Document all store CSV file paths
3. ✅ Generate unique API keys per store
4. ✅ Create deployment checklist
5. ✅ Set up first test store
6. ✅ Refine process based on test deployment
7. ✅ Roll out to remaining stores

---

**Need help?** Refer to:
- `CSV_AUTO_SYNC_SETUP.md` - Basic setup
- `DOCKER_SETUP.md` - Docker deployment
- `PM2_AUTO_START_SETUP.md` - PM2 process management


