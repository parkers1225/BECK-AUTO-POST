# Deploy to Hostinger VPS

Hostinger can work for your Node.js proxy server, but requires more setup than Railway/Render. This guide covers deploying to Hostinger VPS.

---

## ⚠️ Important: Hostinger Comparison

### Hostinger VPS vs Railway/Render

| Feature | Hostinger VPS | Railway/Render |
|---------|---------------|----------------|
| **Setup Complexity** | ⭐⭐⭐ Hard | ⭐ Easy |
| **Node.js Support** | Manual setup | Automatic |
| **HTTPS/SSL** | Manual (Let's Encrypt) | Automatic |
| **Deployment** | Manual (SSH, Git) | Automatic (GitHub) |
| **Cost** | $4-10/month | Free tier available |
| **Maintenance** | You manage everything | Fully managed |
| **Best For** | Full control, learning | Quick deployment |

**Recommendation:** Use Railway or Render unless you specifically need VPS control or already have a Hostinger account.

---

## Option: Deploy to Hostinger VPS

If you want to use Hostinger, you'll need a **VPS plan** (not shared hosting - shared hosting doesn't support Node.js).

### Step 1: Get Hostinger VPS

1. Go to https://www.hostinger.com/vps-hosting
2. Choose a VPS plan (minimum: 1GB RAM, 1 CPU)
3. Complete purchase and wait for setup email

### Step 2: Access Your VPS

You'll receive SSH credentials:
- IP address
- Username (usually `root`)
- Password

**Connect via SSH:**
```powershell
# Windows (using PowerShell or PuTTY)
ssh root@your-server-ip
```

### Step 3: Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 4: Upload Your Server Code

**Option A: Using Git (Recommended)**

```bash
# Install Git
apt install -y git

# Clone your repository
git clone https://github.com/your-username/your-repo.git
cd your-repo/server

# Or upload via SFTP and extract
```

**Option B: Using SFTP**

1. Use FileZilla or WinSCP
2. Connect to your VPS via SFTP
3. Upload your `server` folder
4. Extract if needed

### Step 5: Install Dependencies

```bash
cd /path/to/your/server
npm install
```

### Step 6: Configure Environment Variables

Create a `.env` file:

```bash
nano .env
```

Add:
```
SFTP_HOST=sftp.transfer.vauto.com
SFTP_PORT=22
SFTP_USERNAME=your-username
SFTP_PASSWORD=your-password
SFTP_PATH=/MP15932.csv
API_KEY=your-api-key
PORT=3000
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 7: Install PM2 (Process Manager)

```bash
npm install -g pm2

# Start your server
pm2 start sftp-proxy.js --name sftp-proxy

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

### Step 8: Configure Firewall

```bash
# Allow port 3000
ufw allow 3000/tcp

# Or if using iptables
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

### Step 9: Setup HTTPS with Let's Encrypt (Optional but Recommended)

**Install Certbot:**

```bash
apt install -y certbot python3-certbot-nginx
```

**Install Nginx (Reverse Proxy):**

```bash
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/sftp-proxy
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
ln -s /etc/nginx/sites-available/sftp-proxy /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

**Get SSL Certificate:**

```bash
certbot --nginx -d your-domain.com
```

Follow prompts. Certbot will automatically configure HTTPS.

### Step 10: Test Your Deployment

```bash
# Test locally on server
curl http://localhost:3000/health

# Test from your computer
curl http://your-server-ip:3000/health

# Test with domain (if configured)
curl https://your-domain.com/health
```

---

## 🔧 Useful Commands

### PM2 Management

```bash
# Check status
pm2 status

# View logs
pm2 logs sftp-proxy

# Restart
pm2 restart sftp-proxy

# Stop
pm2 stop sftp-proxy

# Monitor
pm2 monit
```

### Update Your Code

```bash
cd /path/to/your/server
git pull  # If using Git
# Or upload new files via SFTP

# Restart server
pm2 restart sftp-proxy
```

---

## ⚠️ Hostinger Limitations

1. **Shared Hosting Won't Work:**
   - Hostinger shared hosting is for PHP/WordPress
   - You MUST use VPS for Node.js

2. **More Setup Required:**
   - Manual Node.js installation
   - Manual PM2 setup
   - Manual SSL/HTTPS configuration
   - Manual firewall configuration

3. **More Maintenance:**
   - You manage server updates
   - You manage security
   - You manage backups

4. **No Automatic Deployments:**
   - Must manually deploy via SSH/SFTP
   - No GitHub integration like Railway/Render

---

## 💰 Cost Comparison

| Service | Monthly Cost | Setup Time | Maintenance |
|---------|--------------|------------|-------------|
| **Railway** | Free tier / $5+ | 5 min | None |
| **Render** | Free tier / $7+ | 5 min | None |
| **Hostinger VPS** | $4-10/month | 30-60 min | Ongoing |

---

## ✅ When to Use Hostinger

Use Hostinger VPS if:
- ✅ You already have a Hostinger account
- ✅ You want full server control
- ✅ You need specific server configurations
- ✅ You're comfortable with Linux/SSH
- ✅ You want to learn server management

**Don't use Hostinger if:**
- ❌ You want the easiest setup
- ❌ You want automatic deployments
- ❌ You want zero maintenance
- ❌ You're not comfortable with Linux/SSH

---

## 🎯 Recommendation

**For your use case (SFTP proxy server), I recommend:**

1. **Railway** (Best choice) - Easiest, free tier, automatic everything
2. **Render** (Second choice) - Also easy, free tier
3. **Hostinger VPS** (Only if you need VPS control) - More work, but more control

---

## 📝 Quick Comparison

**Railway Setup:**
1. Sign up → Connect GitHub → Deploy
2. Add environment variables
3. Done! (5 minutes)

**Hostinger Setup:**
1. Buy VPS → Wait for setup
2. SSH into server
3. Install Node.js
4. Install PM2
5. Upload code
6. Configure firewall
7. Setup Nginx
8. Setup SSL
9. Done! (30-60 minutes)

---

## 🆘 Troubleshooting

### Can't Connect via SSH
- Check Hostinger control panel for correct IP
- Verify firewall allows SSH (port 22)
- Check credentials

### Node.js Not Found
- Verify installation: `which node`
- Check PATH: `echo $PATH`
- Reinstall if needed

### PM2 Not Starting on Boot
- Run `pm2 startup` again
- Check the command it outputs
- Verify systemd service exists

### Port 3000 Not Accessible
- Check firewall: `ufw status`
- Check if server is running: `pm2 status`
- Test locally: `curl http://localhost:3000/health`

---

## 🔐 Security Best Practices

1. **Change Default SSH Port** (optional but recommended)
2. **Use SSH Keys** instead of passwords
3. **Keep System Updated:** `apt update && apt upgrade`
4. **Use Firewall:** `ufw enable`
5. **Use HTTPS:** Always use Let's Encrypt SSL
6. **Regular Backups:** Setup automated backups

---

## 📚 Next Steps

If you choose Hostinger:
1. Follow this guide step-by-step
2. Test thoroughly before updating extensions
3. Monitor PM2 logs for issues
4. Setup regular backups

**Or, use Railway/Render for much easier setup!**

See `PUBLIC_HOSTING_DEPLOYMENT.md` for Railway/Render guides.

