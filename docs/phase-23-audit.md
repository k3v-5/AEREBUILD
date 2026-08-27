# Auditoría de Arquitectura e Integración: Fase 23 — Perceptual QA, Visual Intelligence & Render Validation (v2.3.0)

## 1. Existing Systems & Modules (Fases 1–22)
- **Evaluación y Snapshots (Fase 1–16):** `Composition.evaluate(t)` produce `CompositionSnapshot` con capas, elementos y transforms resueltos.
- **Compositor y Mezcla (Fase 9, 19):** `Compositor`, `BlendMath` y `FrameBuffer`.
- **Subtítulos y Geometría de Zonas Seguras (Fase 16):** `SafeZoneResolver`, `CaptionWord`, `CaptionLayout`.
- **Presupuesto Cinético y Dinámica (Fase 11):** `MotionBudgetManager`, `CameraDynamicsEngine`.
- **Motor de Audio y Análisis Acústico (Fase 5D, 13):** `AudioMixer`, `AudioBuffer`, `AudioAnalyzer`, `AudioMath`.
- **Orquestador, QA y Revisiones (Fase 18–20):** `QAEngine`, `QAIssue`, `RepairEngine`, `ChangeSet`, `RevisionManager`.
- **Serialización y Hashing Canónico:** `ProjectSerializer` (`canonicalize`, `hashCanonical`).
- **Control MCP:** `McpRegistry`, `McpServer`, herramientas y recursos declarativos.

## 2. Baseline de Pruebas
- **Total:** 557 tests.
- **Estado:** 100% pasando en verde en 7.14s.

## 3. Potential Conflicts & Mitigations
- **El análisis perceptual NUNCA muta la IR:** Nivel 1 (Declarativo: IR) $\to$ Nivel 2 (Evaluación: `Evaluate(t)`) $\to$ Nivel 3 (Percepción: `PerceptualObservation`). La percepción emite diagnósticos, evidencia y ChangeSets para `RevisionEngine`.
- **Determinismo estricto:** Prohibido el uso de `Math.random()`, `Date.now()`, `crypto.randomUUID()` o dependencias del hardware. Hashes SHA-256 canónicos para observaciones y manifiestos de evidencia (`ObservationManifest`).
- **Prioridad de QA sobre Scores:** Un `score` alto no enmascara fallos bloqueantes (`fatal` o `error`); si hay un issue fatal, el resultado es `FAIL` / `BLOCKED`.

## 4. Files to Create
- `src/perceptual/models/`: `PerceptualObservation.ts`, `PerceptualIssue.ts`, `VisualRegion.ts`, `TemporalObservation.ts`, `AudioObservation.ts`, `TextObservation.ts`, `Evidence.ts`.
- `src/perceptual/visual/`: `FrameAnalyzer.ts`, `ContrastAnalyzer.ts`, `CollisionAnalyzer.ts`, `CompositionAnalyzer.ts`, `DensityAnalyzer.ts`, `EdgeAnalyzer.ts`, `ColorAnalyzer.ts`.
- `src/perceptual/typography/`: `TextLegibilityAnalyzer.ts`, `CaptionVisibilityAnalyzer.ts`, `TextCollisionAnalyzer.ts`, `FontSizeAnalyzer.ts`, `ContrastTextAnalyzer.ts`.
- `src/perceptual/motion/`: `MotionAnalyzer.ts`, `MotionMagnitudeAnalyzer.ts`, `FlashDetector.ts`, `TemporalContinuityAnalyzer.ts`, `CameraMotionAnalyzer.ts`.
- `src/perceptual/audio/`: `AudioPeakAnalyzer.ts`, `LoudnessAnalyzer.ts`, `SilenceAnalyzer.ts`, `ClippingAnalyzer.ts`, `DynamicRangeAnalyzer.ts`.
- `src/perceptual/temporal/`: `FrameSampler.ts`, `SceneChangeAnalyzer.ts`, `CutContinuityAnalyzer.ts`, `TransitionAnalyzer.ts`.
- `src/perceptual/comparison/`: `RenderComparator.ts`, `FrameDiff.ts`, `StructuralDiff.ts`, `PerceptualDiff.ts`.
- `src/perceptual/qa/`: `PerceptualQACheck.ts`, `PerceptualQAEngine.ts`, `PerceptualQAScore.ts`, `PerceptualQAReport.ts`, `PerceptualThresholds.ts`.
- `src/perceptual/evidence/`: `EvidenceGenerator.ts`, `EvidenceHasher.ts`, `ObservationManifest.ts`.
- `src/perceptual/repair/`: `PerceptualRepairStrategy.ts`, `PerceptualRepairMapper.ts`.
- `src/perceptual/cache/`: `PerceptualAnalysisCache.ts`.
- `src/perceptual/errors/`: `PerceptualErrors.ts`.
- `src/perceptual/index.ts`.
- Herramientas MCP en `src/mcp/tools/` y recursos en `src/mcp/resources/`.
- Suites de pruebas de 7 capas en `src/tests/perceptual/`.

## 5. Files to Modify
- `src/mcp/registry.ts` (registro de nuevas tools y resources).
- `src/mcp/index.ts`.

## 6. Files Explicitly NOT to Modify
- `src/core/*`
- `src/elements/*`
- `src/transform/*`
- `src/audio/*`
- `src/captions/*`
- `src/motion-graphics/*`
- `src/exporters/*`
- `src/tests/` de Fases 1 a 22 (preservación estricta de los 557 tests existentes).
