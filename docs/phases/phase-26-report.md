# Memoria Técnica de Implementación: Fase 26 — Deep After Effects JSX Compiler & Bidirectional Bridge (v2.6.0)

## 0. Resumen Ejecutivo

La **Fase 26 (v2.6.0)** implementa la integración profunda y bidireccional con **Adobe After Effects**, incluyendo un **compilador de expresiones nativas ExtendScript (`AEExpressionBuilder`)**, un **compilador de Shape Layers vectoriales (`AEShapeCompiler`)** con Trim Paths y Repeaters, y un **importador/parser bidireccional de templates JSX (`AETemplateImporter`, `AEJSXParser`)** coordinado a través del `AEBridgeManager`.

---

## 1. Módulos Implementados en `src/exporters/ae/`

### 1.1 Expresiones Nativas de After Effects (`src/exporters/ae/expressions/`)
- **`AEExpressionBuilder.ts`:** Generación de expresiones paramétricas:
  - `wiggle(freq, amp, octaves, ampMult)`
  - `loopOut(type, numKeyframes)` & `loopIn(type, numKeyframes)`
  - `linear(time, inMin, inMax, outMin, outMax)`
  - `ease(time, inMin, inMax, outMin, outMax)`
  - `valueAtTime(layerName, propertyPath, delaySeconds)`
  - `inertiaBounce(amp, freq, decay)`: Rebote elástico físico determinista.
  - `clamp(expr, min, max)`
- **`AEExpressionValidator.ts`:** Validación sintáctica y de balanceo de paréntesis y corchetes.

### 1.2 Compilador de Vector Shape Layers (`src/exporters/ae/shapes/`)
- **`AEShapeCompiler.ts`:** Compilación a ExtendScript JSX de:
  - `ADBE Vector Group`
  - `ADBE Vector Shape - Rect` (con `Roundness` y `Size`)
  - `ADBE Vector Shape - Ellipse`
  - `ADBE Vector Filter - Trim` (`Start`, `End`, `Offset`)
  - `ADBE Vector Filter - Repeater` (`Copies`, `Offset`, `Transform`)
  - `ADBE Vector Graphic - Fill` & `ADBE Vector Graphic - Stroke` (con `Stroke Width`)

### 1.3 Parser e Importador Bidireccional (`src/exporters/ae/importer/`)
- **`AEJSXParser.ts`:** Parser regex determinista de scripts ExtendScript que extrae metadata de composición (`width`, `height`, `fps`, `duration`), capas de texto y capas de sólidos.
- **`AETemplateImporter.ts`:** Reconstructor de instancias canónicas de `Composition` con `TextElement`s y cálculo de hash criptográfico.

### 1.4 Puente Unificado (`src/exporters/ae/AEBridgeManager.ts`)
- Fachada estática que integra exportación, importación, compilación de shapes y generación/validación de expresiones.

---

## 2. Resultados de la Suite de Pruebas de 7 Capas

| Capa de Prueba | Archivo de Test | Casos | Resultado |
|---|---|:---:|:---:|
| **Capa 1: Expresiones & Validador** | `AEExpressionBuilder.test.ts` | 4 | ✅ **PASS** |
| **Capa 2: Vector Shape Layers** | `AEShapeCompiler.test.ts` | 1 | ✅ **PASS** |
| **Capa 3: Template Importer & Parser** | `AETemplateImporter.test.ts` | 2 | ✅ **PASS** |
| **Capa 4: Bridge Integration** | `AEBridgeIntegration.test.ts` | 1 | ✅ **PASS** |
| **Capa 5: Property-Based Testing (fast-check)** | `AEPBT.test.ts` | 1 | ✅ **PASS** |
| **Capa 6: Benchmarks de Rendimiento** | `AEBenchmarks.test.ts` | 1 | ✅ **PASS** |

**Total de Pruebas en la Suite:** **597 tests passing al 100% en verde (0 fallos, 0 saltados)** en 4.91s.
