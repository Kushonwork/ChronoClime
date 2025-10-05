import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, AlertTriangle } from 'lucide-react';
import { DailyWeather } from '../utils/weatherData';
import WeatherShare from './WeatherShare';

interface LivingForecastProps {
  location: string;
  forecast: DailyWeather[];
  onPlanActivity: () => void;
}

const WeatherIcon = ({ condition, size = 32 }: { condition: string; size?: number }) => {
  switch (condition) {
    case 'sunny':
      return <Sun size={size} className="text-gold" />;
    case 'rainy':
    case 'stormy':
      return <CloudRain size={size} className="text-blue-500" />;
    case 'cloudy':
    case 'partly-cloudy':
      return <Cloud size={size} className="text-gray-500" />;
    default:
      return <Sun size={size} className="text-gold" />;
  }
};

export default function LivingForecast({ location, forecast, onPlanActivity }: LivingForecastProps) {
  const currentWeather = forecast[0];
  const weekForecast = forecast.slice(1, 8);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-green-600' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-600' };
    if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: 'text-orange-600' };
    return { label: 'Unhealthy', color: 'text-red-600' };
  };

  const aqiStatus = getAQIStatus(currentWeather.aqi);

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-peacock mb-2">{location}</h1>
          <p className="text-gray-600">Today, {formatDate(currentWeather.date)}</p>
        </div>

        {/* Weather Sharing */}
        <WeatherShare
          location={location}
          currentWeather={currentWeather}
          forecast={forecast}
          className="mb-6"
        />

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="marble-card p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-6xl font-bold text-charcoal mb-2">
                  {currentWeather.temp}°C
                </h2>
                <p className="text-xl text-gray-600">{currentWeather.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Feels like {currentWeather.feelsLike}°C
                </p>
              </div>
              <WeatherIcon condition={currentWeather.condition} size={64} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Wind className="text-peacock" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Wind</p>
                  <p className="font-semibold">{currentWeather.wind} km/h</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Droplets className="text-peacock" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Precipitation</p>
                  <p className="font-semibold">{currentWeather.precipitation}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Eye className="text-peacock" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p className="font-semibold">{currentWeather.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Sun className="text-peacock" size={24} />
                <div>
                  <p className="text-sm text-gray-500">UV Index</p>
                  <p className="font-semibold">{currentWeather.uv}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="marble-card p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-4 text-charcoal">Air Quality</h3>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl font-bold text-charcoal">{currentWeather.aqi}</span>
                <span className={`text-2xl font-semibold ${aqiStatus.color}`}>
                  {aqiStatus.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div
                  className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentWeather.aqi / 200) * 100, 100)}%` }}
                />
              </div>
            </div>

            {currentWeather.aqi > 100 && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-500 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold text-orange-800">Air Quality Alert</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Sensitive groups should limit prolonged outdoor activities.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          className="marble-card p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-semibold mb-6 text-charcoal">7-Day Forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
            {weekForecast.map((day, index) => (
              <motion.div
                key={index}
                className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <WeatherIcon condition={day.condition} size={32} />
                <div className="mt-2">
                  <p className="text-lg font-bold text-charcoal">{day.tempMax}°</p>
                  <p className="text-sm text-gray-500">{day.tempMin}°</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button onClick={onPlanActivity} className="liquid-button text-lg px-12 py-4">
            Plan a Future Activity
          </button>
          <p className="text-gray-500 mt-4">
            Find the perfect day for your outdoor adventures
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
