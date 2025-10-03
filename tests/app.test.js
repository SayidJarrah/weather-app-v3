import test, { after } from "node:test";
import assert from "node:assert/strict";

import { CITIES } from "../scripts/constants.js";

global.document = {
  addEventListener: () => {},
  getElementById: () => null
};
global.HTMLElement = class {};
global.HTMLFormElement = class {};
global.HTMLSelectElement = class {};

const appModule = await import("../scripts/app.js");

const {
  createCityKey,
  NO_CITIES_MESSAGE,
  DUPLICATE_CITY_MESSAGE,
  SELECT_CITY_PROMPT_MESSAGE
} = appModule;

after(() => {
  delete global.document;
  delete global.HTMLElement;
  delete global.HTMLFormElement;
  delete global.HTMLSelectElement;
});

test("createCityKey combines normalized name and coordinates", () => {
  const firstKey = createCityKey({
    name: "  London  ",
    latitude: 51.5074,
    longitude: -0.1278
  });
  const secondKey = createCityKey({
    name: "london",
    latitude: 51.5074,
    longitude: -0.1278
  });

  assert.strictEqual(firstKey, secondKey);
  assert.ok(firstKey.includes("51.5074"));
  assert.ok(firstKey.includes("-0.1278"));
});

test("city catalogue exposes thirty unique options", () => {
  assert.strictEqual(CITIES.length, 30);
  const uniqueKeys = new Set(CITIES.map(createCityKey));
  assert.strictEqual(uniqueKeys.size, CITIES.length);
});

test("dashboard messages remain accessible", () => {
  assert.ok(NO_CITIES_MESSAGE.length > 0);
  assert.ok(DUPLICATE_CITY_MESSAGE.length > 0);
  assert.ok(SELECT_CITY_PROMPT_MESSAGE.length > 0);
});
