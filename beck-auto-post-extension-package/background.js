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
    const settings = await chrome.storage.local.get(['aiApiKey', 'aiService']);
    
    if (!settings.aiApiKey) {
      sendResponse({ success: false, error: 'API key not configured' });
      return;
    }
    
    const service = settings.aiService || 'openai';
    const prompt = buildAIPrompt(data.vehicleData, data.userPrompt);
    
    let description;
    if (service === 'openai') {
      description = await generateWithOpenAI(settings.aiApiKey, prompt);
    } else if (service === 'anthropic') {
      description = await generateWithAnthropic(settings.aiApiKey, prompt);
    } else {
      sendResponse({ success: false, error: `Unsupported AI service: ${service}` });
      return;
    }
    
    sendResponse({ success: true, description });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Build AI prompt from vehicle data
 */
function buildAIPrompt(vehicleData, userPrompt) {
  const vehicleInfo = `
Vehicle Information:
- Year: ${vehicleData.year || 'N/A'}
- Make: ${vehicleData.make || 'N/A'}
- Model: ${vehicleData.model || 'N/A'}
- Trim: ${vehicleData.trim || 'N/A'}
- Price: $${vehicleData.price || 'N/A'}
- Mileage: ${vehicleData.mileage || 'N/A'} ${vehicleData.mileageUnit || 'miles'}
- Color: ${vehicleData.color || 'N/A'}
- Transmission: ${vehicleData.transmission || 'N/A'}
- Fuel Type: ${vehicleData.fuelType || 'N/A'}
- Body Style: ${vehicleData.bodyStyle || 'N/A'}
- Drivetrain: ${vehicleData.drivetrain || 'N/A'}
- Condition: ${vehicleData.condition || 'N/A'}
- VIN: ${vehicleData.vin || 'N/A'}

${vehicleData.description ? `Original Description (NOTE: Ignore any dealership names, phone numbers, or business references in this):\n${vehicleData.description.substring(0, 1000)}` : ''}
`;

  return `You are an expert at writing engaging Facebook Marketplace listings for vehicles. 

${vehicleInfo}

User's specific requirements: ${userPrompt || 'Create an engaging, professional description optimized for Facebook Marketplace'}

CRITICAL REQUIREMENTS - MUST FOLLOW:
- NEVER mention dealership name, dealership business name, or the word "dealership" anywhere in the description
- NEVER include any phone number in the description (even if present in original description)
- If the original description contains dealership info or phone numbers, completely exclude them
- ALWAYS end with a call-to-action directing buyers to "DM me on Facebook for more details" or similar Facebook messaging instruction
- Optimize specifically for Facebook Marketplace format (use emojis sparingly, short paragraphs, clear sections)

Please generate a compelling Facebook Marketplace listing description that:
1. Starts with an attention-grabbing headline
2. Highlights key features and selling points
3. Uses proper formatting with bullet points and line breaks for readability
4. Includes relevant details about condition, mileage, and features
5. Ends with: "DM me on Facebook for more details" or similar Facebook messaging instruction
6. Is optimized for Facebook Marketplace's format and audience (short paragraphs, easy to scan)
7. Is concise but comprehensive (aim for 300-500 words)
8. Uses a friendly, personal tone (as if selling as an individual, not a business)

Generate only the description text, no additional commentary.`;
}

/**
 * Generate description using OpenAI API
 */
async function generateWithOpenAI(apiKey, prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional automotive copywriter specializing in Facebook Marketplace listings. NEVER mention dealership names or phone numbers. Always direct buyers to DM on Facebook for details.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

/**
 * Generate description using Anthropic Claude API
 */
async function generateWithAnthropic(apiKey, prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text?.trim() || '';
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
    
    // Request permission for this URL if needed
    const hasPermission = await requestHostPermission(imageUrl);
    if (!hasPermission) {
      sendResponse({ success: false, error: 'Permission denied to access image URL' });
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

