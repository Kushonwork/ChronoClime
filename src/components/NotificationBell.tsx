import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { getUnreadNotificationCount } from '../services/notificationService';

interface NotificationBellProps {
  onClick: () => void;
}

export default function NotificationBell({ onClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Update unread count on mount
    setUnreadCount(getUnreadNotificationCount());

    // Listen for storage changes (when notifications are added/updated from other tabs)
    const handleStorageChange = () => {
      setUnreadCount(getUnreadNotificationCount());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes every 30 seconds
    const interval = setInterval(() => {
      setUnreadCount(getUnreadNotificationCount());
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <motion.button
      className="relative p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Bell size={24} className="text-peacock" />
      
      {unreadCount > 0 && (
        <motion.div
          className="absolute -top-1 -right-1 bg-marigold text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </motion.div>
      )}
      
      {/* Pulse animation for new notifications */}
      {unreadCount > 0 && (
        <motion.div
          className="absolute inset-0 rounded-full bg-marigold opacity-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

