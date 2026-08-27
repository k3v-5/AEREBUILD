# Auditoría de Arquitectura e Integración: Fase 22 — Deterministic Creative Optimization, A/B Variants & Production Intelligence (v2.2.0)

## 1. Existing Systems & Architecture
- **Composición e IR Canónica (Fases 1–16):** `Composition.evaluate(t)` como fuente de verdad inmutable.
- **Grafo de Revisiones y Parches (Fase 18):** `RevisionGraph`, `RevisionDiff`, `RevisionPatch` (con reversibilidad matemática estricta $\text{reversePatch}(\text{applyPatch}(P, \Delta), \Delta) \equiv P$), `RevisionManager`.
- **Orquestación de Producción (Fase 20):** `ProductionOrchestrator`, `ProductionBrief`, `ProductionPlan`, `ChangeSet`, `QAEngine`.
- **Persistencia y Hashes Canónicos:** `ProjectSerializer` (`canonicalize`, `hashCanonical`).
- **Control MCP (Fases 17, 18, 20):** `McpRegistry`, `McpServer`, herramientas y recursos declarativos.

## 2. Baseline de Pruebas
- **Total:** 557 tests.
- **Estado:** 100% pasando en verde en 4.86s.

## 3. Potential Conflicts & Mitigations
- **Determinismo estricto:** Prohibido el uso de `Math.random()`, `Date.now()` o `crypto.randomUUID()` en identidades de experimentos o asignaciones A/B.
  - La asignación A/B usa $\text{SHA256}(\text{subjectId} + \text{experimentId})$.
  - Random Search usa PRNG determinista sembrado con `seed + variantIndex + parameterIndex`.
- **Prioridad de QA sobre CreativeScore:** Una variante con errores bloqueantes de QA (`fatal` o `error`) se marca como `invalid` y jamás puede ser seleccionada como ganadora, sin importar qué tan alto sea su `CreativeScore`.
- **Inmutabilidad del Baseline:** La generación de variantes no muta la IR baseline; cada variante se genera aplicando un `ChangeSet` determinista y produciendo una rama de revisión independiente.

## 4. Files to Create
- `src/optimization/CreativeExperiment.ts`, `ExperimentConfig.ts`, `ExperimentState.ts`, `Variant.ts`, `VariantSet.ts`, `VariantGenerator.ts`, `VariantComparator.ts`, `OptimizationEngine.ts`, `OptimizationResult.ts`.
- `src/optimization/parameters/`: `ParameterDefinition.ts`, `ParameterSpace.ts`, `ParameterValue.ts`, `ParameterResolver.ts`, `ParameterConstraints.ts`.
- `src/optimization/strategies/`: `Strategy.ts`, `GridSearchStrategy.ts`, `PairwiseStrategy.ts`, `RandomSearchStrategy.ts`, `CoordinateDescentStrategy.ts`.
- `src/optimization/metrics/`: `CreativeMetric.ts`, `MetricResult.ts`, `MetricRegistry.ts`, `HookMetric.ts`, `CaptionMetric.ts`, `MotionMetric.ts`, `AudioMetric.ts`, `VisualDensityMetric.ts`, `PacingMetric.ts`, `SafeZoneMetric.ts`, `StructuralMetric.ts`.
- `src/optimization/scoring/`: `CreativeScore.ts`, `ScoreWeights.ts`, `ScoreNormalizer.ts`, `ScoreComparator.ts`.
- `src/optimization/comparison/`: `VariantDiff.ts`, `ChangeImpact.ts`, `RegressionDetector.ts`, `ParetoFrontier.ts`.
- `src/optimization/experiments/`: `ABExperiment.ts`, `ExperimentGroup.ts`, `ExperimentAssignment.ts`, `ExperimentReport.ts`.
- `src/optimization/persistence/`: `ExperimentManifest.ts`, `VariantManifest.ts`, `OptimizationSnapshot.ts`.
- `src/optimization/errors/`: `OptimizationErrors.ts`.
- `src/optimization/index.ts`.
- Herramientas MCP en `src/mcp/tools/` y recursos en `src/mcp/resources/`.
- Suites de pruebas de 7 capas en `src/tests/optimization/`.

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
- `src/tests/` de Fases 1 a 21 (preservación estricta de los 557 tests existentes).
