import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, X } from 'lucide-react';
import { DailyWeather, findOptimalTimeWindow, getActivityPreferences, getHealthAlerts } from '../utils/weatherData';
import ShareButton from './ShareButton';
import { generateWeatherShareContent } from '../services/sharingService';

interface DayDetailProps {
  day: DailyWeather;
  activity: string;
  onClose: () => void;
}

const WeatherIcon = ({ condition, size = 24 }: { condition: string; size?: number }) => {
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

export default function DayDetail({ day, activity, onClose }: DayDetailProps) {
  const preferences = getActivityPreferences(activity);
  const optimalWindow = findOptimalTimeWindow(day.hourlyData, preferences);
  const alerts = getHealthAlerts(day);

  const maxTemp = Math.max(...day.hourlyData.map(h => h.temp));
  const minTemp = Math.min(...day.hourlyData.map(h => h.temp));

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-marble rounded-2xl max-w-6xl w-full my-8"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-peacock">
              {day.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <p className="text-gray-600 mt-1">Hourly breakdown for {activity}</p>
          </div>
          <div className="flex items-center space-x-3">
            <ShareButton
              content={generateWeatherShareContent({
                location: 'Current Location',
                currentWeather: day,
                forecast: [day],
                activity
              })}
              size="md"
              variant="primary"
            />
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-charcoal transition-colors"
            >
              <X size={32} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-charcoal">Weather Wave</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-marigold rounded"></div>
                  <span>Optimal Time</span>
                </div>
              </div>
            </div>

            <div className="marble-card p-6">
              <h4 className="text-lg font-semibold text-charcoal mb-4">Temperature Analytics</h4>
              <div className="relative h-64 mb-6 bg-gray-50 rounded-lg p-4">
                <div className="absolute inset-4 flex items-end space-x-1">
                  {day.hourlyData.map((hour, index) => {
                    const isOptimal =
                      hour.hour >= optimalWindow.startHour && hour.hour < optimalWindow.endHour;
                    const heightPercent = Math.max(10, ((hour.temp - minTemp) / (maxTemp - minTemp)) * 80);

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative">
                        <div
                          className={`w-full rounded-t transition-all duration-300 ${
                            isOptimal ? 'bg-marigold shadow-lg' : 'bg-peacock'
                          } group-hover:opacity-80 group-hover:shadow-xl`}
                          style={{ 
                            height: `${heightPercent}%`,
                            minHeight: '20px'
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                            {hour.temp}°C at {hour.hour}:00
                          </div>
                        </div>
                        {index % 3 === 0 && (
                          <div className="text-xs text-gray-600 mt-2 font-medium">{hour.hour}h</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Temperature scale */}
                <div className="absolute left-0 top-4 flex flex-col justify-between h-full text-xs text-gray-500">
                  <span>{maxTemp}°C</span>
                  <span>{Math.round((maxTemp + minTemp) / 2)}°C</span>
                  <span>{minTemp}°C</span>
                </div>
              </div>

              {/* Graph Legend */}
              <div className="flex items-center justify-center space-x-6 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-marigold rounded"></div>
                  <span className="text-sm text-gray-600">Optimal Time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-peacock rounded"></div>
                  <span className="text-sm text-gray-600">Other Times</span>
                </div>
              </div>

              <div className="bg-marigold bg-opacity-10 border-l-4 border-marigold p-4 rounded">
                <h4 className="font-semibold text-peacock mb-2">
                  Ideal for {activity}
                </h4>
                <p className="text-charcoal">
                  {optimalWindow.startHour}:00 - {optimalWindow.endHour}:00
                  <span className="text-gray-600 ml-2">
                    ({optimalWindow.endHour - optimalWindow.startHour} hours)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-charcoal mb-4">Hourly Data</h3>
            <div className="marble-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">
                        Weather
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">
                        Temp
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">
                        Feels Like
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">
                        Rain
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">
                        Wind
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.hourlyData.map((hour, index) => {
                      const isOptimal =
                        hour.hour >= optimalWindow.startHour && hour.hour < optimalWindow.endHour;

                      return (
                        <tr
                          key={index}
                          className={`border-t border-gray-100 ${
                            isOptimal ? 'bg-marigold bg-opacity-10' : ''
                          } hover:bg-gray-50 transition-colors`}
                        >
                          <td className="px-4 py-3 text-sm font-medium">{hour.hour}:00</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <WeatherIcon condition={hour.condition} size={20} />
                              <span className="text-sm">{hour.description}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{hour.temp}°C</td>
                          <td className="px-4 py-3 text-sm">{hour.feelsLike}°C</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Droplets size={16} className="text-blue-500" />
                              <span className="text-sm">{hour.precipitation}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Wind size={16} className="text-gray-500" />
                              <span className="text-sm">{hour.wind} km/h</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {alerts.length > 0 && (
            <div>
              <h3 className="text-2xl font-semibold text-charcoal mb-4">
                Health & Safety Alerts
              </h3>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    className="marble-card p-4 border-l-4 border-orange-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                      <p className="text-sm text-charcoal">{alert}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
