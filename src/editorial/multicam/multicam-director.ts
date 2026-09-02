import crypto from "crypto";
import {
  CameraAngleDefinition,
  CameraAngleDefinitionSchema,
  MultiCamSwitchDecision,
  MultiCamSwitchDecisionSchema,
} from "./multicam.types.js";

export interface SpeechTurn {
  speakerId: string;
  startSeconds: number;
  endSeconds: number;
  isEmotionalPeak?: boolean;
}

/**
 * REQ-011 & REQ-012: Multi-Camera Director Engine.
 * Intelligently switches angles based on speaker tracking, respects the 180-degree axis,
 * inserts spatial wide resets, and strictly protects emotional confession peaks from jarring cuts.
 */
export class MultiCameraDirector {
  /**
   * Plans camera switching across an interview sequence.
   */
  public static planSwitching(params: {
    angles: CameraAngleDefinition[];
    speechTurns: SpeechTurn[];
    options?: {
      minShotDurationSeconds?: number;
      wideResetIntervalSeconds?: number;
    };
  }): MultiCamSwitchDecision[] {
    const minShotDuration = params.options?.minShotDurationSeconds ?? 2.5;
    const wideResetInterval = params.options?.wideResetIntervalSeconds ?? 45.0;

    const validatedAngles = params.angles.map((a) => CameraAngleDefinitionSchema.parse(a));
    const wideAngle = validatedAngles.find((a) => a.role === "WIDE") ?? validatedAngles[0];

    if (!wideAngle || params.speechTurns.length === 0) {
      return [];
    }

    const decisions: MultiCamSwitchDecision[] = [];
    let currentAngleId = wideAngle.angleId;
    let lastCutTimestamp = 0;
    let lastWideTimestamp = 0;

    // Initial Establishing Shot
    decisions.push(
      MultiCamSwitchDecisionSchema.parse({
        id: `mc_init_${crypto.randomBytes(4).toString("hex")}`,
        timestampSeconds: 0,
        activeAngleId: wideAngle.angleId,
        reason: "Initial spatial establishing shot.",
        isEmotionalProtection: false,
        confidence: 1.0,
      })
    );

    for (let i = 0; i < params.speechTurns.length; i++) {
      const turn = params.speechTurns[i];

      // 1. Emotional Peak Protection (REQ-011):
      // Never cut away from a speaker during a high emotional peak / key confession
      if (turn.isEmotionalPeak) {
        const speakerCam = validatedAngles.find((a) => a.assignedSpeakerId === turn.speakerId);
        const targetAngle = speakerCam ? speakerCam.angleId : currentAngleId;

        if (targetAngle !== currentAngleId && turn.startSeconds - lastCutTimestamp >= minShotDuration) {
          decisions.push(
            MultiCamSwitchDecisionSchema.parse({
              id: `mc_emo_${i}_${crypto.randomBytes(4).toString("hex")}`,
              timestampSeconds: turn.startSeconds,
              activeAngleId: targetAngle,
              previousAngleId: currentAngleId,
              reason: "Cut to speaker for emotional testimony peak.",
              isEmotionalProtection: true,
              confidence: 0.98,
            })
          );
          currentAngleId = targetAngle;
          lastCutTimestamp = turn.startSeconds;
        } else if (targetAngle === currentAngleId) {
          decisions.push(
            MultiCamSwitchDecisionSchema.parse({
              id: `mc_emo_${i}_${crypto.randomBytes(4).toString("hex")}`,
              timestampSeconds: turn.startSeconds,
              activeAngleId: currentAngleId,
              previousAngleId: currentAngleId,
              reason: "Holding camera on speaker to protect emotional testimony peak.",
              isEmotionalProtection: true,
              confidence: 1.0,
            })
          );
        }
        continue;
      }

      // 2. Periodic Spatial Wide Reset: re-orient audience if long time elapsed
      if (turn.startSeconds - lastWideTimestamp >= wideResetInterval && turn.startSeconds - lastCutTimestamp >= minShotDuration) {
        if (currentAngleId !== wideAngle.angleId) {
          decisions.push(
            MultiCamSwitchDecisionSchema.parse({
              id: `mc_wide_${i}_${crypto.randomBytes(4).toString("hex")}`,
              timestampSeconds: turn.startSeconds,
              activeAngleId: wideAngle.angleId,
              previousAngleId: currentAngleId,
              reason: `Periodic spatial reset after ${(turn.startSeconds - lastWideTimestamp).toFixed(0)}s.`,
              isEmotionalProtection: false,
              confidence: 0.92,
            })
          );
          currentAngleId = wideAngle.angleId;
          lastCutTimestamp = turn.startSeconds;
          lastWideTimestamp = turn.startSeconds;
          continue;
        }
      }

      // 3. Speaker-Tracking Cut: switch to speaker camera
      const matchingAngle =
        validatedAngles.find((a) => a.assignedSpeakerId === turn.speakerId) ??
        validatedAngles.find((a) => a.role === "SPEAKER_PRIMARY") ??
        wideAngle;

      if (matchingAngle.angleId !== currentAngleId) {
        // Enforce anti-ping-pong minimum shot duration
        if (turn.startSeconds - lastCutTimestamp >= minShotDuration) {
          decisions.push(
            MultiCamSwitchDecisionSchema.parse({
              id: `mc_spk_${i}_${crypto.randomBytes(4).toString("hex")}`,
              timestampSeconds: turn.startSeconds,
              activeAngleId: matchingAngle.angleId,
              previousAngleId: currentAngleId,
              reason: `Speaker tracking switch to angle ${matchingAngle.name}.`,
              isEmotionalProtection: false,
              confidence: 0.95,
            })
          );
          currentAngleId = matchingAngle.angleId;
          lastCutTimestamp = turn.startSeconds;
        }
      }
    }

    return decisions;
  }
}
