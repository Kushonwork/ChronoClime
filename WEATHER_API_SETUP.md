# Weather API Setup Instructions

## OpenWeatherMap API Integration

ChronoClime now supports real weather data through the OpenWeatherMap API! Here's how to set it up:

### 1. Get Your Free API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to "API keys" in your account dashboard
4. Copy your API k2ey

### 2. Configure the API Key

Create a `.env` file in your project root with:

```env
VITE_OPENWEATHER_API_KEY=your_actual_api_key_here
```

### 3. Free Tier Limits

- **1,000 calls/day** (more than enough for development)
- **Current weather** and **5-day forecast**
- **Air quality data** (limited locations)

### 4. Fallback Behavior

If no API key is provided or the API fails, the app automatically falls back to mock data, so it will always work!

### 5. Features Enabled with Real API

✅ **Real-time weather data**  
✅ **Accurate 5-day forecasts**  
✅ **Actual air quality data**  
✅ **Real sunrise/sunset times**  
✅ **Location-based weather**  

### 6. Testing

Try searching for these cities to test the integration:
- Mumbai, India
- New York, USA
- London, UK
- Tokyo, Japan

The app will show real weather data for these locations!

---

**Note**: The app works perfectly without an API key using mock data, but real weather data makes it much more useful and accurate.

