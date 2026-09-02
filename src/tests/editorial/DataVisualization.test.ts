import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { EditorialDataset } from "../../editorial/data-visualization/types.js";
import { DataNormalizer } from "../../editorial/data-visualization/data-normalizer.js";
import { VisualScales } from "../../editorial/data-visualization/scales.js";
import { AnimatedBarChartCompiler } from "../../editorial/data-visualization/animated-bar-chart-compiler.js";
import { TrendLineGraphCompiler } from "../../editorial/data-visualization/trend-line-graph-compiler.js";
import { BigStatCardGenerator } from "../../editorial/data-visualization/big-stat-card-generator.js";
import { ChronologyTimelineGenerator } from "../../editorial/data-visualization/chronology-timeline-generator.js";

describe("Fase 4I — Data Visualization Engine Suite", () => {
  const sampleDataset: EditorialDataset = {
    id: "ds_inflation_2024",
    title: "Global Inflation Rate",
    unit: "%",
    points: [
      { id: "p1", label: "Jan", value: 3.4, timestampSeconds: 0 },
      { id: "p2", label: "Feb", value: 3.1, timestampSeconds: 30 },
      { id: "p3", label: "Mar", value: 3.5, timestampSeconds: 60 },
      { id: "p4", label: "Apr", value: 3.4, timestampSeconds: 90 },
      { id: "p5", label: "May", value: 3.3, timestampSeconds: 120 },
    ],
    source: {
      type: "EVIDENCE",
      citationId: "imf_world_economic_outlook_2024",
    },
    schemaVersion: "1.0.0",
  };

  it("normalizes dataset accurately and resolves constant dataset to 0.5 (REQ-4I-007)", () => {
    const normalized = DataNormalizer.normalizeDataset(sampleDataset);
    assert.equal(normalized.minValue, 3.1);
    assert.equal(normalized.maxValue, 3.5);
    assert.equal(normalized.points[1].normalizedValue, 0.0); // 3.1 is min
    assert.equal(normalized.points[2].normalizedValue, 1.0); // 3.5 is max

    // Constant dataset test: min === max
    const constantDs: EditorialDataset = {
      id: "ds_constant",
      title: "Target Rate",
      points: [
        { id: "c1", label: "Q1", value: 5.0 },
        { id: "c2", label: "Q2", value: 5.0 },
      ],
      schemaVersion: "1.0.0",
    };
    const constNorm = DataNormalizer.normalizeDataset(constantDs);
    assert.equal(constNorm.points[0].normalizedValue, 0.5);
    assert.equal(constNorm.points[1].normalizedValue, 0.5);
  });

  it("rejects invalid datasets with NaN or Infinity", () => {
    assert.throws(() => {
      DataNormalizer.normalizeDataset({
        id: "bad_nan",
        title: "Bad",
        points: [{ id: "n1", label: "Err", value: NaN }],
        schemaVersion: "1.0.0",
      });
    });

    assert.throws(() => {
      DataNormalizer.normalizeDataset({
        id: "bad_inf",
        title: "Bad",
        points: [{ id: "i1", label: "Err", value: Infinity }],
        schemaVersion: "1.0.0",
      });
    });
  });

  it("compiles vertical and horizontal animated bar charts with tick-up counters (REQ-4I-009)", () => {
    const verticalIR = AnimatedBarChartCompiler.compile({
      dataset: sampleDataset,
      config: { orientation: "VERTICAL", durationSeconds: 4.0 },
      aspectRatio: "16:9",
    });

    assert.equal(verticalIR.type, "BAR_CHART");
    assert.ok(verticalIR.elements.some((e) => e.type === "BAR"));
    assert.ok(verticalIR.elements.some((e) => e.type === "COUNTER"));
    assert.ok(verticalIR.elements.some((e) => e.type === "LABEL"));
    assert.ok(verticalIR.checksumSha256 !== undefined);
    assert.equal(verticalIR.checksumSha256.length, 64);

    const horizontalIR = AnimatedBarChartCompiler.compile({
      dataset: sampleDataset,
      config: { orientation: "HORIZONTAL", durationSeconds: 4.0 },
      aspectRatio: "9:16",
    });
    assert.equal(horizontalIR.type, "BAR_CHART");
    assert.ok(horizontalIR.elements.some((e) => e.type === "BAR"));
  });

  it("compiles trend line graphs with progressive stroke write-on and key points (REQ-4I-013)", () => {
    const trendIR = TrendLineGraphCompiler.compile({
      dataset: sampleDataset,
      config: { durationSeconds: 5.0, writeOnDurationSeconds: 2.0 },
    });

    assert.equal(trendIR.type, "TREND_LINE");
    assert.ok(trendIR.elements.some((e) => e.type === "LINE_SEGMENT"));
    assert.ok(trendIR.elements.some((e) => e.type === "KEY_POINT"));

    const keyPoints = trendIR.elements.filter((e) => e.type === "KEY_POINT");
    assert.ok(keyPoints.length >= 2, "Must identify at least start and end key points");
  });

  it("compiles Big Stat Card with TIME editorial styling and divider line (REQ-4I-016)", () => {
    const statIR = BigStatCardGenerator.compile({
      card: {
        value: 78.4,
        label: "Market Dominance",
        unit: "%",
        accentColor: "#FF1424",
        divider: {
          color: "#FF1424",
          thicknessPx: 4,
          widthPx: 140,
        },
      },
      durationSeconds: 3.5,
      aspectRatio: "16:9",
    });

    assert.equal(statIR.type, "BIG_STAT");
    assert.ok(statIR.elements.some((e) => e.type === "COUNTER"));
    assert.ok(statIR.elements.some((e) => e.type === "LINE_SEGMENT"));
    assert.ok(statIR.elements.some((e) => e.type === "LABEL"));
  });

  it("compiles chronology timeline and identifies label collisions deterministically (REQ-4I-017)", () => {
    const events = [
      { id: "ev1", timestamp: 1945, label: "End of WWII", importance: 1.0 },
      { id: "ev2", timestamp: 1947, label: "Marshall Plan Announced", importance: 0.8 },
      { id: "ev3", timestamp: 1949, label: "NATO Founded", importance: 0.9 },
    ];

    const result = ChronologyTimelineGenerator.compile({
      id: "cold_war_start",
      events,
      aspectRatio: "16:9",
    });

    assert.equal(result.ir.type, "CHRONOLOGY");
    assert.ok(result.ir.elements.some((e) => e.type === "TIMELINE_NODE"));
    assert.ok(result.ir.elements.some((e) => e.type === "LABEL"));
    assert.ok(Array.isArray(result.collisions));
  });

  it("PBT: normalization always yields values strictly within [0.0, 1.0]", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000.0, max: 1000.0, noNaN: true }),
        fc.double({ min: -1000.0, max: 1000.0, noNaN: true }),
        fc.double({ min: -1000.0, max: 1000.0, noNaN: true }),
        (val, a, b) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          const norm = DataNormalizer.normalizeValue(val, min, max);
          return Number.isFinite(norm) && norm >= 0.0 && norm <= 1.0;
        }
      ),
      { numRuns: 50 }
    );
  });

  it("PBT: compiler outputs are strictly deterministic (compile(x) === compile(x))", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.0, max: 100.0, noNaN: true }),
        fc.double({ min: 1.0, max: 100.0, noNaN: true }),
        (v1, v2) => {
          const ds: EditorialDataset = {
            id: "pbt_ds",
            title: "PBT",
            points: [
              { id: "a", label: "A", value: v1 },
              { id: "b", label: "B", value: v2 },
            ],
            schemaVersion: "1.0.0",
          };

          const run1 = AnimatedBarChartCompiler.compile({ dataset: ds });
          const run2 = AnimatedBarChartCompiler.compile({ dataset: ds });

          return (
            run1.checksumSha256 === run2.checksumSha256 &&
            run1.elements.length === run2.elements.length
          );
        }
      ),
      { numRuns: 30 }
    );
  });
});
