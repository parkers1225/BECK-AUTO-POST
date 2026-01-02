/**
 * Generate store-specific config.json from master stores configuration
 * 
 * Usage: node generate-store-config.js <store-id>
 * Example: node generate-store-config.js store-001
 */

const fs = require('fs');
const path = require('path');

// Get store ID from command line
const storeId = process.argv[2];

if (!storeId) {
  console.error('âŒ Error: Store ID required');
  console.log('\nUsage: node generate-store-config.js <store-id>');
  console.log('Example: node generate-store-config.js store-001');
  process.exit(1);
}

// Try to load stores config (if exists)
let storesConfig = null;
const storesConfigPath = path.join(__dirname, '..', 'stores-config.json');

if (fs.existsSync(storesConfigPath)) {
  try {
    storesConfig = JSON.parse(fs.readFileSync(storesConfigPath, 'utf8'));
  } catch (error) {
    console.warn('âš ï¸  Warning: Could not load stores-config.json:', error.message);
  }
}

// If stores config exists, use it
if (storesConfig && storesConfig.stores) {
  const store = storesConfig.stores.find(s => s.id === storeId);
  
  if (!store) {
    console.error(âŒ Error: Store "" not found in stores-config.json);
    console.log('\nAvailable stores:');
    storesConfig.stores.forEach(s => {
      console.log(  - : );
    });
    process.exit(1);
  }
  
  // Generate config from stores config
  const config = {
    store: {
      id: store.id,
      name: store.name,
      location: store.location || ''
    },
    sftp: {
      host: store.sftp.host,
      port: store.sftp.port || 22,
      username: store.sftp.username,
      password: store.sftp.password,
      path: store.sftp.path
    },
    server: {
      port: store.proxy.port || 3000,
      apiKey: store.proxy.apiKey
    }
  };
  
  const configPath = path.join(__dirname, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(âœ… Generated config.json for );
  console.log(   Store ID: );
  console.log(   Location: );
  console.log(   SFTP Host: );
  console.log(   CSV Path: );
  console.log(   Port: );
  console.log(\nðŸ“ Config saved to: );
  
} else {
  // Interactive mode - prompt for values
  console.log(\nðŸ“ Generating config.json for store: );
  console.log('   (stores-config.json not found - using template)\n');
  
  // Load example config as template
  const examplePath = path.join(__dirname, 'config.example.json');
  let config = {};
  
  if (fs.existsSync(examplePath)) {
    try {
      config = JSON.parse(fs.readFileSync(examplePath, 'utf8'));
    } catch (error) {
      console.warn('âš ï¸  Warning: Could not load config.example.json');
    }
  }
  
  // Add store info
  config.store = {
    id: storeId,
    name: Store ,
    location: ''
  };
  
  // Save config
  const configPath = path.join(__dirname, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(âœ… Generated template config.json for );
  console.log(\nâš ï¸  Please edit config.json and fill in:);
  console.log(   - Store name and location);
  console.log(   - SFTP credentials);
  console.log(   - SFTP CSV file path);
  console.log(   - API key);
  console.log(\nðŸ“ Config saved to: );
}
