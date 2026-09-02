import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EditorialImpactAnalyzer } from "../../editorial/qa/editorial-impact-analyzer.js";

describe("REQ-082 §27: EditorialImpactAnalyzer Suite", () => {
  const baseDoc = {
    schemaVersion: "4.0.0",
    projectId: "impact_test_doc",
    createdAt: "2026-09-02T00:00:00.000Z",
    checksum: "0".repeat(64),
    metadata: {
      title: "Impact Test",
      profile: "DOCUMENTARY",
      frameRate: 30,
      width: 1920,
      height: 1080,
      sampleRate: 44100,
      targetDialogueLufs: -16,
    },
    tracks: [
      {
        id: "v1",
        name: "Video",
        type: "VIDEO_PRIMARY",
        index: 0,
        isMuted: false,
        isLocked: false,
        clips: [
          {
            id: "c1",
            assetId: "a1",
            label: "Shot 1",
            sourceRange: { startSeconds: 0, durationSeconds: 5.0 },
            timelineRange: { startSeconds: 0, durationSeconds: 5.0 },
            speed: 1.0,
            volumeDb: 0,
            pan: 0,
            scale: 1,
          },
        ],
      },
    ],
    transitions: [],
    markers: [],
  };

  it("classifies identical documents as ImpactLevel 'NONE' and duration delta 0", () => {
    const res = EditorialImpactAnalyzer.analyze({
      beforeDoc: baseDoc,
      afterDoc: baseDoc,
      diffs: [],
    });

    assert.equal(res.impactLevel, "NONE");
    assert.equal(res.report.narrativeImpact, "NONE");
    assert.equal(res.impact.durationDeltaSeconds, 0.0);
  });

  it("computes duration delta and triggers MODERATE/HIGH impact on large duration shift", () => {
    const modifiedDoc = JSON.parse(JSON.stringify(baseDoc));
    modifiedDoc.tracks[0].clips[0].timelineRange.durationSeconds = 12.0;

    const res = EditorialImpactAnalyzer.analyze({
      beforeDoc: baseDoc,
      afterDoc: modifiedDoc,
      diffs: [
        {
          type: "CLIP_MODIFIED",
          entityId: "c1",
          trackId: "v1",
          before: baseDoc.tracks[0].clips[0],
          after: modifiedDoc.tracks[0].clips[0],
          description: "Duration changed",
        },
      ],
    });

    assert.equal(res.impact.durationDeltaSeconds, 7.0);
    assert.ok(res.impactLevel === "MEDIUM" || res.impactLevel === "HIGH" || res.impactLevel === "MODERATE");
  });

  it("detects narrative impact when story beats are modified", () => {
    const docWithBeats = {
      ...baseDoc,
      beats: [
        { id: "b1", type: "HOOK" },
        { id: "b2", type: "CONTEXT" },
      ],
    };
    const docMissingBeat = {
      ...baseDoc,
      beats: [{ id: "b1", type: "HOOK" }],
    };

    const res = EditorialImpactAnalyzer.analyze({
      beforeDoc: docWithBeats,
      afterDoc: docMissingBeat,
      diffs: [],
    });

    assert.equal(res.report.narrativeImpact, "HIGH");
  });
});
