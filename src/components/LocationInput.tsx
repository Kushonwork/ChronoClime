import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Navigation, Heart } from 'lucide-react';
import { getCurrentLocationName, isGeolocationSupported } from '../services/geolocationService';
import { addFavoriteLocation, loadFavoriteLocations } from '../services/favoritesService';

interface LocationInputProps {
  onLocationSelect: (location: string) => Promise<void>;
}

export default function LocationInput({ onLocationSelect }: LocationInputProps) {
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>([]);

  // Load favorite locations on component mount
  useEffect(() => {
    const favorites = loadFavoriteLocations();
    setFavoriteLocations(favorites.map(fav => fav.name));
  }, []);

  const handleAddToFavorites = (cityName: string) => {
    addFavoriteLocation({
      name: cityName,
      accessCount: 0
    });
    setFavoriteLocations(prev => [...prev, cityName]);
  };

  const isFavorite = (cityName: string) => favoriteLocations.includes(cityName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    setIsSearching(true);
    setLocationError(null);
    try {
      await onLocationSelect(location);
    } catch (error) {
      console.error('Error selecting location:', error);
      setLocationError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = async () => {
    if (!isGeolocationSupported()) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);
    
    try {
      const currentLocation = await getCurrentLocationName();
      setLocation(currentLocation);
      await onLocationSelect(currentLocation);
    } catch (error) {
      console.error('Error getting current location:', error);
      setLocationError('Unable to get your current location. Please enter a city name manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-peacock mb-4">ChronoClime</h1>
          <p className="text-xl text-gray-600">
            Your intelligent weather companion for perfect planning
          </p>
        </motion.div>

        <motion.div
          className="marble-card p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="text-marigold" size={32} />
            <h2 className="text-2xl font-semibold text-charcoal">
              Where would you like to check the weather?
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter city name (e.g., Mumbai, Jaipur, Delhi)"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-peacock focus:outline-none transition-colors"
                disabled={isSearching}
              />
              <Search
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={24}
              />
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={!location.trim() || isSearching || isGettingLocation}
                className="liquid-button w-full text-lg py-4"
                style={{ opacity: location.trim() && !isSearching && !isGettingLocation ? 1 : 0.5 }}
              >
                {isSearching ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  'Get Weather Forecast'
                )}
              </button>

              {isGeolocationSupported() && (
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  disabled={isSearching || isGettingLocation}
                  className="w-full px-6 py-3 border-2 border-peacock text-peacock rounded-xl hover:bg-peacock hover:text-white transition-all font-medium flex items-center justify-center gap-2"
                  style={{ opacity: !isSearching && !isGettingLocation ? 1 : 0.5 }}
                >
                  {isGettingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-peacock border-t-transparent rounded-full animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation size={20} />
                      Use Current Location
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <p className="text-red-600 text-sm text-center">{locationError}</p>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center mb-3">Popular locations:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Mumbai', 'Delhi', 'Bangalore', 'Jaipur', 'Goa', 'Manali'].map(city => (
                <div key={city} className="relative group">
                  <button
                    onClick={async () => {
                      setLocation(city);
                      setIsSearching(true);
                      setLocationError(null);
                      try {
                        await onLocationSelect(city);
                      } catch (error) {
                        console.error('Error selecting city:', error);
                        setLocationError('Failed to fetch weather data. Please try again.');
                      } finally {
                        setIsSearching(false);
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-marigold hover:text-white rounded-lg text-sm font-medium transition-colors"
                    disabled={isSearching || isGettingLocation}
                  >
                    {city}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToFavorites(city);
                    }}
                    className={`absolute -top-1 -right-1 p-1 rounded-full transition-all ${
                      isFavorite(city) 
                        ? 'bg-marigold text-white' 
                        : 'bg-white text-gray-400 hover:text-marigold hover:bg-marigold hover:bg-opacity-20'
                    }`}
                    title={isFavorite(city) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart size={12} fill={isFavorite(city) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center mt-6 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Get detailed forecasts, air quality data, and plan your perfect outdoor activities
        </motion.p>
      </div>
    </motion.div>
  );
}
