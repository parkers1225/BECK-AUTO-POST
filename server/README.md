# SFTP CSV Proxy Service

HTTP proxy service that fetches CSV files from an SFTP server and serves them via HTTP/HTTPS for use with the Beck Auto-Post Chrome extension.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure

1. Copy `config.example.json` to `config.json`:
   ```bash
   cp config.example.json config.json
   ```

2. Edit `config.json` with your SFTP credentials:
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
       "apiKey": "your-optional-api-key"
     }
   }
   ```

### 3. Run the Service

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The service will start on port 3000 (or the port specified in config.json).

## Endpoints

### `GET /csv`
Fetches the CSV file from SFTP and returns it. If SFTP is unavailable, returns cached version if available.

**Headers:**
- `X-CSV-Hash`: SHA256 hash of CSV content (for change detection)
- `X-CSV-Last-Modified`: Last modified time from SFTP
- `X-CSV-Last-Fetch`: When the CSV was last fetched
- `X-CSV-Cached`: "true" if serving cached content (when SFTP fetch failed)

**Authentication:**
If `apiKey` is configured in `config.json`, include it in the request:
- Header: `Authorization: Bearer your-api-key`
- Or query parameter: `?apiKey=your-api-key`

### `GET /csv/status`
Returns status information about the CSV file.

**Response:**
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

### `GET /health`
Health check endpoint (no authentication required).

## Deployment Options

### Option 1: Self-Hosted Server

Deploy on a VPS, internal server, or any machine with Node.js:

```bash
# Install Node.js (if not already installed)
# Then:
npm install
npm start
```

Use PM2 for production:
```bash
npm install -g pm2
pm2 start sftp-proxy.js --name sftp-proxy
pm2 save
pm2 startup
```

### Option 2: Cloud Functions

#### AWS Lambda
- Package the service as a Lambda function
- Use API Gateway to expose endpoints
- Configure environment variables for SFTP credentials

#### Google Cloud Functions
- Deploy as a Cloud Function
- Use environment variables for configuration

#### Azure Functions
- Deploy as an Azure Function
- Use Application Settings for configuration

### Option 3: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t sftp-proxy .
docker run -p 3000:3000 -v $(pwd)/config.json:/app/config.json sftp-proxy
```

## Security Considerations

1. **Never commit `config.json`** - Add it to `.gitignore`
2. **Use HTTPS** - Deploy behind a reverse proxy (nginx, Apache) with SSL certificate
3. **API Key** - Enable API key authentication in production
4. **Firewall** - Restrict access to the proxy service
5. **SFTP Credentials** - Use SSH keys instead of passwords when possible

## Troubleshooting

### Connection Issues
- Verify SFTP host, port, username, and password
- Check firewall rules allow outbound SFTP connections
- Test SFTP connection manually: `sftp user@host`

### File Not Found
- Verify the CSV file path on SFTP server
- Check file permissions on SFTP server

### CORS Errors
- The service includes CORS headers by default
- If issues persist, check that the extension's host permissions include your proxy URL

## Environment Variables

You can also use environment variables instead of `config.json`:

```bash
export SFTP_HOST=your-sftp-server.com
export SFTP_PORT=22
export SFTP_USERNAME=your-username
export SFTP_PASSWORD=your-password
export SFTP_PATH=/path/to/vehicles.csv
export SERVER_PORT=3000
export SERVER_API_KEY=your-api-key
```

The service will use environment variables if `config.json` is not found.


