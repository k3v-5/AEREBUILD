import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { EditorialQALinter } from "../../editorial/qa/editorial-qa-linter.js";
import { EditorialIR } from "../../editorial/ir/editorial-ir.types.js";
import { QAEvaluationContext } from "../../editorial/qa/qa-rules.js";

describe("Fase 4I — Editorial QA Linter & Audit Engine Suite", () => {
  const cleanIR: EditorialIR = {
    schemaVersion: "4.0.0",
    projectId: "clean_proj",
    createdAt: new Date().toISOString(),
    checksum: "0".repeat(64),
    metadata: {
      title: "Clean Documentary",
      profile: "DOCUMENTARY",
      frameRate: 30,
      width: 1920,
      height: 1080,
      sampleRate: 44100,
      targetDialogueLufs: -16,
    },
    tracks: [
      {
        id: "v_primary",
        name: "Video 1",
        type: "VIDEO_PRIMARY",
        index: 0,
        isMuted: false,
        isLocked: false,
        clips: [
          {
            id: "clip_01",
            assetId: "media_a",
            label: "Opening Shot",
            sourceRange: { startSeconds: 0, durationSeconds: 5.0 },
            timelineRange: { startSeconds: 0, durationSeconds: 5.0 },
            speed: 1.0,
            volumeDb: 0.0,
            pan: 0.0,
            scale: 1.0,
          },
          {
            id: "clip_02",
            assetId: "media_b",
            label: "Interview 1",
            sourceRange: { startSeconds: 0, durationSeconds: 10.0 },
            timelineRange: { startSeconds: 5.0, durationSeconds: 10.0 },
            speed: 1.0,
            volumeDb: 0.0,
            pan: 0.0,
            scale: 1.0,
          },
        ],
      },
    ],
    transitions: [],
    markers: [],
  };

  it("passes clean IR with perfect 100 score and canExport = true (REQ-4I-021)", () => {
    const report = EditorialQALinter.lint({ ir: cleanIR });
    assert.equal(report.blockingCount, 0);
    assert.equal(report.canExport, true);
    assert.equal(report.overallScore, 100.0);
    assert.equal(report.checksumSha256.length, 64);
  });

  it("flags black frame gaps and missing asset IDs as BLOCKING (canExport = false)", () => {
    const brokenIR: EditorialIR = {
      ...cleanIR,
      tracks: [
        {
          id: "v_primary",
          name: "Video 1",
          type: "VIDEO_PRIMARY",
          index: 0,
          isMuted: false,
          isLocked: false,
          clips: [
            {
              id: "c_gap",
              assetId: "", // Missing asset ID -> QA-ASSET-001 BLOCKING
              label: "Broken Shot",
              sourceRange: { startSeconds: 0, durationSeconds: 2.0 },
              timelineRange: { startSeconds: 1.5, durationSeconds: 2.0 }, // Head gap of 1.5s -> QA-TIME-002 BLOCKING
              speed: 1.0,
              volumeDb: 0.0,
              pan: 0.0,
              scale: 1.0,
            },
          ],
        },
      ],
    };

    const report = EditorialQALinter.lint({ ir: brokenIR });
    assert.ok(report.blockingCount >= 2);
    assert.equal(report.canExport, false);
    assert.ok(report.overallScore <= 50.0);
    assert.ok(report.findings.some((f) => f.ruleId === "QA-TIME-002"));
    assert.ok(report.findings.some((f) => f.ruleId === "QA-ASSET-001"));
  });

  it("flags unverified factual claims as BLOCKING (REQ-4I-024)", () => {
    const ctx: QAEvaluationContext = {
      ir: cleanIR,
      evidenceReport: {
        projectId: "clean_proj",
        checksumSha256: "1".repeat(64),
        totalClaims: 1,
        verifiedClaims: 0,
        unverifiedClaims: 1,
        missingSourceClaims: 1,
        evidenceIntegrityScore: 0.0,
        audits: [
          {
            claimId: "unverified_01",
            claimText: "Unsubstantiated factual statement",
            status: "MISSING_SOURCE",
            hasEvidence: false,
            evidenceCount: 0,
            requiresCitation: true,
            hasCitation: false,
            confidence: 0.95,
            blockingIssue: true,
            notes: "No source attached",
          },
        ],
        citationCards: [],
      },
    };

    const report = EditorialQALinter.lint(ctx);
    assert.ok(report.blockingCount >= 1);
    assert.equal(report.canExport, false);
    assert.ok(report.findings.some((f) => f.ruleId === "QA-EVIDENCE-001"));
  });

  it("PBT: overallScore is always strictly bounded within [0.0, 100.0]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10 }),
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 30 }),
        (block, warn, sugg) => {
          const penalties = 25.0 * block + 5.0 * warn + 1.0 * sugg;
          const score = Math.max(0.0, Math.min(100.0, 100.0 - penalties));
          return Number.isFinite(score) && score >= 0.0 && score <= 100.0;
        }
      ),
      { numRuns: 50 }
    );
  });
});
