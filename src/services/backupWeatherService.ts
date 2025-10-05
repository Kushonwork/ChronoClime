// Backup weather service using a different approach
import { DailyWeather } from '../utils/weatherData';

// Generate realistic AQI based on location and time
function generateRealisticAQI(lat: number, lon: number): number {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const month = new Date().getMonth();
  
  // Base AQI - start with excellent air quality
  let baseAQI = 15;
  
  // Urban areas tend to have higher pollution
  if (Math.abs(lat) < 50 && Math.abs(lon) < 50) {
    baseAQI += 8; // Urban areas: 15 + 8 = 23
  }
  
  // Rush hour pollution (7-9 AM, 5-7 PM)
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    baseAQI += 5; // Rush hour: +5
  }
  
  // Weekend vs weekday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    baseAQI -= 3; // Weekends are cleaner: -3
  }
  
  // Seasonal variations (winter has more pollution due to heating)
  if (month >= 10 || month <= 2) { // Winter months
    baseAQI += 4;
  } else if (month >= 3 && month <= 5) { // Spring
    baseAQI += 2;
  } else if (month >= 6 && month <= 8) { // Summer
    baseAQI += 3; // Summer can have ozone issues
  }
  
  // Add some realistic randomness (±3)
  const variation = (Math.random() - 0.5) * 6;
  const finalAQI = Math.max(8, Math.min(65, Math.round(baseAQI + variation)));
  
  return finalAQI;
}

// Simple backup weather data generator with more realistic data
export function generateBackupWeatherData(city: string): DailyWeather[] {
  const today = new Date();
  const forecast: DailyWeather[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Generate more realistic weather patterns
    const baseTemp = 20 + Math.sin(i * 0.5) * 10; // Temperature variation
    const temp = Math.round(baseTemp + (Math.random() - 0.5) * 8);
    const feelsLike = Math.round(temp + (Math.random() - 0.5) * 4);
    
    const conditions = ['sunny', 'cloudy', 'rainy', 'partly-cloudy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    const humidity = Math.round(40 + Math.random() * 40);
    const windSpeed = Math.round(5 + Math.random() * 15);
    const pressure = Math.round(1000 + Math.random() * 50);
    
    // Generate hourly data
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour += 3) {
      const hourTemp = Math.round(temp + (Math.random() - 0.5) * 6);
      hourlyData.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        temperature: hourTemp,
        condition: condition as 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy',
        humidity: Math.round(humidity + (Math.random() - 0.5) * 20),
        windSpeed: Math.round(windSpeed + (Math.random() - 0.5) * 5),
        precipitation: Math.random() > 0.7 ? Math.round(Math.random() * 10) : 0,
        uvIndex: Math.round(Math.random() * 10),
        airQuality: Math.round(20 + Math.random() * 80),
      });
    }
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      temperature: temp,
      feelsLike: feelsLike,
      condition: condition as 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy',
      humidity: humidity,
      windSpeed: windSpeed,
      pressure: pressure,
      precipitation: Math.random() > 0.6 ? Math.round(Math.random() * 15) : 0,
      uvIndex: Math.round(Math.random() * 10),
      airQuality: generateRealisticAQI(0, 0), // Use realistic AQI
      hourlyData: hourlyData,
    });
  }
  
  return forecast;
}

// Test if we can reach external services
export async function testNetworkConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      mode: 'cors',
    });
    return response.ok;
  } catch (error) {
    console.error('Network connectivity test failed:', error);
    return false;
  }
}
