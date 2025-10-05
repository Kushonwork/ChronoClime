import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  NotificationData, 
  loadNotifications, 
  markNotificationAsRead, 
  clearAllNotifications,
  getUnreadNotificationCount 
} from '../services/notificationService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  updateNotificationCount: () => void;
}

const getNotificationIcon = (type: NotificationData['type'], severity: NotificationData['severity']) => {
  if (type === 'weather_alert' || type === 'safety_warning') {
    return severity === 'critical' ? AlertTriangle : AlertCircle;
  }
  if (type === 'optimal_conditions') {
    return CheckCircle;
  }
  return Info;
};

const getNotificationColor = (severity: NotificationData['severity']) => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function NotificationCenter({ isOpen, onClose, updateNotificationCount }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const loadedNotifications = loadNotifications();
      setNotifications(loadedNotifications);
      setUnreadCount(getUnreadNotificationCount());
    }
  }, [isOpen]);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(getUnreadNotificationCount());
    updateNotificationCount(); // Update the parent component's count
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
    updateNotificationCount(); // Update the parent component's count
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

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
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="text-peacock" size={24} />
                <h2 className="text-2xl font-bold text-charcoal">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-marigold text-white text-sm font-semibold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-gray-500 hover:text-charcoal transition-colors text-sm"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-charcoal transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications</h3>
                  <p className="text-gray-500">You're all caught up! Weather alerts and activity reminders will appear here.</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Unread notifications */}
                  {unreadNotifications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-3 px-2">Unread</h3>
                      {unreadNotifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                    </div>
                  )}

                  {/* Read notifications */}
                  {readNotifications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-3 px-2">Read</h3>
                      {readNotifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type, notification.severity);
  const colorClass = getNotificationColor(notification.severity);

  return (
    <motion.div
      className={`p-4 rounded-xl border-l-4 ${colorClass} ${
        !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Mark as read
              </button>
            )}
          </div>
          <p className="text-sm mt-1 opacity-90">{notification.message}</p>
          <p className="text-xs mt-2 opacity-75">{formatTimeAgo(notification.timestamp)}</p>
        </div>
      </div>
    </motion.div>
  );
}

