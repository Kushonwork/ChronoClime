import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { DailyWeather } from '../utils/weatherData';
import WeatherHoverBackground from './WeatherHoverBackground';
import WeatherVideoBackground from './WeatherVideoBackground';

interface ForecastCardProps {
  day: DailyWeather;
  index: number;
  isToday?: boolean;
  className?: string;
}

export default function ForecastCard({ 
  day, 
  index, 
  isToday = false, 
  className = '' 
}: ForecastCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date) => {
    if (isToday) return 'Today';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, string> = {
      'sunny': '☀️',
      'cloudy': '☁️',
      'rainy': '🌧️',
      'stormy': '⛈️',
      'snowy': '❄️',
      'partly-cloudy': '⛅'
    };
    return iconMap[condition] || '🌤️';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-600';
    if (aqi <= 100) return 'text-yellow-600';
    if (aqi <= 150) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    return 'Unhealthy';
  };

  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      style={{ 
        minHeight: '250px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Weather Video Background */}
      <WeatherVideoBackground
        condition={day.condition}
        className="rounded-lg"
      />

      {/* Card Content */}
      <motion.div
        className={`
          relative z-20 p-4 transition-all duration-300
          ${isHovered ? 'shadow-xl border-2 border-marigold/30' : 'shadow-sm'}
        `}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '8px',
          margin: '10px',
          position: 'relative',
          zIndex: 20
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-peacock" />
            <span className="font-semibold text-charcoal">
              {formatDate(day.date)}
            </span>
            {isToday && (
              <span className="px-2 py-1 bg-marigold text-white text-xs rounded-full">
                Today
              </span>
            )}
          </div>
          <div className="text-2xl">
            {getWeatherIcon(day.condition)}
          </div>
        </div>

        {/* Temperature */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-charcoal mb-1">
            {day.temp}°C
          </div>
          <div className="text-sm text-gray-600 capitalize">
            {day.description}
          </div>
          <div className="text-xs text-gray-500">
            {day.tempMin}° / {day.tempMax}°
          </div>
        </div>

        {/* Weather Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Thermometer size={14} className="text-marigold" />
              <span className="text-gray-600">Feels like</span>
            </div>
            <span className="font-medium">{day.feelsLike}°C</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Droplets size={14} className="text-peacock" />
              <span className="text-gray-600">Humidity</span>
            </div>
            <span className="font-medium">{day.humidity}%</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Wind size={14} className="text-gray-500" />
              <span className="text-gray-600">Wind</span>
            </div>
            <span className="font-medium">{day.wind} km/h</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Eye size={14} className="text-blue-500" />
              <span className="text-gray-600">UV Index</span>
            </div>
            <span className="font-medium">{day.uv}</span>
          </div>

          {/* Air Quality */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Air Quality</span>
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${getAQIColor(day.aqi)}`}>
                  {day.aqi}
                </span>
                <span className="text-xs text-gray-500">
                  {getAQIStatus(day.aqi)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect Indicator */}
        <motion.div
          className="absolute top-2 right-2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            scale: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-2 h-2 bg-marigold rounded-full animate-pulse" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
