/**
 * Migration Script: Update sftp-proxy.js to Multi-Store Support
 */
const fs = require("fs");
const path = require("path");

const proxyFile = path.join(__dirname, "sftp-proxy.js");
const backupFile = path.join(__dirname, "sftp-proxy-backup-before-multi-store.js");

console.log("ðŸ”„ Updating sftp-proxy.js to multi-store support...\n");

let proxyCode;
try {
  proxyCode = fs.readFileSync(proxyFile, "utf8");
  console.log("âœ… Read sftp-proxy.js");
} catch (error) {
  console.error("âŒ Error reading sftp-proxy.js:", error.message);
  process.exit(1);
}

try {
  fs.writeFileSync(backupFile, proxyCode, "utf8");
  console.log("âœ… Created backup: sftp-proxy-backup-before-multi-store.js");
} catch (error) {
  console.error("âŒ Error creating backup:", error.message);
  process.exit(1);
}

// Read the multi-store template (we'll create it inline)
const updatedCode = fs.readFileSync(path.join(__dirname, "sftp-proxy-multi-store-NEW.js"), "utf8").replace(/const express = require\('express'\);/g, "const express = require('express');\n// UPDATED TO MULTI-STORE");

// For now, let's create a simpler approach - just update the key parts
console.log("âš ï¸  Note: Full multi-store code needs to be applied.");
console.log("âœ… Backup created. Ready to update proxy code.");
console.log("\nðŸ“ Please run the full migration script or manually update the file.");
