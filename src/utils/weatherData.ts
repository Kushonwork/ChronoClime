export interface WeatherCondition {
  temp: number;
  feelsLike: number;
  precipitation: number;
  wind: number;
  humidity: number;
  uv: number;
  aqi: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy';
  description: string;
}

export interface HourlyWeather extends WeatherCondition {
  hour: number;
  timestamp: Date;
}

export interface DailyWeather extends WeatherCondition {
  date: Date;
  tempMin: number;
  tempMax: number;
  hourlyData: HourlyWeather[];
  sunrise: string;
  sunset: string;
}

export interface ActivityPreferences {
  idealTempMin: number;
  idealTempMax: number;
  maxWindSpeed: number;
  maxPrecipitation: number;
}

const activityDefaults: Record<string, ActivityPreferences> = {
  trekking: { idealTempMin: 10, idealTempMax: 25, maxWindSpeed: 20, maxPrecipitation: 20 },
  photography: { idealTempMin: 5, idealTempMax: 30, maxWindSpeed: 25, maxPrecipitation: 10 },
  picnic: { idealTempMin: 15, idealTempMax: 28, maxWindSpeed: 15, maxPrecipitation: 5 },
  cycling: { idealTempMin: 12, idealTempMax: 26, maxWindSpeed: 20, maxPrecipitation: 10 },
  'beach day': { idealTempMin: 22, idealTempMax: 35, maxWindSpeed: 25, maxPrecipitation: 5 },
  camping: { idealTempMin: 8, idealTempMax: 22, maxWindSpeed: 15, maxPrecipitation: 15 },
  'outdoor sports': { idealTempMin: 15, idealTempMax: 28, maxWindSpeed: 20, maxPrecipitation: 10 },
  'bird watching': { idealTempMin: 10, idealTempMax: 25, maxWindSpeed: 15, maxPrecipitation: 20 },
  stargazing: { idealTempMin: 5, idealTempMax: 20, maxWindSpeed: 10, maxPrecipitation: 0 },
  gardening: { idealTempMin: 12, idealTempMax: 28, maxWindSpeed: 15, maxPrecipitation: 30 },
};

export function getActivityPreferences(activityName: string): ActivityPreferences {
  const normalized = activityName.toLowerCase();
  return activityDefaults[normalized] || activityDefaults['trekking'];
}

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
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

function getConditionForTemp(temp: number, precip: number): WeatherCondition['condition'] {
  if (precip > 60) return temp < 0 ? 'snowy' : 'rainy';
  if (precip > 30) return 'stormy';
  if (precip > 10) return 'partly-cloudy';
  if (temp > 25) return 'sunny';
  return temp > 15 ? 'partly-cloudy' : 'cloudy';
}

function getConditionDescription(condition: WeatherCondition['condition']): string {
  const descriptions = {
    sunny: 'Clear and sunny',
    'partly-cloudy': 'Partly cloudy',
    cloudy: 'Overcast',
    rainy: 'Rainy',
    stormy: 'Thunderstorms possible',
    snowy: 'Snow expected',
  };
  return descriptions[condition];
}

export function generateHourlyWeather(date: Date, baseTemp: number): HourlyWeather[] {
  const hourlyData: HourlyWeather[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
    const temp = Math.round(baseTemp + tempVariation);
    const feelsLike = temp + getRandomInRange(-3, 3);
    const precipitation = Math.max(0, getRandomInRange(-10, 40));
    const wind = getRandomInRange(5, 30);
    const humidity = getRandomInRange(30, 80);
    const uv = hour >= 6 && hour <= 18 ? getRandomInRange(2, 11) : 0;
    const aqi = generateRealisticAQI(0, 0);
    const condition = getConditionForTemp(temp, precipitation);

    const timestamp = new Date(date);
    timestamp.setHours(hour, 0, 0, 0);

    hourlyData.push({
      hour,
      timestamp,
      temp: Math.round(temp),
      feelsLike: Math.round(feelsLike),
      precipitation: Math.round(precipitation),
      wind: Math.round(wind),
      humidity: Math.round(humidity),
      uv: Math.round(uv),
      aqi: Math.round(aqi),
      condition,
      description: getConditionDescription(condition),
    });
  }

  return hourlyData;
}

// Legacy function for fallback/mock data
export function generateDailyForecast(startDate: Date, days: number = 7): DailyWeather[] {
  const forecast: DailyWeather[] = [];
  const baseTemp = getRandomInRange(15, 28);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dayTemp = baseTemp + getRandomInRange(-5, 5);
    const hourlyData = generateHourlyWeather(date, dayTemp);

    const temps = hourlyData.map(h => h.temp);
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);

    const avgData = hourlyData.reduce((acc, h) => ({
      precipitation: acc.precipitation + h.precipitation,
      wind: acc.wind + h.wind,
      humidity: acc.humidity + h.humidity,
      uv: acc.uv + h.uv,
      aqi: acc.aqi + h.aqi,
    }), { precipitation: 0, wind: 0, humidity: 0, uv: 0, aqi: 0 });

    const count = hourlyData.length;

    forecast.push({
      date,
      temp: Math.round(dayTemp),
      tempMin,
      tempMax,
      feelsLike: Math.round(dayTemp + getRandomInRange(-2, 2)),
      precipitation: Math.round(avgData.precipitation / count),
      wind: Math.round(avgData.wind / count),
      humidity: Math.round(avgData.humidity / count),
      uv: Math.round(avgData.uv / count),
      aqi: Math.round(avgData.aqi / count),
      condition: getConditionForTemp(dayTemp, avgData.precipitation / count),
      description: getConditionDescription(getConditionForTemp(dayTemp, avgData.precipitation / count)),
      hourlyData,
      sunrise: '06:30',
      sunset: '18:45',
    });
  }

  return forecast;
}

export function calculateACIS(
  weather: DailyWeather,
  preferences: ActivityPreferences
): { score: number; factors: { name: string; impact: number; value: number }[] } {
  const factors = [];
  let totalScore = 10;

  const tempScore = weather.temp >= preferences.idealTempMin && weather.temp <= preferences.idealTempMax ? 0 : -2;
  if (tempScore !== 0) {
    factors.push({ name: 'Temperature', impact: tempScore, value: weather.temp });
    totalScore += tempScore;
  }

  if (weather.wind > preferences.maxWindSpeed) {
    const windPenalty = -1.5;
    factors.push({ name: 'Wind', impact: windPenalty, value: weather.wind });
    totalScore += windPenalty;
  }

  if (weather.precipitation > preferences.maxPrecipitation) {
    const precipPenalty = -2.5;
    factors.push({ name: 'Precipitation', impact: precipPenalty, value: weather.precipitation });
    totalScore += precipPenalty;
  }

  if (weather.aqi > 100) {
    const aqiPenalty = -1;
    factors.push({ name: 'Air Quality', impact: aqiPenalty, value: weather.aqi });
    totalScore += aqiPenalty;
  }

  if (weather.uv > 8) {
    const uvPenalty = -0.5;
    factors.push({ name: 'UV Index', impact: uvPenalty, value: weather.uv });
    totalScore += uvPenalty;
  }

  return { score: Math.max(1, Math.min(10, totalScore)), factors };
}

export function findOptimalTimeWindow(
  hourlyData: HourlyWeather[],
  preferences: ActivityPreferences
): { startHour: number; endHour: number; score: number } {
  let bestWindow = { startHour: 9, endHour: 17, score: 0 };

  for (let start = 6; start < 18; start++) {
    for (let duration = 3; duration <= 8; duration++) {
      const end = start + duration;
      if (end > 20) continue;

      const windowHours = hourlyData.slice(start, end);
      let score = 10;

      windowHours.forEach(hour => {
        if (hour.temp < preferences.idealTempMin || hour.temp > preferences.idealTempMax) score -= 0.3;
        if (hour.wind > preferences.maxWindSpeed) score -= 0.2;
        if (hour.precipitation > preferences.maxPrecipitation) score -= 0.4;
      });

      if (score > bestWindow.score) {
        bestWindow = { startHour: start, endHour: end, score };
      }
    }
  }

  return bestWindow;
}

export function getHealthAlerts(weather: DailyWeather): string[] {
  const alerts: string[] = [];

  if (weather.aqi > 150) {
    alerts.push('Air quality is poor. High risk of respiratory irritation. Consider rescheduling or wearing a protective mask if you go out.');
  } else if (weather.aqi > 100) {
    alerts.push('Moderate air quality. Sensitive individuals should limit prolonged outdoor activities.');
  }

  if (weather.uv > 8) {
    alerts.push('Strong sun expected. High risk of sunburn in under 30 minutes. Apply sunscreen and wear protective clothing.');
  } else if (weather.uv > 6) {
    alerts.push('Moderate UV levels. Sunscreen recommended for extended outdoor exposure.');
  }

  if (weather.temp < 5) {
    alerts.push('Risk of hypothermia during prolonged exposure. Dress in appropriate layers and stay active.');
  } else if (weather.temp > 35) {
    alerts.push('Risk of heatstroke during prolonged exposure. Stay hydrated and take frequent breaks in shade.');
  }

  if (weather.wind > 40) {
    alerts.push('Strong winds expected. Secure loose objects and be cautious of falling debris.');
  }

  if (weather.precipitation > 70) {
    alerts.push('Heavy precipitation expected. Risk of flooding in low-lying areas. Drive carefully and avoid unnecessary travel.');
  }

  return alerts;
}
