import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { IntelligentTrimmingEngine } from "../../editorial/performance/intelligent-trimming-engine.js";
import { PerformanceSegment } from "../../editorial/performance/performance-types.js";

describe("RF-056 — IntelligentTrimmingEngine Suite (REQ-056.050)", () => {
  it("generates valid proposals, protects evidence and generates micro-crossfades for trims", () => {
    const segments: PerformanceSegment[] = [
      {
        id: "seg_evidence",
        sourceClipId: "clip_01",
        startSeconds: 0,
        endSeconds: 5.0,
        transcript: "El informe de auditoría certificó 50 millones.",
        confidence: 0.95,
        markers: [],
        evidenceProtection: true,
      },
      {
        id: "seg_error",
        sourceClipId: "clip_01",
        startSeconds: 6.0,
        endSeconds: 8.0,
        transcript: "Eh... o sea...",
        confidence: 0.9,
        markers: ["FALSE_START"],
        evidenceProtection: false,
      },
    ];

    const report = IntelligentTrimmingEngine.process({
      segments,
      sourceDurationSeconds: 10.0,
    });

    assert.equal(report.status, "PROPOSALS_READY");
    assert.equal(report.trimsAccepted, 1);
    assert.equal(report.trimsProposed, 2);

    const keepProposal = report.proposals.find((p) => p.id === "keep_seg_evidence");
    const trimProposal = report.proposals.find((p) => p.id === "trim_seg_error");

    assert.ok(keepProposal);
    assert.equal(keepProposal?.action, "KEEP");
    assert.ok(keepProposal?.reason.includes("evidencia"));

    assert.ok(trimProposal);
    assert.equal(trimProposal?.action, "TRIM");
    assert.equal(trimProposal?.audioTransition?.type, "MICRO_CROSSFADE");
    assert.equal(trimProposal?.audioTransition?.durationSeconds, 0.025);

    // Padding checks
    assert.ok(trimProposal?.startSeconds <= 6.0);
    assert.ok(trimProposal?.endSeconds >= 8.0);
  });

  it("strictly enforces physical bounds and throws on out-of-bounds or negative durations", () => {
    const invalidSegment: PerformanceSegment = {
      id: "seg_neg",
      sourceClipId: "clip_01",
      startSeconds: 5.0,
      endSeconds: 4.0, // Invalid end <= start!
      transcript: "Error de tiempo",
      confidence: 0.9,
      markers: [],
    };

    assert.throws(() => {
      IntelligentTrimmingEngine.process({ segments: [invalidSegment] });
    }, /invalid bounds/);
  });

  it("REQ-056.026: triggers REVIEW_REQUIRED when automatic reduction exceeds 30%", () => {
    const longErrorSeg: PerformanceSegment = {
      id: "seg_massive_error",
      sourceClipId: "clip_01",
      startSeconds: 0.0,
      endSeconds: 5.0, // 5s out of 10s = 50% reduction!
      transcript: "Error masivo prolongado...",
      confidence: 0.92,
      markers: ["TECHNICAL_ERROR"],
      evidenceProtection: false,
    };

    const report = IntelligentTrimmingEngine.process({
      segments: [longErrorSeg],
      sourceDurationSeconds: 10.0,
    });

    assert.equal(report.status, "REVIEW_REQUIRED");
    assert.ok(report.metrics.reductionRatio > 0.3);
  });

  it("protects segments with narrative dependencies", () => {
    const segA: PerformanceSegment = {
      id: "seg_setup",
      sourceClipId: "clip_01",
      startSeconds: 0,
      endSeconds: 4,
      transcript: "Primero se preparó el protocolo.",
      confidence: 0.9,
      markers: ["FALSE_START"], // Tech error, but narrative dependency!
      evidenceProtection: false,
    };

    const report = IntelligentTrimmingEngine.process({
      segments: [segA],
      narrativeDependencies: {
        seg_payoff: ["seg_setup"], // seg_payoff depends on seg_setup
      },
    });

    const proposal = report.proposals.find((p) => p.id === "keep_seg_setup");
    assert.ok(proposal);
    assert.equal(proposal?.action, "KEEP");
  });

  it("computes deterministic 64-character SHA-256 seal across identical executions", () => {
    const segments: PerformanceSegment[] = [
      {
        id: "seg_1",
        sourceClipId: "clip_01",
        startSeconds: 0,
        endSeconds: 3,
        transcript: "Introducción inicial.",
        confidence: 0.95,
        markers: ["BREATH"],
      },
    ];

    const rep1 = IntelligentTrimmingEngine.process({ segments });
    const rep2 = IntelligentTrimmingEngine.process({ segments });

    assert.equal(rep1.checksumSha256.length, 64);
    assert.equal(rep1.checksumSha256, rep2.checksumSha256);
  });
});
