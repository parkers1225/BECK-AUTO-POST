/**
 * Popup script - Main UI logic
 */

let csvParser, vinMatcher;
let vehicles = new Map();
let selectedVehicle = null;
let selectedPhoto = null;
let removedGalleryItems = []; // Store removed items to restore them later

// Listen for progress updates from content script and CSV updates from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'formFillProgress') {
    // Check if DOM is ready and function exists
    if (typeof updateFormFillProgress === 'function') {
      updateFormFillProgress(message.progress, message.stage);
    }
    sendResponse({ received: true });
  } else if (message.action === 'csvUpdated') {
    // CSV was updated in background
    console.log('CSV updated in background:', message.timestamp);
    // Update last update time if settings panel is visible
    if (message.timestamp) {
      const lastUpdateEl = document.getElementById('csvLastUpdateTime');
      if (lastUpdateEl) {
        lastUpdateEl.textContent = new Date(message.timestamp).toLocaleString();
      }
    }
    // Optionally reload vehicles if popup is open
    if (typeof autoLoadCSVAndPhotos === 'function') {
      autoLoadCSVAndPhotos().catch(err => console.error('Failed to reload after CSV update:', err));
    }
    sendResponse({ received: true });
  }
  return false;
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Load utilities
  csvParser = new CSVParser();
  vinMatcher = new VINMatcher();
  
  // Load settings
  await loadSettings();
  
  // Setup event listeners
  setupEventListeners();
  
  // Auto-load CSV data and display photos
  await autoLoadCSVAndPhotos();
  
  // Ensure logo displays with transparency and handle loading
  setupLogo();
});

/**
 * Process image to remove white/light background and make it transparent
 * Uses multiple detection methods for better results
 */
async function processLogoForTransparency(img) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      // Use willReadFrequently for better performance when reading image data multiple times
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // More aggressive background removal
      // Try multiple thresholds to catch different shades
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip if already transparent
        if (a === 0) continue;
        
        // Method 1: Pure white detection (255, 255, 255)
        const isPureWhite = r === 255 && g === 255 && b === 255;
        
        // Method 2: Very light/white detection (threshold 240)
        const isVeryLight = r > 240 && g > 240 && b > 240;
        
        // Method 3: Light gray/white detection (threshold 220)
        const isLight = r > 220 && g > 220 && b > 220;
        
        // Method 4: High brightness (sum of RGB)
        const brightness = r + g + b;
        const isBright = brightness > 650; // Out of 765 max
        
        // Method 5: Check if all channels are similar (gray/white)
        const channelDiff = Math.max(r, g, b) - Math.min(r, g, b);
        const isGrayish = channelDiff < 30 && brightness > 600;
        
        // Make transparent if any condition matches
        if (isPureWhite || isVeryLight || (isLight && isBright) || isGrayish) {
          data[i + 3] = 0; // Set alpha to 0 (fully transparent)
        }
      }
      
      // Put processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to data URL and return
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      console.error('Error processing logo:', error);
      reject(error);
    }
  });
}

/**
 * Setup logo with proper error handling and transparency
 */
function setupLogo() {
  const logo = document.getElementById('headerLogo');
  if (!logo) {
    console.warn('Logo element not found');
    return;
  }
  
  console.log('Setting up logo...');
  
  // Ensure transparency styling - remove ALL backgrounds
  logo.style.background = 'transparent';
  logo.style.backgroundColor = 'transparent';
  logo.style.backgroundImage = 'none';
  logo.style.boxShadow = 'none';
  
  // Store original src for fallback
  const originalSrc = logo.src;
  
  // Guard flag to prevent infinite loop (setting src re-triggers onload)
  let logoProcessed = false;
  
  // Handle logo load success
  const handleLogoLoad = async function() {
    if (logoProcessed) return; // Already processed, don't loop
    logoProcessed = true;
    try {
      console.log('Logo loaded, dimensions:', logo.naturalWidth, 'x', logo.naturalHeight);
      
      // Try to process image to remove white background
      console.log('Processing logo for transparency...');
      const processedDataUrl = await processLogoForTransparency(logo);
      console.log('Logo processed successfully');
      
      // Create new image to load processed version
      const processedImg = new Image();
      processedImg.onload = function() {
        console.log('✓ Transparent logo applied successfully');
        logo.src = processedDataUrl;
        logo.style.display = 'block';
        logo.style.opacity = '1';
        logo.offsetHeight; // Trigger reflow
      };
      
      processedImg.onerror = function() {
        console.warn('Processed logo failed to load, using CSS mix-blend-mode fallback');
        logo.style.display = 'block';
        logo.style.opacity = '1';
      };
      
      processedImg.src = processedDataUrl;
      
    } catch (error) {
      console.error('Error processing logo:', error);
      logo.style.display = 'block';
      logo.style.opacity = '1';
    }
  };
  
  logo.onload = handleLogoLoad;
  
  // Handle logo load error - show gracefully without breaking layout
  logo.onerror = function() {
    console.error('Logo image not found. Make sure icons/beck-logo.png exists.');
    console.error('Attempted to load from:', logo.src);
    // Hide logo but keep the text visible
    logo.style.display = 'none';
  };
  
  // Set initial state for fade-in effect
  logo.style.opacity = '0';
  logo.style.transition = 'opacity 0.3s ease-in';
  
  // Add a visual indicator class for debugging
  logo.classList.add('logo-loading');
  
  // Trigger load check
  if (logo.complete && logo.naturalHeight !== 0) {
    console.log('Logo already loaded, processing...');
    handleLogoLoad();
  } else {
    console.log('Waiting for logo to load...');
  }
  
  // Timeout fallback - if logo doesn't load in 3 seconds, show it anyway
  setTimeout(() => {
    if (logo.style.opacity === '0' || logo.style.opacity === '') {
      console.warn('Logo load timeout - showing logo with CSS blend mode');
      logo.style.display = 'block';
      logo.style.opacity = '1';
      logo.classList.remove('logo-loading');
    }
  }, 3000);
}

// Global function to toggle CSV source visibility
function toggleCSVSource() {
  const csvSourceUrl = document.getElementById('csvSourceUrl');
  const csvSourceFile = document.getElementById('csvSourceFile');
  const csvUrlGroup = document.getElementById('csvUrlGroup');
  const csvFileGroup = document.getElementById('csvFileGroup');
  const apiKeyInput = document.getElementById('csvApiKeyInput');
  const csvUrlInput = document.getElementById('csvUrlInput');
  
  if (!csvSourceUrl || !csvSourceFile || !csvUrlGroup || !csvFileGroup) {
    console.error('CSV source elements not found', {
      csvSourceUrl: !!csvSourceUrl,
      csvSourceFile: !!csvSourceFile,
      csvUrlGroup: !!csvUrlGroup,
      csvFileGroup: !!csvFileGroup
    });
    return;
  }
  
  console.log('toggleCSVSource called:', {
    urlChecked: csvSourceUrl.checked,
    fileChecked: csvSourceFile.checked,
    urlGroupExists: !!csvUrlGroup,
    urlInputExists: !!csvUrlInput
  });
  
  // Force show if URL is checked, regardless of current state
  if (csvSourceUrl && csvSourceUrl.checked) {
    // Show URL group - remove all hiding styles and use !important to override CSS
    csvUrlGroup.style.setProperty('display', 'block', 'important');
    csvUrlGroup.style.setProperty('visibility', 'visible', 'important');
    csvUrlGroup.style.setProperty('opacity', '1', 'important');
    csvUrlGroup.style.setProperty('height', 'auto', 'important');
    csvUrlGroup.style.setProperty('max-height', 'none', 'important');
    csvUrlGroup.style.setProperty('overflow', 'visible', 'important');
    csvUrlGroup.removeAttribute('hidden');
    csvUrlGroup.classList.remove('hidden');
    
    // Hide file group
    csvFileGroup.style.setProperty('display', 'none', 'important');
    
    console.log('CSV URL source selected - showing URL fields');
    console.log('URL Group element:', csvUrlGroup);
    console.log('URL Group computed style:', window.getComputedStyle(csvUrlGroup).display);
    console.log('URL Group offsetHeight:', csvUrlGroup.offsetHeight);
    
    // Show and style URL input
    if (csvUrlInput) {
      csvUrlInput.style.setProperty('display', 'block', 'important');
      csvUrlInput.style.setProperty('visibility', 'visible', 'important');
      csvUrlInput.style.setProperty('opacity', '1', 'important');
      csvUrlInput.classList.remove('file-input'); // Remove the hiding class
      console.log('URL Input element:', csvUrlInput);
      console.log('URL Input computed style:', window.getComputedStyle(csvUrlInput).display);
    }
    
    // Show API key input if it exists
    if (apiKeyInput) {
      apiKeyInput.style.setProperty('display', 'block', 'important');
      apiKeyInput.style.setProperty('visibility', 'visible', 'important');
      apiKeyInput.style.setProperty('opacity', '1', 'important');
      apiKeyInput.classList.remove('file-input'); // Remove the hiding class
      console.log('API Key input should be visible');
    }
    
    // Focus on URL input for better UX
    if (csvUrlInput) {
      setTimeout(() => {
        csvUrlInput.focus();
      }, 100);
    }
  } else if (csvSourceFile.checked) {
    // Hide URL group
    csvUrlGroup.style.display = 'none';
    csvUrlGroup.style.visibility = 'hidden';
    csvUrlGroup.style.opacity = '0';
    
    // Show file group
    csvFileGroup.style.display = 'block';
    console.log('CSV file source selected - showing file upload');
  }
}

function setupEventListeners() {
  // CSV Upload (in settings)
  document.getElementById('csvFileInput').addEventListener('change', handleCSVUpload);
  
  // CSV Source radio buttons - get elements without declaring const to avoid conflicts
  const csvSourceUrlEl = document.getElementById('csvSourceUrl');
  const csvSourceFileEl = document.getElementById('csvSourceFile');
  
  // Add multiple event listeners for better compatibility
  if (csvSourceUrlEl) {
    csvSourceUrlEl.addEventListener('change', toggleCSVSource);
    csvSourceUrlEl.addEventListener('click', toggleCSVSource);
  }
  if (csvSourceFileEl) {
    csvSourceFileEl.addEventListener('change', toggleCSVSource);
    csvSourceFileEl.addEventListener('click', toggleCSVSource);
  }
  
  // Set initial state - call after a short delay to ensure DOM is ready
  setTimeout(toggleCSVSource, 100);
  
  // Auto-refresh toggle
  document.getElementById('autoRefreshEnabled').addEventListener('change', (e) => {
    const intervalGroup = document.getElementById('autoRefreshIntervalGroup');
    intervalGroup.style.display = e.target.checked ? 'block' : 'none';
  });
  
  // Photo selection
  document.getElementById('refreshBtn').addEventListener('click', () => {
    autoLoadCSVAndPhotos();
  });
  document.getElementById('photoFileInput').addEventListener('change', handlePhotoUpload);
  
  // Back button to restore gallery view
  const backBtn = document.getElementById('backToGalleryBtn');
  if (backBtn) {
    backBtn.addEventListener('click', restoreGalleryView);
  }
  
  // AI Generation
  document.getElementById('generateBtn').addEventListener('click', generateDescription);
  document.getElementById('regenerateBtn').addEventListener('click', generateDescription);
  document.getElementById('copyDescriptionBtn').addEventListener('click', copyDescription);
  
  // Actions
  document.getElementById('openMarketplaceBtn').addEventListener('click', openMarketplace);
  document.getElementById('fillFormBtn').addEventListener('click', fillMarketplaceForm);
  
  // Settings
  document.getElementById('settingsBtn').addEventListener('click', toggleSettings);
  document.getElementById('closeSettingsBtn').addEventListener('click', toggleSettings);
  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
}

async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (response.success) {
      document.getElementById('aiService').value = response.service || 'openai';
      document.getElementById('apiKey').value = response.apiKey || '';
    }
    
    // Load CSV settings
    const storage = await chrome.storage.local.get([
      'csvFileName', 
      'csvUrl', 
      'csvApiKey',
      'csvSource', 
      'autoRefreshEnabled', 
      'autoRefreshInterval',
      'lastCSVUpdate',
      'lastCSVHash',
      'dealerWebsiteUrls'
    ]);
    
    // Load dealer website URLs
    if (storage.dealerWebsiteUrls) {
      const urlsTextarea = document.getElementById('dealerWebsiteUrls');
      if (urlsTextarea) {
        const urls = Array.isArray(storage.dealerWebsiteUrls) ? storage.dealerWebsiteUrls : [storage.dealerWebsiteUrls];
        urlsTextarea.value = urls.join('\n');
      }
    } else if (storage.dealerWebsiteUrl) {
      // Migrate from old single-URL format
      const urlsTextarea = document.getElementById('dealerWebsiteUrls');
      if (urlsTextarea) urlsTextarea.value = storage.dealerWebsiteUrl;
    }
    
    // Set CSV source
    const csvSourceUrlEl = document.getElementById('csvSourceUrl');
    const csvSourceFileEl = document.getElementById('csvSourceFile');
    const csvUrlGroupEl = document.getElementById('csvUrlGroup');
    const csvFileGroupEl = document.getElementById('csvFileGroup');
    
    if (storage.csvSource === 'url') {
      if (csvSourceUrlEl) csvSourceUrlEl.checked = true;
      if (csvUrlGroupEl) {
        csvUrlGroupEl.style.display = 'block';
        csvUrlGroupEl.style.visibility = 'visible';
        csvUrlGroupEl.style.opacity = '1';
        csvUrlGroupEl.style.height = 'auto';
      }
      if (csvFileGroupEl) csvFileGroupEl.style.display = 'none';
      if (storage.csvUrl) {
        const urlInput = document.getElementById('csvUrlInput');
        if (urlInput) urlInput.value = storage.csvUrl;
      }
      if (storage.csvApiKey) {
        const apiKeyInput = document.getElementById('csvApiKeyInput');
        if (apiKeyInput) {
          apiKeyInput.value = storage.csvApiKey;
          apiKeyInput.style.display = 'block';
          apiKeyInput.style.visibility = 'visible';
          console.log('API key loaded into input field');
        }
      }
    } else {
      if (csvSourceFileEl) csvSourceFileEl.checked = true;
      if (csvUrlGroupEl) csvUrlGroupEl.style.display = 'none';
      if (csvFileGroupEl) csvFileGroupEl.style.display = 'block';
    }
    
    // Force visibility update after DOM is ready - ensure toggleCSVSource runs
    setTimeout(() => {
      toggleCSVSource();
    }, 300);
    
    // Set auto-refresh settings
    const autoRefreshEnabled = storage.autoRefreshEnabled !== false; // Default to true
    document.getElementById('autoRefreshEnabled').checked = autoRefreshEnabled;
    document.getElementById('autoRefreshIntervalGroup').style.display = autoRefreshEnabled ? 'block' : 'none';
    document.getElementById('autoRefreshInterval').value = storage.autoRefreshInterval || 15;
    
    // Update last update time
    if (storage.lastCSVUpdate) {
      const lastUpdate = new Date(storage.lastCSVUpdate);
      document.getElementById('csvLastUpdateTime').textContent = lastUpdate.toLocaleString();
    }
    
    // Load CSV file name if set
    if (storage.csvFileName) {
      document.getElementById('csvFileName').textContent = storage.csvFileName;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const service = document.getElementById('aiService').value;
  
  // Get CSV source settings
  const csvSource = document.getElementById('csvSourceUrl').checked ? 'url' : 'file';
  const csvUrl = document.getElementById('csvUrlInput').value.trim();
  const csvApiKey = document.getElementById('csvApiKeyInput').value.trim();
  const autoRefreshEnabled = document.getElementById('autoRefreshEnabled').checked;
  const autoRefreshInterval = parseInt(document.getElementById('autoRefreshInterval').value) || 15;
  
  // Parse dealer URLs from textarea (one per line)
  const dealerWebsiteUrls = (document.getElementById('dealerWebsiteUrls')?.value || '')
    .split('\n')
    .map(u => u.trim().replace(/\/+$/, ''))
    .filter(u => u.length > 0);
  
  // Validate CSV URL if using URL source
  if (csvSource === 'url' && !csvUrl) {
    showStatus('csvStatus', 'Please enter a CSV URL', 'error');
    return;
  }
  
  // Note: AI API key is optional - user can save CSV settings without it
  // They'll need it later when generating descriptions, but CSV sync can work independently
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveSettings',
      data: { 
        apiKey: apiKey || '', // Allow empty AI API key
        service,
        csvUrl,
        csvApiKey,
        csvSource,
        autoRefreshEnabled,
        autoRefreshInterval,
        dealerWebsiteUrls
      }
    });
    
    if (response.success) {
      // Show appropriate success message
      if (csvSource === 'url' && csvUrl) {
        showStatus('csvStatus', 'CSV settings saved successfully. Fetching CSV...', 'success');
      } else if (apiKey) {
        showStatus('csvStatus', 'Settings saved successfully', 'success');
      } else {
        showStatus('csvStatus', 'CSV settings saved. Add AI API key later to generate descriptions.', 'success');
      }
      
      // If CSV URL is configured, fetch CSV immediately
      if (csvSource === 'url' && csvUrl) {
        // Trigger background fetch as well (setupAutoRefreshAlarm already does this, but ensure it happens)
        // The setupAutoRefreshAlarm function will fetch immediately after setup
        
        // Also fetch in popup for immediate display
        setTimeout(async () => {
          try {
            console.log('Popup: Fetching CSV immediately after saving settings...');
            await fetchCSVFromURL(csvUrl, csvApiKey || null, true);
          } catch (error) {
            console.error('Popup: Failed to fetch CSV after saving settings:', error);
            showStatus('csvStatus', `Settings saved, but CSV fetch failed: ${error.message}`, 'error');
          }
        }, 500);
      }
      
      // Close settings panel after a short delay
      setTimeout(() => toggleSettings(), 1000);
    } else {
      showStatus('csvStatus', 'Failed to save settings', 'error');
    }
  } catch (error) {
    showStatus('csvStatus', 'Error saving settings: ' + error.message, 'error');
  }
}

function toggleSettings() {
  const settingsPanel = document.getElementById('settingsPanel');
  const mainPanel = document.getElementById('mainPanel');
  
  settingsPanel.classList.toggle('hidden');
  mainPanel.classList.toggle('hidden');
}

/**
 * Calculate SHA256 hash of a string
 */
async function calculateHash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Request optional host permission for a specific URL
 * @param {string} url - The URL to request permission for
 * @returns {Promise<boolean>} - True if permission granted, false otherwise
 */
async function requestHostPermission(url) {
  try {
    const urlObj = new URL(url);
    const origin = `${urlObj.protocol}//${urlObj.host}/*`;
    
    // Check if we already have permission
    const hasPermission = await chrome.permissions.contains({
      origins: [origin]
    });
    
    if (hasPermission) {
      return true;
    }
    
    // Request permission
    const granted = await chrome.permissions.request({
      origins: [origin]
    });
    
    return granted;
  } catch (error) {
    console.error('Popup: Error requesting permission:', error);
    return false;
  }
}

/**
 * Fetch CSV from URL with change detection
 */
async function fetchCSVFromURL(url, apiKey = null, showLoadingIndicator = false) {
  if (!url) {
    throw new Error('CSV URL is not configured');
  }
  
  if (showLoadingIndicator) {
    showLoading('Fetching CSV from server...');
  }
  
  try {
    console.log('Popup: Starting CSV fetch from URL:', url);
    showStatus('photoStatus', 'Fetching CSV data...', 'info');
    
    // Build URL with API key if provided
    let fetchUrl = url;
    if (apiKey) {
      try {
        // Add API key as query parameter
        const urlObj = new URL(url);
        urlObj.searchParams.set('apiKey', apiKey);
        fetchUrl = urlObj.toString();
        console.log('Popup: Added API key to URL (as query param)');
      } catch (urlError) {
        console.error('Popup: Invalid URL format:', urlError);
        throw new Error(`Invalid CSV URL format: ${urlError.message}`);
      }
    }
    
    // Request permission for CSV URL if needed
    const hasPermission = await requestHostPermission(fetchUrl);
    if (!hasPermission) {
      throw new Error('Permission denied to access CSV URL. Please grant permission when prompted.');
    }
    
    // Build headers
    const headers = {
      'Accept': 'text/csv, text/plain, */*'
    };
    
    // Add API key to Authorization header if provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      console.log('Popup: Added API key to Authorization header');
    }
    
    console.log('Popup: Fetching from URL:', fetchUrl);
    console.log('Popup: Headers:', Object.keys(headers));
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: headers,
      cache: 'no-cache'
    });
    
    console.log('Popup: Fetch response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Popup: Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200)
      });
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}${errorText ? ` - ${errorText.substring(0, 100)}` : ''}`);
    }
    
    const csvContent = await response.text();
    console.log('Popup: CSV content received, length:', csvContent.length);
    
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Get hash from response header if available, otherwise calculate it
    const responseHash = response.headers.get('X-CSV-Hash');
    const csvHash = responseHash || await calculateHash(csvContent);
    console.log('Popup: CSV hash:', csvHash.substring(0, 16) + '...');
    
    // Check if CSV has changed
    const storage = await chrome.storage.local.get(['lastCSVHash']);
    if (storage.lastCSVHash === csvHash) {
      console.log('Popup: CSV unchanged (hash matches), loading existing data');
      if (showLoadingIndicator) hideLoading();
      showStatus('photoStatus', 'CSV is up to date', 'info');
      updateCSVSyncStatus('success', `Up to date (${new Date().toLocaleTimeString()})`);
      // Still load existing data
      const response = await chrome.runtime.sendMessage({ action: 'getVehicleData' });
      if (response.success && response.data.vehicles && Object.keys(response.data.vehicles).length > 0) {
        vehicles = new Map(Object.entries(response.data.vehicles));
        await loadPhotosFromCSV();
      } else {
        showEmptyState();
      }
      return false; // No update needed
    }
    
    console.log('Popup: CSV changed, parsing...');
    // Parse CSV
    const parsedVehicles = await csvParser.parseCSV(csvContent);
    vehicles = parsedVehicles;
    console.log('Popup: Parsed vehicles count:', vehicles.size);
    
    // Store in background for content script
    const vehiclesObj = {};
    vehicles.forEach((vehicle, vin) => {
      vehiclesObj[vin] = vehicle;
    });
    
    const parseResponse = await chrome.runtime.sendMessage({
      action: 'parseCSV',
      data: { vehicles: vehiclesObj }
    });
    
    if (!parseResponse.success) {
      throw new Error(parseResponse.error || 'Failed to store CSV data');
    }
    
    // Store update metadata
    const now = new Date().toISOString();
    await chrome.storage.local.set({
      lastCSVUpdate: now,
      lastCSVHash: csvHash,
      csvLastModified: response.headers.get('X-CSV-Last-Modified') || null
    });
    
    // Update UI
    const lastUpdateEl = document.getElementById('csvLastUpdateTime');
    if (lastUpdateEl) {
      lastUpdateEl.textContent = new Date(now).toLocaleString();
    }
    
    // Update sync status indicator
    updateCSVSyncStatus('success', `Updated ${new Date(now).toLocaleTimeString()}`);
    
    if (showLoadingIndicator) hideLoading();
    showStatus('photoStatus', `Successfully loaded ${vehicles.size} vehicles`, 'success');
    
    // Load photos
    await loadPhotosFromCSV();
    
    return true; // Update successful
  } catch (error) {
    console.error('Failed to fetch CSV from URL:', error);
    if (showLoadingIndicator) hideLoading();
    
    // Update sync status indicator
    updateCSVSyncStatus('error', `Error: ${error.message.substring(0, 30)}...`);
    
    // Try to load existing data if fetch failed
    const response = await chrome.runtime.sendMessage({ action: 'getVehicleData' });
    if (response.success && response.data.vehicles && Object.keys(response.data.vehicles).length > 0) {
      vehicles = new Map(Object.entries(response.data.vehicles));
      await loadPhotosFromCSV();
      showStatus('photoStatus', `Using cached data. Fetch failed: ${error.message}`, 'error');
    } else {
      showStatus('photoStatus', `Failed to fetch CSV: ${error.message}`, 'error');
      showEmptyState();
    }
    throw error;
  }
}

/**
 * Update CSV sync status indicator
 */
function updateCSVSyncStatus(status, message) {
  const statusEl = document.getElementById('csvSyncStatus');
  const statusTextEl = document.getElementById('csvSyncStatusText');
  
  if (!statusEl || !statusTextEl) return;
  
  statusEl.style.display = 'block';
  statusTextEl.textContent = message;
  
  // Update color based on status
  statusEl.style.color = status === 'success' ? '#4caf50' : status === 'error' ? '#f44336' : '#666';
}

/**
 * Auto-load CSV data and display photos when extension opens
 */
async function autoLoadCSVAndPhotos() {
  try {
    // Show photo section when refreshing
    document.getElementById('photoSection').classList.remove('hidden');
    // Hide other sections when refreshing
    document.getElementById('vehicleSection').classList.add('hidden');
    document.getElementById('aiSection').classList.add('hidden');
    document.getElementById('actionSection').classList.add('hidden');
    
    // Reset gallery to show all vehicles
    // Note: Items will be recreated by loadPhotosFromCSV(), so we just reset styles
    const gallery = document.getElementById('photoGallery');
    const photoSection = document.getElementById('photoSection');
    const photoSectionHeading = photoSection.querySelector('h2');
    gallery.style.setProperty('grid-template-columns', 'repeat(auto-fill, minmax(120px, 1fr))', 'important');
    gallery.style.setProperty('justify-items', 'stretch', 'important');
    gallery.style.setProperty('max-height', '516px', 'important');
    gallery.style.setProperty('min-height', '516px', 'important');
    gallery.style.setProperty('padding', '', 'important');
    gallery.style.setProperty('margin-top', '16px', 'important');
    // Reset photo section padding and show heading
    photoSection.style.padding = '';
    photoSection.style.marginBottom = '';
    if (photoSectionHeading) {
      photoSectionHeading.style.display = 'block';
    }
    
    // Hide back button and clear stored items
    const backBtn = document.getElementById('backToGalleryBtn');
    if (backBtn) {
      backBtn.classList.add('hidden');
      backBtn.style.display = 'none';
    }
    removedGalleryItems = []; // Clear stored items since we're reloading
    
    // Check if CSV URL is configured
    const storage = await chrome.storage.local.get(['csvUrl', 'csvApiKey', 'csvSource', 'lastCSVUpdate', 'autoRefreshEnabled']);
    if (storage.csvSource === 'url' && storage.csvUrl) {
      // Show sync status
      if (storage.lastCSVUpdate) {
        updateCSVSyncStatus('info', `Last sync: ${new Date(storage.lastCSVUpdate).toLocaleTimeString()}`);
      } else {
        updateCSVSyncStatus('info', 'Syncing...');
      }
      
      console.log('Popup: CSV URL configured, attempting to fetch...', {
        url: storage.csvUrl,
        hasApiKey: !!storage.csvApiKey,
        autoRefreshEnabled: storage.autoRefreshEnabled
      });
      
      // Fetch from URL
      try {
        const fetchResult = await fetchCSVFromURL(storage.csvUrl, storage.csvApiKey || null, false);
        if (fetchResult !== false) {
          // Successfully fetched and loaded
          console.log('Popup: CSV fetched and loaded successfully');
          return; // fetchCSVFromURL handles loading photos
        } else {
          // CSV unchanged, but we should still load existing data
          console.log('Popup: CSV unchanged, loading existing data...');
          // Fall through to load from storage
        }
      } catch (error) {
        console.error('Popup: Failed to fetch CSV from URL:', error);
        console.error('Popup: Error details:', {
          message: error.message,
          stack: error.stack,
          url: storage.csvUrl
        });
        // Update sync status with error
        updateCSVSyncStatus('error', `Error: ${error.message.substring(0, 40)}...`);
        // Fall through to load from storage (cached data)
      }
    } else {
      // Hide sync status if not using URL source
      const statusEl = document.getElementById('csvSyncStatus');
      if (statusEl) {
        statusEl.style.display = 'none';
      }
      console.log('Popup: CSV URL not configured, using file upload mode');
    }
    
    // Load from storage (either file upload or fallback)
    // First check if background fetched CSV that needs parsing
    const csvStorage = await chrome.storage.local.get(['csvContent', 'csvNeedsParsing', 'lastCSVUpdate']);
    if (csvStorage.csvNeedsParsing && csvStorage.csvContent) {
      try {
        console.log('Popup: Found background-fetched CSV that needs parsing, length:', csvStorage.csvContent.length);
        // Parse CSV that was fetched by background
        const parsedVehicles = await csvParser.parseCSV(csvStorage.csvContent);
        vehicles = parsedVehicles;
        console.log('Popup: Parsed', vehicles.size, 'vehicles from background CSV');
        
        // Store parsed vehicles
        const vehiclesObj = {};
        vehicles.forEach((vehicle, vin) => {
          vehiclesObj[vin] = vehicle;
        });
        
        const parseResponse = await chrome.runtime.sendMessage({
          action: 'parseCSV',
          data: { vehicles: vehiclesObj }
        });
        
        if (!parseResponse.success) {
          throw new Error(parseResponse.error || 'Failed to store parsed vehicles');
        }
        
        // Clear the needs parsing flag
        await chrome.storage.local.set({ csvNeedsParsing: false });
        
        // Update sync status
        if (csvStorage.lastCSVUpdate) {
          updateCSVSyncStatus('success', `Synced ${new Date(csvStorage.lastCSVUpdate).toLocaleTimeString()}`);
        }
        
        // Load photos
        if (vehicles.size > 0) {
          document.getElementById('emptyState').classList.add('hidden');
          const gallery = document.getElementById('photoGallery');
          gallery.style.display = 'grid';
          await loadPhotosFromCSV();
          showStatus('photoStatus', `Loaded ${vehicles.size} vehicles from auto-sync`, 'success');
        } else {
          showEmptyState();
          showStatus('photoStatus', 'CSV loaded but no vehicles found', 'error');
        }
        return;
      } catch (error) {
        console.error('Popup: Failed to parse CSV from background:', error);
        showStatus('photoStatus', `Failed to parse CSV: ${error.message}`, 'error');
        // Fall through to load from vehicles storage
      }
    } else if (storage.csvSource === 'url' && storage.csvUrl) {
      // If using URL source but no background CSV found, log it
      console.log('Popup: Using URL source but no background CSV found', {
        hasContent: !!csvStorage.csvContent,
        needsParsing: csvStorage.csvNeedsParsing,
        lastUpdate: csvStorage.lastCSVUpdate
      });
    }
    
    const response = await chrome.runtime.sendMessage({ action: 'getVehicleData' });
    if (response.success && response.data.vehicles && Object.keys(response.data.vehicles).length > 0) {
      // Restore vehicles from storage
      vehicles = new Map(Object.entries(response.data.vehicles));
      
      if (vehicles.size > 0) {
        // Show photo gallery
        document.getElementById('emptyState').classList.add('hidden');
        const gallery = document.getElementById('photoGallery');
        gallery.style.display = 'grid';
        
        // Auto-load photos from CSV
        await loadPhotosFromCSV();
      } else {
        // Show empty state
        showEmptyState();
      }
    } else {
      // No data loaded, show empty state
      showEmptyState();
    }
  } catch (error) {
    console.error('Failed to load vehicle data:', error);
    showEmptyState();
  }
}

/**
 * Show empty state when no vehicles are loaded
 */
function showEmptyState() {
  const emptyState = document.getElementById('emptyState');
  const gallery = document.getElementById('photoGallery');
  
  if (emptyState) {
    emptyState.classList.remove('hidden');
  }
  if (gallery) {
    gallery.style.display = 'none';
    gallery.innerHTML = '';
  }
  const status = document.getElementById('photoStatus');
  if (status) {
    status.textContent = '';
    status.className = 'status';
  }
}

async function handleCSVUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Update file name display
  document.getElementById('csvFileName').textContent = file.name;
  
  showLoading('Loading CSV file...');
  
  try {
    const csvContent = await readFileAsText(file);
    
    // Parse CSV in popup (utilities available here)
    const parsedVehicles = await csvParser.parseCSV(csvContent);
    vehicles = parsedVehicles;
    
    // Store in background for content script
    const vehiclesObj = {};
    vehicles.forEach((vehicle, vin) => {
      vehiclesObj[vin] = vehicle;
    });
    
    const response = await chrome.runtime.sendMessage({
      action: 'parseCSV',
      data: { vehicles: vehiclesObj }
    });
    
    if (response.success) {
      showStatus('csvStatus', `Successfully loaded ${vehicles.size} vehicles`, 'success');
      
      // Store CSV file name and update source
      await chrome.storage.local.set({ 
        csvFileName: file.name,
        csvSource: 'file',
        lastCSVUpdate: new Date().toISOString()
      });
      
      // If we're in settings, close and show main panel
      const settingsPanel = document.getElementById('settingsPanel');
      if (!settingsPanel.classList.contains('hidden')) {
        setTimeout(() => {
          toggleSettings();
          // Auto-load photos after closing settings
          autoLoadCSVAndPhotos();
        }, 1000);
      } else {
        // Already in main view, just load photos
        await loadPhotosFromCSV();
      }
    } else {
      showStatus('csvStatus', 'Error: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('csvStatus', 'Error reading file: ' + error.message, 'error');
  } finally {
    hideLoading();
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

async function loadPhotosFromCSV() {
  const gallery = document.getElementById('photoGallery');
  gallery.innerHTML = '';
  
  // Reload vehicles from storage first
  const response = await chrome.runtime.sendMessage({ action: 'getVehicleData' });
  if (response.success && response.data.vehicles) {
    vehicles = new Map(Object.entries(response.data.vehicles));
  }
  
  if (vehicles.size === 0) {
    showEmptyState();
    showStatus('photoStatus', 'No vehicles loaded. Please configure CSV in settings.', 'error');
    return;
  }
  
  showStatus('photoStatus', 'Loading vehicles from CSV...', 'info');
  document.getElementById('emptyState').classList.add('hidden');
  gallery.style.display = 'grid';
  
  let loadedCount = 0;
  let withPhotosCount = 0;
  let errorCount = 0;
  const vehicleArray = Array.from(vehicles.values());
  
  // Display ALL vehicles, even those without images
  for (const vehicle of vehicleArray) {
    try {
      let imageSrc;
      if (vehicle.imageUrl) {
        imageSrc = vehicle.imageUrl;
        withPhotosCount++;
      } else {
        // Create a placeholder image for vehicles without photos
        // Using a simple SVG data URI as placeholder
        imageSrc = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="150" fill="#e0e0e0"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#999">
              ${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}
            </text>
            <text x="50%" y="65%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#bbb">
              No Photo
            </text>
          </svg>
        `);
      }
      
      const photoItem = createPhotoItem(imageSrc, vehicle);
      gallery.appendChild(photoItem);
      loadedCount++;
    } catch (error) {
      console.error('Failed to load vehicle:', vehicle.vin, error);
      errorCount++;
    }
  }
  
  // Show status with detailed counts
  if (loadedCount > 0) {
    const photoText = withPhotosCount > 0 ? ` (${withPhotosCount} with photos)` : '';
    showStatus('photoStatus', `Loaded ${loadedCount} vehicle${loadedCount !== 1 ? 's' : ''}${photoText}`, 'success');
  } else if (errorCount > 0) {
    showStatus('photoStatus', 'Failed to load vehicles. Please check the console for errors.', 'error');
  } else {
    showStatus('photoStatus', 'No vehicles found in CSV.', 'info');
  }
}

async function handlePhotoUpload(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;
  
  const gallery = document.getElementById('photoGallery');
  gallery.innerHTML = '';
  
  showStatus('photoStatus', 'Processing photos...', 'info');
  
  for (const file of files) {
    try {
      const vin = await vinMatcher.extractVIN(file);
      if (vin) {
        const vehicle = vehicles.get(vin);
        if (vehicle) {
          const photoItem = createPhotoItem(URL.createObjectURL(file), vehicle, file);
          gallery.appendChild(photoItem);
        } else {
          showStatus('photoStatus', `No vehicle found for VIN: ${vin}`, 'error');
        }
      } else {
        showStatus('photoStatus', `Could not extract VIN from: ${file.name}`, 'error');
      }
    } catch (error) {
      console.error('Error processing photo:', error);
    }
  }
}

function createPhotoItem(imageSrc, vehicle, file = null) {
  const item = document.createElement('div');
  item.className = 'photo-item';
  item.dataset.vin = vehicle.vin;
  
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  
  // Only hide on error if it's not a placeholder (data URI)
  img.onerror = () => {
    // If it's a real image URL that failed, replace with placeholder
    if (!imageSrc.startsWith('data:')) {
      img.src = 'data:image/svg+xml;base64,' + btoa(`
        <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" fill="#e0e0e0"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#999">
            ${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}
          </text>
          <text x="50%" y="65%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#bbb">
            Image Failed
          </text>
        </svg>
      `);
    }
  };
  
  const overlay = document.createElement('div');
  overlay.className = 'photo-overlay';
  overlay.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  
  item.appendChild(img);
  item.appendChild(overlay);
  
  item.addEventListener('click', () => selectPhoto(item, vehicle, file));
  
  return item;
}

/**
 * Fetch all vehicle photos from the dealer website by VIN.
 * Runs asynchronously after a vehicle is selected — updates selectedPhotoData when done.
 */
async function fetchDealerPhotos(vin, photoElement, csvUrls, file) {
  try {
    const storage = await chrome.storage.local.get(['dealerWebsiteUrls', 'dealerWebsiteUrl']);
    
    // Support both new array format and legacy single-URL format
    let dealerUrls = storage.dealerWebsiteUrls || [];
    if (!Array.isArray(dealerUrls)) dealerUrls = [dealerUrls];
    if (dealerUrls.length === 0 && storage.dealerWebsiteUrl) {
      dealerUrls = [storage.dealerWebsiteUrl];
    }
    dealerUrls = dealerUrls.filter(u => u && u.length > 0);
    
    if (dealerUrls.length === 0) {
      console.log('No dealer website URLs configured — using CSV photos only');
      showStatus('photoStatus', '⚠️ No dealer URLs configured. Add them in Settings to get all photos.', 'info');
      return;
    }
    
    showStatus('photoStatus', `🔍 Searching ${dealerUrls.length} dealer site(s) for photos...`, 'info');
    
    // Show loading badge on the photo element
    let badge = photoElement.querySelector('.dealer-photo-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'dealer-photo-badge';
      badge.style.cssText = 'position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.8);color:#fbbf24;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;z-index:10;';
      photoElement.style.position = 'relative';
      photoElement.appendChild(badge);
    }
    badge.textContent = `⏳ Fetching photos (${dealerUrls.length} site${dealerUrls.length > 1 ? 's' : ''})...`;
    
    console.log(`Fetching dealer photos for VIN ${vin} from ${dealerUrls.length} site(s)...`);
    
    // Try each dealer URL until we find photos
    let foundPhotos = [];
    let matchedUrl = null;
    
    for (const dealerUrl of dealerUrls) {
      try {
        console.log(`  Trying ${dealerUrl}...`);
        const response = await chrome.runtime.sendMessage({
          action: 'fetchDealerPhotos',
          data: { vin, dealerUrl }
        });
        
        if (response?.success && response.photoUrls?.length > 0) {
          foundPhotos = response.photoUrls;
          matchedUrl = dealerUrl;
          console.log(`  ✓ Found ${foundPhotos.length} photos on ${dealerUrl}`);
          break; // Found photos, no need to try more sites
        } else {
          console.log(`  ✗ No photos on ${dealerUrl}: ${response?.error || 'empty'}`);
        }
      } catch (err) {
        console.warn(`  ✗ Error fetching from ${dealerUrl}:`, err.message);
      }
    }
    
    if (foundPhotos.length === 0) {
      console.warn('No dealer photos found on any configured site');
      badge.textContent = '📷 ' + csvUrls.length + ' photos (CSV only)';
      badge.style.color = '#94a3b8';
      showStatus('photoStatus', '⚠️ No photos found on dealer websites for this VIN.', 'info');
      return;
    }
    
    // Merge dealer photos with CSV photos, dedup
    const allUrls = [...new Set([...csvUrls, ...foundPhotos])];
    console.log(`Dealer photos: ${foundPhotos.length} from ${matchedUrl}, ${allUrls.length} total`);
    
    // Update stored photo data
    chrome.storage.local.set({
      selectedPhotoData: {
        hasFile: !!file,
        imageUrl: allUrls[0] || null,
        imageUrls: allUrls,
        vin: vin
      }
    });
    
    // Update badge
    badge.textContent = `📷 ${allUrls.length} photos`;
    badge.style.color = '#34d399';
    showStatus('photoStatus', `✅ Found ${foundPhotos.length} photos from dealer website!`, 'success');
    
    // Auto-hide after 6s
    setTimeout(() => { badge.style.opacity = '0.5'; }, 6000);
    
  } catch (error) {
    console.error('Failed to fetch dealer photos:', error);
    showStatus('photoStatus', `❌ Dealer photo fetch error: ${error.message}`, 'error');
  }
}

function selectPhoto(photoElement, vehicle, file) {
  // Remove previous selection
  document.querySelectorAll('.photo-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Select new photo
  photoElement.classList.add('selected');
  selectedVehicle = vehicle;
  selectedPhoto = file;
  
  // Build base image URLs from CSV
  const csvUrls = vehicle.imageUrls || (vehicle.imageUrl ? [vehicle.imageUrl] : []);
  
  // Store CSV-only data immediately so the form can be filled while dealer photos load
  chrome.storage.local.set({
    selectedPhotoData: {
      hasFile: !!file,
      imageUrl: vehicle.imageUrl || csvUrls[0] || null,
      imageUrls: csvUrls,
      vin: vehicle.vin
    }
  });
  
  // Show photo count badge immediately with CSV count
  if (csvUrls.length > 0) {
    let badge = photoElement.querySelector('.dealer-photo-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'dealer-photo-badge';
      badge.style.cssText = 'position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.8);color:#38bdf8;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;z-index:10;';
      photoElement.style.position = 'relative';
      photoElement.appendChild(badge);
    }
    badge.textContent = `📷 ${csvUrls.length} photos`;
  }
  
  // Auto-fetch MORE photos from dealer website (async, non-blocking)
  if (vehicle.vin) {
    fetchDealerPhotos(vehicle.vin, photoElement, csvUrls, file);
  }
  
  // Collapse the photo gallery - remove all vehicles except the selected one from DOM
  const gallery = document.getElementById('photoGallery');
  const photoSection = document.getElementById('photoSection');
  const photoSectionHeading = photoSection.querySelector('h2');
  const allItems = Array.from(gallery.querySelectorAll('.photo-item'));
  
  // Store removed items so we can restore them later without reloading CSV
  removedGalleryItems = allItems.filter(item => item !== photoElement);
  
  // Remove all items except the selected one from the DOM
  // This ensures CSS Grid doesn't calculate space for hidden items
  removedGalleryItems.forEach(item => {
    item.remove(); // Remove from DOM completely
  });
  
  // Show back button
  const backBtn = document.getElementById('backToGalleryBtn');
  if (backBtn) {
    backBtn.classList.remove('hidden');
    backBtn.style.display = 'block';
  }
  
  // Reset and style the selected photoElement
  photoElement.style.removeProperty('display');
  photoElement.style.removeProperty('visibility');
  photoElement.style.removeProperty('opacity');
  photoElement.style.setProperty('width', '100%', 'important');
  photoElement.style.setProperty('max-width', '200px', 'important');
  photoElement.style.setProperty('margin', '0 auto', 'important');
  
  // Update gallery to show only selected vehicle - minimize space
  gallery.style.setProperty('grid-template-columns', '1fr', 'important');
  gallery.style.setProperty('justify-items', 'center', 'important');
  gallery.style.setProperty('max-height', '220px', 'important');
  gallery.style.setProperty('min-height', '200px', 'important');
  gallery.style.setProperty('padding', '8px 0', 'important');
  gallery.style.setProperty('margin-top', '0', 'important');
  
  // Minimize photo section padding and hide heading
  photoSection.style.padding = '8px 16px';
  photoSection.style.marginBottom = '0';
  if (photoSectionHeading) {
    photoSectionHeading.style.display = 'none';
  }
  
  // Display vehicle info
  displayVehicleInfo(vehicle);
  
  // Clear any previously generated description for the previous vehicle
  const descriptionTextarea = document.getElementById('generatedDescription');
  const descriptionResult = document.getElementById('descriptionResult');
  if (descriptionTextarea) {
    descriptionTextarea.value = '';
  }
  if (descriptionResult) {
    descriptionResult.classList.add('hidden');
  }
  
  // Save vehicle data (with mileage) so content script can use it
  // Make sure to preserve all vehicle properties including mileage
  const vehicleToSave = {
    ...vehicle, // Spread to ensure all properties are included
    mileage: vehicle.mileage || null, // Explicitly ensure mileage is included
    mileageUnit: vehicle.mileageUnit || 'miles'
  };
  
  // Debug: Log what we're saving
  console.log('Saving vehicle data:', {
    vin: vehicleToSave.vin,
    make: vehicleToSave.make,
    model: vehicleToSave.model,
    mileage: vehicleToSave.mileage,
    mileageUnit: vehicleToSave.mileageUnit,
    hasMileage: !!vehicleToSave.mileage
  });
  
  chrome.runtime.sendMessage({
    action: 'saveVehicleData',
    data: {
      vehicle: vehicleToSave,
      description: '', // Clear description
      photo: file
    }
  }).catch(err => console.error('Failed to save vehicle data:', err));
  
  // Show vehicle and AI sections
  document.getElementById('vehicleSection').classList.remove('hidden');
  document.getElementById('aiSection').classList.remove('hidden');
  document.getElementById('actionSection').classList.remove('hidden');
}

function displayVehicleInfo(vehicle) {
  document.getElementById('vehicleVin').textContent = vehicle.vin || 'N/A';
  document.getElementById('vehicleYear').textContent = vehicle.year || 'N/A';
  document.getElementById('vehicleMake').textContent = vehicle.make || 'N/A';
  document.getElementById('vehicleModel').textContent = vehicle.model || 'N/A';
  document.getElementById('vehicleTrim').textContent = vehicle.trim || 'N/A';
  document.getElementById('vehiclePrice').value = vehicle.price ? `$${vehicle.price}` : '';
  document.getElementById('vehicleMileage').textContent = 
    vehicle.mileage ? `${vehicle.mileage} ${vehicle.mileageUnit || 'miles'}` : 'N/A';
  document.getElementById('vehicleColor').textContent = vehicle.color || 'N/A';
}

/**
 * Restore gallery view - show all vehicles again without reloading CSV
 */
function restoreGalleryView() {
  const gallery = document.getElementById('photoGallery');
  const photoSection = document.getElementById('photoSection');
  const photoSectionHeading = photoSection.querySelector('h2');
  const backBtn = document.getElementById('backToGalleryBtn');
  
  // Restore all removed items back to the gallery
  if (removedGalleryItems.length > 0) {
    removedGalleryItems.forEach(item => {
      // Reset item styles
      item.style.removeProperty('display');
      item.style.removeProperty('visibility');
      item.style.removeProperty('opacity');
      item.style.removeProperty('width');
      item.style.removeProperty('max-width');
      item.style.removeProperty('margin');
      item.classList.remove('selected');
      // Append back to gallery
      gallery.appendChild(item);
    });
    removedGalleryItems = []; // Clear the stored items
  }
  
  // Reset gallery styles to show all vehicles
  gallery.style.setProperty('grid-template-columns', 'repeat(auto-fill, minmax(120px, 1fr))', 'important');
  gallery.style.setProperty('justify-items', 'stretch', 'important');
  gallery.style.setProperty('max-height', '516px', 'important');
  gallery.style.setProperty('min-height', '516px', 'important');
  gallery.style.setProperty('padding', '', 'important');
  gallery.style.setProperty('margin-top', '16px', 'important');
  
  // Reset photo section padding and show heading
  photoSection.style.padding = '';
  photoSection.style.marginBottom = '';
  if (photoSectionHeading) {
    photoSectionHeading.style.display = 'block';
  }
  
  // Hide back button
  if (backBtn) {
    backBtn.classList.add('hidden');
    backBtn.style.display = 'none';
  }
  
  // Hide vehicle and AI sections
  document.getElementById('vehicleSection').classList.add('hidden');
  document.getElementById('aiSection').classList.add('hidden');
  document.getElementById('actionSection').classList.add('hidden');
  
  // Clear selection
  selectedVehicle = null;
  selectedPhoto = null;
}

async function generateDescription() {
  if (!selectedVehicle) {
    showStatus('photoStatus', 'Please select a vehicle first', 'error');
    return;
  }
  
  const prompt = document.getElementById('aiPrompt').value.trim();
  if (!prompt) {
    showStatus('photoStatus', 'Please enter an AI prompt', 'error');
    return;
  }
  
  const generateBtn = document.getElementById('generateBtn');
  const generateBtnText = document.getElementById('generateBtnText');
  const generateBtnSpinner = document.getElementById('generateBtnSpinner');
  
  generateBtn.disabled = true;
  generateBtnText.textContent = 'Generating...';
  generateBtnSpinner.classList.remove('hidden');
  
  try {
    // Get updated price
    const priceInput = document.getElementById('vehiclePrice').value;
    const updatedVehicle = { ...selectedVehicle };
    if (priceInput) {
      updatedVehicle.price = priceInput.replace(/[^0-9]/g, '');
    }
    
    const response = await chrome.runtime.sendMessage({
      action: 'generateDescription',
      data: {
        vehicleData: updatedVehicle,
        userPrompt: prompt
      }
    });
    
    if (response.success) {
      document.getElementById('generatedDescription').value = response.description;
      document.getElementById('descriptionResult').classList.remove('hidden');
      
      // Ensure mileage is preserved when saving
      const vehicleToSave = {
        ...updatedVehicle,
        mileage: updatedVehicle.mileage || selectedVehicle?.mileage || null,
        mileageUnit: updatedVehicle.mileageUnit || selectedVehicle?.mileageUnit || 'miles'
      };
      
      // Debug: Log what we're saving
      console.log('Saving vehicle data with description:', {
        vin: vehicleToSave.vin,
        mileage: vehicleToSave.mileage,
        hasMileage: !!vehicleToSave.mileage
      });
      
      // Save for content script
      await chrome.runtime.sendMessage({
        action: 'saveVehicleData',
        data: {
          vehicle: vehicleToSave,
          description: response.description,
          photo: selectedPhoto
        }
      });
    } else {
      showStatus('photoStatus', 'Error: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('photoStatus', 'Error generating description: ' + error.message, 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtnText.textContent = 'Generate Description';
    generateBtnSpinner.classList.add('hidden');
  }
}

async function copyDescription() {
  const textarea = document.getElementById('generatedDescription');
  try {
    await navigator.clipboard.writeText(textarea.value);
    showStatus('photoStatus', 'Description copied to clipboard', 'success');
  } catch (error) {
    // Fallback for older browsers
    textarea.select();
    document.execCommand('copy');
    showStatus('photoStatus', 'Description copied to clipboard', 'success');
  }
}

function openMarketplace() {
  chrome.tabs.create({ url: 'https://www.facebook.com/marketplace/create/vehicle' });
  document.getElementById('fillFormBtn').classList.remove('hidden');
}

/**
 * Update the form fill progress bar
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} stage - Current stage description
 */
function updateFormFillProgress(progress, stage) {
  const btn = document.getElementById('fillFormBtn');
  const progressBar = document.getElementById('btnProgress');
  const btnText = document.getElementById('btnText');
  
  if (!btn || !progressBar || !btnText) return;
  
  // Clamp progress between 0 and 100
  progress = Math.max(0, Math.min(100, progress));
  
  // Update progress bar width
  progressBar.style.width = `${progress}%`;
  
  // Update button text with stage info
  if (stage) {
    btnText.textContent = stage;
  }
  
  // Add running class
  btn.classList.add('running');
  btn.disabled = true;
}

/**
 * Reset the form fill progress bar
 */
function resetFormFillProgress() {
  const btn = document.getElementById('fillFormBtn');
  const progressBar = document.getElementById('btnProgress');
  const btnText = document.getElementById('btnText');
  
  if (!btn || !progressBar || !btnText) return;
  
  progressBar.style.width = '0%';
  btnText.textContent = 'Fill Marketplace Form';
  btn.classList.remove('running', 'complete', 'error');
  btn.disabled = false;
}

/**
 * Mark form fill as complete
 */
function completeFormFill(success = true) {
  const btn = document.getElementById('fillFormBtn');
  const btnText = document.getElementById('btnText');
  
  if (!btn || !btnText) return;
  
  btn.classList.remove('running');
  if (success) {
    btn.classList.add('complete');
    btnText.textContent = '✓ Form Filled Successfully';
  } else {
    btn.classList.add('error');
    btnText.textContent = '✗ Form Fill Failed';
  }
  
  // Reset after 3 seconds
  setTimeout(() => {
    resetFormFillProgress();
  }, 3000);
}

async function fillMarketplaceForm() {
  // Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('facebook.com/marketplace')) {
    showStatus('photoStatus', 'Please navigate to Facebook Marketplace first', 'error');
    return;
  }
  
  // Check if on create page
  if (!tab.url.includes('/marketplace/create') && !tab.url.includes('/marketplace/sell')) {
    showStatus('photoStatus', 'Please navigate to the Create Listing page: facebook.com/marketplace/create/vehicle', 'error');
    // Offer to open it
    const openCreate = confirm('Would you like to open the Create Listing page?');
    if (openCreate) {
      chrome.tabs.update(tab.id, { url: 'https://www.facebook.com/marketplace/create/vehicle' });
    }
    return;
  }
  
  if (!selectedVehicle) {
    showStatus('photoStatus', 'Please select a vehicle first', 'error');
    return;
  }
  
  // Check if description exists in textarea or will be loaded from storage by content script
  const descriptionTextarea = document.getElementById('generatedDescription');
  const hasDescription = descriptionTextarea && descriptionTextarea.value.trim().length > 0;
  
  if (!hasDescription) {
    // Content script will load from storage, but warn user if nothing is visible
    console.log('No description in textarea, content script will try to load from storage');
  }
  
  // Reset and start progress
  resetFormFillProgress();
  updateFormFillProgress(5, 'Initializing...');
  
  showStatus('photoStatus', 'Filling form...', 'info');
  
  // Ensure content script is injected
  try {
    // Try to inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (injectError) {
      // Script might already be injected, that's okay
      console.log('Script injection note:', injectError.message);
    }
    
    // Wait for script to initialize
    updateFormFillProgress(10, 'Loading script...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Try to ping the content script first
    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
      console.log('Content script ping successful');
      updateFormFillProgress(15, 'Script ready...');
    } catch (pingError) {
      // If ping fails, try fillForm anyway
      console.log('Ping failed, trying fillForm directly:', pingError.message);
    }
    
    // Send message to fill form with timeout
    // Content script can take up to 60s to wait for form + time to fill fields
    console.log('Sending fillForm message, waiting up to 90 seconds...');
    showStatus('photoStatus', 'Filling form... This may take up to 90 seconds. Check console (F12) for progress.', 'info');
    updateFormFillProgress(20, 'Waiting for form...');
    
    const fillPromise = chrome.tabs.sendMessage(tab.id, { action: 'fillForm' });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout waiting for form fill')), 90000) // 90 seconds total
    );
    
    response = await Promise.race([fillPromise, timeoutPromise]);
    console.log('Form fill response received:', response);
    
    if (response && response.success) {
      updateFormFillProgress(100, 'Complete!');
      completeFormFill(true);
      showStatus('photoStatus', 'Form filled successfully! Review and submit.', 'success');
    } else if (response && response.error) {
      completeFormFill(false);
      showStatus('photoStatus', 'Error: ' + response.error, 'error');
    } else {
      updateFormFillProgress(95, 'Almost done...');
      completeFormFill(true);
      showStatus('photoStatus', 'Form fill attempted. Check browser console (F12) for details.', 'info');
    }
  } catch (error) {
    console.error('Error filling form:', error);
    completeFormFill(false);
    if (error.message && (error.message.includes('Could not establish connection') || 
        error.message.includes('Receiving end does not exist'))) {
      showStatus('photoStatus', 'Error: Content script not loaded. Please refresh the Marketplace page and try again.', 'error');
    } else if (error.message && error.message.includes('Timeout')) {
      updateFormFillProgress(90, 'Timed out...');
      showStatus('photoStatus', 'Form fill timed out after 90 seconds. The form may still be filling - check the page and browser console (F12) for details.', 'info');
    } else {
      showStatus('photoStatus', 'Error: ' + (error.message || 'Make sure you are on the Marketplace create page.'), 'error');
    }
  }
}

function showStatus(elementId, message, type) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.className = `status ${type}`;
  element.style.display = 'block';
  
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
}

function showLoading(text = 'Loading...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

