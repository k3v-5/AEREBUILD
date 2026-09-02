import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateVisualizationDataset,
  VisualizationDataset,
} from "../../editorial/data-visualization/index.js";

describe("REQ-025 — DataVisualizationValidation Tests", () => {
  it("passes validation for well-formed VisualizationDataset", () => {
    const validDataset: VisualizationDataset = {
      id: "ds-valid-1",
      title: "Valid Growth",
      points: [
        { id: "p1", label: "Q1", value: 12.5 },
        { id: "p2", label: "Q2", value: 18.2 },
        { id: "p3", label: "Q3", value: 24.1 },
      ],
      unit: "%",
      precision: 1,
    };

    const result = validateVisualizationDataset(validDataset);
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it("rejects dataset with empty points array", () => {
    const emptyDataset: VisualizationDataset = {
      id: "ds-empty",
      points: [],
    };

    const result = validateVisualizationDataset(emptyDataset);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === "EMPTY_DATASET"));
  });

  it("rejects non-finite values (NaN and Infinity)", () => {
    const nanDataset: VisualizationDataset = {
      id: "ds-nan",
      points: [
        { id: "p1", label: "Good", value: 10 },
        { id: "p2", label: "Bad", value: NaN },
      ],
    };

    const resultNaN = validateVisualizationDataset(nanDataset);
    assert.equal(resultNaN.valid, false);
    assert.ok(resultNaN.issues.some((i) => i.code === "NON_FINITE_VALUE"));

    const infDataset: VisualizationDataset = {
      id: "ds-inf",
      points: [
        { id: "p1", label: "Good", value: 10 },
        { id: "p2", label: "Infinity", value: Infinity },
      ],
    };

    const resultInf = validateVisualizationDataset(infDataset);
    assert.equal(resultInf.valid, false);
    assert.ok(resultInf.issues.some((i) => i.code === "NON_FINITE_VALUE"));
  });

  it("detects duplicate point IDs deterministically", () => {
    const dupDataset: VisualizationDataset = {
      id: "ds-dup",
      points: [
        { id: "alpha", label: "First", value: 10 },
        { id: "alpha", label: "Second", value: 20 },
      ],
    };

    const result = validateVisualizationDataset(dupDataset);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === "DUPLICATE_ID"));
  });

  it("rejects negative precision values", () => {
    const negPrecDataset: VisualizationDataset = {
      id: "ds-neg-prec",
      points: [{ id: "p1", label: "Item", value: 42 }],
      precision: -2,
    };

    const result = validateVisualizationDataset(negPrecDataset);
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === "INVALID_CONFIGURATION"));
  });

});
