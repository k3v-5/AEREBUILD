# Auditoría de Arquitectura e Integración: Fase 26 — Deep After Effects JSX Compiler & Bidirectional Bridge (v2.6.0)

## 1. Existing Systems & Architecture
- **Compilador JSX Base (Fase 17):** `AfterEffectsJSXCompiler.ts`, `AECapabilityMatrix.ts`, `AETypeMapping.ts`.
- **Árbol de Animación y DSL (Fase 3):** `Property<T>`, `Keyframe`, `EasingName`.
- **Shape Graphics y Paths (Fase 5J, 11):** `ShapeElement`, `VectorPath`, `TrimPathEffect`.
- **MCP Server y Herramientas (Fase 17):** Herramientas MCP para After Effects.

## 2. Baseline de Pruebas
- **Total:** 587 tests.
- **Estado:** 100% pasando en verde en 5.00s.

## 3. Invariantes de la Fase 26
- **Determinismo Estricto en Código JSX Generado:** El código ExtendScript generado para After Effects debe ser 100% determinista, reproducible y libre de efectos colaterales no declarados.
- **Idempotencia en Importación y Exportación Bidireccional:** $\text{Export}(\text{Import}(\text{JSX})) \equiv \text{JSX}_{\text{canónico}}$.
- **Compatibilidad con Versiones AE CS6 a AE 2026:** El código generado debe ejecutarse en el motor de JavaScript clásico de ExtendScript y en el nuevo motor JavaScript de After Effects sin errores de sintaxis.

## 4. Files to Create
- `src/exporters/ae/expressions/AEExpressionBuilder.ts`
- `src/exporters/ae/expressions/AEExpressionValidator.ts`
- `src/exporters/ae/shapes/AEShapeCompiler.ts`
- `src/exporters/ae/importer/AEJSXParser.ts`
- `src/exporters/ae/importer/AETemplateImporter.ts`
- `src/exporters/ae/AEBridgeManager.ts`
- `spec/phase-26-ae-compiler-bridge.md`
- Tests en `src/tests/export/`: `AEExpressionBuilder.test.ts`, `AEShapeCompiler.test.ts`, `AETemplateImporter.test.ts`, `AEBridgeIntegration.test.ts`, `AEPBT.test.ts`, `AEBenchmarks.test.ts`.

## 5. Files to Modify
- `src/exporters/ae/index.ts`
- `docs/ROADMAP.md`
