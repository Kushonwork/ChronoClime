import { motion } from 'framer-motion';
import { Share2, Download, Calendar, MapPin, Thermometer, Droplets, Wind } from 'lucide-react';
import ShareButton from './ShareButton';
import { generateWeatherShareContent, WeatherShareData } from '../services/sharingService';

interface WeatherShareProps {
  location: string;
  currentWeather: any;
  forecast: any[];
  activity?: string;
  className?: string;
}

export default function WeatherShare({ 
  location, 
  currentWeather, 
  forecast, 
  activity,
  className = '' 
}: WeatherShareProps) {
  const shareData: WeatherShareData = {
    location,
    currentWeather,
    forecast,
    activity
  };

  const shareContent = generateWeatherShareContent(shareData);

  const downloadWeatherReport = () => {
    const report = generateWeatherReport(shareData);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather-report-${location.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Weather Summary Card */}
      <motion.div
        className="flex-1 bg-gradient-to-r from-marigold/10 to-peacock/10 rounded-lg p-4 border border-marigold/20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getWeatherEmoji(currentWeather.condition)}
            </div>
            <div>
              <h3 className="font-semibold text-charcoal">
                {Math.round(currentWeather.temp)}°C in {location}
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                {currentWeather.condition} • {currentWeather.humidity}% humidity
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadWeatherReport}
              className="p-2 text-gray-600 hover:text-marigold hover:bg-marigold/10 rounded-lg transition-colors"
              title="Download Weather Report"
            >
              <Download size={18} />
            </button>
            
            <ShareButton 
              content={shareContent}
              size="md"
              variant="primary"
            />
          </div>
        </div>

        {/* Weather Details */}
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Thermometer size={16} className="text-marigold" />
            <span className="text-gray-600">
              Feels like {Math.round(currentWeather.feelsLike)}°C
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets size={16} className="text-peacock" />
            <span className="text-gray-600">
              {currentWeather.precipitation}% rain
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind size={16} className="text-gray-500" />
            <span className="text-gray-600">
              {currentWeather.windSpeed} km/h
            </span>
          </div>
        </div>

        {/* Activity Context */}
        {activity && (
          <div className="mt-3 p-2 bg-marigold/20 rounded-lg">
            <p className="text-sm text-charcoal">
              <Calendar size={14} className="inline mr-1" />
              Perfect weather for <strong>{activity}</strong>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Helper functions
function getWeatherEmoji(condition: string): string {
  const emojiMap: Record<string, string> = {
    'sunny': '☀️',
    'cloudy': '☁️',
    'rainy': '🌧️',
    'stormy': '⛈️',
    'snowy': '❄️',
    'partly-cloudy': '⛅'
  };
  return emojiMap[condition] || '🌤️';
}

function generateWeatherReport(data: WeatherShareData): string {
  const { location, currentWeather, forecast, activity } = data;
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let report = `🌤️ WEATHER REPORT - ${location.toUpperCase()}\n`;
  report += `📅 Generated on ${date}\n\n`;
  
  if (activity) {
    report += `🎯 ACTIVITY: ${activity}\n\n`;
  }
  
  report += `🌡️ CURRENT CONDITIONS\n`;
  report += `Temperature: ${Math.round(currentWeather.temp)}°C\n`;
  report += `Feels like: ${Math.round(currentWeather.feelsLike)}°C\n`;
  report += `Condition: ${currentWeather.condition}\n`;
  report += `Humidity: ${currentWeather.humidity}%\n`;
  report += `Wind: ${currentWeather.windSpeed} km/h\n`;
  report += `Precipitation: ${currentWeather.precipitation}%\n`;
  report += `UV Index: ${currentWeather.uvIndex}\n`;
  report += `Air Quality: ${currentWeather.airQuality} AQI\n\n`;
  
  report += `📊 7-DAY FORECAST\n`;
  forecast.slice(0, 7).forEach((day, index) => {
    const dayName = index === 0 ? 'Today' : 
                   index === 1 ? 'Tomorrow' : 
                   new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
    
    report += `${dayName}: ${Math.round(day.temp)}°C, ${day.condition}\n`;
  });
  
  report += `\n📱 Generated by ChronoClime Weather App\n`;
  report += `🔗 ${window.location.href}`;
  
  return report;
}
