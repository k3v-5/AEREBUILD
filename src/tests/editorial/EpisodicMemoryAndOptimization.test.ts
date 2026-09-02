import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EpisodicSeriesMemory } from "../../editorial/series/index.js";
import {
  EditorialConstraintSolver,
  ParetoEditorialOptimizer,
  CandidateProposal,
} from "../../editorial/optimization/index.js";

describe("P4 — Episodic Series Memory, Constraint Solver & Pareto Optimization (REQ-072–079)", () => {
  it("REQ-072–075: preserves persistent series memory across episodes and survives JSON serialization", () => {
    const memory = new EpisodicSeriesMemory("series_doc_chronicles");

    memory.registerCharacter({
      characterId: "char_dr_alvarez",
      name: "Dr. Elena Alvarez",
      aliases: ["Elena", "The Whistleblower"],
      role: "WITNESS",
      appearance: "Short dark hair, lab coat, glasses",
      firstAppearanceEpisode: "ep_01",
      continuityConstraints: ["DO_NOT_CUT_DURING_VULNERABILITY"],
    });

    memory.registerLocation({
      locationId: "loc_underground_lab",
      name: "Underground Research Facility",
      aliases: ["Site B"],
      visualDescriptors: ["cold fluorescent lighting", "concrete walls"],
      paletteHex: ["#1a202c", "#718096"],
      cameraGrammar: "WIDE_ESTABLISHING_OBSERVATIONAL",
    });

    memory.recordEditorialFeedback({
      ruleId: "FEEDBACK_RULE_001",
      summary: "Never cut away from witness during emotional breakdown",
      originatingFeedback: "Reviewer requested full hold during climax",
      episodeId: "ep_01",
    });

    memory.commitEpisode({
      episodeId: "ep_01",
      episodeNumber: 1,
      title: "The Silent Warning",
      charactersPresent: ["char_dr_alvarez"],
      locationsPresent: ["loc_underground_lab"],
      motifsUsed: ["TICKING_CLOCK"],
      irChecksum: "ir_ep01_checksum_123",
      committedAt: "2026-09-02T12:00:00.000Z",
    });

    const hash1 = memory.calculateCanonicalHash();
    assert.ok(hash1.length === 64);

    // Save and load
    const json = memory.saveToJson();
    const restored = new EpisodicSeriesMemory("series_doc_chronicles");
    restored.loadFromJson(json);

    assert.equal(restored.calculateCanonicalHash(), hash1);
    assert.equal(restored.getCharacter("char_dr_alvarez")?.name, "Dr. Elena Alvarez");
    assert.equal(restored.getLocation("loc_underground_lab")?.name, "Underground Research Facility");
    assert.equal(restored.getEditorialRules().length, 1);
  });

  it("REQ-077: enforces inviolability of hard constraints over soft constraints", () => {
    const solver = new EditorialConstraintSolver();

    // Register Hard Constraint: Safety / Legal clearance
    solver.registerConstraint({
      id: "LEGAL_CLEARANCE",
      name: "All media must have valid commercial license",
      constraintClass: "HARD",
      description: "Inviolable commercial license clearance",
      validator: (cand) => ({
        passed: cand.hasLicense === true,
        reason: cand.hasLicense ? undefined : "Media asset lacks commercial license clearance",
      }),
    });

    // Register Soft Constraint: Pacing
    solver.registerConstraint({
      id: "PACING_TARGET",
      name: "Average shot length between 2.0 and 4.0 seconds",
      constraintClass: "SOFT",
      description: "Target shot rhythm",
      validator: (cand) => ({
        passed: cand.avgShotLength >= 2.0 && cand.avgShotLength <= 4.0,
        reason: "Shot length outside optimal pacing band",
      }),
    });

    // Candidate 1: Perfect pacing, but violates legal clearance
    const candidateUnlicensed = { hasLicense: false, avgShotLength: 3.0 };
    const res1 = solver.solve(candidateUnlicensed);
    assert.equal(res1.isFeasible, false);
    assert.ok(res1.explanation.includes("INVIOLABLE_HARD_CONSTRAINT_FAILURE"));
    assert.equal(res1.violatedHardConstraints.length, 1);

    // Candidate 2: Valid license, but slightly fast pacing (soft violation)
    const candidateLicensed = { hasLicense: true, avgShotLength: 1.5 };
    const res2 = solver.solve(candidateLicensed);
    assert.equal(res2.isFeasible, true);
    assert.equal(res2.violatedHardConstraints.length, 0);
    assert.equal(res2.violatedSoftConstraints.length, 1);
  });

  it("REQ-078 & REQ-079: computes non-dominated Pareto front and verifies no solution in Pareto set is dominated", () => {
    // 4 candidate proposals for cutting a timeline from 132s down to ~120s
    const candidates: CandidateProposal[] = [
      {
        id: "prop_max_evidence",
        name: "Max Evidence Retention",
        durationSeconds: 122.0,
        metrics: {
          narrativeLoss: 0.10,
          attentionLoss: 0.15,
          pacingLoss: 0.30, // sacrificed pacing to retain facts
          evidenceLoss: 0.02, // ultra low evidence loss
          continuityLoss: 0.05,
          audioLoss: 0.05,
          styleLoss: 0.05,
          durationLoss: 0.08,
        },
        candidatePayload: { hasLicense: true },
      },
      {
        id: "prop_max_rhythm",
        name: "Max Rhythm Pacing",
        durationSeconds: 120.0,
        metrics: {
          narrativeLoss: 0.15,
          attentionLoss: 0.08,
          pacingLoss: 0.02, // perfect pacing
          evidenceLoss: 0.25, // sacrificed secondary evidence
          continuityLoss: 0.05,
          audioLoss: 0.05,
          styleLoss: 0.05,
          durationLoss: 0.00,
        },
        candidatePayload: { hasLicense: true },
      },
      {
        id: "prop_balanced",
        name: "Balanced Compromise",
        durationSeconds: 120.5,
        metrics: {
          narrativeLoss: 0.12,
          attentionLoss: 0.10,
          pacingLoss: 0.10,
          evidenceLoss: 0.10,
          continuityLoss: 0.05,
          audioLoss: 0.05,
          styleLoss: 0.05,
          durationLoss: 0.02,
        },
        candidatePayload: { hasLicense: true },
      },
      {
        id: "prop_strictly_dominated",
        name: "Strictly Inferior Proposal",
        durationSeconds: 128.0,
        metrics: {
          narrativeLoss: 0.80, // strictly worse in all dimensions
          attentionLoss: 0.80,
          pacingLoss: 0.80,
          evidenceLoss: 0.80,
          continuityLoss: 0.80,
          audioLoss: 0.80,
          styleLoss: 0.80,
          durationLoss: 0.80,
        },
        candidatePayload: { hasLicense: true },
      },
    ];

    const paretoFront = ParetoEditorialOptimizer.computeParetoFront(candidates);

    // Strictly dominated proposal must be purged from Pareto front
    assert.ok(paretoFront.length >= 2);
    assert.ok(!paretoFront.some((sol) => sol.proposal.id === "prop_strictly_dominated"));

    // Formally verify Pareto invariant: NO solution in the front is dominated by any other in the front
    for (let i = 0; i < paretoFront.length; i++) {
      for (let j = 0; j < paretoFront.length; j++) {
        if (i === j) continue;
        const dom = ParetoEditorialOptimizer.dominates(
          paretoFront[j].proposal.metrics,
          paretoFront[i].proposal.metrics
        );
        assert.equal(
          dom,
          false,
          `Violation of Pareto optimality: solution ${paretoFront[j].proposal.id} dominates ${paretoFront[i].proposal.id} within the Pareto set`
        );
      }
    }

    // Each solution must contain structured trade-off explanations
    for (const sol of paretoFront) {
      assert.ok(sol.explanation.whatChanged.length > 0);
      assert.ok(sol.explanation.whatWasPreserved.length > 0);
      assert.ok(sol.explanation.whatWasSacrificed.length > 0);
    }
  });
});
