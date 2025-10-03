import {
  CITIES,
  GENERIC_ERROR_MESSAGE,
  LOADING_MESSAGE,
  REFRESHING_MESSAGE
} from "./constants.js";
import { fetchWeatherForCities } from "./weatherService.js";

const DASHBOARD_LIST_ID = "city-weather-list";
const STATUS_MESSAGE_ID = "status-message";
const WEATHER_SECTION_ID = "weather-section";
const CITY_CARD_CLASS = "city-card";
const CITY_NAME_CLASS = "city-name";
const TEMPERATURE_CLASS = "city-temperature";
const CITY_LOCAL_TIME_CLASS = "city-local-time";
const FLAG_LABEL = "City flag";
const REFRESH_BUTTON_ID = "refresh-weather-button";
const LAST_UPDATED_ID = "last-updated";
const LAST_UPDATED_PREFIX = "Last refreshed at";
const LOCAL_TIME_LABEL = "Local time";
const USER_LOCALE = typeof navigator !== "undefined" ? navigator.language : undefined;
const LOCAL_TIME_FORMAT_OPTIONS = Object.freeze({
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short"
});
const LAST_UPDATED_FORMAT_OPTIONS = Object.freeze({
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

const getElement = (elementId) => document.getElementById(elementId);

const setBusyState = (isBusy) => {
  const section = getElement(WEATHER_SECTION_ID);
  if (section) {
    section.setAttribute("aria-busy", String(isBusy));
  }
};

const setRefreshButtonDisabled = (isDisabled) => {
  const refreshButton = getElement(REFRESH_BUTTON_ID);
  if (refreshButton) {
    refreshButton.disabled = isDisabled;
    refreshButton.setAttribute("aria-busy", String(isDisabled));
  }
};

const formatDateTime = (date, options) =>
  new Intl.DateTimeFormat(USER_LOCALE, options).format(date);

const formatLocalTime = (isoTimestamp, timeZone) =>
  formatDateTime(new Date(isoTimestamp), {
    ...LOCAL_TIME_FORMAT_OPTIONS,
    timeZone
  });

const formatLastUpdated = (timestamp) =>
  formatDateTime(timestamp, LAST_UPDATED_FORMAT_OPTIONS);

const createCityCard = (cityWeather) => {
  const listItem = document.createElement("li");
  listItem.className = CITY_CARD_CLASS;

  const flag = document.createElement("span");
  flag.setAttribute("role", "img");
  flag.setAttribute("aria-label", `${cityWeather.name} ${FLAG_LABEL}`);
  flag.textContent = cityWeather.flagEmoji;

  const name = document.createElement("span");
  name.className = CITY_NAME_CLASS;
  name.textContent = cityWeather.name;

  const temperature = document.createElement("span");
  temperature.className = TEMPERATURE_CLASS;
  temperature.textContent = cityWeather.temperature;

  const localTime = document.createElement("time");
  localTime.className = CITY_LOCAL_TIME_CLASS;
  localTime.dateTime = cityWeather.observedAt;
  localTime.textContent = `${LOCAL_TIME_LABEL}: ${formatLocalTime(
    cityWeather.observedAt,
    cityWeather.timeZone
  )}`;

  listItem.append(flag, name, temperature, localTime);
  return listItem;
};

const renderStatusMessage = (message) => {
  const statusElement = getElement(STATUS_MESSAGE_ID);
  if (statusElement) {
    statusElement.textContent = message;
  }
};

const clearStatusMessage = () => renderStatusMessage("");

const renderLastUpdated = (timestamp) => {
  const lastUpdatedElement = getElement(LAST_UPDATED_ID);
  if (!lastUpdatedElement) {
    return;
  }

  if (!timestamp) {
    lastUpdatedElement.textContent = "";
    return;
  }

  lastUpdatedElement.textContent = `${LAST_UPDATED_PREFIX} ${formatLastUpdated(timestamp)}`;
};

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
};

const loadDashboardWeather = async (loadingMessage) => {
  setBusyState(true);
  setRefreshButtonDisabled(true);
  renderStatusMessage(loadingMessage);

  try {
    const weatherByCity = await fetchWeatherForCities(CITIES);
    clearStatusMessage();
    renderWeatherList(weatherByCity);
    renderLastUpdated(new Date());
  } catch (error) {
    handleError(error);
    renderLastUpdated(null);
  } finally {
    setBusyState(false);
    setRefreshButtonDisabled(false);
  }
};

const initializeDashboard = () => {
  const refreshButton = getElement(REFRESH_BUTTON_ID);
  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      loadDashboardWeather(REFRESHING_MESSAGE);
    });
  }

  loadDashboardWeather(LOADING_MESSAGE);
};

document.addEventListener("DOMContentLoaded", initializeDashboard);
