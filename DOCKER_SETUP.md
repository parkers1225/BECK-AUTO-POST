# Docker Setup for SFTP Proxy Server

This guide will help you set up the SFTP proxy server using Docker, so it runs automatically whether you're logged in or not (as long as Windows is running).

## ⚠️ Important Note

**The server can only run when your computer is ON.** If the computer is off, nothing can run. However, Docker will ensure it runs:
- ✅ When computer is ON and you're logged in
- ✅ When computer is ON and you're NOT logged in
- ✅ Automatically restarts if it crashes
- ✅ Starts automatically when Windows/Docker starts

---

## Step 1: Install Docker Desktop

1. **Download Docker Desktop for Windows:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Download "Docker Desktop for Windows"
   - Run the installer

2. **Install Docker Desktop:**
   - Follow the installation wizard
   - **Important:** Check "Use WSL 2 instead of Hyper-V" (recommended for Windows 10/11)
   - Restart your computer when prompted

3. **Start Docker Desktop:**
   - After restart, Docker Desktop should start automatically
   - Look for the Docker icon in your system tray (whale icon)
   - Wait for it to show "Docker Desktop is running"

4. **Verify Installation:**
   - Open PowerShell
   - Run: `docker --version`
   - Should show: `Docker version XX.XX.X, build ...`

---

## Step 2: Configure Docker to Auto-Start

1. **Open Docker Desktop**
2. **Go to Settings:**
   - Click the gear icon (⚙️) in the top right
   - Or: Click Docker icon in system tray → Settings

3. **General Settings:**
   - ✅ Check "Start Docker Desktop when you log in"
   - ✅ Check "Use the WSL 2 based engine" (if available)

4. **Resources (Optional):**
   - Adjust CPU/Memory if needed (defaults are usually fine)

5. **Click "Apply & Restart"**

---

## Step 3: Build and Run the Docker Container

1. **Open PowerShell in the server directory:**
   ```powershell
   cd "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server"
   ```

2. **Build the Docker image:**
   ```powershell
   docker build -t sftp-proxy .
   ```
   This will take a few minutes the first time (downloads Node.js base image).

3. **Start the container:**
   ```powershell
   docker-compose up -d
   ```
   The `-d` flag runs it in "detached" mode (background).

4. **Verify it's running:**
   ```powershell
   docker ps
   ```
   Should show `sftp-proxy` container with status "Up".

5. **Test the endpoint:**
   ```powershell
   curl http://localhost:3000/health
   ```
   Or open in browser: `http://localhost:3000/health`

---

## Step 4: Verify Auto-Start

1. **Check container is running:**
   ```powershell
   docker ps
   ```

2. **Check logs:**
   ```powershell
   docker logs sftp-proxy
   ```

3. **Test auto-restart:**
   - Restart your computer
   - After Windows starts, wait 30 seconds
   - Run: `docker ps`
   - Container should be running automatically!

---

## Docker Commands Reference

### Basic Commands

```powershell
# Check if container is running
docker ps

# View logs
docker logs sftp-proxy

# View logs in real-time
docker logs -f sftp-proxy

# Stop container
docker-compose down

# Start container
docker-compose up -d

# Restart container
docker-compose restart

# Rebuild and restart (after code changes)
docker-compose up -d --build

# Stop and remove container
docker-compose down

# Remove everything (container + image)
docker-compose down --rmi local
```

### Troubleshooting Commands

```powershell
# Check container status
docker ps -a

# View detailed container info
docker inspect sftp-proxy

# Execute command in container
docker exec -it sftp-proxy sh

# View resource usage
docker stats sftp-proxy
```

---

## Configuration

### Editing config.json

The `config.json` file is mounted as a volume, so you can edit it without rebuilding:

1. **Edit config.json:**
   ```powershell
   notepad "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server\config.json"
   ```

2. **Restart container to apply changes:**
   ```powershell
   docker-compose restart
   ```

### Changing Port

If you need to change the port (default: 3000):

1. **Edit docker-compose.yml:**
   ```yaml
   ports:
     - "YOUR_PORT:3000"  # Change YOUR_PORT to desired port
   ```

2. **Restart:**
   ```powershell
   docker-compose down
   docker-compose up -d
   ```

---

## How It Works

### Auto-Start Behavior

1. **Windows Boots:**
   - Docker Desktop service starts automatically (if configured)
   - Docker Compose detects the `restart: always` policy
   - Container starts automatically

2. **Container Crashes:**
   - Docker automatically restarts it (due to `restart: always`)
   - No manual intervention needed

3. **Computer Restart:**
   - Docker Desktop starts with Windows
   - Container starts automatically
   - Server is available within ~30 seconds of boot

### Network Access

- **Local:** `http://localhost:3000/csv`
- **Network:** `http://10.26.1.230:3000/csv` (your local IP)

The container is accessible on your network just like the non-Docker version.

---

## Advantages of Docker Setup

✅ **Automatic Startup:** Runs when Windows/Docker starts  
✅ **Auto-Restart:** Restarts if container crashes  
✅ **Isolation:** Runs in isolated environment  
✅ **Easy Updates:** Just rebuild and restart  
✅ **Portable:** Can move to any Docker host  
✅ **No PM2 Needed:** Docker handles process management  
✅ **Works Without Login:** Runs as Docker service  

---

## Troubleshooting

### Docker Desktop Not Starting

1. **Check Windows Services:**
   - Press `Windows Key + R`
   - Type: `services.msc`
   - Find "Docker Desktop Service"
   - Should be "Running" and "Automatic"

2. **Restart Docker Desktop:**
   - Right-click Docker icon in system tray
   - Click "Restart Docker Desktop"

### Container Not Starting

1. **Check logs:**
   ```powershell
   docker logs sftp-proxy
   ```

2. **Check if port is in use:**
   ```powershell
   netstat -ano | findstr :3000
   ```

3. **Verify config.json exists:**
   ```powershell
   Test-Path "C:\Users\parker.sloan\FB MARKETPLACE PROJECT\server\config.json"
   ```

### Container Keeps Restarting

1. **Check logs for errors:**
   ```powershell
   docker logs sftp-proxy
   ```

2. **Common issues:**
   - Invalid config.json (check JSON syntax)
   - SFTP connection failure (check credentials)
   - Port conflict (change port in docker-compose.yml)

### Can't Access from Network

1. **Check Windows Firewall:**
   - Allow port 3000 through firewall
   - Or disable firewall temporarily to test

2. **Verify container is running:**
   ```powershell
   docker ps
   ```

3. **Check port mapping:**
   ```powershell
   docker port sftp-proxy
   ```

---

## Migration from PM2

If you were using PM2 before:

1. **Stop PM2 process:**
   ```powershell
   pm2 stop sftp-proxy
   pm2 delete sftp-proxy
   ```

2. **Follow Docker setup above**

3. **Remove PM2 startup script** (optional):
   - Delete `start-sftp-proxy.bat` from Startup folder
   - Or remove Task Scheduler task

---

## Current Configuration

- **Container Name:** `sftp-proxy`
- **Image Name:** `sftp-proxy`
- **Port:** `3000` (host) → `3000` (container)
- **Restart Policy:** `always`
- **Config File:** Mounted from host (`config.json`)

---

## Next Steps

1. ✅ Install Docker Desktop
2. ✅ Configure Docker to auto-start
3. ✅ Build and run container
4. ✅ Test endpoints
5. ✅ Update Chrome extension to use: `http://10.26.1.230:3000/csv`

**Your server will now run automatically whenever Windows is running, whether you're logged in or not!** 🐳


