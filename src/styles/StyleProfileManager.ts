import { ColorGradePresetName } from "../effects/color/CinematicColorGradingEngine.js";

export type StylePresetId =
  | "time_editorial_impact"
  | "tiktok_retention_master"
  | "cinematic_luxury"
  | "cyberpunk_stage"
  | "johnny_harris_investigative"
  | "magnates_business_noir"
  | "veritasium_scientific_blueprint"
  | "lemmino_minimalist_cipher"
  | "ali_abdaal_productivity";

export interface StyleProfile {
  id: StylePresetId;
  name: string;
  description: string;
  typography: {
    fontFamily: string;
    fontWeight: number;
    primaryColor: [number, number, number];
    accentColor: [number, number, number];
    tracking: number;
    verticalStretchPct: number;
    allCaps: boolean;
  };
  colorGrading: {
    preset: ColorGradePresetName;
    vignetteIntensity: number;
    filmGrainEnabled: boolean;
  };
  motion: {
    motionBlur: boolean;
    inertiaBounce: boolean;
    transitionType: "whip" | "zoom" | "cut" | "flash";
    defaultDurationSec: number;
  };
  captions: {
    mode: "karaoke" | "pop_word" | "static";
    activeWordColor: [number, number, number];
    inactiveWordColor: [number, number, number];
    backgroundPill: boolean;
  };
  soundDesign: {
    autoDuckingDb: number;
    whooshEnabled: boolean;
    impactBoomEnabled: boolean;
    uiTicksEnabled: boolean;
  };
}

/**
 * Gestor de Perfiles de Estilo Profesionales (Autonomous MCP v2 / REQ-033).
 * Provee plantillas visuales, tipográficas y sonoras coherentes para aplicar en 1 solo paso.
 */
export class StyleProfileManager {
  private static readonly PROFILES: Record<StylePresetId, StyleProfile> = {
    time_editorial_impact: {
      id: "time_editorial_impact",
      name: "TIME Magazine Editorial Impact",
      description: "Estilo maestro de poster: Tipografía Impact estirada 130%, rojo carmesí #FF1424, blanco puro, ticks vectoriales y motion blur.",
      typography: {
        fontFamily: "Impact",
        fontWeight: 900,
        primaryColor: [1.0, 0.08, 0.14], // Crimson Red
        accentColor: [1.0, 0.78, 0.10], // Gold
        tracking: -15,
        verticalStretchPct: 130,
        allCaps: true,
      },
      colorGrading: {
        preset: "clean_commercial",
        vignetteIntensity: 25,
        filmGrainEnabled: false,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: true,
        transitionType: "whip",
        defaultDurationSec: 0.35,
      },
      captions: {
        mode: "karaoke",
        activeWordColor: [1.0, 0.78, 0.10],
        inactiveWordColor: [0.98, 0.98, 0.98],
        backgroundPill: true,
      },
      soundDesign: {
        autoDuckingDb: -3.5,
        whooshEnabled: true,
        impactBoomEnabled: true,
        uiTicksEnabled: true,
      },
    },

    tiktok_retention_master: {
      id: "tiktok_retention_master",
      name: "TikTok & Reels Retention Master",
      description: "Estilo viral de alta energía con pop-ins elásticos, colores fluorescentes y SFX en cada corte.",
      typography: {
        fontFamily: "Arial Black",
        fontWeight: 900,
        primaryColor: [1.0, 1.0, 0.0], // Neon Yellow
        accentColor: [0.0, 1.0, 0.8], // Cyan
        tracking: -10,
        verticalStretchPct: 110,
        allCaps: true,
      },
      colorGrading: {
        preset: "teal_orange",
        vignetteIntensity: 15,
        filmGrainEnabled: false,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: true,
        transitionType: "zoom",
        defaultDurationSec: 0.25,
      },
      captions: {
        mode: "karaoke",
        activeWordColor: [1.0, 1.0, 0.0],
        inactiveWordColor: [1.0, 1.0, 1.0],
        backgroundPill: true,
      },
      soundDesign: {
        autoDuckingDb: -4.0,
        whooshEnabled: true,
        impactBoomEnabled: true,
        uiTicksEnabled: true,
      },
    },

    cinematic_luxury: {
      id: "cinematic_luxury",
      name: "Cinematic Luxury Commercial",
      description: "Look de película 35mm con negros levantados, cortes elegantes y tipografía minimalista.",
      typography: {
        fontFamily: "Helvetica Neue",
        fontWeight: 700,
        primaryColor: [0.95, 0.95, 0.95],
        accentColor: [0.85, 0.75, 0.55], // Muted Gold
        tracking: 25,
        verticalStretchPct: 100,
        allCaps: false,
      },
      colorGrading: {
        preset: "kodak_35mm",
        vignetteIntensity: 30,
        filmGrainEnabled: true,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: false,
        transitionType: "cut",
        defaultDurationSec: 0.5,
      },
      captions: {
        mode: "pop_word",
        activeWordColor: [1.0, 1.0, 1.0],
        inactiveWordColor: [0.7, 0.7, 0.7],
        backgroundPill: false,
      },
      soundDesign: {
        autoDuckingDb: -2.5,
        whooshEnabled: false,
        impactBoomEnabled: true,
        uiTicksEnabled: false,
      },
    },

    cyberpunk_stage: {
      id: "cyberpunk_stage",
      name: "Cyberpunk Stage & Concert",
      description: "Estética de concierto nocturno con luces rojas/moradas, speed ramping agresivo y resplandor óptico.",
      typography: {
        fontFamily: "Impact",
        fontWeight: 900,
        primaryColor: [1.0, 0.08, 0.14],
        accentColor: [0.8, 0.1, 0.9], // Magenta
        tracking: -5,
        verticalStretchPct: 125,
        allCaps: true,
      },
      colorGrading: {
        preset: "cyberpunk_crimson",
        vignetteIntensity: 45,
        filmGrainEnabled: true,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: true,
        transitionType: "whip",
        defaultDurationSec: 0.3,
      },
      captions: {
        mode: "karaoke",
        activeWordColor: [1.0, 0.08, 0.14],
        inactiveWordColor: [0.9, 0.9, 0.9],
        backgroundPill: true,
      },
      soundDesign: {
        autoDuckingDb: -4.5,
        whooshEnabled: true,
        impactBoomEnabled: true,
        uiTicksEnabled: true,
      },
    },

    johnny_harris_investigative: {
      id: "johnny_harris_investigative",
      name: "The Investigative Cartographer (Johnny Harris / Vox)",
      description: "Mapas 3D topográficos, recortes de documentos históricos con chinchetas, resaltadores analógicos y trazado de rutas vectoriales.",
      typography: {
        fontFamily: "Playfair Display",
        fontWeight: 900,
        primaryColor: [0.102, 0.102, 0.102], // Ink Black
        accentColor: [1.0, 0.898, 0.0], // Highlighter Yellow
        tracking: -5,
        verticalStretchPct: 100,
        allCaps: false,
      },
      colorGrading: {
        preset: "clean_commercial",
        vignetteIntensity: 20,
        filmGrainEnabled: true,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: true,
        transitionType: "whip",
        defaultDurationSec: 0.4,
      },
      captions: {
        mode: "pop_word",
        activeWordColor: [1.0, 0.898, 0.0],
        inactiveWordColor: [0.102, 0.102, 0.102],
        backgroundPill: true,
      },
      soundDesign: {
        autoDuckingDb: -3.5,
        whooshEnabled: true,
        impactBoomEnabled: true,
        uiTicksEnabled: true,
      },
    },

    magnates_business_noir: {
      id: "magnates_business_noir",
      name: "Dark Noir Business Empire (MagnatesMedia / Neo)",
      description: "Documental dramático de negocios, efecto 3D Parallax en fotos, destello anamórfico sobre títulos dorados y viñeta oscura.",
      typography: {
        fontFamily: "Cinzel",
        fontWeight: 900,
        primaryColor: [0.831, 0.686, 0.216], // Metallic Gold
        accentColor: [0.62, 0.106, 0.106], // Crimson Blood
        tracking: 15,
        verticalStretchPct: 105,
        allCaps: true,
      },
      colorGrading: {
        preset: "kodak_35mm",
        vignetteIntensity: 45,
        filmGrainEnabled: true,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: false,
        transitionType: "cut",
        defaultDurationSec: 0.5,
      },
      captions: {
        mode: "pop_word",
        activeWordColor: [0.831, 0.686, 0.216],
        inactiveWordColor: [0.98, 0.98, 0.98],
        backgroundPill: false,
      },
      soundDesign: {
        autoDuckingDb: -4.0,
        whooshEnabled: false,
        impactBoomEnabled: true,
        uiTicksEnabled: true,
      },
    },

    veritasium_scientific_blueprint: {
      id: "veritasium_scientific_blueprint",
      name: "Scientific Blueprint & 3D Isometric (Veritasium / Kurzgesagt)",
      description: "Cuadrículas isométricas, cotas de medición vectorial, resplandor cian y fórmulas matemáticas animadas.",
      typography: {
        fontFamily: "Inter",
        fontWeight: 700,
        primaryColor: [0.024, 0.714, 0.831], // Cyan Neon
        accentColor: [0.976, 0.451, 0.086], // Laser Orange
        tracking: 5,
        verticalStretchPct: 100,
        allCaps: false,
      },
      colorGrading: {
        preset: "clean_commercial",
        vignetteIntensity: 15,
        filmGrainEnabled: false,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: false,
        transitionType: "zoom",
        defaultDurationSec: 0.35,
      },
      captions: {
        mode: "pop_word",
        activeWordColor: [0.024, 0.714, 0.831],
        inactiveWordColor: [1.0, 1.0, 1.0],
        backgroundPill: true,
      },
      soundDesign: {
        autoDuckingDb: -3.0,
        whooshEnabled: true,
        impactBoomEnabled: false,
        uiTicksEnabled: true,
      },
    },

    lemmino_minimalist_cipher: {
      id: "lemmino_minimalist_cipher",
      name: "The Minimalist Cipher (Lemmino / ColdFusion)",
      description: "Overlays de coordenadas GPS, líneas láser de escaneo vertical y tipografía delgada espacial.",
      typography: {
        fontFamily: "DIN",
        fontWeight: 300,
        primaryColor: [0.22, 0.741, 0.973], // Ice Blue
        accentColor: [0.133, 0.773, 0.369], // Radar Green
        tracking: 35,
        verticalStretchPct: 100,
        allCaps: true,
      },
      colorGrading: {
        preset: "kodak_35mm",
        vignetteIntensity: 50,
        filmGrainEnabled: true,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: false,
        transitionType: "cut",
        defaultDurationSec: 0.6,
      },
      captions: {
        mode: "static",
        activeWordColor: [0.22, 0.741, 0.973],
        inactiveWordColor: [0.941, 0.941, 0.941],
        backgroundPill: false,
      },
      soundDesign: {
        autoDuckingDb: -4.0,
        whooshEnabled: false,
        impactBoomEnabled: true,
        uiTicksEnabled: true,
      },
    },

    ali_abdaal_productivity: {
      id: "ali_abdaal_productivity",
      name: "Productivity Papercraft (Ali Abdaal / Thomas Frank)",
      description: "Tarjetas flotantes estilo Notion, texturas de papel, animación con resorte elástico y resaltadores pastel.",
      typography: {
        fontFamily: "Plus Jakarta Sans",
        fontWeight: 600,
        primaryColor: [0.15, 0.15, 0.15], // Pencil Graphite
        accentColor: [0.996, 0.902, 0.541], // Notion Yellow
        tracking: -5,
        verticalStretchPct: 100,
        allCaps: false,
      },
      colorGrading: {
        preset: "clean_commercial",
        vignetteIntensity: 10,
        filmGrainEnabled: false,
      },
      motion: {
        motionBlur: true,
        inertiaBounce: true,
        transitionType: "zoom",
        defaultDurationSec: 0.25,
      },
      captions: {
        mode: "pop_word",
        activeWordColor: [0.996, 0.902, 0.541],
        inactiveWordColor: [0.15, 0.15, 0.15],
        backgroundPill: true,
      },
      soundDesign: {
        autoDuckingDb: -3.0,
        whooshEnabled: true,
        impactBoomEnabled: false,
        uiTicksEnabled: true,
      },
    },
  };

  public static getProfile(id: StylePresetId): StyleProfile {
    return this.PROFILES[id] ?? this.PROFILES.time_editorial_impact;
  }

  public static getAllProfiles(): StyleProfile[] {
    return Object.values(this.PROFILES);
  }
}
