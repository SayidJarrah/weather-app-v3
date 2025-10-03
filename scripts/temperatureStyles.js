const FREEZING_MAX_TEMPERATURE_CELSIUS = 0;
const COOL_MAX_TEMPERATURE_CELSIUS = 15;
const WARM_MAX_TEMPERATURE_CELSIUS = 25;

const CITY_CARD_FREEZING_CLASS = "city-card--freezing";
const CITY_CARD_COOL_CLASS = "city-card--cool";
const CITY_CARD_WARM_CLASS = "city-card--warm";
const CITY_CARD_HOT_CLASS = "city-card--hot";

export const getCityCardTemperatureClass = (temperatureCelsius) => {
  if (!Number.isFinite(temperatureCelsius)) {
    throw new Error("Temperature must be a finite number.");
  }

  if (temperatureCelsius <= FREEZING_MAX_TEMPERATURE_CELSIUS) {
    return CITY_CARD_FREEZING_CLASS;
  }

  if (temperatureCelsius <= COOL_MAX_TEMPERATURE_CELSIUS) {
    return CITY_CARD_COOL_CLASS;
  }

  if (temperatureCelsius <= WARM_MAX_TEMPERATURE_CELSIUS) {
    return CITY_CARD_WARM_CLASS;
  }

  return CITY_CARD_HOT_CLASS;
};
