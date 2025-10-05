import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LocationInput from './components/LocationInput';
import LivingForecast from './components/LivingForecast';
import ActivityPlanner from './components/ActivityPlanner';
import ACISResults from './components/ACISResults';
import DayDetail from './components/DayDetail';
import ChatBot from './components/ChatBot';
import WeatherBackground from './components/WeatherBackground';
import NotificationCenter from './components/NotificationCenter';
import NotificationBell from './components/NotificationBell';
import FavoritesPanel from './components/FavoritesPanel';
import FavoritesButton from './components/FavoritesButton';
import ESP8266Status from './components/ESP8266Status';
import SatelliteConnection from './components/SatelliteConnection';
import { generateDailyForecast, DailyWeather } from './utils/weatherData';
import { ChatContext } from './utils/chatbot';
import { fetchCompleteWeatherData, testApiKey } from './services/weatherService';
import { checkAndShowWeatherAlerts, requestNotificationPermission } from './services/notificationService';
import { esp8266CSVService, ESP8266CSVConnectionState } from './services/esp8266CSVService';
// import { addFavoriteLocation, loadFavoriteLocations } from './services/favoritesService';
// import { getCurrentLocationName, isGeolocationSupported } from './services/geolocationService';

type AppView = 'location' | 'forecast' | 'planner' | 'results';

function App() {
  const [view, setView] = useState<AppView>('location');
  const [location, setLocation] = useState('');
  const [forecast, setForecast] = useState<DailyWeather[]>([]);
  const [activity, setActivity] = useState('');
  const [selectedDay, setSelectedDay] = useState<DailyWeather | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // ESP8266 Gateway states
  const [esp8266State, setEsp8266State] = useState<ESP8266CSVConnectionState>({
    isConnecting: false,
    isConnected: false,
    hasLocation: false
  });
  const [showSatelliteAnimation, setShowSatelliteAnimation] = useState(false);
  const [esp8266WeatherLoaded, setEsp8266WeatherLoaded] = useState(false);

  const [chatContext, setChatContext] = useState<ChatContext>({});

  // Request notification permission on app startup
  useEffect(() => {
    console.log('App starting up...');
    try {
      requestNotificationPermission();
      
      // Test API key on startup
      testApiKey().then(isValid => {
        if (isValid) {
          console.log('✅ Weather API key is valid');
          setDebugInfo('✅ Weather API key is valid');
        } else {
          console.log('❌ Weather API key is invalid or network error');
          setDebugInfo('❌ Weather API key is invalid or network error');
        }
      });
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }, []);

  // ESP8266 service listener - ONLY for status updates, NO automatic weather loading
  useEffect(() => {
    const handleESP8266StateChange = (state: ESP8266CSVConnectionState) => {
      setEsp8266State(state);
      
      // Show satellite animation when connecting
      if (state.isConnecting && !showSatelliteAnimation) {
        setShowSatelliteAnimation(true);
      }
      
      // NO automatic weather loading - only manual connect button triggers weather
    };

    // Listen for manual ESP8266 location events
    const handleESP8266LocationReceived = (event: CustomEvent) => {
      const location = event.detail.location;
      console.log('🛰️ Manual ESP8266 location received:', location);
      handleLocationSelect(location);
    };

    esp8266CSVService.addStateListener(handleESP8266StateChange);
    window.addEventListener('esp8266LocationReceived', handleESP8266LocationReceived as EventListener);
    
    // Get initial state
    setEsp8266State(esp8266CSVService.getConnectionState());

    return () => {
      esp8266CSVService.removeStateListener(handleESP8266StateChange);
      window.removeEventListener('esp8266LocationReceived', handleESP8266LocationReceived as EventListener);
    };
  }, [showSatelliteAnimation]);


  const handlePlanActivity = () => {
    setView('planner');
  };

  const handleActivitySubmit = async (
    activityName: string,
    activityLocation: string,
    startDate: string,
    _endDate: string
  ) => {
    console.log('App.tsx handleActivitySubmit called with:', {
      activityName,
      activityLocation,
      startDate,
      _endDate
    });
    
    setActivity(activityName);
    setLocation(activityLocation);
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching real weather data for activity: ${activityName} in ${activityLocation}`);
      const newForecast = await fetchCompleteWeatherData(activityLocation);
      console.log('Weather data fetched successfully:', newForecast?.length, 'days');
      
      if (!newForecast || newForecast.length === 0) {
        throw new Error('No weather data received');
      }
      
      setForecast(newForecast);
      setView('results');
      console.log('View changed to results');

      try {
        if (newForecast && newForecast[0]) {
          setChatContext({
            currentLocation: activityLocation,
            currentActivity: activityName,
            currentWeather: newForecast[0],
          });
          console.log('Chat context set successfully');
        } else {
          console.warn('No weather data available for chat context');
        }
      } catch (contextError) {
        console.error('Error setting chat context:', contextError);
        // Continue without chat context
      }
    } catch (err) {
      console.error('Error fetching weather data for activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      
      // Fallback to mock data
      console.log('Falling back to mock data for activity');
      const start = new Date(startDate);
      const fallbackForecast = generateDailyForecast(start, 14);
      setForecast(fallbackForecast);
      setView('results');

      if (fallbackForecast && fallbackForecast[0]) {
        setChatContext({
          currentLocation: activityLocation,
          currentActivity: activityName,
          currentWeather: fallbackForecast[0],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaySelect = (day: DailyWeather, _index: number) => {
    setSelectedDay(day);
    setChatContext(prev => ({
      ...prev,
      viewingDay: day.date,
      currentWeather: day,
    }));
  };

  const handleCloseDayDetail = () => {
    setSelectedDay(null);
  };

  const handleBackToForecast = () => {
    setView('forecast');
  };

  const handleBackToPlanner = () => {
    setView('planner');
  };

  const updateNotificationCount = () => {
    // This function will be called by NotificationCenter to update the notification count
    // The actual count update logic is handled by the NotificationBell component
    console.log('Notification count updated');
  };

  // Reset ESP8266 weather loading flag when manually selecting a location
  const handleLocationSelect = async (loc: string) => {
    // Reset ESP8266 weather flag if manually selecting a different location
    if (loc !== esp8266State.location) {
      setEsp8266WeatherLoaded(false);
    }
    
    setLocation(loc);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching real weather data for: ${loc}`);
      const newForecast = await fetchCompleteWeatherData(loc);
      setForecast(newForecast);
      setView('forecast');

      // Check for weather alerts after fetching forecast
      try {
        await checkAndShowWeatherAlerts(newForecast);
      } catch (alertError) {
        console.error('Error checking weather alerts:', alertError);
      }

      // Set chat context for the new location
      if (newForecast && newForecast[0]) {
        setChatContext({
          currentLocation: loc,
          currentWeather: newForecast[0],
        });
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      
      // Fallback to mock data
      const start = new Date();
      const fallbackForecast = generateDailyForecast(start, 14);
      setForecast(fallbackForecast);
      setView('forecast');

      if (fallbackForecast && fallbackForecast[0]) {
        setChatContext({
          currentLocation: loc,
          currentWeather: fallbackForecast[0],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentWeatherCondition = forecast.length > 0 ? forecast[0].condition : 'sunny';

  return (
    <div className="relative min-h-screen">
      <WeatherBackground condition={currentWeatherCondition} />

      <div className="relative z-10">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-peacock border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-semibold">Loading weather data...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-2 py-1 rounded text-xs">
            {debugInfo}
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === 'location' && (
            <LocationInput key="location" onLocationSelect={handleLocationSelect} />
          )}

          {view === 'forecast' && (
            <LivingForecast
              key="forecast"
              location={location}
              forecast={forecast}
              onPlanActivity={handlePlanActivity}
            />
          )}

          {view === 'planner' && (
            <ActivityPlanner
              key="planner"
              location={location}
              onSubmit={handleActivitySubmit}
              onBack={handleBackToForecast}
            />
          )}

          {view === 'results' && (
            <ACISResults
              key="results"
              activity={activity}
              location={location}
              forecast={forecast}
              onDaySelect={handleDaySelect}
              onBack={handleBackToPlanner}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedDay && (
            <DayDetail
              key="day-detail"
              day={selectedDay}
              activity={activity}
              onClose={handleCloseDayDetail}
            />
          )}
        </AnimatePresence>
      </div>

      {view !== 'location' && <ChatBot context={chatContext} />}
      
      {/* Top Right Buttons */}
      {view !== 'location' && (
        <div className="fixed top-6 right-6 z-40 flex gap-3">
          <ESP8266Status />
          <FavoritesButton onClick={() => setShowFavorites(true)} />
          <NotificationBell onClick={() => setShowNotifications(true)} />
        </div>
      )}

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        updateNotificationCount={updateNotificationCount}
      />

      {/* Favorites Panel */}
      <FavoritesPanel 
        isOpen={showFavorites} 
        onClose={() => setShowFavorites(false)}
        onLocationSelect={handleLocationSelect}
      />

      {/* Satellite Connection Animation */}
      <SatelliteConnection
        isConnecting={esp8266State.isConnecting}
        isConnected={esp8266State.isConnected}
        hasLocation={esp8266State.hasLocation}
        location={esp8266State.location}
        error={esp8266State.error}
        onComplete={() => setShowSatelliteAnimation(false)}
      />
    </div>
  );
}

export default App;
