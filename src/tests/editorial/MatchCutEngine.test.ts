import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import {
  MatchCutEngine,
  ShotWithFeatures,
} from "../../editorial/transitions/match-cut-engine.js";

describe("Fase 4G — Cinematic Match Cut Engine Suite", () => {
  it("detects viable geometric match cut between circular focal shapes (REQ-061)", () => {
    const shotA: ShotWithFeatures = {
      id: "shot_coffee_cup",
      features: {
        primaryShape: "CIRCLE",
        shapeCenter: { x: 0.50, y: 0.50 },
        shapeRadius: 0.20,
      },
    };

    const shotB: ShotWithFeatures = {
      id: "shot_bicycle_wheel",
      features: {
        primaryShape: "CIRCLE",
        shapeCenter: { x: 0.52, y: 0.49 },
        shapeRadius: 0.22,
      },
    };

    const result = MatchCutEngine.evaluateMatchCut(shotA, shotB);

    assert.equal(result.type, "GEOMETRIC");
    assert.ok(result.matchScore >= 85.0);
    assert.ok(result.geometricAffinity >= 85.0);
    assert.equal(result.isViableMatchCut, true);
    assert.ok(result.explanation.includes("Viable GEOMETRIC match cut"));
  });

  it("detects viable kinetic motion match cut between parallel tracking motions", () => {
    const shotA: ShotWithFeatures = {
      id: "shot_train_speeding",
      features: {
        motionVectorDegrees: 90.0, // Moving right
        motionSpeed: 0.70,
      },
    };

    const shotB: ShotWithFeatures = {
      id: "shot_runner_sprinting",
      features: {
        motionVectorDegrees: 95.0, // Also moving right within 5 degrees
        motionSpeed: 0.68,
      },
    };

    const result = MatchCutEngine.evaluateMatchCut(shotA, shotB);

    assert.equal(result.type, "KINETIC");
    assert.ok(result.kineticAffinity >= 85.0);
    assert.ok(result.matchScore >= 85.0);
    assert.equal(result.isViableMatchCut, true);
  });

  it("detects viable chromatic match cut between matching dominant warm hues", () => {
    const shotA: ShotWithFeatures = {
      id: "shot_golden_sunset",
      features: {
        dominantColorHue: 35.0, // Warm amber/orange
      },
    };

    const shotB: ShotWithFeatures = {
      id: "shot_roaring_bonfire",
      features: {
        dominantColorHue: 38.0, // Matching amber flame hue
      },
    };

    const result = MatchCutEngine.evaluateMatchCut(shotA, shotB);

    assert.equal(result.type, "CHROMATIC");
    assert.ok(result.chromaticAffinity >= 90.0);
    assert.equal(result.isViableMatchCut, true);
  });

  it("rejects non-matching disparate shots and suggests standard cuts", () => {
    const shotA: ShotWithFeatures = {
      id: "shot_blue_office",
      features: {
        primaryShape: "RECTANGLE",
        dominantColorHue: 210.0, // Cool blue
        motionVectorDegrees: 0.0,
      },
    };

    const shotB: ShotWithFeatures = {
      id: "shot_red_apple",
      features: {
        primaryShape: "CIRCLE",
        dominantColorHue: 0.0, // Red
        motionVectorDegrees: 180.0, // Opposite direction
      },
    };

    const result = MatchCutEngine.evaluateMatchCut(shotA, shotB);

    assert.ok(result.matchScore < 50.0);
    assert.equal(result.isViableMatchCut, false);
    assert.ok(result.explanation.includes("below match cut threshold"));
  });

  it("calculates accurate spatial offsets and scale correction factors for alignment", () => {
    const shotA: ShotWithFeatures = {
      id: "shot_eye_closeup",
      features: {
        primaryShape: "EYE",
        shapeCenter: { x: 0.45, y: 0.55 },
        shapeRadius: 0.15,
      },
    };

    const shotB: ShotWithFeatures = {
      id: "shot_galaxy_core",
      features: {
        primaryShape: "EYE",
        shapeCenter: { x: 0.50, y: 0.50 },
        shapeRadius: 0.30,
      },
    };

    const offset = MatchCutEngine.calculateSpatialOffset(shotA.features, shotB.features);

    assert.equal(offset.deltaX, -0.05);
    assert.equal(offset.deltaY, 0.05);
    assert.equal(offset.scaleCorrectionFactor, 0.5); // 0.15 / 0.30
  });

  it("scans sequence and emits deterministic SHA-256 match cut report", () => {
    const sequence: ShotWithFeatures[] = [
      {
        id: "shot_01",
        features: { primaryShape: "CIRCLE", shapeCenter: { x: 0.5, y: 0.5 }, shapeRadius: 0.2 },
      },
      {
        id: "shot_02",
        features: { primaryShape: "CIRCLE", shapeCenter: { x: 0.5, y: 0.5 }, shapeRadius: 0.2 },
      },
      {
        id: "shot_03",
        features: { dominantColorHue: 210.0, motionVectorDegrees: 180.0 },
      },
    ];

    const report1 = MatchCutEngine.scanSequenceForMatchCuts("seq_intro", sequence);
    const report2 = MatchCutEngine.scanSequenceForMatchCuts("seq_intro", sequence);

    assert.equal(report1.totalPairsEvaluated, 2);
    assert.equal(report1.viableMatchesCount, 1);
    assert.equal(report1.checksumSha256, report2.checksumSha256);
    assert.equal(report1.checksumSha256.length, 64);
  });

  it("PBT: matchScore and affinities are always strictly bounded within [0.0, 100.0]", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("CIRCLE", "RECTANGLE", "LINEAR_HORIZON", "SILHOUETTE", "EYE", "SPIRAL"),
        fc.constantFrom("CIRCLE", "RECTANGLE", "LINEAR_HORIZON", "SILHOUETTE", "EYE", "SPIRAL"),
        fc.float({ min: 0.0, max: 360.0, noNaN: true }),
        fc.float({ min: 0.0, max: 360.0, noNaN: true }),
        (shapeA, shapeB, hueA, hueB) => {
          const shotA: ShotWithFeatures = {
            id: "a",
            features: { primaryShape: shapeA as any, dominantColorHue: hueA },
          };
          const shotB: ShotWithFeatures = {
            id: "b",
            features: { primaryShape: shapeB as any, dominantColorHue: hueB },
          };

          const res = MatchCutEngine.evaluateMatchCut(shotA, shotB);

          return (
            res.matchScore >= 0.0 &&
            res.matchScore <= 100.0 &&
            res.geometricAffinity >= 0.0 &&
            res.geometricAffinity <= 100.0 &&
            res.chromaticAffinity >= 0.0 &&
            res.chromaticAffinity <= 100.0
          );
        }
      ),
      { numRuns: 50 }
    );
  });
});
