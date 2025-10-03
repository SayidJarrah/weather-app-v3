import {
  CITIES,
  GENERIC_ERROR_MESSAGE,
  LOADING_MESSAGE
} from "./constants.js";
import { fetchWeatherForCities } from "./weatherService.js";

const DASHBOARD_LIST_ID = "city-weather-list";
const STATUS_MESSAGE_ID = "status-message";
const WEATHER_SECTION_ID = "weather-section";
const CITY_FORM_ID = "city-form";
const CITY_SELECT_ID = "city-select";
const CITY_CARD_CLASS = "city-card";
const CITY_NAME_CLASS = "city-name";
const TEMPERATURE_CLASS = "city-temperature";
const CITY_REMOVE_BUTTON_CLASS = "city-remove-button";
const FLAG_LABEL = "City flag";
const REMOVE_BUTTON_TEXT = "Remove";
const REMOVE_BUTTON_LABEL_PREFIX = "Remove weather card for";
const CITY_CARD_DATA_ATTRIBUTE = "cityKey";
const CITY_KEY_SEPARATOR = "|";
const DEFAULT_DASHBOARD_CITY_COUNT = 4;
const CITY_SELECT_PLACEHOLDER_VALUE = "";

export const NO_CITIES_MESSAGE = "No cities selected yet. Add a city to see the weather.";
export const DUPLICATE_CITY_MESSAGE = "That city is already on the dashboard.";
export const SELECT_CITY_PROMPT_MESSAGE = "Choose a city from the list before adding it.";

function getElement(elementId) {
  return document.getElementById(elementId);
}

const setBusyState = (isBusy) => {
  const section = getElement(WEATHER_SECTION_ID);
  if (section) {
    section.setAttribute("aria-busy", String(isBusy));
  }
};

export const createCityKey = (city) => {
  const normalizedName = city.name.trim().toLowerCase();
  return `${normalizedName}${CITY_KEY_SEPARATOR}${city.latitude}${CITY_KEY_SEPARATOR}${city.longitude}`;
};

const createWeatherWithKey = (city, weather) => ({
  ...weather,
  key: createCityKey(city)
});

const trackedCities = CITIES.slice(0, DEFAULT_DASHBOARD_CITY_COUNT);
const trackedCityKeys = new Set(trackedCities.map((city) => createCityKey(city)));
let currentWeather = [];

const createCityCard = (cityWeather) => {
  const listItem = document.createElement("li");
  listItem.className = CITY_CARD_CLASS;
  listItem.dataset[CITY_CARD_DATA_ATTRIBUTE] = cityWeather.key;

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

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = CITY_REMOVE_BUTTON_CLASS;
  removeButton.setAttribute("aria-label", `${REMOVE_BUTTON_LABEL_PREFIX} ${cityWeather.name}`);
  removeButton.textContent = REMOVE_BUTTON_TEXT;

  listItem.append(flag, name, temperature, removeButton);
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

const updateWeatherState = (weatherByCity) => {
  currentWeather = weatherByCity;
  renderWeatherList(currentWeather);
  if (currentWeather.length === 0) {
    renderStatusMessage(NO_CITIES_MESSAGE);
    return;
  }
  clearStatusMessage();
};

const handleError = (error) => {
  console.error(error);
  renderStatusMessage(GENERIC_ERROR_MESSAGE);
  setBusyState(false);
};

const updateCitySelectOptions = () => {
  const selectElement = getElement(CITY_SELECT_ID);
  if (!(selectElement instanceof HTMLSelectElement)) {
    return;
  }

  Array.from(selectElement.options).forEach((option) => {
    if (option.value === CITY_SELECT_PLACEHOLDER_VALUE) {
      option.disabled = trackedCityKeys.size === CITIES.length;
      return;
    }
    option.disabled = trackedCityKeys.has(option.value);
  });

  if (trackedCityKeys.size === CITIES.length) {
    selectElement.value = CITY_SELECT_PLACEHOLDER_VALUE;
    selectElement.disabled = true;
  } else {
    selectElement.disabled = false;
  }
};

const populateCitySelect = () => {
  const selectElement = getElement(CITY_SELECT_ID);
  if (!(selectElement instanceof HTMLSelectElement)) {
    return;
  }

  const existingOptions = new Set(Array.from(selectElement.options).map((option) => option.value));
  CITIES.forEach((city) => {
    const cityKey = createCityKey(city);
    if (existingOptions.has(cityKey)) {
      return;
    }

    const option = document.createElement("option");
    option.value = cityKey;
    option.textContent = `${city.flagEmoji} ${city.name}`;
    selectElement.append(option);
  });

  updateCitySelectOptions();
};

const findCityByKey = (cityKey) => CITIES.find((city) => createCityKey(city) === cityKey);

const removeCityByKey = (cityKey) => {
  if (!cityKey) {
    return;
  }

  const cityIndex = trackedCities.findIndex((city) => createCityKey(city) === cityKey);
  if (cityIndex === -1) {
    return;
  }

  trackedCities.splice(cityIndex, 1);
  trackedCityKeys.delete(cityKey);
  const updatedWeather = currentWeather.filter((cityWeather) => cityWeather.key !== cityKey);
  updateWeatherState(updatedWeather);
  updateCitySelectOptions();
};

const handleCityFormSubmit = async (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;
  if (!(formElement instanceof HTMLFormElement)) {
    return;
  }

  const selectElement = formElement.querySelector(`#${CITY_SELECT_ID}`);
  if (!(selectElement instanceof HTMLSelectElement)) {
    return;
  }

  const selectedKey = selectElement.value;
  if (!selectedKey || selectedKey === CITY_SELECT_PLACEHOLDER_VALUE) {
    renderStatusMessage(SELECT_CITY_PROMPT_MESSAGE);
    return;
  }

  if (trackedCityKeys.has(selectedKey)) {
    renderStatusMessage(DUPLICATE_CITY_MESSAGE);
    formElement.reset();
    updateCitySelectOptions();
    return;
  }

  const selectedCity = findCityByKey(selectedKey);
  if (!selectedCity) {
    renderStatusMessage(SELECT_CITY_PROMPT_MESSAGE);
    return;
  }

  setBusyState(true);
  renderStatusMessage(LOADING_MESSAGE);

  try {
    const [cityWeather] = await fetchWeatherForCities([selectedCity]);
    trackedCities.push(selectedCity);
    trackedCityKeys.add(selectedKey);
    const updatedWeather = [...currentWeather, createWeatherWithKey(selectedCity, cityWeather)];
    updateWeatherState(updatedWeather);
    formElement.reset();
    updateCitySelectOptions();
  } catch (error) {
    handleError(error);
    return;
  } finally {
    setBusyState(false);
  }
};

const handleWeatherListClick = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.classList.contains(CITY_REMOVE_BUTTON_CLASS)) {
    return;
  }

  const listItem = target.closest(`.${CITY_CARD_CLASS}`);
  if (!listItem) {
    return;
  }

  const cityKey = listItem.dataset[CITY_CARD_DATA_ATTRIBUTE];
  removeCityByKey(cityKey);
};

const attachEventListeners = () => {
  const formElement = getElement(CITY_FORM_ID);
  if (formElement instanceof HTMLFormElement) {
    formElement.addEventListener("submit", handleCityFormSubmit);
  }

  const listElement = getElement(DASHBOARD_LIST_ID);
  if (listElement) {
    listElement.addEventListener("click", handleWeatherListClick);
  }
};

const initializeDashboard = async () => {
  populateCitySelect();
  attachEventListeners();
  setBusyState(true);
  renderStatusMessage(LOADING_MESSAGE);
  try {
    const weatherByCity = await fetchWeatherForCities(trackedCities);
    const weatherWithKeys = weatherByCity.map((cityWeather, index) =>
      createWeatherWithKey(trackedCities[index], cityWeather)
    );
    updateWeatherState(weatherWithKeys);
  } catch (error) {
    handleError(error);
    return;
  } finally {
    setBusyState(false);
  }
};

document.addEventListener("DOMContentLoaded", initializeDashboard);
