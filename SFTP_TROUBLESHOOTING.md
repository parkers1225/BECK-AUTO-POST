# SFTP Connection Troubleshooting

Error: "All configured authentication methods failed"

---

## 🔍 Step 1: Check Railway Environment Variables

**In Railway Dashboard → Variables:**

Verify these are set correctly:
- `SFTP_HOST`
- `SFTP_USERNAME`
- `SFTP_PASSWORD`
- `SFTP_PORT`

**Common issues:**
- Extra spaces in values
- Wrong case (username might be case-sensitive)
- Special characters in password

---

## 🔍 Step 2: Check Railway Logs

**Railway Dashboard → Deploy Logs:**

Look for:
- Connection attempts
- Authentication errors
- Specific error messages

**Share the exact error message** - it will help identify the issue.

---

## 🔍 Step 3: Test SFTP Connection

**Test from your local computer:**

**Option A: Using FileZilla/WinSCP**
1. Open FileZilla or WinSCP
2. Connect to: `sftp.transfer.vauto.com`
3. Port: `22`
4. Username: (your username)
5. Password: (your password)
6. Try to connect

**If this works:** Railway might be blocked by firewall  
**If this doesn't work:** Credentials are wrong

---

## 🔧 Common Solutions

### Solution 1: Verify Credentials

- Username is case-sensitive
- Password has no extra spaces
- Host is exactly `sftp.transfer.vauto.com`

### Solution 2: Check SFTP Server Settings

**Contact your SFTP server admin to verify:**
- Does server accept password authentication?
- Are there IP restrictions?
- Is Railway's IP whitelisted?
- Any special connection requirements?

### Solution 3: Use SSH Keys (If Required)

If server requires SSH keys:
1. Generate SSH key pair
2. Add public key to SFTP server
3. Update server code to use private key

**Let me know if you need SSH key authentication setup.**

---

## 📋 Information Needed

To help fix this, please provide:

1. **Railway logs** - The exact error message
2. **Can you connect locally?** - Does FileZilla/WinSCP work?
3. **SFTP server requirements** - Does it accept passwords or need SSH keys?
4. **Credentials format** - Any special requirements?

---

**Check Railway logs and share the exact error message - that will help identify the issue!**
