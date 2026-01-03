/**
 * VIN Matcher utility
 * Extracts VIN from photo filenames and URLs, matches to vehicles
 */

class VINMatcher {
  /**
   * Extract VIN from filename
   * VINs are 17 characters (alphanumeric)
   * @param {string} filename - Photo filename
   * @returns {string|null} Extracted VIN or null
   */
  extractVINFromFilename(filename) {
    if (!filename) return null;

    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // VIN pattern: 17 alphanumeric characters
    // Common patterns: VIN at start, end, or anywhere in filename
    const vinPattern = /[A-HJ-NPR-Z0-9]{17}/i;
    const match = nameWithoutExt.match(vinPattern);
    
    if (match) {
      return match[0].toUpperCase();
    }

    // Try to find VIN in path segments
    const pathSegments = filename.split(/[/\\]/);
    for (const segment of pathSegments) {
      const segmentMatch = segment.match(vinPattern);
      if (segmentMatch) {
        return segmentMatch[0].toUpperCase();
      }
    }

    return null;
  }

  /**
   * Extract VIN from URL
   * @param {string} url - Photo URL
   * @returns {string|null} Extracted VIN or null
   */
  extractVINFromURL(url) {
    if (!url) return null;

    // VIN pattern: 17 alphanumeric characters
    const vinPattern = /[A-HJ-NPR-Z0-9]{17}/i;
    const match = url.match(vinPattern);
    
    if (match) {
      return match[0].toUpperCase();
    }

    return null;
  }

  /**
   * Extract VIN from file or URL
   * @param {string|File} input - Filename, URL, or File object
   * @returns {Promise<string|null>} Extracted VIN
   */
  async extractVIN(input) {
    if (!input) return null;

    // Handle File object
    if (input instanceof File) {
      return this.extractVINFromFilename(input.name);
    }

    // Handle string (filename or URL)
    if (typeof input === 'string') {
      // Check if it's a URL
      if (input.startsWith('http://') || input.startsWith('https://')) {
        return this.extractVINFromURL(input);
      } else {
        return this.extractVINFromFilename(input);
      }
    }

    return null;
  }

  /**
   * Validate VIN format
   * @param {string} vin - VIN to validate
   * @returns {boolean} True if valid format
   */
  validateVIN(vin) {
    if (!vin) return false;
    // VIN must be exactly 17 alphanumeric characters
    // Excludes I, O, Q to avoid confusion with 1, 0
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }

  /**
   * Match photo to vehicle using VIN
   * @param {string|File} photo - Photo filename, URL, or File
   * @param {Map|Object} vehicles - Map or object of vehicles indexed by VIN
   * @returns {Object|null} Matched vehicle or null
   */
  async matchPhotoToVehicle(photo, vehicles) {
    const vin = await this.extractVIN(photo);
    
    if (!vin || !this.validateVIN(vin)) {
      return null;
    }

    // Handle Map or plain object
    if (vehicles instanceof Map) {
      return vehicles.get(vin) || null;
    } else if (typeof vehicles === 'object' && vehicles !== null) {
      return vehicles[vin] || null;
    }

    return null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VINMatcher;
}



