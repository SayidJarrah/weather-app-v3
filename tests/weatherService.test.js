import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import { CITIES, TEMPERATURE_DECIMAL_PLACES, TEMPERATURE_UNIT } from "../scripts/constants.js";
import {
  buildWeatherApiUrl,
  fetchWeatherForCities,
  mapWeatherResponse
} from "../scripts/weatherService.js";

const SAMPLE_CITY = CITIES[0];

describe("buildWeatherApiUrl", () => {
  it("includes coordinates and query parameters", () => {
    const url = new URL(buildWeatherApiUrl(SAMPLE_CITY.latitude, SAMPLE_CITY.longitude));
    assert.equal(url.origin + url.pathname, "https://api.open-meteo.com/v1/forecast");
    assert.equal(url.searchParams.get("latitude"), SAMPLE_CITY.latitude.toString());
    assert.equal(url.searchParams.get("longitude"), SAMPLE_CITY.longitude.toString());
    assert.equal(url.searchParams.get("current_weather"), "true");
    assert.equal(url.searchParams.get("timezone"), "auto");
  });
});

describe("mapWeatherResponse", () => {
  it("formats the response for rendering", () => {
    const temperature = 21.3456;
    const observationTime = "2024-04-01T10:00";
    const timezone = "Europe/Kyiv";
    const apiResponse = {
      current_weather: {
        temperature,
        time: observationTime
      },
      timezone
    };

    const result = mapWeatherResponse(SAMPLE_CITY, apiResponse);
    assert.deepEqual(result, {
      name: SAMPLE_CITY.name,
      flagEmoji: SAMPLE_CITY.flagEmoji,
      temperature: `${temperature.toFixed(TEMPERATURE_DECIMAL_PLACES)}${TEMPERATURE_UNIT}`,
      observedAt: observationTime,
      timeZone: timezone
    });
  });

  it("throws when current weather block is missing", () => {
    assert.throws(() => mapWeatherResponse(SAMPLE_CITY, {}), /Missing weather data/);
  });

  it("throws when the temperature is missing", () => {
    const response = {
      current_weather: {}
    };
    assert.throws(() => mapWeatherResponse(SAMPLE_CITY, response), /Missing temperature value/);
  });

  it("throws when the observation time is missing", () => {
    const response = {
      current_weather: {
        temperature: 20
      },
      timezone: "Etc/UTC"
    };

    assert.throws(() => mapWeatherResponse(SAMPLE_CITY, response), /Missing observation time/);
  });

  it("throws when the timezone is missing", () => {
    const response = {
      current_weather: {
        temperature: 20,
        time: "2024-04-01T10:00"
      }
    };

    assert.throws(() => mapWeatherResponse(SAMPLE_CITY, response), /Missing timezone information/);
  });
});

describe("fetchWeatherForCities", () => {
  it("fetches weather for each provided city", async () => {
    const apiResponse = {
      current_weather: {
        temperature: 19.87,
        time: "2024-04-01T10:00"
      },
      timezone: "Europe/Kyiv"
    };

    const fetchMock = mock.fn(async () => ({
      ok: true,
      json: async () => apiResponse
    }));

    const result = await fetchWeatherForCities([SAMPLE_CITY], fetchMock);
    assert.equal(fetchMock.mock.calls.length, 1);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, SAMPLE_CITY.name);
  });

  it("throws when the response is not ok", async () => {
    const fetchMock = mock.fn(async () => ({
      ok: false,
      json: async () => ({})
    }));

    await assert.rejects(
      fetchWeatherForCities([SAMPLE_CITY], fetchMock),
      /Weather request failed/
    );
  });
});
