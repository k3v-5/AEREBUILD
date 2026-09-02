import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  compileVisualization,
  DataSet,
  BarChartSpec,
  BigStatSpec,
  ChronologyTimelineSpec,
  TrendLineSpec,
  TIME_EDITORIAL_STYLE,
  DEFAULT_SAFE_ZONE,
} from "../../editorial/data-visualization/index.js";

describe("REQ-025 — Data Visualization Edge Cases & Regression Suite", () => {
  it("rejects chart compilation on empty dataset without crashing", () => {
    const emptyDataset: DataSet = {
      id: "ds_empty",
      columns: [
        { key: "cat", label: "Cat", type: "STRING" },
        { key: "val", label: "Val", type: "NUMBER" },
      ],
      rows: [],
    };

    const spec: BarChartSpec = {
      id: "chart_empty",
      type: "ANIMATED_BAR_CHART",
      datasetId: "ds_empty",
      categoryColumn: "cat",
      valueColumn: "val",
      orientation: "VERTICAL",
      sort: "SOURCE",
      showValues: true,
      showLabels: true,
      showAxis: false,
      showGrid: false,
      animateCounters: false,
      width: 1920,
      height: 1080,
      durationSeconds: 5.0,
      startTimeSeconds: 0,
      safeZone: DEFAULT_SAFE_ZONE,
      style: TIME_EDITORIAL_STYLE,
      animation: { entranceDurationSeconds: 1, exitDurationSeconds: 0.5, easing: "LINEAR" },
    };

    const result = compileVisualization(emptyDataset, spec);
    assert.equal(result.success, false);
    assert.ok(result.errors.some((e) => e.code === "DATASET_ROWS_EMPTY"));
  });

  it("handles single data point gracefully without division by zero in normalization", () => {
    const singleDataset: DataSet = {
      id: "ds_single",
      columns: [
        { key: "item", label: "Item", type: "STRING" },
        { key: "val", label: "Val", type: "NUMBER" },
      ],
      rows: [{ item: "Solo", val: 100 }],
    };

    const spec: BarChartSpec = {
      id: "chart_single",
      type: "ANIMATED_BAR_CHART",
      datasetId: "ds_single",
      categoryColumn: "item",
      valueColumn: "val",
      orientation: "VERTICAL",
      sort: "SOURCE",
      showValues: true,
      showLabels: true,
      showAxis: true,
      showGrid: true,
      animateCounters: true,
      width: 1920,
      height: 1080,
      durationSeconds: 4.0,
      startTimeSeconds: 0,
      safeZone: DEFAULT_SAFE_ZONE,
      style: TIME_EDITORIAL_STYLE,
      animation: { entranceDurationSeconds: 1, exitDurationSeconds: 0.5, easing: "EASE_OUT" },
    };

    const result = compileVisualization(singleDataset, spec);
    assert.equal(result.success, true);
    assert.ok(result.ir);
    assert.equal(result.ir.layers.filter((l) => l.name.startsWith("DV::BAR::")).length, 1);
  });

  it("dispatches all 4 visualization types via unified compileVisualization entrypoint", () => {
    // 1. Bar Chart
    const barSpec: BarChartSpec = {
      id: "vis_bar",
      type: "ANIMATED_BAR_CHART",
      datasetId: "ds",
      categoryColumn: "c",
      valueColumn: "v",
      orientation: "VERTICAL",
      sort: "SOURCE",
      showValues: true,
      showLabels: true,
      showAxis: false,
      showGrid: false,
      animateCounters: false,
      width: 1920,
      height: 1080,
      durationSeconds: 3.0,
      startTimeSeconds: 0,
      safeZone: DEFAULT_SAFE_ZONE,
      style: TIME_EDITORIAL_STYLE,
      animation: { entranceDurationSeconds: 1, exitDurationSeconds: 0.5, easing: "LINEAR" },
    };
    const ds: DataSet = {
      id: "ds",
      columns: [
        { key: "c", label: "C", type: "STRING" },
        { key: "x", label: "X", type: "NUMBER" },
        { key: "v", label: "V", type: "NUMBER" },
      ],
      rows: [{ c: "A", x: 1, v: 10 }],
    };
    assert.equal(compileVisualization(ds, barSpec).success, true);

    // 2. Trend Line
    const trendSpec: TrendLineSpec = {
      id: "vis_trend",
      type: "TREND_LINE",
      datasetId: "ds",
      xColumn: "x",
      yColumn: "v",
      showPoints: false,
      showLabels: false,
      showGrid: false,
      interpolation: "LINEAR",
      highlightExtremes: false,
      width: 1920,
      height: 1080,
      durationSeconds: 3.0,
      startTimeSeconds: 0,
      safeZone: DEFAULT_SAFE_ZONE,
      style: TIME_EDITORIAL_STYLE,
      animation: { entranceDurationSeconds: 1, exitDurationSeconds: 0.5, easing: "LINEAR" },
    };
    assert.equal(compileVisualization(ds, trendSpec).success, true);

    // 3. Big Stat Card
    const statSpec: BigStatSpec = {
      id: "vis_stat",
      type: "BIG_STAT_CARD",
      value: "99%",
      label: "Success",
      accentLine: true,
      animateValue: false,
      width: 1920,
      height: 1080,
      durationSeconds: 3.0,
      startTimeSeconds: 0,
      safeZone: DEFAULT_SAFE_ZONE,
      style: TIME_EDITORIAL_STYLE,
      animation: { entranceDurationSeconds: 1, exitDurationSeconds: 0.5, easing: "LINEAR" },
    };
    assert.equal(compileVisualization(null, statSpec).success, true);

    // 4. Chronology Timeline
    const timelineSpec: ChronologyTimelineSpec = {
      id: "vis_timeline",
      type: "CHRONOLOGY_TIMELINE",
      datasetId: "ds",
      dateColumn: "c",
      titleColumn: "c",
      orientation: "HORIZONTAL",
      showDates: false,
      showDescriptions: false,
      width: 1920,
      height: 1080,
      durationSeconds: 3.0,
      startTimeSeconds: 0,
      safeZone: DEFAULT_SAFE_ZONE,
      style: TIME_EDITORIAL_STYLE,
      animation: { entranceDurationSeconds: 1, exitDurationSeconds: 0.5, easing: "LINEAR" },
    };
    assert.equal(compileVisualization(ds, timelineSpec).success, true);
  });
});
