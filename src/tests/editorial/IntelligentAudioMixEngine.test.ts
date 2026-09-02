import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import {
  HierarchicalMixer,
  JLCutEngine,
  RoomToneAnalyzer,
  RoomToneSynthesizer,
  DialogueRepairEngine,
  AdaptiveDuckingEngine,
  LoudnessEngine,
  AudioPunctuationEngine,
  SoundscapeEngine,
  AudioMixEngine,
} from "../../editorial/audio/index.js";

describe("P0 — Intelligent Audio Post-Production & Adaptive Mix Engine (REQ-056 / REQ-019)", () => {
  it("initializes canonical 8-bus hierarchy and calculates cumulative gain accurately", () => {
    const mixer = new HierarchicalMixer();
    const buses = mixer.getAllBuses();

    assert.equal(buses.length, 9); // MASTER + 8 child buses
    assert.ok(buses.some((b) => b.id === "VOICE"));
    assert.ok(buses.some((b) => b.id === "DIALOGUE"));
    assert.ok(buses.some((b) => b.id === "MUSIC"));
    assert.ok(buses.some((b) => b.id === "AMBIENCE"));
    assert.ok(buses.some((b) => b.id === "ROOM_TONE"));
    assert.ok(buses.some((b) => b.id === "SFX"));
    assert.ok(buses.some((b) => b.id === "CRITICAL_SFX"));
    assert.ok(buses.some((b) => b.id === "ARCHIVE_AUDIO"));

    // Gain propagation: MUSIC default is -6 dB, parent MASTER is 0 dB -> total -6 dB
    assert.equal(mixer.getEffectiveGainDb("MUSIC"), -6.0);
  });

  it("detects and rejects routing cycles in audio bus graph", () => {
    assert.throws(
      () => {
        new HierarchicalMixer([
          {
            id: "VOICE",
            name: "Voice",
            parentBusId: "DIALOGUE",
            gainDb: 0,
            pan: 0,
            mute: false,
            solo: false,
            effects: [],
            automations: [],
          },
          {
            id: "DIALOGUE",
            name: "Dialogue",
            parentBusId: "VOICE", // Cycle!
            gainDb: 0,
            pan: 0,
            mute: false,
            solo: false,
            effects: [],
            automations: [],
          },
        ]);
      },
      /AUDIO_BUS_CYCLE_ERROR/
    );
  });

  it("plans J-Cuts and L-Cuts within safe mathematical boundaries (REQ-020)", () => {
    // Dialogue -> B-roll = L-Cut
    const lCut = JLCutEngine.planSplitCut({
      fromClip: { id: "c1", durationSeconds: 6.0, isDialogue: true },
      toClip: { id: "c2", durationSeconds: 4.0, isDialogue: false },
      visualCutTimestampSeconds: 6.0,
    });
    assert.equal(lCut.type, "L_CUT");
    assert.ok(lCut.audioTailSeconds > 0);
    assert.ok(lCut.audioTailSeconds <= JLCutEngine.MAX_SPLIT_SECONDS);

    // B-roll -> Dialogue = J-Cut
    const jCut = JLCutEngine.planSplitCut({
      fromClip: { id: "c2", durationSeconds: 4.0, isDialogue: false },
      toClip: { id: "c3", durationSeconds: 5.0, isDialogue: true },
      visualCutTimestampSeconds: 10.0,
    });
    assert.equal(jCut.type, "J_CUT");
    assert.ok(jCut.audioLeadSeconds > 0);
    assert.ok(jCut.audioLeadSeconds <= JLCutEngine.MAX_SPLIT_SECONDS);
  });

  it("synthesizes continuous room tone bed over digital silence gaps (REQ-063)", () => {
    const profile = RoomToneAnalyzer.analyzeProfile({
      locationId: "studio_a",
      fallbackNoiseFloorDb: -52.0,
    });

    const regions = RoomToneSynthesizer.synthesizeContinuousBed({
      dialogueRegions: [
        { startSeconds: 0.0, durationSeconds: 3.0 },
        // Gap of 2.0s between 3.0 and 5.0
        { startSeconds: 5.0, durationSeconds: 4.0 },
      ],
      timelineDurationSeconds: 10.0,
      profile,
    });

    assert.ok(regions.length >= 2); // Un parche en el gap y otro al final
    assert.equal(regions[0].timelineRange.startSeconds, 3.0);
    assert.equal(regions[0].timelineRange.durationSeconds, 2.0);
    assert.equal(regions[0].busId, "ROOM_TONE");
  });

  it("produces non-destructive dialogue repair proposals and routes low confidence to human review (REQ-064)", () => {
    const proposals = DialogueRepairEngine.analyzeDialogue({
      clipId: "clip_speech_01",
      startSeconds: 2.0,
      durationSeconds: 1.0,
      peakLevelDb: 0.2, // Clipping
      detectedHumHz: 60, // Hum
      hasPlosiveTransient: true, // Plosive
    });

    assert.equal(proposals.length, 3);
    const clippingProp = proposals.find((p) => p.type === "CLIPPING");
    assert.ok(clippingProp);
    assert.equal(clippingProp.requiresHumanReview, false); // High confidence

    const plosiveProp = proposals.find((p) => p.type === "PLOSIVE");
    assert.ok(plosiveProp);
    assert.equal(plosiveProp.requiresHumanReview, true); // Low confidence triggers review
  });

  it("calculates adaptive contextual ducking preserving ambience and critical SFX (REQ-045)", () => {
    const automations = AdaptiveDuckingEngine.calculateDuckingAutomations({
      dialogueIntervals: [{ startSeconds: 2.0, endSeconds: 5.0 }],
      musicDefaultGainDb: -6.0,
      musicDuckedGainDb: -16.0,
      ambienceDefaultGainDb: -12.0,
      ambienceDuckedGainDb: -14.0,
    });

    const musicAuto = automations.get("MUSIC");
    const ambienceAuto = automations.get("AMBIENCE");

    assert.ok(musicAuto);
    assert.ok(ambienceAuto);

    // Music ducks to -16 dB during dialogue
    assert.ok(musicAuto.points.some((p) => p.value === -16.0));
    // Ambience only ducks gently to -14 dB
    assert.ok(ambienceAuto.points.some((p) => p.value === -14.0));
  });

  it("measures EBU R128 loudness metrics and identifies true peak violations", () => {
    const sampleRate = 48000;
    const samples = new Float32Array(sampleRate).fill(0.1); // ~ -20 dBFS

    const measurement = LoudnessEngine.measureLoudness({
      samples,
      sampleRate,
      standard: "WEB_SOCIAL", // Target -16 LUFS
    });

    assert.ok(measurement.integratedLufs !== undefined);
    assert.ok(measurement.truePeakDb !== undefined);
    assert.ok(measurement.truePeakDb <= 0);

    const norm = LoudnessEngine.calculateNormalizationGain({
      currentLufs: -20.0,
      currentTruePeakDb: -4.0,
      standard: "WEB_SOCIAL",
    });

    assert.equal(norm.gainAdjustmentDb, 4.0); // -16 - (-20) = +4 dB
    assert.equal(norm.requiresLimiter, true); // -4 + 4 = 0 > -1.0 dBTP -> requires limiter
  });

  it("generates audio punctuation events from narrative beats (REQ-069)", () => {
    const events = AudioPunctuationEngine.generatePunctuationPlan([
      { id: "b1", type: "HOOK", timestampSeconds: 0.0 },
      { id: "b2", type: "REVELATION", timestampSeconds: 15.0 },
    ]);

    assert.equal(events.length, 2);
    assert.equal(events[0].type, "EMPHASIS");
    assert.equal(events[1].type, "REVELATION");
  });

  it("executes full AudioMixEngine end-to-end on documentary IR", () => {
    const sampleIR = {
      tracks: [
        {
          id: "v1",
          type: "VIDEO_PRIMARY",
          clips: [
            { id: "c1", timelineRange: { startSeconds: 0, durationSeconds: 4.0 } },
            { id: "c2", timelineRange: { startSeconds: 5.0, durationSeconds: 5.0 } },
          ],
        },
      ],
      beats: [{ id: "b1", type: "HOOK", timestampSeconds: 0 }],
      metadata: { sampleRate: 48000 },
    };

    const plan = AudioMixEngine.processAudioMix({ ir: sampleIR });

    assert.equal(plan.buses.length, 9);
    assert.ok(plan.roomToneRegions.length > 0);
    assert.ok(plan.automations["MUSIC"]);
    assert.ok(plan.punctuationEvents.length > 0);
    assert.ok(plan.loudnessAudit);
  });

  it("PBT: J-Cut and L-Cut split offsets are always strictly bounded within [0.0, MAX_SPLIT_SECONDS]", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.0, max: 20.0, noNaN: true }),
        fc.double({ min: 1.0, max: 20.0, noNaN: true }),
        fc.boolean(),
        fc.boolean(),
        (dur1, dur2, isDial1, isDial2) => {
          const cut = JLCutEngine.planSplitCut({
            fromClip: { id: "a", durationSeconds: dur1, isDialogue: isDial1 },
            toClip: { id: "b", durationSeconds: dur2, isDialogue: isDial2 },
            visualCutTimestampSeconds: dur1,
          });

          return (
            cut.audioLeadSeconds >= 0.0 &&
            cut.audioLeadSeconds <= JLCutEngine.MAX_SPLIT_SECONDS &&
            cut.audioTailSeconds >= 0.0 &&
            cut.audioTailSeconds <= JLCutEngine.MAX_SPLIT_SECONDS
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
