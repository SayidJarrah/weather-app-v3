export const CITIES = [
  {
    name: "Kyiv",
    latitude: 50.4501,
    longitude: 30.5234,
    flagEmoji: "🇺🇦"
  },
  {
    name: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    flagEmoji: "🇸🇬"
  },
  {
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    flagEmoji: "🇬🇧"
  },
  {
    name: "Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
    flagEmoji: "🇦🇺"
  }
];

export const WEATHER_API_BASE_URL = "https://api.open-meteo.com/v1/forecast";
export const CURRENT_WEATHER_QUERY = "current_weather=true";
export const TEMPERATURE_UNIT = "°C";
export const LOADING_MESSAGE = "Loading weather data...";
export const GENERIC_ERROR_MESSAGE = "Unable to load weather information right now. Please try again later.";
export const TEMPERATURE_DECIMAL_PLACES = 1;
