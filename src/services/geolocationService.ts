// Geolocation service for automatic location detection
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

// Convert coordinates to city name using reverse geocoding
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    // Using OpenWeatherMap's reverse geocoding API
    const API_KEY = process.env.VITE_OPENWEATHER_API_KEY || 'd8f544999583df9881f4f4c45da91988';
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      const location = data[0];
      return `${location.name}, ${location.country}`;
    }
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Fallback to coordinates
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// Get current position with error handling
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'Unknown geolocation error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject({
          code: error.code,
          message: errorMessage
        });
      },
      options
    );
  });
}

// Get current location name (coordinates + reverse geocoding)
export async function getCurrentLocationName(): Promise<string> {
  try {
    const position = await getCurrentPosition();
    const locationName = await reverseGeocode(position.latitude, position.longitude);
    return locationName;
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
}

// Check if geolocation is supported
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

// Check if geolocation permission is granted
export async function checkGeolocationPermission(): Promise<PermissionState | 'unknown'> {
  if (typeof window === 'undefined' || !('permissions' in navigator)) {
    return 'unknown';
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permission.state;
  } catch (error) {
    console.error('Error checking geolocation permission:', error);
    return 'unknown';
  }
}
