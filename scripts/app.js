import {
  CITIES,
  GENERIC_ERROR_MESSAGE,
  LOADING_MESSAGE
} from "./constants.js";
import { fetchWeatherForCities } from "./weatherService.js";
import { getCityCardTemperatureClass } from "./temperatureStyles.js";

const DASHBOARD_LIST_ID = "city-weather-list";
const STATUS_MESSAGE_ID = "status-message";
const WEATHER_SECTION_ID = "weather-section";
const CITY_CARD_CLASS = "city-card";
const CITY_NAME_CLASS = "city-name";
const TEMPERATURE_CLASS = "city-temperature";
const FLAG_LABEL = "City flag";

const getElement = (elementId) => document.getElementById(elementId);

const setBusyState = (isBusy) => {
  const section = getElement(WEATHER_SECTION_ID);
  if (section) {
    section.setAttribute("aria-busy", String(isBusy));
  }
};

const createCityCard = (cityWeather) => {
  const listItem = document.createElement("li");
  listItem.className = `${CITY_CARD_CLASS} ${getCityCardTemperatureClass(cityWeather.temperatureCelsius)}`;

  const flag = document.createElement("span");
  flag.setAttribute("role", "img");
  flag.setAttribute("aria-label", `${cityWeather.name} ${FLAG_LABEL}`);
  flag.textContent = cityWeather.flagEmoji;

  const name = document.createElement("span");
  name.className = CITY_NAME_CLASS;
  name.textContent = cityWeather.name;

  const temperature = document.createElement("span");
  temperature.className = TEMPERATURE_CLASS;
  temperature.textContent = cityWeather.formattedTemperature;

  listItem.append(flag, name, temperature);
  return listItem;
};

const renderStatusMessage = (message) => {
  const statusElement = getElement(STATUS_MESSAGE_ID);
  if (statusElement) {
    statusElement.textContent = message;
  }
};

const clearStatusMessage = () => renderStatusMessage("");

const renderWeatherList = (weatherByCity) => {
  const listElement = getElement(DASHBOARD_LIST_ID);
  if (!listElement) {
    return;
  }

  listElement.replaceChildren(...weatherByCity.map(createCityCard));
};

const handleError = (error) => {
  console.error(error);
  renderStatusMessage(GENERIC_ERROR_MESSAGE);
  setBusyState(false);
};

const initializeDashboard = async () => {
  setBusyState(true);
  renderStatusMessage(LOADING_MESSAGE);
  try {
    const weatherByCity = await fetchWeatherForCities(CITIES);
    clearStatusMessage();
    renderWeatherList(weatherByCity);
  } catch (error) {
    handleError(error);
    return;
  }

  setBusyState(false);
};

document.addEventListener("DOMContentLoaded", initializeDashboard);
