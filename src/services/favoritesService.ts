// Favorites service for saving locations and activities
export interface FavoriteLocation {
  id: string;
  name: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  addedAt: Date;
  lastAccessed?: Date;
  accessCount: number;
}

export interface SavedActivity {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  optimalDay?: Date;
  optimalScore?: number;
  createdAt: Date;
  lastViewed?: Date;
  viewCount: number;
}

export interface ActivityHistory {
  id: string;
  activity: string;
  location: string;
  date: Date;
  score: number;
  weather: {
    temp: number;
    condition: string;
    precipitation: number;
    wind: number;
  };
}

// Local storage keys
const FAVORITE_LOCATIONS_KEY = 'chronoclime_favorite_locations';
const SAVED_ACTIVITIES_KEY = 'chronoclime_saved_activities';
const ACTIVITY_HISTORY_KEY = 'chronoclime_activity_history';

// Favorite Locations Management
export function saveFavoriteLocations(locations: FavoriteLocation[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(FAVORITE_LOCATIONS_KEY, JSON.stringify(locations));
    }
  } catch (error) {
    console.error('Failed to save favorite locations:', error);
  }
}

export function loadFavoriteLocations(): FavoriteLocation[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(FAVORITE_LOCATIONS_KEY);
      if (stored) {
        const locations = JSON.parse(stored);
        // Convert date strings back to Date objects
        return locations.map((loc: any) => ({
          ...loc,
          addedAt: new Date(loc.addedAt),
          lastAccessed: loc.lastAccessed ? new Date(loc.lastAccessed) : undefined
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load favorite locations:', error);
  }
  return [];
}

export function addFavoriteLocation(location: Omit<FavoriteLocation, 'id' | 'addedAt' | 'accessCount'>): void {
  const locations = loadFavoriteLocations();
  
  // Check if location already exists
  const existingIndex = locations.findIndex(loc => 
    loc.name.toLowerCase() === location.name.toLowerCase()
  );
  
  if (existingIndex >= 0) {
    // Update existing location
    locations[existingIndex].lastAccessed = new Date();
    locations[existingIndex].accessCount += 1;
  } else {
    // Add new location
    const newLocation: FavoriteLocation = {
      ...location,
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date(),
      accessCount: 1
    };
    locations.unshift(newLocation);
  }
  
  saveFavoriteLocations(locations);
}

export function removeFavoriteLocation(id: string): void {
  const locations = loadFavoriteLocations();
  const filtered = locations.filter(loc => loc.id !== id);
  saveFavoriteLocations(filtered);
}

export function updateLocationAccess(id: string): void {
  const locations = loadFavoriteLocations();
  const location = locations.find(loc => loc.id === id);
  if (location) {
    location.lastAccessed = new Date();
    location.accessCount += 1;
    saveFavoriteLocations(locations);
  }
}

// Saved Activities Management
export function saveActivities(activities: SavedActivity[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(SAVED_ACTIVITIES_KEY, JSON.stringify(activities));
    }
  } catch (error) {
    console.error('Failed to save activities:', error);
  }
}

export function loadSavedActivities(): SavedActivity[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(SAVED_ACTIVITIES_KEY);
      if (stored) {
        const activities = JSON.parse(stored);
        // Convert date strings back to Date objects
        return activities.map((activity: any) => ({
          ...activity,
          startDate: new Date(activity.startDate),
          endDate: new Date(activity.endDate),
          optimalDay: activity.optimalDay ? new Date(activity.optimalDay) : undefined,
          createdAt: new Date(activity.createdAt),
          lastViewed: activity.lastViewed ? new Date(activity.lastViewed) : undefined
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load saved activities:', error);
  }
  return [];
}

export function addSavedActivity(activity: Omit<SavedActivity, 'id' | 'createdAt' | 'viewCount'>): void {
  const activities = loadSavedActivities();
  
  const newActivity: SavedActivity = {
    ...activity,
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    viewCount: 1
  };
  
  activities.unshift(newActivity);
  saveActivities(activities);
}

export function removeSavedActivity(id: string): void {
  const activities = loadSavedActivities();
  const filtered = activities.filter(activity => activity.id !== id);
  saveActivities(filtered);
}

export function updateActivityView(id: string): void {
  const activities = loadSavedActivities();
  const activity = activities.find(act => act.id === id);
  if (activity) {
    activity.lastViewed = new Date();
    activity.viewCount += 1;
    saveActivities(activities);
  }
}

export function updateActivityOptimalDay(id: string, optimalDay: Date, score: number): void {
  const activities = loadSavedActivities();
  const activity = activities.find(act => act.id === id);
  if (activity) {
    activity.optimalDay = optimalDay;
    activity.optimalScore = score;
    saveActivities(activities);
  }
}

// Activity History Management
export function saveActivityHistory(history: ActivityHistory[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(ACTIVITY_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to save activity history:', error);
  }
}

export function loadActivityHistory(): ActivityHistory[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(ACTIVITY_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored);
        // Convert date strings back to Date objects
        return history.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load activity history:', error);
  }
  return [];
}

export function addActivityHistory(historyItem: Omit<ActivityHistory, 'id'>): void {
  const history = loadActivityHistory();
  
  const newItem: ActivityHistory = {
    ...historyItem,
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  history.unshift(newItem);
  
  // Keep only last 100 history items
  if (history.length > 100) {
    history.splice(100);
  }
  
  saveActivityHistory(history);
}

// Utility functions
export function getMostAccessedLocations(limit: number = 5): FavoriteLocation[] {
  const locations = loadFavoriteLocations();
  return locations
    .sort((a, b) => b.accessCount - a.accessCount)
    .slice(0, limit);
}

export function getRecentlyViewedActivities(limit: number = 5): SavedActivity[] {
  const activities = loadSavedActivities();
  return activities
    .filter(activity => activity.lastViewed)
    .sort((a, b) => (b.lastViewed?.getTime() || 0) - (a.lastViewed?.getTime() || 0))
    .slice(0, limit);
}

export function getActivityStats(): {
  totalActivities: number;
  totalLocations: number;
  totalHistoryItems: number;
  mostPopularActivity: string | null;
  mostPopularLocation: string | null;
} {
  const activities = loadSavedActivities();
  const locations = loadFavoriteLocations();
  const history = loadActivityHistory();
  
  // Find most popular activity
  const activityCounts = activities.reduce((acc, activity) => {
    acc[activity.name] = (acc[activity.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostPopularActivity = Object.entries(activityCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  
  // Find most popular location
  const locationCounts = locations.reduce((acc, location) => {
    acc[location.name] = (acc[location.name] || 0) + location.accessCount;
    return acc;
  }, {} as Record<string, number>);
  
  const mostPopularLocation = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  
  return {
    totalActivities: activities.length,
    totalLocations: locations.length,
    totalHistoryItems: history.length,
    mostPopularActivity,
    mostPopularLocation
  };
}
