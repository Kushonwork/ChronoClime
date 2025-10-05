import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Calendar, Star, Trash2, Clock, TrendingUp, X } from 'lucide-react';
import { 
  FavoriteLocation, 
  SavedActivity, 
  loadFavoriteLocations, 
  loadSavedActivities,
  removeFavoriteLocation,
  removeSavedActivity,
  updateLocationAccess,
  updateActivityView,
  getMostAccessedLocations,
  getRecentlyViewedActivities,
  getActivityStats
} from '../services/favoritesService';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => Promise<void>;
  onActivitySelect?: (activity: SavedActivity) => void;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return formatDate(date);
};

export default function FavoritesPanel({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  onActivitySelect 
}: FavoritesPanelProps) {
  const [activeTab, setActiveTab] = useState<'locations' | 'activities' | 'stats'>('locations');
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocation[]>([]);
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([]);
  const [stats, setStats] = useState(getActivityStats());

  useEffect(() => {
    if (isOpen) {
      setFavoriteLocations(loadFavoriteLocations());
      setSavedActivities(loadSavedActivities());
      setStats(getActivityStats());
    }
  }, [isOpen]);

  const handleLocationClick = async (location: FavoriteLocation) => {
    updateLocationAccess(location.id);
    await onLocationSelect(location.name);
    onClose();
  };

  const handleActivityClick = (activity: SavedActivity) => {
    updateActivityView(activity.id);
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
    onClose();
  };

  const handleRemoveLocation = (id: string) => {
    removeFavoriteLocation(id);
    setFavoriteLocations(loadFavoriteLocations());
    setStats(getActivityStats());
  };

  const handleRemoveActivity = (id: string) => {
    removeSavedActivity(id);
    setSavedActivities(loadSavedActivities());
    setStats(getActivityStats());
  };

  const mostAccessed = getMostAccessedLocations(3);
  const recentlyViewed = getRecentlyViewedActivities(3);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Heart className="text-marigold" size={24} />
                <h2 className="text-2xl font-bold text-charcoal">Favorites & History</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-charcoal transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'locations', label: 'Locations', icon: MapPin },
                { id: 'activities', label: 'Activities', icon: Calendar },
                { id: 'stats', label: 'Stats', icon: TrendingUp }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-peacock border-b-2 border-peacock'
                        : 'text-gray-500 hover:text-charcoal'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {activeTab === 'locations' && (
                <div className="space-y-6">
                  {/* Most Accessed */}
                  {mostAccessed.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                        <Star className="text-marigold" size={20} />
                        Most Accessed
                      </h3>
                      <div className="grid gap-3">
                        {mostAccessed.map(location => (
                          <LocationCard
                            key={location.id}
                            location={location}
                            onClick={() => handleLocationClick(location)}
                            onRemove={() => handleRemoveLocation(location.id)}
                            isMostAccessed
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Locations */}
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-4">All Locations</h3>
                    {favoriteLocations.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500">No favorite locations yet</p>
                        <p className="text-sm text-gray-400 mt-1">Search for a location and add it to favorites</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {favoriteLocations.map(location => (
                          <LocationCard
                            key={location.id}
                            location={location}
                            onClick={() => handleLocationClick(location)}
                            onRemove={() => handleRemoveLocation(location.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activities' && (
                <div className="space-y-6">
                  {/* Recently Viewed */}
                  {recentlyViewed.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center gap-2">
                        <Clock className="text-marigold" size={20} />
                        Recently Viewed
                      </h3>
                      <div className="grid gap-3">
                        {recentlyViewed.map(activity => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onClick={() => handleActivityClick(activity)}
                            onRemove={() => handleRemoveActivity(activity.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Activities */}
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal mb-4">All Activities</h3>
                    {savedActivities.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500">No saved activities yet</p>
                        <p className="text-sm text-gray-400 mt-1">Plan an activity and save it for later</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {savedActivities.map(activity => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onClick={() => handleActivityClick(activity)}
                            onRemove={() => handleRemoveActivity(activity.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="marble-card p-6">
                      <h3 className="text-lg font-semibold text-charcoal mb-4">Usage Statistics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Locations</span>
                          <span className="font-semibold">{stats.totalLocations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Activities</span>
                          <span className="font-semibold">{stats.totalActivities}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">History Items</span>
                          <span className="font-semibold">{stats.totalHistoryItems}</span>
                        </div>
                      </div>
                    </div>

                    <div className="marble-card p-6">
                      <h3 className="text-lg font-semibold text-charcoal mb-4">Most Popular</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600 text-sm">Activity</span>
                          <p className="font-semibold">{stats.mostPopularActivity || 'None'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-sm">Location</span>
                          <p className="font-semibold">{stats.mostPopularLocation || 'None'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LocationCardProps {
  location: FavoriteLocation;
  onClick: () => void;
  onRemove: () => void;
  isMostAccessed?: boolean;
}

function LocationCard({ location, onClick, onRemove, isMostAccessed }: LocationCardProps) {
  return (
    <motion.div
      className="marble-card p-4 cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMostAccessed && <Star className="text-marigold" size={16} />}
          <div>
            <h4 className="font-semibold text-charcoal">{location.name}</h4>
            <p className="text-sm text-gray-500">
              Added {formatTimeAgo(location.addedAt)} • Accessed {location.accessCount} times
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

interface ActivityCardProps {
  activity: SavedActivity;
  onClick: () => void;
  onRemove: () => void;
}

function ActivityCard({ activity, onClick, onRemove }: ActivityCardProps) {
  return (
    <motion.div
      className="marble-card p-4 cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-charcoal">{activity.name}</h4>
          <p className="text-sm text-gray-600">{activity.location}</p>
          <p className="text-sm text-gray-500">
            {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
            {activity.optimalScore && ` • Best score: ${activity.optimalScore.toFixed(1)}/10`}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-4"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}
