import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import {
  BeatTensionInput,
  EditorialContrast,
} from "../../editorial/attention/editorial-contrast.js";

describe("Fase 4H — Editorial Contrast & Dramatic Tension Suite", () => {
  it("rewards canonical alternating tension arc with perfect 100 score (REQ-048)", () => {
    const beats: BeatTensionInput[] = [
      { beatIndex: 0, tension: "LOW", durationSeconds: 15.0 },
      { beatIndex: 1, tension: "MEDIUM", durationSeconds: 20.0 },
      { beatIndex: 2, tension: "HIGH", durationSeconds: 15.0 },
      { beatIndex: 3, tension: "PEAK", durationSeconds: 8.0 },
      { beatIndex: 4, tension: "RELEASE", durationSeconds: 12.0 },
      { beatIndex: 5, tension: "MEDIUM", durationSeconds: 15.0 },
    ];

    const report = EditorialContrast.evaluate({ beats });

    assert.equal(report.contrastScore, 100.0);
    assert.equal(report.violations.length, 0);
    assert.equal(report.isValidContrast, true);
    assert.equal(report.penalties.monotonyPenalty, 0);
  });

  it("applies exactly one penalty per contiguous monotony run without window duplication", () => {
    // 4 consecutive high/peak beats -> 1 single run
    const beats: BeatTensionInput[] = [
      { beatIndex: 0, tension: "MEDIUM", durationSeconds: 10.0 },
      { beatIndex: 1, tension: "HIGH", durationSeconds: 8.0 },
      { beatIndex: 2, tension: "HIGH", durationSeconds: 8.0 },
      { beatIndex: 3, tension: "HIGH", durationSeconds: 8.0 },
      { beatIndex: 4, tension: "PEAK", durationSeconds: 8.0 },
      { beatIndex: 5, tension: "RELEASE", durationSeconds: 10.0 },
    ];

    const report = EditorialContrast.evaluate({ beats });

    // One monotony penalty = 15.0 -> score = 85.0
    assert.equal(report.contrastScore, 85.0);
    assert.equal(report.penalties.monotonyPenalty, 15.0);
    assert.equal(report.monotonyRuns.length, 1);
    assert.equal(report.monotonyRuns[0].startBeatIndex, 1);
    assert.equal(report.monotonyRuns[0].endBeatIndex, 4);
  });

  it("penalizes stagnation in LOW exceeding 35 seconds", () => {
    const beats: BeatTensionInput[] = [
      { beatIndex: 0, tension: "LOW", durationSeconds: 20.0 },
      { beatIndex: 1, tension: "LOW", durationSeconds: 20.0 }, // total 40s > 35s
      { beatIndex: 2, tension: "MEDIUM", durationSeconds: 15.0 },
    ];

    const report = EditorialContrast.evaluate({ beats });

    assert.equal(report.penalties.stagnationPenalty, 12.0);
    assert.ok(report.contrastScore <= 88.0);
    assert.ok(report.violations.some((v) => v.includes("BOREDOM_STAGNATION")));
  });

  it("penalizes missing release following PEAK tension", () => {
    const beats: BeatTensionInput[] = [
      { beatIndex: 0, tension: "MEDIUM", durationSeconds: 15.0 },
      { beatIndex: 1, tension: "PEAK", durationSeconds: 10.0 },
      { beatIndex: 2, tension: "HIGH", durationSeconds: 10.0 }, // violates required RELEASE or MEDIUM
    ];

    const report = EditorialContrast.evaluate({ beats });

    assert.equal(report.penalties.missingReleasePenalty, 10.0);
    assert.ok(report.violations.some((v) => v.includes("MISSING_RELEASE")));
  });

  it("guarantees deterministic SHA-256 checksum", () => {
    const input = {
      beats: [
        { beatIndex: 0, tension: "LOW" as const, durationSeconds: 10.0 },
        { beatIndex: 1, tension: "HIGH" as const, durationSeconds: 10.0 },
      ],
    };

    const run1 = EditorialContrast.evaluate(input);
    const run2 = EditorialContrast.evaluate(input);

    assert.equal(run1.checksumSha256, run2.checksumSha256);
    assert.equal(run1.checksumSha256.length, 64);
  });

  it("PBT: contrastScore is always strictly bounded in [0.0, 100.0]", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            beatIndex: fc.integer({ min: 0, max: 20 }),
            tension: fc.constantFrom("LOW", "MEDIUM", "HIGH", "PEAK", "RELEASE"),
            durationSeconds: fc.double({ min: 1.0, max: 60.0, noNaN: true }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (beats) => {
          const report = EditorialContrast.evaluate({ beats });
          return (
            Number.isFinite(report.contrastScore) &&
            report.contrastScore >= 0.0 &&
            report.contrastScore <= 100.0 &&
            report.penalties.monotonyPenalty >= 0.0 &&
            report.penalties.stagnationPenalty >= 0.0 &&
            report.penalties.missingReleasePenalty >= 0.0 &&
            report.penalties.erraticPenalty >= 0.0
          );
        }
      ),
      { numRuns: 40 }
    );
  });
});
