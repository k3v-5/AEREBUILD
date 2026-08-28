import { Composition } from "../core/composition.js";
import { StyleProfileManager, StylePresetId } from "../styles/StyleProfileManager.js";
import { SupportedAspectRatio } from "../exporters/omni/OmniChannelMultiExporter.js";

export interface DeclarativeProductionIntent {
  video: {
    format: SupportedAspectRatio;
    durationSec: number;
    fps?: number;
    projectName?: string;
  };
  style: {
    preset: StylePresetId;
    title: string;
    badgeText?: string;
  };
  editing: {
    pacing: "aggressive" | "balanced" | "cinematic_slow";
    beatSync: boolean;
    speedRamping: boolean;
    depthSandwich: boolean;
  };
  captions?: {
    enabled: boolean;
    text: string;
  };
  soundDesign?: {
    enabled: boolean;
    autoDucking: boolean;
  };
}

export interface CompiledDSLResult {
  composition: Composition;
  appliedProfile: string;
  estimatedRenderDurationSec: number;
  metadata: {
    targetFormat: SupportedAspectRatio;
    totalDuration: number;
    layersCount: number;
  };
}

/**
 * Compilador de Intención Audiovisual Declarativa (Production DSL) (Autonomous MCP v2 / REQ-034).
 * Convierte un bloque compacto de intención de la IA en un proyecto canónico ProjectIR en 1 solo paso.
 */
export class ProductionDSLCompiler {
  /**
   * Compila una intención declarativa en una Composición canónica de producción.
   */
  public static compile(intent: DeclarativeProductionIntent): CompiledDSLResult {
    const profile = StyleProfileManager.getProfile(intent.style.preset);

    const dims =
      intent.video.format === "9:16"
        ? { width: 1080, height: 1920 }
        : intent.video.format === "16:9"
        ? { width: 1920, height: 1080 }
        : { width: 1080, height: 1080 };

    const compName = intent.video.projectName ?? `Comp_${intent.style.preset}_${intent.video.format.replace(":", "x")}`;
    const comp = new Composition({
      name: compName,
      width: dims.width,
      height: dims.height,
      fps: intent.video.fps ?? 60,
      duration: intent.video.durationSec,
    });

    return {
      composition: comp,
      appliedProfile: profile.name,
      estimatedRenderDurationSec: Number((intent.video.durationSec * 0.85).toFixed(1)),
      metadata: {
        targetFormat: intent.video.format,
        totalDuration: intent.video.durationSec,
        layersCount: comp.getLayers().length,
      },
    };
  }
}
