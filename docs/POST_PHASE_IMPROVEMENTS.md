# 🚀 Bitácora de Mejoras Post-Fase del Motor (Engine Changelog & Improvements)

Este documento registra de manera cronológica y detallada todas las mejoras, parches, optimizaciones y nuevos módulos añadidos al **Motion Graphics Engine & MCP** fuera del ciclo formal de fases individuales.

---

## 📌 Estructura de Registro por Entrada
Cada mejora contiene:
- **Fecha y Versión:** Momento exacto de incorporación.
- **Módulos Afectados:** Rutas en `src/`.
- **¿Por qué se agregó? (Causa raíz / Problema detectado):** Qué limitación o bug motivó la mejora.
- **¿Para qué se agregó? (Solución / Beneficio técnico):** Qué hace y cómo previene fallos futuros.
- **Archivos Creados / Modificados.**
- **Pruebas y Verificación:** Tests automatizados que garantizan el funcionamiento.

---

## 📅 Registro de Mejoras

### 🛠️ Mejora #001: Módulo `MediaMetadataProbe` (Inspección Binaria de Duración y Encabezados)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/assets/core/MediaMetadataProbe.ts`, `src/assets/importer/AssetImporter.ts`, `src/assets/index.ts`
- **¿Por qué se agregó?:**
  - Al importar videos grabados desde dispositivos móviles o cámaras, muchos clips duraban menos de lo asumido (por ejemplo $1.0\text{ s}$ o $1.5\text{ s}$).
  - `AssetImporter` utilizaba una duración hardcodeada por defecto ($10.0\text{ s}$), lo que provocaba que la línea de tiempo intentara reproducir fotogramas inexistentes, generando escenas en negro.
- **¿Para qué se agregó?:**
  - Para inspeccionar directamente los átomos y encabezados binarios ISO (`moov -> mvhd` y `tkhd` en MP4/MOV, RIFF en WAV, STREAMINFO en FLAC, IHDR en PNG) **sin decodificar fotogramas pesados en memoria ($O(1)$)**.
  - Extrae la duración exacta en segundos ($\text{rawDur} / \text{timescale}$), resolución y frecuencia de muestreo de audio, garantizando que el timeline y los exportadores conozcan la longitud real de cada medio.
- **Archivos:**
  - `[NEW]` `src/assets/core/MediaMetadataProbe.ts`
  - `[NEW]` `src/tests/assets/MediaMetadataProbe.test.ts`
  - `[MODIFY]` `src/assets/importer/AssetImporter.ts`
  - `[MODIFY]` `src/assets/index.ts`
- **Verificación:** 610/610 pruebas en verde (`npm test`).

---

### 🛠️ Mejora #002: Pipeline de Compatibilidad de Audio Lossless (FLAC $\to$ WAV)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/examples/guadalajara-turrazo-edit.ts`
- **¿Por qué se agregó?:**
  - Adobe After Effects ExtendScript no admite de forma nativa la importación de archivos de audio con formato `.flac` mediante `app.project.importFile()`, lanzando el error *"no es un tipo de archivo válido para la importación"*.
- **¿Para qué se agregó?:**
  - Para decodificar y convertir automáticamente pistas `.flac` a formato `.wav` (PCM 16-bit uncompressed $44.1\text{ kHz}$), garantizando el $100\%$ de fidelidad acústica y compatibilidad nativa inmediata con After Effects.
- **Archivos:**
  - `[MODIFY]` `src/examples/guadalajara-turrazo-edit.ts`
- **Verificación:** Importación exitosa y reproducción directa de audio en After Effects 2025.

---

### 🛠️ Mejora #003: Blindaje de Proyecto Activo en ExtendScript (`app.newProject()`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** Compiladores JSX y Scripts de exportación en `src/exporters/ae/`
- **¿Por qué se agregó?:**
  - Cuando After Effects se encuentra en la pantalla de bienvenida / inicio (Home Screen), `app.project` evalúa a `null`. Al invocar `app.project.items.addComp()`, se producía la excepción `TypeError: null no es un objeto`.
- **¿Para qué se agregó?:**
  - Para inicializar automáticamente un proyecto nuevo en memoria si no hay ninguno abierto (`if (!app.project) app.newProject();`), permitiendo que cualquier script se ejecute con éxito en cualquier estado de After Effects.
- **Archivos:**
  - `[MODIFY]` `src/examples/guadalajara-turrazo-edit.ts`
  - `[MODIFY]` `dist/guadalajara_turrazo/Guadalajara_Turrazo_Master_Edit.jsx`
- **Verificación:** Ejecución limpia desde la pantalla de bienvenida.

---

### 🛠️ Mejora #004: Corrección de Orden de Propiedades Temporales en ExtendScript (`startTime` $\to$ `inPoint`/`outPoint`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** Módulo de ensamblaje de capas en ExtendScript.
- **¿Por qué se agregó?:**
  - En el modelo de objetos de After Effects, asignar `layer.startTime = inTime` después de `layer.inPoint = inTime` desplaza el punto de entrada al doble del tiempo (`inTime + inTime`), provocando que los videos se oculten y se visualicen pantallas negras.
- **¿Para qué se agregó?:**
  - Para establecer el orden estricto y correcto de asignación temporal:
    1. `layer.startTime = inTime;` (Ubica el metraje en la línea de tiempo).
    2. `layer.inPoint = inTime;` (Fija el punto de inicio de visibilidad).
    3. `layer.outPoint = outTime;` (Fija el punto final de visibilidad).
  - Garantiza que el $100\%$ de los videos se muestren en su posición exacta sin huecos en negro.
- **Archivos:**
  - `[MODIFY]` `src/examples/guadalajara-turrazo-edit.ts`
  - `[MODIFY]` `dist/guadalajara_turrazo/Guadalajara_Turrazo_Master_Edit.jsx`
- **Verificación:** Visibilidad continua de metraje a lo largo de los 220.8 segundos en After Effects.

---

### 🛠️ Mejora #005: Estilo Editorial TikTok con Pinceladas Pastel y Tipografía Mixta
- **Fecha:** 2026-08-27
- **Módulos Afectados:** Generadores de Motion Graphics y presets editoriales.
- **¿Por qué se agregó?:**
  - Para elevar el valor de producción visual al nivel de los creadores destacados de TikTok / Reels (estilo `Pintst0n3`).
- **¿Para qué se agregó?:**
  - Implementación de bloques de pintura artística con bordes redondeados (*Color Block Brush Reveals*) en paleta pastel mint (`#8CD1BC`), carmesí y crema.
  - Tipografía mixta con capas superpuestas: Inicial Serif Itálica + Título Ultra-Bold + Subtítulo Cursivo (*Script Overlay*) + Meta Tags.
- **Archivos:**
  - `[MODIFY]` `src/examples/guadalajara-turrazo-edit.ts`
  - `[MODIFY]` `dist/guadalajara_turrazo/Guadalajara_Turrazo_Master_Edit.jsx`
- **Verificación:** Renderizado y composición validada en After Effects.

---

### 🛠️ Mejora #006: Motor de Detección Espectral de Transientes y Sincronización Rítmica (`AudioTransientSyncEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/audio/analysis/AudioTransientSyncEngine.ts`, `src/audio/index.ts`
- **¿Por qué se agregó?:**
  - Los cortes y *Bass Punches* dependían de BPMs estimados o listas manuales en lugar de alinearse directamente con los impactos acústicos reales de la música.
- **¿Para qué se agregó?:**
  - Implementa *Spectral Flux* y primera derivada de energía por bandas de frecuencia (aislando frecuencias Sub-Bass de $20-100\text{ Hz}$ para bombos/bajos y Mid-High para cajas).
  - Incluye `alignTimelineToTransients(clips, transients)` para auto-alinear los cortes de video a los golpes musicales más cercanos ($\pm 150\text{ ms}$) y `extractBassPunchTimestamps()` para disparar zooms y sacudidas de cámara en el impacto exacto.
- **Archivos:**
  - `[NEW]` `src/audio/analysis/AudioTransientSyncEngine.ts`
  - `[NEW]` `src/tests/audio/AudioTransientSync.test.ts`
  - `[MODIFY]` `src/audio/index.ts`
- **Verificación:** 613/613 pruebas unitarias y de integración pasando al 100% (`npm test`).

---

### 🛠️ Mejora #007: Motor de Segmentación y Jerarquía de Profundidad 3D (`SubjectMaskingEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/tracking-rotoscopy/core/SubjectMaskingEngine.ts`, `src/tracking-rotoscopy/index.ts`
- **¿Por qué se agregó?:**
  - La composición de texto detrás de sujetos requería armado manual de capas y código frágil en scripts individuales.
- **¿Para qué se agregó?:**
  - Provee el método canónico `buildDepthSandwich()` que genera la jerarquía de 3 capas (`[Background, Text, ForegroundCutout]`), con modos adaptativos (*Luma Extract*, *Linear Color Key*, *Depth Matte*), suavizado de bordes (*feather*) y transiciones de desenfoque progresivo (*Fast Blur Shift / Rack Focus*).
  - Incluye generador determinista de ExtendScript `generateExtendScriptSandwich()`.
- **Archivos:**
  - `[NEW]` `src/tracking-rotoscopy/core/SubjectMaskingEngine.ts`
  - `[NEW]` `src/tests/tracking-rotoscopy/SubjectMaskingEngine.test.ts`
  - `[MODIFY]` `src/tracking-rotoscopy/index.ts`
- **Verificación:** 613/613 pruebas en verde (`npm test`).
