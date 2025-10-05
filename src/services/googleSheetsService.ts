/**
 * Google Sheets CSV Service
 * Reads location data from Google Sheets CSV for ESP8266 integration
 */

export interface LocationData {
  timestamp: string;
  location: string;
  latitude: number;
  longitude: number;
  source: 'esp8266';
}

export interface GoogleSheetsConfig {
  sheetId: string;
  sheetName: string;
  apiKey?: string;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private lastReadTimestamp: number = 0;
  private cache: LocationData | null = null;
  private cacheExpiry: number = 30000; // 30 seconds

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  /**
   * Get Google Sheets CSV URL
   */
  private getCSVUrl(): string {
    const { sheetId, sheetName } = this.config;
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  }

  /**
   * Parse CSV data to LocationData
   */
  private parseCSVData(csvText: string): LocationData | null {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return null;

      // Skip header row, get latest data
      const dataLine = lines[lines.length - 1];
      const columns = dataLine.split(',');

      if (columns.length >= 5) {
        return {
          timestamp: columns[0].replace(/"/g, ''),
          location: columns[1].replace(/"/g, ''),
          latitude: parseFloat(columns[2]),
          longitude: parseFloat(columns[3]),
          source: 'esp8266'
        };
      }
    } catch (error) {
      console.error('❌ CSV parsing error:', error);
    }
    
    return null;
  }

  /**
   * Read location data from Google Sheets CSV
   */
  async readLocationData(): Promise<LocationData | null> {
    try {
      console.log('📊 Reading location from Google Sheets CSV...');
      
      // Check cache first
      const now = Date.now();
      if (this.cache && (now - this.lastReadTimestamp) < this.cacheExpiry) {
        console.log('📋 Using cached location data');
        return this.cache;
      }

      const csvUrl = this.getCSVUrl();
      console.log('🔗 CSV URL:', csvUrl);

      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv',
        },
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      console.log('📄 CSV data received:', csvText.substring(0, 200) + '...');

      const locationData = this.parseCSVData(csvText);
      
      if (locationData) {
        // Update cache
        this.cache = locationData;
        this.lastReadTimestamp = now;
        console.log('✅ Location data parsed:', locationData);
        return locationData;
      } else {
        console.log('❌ No valid location data found in CSV');
        return null;
      }

    } catch (error) {
      console.error('❌ Error reading Google Sheets CSV:', error);
      return null;
    }
  }

  /**
   * Check if location data is available
   */
  async hasLocationData(): Promise<boolean> {
    const data = await this.readLocationData();
    return data !== null;
  }

  /**
   * Get latest location timestamp
   */
  async getLatestTimestamp(): Promise<number> {
    const data = await this.readLocationData();
    if (data) {
      return new Date(data.timestamp).getTime();
    }
    return 0;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = null;
    this.lastReadTimestamp = 0;
    console.log('🗑️ Google Sheets cache cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GoogleSheetsConfig>) {
    this.config = { ...this.config, ...config };
    this.clearCache();
    console.log('🔧 Google Sheets config updated:', this.config);
  }
}

// Create singleton instance with your Google Sheets config
export const googleSheetsService = new GoogleSheetsService({
  sheetId: '1nKKi66UDzA1P9QjrnJnSX7sWrrum47Z00VUMEGiPVh4', // Your Google Sheets ID
  sheetName: 'Sheet1' // Default sheet name
});

// Export types
export type { GoogleSheetsConfig };
