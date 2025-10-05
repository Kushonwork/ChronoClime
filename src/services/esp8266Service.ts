/**
 * ESP8266 Weather Gateway Service
 * Handles connection to ESP8266 AP and location data synchronization
 */

export interface ESP8266Location {
  location: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  source: 'esp8266';
}

export interface ESP8266Status {
  connected: boolean;
  hasLocation: boolean;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface ESP8266ConnectionState {
  isConnecting: boolean;
  isConnected: boolean;
  hasLocation: boolean;
  location?: string;
  error?: string;
}

class ESP8266Service {
  private baseURL = 'http://192.168.1.100'; // Will be auto-discovered
  private discoveredIP: string | null = null;
  private isDiscovering = false;
  private connectionState: ESP8266ConnectionState = {
    isConnecting: false,
    isConnected: false,
    hasLocation: false
  };
  private statusCheckInterval: NodeJS.Timeout | null = null;
  private listeners: ((state: ESP8266ConnectionState) => void)[] = [];

  constructor() {
    this.startStatusChecking();
  }

  /**
   * Add listener for connection state changes
   */
  addStateListener(listener: (state: ESP8266ConnectionState) => void) {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeStateListener(listener: (state: ESP8266ConnectionState) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.connectionState));
  }

  /**
   * Update connection state
   */
  private updateState(updates: Partial<ESP8266ConnectionState>) {
    this.connectionState = { ...this.connectionState, ...updates };
    this.notifyListeners();
  }

  /**
   * Discover ESP8266 IP address
   */
  private async discoverESP8266IP(): Promise<string | null> {
    if (this.isDiscovering) return null;
    this.isDiscovering = true;
    
    console.log('🔍 Starting ESP8266 discovery...');
    
    // Common IP ranges to check
    const baseIPs = ['192.168.1.', '192.168.0.', '192.168.4.', '10.0.0.'];
    const commonPorts = [80, 8080];
    
    // Create promises for parallel scanning
    const scanPromises: Promise<string | null>[] = [];
    
    for (const baseIP of baseIPs) {
      for (let i = 1; i <= 50; i++) { // Limit to first 50 IPs for faster scanning
        const ip = `${baseIP}${i}`;
        for (const port of commonPorts) {
          scanPromises.push(this.checkESP8266AtIP(ip, port));
        }
      }
    }
    
    try {
      // Wait for first successful connection
      const results = await Promise.allSettled(scanPromises);
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          console.log(`✅ ESP8266 discovered at: ${result.value}`);
          this.isDiscovering = false;
          return result.value;
        }
      }
    } catch (error) {
      console.error('❌ Discovery error:', error);
    }
    
    this.isDiscovering = false;
    console.log('❌ ESP8266 not found on network');
    return null;
  }

  /**
   * Check if ESP8266 is at specific IP:port
   */
  private async checkESP8266AtIP(ip: string, port: number): Promise<string | null> {
    try {
      const url = `http://${ip}:${port}/api/status`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // Allow cross-origin requests
      });
      
      clearTimeout(timeoutId);
      
      // Check if response is ok or if we get a response at all
      if (response.ok || response.type === 'opaque') {
        console.log(`✅ Found ESP8266 at: ${ip}:${port}`);
        return `${ip}:${port}`;
      }
    } catch (error) {
      // Continue searching
    }
    
    return null;
  }

  /**
   * Check if ESP8266 is accessible
   */
  async checkConnection(): Promise<boolean> {
    try {
      console.log('🔍 Checking ESP8266 connection...');
      
      // Try to discover IP if not found
      if (!this.discoveredIP) {
        console.log('🔍 Discovering ESP8266 IP...');
        this.discoveredIP = await this.discoverESP8266IP();
        if (this.discoveredIP) {
          this.baseURL = `http://${this.discoveredIP}`;
        }
      }
      
      const response = await fetch(`${this.baseURL}/api/status`, {
        method: 'GET',
        timeout: 5000
      } as any);

      if (response.ok) {
        const status: ESP8266Status = await response.json();
        console.log('✅ ESP8266 connected:', status);
        
        this.updateState({
          isConnecting: false,
          isConnected: true,
          hasLocation: status.hasLocation,
          location: status.location,
          error: undefined
        });

        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('❌ ESP8266 not accessible:', error);
      this.updateState({
        isConnecting: false,
        isConnected: false,
        error: 'ESP8266 not accessible'
      });
      return false;
    }
  }

  /**
   * Start periodic status checking
   */
  private startStatusChecking() {
    // Check every 5 seconds
    this.statusCheckInterval = setInterval(async () => {
      if (!this.connectionState.isConnecting) {
        await this.checkConnection();
      }
    }, 5000);
  }

  /**
   * Stop status checking
   */
  stopStatusChecking() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  /**
   * Connect to ESP8266 and get location
   */
  async connectAndGetLocation(): Promise<ESP8266Location | null> {
    try {
      console.log('🛰️ Connecting to ESP8266 satellite...');
      this.updateState({ isConnecting: true, error: undefined });

      // Check connection
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to ESP8266');
      }

      // Get location data
      const locationData = await this.getLocationData();
      if (locationData) {
        console.log('📍 Location received from ESP8266:', locationData);
        this.updateState({
          isConnecting: false,
          hasLocation: true,
          location: locationData.location
        });
        return locationData;
      } else {
        throw new Error('No location data available');
      }
    } catch (error) {
      console.error('❌ ESP8266 connection failed:', error);
      this.updateState({
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      });
      return null;
    }
  }

  /**
   * Get location data from ESP8266
   */
  async getLocationData(): Promise<ESP8266Location | null> {
    try {
      const response = await fetch(`${this.baseURL}/weather`, {
        method: 'GET',
        timeout: 10000
      } as any);

      if (response.ok) {
        const data = await response.json();
        return {
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
          source: 'esp8266'
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to get location data:', error);
      return null;
    }
  }

  /**
   * Send location to ESP8266
   */
  async sendLocationToESP8266(location: string): Promise<boolean> {
    try {
      console.log('📤 Sending location to ESP8266:', location);
      
      const response = await fetch(`${this.baseURL}/api/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: location,
          timestamp: Date.now(),
          source: 'webapp'
        }),
        timeout: 10000
      } as any);

      if (response.ok) {
        console.log('✅ Location sent to ESP8266 successfully');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to send location to ESP8266:', error);
      return false;
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ESP8266ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Check if ESP8266 is available (for UI indicators)
   */
  async isESP8266Available(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/status`, {
        method: 'GET',
        timeout: 3000
      } as any);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get ESP8266 status
   */
  async getESP8266Status(): Promise<ESP8266Status | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/status`, {
        method: 'GET',
        timeout: 5000
      } as any);

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Simulate satellite connection (for demo purposes)
   */
  async simulateSatelliteConnection(): Promise<ESP8266Location | null> {
    console.log('🛰️ Simulating satellite connection...');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate location data
    const mockLocation: ESP8266Location = {
      location: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      timestamp: Date.now(),
      source: 'esp8266'
    };

    this.updateState({
      isConnecting: false,
      isConnected: true,
      hasLocation: true,
      location: mockLocation.location
    });

    return mockLocation;
  }

  /**
   * Manually set ESP8266 IP address
   */
  setESP8266IP(ip: string, port: number = 80) {
    this.baseURL = `http://${ip}:${port}`;
    this.discoveredIP = `${ip}:${port}`;
    console.log(`🔧 ESP8266 IP manually set to: ${this.baseURL}`);
  }

  /**
   * Get current ESP8266 URL
   */
  getESP8266URL(): string {
    return this.baseURL;
  }

  /**
   * Reset discovery and try again
   */
  resetDiscovery() {
    this.discoveredIP = null;
    this.isDiscovering = false;
    console.log('🔄 ESP8266 discovery reset');
  }
}

// Create singleton instance
export const esp8266Service = new ESP8266Service();

// Export types
export type { ESP8266ConnectionState };
