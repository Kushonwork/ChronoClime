// Notification service for weather alerts and activity reminders
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'weather_alert' | 'activity_reminder' | 'optimal_conditions' | 'safety_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface WeatherAlert {
  type: 'temperature' | 'precipitation' | 'wind' | 'air_quality' | 'uv' | 'storm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  conditions: {
    current: number;
    threshold: number;
    unit: string;
  };
}

export interface ActivityReminder {
  activity: string;
  location: string;
  optimalDate: Date;
  score: number;
  reason: string;
}

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

// Show browser notification
export function showBrowserNotification(title: string, options: NotificationOptions = {}): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options
  });

  // Auto-close after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  // Handle click
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

// Generate weather alerts based on current conditions
export function generateWeatherAlerts(weather: any): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // Temperature alerts with personalized suggestions
  if (weather.temp < 0) {
    alerts.push({
      type: 'temperature',
      severity: 'high',
      message: `❄️ Freezing temperatures detected (${weather.temp}°C). Stay warm with layered clothing and avoid prolonged outdoor exposure.`,
      conditions: {
        current: weather.temp,
        threshold: 0,
        unit: '°C'
      }
    });
    
    // Add activity suggestion for cold weather
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🏠 Perfect weather for indoor activities: reading, cooking, board games, or visiting museums.',
      conditions: {
        current: weather.temp,
        threshold: 0,
        unit: '°C'
      }
    });
  } else if (weather.temp > 35) {
    alerts.push({
      type: 'temperature',
      severity: 'high',
      message: `🌡️ Extreme heat warning (${weather.temp}°C). Stay hydrated, seek shade, and avoid outdoor activities during peak hours.`,
      conditions: {
        current: weather.temp,
        threshold: 35,
        unit: '°C'
      }
    });
    
    // Add activity suggestion for hot weather
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🏊‍♂️ Great weather for swimming, indoor activities, or visiting air-conditioned places like malls and libraries.',
      conditions: {
        current: weather.temp,
        threshold: 35,
        unit: '°C'
      }
    });
  } else if (weather.temp >= 20 && weather.temp <= 30) {
    // Perfect weather activity suggestion
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🌤️ Perfect weather! Ideal for outdoor activities like hiking, cycling, picnics, or nature walks.',
      conditions: {
        current: weather.temp,
        threshold: 25,
        unit: '°C'
      }
    });
  }

  // Precipitation alerts with health advice
  if (weather.precipitation > 80) {
    alerts.push({
      type: 'precipitation',
      severity: 'high',
      message: `🌧️ Heavy precipitation expected (${weather.precipitation}%). Drive carefully and avoid outdoor activities.`,
      conditions: {
        current: weather.precipitation,
        threshold: 80,
        unit: '%'
      }
    });
    
    // Add health advice for heavy rain
    alerts.push({
      type: 'health_advice',
      severity: 'medium',
      message: '🚗 Drive carefully - wet roads increase accident risk by 40%. Carry an umbrella and waterproof clothing.',
      conditions: {
        current: weather.precipitation,
        threshold: 80,
        unit: '%'
      }
    });
    
    // Add activity suggestion for heavy rain
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🎬 Perfect day for indoor activities: movies, museums, indoor sports, or cozy reading at home.',
      conditions: {
        current: weather.precipitation,
        threshold: 80,
        unit: '%'
      }
    });
  } else if (weather.precipitation > 60) {
    alerts.push({
      type: 'precipitation',
      severity: 'medium',
      message: `🌦️ Significant rain expected (${weather.precipitation}%). Consider indoor alternatives.`,
      conditions: {
        current: weather.precipitation,
        threshold: 60,
        unit: '%'
      }
    });
  }

  // Wind alerts with health advice
  if (weather.wind > 50) {
    alerts.push({
      type: 'wind',
      severity: 'high',
      message: `💨 Strong winds expected (${weather.wind} km/h). Secure outdoor items and avoid high areas.`,
      conditions: {
        current: weather.wind,
        threshold: 50,
        unit: 'km/h'
      }
    });
    
    // Add health advice for strong winds
    alerts.push({
      type: 'health_advice',
      severity: 'medium',
      message: '👓 Protect your eyes from dust and debris. Consider wearing protective eyewear.',
      conditions: {
        current: weather.wind,
        threshold: 50,
        unit: 'km/h'
      }
    });
    
    // Add activity suggestion for strong winds
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🏠 Indoor activities recommended: yoga, meditation, indoor rock climbing, or home workouts.',
      conditions: {
        current: weather.wind,
        threshold: 50,
        unit: 'km/h'
      }
    });
  } else if (weather.wind > 30) {
    alerts.push({
      type: 'wind',
      severity: 'medium',
      message: `🌬️ Moderate winds expected (${weather.wind} km/h). Be cautious with outdoor activities.`,
      conditions: {
        current: weather.wind,
        threshold: 30,
        unit: 'km/h'
      }
    });
  } else if (weather.wind < 10 && weather.temp > 15) {
    // Calm weather activity suggestion
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🪁 Calm conditions perfect for outdoor yoga, kite flying, or peaceful nature walks.',
      conditions: {
        current: weather.wind,
        threshold: 10,
        unit: 'km/h'
      }
    });
  }

  // Air quality alerts with health advice
  if (weather.aqi > 150) {
    alerts.push({
      type: 'air_quality',
      severity: 'critical',
      message: `🌫️ Poor air quality (AQI ${weather.aqi}) - avoid outdoor activities, especially for sensitive groups.`,
      conditions: {
        current: weather.aqi,
        threshold: 150,
        unit: 'AQI'
      }
    });
    
    // Add health advice for poor air quality
    alerts.push({
      type: 'health_advice',
      severity: 'critical',
      message: '😷 Wear N95 mask if going outside. Keep windows closed and use air purifiers. Sensitive groups should stay indoors.',
      conditions: {
        current: weather.aqi,
        threshold: 150,
        unit: 'AQI'
      }
    });
    
    // Add activity suggestion for poor air quality
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🏠 Indoor activities only: home workouts, cooking, reading, or visiting indoor gardens/botanical centers.',
      conditions: {
        current: weather.aqi,
        threshold: 150,
        unit: 'AQI'
      }
    });
  } else if (weather.aqi > 100) {
    alerts.push({
      type: 'air_quality',
      severity: 'medium',
      message: `🌫️ Moderate air quality (AQI ${weather.aqi}) - sensitive groups should limit outdoor time.`,
      conditions: {
        current: weather.aqi,
        threshold: 100,
        unit: 'AQI'
      }
    });
  } else if (weather.aqi < 50) {
    // Good air quality suggestions
    alerts.push({
      type: 'activity_suggestion',
      severity: 'low',
      message: '🌱 Excellent air quality! Perfect for outdoor exercise, deep breathing, and nature activities.',
      conditions: {
        current: weather.aqi,
        threshold: 50,
        unit: 'AQI'
      }
    });
    
    alerts.push({
      type: 'health_advice',
      severity: 'low',
      message: '🌿 Great day for outdoor activities - the air is clean and fresh!',
      conditions: {
        current: weather.aqi,
        threshold: 50,
        unit: 'AQI'
      }
    });
  }

  // UV alerts with health advice
  if (weather.uv > 8) {
    alerts.push({
      type: 'uv',
      severity: 'high',
      message: `☀️ Very high UV index (${weather.uv}) - protect your skin with sunscreen and protective clothing.`,
      conditions: {
        current: weather.uv,
        threshold: 8,
        unit: 'UV Index'
      }
    });
    
    // Add health advice for high UV
    alerts.push({
      type: 'health_advice',
      severity: 'high',
      message: '🧴 Apply SPF 30+ sunscreen 30 minutes before going out. Reapply every 2 hours. Wear a wide-brimmed hat and UV-protective sunglasses.',
      conditions: {
        current: weather.uv,
        threshold: 8,
        unit: 'UV Index'
      }
    });
    
    // Add activity suggestion for high UV
    alerts.push({
      type: 'activity_suggestion',
      severity: 'medium',
      message: '⏰ Avoid outdoor activities between 10 AM - 4 PM when UV is strongest. Consider early morning or evening activities.',
      conditions: {
        current: weather.uv,
        threshold: 8,
        unit: 'UV Index'
      }
    });
  } else if (weather.uv > 6) {
    alerts.push({
      type: 'uv',
      severity: 'medium',
      message: 'High UV index - sunscreen recommended',
      conditions: {
        current: weather.uv,
        threshold: 6,
        unit: 'UV Index'
      }
    });
  }

  return alerts;
}

// Generate activity reminder
export function generateActivityReminder(
  activity: string,
  location: string,
  optimalDate: Date,
  score: number,
  reason: string
): ActivityReminder {
  return {
    activity,
    location,
    optimalDate,
    score,
    reason
  };
}

// Convert alerts to notifications
export function alertsToNotifications(alerts: WeatherAlert[], location: string): NotificationData[] {
  return alerts.map(alert => ({
    id: `weather_${alert.type}_${Date.now()}`,
    title: `${alert.severity.toUpperCase()} Weather Alert`,
    message: `${alert.message} in ${location}. Current: ${alert.conditions.current}${alert.conditions.unit}`,
    type: 'weather_alert',
    severity: alert.severity,
    timestamp: new Date(),
    read: false
  }));
}

// Convert activity reminder to notification
export function activityReminderToNotification(reminder: ActivityReminder): NotificationData {
  const daysUntil = Math.ceil((reminder.optimalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  return {
    id: `activity_${reminder.activity}_${Date.now()}`,
    title: 'Optimal Activity Conditions',
    message: `Perfect weather for ${reminder.activity} in ${reminder.location} ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}! ACIS Score: ${reminder.score}/10`,
    type: 'optimal_conditions',
    severity: 'low',
    timestamp: new Date(),
    read: false,
    actionUrl: '/planner'
  };
}

// Local storage for notifications
const NOTIFICATIONS_KEY = 'chronoclime_notifications';

export function saveNotifications(notifications: NotificationData[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

export function loadNotifications(): NotificationData[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        return notifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    }
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
  return [];
}

export function addNotification(notification: NotificationData): void {
  const notifications = loadNotifications();
  notifications.unshift(notification); // Add to beginning
  saveNotifications(notifications);
}

export function markNotificationAsRead(id: string): void {
  const notifications = loadNotifications();
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    saveNotifications(notifications);
  }
}

export function clearAllNotifications(): void {
  saveNotifications([]);
}

export function getUnreadNotificationCount(): number {
  const notifications = loadNotifications();
  return notifications.filter(n => !n.read).length;
}

// Schedule activity reminders
export function scheduleActivityReminder(reminder: ActivityReminder): void {
  const notification = activityReminderToNotification(reminder);
  addNotification(notification);
  
  // Show browser notification if permission granted
  if (Notification.permission === 'granted') {
    showBrowserNotification(notification.title, {
      body: notification.message,
      tag: `activity_${reminder.activity}`
    });
  }
}

// Check and show weather alerts
export function checkAndShowWeatherAlerts(weather: any, location: string): void {
  const alerts = generateWeatherAlerts(weather);
  const notifications = alertsToNotifications(alerts, location);
  
  notifications.forEach(notification => {
    addNotification(notification);
    
    // Show browser notification for high/critical severity
    if (notification.severity === 'high' || notification.severity === 'critical') {
      if (Notification.permission === 'granted') {
        showBrowserNotification(notification.title, {
          body: notification.message,
          tag: `weather_${location}`,
          requireInteraction: notification.severity === 'critical'
        });
      }
    }
  });
}
