import axios from 'axios';
import { DailyWeather, HourlyWeather } from '../utils/weatherData';
import { generateBackupWeatherData, testNetworkConnectivity } from './backupWeatherService';

// OpenWeatherMap API configuration
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'd8f544999583df9881f4f4c45da91988';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Test API key validity
export async function testApiKey(): Promise<boolean> {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: 'London',
        appid: API_KEY,
        units: 'metric',
      },
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('API key test failed:', error);
    return false;
  }
}

// Types for OpenWeatherMap API responses
export interface OpenWeatherCurrent {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: { all: number };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}

export interface OpenWeatherForecast {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
      deg: number;
    };
    clouds: { all: number };
    pop: number; // probability of precipitation
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
  };
}

export interface AirQualityData {
  list: Array<{
    main: {
      aqi: number;
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

// Convert OpenWeatherMap condition to our app's condition type
function mapWeatherCondition(owmMain: string, icon: string): 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy' {
  const condition = owmMain.toLowerCase();
  const iconCode = icon.slice(0, 2);
  
  if (condition.includes('thunderstorm')) return 'stormy';
  if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
  if (condition.includes('snow')) return 'snowy';
  if (condition.includes('clouds')) {
    return iconCode === '01' ? 'sunny' : iconCode === '02' ? 'partly-cloudy' : 'cloudy';
  }
  if (condition.includes('clear')) return 'sunny';
  
  return 'partly-cloudy';
}

// Convert wind speed from m/s to km/h
function convertWindSpeed(ms: number): number {
  return Math.round(ms * 3.6);
}

// Convert precipitation probability to percentage
function convertPrecipitation(pop: number): number {
  return Math.round(pop * 100);
}

// Get UV index (mock for now, as UV requires separate API call)
function getUVIndex(): number {
  return Math.floor(Math.random() * 11); // 0-10 UV index
}

// Get AQI from air quality data or generate mock
function getAQI(airQuality?: AirQualityData): number {
  if (airQuality && airQuality.list.length > 0) {
    const aqi = airQuality.list[0].main.aqi;
    // OpenWeatherMap returns AQI on 1-5 scale, convert to realistic 0-100 scale
    // 1 = 0-25, 2 = 26-50, 3 = 51-75, 4 = 76-100, 5 = 100+
    const aqiRanges = [12, 37, 62, 87, 100];
    return aqiRanges[aqi - 1] || generateRealisticAQI(0, 0);
  }
  // Use our realistic AQI generation if no data available
  return generateRealisticAQI(0, 0);
}

// Fetch current weather data
export async function fetchCurrentWeather(city: string): Promise<OpenWeatherCurrent> {
  try {
    if (API_KEY === 'your_api_key_here') {
      throw new Error('OpenWeatherMap API key not configured');
    }
    
    console.log(`Fetching weather for ${city} with API key: ${API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
      },
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching current weather:', error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'Unknown server error';
      throw new Error(`Weather API error (${status}): ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(`Network error: Unable to connect to weather service`);
    } else {
      // Something else happened
      throw new Error(`Failed to fetch weather data for ${city}: ${error.message}`);
    }
  }
}

// Fetch 5-day weather forecast
export async function fetchWeatherForecast(city: string): Promise<OpenWeatherForecast> {
  try {
    if (API_KEY === 'your_api_key_here') {
      throw new Error('OpenWeatherMap API key not configured');
    }
    
    console.log(`Fetching forecast for ${city} with API key: ${API_KEY.substring(0, 8)}...`);
    
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
      },
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching weather forecast:', error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'Unknown server error';
      throw new Error(`Weather API error (${status}): ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(`Network error: Unable to connect to weather service`);
    } else {
      // Something else happened
      throw new Error(`Failed to fetch forecast data for ${city}: ${error.message}`);
    }
  }
}

// Fetch air quality data
export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  try {
    const response = await axios.get(`${BASE_URL}/air_pollution`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching air quality:', error);
    
    // Return realistic mock air quality data based on location and time
    const mockAQI = generateRealisticAQI(lat, lon);
    return {
      list: [{
        main: {
          aqi: mockAQI
        },
        components: {
          co: Math.random() * 200,
          no: Math.random() * 50,
          no2: Math.random() * 100,
          o3: Math.random() * 200,
          so2: Math.random() * 50,
          pm2_5: Math.random() * 50,
          pm10: Math.random() * 100,
          nh3: Math.random() * 20
        },
        dt: Date.now() / 1000
      }]
    };
  }
}

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

// Convert OpenWeatherMap data to our app's format
export function convertToAppFormat(
  current: OpenWeatherCurrent,
  forecast: OpenWeatherForecast,
  airQuality?: AirQualityData
) {
  const aqi = getAQI(airQuality);
  
  // Process current weather
  const currentWeather: DailyWeather = {
    date: new Date(current.dt * 1000),
    temp: Math.round(current.main.temp),
    tempMin: Math.round(current.main.temp_min),
    tempMax: Math.round(current.main.temp_max),
    feelsLike: Math.round(current.main.feels_like),
    precipitation: 0, // Will be updated from forecast
    wind: convertWindSpeed(current.wind.speed),
    humidity: current.main.humidity,
    uv: getUVIndex(),
    aqi,
    condition: mapWeatherCondition(current.weather[0].main, current.weather[0].icon),
    description: current.weather[0].description,
    hourlyData: [], // Will be populated from forecast
    sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
  };

  // Process forecast data to create daily forecasts
  const dailyForecasts: DailyWeather[] = [];
  const forecastMap = new Map<string, any[]>();
  
  // Group forecast data by date
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    if (!forecastMap.has(date)) {
      forecastMap.set(date, []);
    }
    forecastMap.get(date)!.push(item);
  });

  // Convert grouped data to daily forecasts
  forecastMap.forEach((dayData, dateStr) => {
    const date = new Date(dateStr);
    const temps = dayData.map(d => d.main.temp);
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);
    const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
    
    // Calculate averages
    const avgHumidity = Math.round(dayData.reduce((sum, d) => sum + d.main.humidity, 0) / dayData.length);
    const avgWind = Math.round(dayData.reduce((sum, d) => sum + convertWindSpeed(d.wind.speed), 0) / dayData.length);
    const avgPrecipitation = Math.round(dayData.reduce((sum, d) => sum + convertPrecipitation(d.pop), 0) / dayData.length);
    
    // Get most common weather condition for the day
    const conditionCounts = new Map<string, number>();
    dayData.forEach(d => {
      const condition = mapWeatherCondition(d.weather[0].main, d.weather[0].icon);
      conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
    });
    const mostCommonCondition = Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1])[0][0] as 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy';

    // Generate hourly data for the day
    const hourlyData: HourlyWeather[] = dayData.map(item => ({
      hour: new Date(item.dt * 1000).getHours(),
      timestamp: new Date(item.dt * 1000),
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      precipitation: convertPrecipitation(item.pop),
      wind: convertWindSpeed(item.wind.speed),
      humidity: item.main.humidity,
      uv: getUVIndex(),
      aqi,
      condition: mapWeatherCondition(item.weather[0].main, item.weather[0].icon),
      description: item.weather[0].description,
    }));

    dailyForecasts.push({
      date,
      temp: avgTemp,
      tempMin,
      tempMax,
      feelsLike: Math.round(dayData.reduce((sum, d) => sum + d.main.feels_like, 0) / dayData.length),
      precipitation: avgPrecipitation,
      wind: avgWind,
      humidity: avgHumidity,
      uv: getUVIndex(),
      aqi,
      condition: mostCommonCondition,
      description: dayData[Math.floor(dayData.length / 2)].weather[0].description,
      hourlyData,
      sunrise: currentWeather.sunrise,
      sunset: currentWeather.sunset,
    });
  });

  // Update current weather with first day's precipitation
  if (dailyForecasts.length > 0) {
    currentWeather.precipitation = dailyForecasts[0].precipitation;
    currentWeather.hourlyData = dailyForecasts[0].hourlyData;
  }

  return [currentWeather, ...dailyForecasts];
}

// Main function to fetch complete weather data for a location
export async function fetchCompleteWeatherData(city: string) {
  try {
    console.log(`Fetching weather data for: ${city}`);
    
    // First test network connectivity
    const isNetworkAvailable = await testNetworkConnectivity();
    if (!isNetworkAvailable) {
      console.log('Network not available, using backup data');
      return generateBackupWeatherData(city);
    }
    
    // Fetch all data in parallel
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(city),
      fetchWeatherForecast(city),
    ]);

    // Fetch air quality if coordinates are available
    let airQuality: AirQualityData | undefined;
    try {
      airQuality = await fetchAirQuality(current.coord.lat, current.coord.lon);
    } catch (error) {
      console.warn('Air quality data not available, using mock data');
    }

    // Convert to app format
    const weatherData = convertToAppFormat(current, forecast, airQuality);
    
    console.log(`Successfully fetched weather data for ${city}:`, weatherData.length, 'days');
    return weatherData;
  } catch (error) {
    console.error('Error fetching complete weather data:', error);
    console.log('Falling back to backup weather data');
    return generateBackupWeatherData(city);
  }
}
