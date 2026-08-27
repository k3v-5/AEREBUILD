# Auditoría de Arquitectura e Integración: Fase 21 — Production Memory, Adaptive Optimization & Deterministic Learning Layer (v2.1.0)

## 1. Existing Systems & Repositories
- **Orquestación (Fase 20):** `ProductionOrchestrator`, `ProductionBrief`, `ProductionPlan`, `ProductionJob`, `ProductionState`.
- **Revisiones & Parches (Fase 18–20):** `RevisionEngine`, `ChangeSet`, `ChangeApplier`, `RevisionHistory`, `RollbackEngine`.
- **QA & Diagnósticos (Fase 20):** `QAEngine`, `QAIssue`, `QAScore`, `QAReport`, `QAThresholds`.
- **Eventos & Artefactos (Fase 20):** `ProductionEvent`, `EventLog`, `ArtifactRegistry`, `ArtifactManifest`.
- **Serialización & Hashing:** `ProjectSerializer` (`canonicalize`, `hashCanonical`).
- **Control MCP:** `McpRegistry`, `McpServer`, herramientas de producción y recursos declarativos.

## 2. Baseline de Pruebas
- **Total:** 557 tests.
- **Estado:** 100% pasando en verde en 6.63s.

## 3. Potential Conflicts & Mitigations
- **Determinismo estricto:** Prohibido el uso de `Math.random()`, `Date.now()`, `crypto.randomUUID()` o dependencias del filesystem en el cálculo de recomendaciones o hashes.
- **La memoria no modifica la IR directamente:** `HistoricalMemory` $\to$ `Recommendation` $\to$ `Planner` $\to$ `ProductionPlan` $\to$ `ChangeSet` $\to$ `RevisionEngine` $\to$ `IR`. Toda recomendación aplicada genera una **nueva revisión trazable**.
- **Aislamiento de proyectos:** Consultas con scopes (`global`, `organization`, `project`, `production`, `revision`) para prevenir fugas de datos entre proyectos.

## 4. Files to Create
- `src/intelligence/memory/`: `ProductionMemory.ts`, `MemoryEntry.ts`, `MemoryStore.ts`, `MemoryQuery.ts`, `MemoryIndex.ts`, `MemorySnapshot.ts`, `MemorySerializer.ts`, `MemoryHasher.ts`.
- `src/intelligence/similarity/`: `ProductionSimilarity.ts`, `SimilarityFeatures.ts`, `SimilarityScorer.ts`, `SimilarityIndex.ts`.
- `src/intelligence/learning/`: `EvidenceModel.ts`, `OutcomeModel.ts`, `PatternDetector.ts`, `StrategyEvaluator.ts`, `RecommendationEngine.ts`, `RecommendationPolicy.ts`, `RecommendationValidator.ts`.
- `src/intelligence/optimization/`: `ProductionMetrics.ts`, `PerformanceProfile.ts`, `QualityMetrics.ts`, `CostMetrics.ts`, `BottleneckDetector.ts`, `RegressionDetector.ts`, `OptimizationReport.ts`.
- `src/intelligence/knowledge/`: `KnowledgeEntry.ts`, `KnowledgeGraph.ts`, `KnowledgeResolver.ts`, `KnowledgeLifecycle.ts`.
- `src/intelligence/analytics/`: `ProductionAnalytics.ts`, `CohortAnalyzer.ts`, `TrendAnalyzer.ts`, `ComparativeAnalyzer.ts`.
- `src/intelligence/errors/`: `IntelligenceErrors.ts`.
- `src/intelligence/index.ts`.
- `src/orchestration/context/HistoricalProductionContext.ts`, `RecommendationContext.ts`.
- Herramientas MCP en `src/mcp/tools/` y recursos en `src/mcp/resources/`.
- Suites de pruebas de 7 capas en `src/tests/intelligence/`.

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
- `src/tests/` de Fases 1 a 20 (preservación estricta de los 557 tests existentes).
