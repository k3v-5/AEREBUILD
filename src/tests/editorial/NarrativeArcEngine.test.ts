import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { NarrativeArcEngine } from "../../editorial/narrative/narrative-arc-engine.js";
import { SceneEntity } from "../../editorial/contracts/knowledge-graph.types.js";

describe("Fase 4C — Narrative Arc & Documentary Intelligence Suite", () => {
  const mockScenes: SceneEntity[] = [
    { id: "scene_01", name: "The Discovery", estimatedDurationSeconds: 30.0, narrativeImportance: 0.9, participantIds: [] },
    { id: "scene_02", name: "Historical Context", estimatedDurationSeconds: 40.0, narrativeImportance: 0.4, participantIds: [] },
    { id: "scene_03", name: "The Central Question", estimatedDurationSeconds: 25.0, narrativeImportance: 0.6, participantIds: [] },
    { id: "scene_04", name: "Uncovered Evidence", estimatedDurationSeconds: 35.0, narrativeImportance: 0.7, participantIds: [] },
    { id: "scene_05", name: "Witness Testimony", estimatedDurationSeconds: 45.0, narrativeImportance: 0.8, participantIds: [] },
  ];

  it("builds plan distributing scenes into 10 canonical beats with contiguous temporal ordering", () => {
    const plan = NarrativeArcEngine.buildPlan({
      projectId: "doc_project_01",
      scenes: mockScenes,
      totalDurationSeconds: 300.0,
    });

    assert.equal(plan.projectId, "doc_project_01");
    assert.equal(plan.beats.length, 10);
    assert.equal(plan.totalDurationSeconds, 300.0);
    assert.equal(plan.beats[0].beat, "HOOK");
    assert.equal(plan.beats[9].beat, "REFLECTION");

    // Invariant: contiguous temporal ordering
    for (let i = 0; i < plan.beats.length; i++) {
      const beat = plan.beats[i];
      assert.ok(beat.timelineStartSeconds <= beat.timelineEndSeconds);
      if (i > 0) {
        assert.equal(beat.timelineStartSeconds, plan.beats[i - 1].timelineEndSeconds);
      }
    }
  });

  it("validates causality dependencies and detects chronological inversions (REQ-044)", () => {
    const plan = NarrativeArcEngine.buildPlan({
      projectId: "doc_causality_test",
      scenes: mockScenes,
      totalDurationSeconds: 200.0,
      causalityEdges: [
        {
          fromBeatId: "beat_evidence_4",
          toBeatId: "beat_revelation_8",
          reason: "Evidence must be presented before revelation",
          strict: true,
        },
      ],
    });

    // Valid plan: evidence precedes revelation
    const validation1 = NarrativeArcEngine.validateCausality(plan);
    assert.equal(validation1.valid, true);
    assert.equal(validation1.violations.length, 0);

    // Inverted plan: set revelation earlier than evidence
    const invertedPlan = {
      ...plan,
      causalityEdges: [
        {
          fromBeatId: "beat_revelation_8",
          toBeatId: "beat_evidence_4",
          reason: "Testing inverted causality constraint",
          strict: true,
        },
      ],
    };

    const validation2 = NarrativeArcEngine.validateCausality(invertedPlan);
    assert.equal(validation2.valid, false);
    assert.ok(validation2.violations[0].includes("Causality inversion"));
  });

  it("protects against premature reveals of key evidence before allowed beat (REQ-045)", () => {
    const plan = NarrativeArcEngine.buildPlan({
      projectId: "doc_reveal_test",
      scenes: mockScenes,
      totalDurationSeconds: 300.0,
      revealConstraints: [
        {
          itemId: "secret_document_x",
          itemType: "EVIDENCE_ASSET",
          prohibitedBeforeBeat: "REVELATION",
          description: "Crucial secret document X",
        },
      ],
    });

    // Revelation beat starts at 30.0s * 7 = 210.0s
    const revelationBeat = plan.beats.find((b) => b.beat === "REVELATION")!;
    assert.ok(revelationBeat !== undefined);

    // Case 1: Premature reveal at 50s (during CONTEXT)
    const badOccurrences = [
      { clipId: "clip_02", itemId: "secret_document_x", timestampSeconds: 50.0 },
    ];
    const check1 = NarrativeArcEngine.validateRevealConstraints(plan, badOccurrences);
    assert.equal(check1.valid, false);
    assert.ok(check1.violations[0].includes("Premature reveal"));

    // Case 2: Valid reveal at 220s (inside REVELATION beat)
    const goodOccurrences = [
      { clipId: "clip_08", itemId: "secret_document_x", timestampSeconds: 220.0 },
    ];
    const check2 = NarrativeArcEngine.validateRevealConstraints(plan, goodOccurrences);
    assert.equal(check2.valid, true);
    assert.equal(check2.violations.length, 0);
  });

  it("produces deterministic SHA-256 plan checksum across multiple runs", () => {
    const plan1 = NarrativeArcEngine.buildPlan({
      projectId: "doc_det_01",
      scenes: mockScenes,
      totalDurationSeconds: 250.0,
    });

    const plan2 = NarrativeArcEngine.buildPlan({
      projectId: "doc_det_01",
      scenes: mockScenes,
      totalDurationSeconds: 250.0,
    });

    assert.equal(plan1.checksumSha256.length, 64);
    assert.equal(plan1.checksumSha256, plan2.checksumSha256);
  });

  it("PBT: evaluated energy at any timestamp t is strictly bounded within [0.0, 1.0]", () => {
    const plan = NarrativeArcEngine.buildPlan({
      projectId: "pbt_energy_test",
      scenes: mockScenes,
      totalDurationSeconds: 300.0,
    });

    fc.assert(
      fc.property(fc.float({ min: 0.0, max: 300.0, noNaN: true }), (t) => {
        const energy = NarrativeArcEngine.evaluateEnergyAtTime(plan.beats, t);
        return energy >= 0.0 && energy <= 1.0;
      }),
      { numRuns: 100 }
    );
  });
});
