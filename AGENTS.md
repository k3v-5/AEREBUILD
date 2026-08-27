# Reglas y Estándares del Proyecto: Motion Graphics Engine & MCP

## 📜 Regla Obligatoria: Documentación por Fase (Aprendida / Permanente)

Para cada una de las **10 Fases del Proyecto**, es **estrictamente obligatorio** mantener documentados dos aspectos fundamentales:

1. **Requerimiento y Especificación Técnica:**
   - Objetivo de la fase y alcance explícito (qué incluye y qué NO incluye).
   - Principios arquitectónicos e invariantes.
   - Definición formal de tipos, interfaces, esquemas y fórmulas matemáticas.
   - Debe residir en la carpeta `spec/` (ej. `spec/phase-X.md`, `spec/core-api.md`, etc.).

2. **Memoria Técnica de lo Realizado (Bitácora de Implementación):**
   - Resumen del código implementado por módulo (`src/`).
   - Mejoras, correcciones de diseño y blindajes aplicados (ej. determinismo, clamping, extensibilidad).
   - Resultados exhaustivos de la suite de pruebas unitarias y de integración (`tests/` o `src/tests/`).
   - Ejemplos de uso verificados y reproducibles.
   - Debe documentarse en el archivo de seguimiento de fases (`docs/phases/phase-X-report.md`) y en los reportes de ejecución (`walkthrough.md`).

---

## 🛡️ Reglas Críticas de Testing e Integridad (Fase 1.5)

1. **Prohibido Modificar Tests para Enmascarar Fallos:**
   - Si el código falla un test, la causa principal casi siempre es una violación a la especificación matemática o de contrato.
   - **Bajo ninguna circunstancia la IA debe relajar, alterar o borrar aserciones de un test para 'hacer que pase'**, salvo que la especificación técnica formal (`/spec`) haya sido modificada explícitamente por el usuario.

2. **Prohibición de Aserciones Débiles / Vagas:**
   - No usar `expect(result).toBeDefined()` o `toBeTruthy()` para dar por buena una evaluación.
   - Todo test debe comprobar **valores numéricos exactos** (con tolerancias explícitas $\epsilon \le 10^{-10}$ para flotantes), estructuras de snapshots completas y estados deterministas.

3. **Verificación de 7 Capas Obligatoria:**
   - La suite debe incluir: Unit Tests, Integration Tests, Serialization Tests, Mathematical Tests, Invariant Tests, Property-Based Tests (generativos con `fast-check`), Golden Tests y Regression Tests.
   - No se transiciona a ninguna fase nueva sin que todas las capas de prueba estén 100% en verde.

---

## 🏗️ Estructura del Repositorio de Documentación

```
/spec
  ├── master-roadmap.md            # Hoja de ruta maestra y especificación de Fases 4C a 9A
  ├── phase-1.md                   # Requerimientos y alcance de Fase 1
  ├── core-api.md                  # Especificación de API del Core
  ├── serialization-schema.md      # Esquema JSON v0.1.0
  └── phase-X.md                   # Requerimientos de fases subsiguientes

/docs
  ├── ROADMAP.md                   # Resumen estratégico global de fases y estado del proyecto
  └── phases/
      ├── phase-1-report.md        # Memoria técnica de lo realizado en Fase 1
      └── phase-X-report.md        # Reportes de las siguientes fases
```
