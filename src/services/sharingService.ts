// Social sharing service for weather forecasts and activity plans
import { DailyWeather } from '../utils/weatherData';

export interface ShareableContent {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  hashtags?: string[];
}

export interface WeatherShareData {
  location: string;
  currentWeather: DailyWeather;
  forecast: DailyWeather[];
  activity?: string;
}

export interface ActivityShareData {
  activity: string;
  location: string;
  startDate: string;
  endDate: string;
  optimalConditions: string;
  acisScore: number;
}

// Generate shareable content for weather forecasts
export function generateWeatherShareContent(data: WeatherShareData): ShareableContent {
  const { location, currentWeather, forecast, activity } = data;
  
  const temp = Math.round(currentWeather.temp);
  const condition = currentWeather.condition;
  const emoji = getWeatherEmoji(condition);
  
  let title = `${emoji} ${temp}°C in ${location}`;
  let description = `Current weather: ${condition}, ${temp}°C`;
  
  if (activity) {
    title = `🌤️ Perfect weather for ${activity} in ${location}`;
    description = `${emoji} ${temp}°C - Ideal conditions for ${activity} in ${location}`;
  }
  
  // Add forecast summary
  const tomorrow = forecast[1];
  if (tomorrow) {
    description += ` | Tomorrow: ${Math.round(tomorrow.temp)}°C`;
  }
  
  const hashtags = [
    '#Weather',
    '#ChronoClime',
    location.replace(/\s+/g, ''),
    activity ? `#${activity.replace(/\s+/g, '')}` : ''
  ].filter(Boolean);
  
  return {
    title,
    description,
    hashtags,
    url: window.location.href
  };
}

// Generate shareable content for activity plans
export function generateActivityShareContent(data: ActivityShareData): ShareableContent {
  const { activity, location, startDate, endDate, optimalConditions, acisScore } = data;
  
  const scoreEmoji = getScoreEmoji(acisScore);
  const dateRange = formatDateRange(startDate, endDate);
  
  const title = `${scoreEmoji} ${activity} in ${location}`;
  const description = `Planned ${activity} in ${location} ${dateRange}. ${optimalConditions} (ACIS Score: ${acisScore}/10)`;
  
  const hashtags = [
    '#ActivityPlanning',
    '#ChronoClime',
    `#${activity.replace(/\s+/g, '')}`,
    location.replace(/\s+/g, ''),
    '#WeatherPlanning'
  ];
  
  return {
    title,
    description,
    hashtags,
    url: window.location.href
  };
}

// Share to Twitter
export function shareToTwitter(content: ShareableContent): void {
  const text = `${content.title}\n\n${content.description}`;
  const hashtags = content.hashtags?.join(' ') || '';
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtags)}`;
  
  openShareWindow(url, 'Twitter');
}

// Share to Facebook
export function shareToFacebook(content: ShareableContent): void {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url || window.location.href)}&quote=${encodeURIComponent(content.description)}`;
  
  openShareWindow(url, 'Facebook');
}

// Share to LinkedIn
export function shareToLinkedIn(content: ShareableContent): void {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(content.url || window.location.href)}&title=${encodeURIComponent(content.title)}&summary=${encodeURIComponent(content.description)}`;
  
  openShareWindow(url, 'LinkedIn');
}

// Share to WhatsApp
export function shareToWhatsApp(content: ShareableContent): void {
  const text = `${content.title}\n\n${content.description}\n\n${content.url || window.location.href}`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  
  openShareWindow(url, 'WhatsApp');
}

// Share via Email
export function shareViaEmail(content: ShareableContent): void {
  const subject = content.title;
  const body = `${content.description}\n\nCheck it out: ${content.url || window.location.href}`;
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  window.location.href = url;
}

// Copy to clipboard
export async function copyToClipboard(content: ShareableContent): Promise<boolean> {
  const text = `${content.title}\n\n${content.description}\n\n${content.url || window.location.href}`;
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Generate shareable image (placeholder for future implementation)
export function generateShareableImage(content: ShareableContent): string {
  // This would generate a custom image with weather data
  // For now, return a placeholder
  return `https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=${encodeURIComponent(content.title)}`;
}

// Helper functions
function getWeatherEmoji(condition: string): string {
  const emojiMap: Record<string, string> = {
    'sunny': '☀️',
    'cloudy': '☁️',
    'rainy': '🌧️',
    'stormy': '⛈️',
    'snowy': '❄️',
    'partly-cloudy': '⛅'
  };
  return emojiMap[condition] || '🌤️';
}

function getScoreEmoji(score: number): string {
  if (score >= 8) return '🌟';
  if (score >= 6) return '👍';
  if (score >= 4) return '⚠️';
  return '❌';
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.toDateString() === end.toDateString()) {
    return `on ${start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
  }
  
  return `from ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function openShareWindow(url: string, platform: string): void {
  const width = 600;
  const height = 400;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    url,
    `${platform}Share`,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
}

// Check if sharing is supported
export function isSharingSupported(): boolean {
  return typeof navigator !== 'undefined' && (
    navigator.share !== undefined ||
    navigator.clipboard !== undefined ||
    document.execCommand !== undefined
  );
}

// Native sharing (if supported)
export async function nativeShare(content: ShareableContent): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: content.title,
        text: content.description,
        url: content.url || window.location.href
      });
      return true;
    } catch (error) {
      console.error('Native sharing failed:', error);
      return false;
    }
  }
  return false;
}
