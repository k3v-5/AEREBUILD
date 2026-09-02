import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseCsv,
  parseJsonDataset,
  validateDataset,
  normalizeDataset,
  DataSet,
  DatasetValidationError,
} from "../../editorial/data-visualization/index.js";

describe("REQ-025 — Data Visualization Dataset Engine (Parser, Validator, Normalizer)", () => {
  it("parses standard RFC 4180 CSV with quotes, commas and newlines", () => {
    const csvContent = `year,country,inflation_rate\n2020,"United States, NA",1.4\n2021,"United States, NA",7.0\n2022,"United States, NA",6.5`;
    const dataset = parseCsv(csvContent, { title: "Inflation Rate" });

    assert.equal(dataset.title, "Inflation Rate");
    assert.equal(dataset.columns.length, 3);
    assert.equal(dataset.columns[0].key, "year");
    assert.equal(dataset.columns[1].key, "country");
    assert.equal(dataset.columns[2].key, "inflation_rate");
    assert.equal(dataset.rows.length, 3);
    assert.equal(dataset.rows[0].country, "United States, NA");
    assert.equal(dataset.rows[0].inflation_rate, 1.4);
  });

  it("handles UTF-8 BOM and escaped double quotes in CSV", () => {
    const csvContent = `\uFEFFid,quote\n1,"He said ""Hello world!"""\n2,"Normal quote"`;
    const dataset = parseCsv(csvContent);

    assert.equal(dataset.rows.length, 2);
    assert.equal(dataset.rows[0].quote, 'He said "Hello world!"');
  });

  it("parses canonical JSON dataset and array of objects", () => {
    const jsonArray = JSON.stringify([
      { quarter: "Q1", revenue: 150000, profitable: true },
      { quarter: "Q2", revenue: 210000, profitable: true },
      { quarter: "Q3", revenue: 90000, profitable: false },
    ]);

    const dataset = parseJsonDataset(jsonArray);
    assert.equal(dataset.columns.length, 3);
    assert.equal(dataset.rows.length, 3);
    assert.equal(dataset.rows[1].revenue, 210000);
    assert.equal(dataset.rows[2].profitable, false);
  });

  it("validates dataset integrity and detects missing required columns", () => {
    const dataset: DataSet = {
      id: "ds_test",
      columns: [
        { key: "category", label: "Category", type: "STRING" },
        { key: "value", label: "Value", type: "NUMBER" },
      ],
      rows: [
        { category: "A", value: 10 },
        { category: "B", value: 25 },
      ],
    };

    const validErrors = validateDataset(dataset, { requiredColumns: ["category", "value"] });
    assert.equal(validErrors.length, 0);

    const missingErrors = validateDataset(dataset, { requiredColumns: ["category", "unknown_col"] });
    assert.equal(missingErrors.some((e) => e.code === "REQUIRED_COLUMN_MISSING"), true);
  });

  it("rejects dataset with duplicate column keys", () => {
    const invalidDataset: DataSet = {
      id: "ds_dup",
      columns: [
        { key: "metric", label: "Metric 1", type: "NUMBER" },
        { key: "metric", label: "Metric 2", type: "NUMBER" },
      ],
      rows: [{ metric: 100 }],
    };

    const errors = validateDataset(invalidDataset);
    assert.equal(errors.some((e) => e.code === "COLUMN_KEY_DUPLICATE"), true);
  });

  it("normalizes numbers into [0, 1] range correctly", () => {
    const dataset: DataSet = {
      id: "ds_norm",
      columns: [
        { key: "item", label: "Item", type: "STRING" },
        { key: "score", label: "Score", type: "NUMBER" },
      ],
      rows: [
        { item: "Min", score: 10 },
        { item: "Mid", score: 30 },
        { item: "Max", score: 50 },
      ],
    };

    const result = normalizeDataset(dataset, "score");
    assert.equal(result.minValue, 10);
    assert.equal(result.maxValue, 50);
    assert.equal(result.rows[0]._normalizedValue, 0.0);
    assert.equal(result.rows[1]._normalizedValue, 0.5);
    assert.equal(result.rows[2]._normalizedValue, 1.0);
  });

  it("handles constant dataset by returning 0.5 normalized value", () => {
    const dataset: DataSet = {
      id: "ds_constant",
      columns: [
        { key: "item", label: "Item", type: "STRING" },
        { key: "val", label: "Val", type: "NUMBER" },
      ],
      rows: [
        { item: "A", val: 42 },
        { item: "B", val: 42 },
        { item: "C", val: 42 },
      ],
    };

    const result = normalizeDataset(dataset, "val");
    assert.equal(result.rows[0]._normalizedValue, 0.5);
    assert.equal(result.rows[1]._normalizedValue, 0.5);
    assert.equal(result.rows[2]._normalizedValue, 0.5);
  });

  it("enforces NullValuePolicy: REJECT throws, SKIP omits, ZERO sets 0", () => {
    const dataset: DataSet = {
      id: "ds_nulls",
      columns: [
        { key: "item", label: "Item", type: "STRING" },
        { key: "val", label: "Val", type: "NUMBER" },
      ],
      rows: [
        { item: "A", val: 10 },
        { item: "B", val: null },
        { item: "C", val: 30 },
      ],
    };

    assert.throws(() => {
      normalizeDataset(dataset, "val", { nullPolicy: "REJECT" });
    }, DatasetValidationError);

    const skipResult = normalizeDataset(dataset, "val", { nullPolicy: "SKIP" });
    assert.equal(skipResult.rows.length, 2);

    const zeroResult = normalizeDataset(dataset, "val", { nullPolicy: "ZERO" });
    assert.equal(zeroResult.rows.length, 3);
    assert.equal(zeroResult.rows[1].val, 0);
  });
});
