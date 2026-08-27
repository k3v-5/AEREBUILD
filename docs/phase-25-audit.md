# Auditoría de Arquitectura e Integración: Fase 25 — Multi-Aspect Ratio Adapter, Platform Audio Compliance & Social Delivery Packaging (v2.5.0)

## 1. Existing Systems & Architecture
- **Composición, Transforms y SafeZones (Fases 1, 2A, 16):** `Composition`, `Matrix2D`, `SafeZoneResolver` con geometrías de safe zones de 9:16 y 16:9.
- **Audio Engine y Dinámica (Fases 5D, 13):** `AudioMixer`, `AudioBuffer`, `AudioMath` y `DynamicRangeAnalyzer`.
- **Perceptual QA y Visual Intelligence (Fase 23):** `CompositionAnalyzer`, `DensityAnalyzer`, `ContrastAnalyzer`.
- **Orquestación Distribuida (Fase 24):** `TaskPlanner`, `DistributedJob`, `ConsolidatedManifest`.
- **Serialización y Hashing Canónico:** `ProjectSerializer` (`canonicalize`, `hashCanonical`).

## 2. Baseline de Pruebas
- **Total:** 577 tests.
- **Estado:** 100% pasando en verde en 6.66s.

## 3. Invariantes de la Fase 25
- **Determinismo Estricto:** La adaptación de aspect ratio a partir de una IR base produce siempre idénticas coordenadas, layers y hashes sin depender de variables aleatorias o del entorno.
- **Preservación de la IR Base:** La adaptación no muta la composición de origen; genera composiciones derivadas inmutables con identidades unívocas.
- **Cumplimiento Estricto de Normativas de Audio:** El normalizador de sonoridad garantiza que el audio adaptado cumpla los estándares exactos de cada plataforma destino (YouTube -14 LUFS, TikTok -16 LUFS, Broadcast -23 LUFS) con True Peak $\le -1.0\text{ dBTP}$.

## 4. Files to Create
- `src/delivery/core/`: `AspectRatio.ts`, `TargetPlatform.ts`, `DeliveryConfig.ts`, `DeliveryPackage.ts`, `DeliveryErrors.ts`.
- `src/delivery/adapter/`: `AspectRatioAdapter.ts`, `LayoutReframer.ts`, `SafeZoneCompliance.ts`, `ReframeStrategy.ts`.
- `src/delivery/audio/`: `LoudnessNormalizer.ts`, `PlatformAudioProfile.ts`, `TruePeakLimiter.ts`.
- `src/delivery/thumbnails/`: `ThumbnailSelector.ts`, `ThumbnailScorer.ts`.
- `src/delivery/packaging/`: `SocialDeliveryPackager.ts`, `PlatformManifest.ts`.
- `src/delivery/index.ts`.
- `spec/phase-25-multi-aspect-delivery.md`.
- Suites de pruebas de 7 capas en `src/tests/delivery/`.

## 5. Files to Modify
- `src/index.ts` (exportar `./delivery/index.js`).
- `docs/ROADMAP.md` (actualizar Fase 25).
