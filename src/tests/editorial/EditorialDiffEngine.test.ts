import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EditorialDiffEngine } from "../../editorial/qa/editorial-diff-engine.js";
import { EditorialIR } from "../../editorial/ir/editorial-ir.types.js";
import { ProposalEngine } from "../../editorial/qa/proposal-engine.js";
import { ChecksumMismatchError } from "../../editorial/qa/types.js";

describe("Fase 4I — Editorial Diff Engine & Proposal-First Suite", () => {
  const baseIR: EditorialIR = {
    schemaVersion: "4.0.0",
    projectId: "diff_proj",
    createdAt: new Date().toISOString(),
    checksum: "0".repeat(64),
    metadata: {
      title: "Diff Project",
      profile: "DOCUMENTARY",
      frameRate: 30,
      width: 1920,
      height: 1080,
      sampleRate: 44100,
      targetDialogueLufs: -16,
    },
    tracks: [
      {
        id: "v_track_1",
        name: "Video Track",
        type: "VIDEO_PRIMARY",
        index: 0,
        isMuted: false,
        isLocked: false,
        clips: [
          {
            id: "c1",
            assetId: "a1",
            label: "Shot 1",
            sourceRange: { startSeconds: 0, durationSeconds: 6.0 },
            timelineRange: { startSeconds: 0, durationSeconds: 6.0 },
            speed: 1.0,
            volumeDb: 0.0,
            pan: 0.0,
            scale: 1.0,
          },
          {
            id: "c2",
            assetId: "a2",
            label: "Shot 2",
            sourceRange: { startSeconds: 0, durationSeconds: 6.0 },
            timelineRange: { startSeconds: 6.0, durationSeconds: 6.0 },
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

  it("diff(A, A) returns empty changes with riskLevel = 'LOW' (REQ-4I-097)", () => {
    const diff = EditorialDiffEngine.compare({
      baseIR,
      candidateIR: baseIR,
    });

    assert.equal(diff.changes.length, 0);
    assert.equal(diff.impact.durationDeltaSeconds, 0);
    assert.equal(diff.impact.cutCountDelta, 0);
    assert.equal(diff.riskLevel, "LOW");
    assert.equal(diff.baseChecksum, diff.candidateChecksum);
  });

  it("detects ADD, REMOVE, MOVE operations and calculates accurate deltas (REQ-4I-034)", () => {
    const candidateIR: EditorialIR = {
      ...baseIR,
      tracks: [
        {
          ...baseIR.tracks[0],
          clips: [
            baseIR.tracks[0].clips[0], // c1 preserved
            {
              // c3 added
              id: "c3",
              assetId: "a3",
              label: "New Shot 3",
              sourceRange: { startSeconds: 0, durationSeconds: 4.0 },
              timelineRange: { startSeconds: 6.0, durationSeconds: 4.0 },
              speed: 1.0,
              volumeDb: 0.0,
              pan: 0.0,
              scale: 1.0,
            },
          ],
        },
      ],
    };

    const diff = EditorialDiffEngine.compare({
      baseIR,
      candidateIR,
      basePacingScore: 90.0,
      candidatePacingScore: 70.0, // pacing dropped by 20 -> HIGH risk
    });

    assert.ok(diff.changes.some((c) => c.operation === "ADD"));
    assert.ok(diff.changes.some((c) => c.operation === "REMOVE"));
    assert.equal(diff.impact.cutCountDelta, 0); // 2 clips -> 2 clips
    assert.equal(diff.impact.durationDeltaSeconds, -2.0); // 12s -> 10s
    assert.equal(diff.impact.pacingAlignmentDelta, -20.0);
    assert.equal(diff.riskLevel, "HIGH");
  });

  it("ProposalEngine enforces non-destructiveness and checks base checksum preconditions (REQ-4I-045)", () => {
    const { proposal, apply } = ProposalEngine.createProposal({
      id: "prop_01",
      type: "TRIM_TAIL",
      reason: "Trim shot 1 tail by 1.0s",
      confidence: 0.95,
      baseIR,
      patch: (clone) => {
        clone.tracks[0].clips[0].timelineRange.durationSeconds = 5.0;
      },
    });

    assert.equal(proposal.type, "TRIM_TAIL");

    // Apply proposal
    const result = apply();
    assert.equal(result.candidateIR.tracks[0].clips[0].timelineRange.durationSeconds, 5.0);

    // Verify original baseIR was NOT mutated
    assert.equal(baseIR.tracks[0].clips[0].timelineRange.durationSeconds, 6.0);
  });

  it("throws ChecksumMismatchError when base IR changes before proposal application (REQ-4I-099)", () => {
    const mutatedIR = { ...baseIR, projectId: "mutated_concurrently" };
    const { apply } = ProposalEngine.createProposal({
      id: "prop_02",
      type: "SHIFT",
      reason: "Shift",
      confidence: 0.8,
      baseIR: mutatedIR,
      patch: () => {},
    });

    // Concurrently mutate the baseIR before apply()
    mutatedIR.projectId = "mutated_again";

    assert.throws(() => {
      apply();
    }, ChecksumMismatchError);
  });
});
