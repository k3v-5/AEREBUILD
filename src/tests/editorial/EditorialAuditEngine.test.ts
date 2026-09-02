import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EditorialAuditEngine } from "../../editorial/qa/editorial-audit-engine.js";
import { EditorialDocument } from "../../editorial/contracts/editorial-qa.types.js";

describe("REQ-030 / REQ-081 — EditorialAuditEngine Suite", () => {
  const cleanTimeline: EditorialDocument = {
    schemaVersion: "4.0.0",
    projectId: "audit_clean_timeline",
    createdAt: "2026-09-02T00:00:00.000Z",
    checksum: "a".repeat(64),
    metadata: {
      title: "Clean Production Timeline",
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
        name: "Video Track 1",
        type: "VIDEO_PRIMARY",
        index: 0,
        isMuted: false,
        isLocked: false,
        clips: [
          {
            id: "clip_01",
            assetId: "asset_opening",
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
            assetId: "asset_closing",
            label: "Closing Shot",
            sourceRange: { startSeconds: 0, durationSeconds: 5.0 },
            timelineRange: { startSeconds: 5.0, durationSeconds: 5.0 },
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

  it("produces compliant EditorialAuditReport with perfect qualityScore for clean timeline (§18, §19)", () => {
    const report = EditorialAuditEngine.audit(cleanTimeline);

    assert.equal(report.schemaVersion, "4.0.0");
    assert.equal(report.engineVersion, "v4.0.0-editorial-master");
    assert.equal(report.status, "PASS");
    assert.equal(report.canExport, true);
    assert.equal(report.qualityScore, 100);
    assert.equal(report.summary.blockingCount, 0);
    assert.equal(report.summary.warningCount, 0);
    assert.equal(report.generatedAtPolicy, "DETERMINISTIC");
    assert.ok(report.checksumSha256);
    assert.equal(report.checksumSha256.length, 64);
  });

  it("flags missing assets as BLOCKING and sets status BLOCKED with score penalty (§3.1, §19)", () => {
    const brokenTimeline: EditorialDocument = {
      ...cleanTimeline,
      tracks: [
        {
          id: "v_broken",
          name: "Video Broken",
          type: "VIDEO_PRIMARY",
          index: 0,
          isMuted: false,
          isLocked: false,
          clips: [
            {
              id: "clip_missing_asset",
              assetId: "", // BLOCKING via QA-STRUCT-002
              label: "Orphaned Clip",
              sourceRange: { startSeconds: 0, durationSeconds: 4.0 },
              timelineRange: { startSeconds: 0, durationSeconds: 4.0 },
              speed: 1.0,
              volumeDb: 0.0,
              pan: 0.0,
              scale: 1.0,
            },
          ],
        },
      ],
    };

    const report = EditorialAuditEngine.audit(brokenTimeline);

    assert.equal(report.status, "BLOCKED");
    assert.equal(report.canExport, false);
    assert.ok(report.summary.blockingCount >= 1);
    assert.ok(report.qualityScore <= 75); // 100 - 25 = 75
    assert.ok(report.findings.some((f) => f.ruleId === "QA-STRUCT-002"));
  });

  it("produces byte-identical SHA-256 checksums across repeated runs (REQ-030-P02)", () => {
    const report1 = EditorialAuditEngine.audit(cleanTimeline);
    const report2 = EditorialAuditEngine.audit(cleanTimeline);

    assert.equal(report1.checksumSha256, report2.checksumSha256);
    assert.equal(report1.qualityScore, report2.qualityScore);
  });
});
