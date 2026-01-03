# Store Configuration Reference

## Store Inventory Mapping

| Store ID | Store Name | SFTP CSV File | Endpoint URL | API Key |
|----------|------------|---------------|--------------|---------|
| `beck-cdjr` | BECK CDJR | `/MP15932.csv` | `/csv/beck-cdjr` | `beck-cdjr-secret-key` |
| `beck-chevy` | BECK CHEVY | `/MP15933.csv` | `/csv/beck-chevy` | `beck-chevy-secret-key` |
| `beck-ford` | BECK FORD | `/MP15935.csv` | `/csv/beck-ford` | `beck-ford-secret-key` |
| `beck-nissan` | BECK NISSAN | `/MP15931.csv` | `/csv/beck-nissan` | `beck-nissan-secret-key` |

## Extension Configuration Per Store

### BECK CDJR
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-cdjr`
- **CSV URL (Local):** `http://localhost:3000/csv/beck-cdjr`
- **API Key:** `beck-cdjr-secret-key`
- **SFTP File:** `/MP15932.csv`

### BECK CHEVY
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-chevy`
- **CSV URL (Local):** `http://localhost:3000/csv/beck-chevy`
- **API Key:** `beck-chevy-secret-key`
- **SFTP File:** `/MP15933.csv`

### BECK FORD
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-ford`
- **CSV URL (Local):** `http://localhost:3000/csv/beck-ford`
- **API Key:** `beck-ford-secret-key`
- **SFTP File:** `/MP15935.csv`

### BECK NISSAN
- **CSV URL (Public):** `https://your-app.up.railway.app/csv/beck-nissan`
- **CSV URL (Local):** `http://localhost:3000/csv/beck-nissan`
- **API Key:** `beck-nissan-secret-key`
- **SFTP File:** `/MP15931.csv`

**Note:** Replace `your-app.up.railway.app` with your actual public hosting URL. See `PUBLIC_HOSTING_DEPLOYMENT.md` for deployment instructions.

## Quick Test URLs

If running locally:
```bash
# BECK CDJR
curl http://localhost:3000/csv/beck-cdjr?apiKey=beck-cdjr-secret-key

# BECK CHEVY
curl http://localhost:3000/csv/beck-chevy?apiKey=beck-chevy-secret-key

# BECK FORD
curl http://localhost:3000/csv/beck-ford?apiKey=beck-ford-secret-key

# BECK NISSAN
curl http://localhost:3000/csv/beck-nissan?apiKey=beck-nissan-secret-key

# List all stores
curl http://localhost:3000/stores

# Health check
curl http://localhost:3000/health
```

## Network URLs

If proxy is accessible on network at `10.26.1.230`:
- BECK CDJR: `http://10.26.1.230:3000/csv/beck-cdjr`
- BECK CHEVY: `http://10.26.1.230:3000/csv/beck-chevy`
- BECK FORD: `http://10.26.1.230:3000/csv/beck-ford`
- BECK NISSAN: `http://10.26.1.230:3000/csv/beck-nissan`


