import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import {
  MultiCameraDirector,
  SpeakerDetector,
  CameraAngleDefinition,
  SpeechTurn,
} from "../../editorial/multicam/index.js";

describe("P1 — Multi-Camera Director & Speaker Tracking Suite (REQ-011 / REQ-012)", () => {
  const angles: CameraAngleDefinition[] = [
    {
      angleId: "cam_wide",
      name: "Wide Establishing",
      role: "WIDE",
      spatialSide: "NEUTRAL_CENTER",
      cameraAzimuthDeg: 0,
      scale: "WIDE",
    },
    {
      angleId: "cam_host",
      name: "Host Close-Up",
      role: "SPEAKER_PRIMARY",
      assignedSpeakerId: "spk_host",
      spatialSide: "LEFT_OF_AXIS",
      cameraAzimuthDeg: 45,
      scale: "MEDIUM_CLOSE",
    },
    {
      angleId: "cam_guest",
      name: "Guest Close-Up",
      role: "SPEAKER_SECONDARY",
      assignedSpeakerId: "spk_guest",
      spatialSide: "RIGHT_OF_AXIS",
      cameraAzimuthDeg: 315,
      scale: "CLOSE_UP",
    },
  ];

  it("builds speaker tracks with identity, presence and energy through SpeakerDetector", () => {
    const tracks = SpeakerDetector.buildSpeakerTracks({
      identities: [
        { speakerId: "spk_host", name: "Host", role: "HOST" },
        { speakerId: "spk_guest", name: "Guest", role: "INTERVIEWEE" },
      ],
      turns: [
        { speakerId: "spk_host", startSeconds: 0, endSeconds: 5, energyLevel: 0.8 },
        { speakerId: "spk_guest", startSeconds: 5, endSeconds: 15, emotionalState: "CONFESSION", energyLevel: 0.9 },
      ],
    });

    assert.equal(tracks.size, 2);
    const hostTrack = tracks.get("spk_host");
    const guestTrack = tracks.get("spk_guest");

    assert.ok(hostTrack);
    assert.ok(guestTrack);
    assert.equal(guestTrack.turns[0].emotionalState, "CONFESSION");
  });

  it("strictly enforces Emotional Protection Rule: holds camera on speaker during confession and breakdown (REQ-011 §6.3)", () => {
    const speechTurns: SpeechTurn[] = [
      { speakerId: "spk_host", startSeconds: 0, endSeconds: 4 },
      // Guest starts emotional confession at 4s and experiences breakdown at 8s
      { speakerId: "spk_guest", startSeconds: 4, endSeconds: 8, emotionalState: "CONFESSION" },
      { speakerId: "spk_guest", startSeconds: 8, endSeconds: 14, emotionalState: "BREAKDOWN" },
      { speakerId: "spk_host", startSeconds: 14, endSeconds: 20 },
    ];

    const decisions = MultiCameraDirector.planSwitching({
      angles,
      speechTurns,
    });

    assert.ok(decisions.length >= 3);

    // Finding decision at 4s: must cut to guest camera and mark emotional protection
    const confCut = decisions.find((d) => d.timestampSeconds === 4.0);
    assert.ok(confCut);
    assert.equal(confCut.activeAngleId, "cam_guest");
    assert.equal(confCut.isEmotionalProtection, true);
    assert.equal(confCut.emotionalState, "CONFESSION");

    // Decision at 8s: must HOLD camera on guest to protect breakdown
    const breakdownHold = decisions.find((d) => d.timestampSeconds === 8.0);
    assert.ok(breakdownHold);
    assert.equal(breakdownHold.activeAngleId, "cam_guest");
    assert.equal(breakdownHold.isEmotionalProtection, true);
    assert.equal(breakdownHold.emotionalState, "BREAKDOWN");
  });

  it("validates 180° spatial axis and prevents crossing the line without neutral shot (REQ-011 §6.4)", () => {
    const hostCam = angles.find((a) => a.angleId === "cam_host")!;
    const guestCam = angles.find((a) => a.angleId === "cam_guest")!;
    const wideCam = angles.find((a) => a.angleId === "cam_wide")!;

    // Direct transition from LEFT to RIGHT without neutral is invalid
    const directCheck = MultiCameraDirector.validate180Axis(hostCam, guestCam);
    assert.equal(directCheck.isValid, false);
    assert.ok(directCheck.reason?.includes("180°"));

    // Transition via NEUTRAL_CENTER (WIDE) is valid
    const wideCheck1 = MultiCameraDirector.validate180Axis(hostCam, wideCam);
    const wideCheck2 = MultiCameraDirector.validate180Axis(wideCam, guestCam);
    assert.equal(wideCheck1.isValid, true);
    assert.equal(wideCheck2.isValid, true);
  });

  it("guarantees 100% deterministic decision IDs and sequence without randomness", () => {
    const speechTurns: SpeechTurn[] = [
      { speakerId: "spk_host", startSeconds: 0, endSeconds: 5 },
      { speakerId: "spk_guest", startSeconds: 5, endSeconds: 12 },
    ];

    const run1 = MultiCameraDirector.planSwitching({ angles, speechTurns });
    const run2 = MultiCameraDirector.planSwitching({ angles, speechTurns });

    assert.equal(JSON.stringify(run1), JSON.stringify(run2));
    assert.ok(!run1[0].id.includes("undefined"));
    assert.ok(run1[0].id.startsWith("mc_init_"));
  });

  it("PBT: decision timestamps are strictly monotonic and confidence is bounded in [0.0, 1.0]", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            speakerId: fc.constantFrom("spk_host", "spk_guest"),
            duration: fc.double({ min: 3.0, max: 15.0, noNaN: true }),
            emotional: fc.constantFrom("NONE", "CONFESSION", "CRYING"),
          }),
          { minLength: 2, maxLength: 6 }
        ),
        (rawTurns) => {
          let cursor = 0.0;
          const speechTurns: SpeechTurn[] = rawTurns.map((r) => {
            const start = cursor;
            cursor += r.duration;
            return {
              speakerId: r.speakerId,
              startSeconds: start,
              endSeconds: cursor,
              emotionalState: r.emotional as any,
            };
          });

          const decisions = MultiCameraDirector.planSwitching({ angles, speechTurns });

          for (let i = 1; i < decisions.length; i++) {
            if (decisions[i].timestampSeconds < decisions[i - 1].timestampSeconds) return false;
            if (decisions[i].confidence < 0.0 || decisions[i].confidence > 1.0) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
