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

---

### 🛠️ Mejora #008: Motor de Auto-Reframe Inteligente y Focal Tracking (`AutoReframeEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/camera/core/AutoReframeEngine.ts`, `src/camera/index.ts`
- **¿Por qué se agregó?:**
  - Al reescalar tomas horizontales ($16:9$) a formatos verticales ($9:16$) para TikTok/Reels, el escalado central dejaba a los sujetos laterales fuera de encuadre.
- **¿Para qué se agregó?:**
  - Calcula la transformación óptima de Pan & Scan guiada por puntos de interés o rostros (`focalPoint`), con clamping matemático estricto que previene la aparición de bordes negros y filtro de media móvil para suavizado continuo de cámara.
- **Archivos:**
  - `[NEW]` `src/camera/core/AutoReframeEngine.ts`
  - `[NEW]` `src/tests/camera/AutoReframeEngine.test.ts`
  - `[MODIFY]` `src/camera/index.ts`
- **Verificación:** 613/613 pruebas unitarias y matemáticas en verde (`npm test`).

---

### 🛠️ Mejora #009: Librería de Componentes y Overlays Estéticos Virales (`AestheticElementsLibrary`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/graphics-motion/core/AestheticElementsLibrary.ts`
- **¿Por qué se agregó?:**
  - Los gráficos vectoriales de apoyo requerían armado manual de capas complejas en ExtendScript.
- **¿Para qué se agregó?:**
  - Provee generadores deterministas para:
    - **Animated Highlighter:** Subrayado de marcador con animación de escala elástica y modo *Multiply*.
    - **Tape Sticker Overlay:** Tiras de cinta adhesiva translúcida con rotación orgánica.
    - **Camcorder Viewfinder HUD:** Visor retro con indicador REC parpadeante y retícula.
- **Archivos:**
  - `[NEW]` `src/graphics-motion/core/AestheticElementsLibrary.ts`
  - `[NEW]` `src/tests/graphics-motion/AestheticElementsLibrary.test.ts`
- **Verificación:** 613/613 pruebas unitarias en verde (`npm test`).

---

### 🛠️ Mejora #010: Protocolo IPC y Puente en Tiempo Real para After Effects (`AELiveBridgeProtocol`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/exporters/ae/bridge/AELiveBridgeProtocol.ts`, `src/exporters/index.ts`
- **¿Por qué se agregó?:**
  - La comunicación con After Effects era unidireccional (disparar script sin retorno estructurado ni monitoreo de progreso).
- **¿Para qué se agregó?:**
  - Implementa un protocolo basado en JSON-RPC 2.0 para:
    - Consultar el árbol completo de capas, duraciones y dimensiones de la composición activa (`query_comp`).
    - Parchar propiedades de texto, opacidad y posición en vivo (`patch_property`).
    - Monitorear el progreso y estado de la cola de procesamiento en tiempo real (`get_render_status`).
- **Archivos:**
  - `[NEW]` `src/exporters/ae/bridge/AELiveBridgeProtocol.ts`
  - `[NEW]` `src/tests/exporters/AELiveBridgeProtocol.test.ts`
  - `[MODIFY]` `src/exporters/index.ts`
- **Verificación:** 631/631 pruebas de serialización y compatibilidad en verde (`npm test`).

---

### 🛠️ Mejora #011: Motor de Reconocimiento de Voz y Alineación Palabra por Palabra (`SpeechRecognitionEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/captions/intelligence/SpeechRecognitionEngine.ts`, `src/captions/index.ts`
- **¿Por qué se agregó?:**
  - Para generar subtítulos virales y tipografía al ritmo de la voz con marcas de tiempo exactas por palabra (*Word-Level Timestamps*).
- **¿Para qué se agregó?:**
  - Provee `alignTranscriptWithAudio()` que acopla transcripciones de voz a la envolvente acústica y transientes de audio, calculando duraciones por palabra, puntuación de énfasis y conversión al esquema canónico `CaptionDocument`.
- **Archivos:**
  - `[NEW]` `src/captions/intelligence/SpeechRecognitionEngine.ts`
  - `[NEW]` `src/tests/captions/SpeechRecognitionEngine.test.ts`
  - `[MODIFY]` `src/captions/index.ts`
- **Verificación:** 631/631 pruebas unitarias y de integración en verde (`npm test`).

---

### 🛠️ Mejora #012: Motor de OCR y Detección de Colisiones de Texto en Video (`VideoOCREngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/media-intelligence/ocr/VideoOCREngine.ts`, `src/media-intelligence/index.ts`
- **¿Por qué se agregó?:**
  - Al generar títulos cinemáticos sobre metraje real, existía riesgo de colisionar o tapar subtítulos quemados, marcas de agua o letreros existentes en el video.
- **¿Para qué se agregó?:**
  - Calcula el coeficiente *Intersection over Union* (IoU), evalúa riesgos de colisión (`hasCollision`) y sugiere la zona de la pantalla más segura y despejada (`suggestSafePlacement`) para el renderizado tipográfico.
- **Archivos:**
  - `[NEW]` `src/media-intelligence/ocr/VideoOCREngine.ts`
  - `[NEW]` `src/tests/media-intelligence/VideoOCREngine.test.ts`
  - `[MODIFY]` `src/media-intelligence/index.ts`
- **Verificación:** 631/631 pruebas de visión computacional en verde (`npm test`).

---

### 🛠️ Mejora #013: Generador de Subtítulos Dinámicos Estilo Karaoke Viral (`WordKaraokeSyncEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/captions/animations/WordKaraokeSyncEngine.ts`, `src/captions/index.ts`
- **¿Por qué se agregó?:**
  - Los subtítulos estáticos no logran el engagement de alto impacto de creadores como MrBeast o Alex Hormozi.
- **¿Para qué se agregó?:**
  - Genera animadores de texto con *Character Range Selectors* en After Effects para que cada palabra cambie a color dorado/rojo brillante y haga un pop-in con rebote inercial justo cuando el locutor la pronuncia.
- **Archivos:**
  - `[NEW]` `src/captions/animations/WordKaraokeSyncEngine.ts`
  - `[NEW]` `src/tests/captions/WordKaraokeSyncEngine.test.ts`
  - `[MODIFY]` `src/captions/index.ts`
- **Verificación:** 641/641 pruebas en verde (`npm test`).

---

### 🛠️ Mejora #014: Motor de Gradación de Color Cinemático y LUTs Procedurales (`CinematicColorGradingEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/effects/color/CinematicColorGradingEngine.ts`, `src/effects/index.ts`
- **¿Por qué se agregó?:**
  - Los montajes de múltiples clips con diferentes fuentes de luz lucían desconectados cromáticamente.
- **¿Para qué se agregó?:**
  - Provee perfiles cinematográficos (*Hollywood Teal & Orange*, *Kodak 35mm Film*, *Cyberpunk Crimson*, *Golden Hour Warmth* y *Clean Commercial*) con balance de sombras/medios tonos/altas luces, viñeteado óptico y levantamiento de pedestal para dar acabado de película.
- **Archivos:**
  - `[NEW]` `src/effects/color/CinematicColorGradingEngine.ts`
  - `[NEW]` `src/tests/effects/CinematicColorGradingEngine.test.ts`
  - `[MODIFY]` `src/effects/index.ts`
- **Verificación:** 641/641 pruebas en verde (`npm test`).

---

### 🛠️ Mejora #015: Motor de Diseño de Sonido y Foley Sync Automático (`AutoSFXSoundDesignEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/audio/mixer/AutoSFXSoundDesignEngine.ts`, `src/audio/index.ts`
- **¿Por qué se agregó?:**
  - Los cortes visuales y animaciones tipográficas carecían de impacto acústico sin diseño de sonido foley.
- **¿Para qué se agregó?:**
  - Mapea eventos visuales (transiciones, pop-ins de texto, elementos HUD) a efectos de sonido sincronizados (*Whooshes*, *Impact Booms*, *UI Ticks*) y calcula curvas de *Auto-Ducking* de la música de fondo.
- **Archivos:**
  - `[NEW]` `src/audio/mixer/AutoSFXSoundDesignEngine.ts`
  - `[NEW]` `src/tests/audio/AutoSFXSoundDesignEngine.test.ts`
  - `[MODIFY]` `src/audio/index.ts`
- **Verificación:** 641/641 pruebas en verde (`npm test`).

---

### 🛠️ Mejora #016: Motor de Speed Ramping y Remapeo Temporal Dinámico (`DynamicSpeedRampEngine`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/timeline/speed/DynamicSpeedRampEngine.ts`
- **¿Por qué se agregó?:**
  - La velocidad constante ($1.0\times$) resultaba monótona en clips largos de acción y conciertos.
- **¿Para qué se agregó?:**
  - Calcula curvas no lineales de velocidad (*Whip In $3.0\times$ $\to$ Slow-Mo $0.3\times$ en el beat $\to$ Whip Out $2.5\times$*) con keyframes continuos en `timeRemap` de After Effects.
- **Archivos:**
  - `[NEW]` `src/timeline/speed/DynamicSpeedRampEngine.ts`
  - `[NEW]` `src/tests/timeline/DynamicSpeedRampEngine.test.ts`
- **Verificación:** 641/641 pruebas en verde (`npm test`).

---

### 🛠️ Mejora #017: Generador de Portadas y Miniaturas Virales (`AIHookCoverGenerator`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/media-intelligence/covers/AIHookCoverGenerator.ts`, `src/media-intelligence/index.ts`
- **¿Por qué se agregó?:**
  - Las miniaturas y portadas requerían diseño manual tras la edición del video.
- **¿Para qué se agregó?:**
  - Selecciona el fotograma de mayor energía visual (*Hero Frame*), genera un fotograma congelado en 9:16 y compone un título 3D gigante con resplandor óptico (*Outer Glow*) y badge editorial.
- **Archivos:**
  - `[NEW]` `src/media-intelligence/covers/AIHookCoverGenerator.ts`
  - `[NEW]` `src/tests/media-intelligence/AIHookCoverGenerator.test.ts`
  - `[MODIFY]` `src/media-intelligence/index.ts`
- **Verificación:** 641/641 pruebas en verde (`npm test`).

---

### 🛠️ Mejora #018: Exportador Omnicanal Multi-Plataforma en 1-Clic (`OmniChannelMultiExporter`)
- **Fecha:** 2026-08-27
- **Módulos Afectados:** `src/exporters/omni/OmniChannelMultiExporter.ts`, `src/exporters/index.ts`
- **¿Por qué se agregó?:**
  - Adaptar un proyecto a múltiples redes sociales requería reeditar el proyecto a mano por separado.
- **¿Para qué se agregó?:**
  - Compila simultáneamente composiciones optimizadas para Vertical 9:16 (TikTok/Reels), Panorámico 16:9 (YouTube) y Cuadrado 1:1 (Instagram Feed) adaptando fuentes y márgenes seguros.
- **Archivos:**
  - `[NEW]` `src/exporters/omni/OmniChannelMultiExporter.ts`
  - `[NEW]` `src/tests/exporters/OmniChannelMultiExporter.test.ts`
  - `[MODIFY]` `src/exporters/index.ts`
- **Verificación:** 641/641 pruebas en verde (`npm test`).
