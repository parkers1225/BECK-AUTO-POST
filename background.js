/**
 * Background Service Worker
 * Handles CSV file processing, storage, and API calls
 */

// Note: Utilities are loaded in popup.js, background.js handles messaging only
// CSV parsing and AI calls are delegated to popup or handled via fetch

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.action) {
      case 'parseCSV':
        await handleParseCSV(request.data, sendResponse);
        break;
      
      case 'generateDescription':
        await handleGenerateDescription(request.data, sendResponse);
        break;
      
      case 'saveVehicleData':
        await handleSaveVehicleData(request.data, sendResponse);
        break;
      
      case 'getVehicleData':
        await handleGetVehicleData(request.data, sendResponse);
        break;
      
      case 'saveSettings':
        await handleSaveSettings(request.data, sendResponse);
        break;
      
      case 'getSettings':
        await handleGetSettings(sendResponse);
        break;
      
      case 'fetchImage':
        await handleFetchImage(request.data, sendResponse);
        break;
      
      case 'downloadPhotos':
        await handleDownloadPhotos(request.data, sendResponse);
        break;
      
      case 'fetchDealerPhotos':
        await handleFetchDealerPhotos(request.data, sendResponse);
        break;
      
      case 'storeScrapedPhotos':
        await handleStoreScrapedPhotos(request.data, sendResponse);
        break;
      
      case 'getScrapedPhotos':
        await handleGetScrapedPhotos(request.data, sendResponse);
        break;
      
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Background error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Parse CSV file
 * Note: Actual parsing happens in popup, this just stores the result
 */
async function handleParseCSV(data, sendResponse) {
  try {
    // Store parsed vehicles (already parsed in popup)
    if (data.vehicles) {
      const vehiclesObj = {};
      if (data.vehicles instanceof Map) {
        data.vehicles.forEach((vehicle, vin) => {
          vehiclesObj[vin] = vehicle;
        });
      } else if (Array.isArray(data.vehicles)) {
        data.vehicles.forEach(vehicle => {
          if (vehicle.vin) {
            vehiclesObj[vehicle.vin] = vehicle;
          }
        });
      } else {
        Object.assign(vehiclesObj, data.vehicles);
      }
      
      await chrome.storage.local.set({ vehicles: vehiclesObj });
      sendResponse({ 
        success: true, 
        vehicleCount: Object.keys(vehiclesObj).length
      });
    } else {
      sendResponse({ success: false, error: 'No vehicle data provided' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Generate AI description
 * Makes API call directly since AIService class is not available in background
 */
async function handleGenerateDescription(data, sendResponse) {
  try {
    // Descriptions are generated server-side by the proxy, which holds the
    // Anthropic key in its env. The extension just forwards the rep's access
    // code — the key is never stored in or shipped with the extension.
    const store = await chrome.storage.local.get(['accessCode', 'beckSettings', 'proxyUrl']);
    const base = ((store.beckSettings && store.beckSettings.proxyUrl) || store.proxyUrl ||
      'https://beck-sftp-proxy-production.up.railway.app').replace(/\/+$/, '');

    const response = await fetch(`${base}/generate-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Access-Code': store.accessCode || '' },
      body: JSON.stringify({ vehicleData: data.vehicleData, userPrompt: data.userPrompt })
    });

    if (response.status === 401) {
      sendResponse({ success: false, error: 'Your access code is invalid or was turned off.' });
      return;
    }
    if (!response.ok) {
      let msg = `Server error ${response.status}`;
      try { const e = await response.json(); if (e && e.error) msg = e.error; } catch (_) {}
      sendResponse({ success: false, error: msg });
      return;
    }

    const out = await response.json();
    sendResponse({ success: true, description: (out && out.description) || '' });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Save vehicle data
 */
async function handleSaveVehicleData(data, sendResponse) {
  try {
    await chrome.storage.local.set({ 
      selectedVehicle: data.vehicle,
      generatedDescription: data.description
    });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Get vehicle data
 */
async function handleGetVehicleData(data, sendResponse) {
  try {
    const result = await chrome.storage.local.get(['vehicles', 'selectedVehicle']);
    sendResponse({ success: true, data: result });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Save settings
 */
async function handleSaveSettings(data, sendResponse) {
  try {
    const settingsToSave = {
      aiApiKey: data.apiKey,
      aiService: data.service || 'openai'
    };
    
    // Save CSV settings if provided
    if (data.csvUrl !== undefined) {
      settingsToSave.csvUrl = data.csvUrl;
    }
    if (data.csvApiKey !== undefined) {
      settingsToSave.csvApiKey = data.csvApiKey;
    }
    if (data.csvSource !== undefined) {
      settingsToSave.csvSource = data.csvSource;
    }
    if (data.autoRefreshEnabled !== undefined) {
      settingsToSave.autoRefreshEnabled = data.autoRefreshEnabled;
    }
    if (data.autoRefreshInterval !== undefined) {
      settingsToSave.autoRefreshInterval = data.autoRefreshInterval;
    }
    if (data.dealerWebsiteUrls !== undefined) {
      settingsToSave.dealerWebsiteUrls = data.dealerWebsiteUrls;
    }
    
    await chrome.storage.local.set(settingsToSave);
    
    // Setup or clear alarm based on auto-refresh settings
    // Pass CSV settings so we can fetch immediately if configured
    await setupAutoRefreshAlarm(
      data.autoRefreshEnabled, 
      data.autoRefreshInterval,
      data.csvUrl,
      data.csvSource
    );
    
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Get settings
 */
async function handleGetSettings(sendResponse) {
  try {
    const settings = await chrome.storage.local.get([
      'aiApiKey', 
      'aiService',
      'csvUrl',
      'csvApiKey',
      'csvSource',
      'autoRefreshEnabled',
      'autoRefreshInterval'
    ]);
    sendResponse({ 
      success: true, 
      apiKey: settings.aiApiKey || '',
      service: settings.aiService || 'openai',
      csvUrl: settings.csvUrl || '',
      csvApiKey: settings.csvApiKey || '',
      csvSource: settings.csvSource || 'file',
      autoRefreshEnabled: settings.autoRefreshEnabled !== false,
      autoRefreshInterval: settings.autoRefreshInterval || 15
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
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
    console.error('Background: Error requesting permission:', error);
    return false;
  }
}

/**
 * Fetch image from URL and convert to base64 data URL
 * This bypasses CORS restrictions since background script has different permissions
 */
async function handleFetchImage(data, sendResponse) {
  try {
    const { imageUrl } = data;
    
    if (!imageUrl) {
      sendResponse({ success: false, error: 'No image URL provided' });
      return;
    }

    console.log('Background: Fetching image from:', imageUrl);
    
    // Validate URL is http/https (basic SSRF protection)
    try {
      const urlObj = new URL(imageUrl);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        sendResponse({ success: false, error: 'Invalid URL protocol - must be http or https' });
        return;
      }
      // Block obvious SSRF targets (private IPs, localhost)
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' ||
          hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
        sendResponse({ success: false, error: 'Cannot fetch from private network addresses' });
        return;
      }
    } catch (urlError) {
      sendResponse({ success: false, error: 'Invalid image URL: ' + urlError.message });
      return;
    }
    
    // Fetch the image - background script can bypass CORS
    // Use mode: 'no-cors' as fallback, but try normal fetch first
    let response;
    try {
      response = await fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
    } catch (fetchError) {
      console.warn('Background: CORS fetch failed, trying no-cors mode:', fetchError);
      // If CORS fails, try no-cors (but this returns opaque response)
      response = await fetch(imageUrl, { mode: 'no-cors' });
      
      if (!response.ok && response.type === 'opaque') {
        // Opaque responses always have ok=false, but might still work
        // Try to read as blob anyway
        try {
          const blob = await response.blob();
          if (blob.size > 0) {
            // Success with opaque response
            return convertBlobToDataURL(blob, sendResponse);
          }
        } catch (blobError) {
          throw new Error(`Failed to fetch image: ${fetchError.message}`);
        }
      }
    }
    
    if (!response || (!response.ok && response.type !== 'opaque')) {
      throw new Error(`Failed to fetch image: ${response?.status || 'unknown'} ${response?.statusText || 'unknown error'}`);
    }

    // Convert to blob
    const blob = await response.blob();
    
    if (!blob || blob.size === 0) {
      throw new Error('Received empty image blob');
    }
    
    // Convert blob to base64 data URL
    return convertBlobToDataURL(blob, sendResponse);
    
  } catch (error) {
    console.error('Background: Error fetching image:', error);
    sendResponse({ success: false, error: error.message || 'Unknown error fetching image' });
  }
}

/**
 * Download photos to user's Downloads folder as fallback for manual upload
 */
async function handleDownloadPhotos(data, sendResponse) {
  try {
    const { urls, vin } = data;
    if (!urls || urls.length === 0) {
      sendResponse({ success: false, error: 'No URLs provided' });
      return;
    }

    let downloadCount = 0;
    for (let i = 0; i < urls.length; i++) {
      try {
        const url = urls[i];
        const ext = url.match(/\.(jpg|jpeg|png|webp|gif)/i)?.[1] || 'jpg';
        const filename = `beck_auto_${vin}_photo_${i + 1}.${ext}`;
        
        await chrome.downloads.download({
          url: url,
          filename: filename,
          saveAs: false,
          conflictAction: 'uniquify'
        });
        downloadCount++;
      } catch (dlErr) {
        console.warn(`Background: Failed to download photo ${i + 1}:`, dlErr.message);
      }
    }

    sendResponse({ success: downloadCount > 0, count: downloadCount });
  } catch (error) {
    console.error('Background: Error downloading photos:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Store scraped photos from vAuto page by VIN
 */
async function handleStoreScrapedPhotos(data, sendResponse) {
  try {
    const { vin, photoUrls, timestamp, source } = data;
    if (!photoUrls || photoUrls.length === 0) {
      sendResponse({ success: false, error: 'No photo URLs provided' });
      return;
    }

    const existing = await chrome.storage.local.get(['scrapedPhotos']);
    const scrapedPhotos = existing.scrapedPhotos || {};

    if (vin) {
      // Merge with existing photos for this VIN (dedup)
      const prev = scrapedPhotos[vin]?.urls || [];
      const merged = [...new Set([...prev, ...photoUrls])];
      scrapedPhotos[vin] = { urls: merged, timestamp, source };
    }

    // Always store as _lastScraped so popup can offer a manual VIN match
    scrapedPhotos._lastScraped = { urls: photoUrls, timestamp, source, vin: vin || null };

    await chrome.storage.local.set({ scrapedPhotos });
    console.log(`Background: Stored ${photoUrls.length} scraped photos${vin ? ` for VIN ${vin}` : ''}`);
    sendResponse({ success: true, count: photoUrls.length });
  } catch (error) {
    console.error('Background: Error storing scraped photos:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Retrieve scraped photos for a given VIN
 */
async function handleGetScrapedPhotos(data, sendResponse) {
  try {
    const { vin } = data;
    const existing = await chrome.storage.local.get(['scrapedPhotos']);
    const scrapedPhotos = existing.scrapedPhotos || {};

    let urls = [];
    if (vin && scrapedPhotos[vin]) {
      urls = scrapedPhotos[vin].urls || [];
    } else if (scrapedPhotos._lastScraped) {
      // Fallback: offer the last scraped set if VIN doesn't match
      urls = scrapedPhotos._lastScraped.urls || [];
    }

    sendResponse({ success: true, urls, vin });
  } catch (error) {
    console.error('Background: Error getting scraped photos:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Fetch all vehicle photos from a dealer website by VIN.
 * Uses the Dealer.com catcher.esl?vin= redirect to reach the VDP,
 * then parses the HTML for photo URLs.
 */
async function handleFetchDealerPhotos(data, sendResponse) {
  try {
    const { vin, dealerUrl } = data;
    if (!vin || !dealerUrl) {
      sendResponse({ success: false, error: 'Missing VIN or dealer URL' });
      return;
    }

    // Check cache first
    const cacheKey = `dealerPhotos_${vin}`;
    const cached = await chrome.storage.local.get([cacheKey]);
    if (cached[cacheKey] && (Date.now() - cached[cacheKey].timestamp < 3600000)) { // 1hr cache
      console.log(`Background: Using cached dealer photos for ${vin} (${cached[cacheKey].urls.length} photos)`);
      sendResponse({ success: true, photoUrls: cached[cacheKey].urls });
      return;
    }

    let photoUrls = [];

    // === Strategy 1: Dealer.com media API (most reliable) ===
    try {
      const apiUrl = `${dealerUrl}/apis/widget/INVENTORY_LISTING_DEFAULT_AUTO_USED:inventory-702/vehicle/media/${vin}`;
      console.log(`Background: Trying Dealer.com media API for ${vin}`);
      const apiResp = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (apiResp.ok) {
        const apiData = await apiResp.json();
        const images = apiData?.images || apiData?.media?.images || [];
        for (const img of images) {
          const url = img?.uri || img?.url || img?.src || img?.href;
          if (url && url.startsWith('http') && isVehiclePhoto(url)) {
            photoUrls.push(normalizePhotoSize(url));
          }
        }
        console.log(`Background: API returned ${photoUrls.length} photos`);
      }
    } catch (apiErr) {
      console.log(`Background: Media API failed, trying other strategies...`);
    }

    // Try NEW vehicle API too if used inventory didn't work
    if (photoUrls.length < 5) {
      try {
        const apiUrl2 = `${dealerUrl}/apis/widget/INVENTORY_LISTING_DEFAULT_AUTO_NEW:inventory-702/vehicle/media/${vin}`;
        const apiResp2 = await fetch(apiUrl2, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (apiResp2.ok) {
          const apiData2 = await apiResp2.json();
          const images2 = apiData2?.images || apiData2?.media?.images || [];
          for (const img of images2) {
            const url = img?.uri || img?.url || img?.src || img?.href;
            if (url && url.startsWith('http') && isVehiclePhoto(url)) {
              photoUrls.push(normalizePhotoSize(url));
            }
          }
          console.log(`Background: New inventory API returned ${photoUrls.length} total photos`);
        }
      } catch (e) { /* skip */ }
    }

    // === Strategy 2: VDP page HTML scraping (fallback) ===
    if (photoUrls.length < 5) {
      try {
        const catcherUrl = `${dealerUrl}/catcher.esl?vin=${vin}`;
        console.log(`Background: Trying VDP HTML scrape for ${vin}: ${catcherUrl}`);
        const response = await fetch(catcherUrl, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        if (response.ok) {
          const html = await response.text();
          if (!html.includes('Access Denied')) {
            const htmlPhotos = extractPhotosFromHTML(html, vin);
            // Merge with any API results
            for (const url of htmlPhotos) {
              if (!photoUrls.includes(url)) photoUrls.push(url);
            }
            console.log(`Background: HTML scrape found ${htmlPhotos.length} photos, ${photoUrls.length} total`);
          } else {
            console.log('Background: VDP returned Access Denied, skipping HTML scrape');
          }
        }
      } catch (htmlErr) {
        console.log('Background: HTML scrape failed:', htmlErr.message);
      }
    }

    // === Strategy 3: Inventory search page (last resort) ===
    if (photoUrls.length < 5) {
      try {
        // Try both used and new inventory
        for (const invType of ['used-inventory', 'new-inventory']) {
          const searchUrl = `${dealerUrl}/${invType}/index.htm?search=${vin}`;
          console.log(`Background: Trying ${invType} search for ${vin}`);
          const searchResp = await fetch(searchUrl, {
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html'
            }
          });
          if (searchResp.ok) {
            const searchHtml = await searchResp.text();
            if (!searchHtml.includes('Access Denied')) {
              const searchPhotos = extractPhotosFromHTML(searchHtml, vin);
              for (const url of searchPhotos) {
                if (!photoUrls.includes(url)) photoUrls.push(url);
              }
              if (photoUrls.length >= 5) break;
            }
          }
        }
      } catch (searchErr) {
        console.log('Background: Inventory search failed:', searchErr.message);
      }
    }

    // Deduplicate
    photoUrls = [...new Set(photoUrls)];
    
    console.log(`Background: Total ${photoUrls.length} photos for VIN ${vin}`);

    // Cache results
    if (photoUrls.length > 0) {
      await chrome.storage.local.set({ [cacheKey]: { urls: photoUrls, timestamp: Date.now() } });
    }

    sendResponse({ success: true, photoUrls });
  } catch (error) {
    console.error('Background: Error fetching dealer photos:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Extract vehicle photo URLs from dealer website HTML.
 * Supports multiple patterns used by Dealer.com and other platforms.
 */
function extractPhotosFromHTML(html, vin) {
  const photoUrls = new Set();

  // ============================================================
  // Pattern 1: DDC.WS.state media objects (Dealer.com standard)
  // Matches: DDC.WS.state['ws-vehicle-media']['mediaX'] = {"media":{"images":[...]}}
  // ============================================================
  const ddcStatePattern = /DDC\.WS\.state\[['"]ws-vehicle-media['"]\]\[['"][^'"]+['"]\]\s*=\s*(\{[\s\S]*?\});/g;
  let match;
  while ((match = ddcStatePattern.exec(html)) !== null) {
    try {
      const stateObj = JSON.parse(match[1]);
      const images = stateObj?.media?.images || stateObj?.images || [];
      for (const img of images) {
        const url = img?.uri || img?.url || img?.src;
        if (url && url.startsWith('http')) {
          photoUrls.add(url);
        }
      }
    } catch (e) {
      // JSON parse failed — try regex extraction within this block
      const urlMatches = match[1].matchAll(/"uri"\s*:\s*"(https?:\/\/[^"]+)"/g);
      for (const m of urlMatches) {
        if (isVehiclePhoto(m[1])) photoUrls.add(m[1]);
      }
    }
  }

  // ============================================================
  // Pattern 2: JSON-LD structured data (common SEO markup)
  // ============================================================
  const jsonLdPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = jsonLdPattern.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(match[1]);
      const extractImages = (obj) => {
        if (!obj) return;
        if (obj.image) {
          const imgs = Array.isArray(obj.image) ? obj.image : [obj.image];
          for (const img of imgs) {
            const url = typeof img === 'string' ? img : img?.url;
            if (url && url.startsWith('http') && isVehiclePhoto(url)) photoUrls.add(url);
          }
        }
        if (obj.photo) {
          const photos = Array.isArray(obj.photo) ? obj.photo : [obj.photo];
          for (const p of photos) {
            const url = typeof p === 'string' ? p : p?.url || p?.contentUrl;
            if (url && url.startsWith('http') && isVehiclePhoto(url)) photoUrls.add(url);
          }
        }
      };
      if (Array.isArray(jsonData)) jsonData.forEach(extractImages);
      else extractImages(jsonData);
    } catch (e) { /* invalid JSON-LD, skip */ }
  }

  // ============================================================
  // Pattern 3: Direct image URL extraction (broad catch-all)
  // Matches common dealer photo CDN domains
  // ============================================================
  const knownCdnDomains = [
    'pictures.dealer.com',
    'assets.cai-media-management.com',
    'vehicle-photos-published.vauto.com',
    'cdn.dealermade.com',
    'homenetiol.com',
    'spincar.com'
  ];
  
  for (const domain of knownCdnDomains) {
    const domainRegex = new RegExp(`https?://[^"'\\s]*${domain.replace(/\./g, '\\.')}[^"'\\s]*\\.(?:jpg|jpeg|png|webp)`, 'gi');
    while ((match = domainRegex.exec(html)) !== null) {
      const url = match[0].replace(/&amp;/g, '&');
      if (isVehiclePhoto(url)) {
        // Upgrade to larger size where possible
        photoUrls.add(normalizePhotoSize(url));
      }
    }
  }

  // ============================================================
  // Pattern 4: Generic image gallery data attributes
  // data-src, data-image, data-photo-url, etc.
  // ============================================================
  const dataAttrPattern = /data-(?:src|image|photo-url|original|zoom-image|large-image)\s*=\s*["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
  while ((match = dataAttrPattern.exec(html)) !== null) {
    if (isVehiclePhoto(match[1])) {
      photoUrls.add(normalizePhotoSize(match[1]));
    }
  }

  return Array.from(photoUrls);
}

/** Check if URL looks like a vehicle photo (not a logo/icon/tracker) */
function isVehiclePhoto(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  const excludes = ['logo', 'icon', 'favicon', 'sprite', 'avatar', 'placeholder',
    'loading', 'spinner', 'google', 'facebook', 'analytics', '1x1', 'pixel', 'tracking',
    'beacon', 'badge', 'toolbar', 'button'];
  return !excludes.some(e => lower.includes(e));
}

/** Normalize photo URL to the largest available size */
function normalizePhotoSize(url) {
  // Dealer.com: upgrade resolution (e.g., /0480/ → /1280/)
  let normalized = url.replace(/\/\d{3,4}\//, '/1280/');
  // cai-media-management: upgrade resize
  normalized = normalized.replace(/\/resize\/\d+x\d+\//, '/resize/1024x1024/');
  return normalized;
}

/**
 * Helper to convert blob to base64 data URL
 */
function convertBlobToDataURL(blob, sendResponse) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      sendResponse({ 
        success: true, 
        dataUrl: base64data,
        mimeType: blob.type || 'image/jpeg',
        size: blob.size
      });
      resolve();
    };
    reader.onerror = (error) => {
      console.error('Background: FileReader error:', error);
      sendResponse({ success: false, error: 'Failed to convert image to base64' });
      reject(new Error('Failed to convert image to base64'));
    };
    reader.readAsDataURL(blob);
  });
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
 * Fetch CSV from URL in background
 */
async function fetchCSVInBackground() {
  try {
    const storage = await chrome.storage.local.get(['csvUrl', 'csvApiKey', 'csvSource', 'lastCSVHash']);
    
    if (storage.csvSource !== 'url' || !storage.csvUrl) {
      console.log('Background: CSV URL not configured, skipping fetch', {
        csvSource: storage.csvSource,
        hasUrl: !!storage.csvUrl
      });
      return;
    }
    
    console.log('Background: Fetching CSV from URL:', storage.csvUrl, {
      hasApiKey: !!storage.csvApiKey,
      lastHash: storage.lastCSVHash ? storage.lastCSVHash.substring(0, 8) + '...' : 'none'
    });
    
    // Build URL with API key if provided
    let fetchUrl = storage.csvUrl;
    try {
      if (storage.csvApiKey) {
        const urlObj = new URL(storage.csvUrl);
        urlObj.searchParams.set('apiKey', storage.csvApiKey);
        fetchUrl = urlObj.toString();
        console.log('Background: Added API key to URL');
      }
    } catch (urlError) {
      console.error('Background: Invalid URL format:', urlError);
      throw new Error(`Invalid CSV URL format: ${urlError.message}`);
    }
    
    // Build headers
    const headers = {
      'Accept': 'text/csv, text/plain, */*'
    };
    
    // Add API key to Authorization header if provided
    if (storage.csvApiKey) {
      headers['Authorization'] = `Bearer ${storage.csvApiKey}`;
      console.log('Background: Added API key to Authorization header');
    }
    
    // Request permission for CSV URL if needed
    const hasPermission = await requestHostPermission(fetchUrl);
    if (!hasPermission) {
      throw new Error('Permission denied to access CSV URL. Please grant permission when prompted.');
    }
    
    console.log('Background: Making fetch request to:', fetchUrl);
    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: headers,
      cache: 'no-cache'
    });
    
    console.log('Background: Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Background: Fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 200)
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText.substring(0, 100)}` : ''}`);
    }
    
    const csvContent = await response.text();
    console.log('Background: CSV content received, length:', csvContent.length);
    
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Get hash from response header if available, otherwise calculate it
    const responseHash = response.headers.get('X-CSV-Hash');
    const csvHash = responseHash || await calculateHash(csvContent);
    console.log('Background: CSV hash:', csvHash.substring(0, 16) + '...');
    
    // Check if CSV has changed
    if (storage.lastCSVHash === csvHash) {
      console.log('Background: CSV unchanged (hash matches), skipping update');
      // Still update the timestamp to show last check time
      await chrome.storage.local.set({
        lastCSVUpdate: new Date().toISOString()
      });
      return;
    }
    
    console.log('Background: CSV changed, storing for popup to parse...');
    
    // Parse CSV (simple parsing for background - just count vehicles)
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file is invalid (less than 2 lines)');
    }
    
    console.log('Background: CSV has', lines.length, 'lines');
    
    // Store CSV content and metadata
    const now = new Date().toISOString();
    await chrome.storage.local.set({
      csvContent: csvContent, // Store raw CSV for popup to parse
      lastCSVUpdate: now,
      lastCSVHash: csvHash,
      csvLastModified: response.headers.get('X-CSV-Last-Modified') || null,
      csvNeedsParsing: true // Flag for popup to re-parse
    });
    
    console.log(`Background: CSV updated successfully and stored (hash: ${csvHash.substring(0, 8)}..., ${lines.length} lines)`);
    
    // Notify popup if it's open (optional)
    try {
      chrome.runtime.sendMessage({
        action: 'csvUpdated',
        timestamp: now,
        hash: csvHash
      }).catch(() => {}); // Ignore if no listeners
    } catch (e) {
      // Ignore
    }
    
  } catch (error) {
    console.error('Background: Failed to fetch CSV:', error);
    console.error('Background: Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Don't throw - allow background refresh to continue
  }
}

/**
 * Setup auto-refresh alarm
 * @param {boolean} enabled - Whether auto-refresh is enabled
 * @param {number} intervalMinutes - Refresh interval in minutes
 * @param {string} csvUrl - CSV URL (optional, for immediate fetch)
 * @param {string} csvSource - CSV source type (optional, 'url' or 'file')
 */
async function setupAutoRefreshAlarm(enabled, intervalMinutes, csvUrl = null, csvSource = null) {
  // Clear existing alarm
  try {
    await chrome.alarms.clear('csvAutoRefresh');
    console.log('Background: Cleared existing auto-refresh alarm');
  } catch (e) {
    // Ignore if alarm doesn't exist
    console.log('Background: No existing alarm to clear');
  }
  
  if (enabled && intervalMinutes && intervalMinutes > 0) {
    // Create new alarm with initial delay to avoid immediate trigger
    // Also create a repeating alarm
    chrome.alarms.create('csvAutoRefresh', {
      delayInMinutes: intervalMinutes, // First trigger after interval
      periodInMinutes: intervalMinutes  // Then repeat every interval
    });
    console.log(`Background: Auto-refresh alarm set for every ${intervalMinutes} minutes`);
    
    // Verify alarm was created
    chrome.alarms.get('csvAutoRefresh', (alarm) => {
      if (alarm) {
        console.log('Background: Alarm verified:', alarm);
      } else {
        console.error('Background: Failed to create alarm!');
      }
    });
    
    // Also fetch immediately if CSV URL is configured (don't wait for first alarm)
    // Use passed parameters or fall back to storage
    let urlToFetch = csvUrl;
    let sourceToCheck = csvSource;
    
    if (!urlToFetch || !sourceToCheck) {
      const storage = await chrome.storage.local.get(['csvUrl', 'csvSource']);
      urlToFetch = urlToFetch || storage.csvUrl;
      sourceToCheck = sourceToCheck || storage.csvSource;
    }
    
    if (sourceToCheck === 'url' && urlToFetch) {
      console.log('Background: Fetching CSV immediately after setting up alarm...');
      fetchCSVInBackground().catch(err => {
        console.error('Background: Immediate CSV fetch failed:', err);
      });
    }
  } else {
    console.log('Background: Auto-refresh disabled');
  }
}

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Background: Alarm triggered:', alarm.name);
  if (alarm.name === 'csvAutoRefresh') {
    console.log('Background: Auto-refresh alarm triggered, fetching CSV...');
    fetchCSVInBackground().catch(err => {
      console.error('Background: Error in fetchCSVInBackground:', err);
    });
  }
});

// Install/update handler
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Facebook Marketplace Vehicle Auto-Poster installed');
  
  // Setup auto-refresh on install
  const storage = await chrome.storage.local.get(['autoRefreshEnabled', 'autoRefreshInterval', 'csvUrl', 'csvSource']);
  const enabled = storage.autoRefreshEnabled !== false;
  const interval = storage.autoRefreshInterval || 15;
  
  console.log('Background: Setting up auto-refresh on install:', { enabled, interval });
  await setupAutoRefreshAlarm(enabled, interval, storage.csvUrl, storage.csvSource);
  
  // Initial CSV fetch if URL is configured
  if (storage.csvSource === 'url' && storage.csvUrl) {
    console.log('Background: Performing initial CSV fetch on install');
    fetchCSVInBackground().catch(err => {
      console.error('Background: Initial CSV fetch failed:', err);
    });
  }
});

// Also setup on startup (service worker wake)
chrome.runtime.onStartup.addListener(async () => {
  console.log('Background: Extension started, setting up auto-refresh');
  const storage = await chrome.storage.local.get(['autoRefreshEnabled', 'autoRefreshInterval', 'csvUrl', 'csvSource']);
  const enabled = storage.autoRefreshEnabled !== false;
  const interval = storage.autoRefreshInterval || 15;
  
  await setupAutoRefreshAlarm(enabled, interval, storage.csvUrl, storage.csvSource);
});

// When service worker wakes up, check if we need to fetch CSV
// This ensures auto-sync works even if the service worker was sleeping
self.addEventListener('activate', async () => {
  console.log('Background: Service worker activated, checking CSV sync...');
  const storage = await chrome.storage.local.get(['autoRefreshEnabled', 'csvUrl', 'csvSource', 'lastCSVUpdate']);
  
  // If auto-refresh is enabled and CSV URL is configured, fetch immediately
  if (storage.autoRefreshEnabled !== false && storage.csvSource === 'url' && storage.csvUrl) {
    console.log('Background: Auto-sync enabled, fetching CSV on service worker wake...');
    fetchCSVInBackground().catch(err => {
      console.error('Background: Wake-up CSV fetch failed:', err);
    });
  }
});

// Open side panel when action button is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

