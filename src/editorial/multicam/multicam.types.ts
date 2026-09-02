import { z } from "zod";
import { ShotClassificationScaleSchema } from "../contracts/knowledge-graph.types.js";

/**
 * REQ-011: Camera role in a multi-camera production.
 */
export const CameraRoleSchema = z.enum([
  "WIDE",
  "SPEAKER_PRIMARY",
  "SPEAKER_SECONDARY",
  "DETAIL",
  "REACTION",
]);

export type CameraRole = z.infer<typeof CameraRoleSchema>;

/**
 * Camera angle configuration.
 */
export const CameraAngleDefinitionSchema = z.object({
  angleId: z.string().min(1),
  name: z.string().min(1),
  role: CameraRoleSchema,
  assignedSpeakerId: z.string().optional(),
  scale: ShotClassificationScaleSchema.default("MEDIUM"),
  cameraAzimuthDeg: z.number().min(0).max(360).optional(),
});

export type CameraAngleDefinition = z.infer<typeof CameraAngleDefinitionSchema>;

/**
 * Single multi-camera switching cut decision.
 */
export const MultiCamSwitchDecisionSchema = z.object({
  id: z.string().min(1),
  timestampSeconds: z.number().min(0),
  activeAngleId: z.string().min(1),
  previousAngleId: z.string().optional(),
  reason: z.string().min(1),
  isEmotionalProtection: z.boolean().default(false),
  confidence: z.number().min(0.0).max(1.0).default(0.95),
});

export type MultiCamSwitchDecision = z.infer<typeof MultiCamSwitchDecisionSchema>;
