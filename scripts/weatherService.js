import {
  CURRENT_WEATHER_QUERY,
  TEMPERATURE_DECIMAL_PLACES,
  TEMPERATURE_UNIT,
  WEATHER_API_BASE_URL
} from "./constants.js";

const LATITUDE_QUERY_PARAM = "latitude";
const LONGITUDE_QUERY_PARAM = "longitude";
const CURRENT_WEATHER_KEY = "current_weather";
const TEMPERATURE_KEY = "temperature";
const DEFAULT_TIMEZONE_QUERY = "timezone=auto";

const REQUIRED_QUERY_PARAMS = [CURRENT_WEATHER_QUERY, DEFAULT_TIMEZONE_QUERY];

export const buildWeatherApiUrl = (latitude, longitude) => {
  const apiUrl = new URL(WEATHER_API_BASE_URL);
  apiUrl.searchParams.set(LATITUDE_QUERY_PARAM, latitude.toString());
  apiUrl.searchParams.set(LONGITUDE_QUERY_PARAM, longitude.toString());
  REQUIRED_QUERY_PARAMS.forEach((parameter) => {
    const [key, value] = parameter.split("=");
    apiUrl.searchParams.set(key, value);
  });
  return apiUrl.toString();
};

export const mapWeatherResponse = (city, apiResponse) => {
  if (!apiResponse || !apiResponse[CURRENT_WEATHER_KEY]) {
    throw new Error(`Missing weather data for ${city.name}`);
  }

  const currentWeather = apiResponse[CURRENT_WEATHER_KEY];
  if (typeof currentWeather[TEMPERATURE_KEY] !== "number") {
    throw new Error(`Missing temperature value for ${city.name}`);
  }

  return {
    name: city.name,
    flagEmoji: city.flagEmoji,
    temperature: `${currentWeather[TEMPERATURE_KEY].toFixed(TEMPERATURE_DECIMAL_PLACES)}${TEMPERATURE_UNIT}`
  };
};

export const fetchWeatherForCities = async (cities, fetchImplementation = fetch) => {
  const weatherPromises = cities.map(async (city) => {
    const response = await fetchImplementation(buildWeatherApiUrl(city.latitude, city.longitude));
    if (!response.ok) {
      throw new Error(`Weather request failed for ${city.name}`);
    }
    const apiResponse = await response.json();
    return mapWeatherResponse(city, apiResponse);
  });

  return Promise.all(weatherPromises);
};
