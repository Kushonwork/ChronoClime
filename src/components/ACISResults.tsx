import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { DailyWeather, calculateACIS, getActivityPreferences } from '../utils/weatherData';
import ActivityShare from './ActivityShare';

interface ACISResultsProps {
  activity: string;
  location: string;
  forecast: DailyWeather[];
  onDaySelect: (day: DailyWeather, index: number) => void;
  onBack: () => void;
}

export default function ACISResults({ activity, location, forecast, onDaySelect, onBack }: ACISResultsProps) {
  const preferences = getActivityPreferences(activity);

  const resultsWithScores = forecast.map(day => {
    const result = calculateACIS(day, preferences);
    return { day, ...result };
  });

  const bestDayIndex = resultsWithScores.reduce(
    (maxIdx, curr, idx, arr) => (curr.score > arr[maxIdx].score ? idx : maxIdx),
    0
  );

  const bestResult = resultsWithScores[bestDayIndex];

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-peacock hover:text-marigold transition-colors mb-4 flex items-center gap-2"
          >
            ← Back to Planning
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-peacock mb-2">
            {activity} in {location}
          </h1>
          <p className="text-gray-600 text-lg">
            Optimal conditions analysis for your activity
          </p>
        </div>

        {/* Activity Sharing */}
        {forecast && forecast.length > 0 && (
          <ActivityShare
            activity={activity}
            location={location}
            startDate={forecast[0].date.toISOString().split('T')[0]}
            endDate={forecast[6] ? forecast[6].date.toISOString().split('T')[0] : forecast[forecast.length - 1].date.toISOString().split('T')[0]}
            optimalConditions={`${bestResult.day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} - Best conditions with ACIS score of ${bestResult.score}/10`}
            acisScore={bestResult.score}
            className="mb-6"
          />
        )}

        <motion.div
          className="marble-card p-8 mb-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-charcoal mb-6">
            Activity Climate Index Score
          </h2>

          <motion.div
            className="relative inline-block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <div className="gold-glow w-48 h-48 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-gold to-marigold">
              <div className="bg-white w-44 h-44 rounded-full flex items-center justify-center">
                <div>
                  <div className="text-6xl font-bold text-peacock">
                    {bestResult.score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">out of 10</div>
                </div>
              </div>
            </div>
          </motion.div>

          {bestResult.factors.length > 0 && (
            <motion.div
              className="mt-8 flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {bestResult.factors.map((factor, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"
                >
                  {factor.impact < 0 ? (
                    <TrendingDown className="text-red-500" size={20} />
                  ) : (
                    <TrendingUp className="text-green-500" size={20} />
                  )}
                  <span className="font-medium">{factor.name}</span>
                  <span className={factor.impact < 0 ? 'text-red-600' : 'text-green-600'}>
                    {factor.impact > 0 ? '+' : ''}
                    {factor.impact}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <div className="mb-4">
          <h3 className="text-2xl font-semibold text-charcoal mb-2">Daily Breakdown</h3>
          <p className="text-gray-600">
            Tap any day to see hourly details and optimal time windows
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {resultsWithScores.map((result, index) => {
            const isBestDay = index === bestDayIndex;

            return (
              <motion.div
                key={index}
                className={`marble-card p-6 cursor-pointer relative ${
                  isBestDay ? 'border-4 border-gold' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.03, rotateY: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDaySelect(result.day, index)}
              >
                {isBestDay && (
                  <div className="absolute -top-3 -right-3 bg-gold text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <Award size={16} />
                    Best Day
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {result.day.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>

                  <div className="my-4">
                    <div
                      className={`text-4xl font-bold ${
                        result.score >= 8
                          ? 'text-green-600'
                          : result.score >= 6
                          ? 'text-blue-600'
                          : result.score >= 4
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}
                    >
                      {result.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">ACIS Score</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temp:</span>
                      <span className="font-medium">
                        {result.day.tempMin}° - {result.day.tempMax}°C
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rain:</span>
                      <span className="font-medium">{result.day.precipitation}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wind:</span>
                      <span className="font-medium">{result.day.wind} km/h</span>
                    </div>
                  </div>

                  {result.score < 6 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-orange-600 font-medium">
                        Consider alternative days
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
