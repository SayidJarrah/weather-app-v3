import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getCityCardTemperatureClass } from "../scripts/temperatureStyles.js";

describe("getCityCardTemperatureClass", () => {
  it("returns the freezing class for temperatures at or below freezing", () => {
    assert.equal(getCityCardTemperatureClass(-10), "city-card--freezing");
    assert.equal(getCityCardTemperatureClass(0), "city-card--freezing");
  });

  it("returns the cool class for chilly temperatures", () => {
    assert.equal(getCityCardTemperatureClass(10), "city-card--cool");
  });

  it("returns the warm class for mild temperatures", () => {
    assert.equal(getCityCardTemperatureClass(20), "city-card--warm");
  });

  it("returns the hot class for high temperatures", () => {
    assert.equal(getCityCardTemperatureClass(32), "city-card--hot");
  });

  it("throws for non-finite values", () => {
    assert.throws(() => getCityCardTemperatureClass(Number.NaN), /finite number/);
  });
});
