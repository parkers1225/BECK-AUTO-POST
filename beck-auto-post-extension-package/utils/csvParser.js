/**
 * CSV Parser utility for vehicle data
 * Parses CSV files and indexes vehicles by VIN
 */

class CSVParser {
  constructor() {
    this.vehicles = new Map(); // VIN -> vehicle data
  }

  /**
   * Parse CSV file content
   * @param {string} csvContent - Raw CSV content
   * @returns {Promise<Map>} Map of VIN to vehicle data
   */
  async parseCSV(csvContent) {
    return new Promise((resolve, reject) => {
      // Simple CSV parser (can be replaced with PapaParse if needed)
      const lines = csvContent.split('\n');
      if (lines.length < 2) {
        reject(new Error('CSV file is empty or invalid'));
        return;
      }

      // Parse header
      const headers = this.parseCSVLine(lines[0]);
      const vinIndex = headers.findIndex(h => 
        h.toLowerCase().includes('vehicle_id') || 
        h.toLowerCase().includes('vin')
      );

      if (vinIndex === -1) {
        reject(new Error('VIN column not found in CSV'));
        return;
      }

      // Parse data rows
      this.vehicles.clear();
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = this.parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;

        const vin = values[vinIndex]?.replace(/"/g, '').trim();
        if (!vin || vin.length !== 17) continue;

        const vehicle = this.mapRowToVehicle(headers, values);
        this.vehicles.set(vin.toUpperCase(), vehicle);
      }

      resolve(this.vehicles);
    });
  }

  /**
   * Parse a CSV line handling quoted fields
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  /**
   * Map CSV row to vehicle object
   */
  mapRowToVehicle(headers, values) {
    const vehicle = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.replace(/^"|"$/g, '').trim();
      const cleanHeader = header.replace(/^"|"$/g, '').toLowerCase();
      
      // Map common fields
      if (cleanHeader === 'vehicle_id' || cleanHeader === 'vin') {
        vehicle.vin = value?.toUpperCase();
      } else if (cleanHeader === 'make') {
        vehicle.make = value;
      } else if (cleanHeader === 'model') {
        vehicle.model = value;
      } else if (cleanHeader === 'year') {
        vehicle.year = value;
      } else if (cleanHeader === 'trim') {
        vehicle.trim = value;
      } else if (cleanHeader === 'price' || cleanHeader === 'sale_price') {
        vehicle.price = this.extractPrice(value);
      } else if (cleanHeader === 'mileage.value') {
        vehicle.mileage = value;
      } else if (cleanHeader === 'mileage.unit') {
        vehicle.mileageUnit = value || 'MI';
      } else if (cleanHeader === 'exterior_color') {
        vehicle.color = value;
        vehicle.exteriorColor = value; // Also store as exteriorColor
      } else if (cleanHeader === 'interior_color' || cleanHeader === 'interiorcolor') {
        vehicle.interiorColor = value;
      } else if (cleanHeader === 'description' || cleanHeader === 'offer_description') {
        vehicle.description = value;
      } else if (cleanHeader.includes('image[0].url') || cleanHeader.includes('image.url')) {
        vehicle.imageUrl = value;
      } else if (cleanHeader === 'address') {
        vehicle.address = value;
      } else if (cleanHeader === 'transmission') {
        vehicle.transmission = value;
      } else if (cleanHeader === 'fuel_type') {
        vehicle.fuelType = value;
      } else if (cleanHeader === 'body_style') {
        vehicle.bodyStyle = value;
      } else if (cleanHeader === 'drivetrain') {
        vehicle.drivetrain = value;
      } else if (cleanHeader === 'condition' || cleanHeader === 'state_of_vehicle') {
        vehicle.condition = value;
      }
      
      // Store all original data
      vehicle.rawData = vehicle.rawData || {};
      vehicle.rawData[header] = value;
    });

    return vehicle;
  }

  /**
   * Extract numeric price from string
   */
  extractPrice(priceStr) {
    if (!priceStr) return null;
    const match = priceStr.match(/[\d,]+/);
    if (match) {
      return match[0].replace(/,/g, '');
    }
    return null;
  }

  /**
   * Get vehicle by VIN
   */
  getVehicleByVIN(vin) {
    return this.vehicles.get(vin?.toUpperCase());
  }

  /**
   * Get all vehicles
   */
  getAllVehicles() {
    return Array.from(this.vehicles.values());
  }

  /**
   * Get vehicle count
   */
  getVehicleCount() {
    return this.vehicles.size;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSVParser;
}

