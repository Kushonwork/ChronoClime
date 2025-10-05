import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Camera, Sandwich, Bike, Waves, Tent, Trophy, Bird, Sparkles, Flower2, X } from 'lucide-react';
import MapSelector from './MapSelector';
import { addSavedActivity } from '../services/favoritesService';

interface ActivityPlannerProps {
  location: string;
  onSubmit: (activity: string, location: string, startDate: string, endDate: string) => Promise<void>;
  onBack: () => void;
}

const activityOptions = [
  { name: 'Trekking', icon: Mountain },
  { name: 'Photography', icon: Camera },
  { name: 'Picnic', icon: Sandwich },
  { name: 'Cycling', icon: Bike },
  { name: 'Beach Day', icon: Waves },
  { name: 'Camping', icon: Tent },
  { name: 'Outdoor Sports', icon: Trophy },
  { name: 'Bird Watching', icon: Bird },
  { name: 'Stargazing', icon: Sparkles },
  { name: 'Gardening', icon: Flower2 },
];

export default function ActivityPlanner({ location: initialLocation, onSubmit, onBack }: ActivityPlannerProps) {
  const [activity, setActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleActivitySelect = (activityName: string) => {
    setActivity(activityName);
    setShowCustomInput(false);
    setCustomActivity('');
  };

  const handleCustomActivity = () => {
    setShowCustomInput(true);
    setActivity('');
  };

  const handleLocationSelect = (loc: string) => {
    setSelectedLocation(loc);
    setShowMap(false);
  };

  const handleSubmit = async () => {
    const finalActivity = showCustomInput ? customActivity : activity;
    console.log('ActivityPlanner handleSubmit called with:', {
      finalActivity,
      selectedLocation,
      startDate,
      endDate,
      showCustomInput,
      customActivity,
      activity
    });
    
    if (finalActivity && selectedLocation && startDate && endDate) {
      setIsSubmitting(true);
      try {
        // Save activity to favorites
        try {
          addSavedActivity({
            name: finalActivity,
            location: selectedLocation,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
          });
          console.log('Activity saved to favorites successfully');
        } catch (saveError) {
          console.error('Error saving activity to favorites:', saveError);
          // Continue with the main flow even if saving fails
        }

        console.log('Calling onSubmit with:', finalActivity, selectedLocation, startDate, endDate);
        await onSubmit(finalActivity, selectedLocation, startDate, endDate);
        console.log('onSubmit completed successfully');
      } catch (error) {
        console.error('Error submitting activity:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Validation failed - missing required fields');
    }
  };

  const isValid =
    (activity || customActivity) &&
    selectedLocation &&
    startDate &&
    endDate &&
    startDate <= endDate;

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-8">
          <button
            onClick={onBack}
            className="text-peacock hover:text-marigold transition-colors mb-4 flex items-center gap-2"
          >
            ← Back to Forecast
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-peacock mb-2">
            Plan Your Activity
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us what you want to do, and we'll find the perfect conditions
          </p>
        </div>

        <div className="marble-card p-8 mb-6">
          <div className="space-y-8">
            <div>
              <label className="block text-xl font-semibold text-charcoal mb-4">
                I want to go
              </label>

              {!showCustomInput && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {activityOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.name}
                        onClick={() => handleActivitySelect(option.name)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          activity === option.name
                            ? 'border-gold bg-gold bg-opacity-10'
                            : 'border-gray-200 hover:border-marigold'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="mx-auto mb-2 text-peacock" size={32} />
                        <span className="text-sm font-medium">{option.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={handleCustomActivity}
                className="text-peacock hover:text-marigold transition-colors font-medium"
              >
                + Add custom activity
              </button>

              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    value={customActivity}
                    onChange={e => setCustomActivity(e.target.value)}
                    placeholder="Enter your activity (e.g., painting, fishing)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-peacock focus:outline-none"
                  />
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-xl font-semibold text-charcoal mb-4">
                near
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  placeholder="Enter location"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-peacock focus:outline-none"
                />
                <button
                  onClick={() => setShowMap(true)}
                  className="px-6 py-3 bg-peacock text-white rounded-xl hover:bg-opacity-90 transition-all font-medium"
                >
                  Choose on Map
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xl font-semibold text-charcoal mb-4">
                  between
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  min={today}
                  max={maxDateStr}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-peacock focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xl font-semibold text-charcoal mb-4">
                  and
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate || today}
                  max={maxDateStr}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-peacock focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="liquid-button text-lg px-12 py-4"
            style={{ opacity: isValid && !isSubmitting ? 1 : 0.5 }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Find Optimal Conditions'
            )}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-charcoal">Select Location</h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-500 hover:text-charcoal"
                >
                  <X size={24} />
                </button>
              </div>
              <MapSelector
                initialLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
