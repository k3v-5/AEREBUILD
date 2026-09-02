import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeValue,
  denormalizeValue,
  normalizeDatasetPoints,
  DataPoint,
} from "../../editorial/data-visualization/index.js";

describe("REQ-025 — DataVisualizationNormalization Tests", () => {
  it("normalizes values accurately in standard range with clamping in [0.0, 1.0]", () => {
    assert.equal(normalizeValue(0, 0, 100), 0.0);
    assert.equal(normalizeValue(50, 0, 100), 0.5);
    assert.equal(normalizeValue(100, 0, 100), 1.0);

    // Clamping outside bounds
    assert.equal(normalizeValue(-20, 0, 100), 0.0);
    assert.equal(normalizeValue(150, 0, 100), 1.0);
  });

  it("handles constant dataset by returning 0.5 without division by zero", () => {
    assert.equal(normalizeValue(42, 42, 42), 0.5);
    assert.equal(normalizeValue(0, 0, 0), 0.5);
    assert.equal(normalizeValue(-10, -10, -10), 0.5);
  });

  it("denormalizeValue accurately recovers values within original domain", () => {
    const min = 20;
    const max = 80;
    const original = 50;
    const norm = normalizeValue(original, min, max);
    const recovered = denormalizeValue(norm, min, max);

    assert.equal(Math.abs(recovered - original) < 1e-6, true);
  });

  it("normalizeDatasetPoints never mutates the original points array or objects (§2.1)", () => {
    const originalPoints: DataPoint[] = [
      { id: "p1", label: "A", value: 10 },
      { id: "p2", label: "B", value: 30 },
    ];
    const deepClone = JSON.parse(JSON.stringify(originalPoints));

    const normalized = normalizeDatasetPoints(originalPoints);

    // El array devuelto es un nuevo array
    assert.notEqual(normalized, originalPoints);
    assert.equal(normalized.length, originalPoints.length);

    // Los puntos originales están intactos
    assert.deepEqual(originalPoints, deepClone);

    // Los puntos normalizados contienen el valor normalizado en metadata
    assert.equal(normalized[0].metadata?.normalizedValue, 0.0);
    assert.equal(normalized[1].metadata?.normalizedValue, 1.0);
  });
});
