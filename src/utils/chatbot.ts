import { DailyWeather, WeatherCondition } from './weatherData';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  currentLocation?: string;
  currentWeather?: DailyWeather;
  currentActivity?: string;
  viewingDay?: Date;
}

const jokes = [
  "Why did the meteorologist bring a bar of soap to work? Because they heard there was a chance of precipitation!",
  "What's a tornado's favorite game? Twister!",
  "Why don't weather forecasters ever win at poker? Because they always fold when there's a high pressure situation!",
  "What did one raindrop say to the other? Two's company, three's a cloud!",
  "Why did the sun go to school? To get a little brighter!",
];

const facts = [
  "The highest temperature ever recorded on Earth was 56.7°C (134°F) in Death Valley, California in 1913.",
  "Lightning strikes the Earth about 100 times per second, or roughly 8 million times per day!",
  "The coldest temperature ever recorded was -89.2°C (-128.6°F) at Antarctica's Vostok Station in 1983.",
  "A single hurricane can release energy equivalent to 10,000 nuclear bombs over its lifetime.",
  "Raindrops aren't actually tear-shaped. They're more like hamburger buns - flat on the bottom and rounded on top!",
  "The wettest place on Earth is Mawsynram, India, which receives an average of 467 inches of rain per year.",
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function formatTemperature(temp: number): string {
  return `${temp}°C`;
}

function getACISInterpretation(score: number): string {
  if (score >= 9) return "excellent conditions - perfect for your activity!";
  if (score >= 7) return "very good conditions with minor considerations.";
  if (score >= 5) return "acceptable conditions, but be prepared for some challenges.";
  if (score >= 3) return "less than ideal conditions. Consider rescheduling if possible.";
  return "poor conditions. It's recommended to reschedule your activity.";
}

function getGearRecommendations(weather: WeatherCondition, activity: string): string {
  const gear: string[] = [];

  if (weather.temp < 10) {
    gear.push("warm layers", "insulated jacket", "gloves", "thermal wear");
  } else if (weather.temp > 30) {
    gear.push("light, breathable clothing", "sun hat", "cooling towel");
  }

  if (weather.precipitation > 30) {
    gear.push("waterproof jacket", "rain pants", "water-resistant footwear");
  }

  if (weather.uv > 6) {
    gear.push("sunscreen (SPF 50+)", "sunglasses", "wide-brimmed hat");
  }

  if (weather.wind > 25) {
    gear.push("windbreaker", "wind-resistant outer layer");
  }

  if (activity.toLowerCase().includes('trek') || activity.toLowerCase().includes('hik')) {
    gear.push("sturdy hiking boots", "trekking poles", "backpack with water");
  }

  if (gear.length === 0) {
    return "You're all set! The conditions are mild, so standard outdoor gear should suffice. Don't forget water and sunscreen!";
  }

  return `I recommend bringing: ${gear.join(', ')}. Stay safe out there!`;
}

export function generateBotResponse(userMessage: string, context: ChatContext): string {
  const message = userMessage.toLowerCase();

  if (message.includes('joke')) {
    return getRandomItem(jokes);
  }

  if (message.includes('fact')) {
    return getRandomItem(facts);
  }

  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm ChronoAI, your weather expert assistant. I can help you understand weather conditions, explain ACIS scores, suggest gear, or share fun weather facts and jokes. What would you like to know?";
  }

  if (message.includes('acis') || message.includes('score')) {
    if (context.currentWeather) {
      return `The Activity Climate Index Score (ACIS) is a comprehensive rating from 1-10 that evaluates how suitable the weather conditions are for your planned activity. It factors in temperature, wind speed, precipitation, air quality, and UV levels. The current conditions indicate ${getACISInterpretation(7.5)}`;
    }
    return "ACIS (Activity Climate Index Score) is a comprehensive rating from 1-10 that evaluates how suitable weather conditions are for your specific activity. It considers temperature, wind, precipitation, air quality, and UV levels. A score of 8+ means excellent conditions, 6-8 is good, 4-6 is acceptable, and below 4 suggests rescheduling.";
  }

  if (message.includes('gear') || message.includes('pack') || message.includes('bring') || message.includes('wear')) {
    if (context.currentWeather && context.currentActivity) {
      return getGearRecommendations(context.currentWeather, context.currentActivity);
    }
    return "I'd love to help with gear recommendations! I need to know what activity you're planning and the weather conditions. Try asking me from the detailed weather view for personalized suggestions!";
  }

  if (message.includes('weather') || message.includes('forecast')) {
    if (context.currentLocation && context.currentWeather) {
      const w = context.currentWeather;
      return `Current conditions in ${context.currentLocation}: ${formatTemperature(w.temp)} and ${w.description.toLowerCase()}. Wind at ${w.wind} km/h, ${w.precipitation}% chance of precipitation. Air quality index is ${w.aqi}. ${w.aqi > 100 ? 'Air quality is a concern today.' : 'Air quality is good!'}`;
    }
    return "I can provide detailed weather information once you've searched for a location. What location would you like to check?";
  }

  if (message.includes('safe') || message.includes('danger') || message.includes('risk')) {
    if (context.currentWeather) {
      const alerts: string[] = [];
      if (context.currentWeather.aqi > 100) alerts.push("elevated air quality concerns");
      if (context.currentWeather.uv > 8) alerts.push("high UV exposure risk");
      if (context.currentWeather.precipitation > 60) alerts.push("heavy precipitation");
      if (context.currentWeather.wind > 40) alerts.push("strong winds");

      if (alerts.length === 0) {
        return "The current conditions look safe for outdoor activities. Standard precautions apply - stay hydrated, wear sunscreen, and dress appropriately!";
      }
      return `I see ${alerts.join(', ')}. Please take extra precautions and consider these factors when planning your outdoor activities.`;
    }
    return "I can assess safety conditions once you've viewed specific weather data. Generally, watch for extreme temperatures, high winds, heavy precipitation, and poor air quality.";
  }

  if (message.includes('best') || message.includes('optimal') || message.includes('when')) {
    if (context.currentActivity) {
      return "Based on the weather forecast, I recommend checking the ACIS scores for each day. The day highlighted with a golden border represents the optimal conditions for your activity. You can also tap any day card to see hourly breakdowns and find the best time window!";
    }
    return "To find the best day for your activity, use the 'Plan a Future Activity' feature! I'll analyze the forecast and highlight the optimal day with specific time recommendations.";
  }

  if (message.includes('help')) {
    return "I can help you with:\n• Understanding weather conditions and forecasts\n• Explaining ACIS scores for your activities\n• Recommending appropriate gear based on weather\n• Sharing interesting weather facts and jokes\n• Answering questions about safety and optimal timing\n\nJust ask me anything weather-related!";
  }

  if (message.includes('thank')) {
    return "You're welcome! Feel free to ask me anything else about the weather or your planned activities. Stay safe out there! ☀️";
  }

  const responses = [
    "That's an interesting question! Could you be more specific? I can help with weather conditions, ACIS scores, gear recommendations, or share fun weather facts.",
    "I'm here to help with weather-related questions! Try asking me about current conditions, optimal activity times, gear recommendations, or request a weather joke!",
    "I'd love to help! I specialize in weather information, activity planning, and outdoor safety. What specific information are you looking for?",
  ];

  return getRandomItem(responses);
}
