import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { TextElement } from "../elements/TextElement.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";
import { CLIRunner } from "../cli/CLIRunner.js";

async function runAllToolsMasterProduction() {
  console.log("\n==========================================================================");
  console.log("🚀 EJECUTANDO PRODUCCIÓN MAESTRA COMPLETA (TODAS LAS HERRAMIENTAS DEL MOTOR)");
  console.log("   • Video Real: D:/Lap/Camera/20250405_214145.mp4");
  console.log("   • Estilo: Editorial Poster / TIME Style (USER_DESIGN_PREFERENCES.md)");
  console.log("   • Timing: Entradas y Salidas Temporizadas (Las letras desaparecen)");
  console.log("==========================================================================\n");

  const outputDir = path.resolve("./dist/master_production");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoFilePath = "D:/Lap/Camera/20250405_214145.mp4";

  // ==========================================================================
  // HERRAMIENTA 1: MOTION ENGINE CORE & CANONICAL COMPOSITION
  // ==========================================================================
  console.log("1️⃣ [CORE & SDK] Creando Composición Canónica 9:16...");
  const comp = MotionEngine.createComposition({
    id: "master_production_comp",
    name: "FESTIVAL_EDITORIAL_MASTER",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: 12.0, // Duración base estimada del metraje
  });

  // ==========================================================================
  // HERRAMIENTA 2: EXPRESIONES NATIVAS (AEExpressionBuilder)
  // ==========================================================================
  console.log("2️⃣ [EXPRESSIONS] Construyendo expresiones de inercia y oscilación física...");
  const bouncePunchy = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.04, 7.0, 4.0));
  const wiggleSubtle = JSON.stringify(AEBridgeManager.expressions.wiggle(1.2, 8));

  // ==========================================================================
  // HERRAMIENTA 3: COMPILADOR EXTENDSCRIPT JSX CON TIEMPOS DE SALIDA
  // ==========================================================================
  console.log("3️⃣ [JSX COMPILER & SHAPES] Ensamblando Script con Transiciones de Entrada y Salida...");

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — MASTER ALL-TOOLS PRODUCTION
 * Style: High-Impact Editorial Poster (USER_DESIGN_PREFERENCES.md)
 * Video Source: "${videoFilePath}"
 * Pacing:
 *   [0.2s - 1.3s] "EL ARTE" -> Desaparece suavemente
 *   [1.3s - 1.9s] "DE"      -> Desaparece suavemente
 *   [1.9s - 4.2s] "DISFRUTAR" (Giant Red) + Dial Reloj -> Salida limpia
 *   [4.2s - 4.8s] "LOS"     -> Desaparece suavemente
 *   [4.8s - 6.8s] "FESTIVALES" (Póster Slam) -> Salida limpia
 *   [6.8s -> FIN] El video real continúa limpio sin letras pegadas
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Master All-Tools Festival Production");

  try {
    var project = app.project;

    // 1. IMPORTAR VIDEO REAL DEL USUARIO
    var videoFile = new File("${videoFilePath}");
    var hasVideo = videoFile.exists;
    var footage = null;

    if (hasVideo) {
      var importOptions = new ImportOptions(videoFile);
      footage = project.importFile(importOptions);
    }

    var compWidth = 1080;
    var compHeight = 1920;
    // Adaptar duración exacta al metraje real o 12 segundos por defecto
    var compDuration = (footage && footage.duration > 0) ? footage.duration : 12.0;
    var compFps = (footage && footage.frameRate > 0) ? footage.frameRate : 60.0;

    var comp = project.items.addComp("FESTIVAL_EDITORIAL_MASTER", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.03, 0.03, 0.04];
    comp.motionBlur = true; // Activar desenfoque de movimiento nativo

    // Helper tipográfico profesional con animación de entrada Y salida
    function createTimedPosterText(comp, name, text, fontSize, color, pos, inTime, outTime, tracking, verticalScale, inScale, outScale) {
      var layer = comp.layers.addText(text);
      layer.name = name;
      layer.motionBlur = true;
      layer.inPoint = inTime;
      layer.outPoint = outTime;

      var textProp = layer.property("Source Text");
      var textDoc = textProp.value;
      textDoc.fontSize = fontSize;
      textDoc.fillColor = color;
      textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
      textDoc.tracking = tracking || -10;

      // Fuentes display ultra-bold (Impact / Arial Black / Haettenschweiler)
      var fonts = ["Impact", "Arial-Black", "Haettenschweiler", "Anton", "Arial-BoldMT", "TrebuchetMS-Bold"];
      for (var f = 0; f < fonts.length; f++) {
        try {
          textDoc.font = fonts[f];
          break;
        } catch(e) {}
      }

      textProp.setValue(textDoc);
      layer.transform.position.setValue(pos);

      var vScale = verticalScale || 100;
      var baseScale = [100, vScale];
      var startScale = inScale ? [inScale[0], inScale[1] * (vScale / 100)] : [180, 180 * (vScale / 100)];

      // Animación de Entrada (Scale Zoom + Bounce)
      layer.transform.scale.setValueAtTime(inTime, startScale);
      layer.transform.scale.setValueAtTime(inTime + 0.25, baseScale);
      layer.transform.scale.expression = ${bouncePunchy};

      // Animación de Salida (Fade Out suave en los últimos 0.15s)
      layer.transform.opacity.setValueAtTime(inTime, 100);
      layer.transform.opacity.setValueAtTime(outTime - 0.15, 100);
      layer.transform.opacity.setValueAtTime(outTime, 0);

      return layer;
    }

    // =======================================================================
    // 🎥 CAPA 1: VIDEO REAL (AUTO-FIT COVER Y DURACIÓN COMPLETA)
    // =======================================================================
    if (footage) {
      var videoLayer = comp.layers.add(footage);
      videoLayer.name = "Footage_Background";
      videoLayer.transform.position.setValue([compWidth / 2, compHeight / 2]);
      var scaleX = (compWidth / footage.width) * 100;
      var scaleY = (compHeight / footage.height) * 100;
      var coverScale = Math.max(scaleX, scaleY);
      videoLayer.transform.scale.setValue([coverScale, coverScale]);
    }

    // =======================================================================
    // 🌌 CAPA 2: VIÑETEADO OSCURO DE CONTRASTE CINEMÁTICO
    // =======================================================================
    var darkOverlay = comp.layers.addSolid([0.02, 0.02, 0.04], "Contrast_Grade", compWidth, compHeight, 1.0, compDuration);
    darkOverlay.transform.opacity.setValue(40); // 40% oscurecimiento para legibilidad perfecta

    // =======================================================================
    // ⏱️ CAPA 3: DIAL VECTORIAL DE RELOJ (Aparece en 1.9s y DESAPARECE en 6.8s)
    // =======================================================================
    var clockDial = comp.layers.addShape();
    clockDial.name = "Editorial_Clock_Dial";
    clockDial.motionBlur = true;
    clockDial.inPoint = 1.9;
    clockDial.outPoint = 6.8;

    var cdGroup = clockDial.property("Contents").addProperty("ADBE Vector Group");
    cdGroup.name = "Dial_Ticks";
    var cdContents = cdGroup.property("Contents");

    var cdCircle = cdContents.addProperty("ADBE Vector Shape - Ellipse");
    cdCircle.property("Size").setValue([920, 920]);
    var cdStroke = cdContents.addProperty("ADBE Vector Graphic - Stroke");
    cdStroke.property("Color").setValue([0.88, 0.88, 0.90]);
    cdStroke.property("Stroke Width").setValue(2.0);

    var tickShape = cdContents.addProperty("ADBE Vector Shape - Rect");
    tickShape.property("Size").setValue([3, 38]);
    tickShape.property("Position").setValue([0, -440]);
    var tickRepeater = cdContents.addProperty("ADBE Vector Filter - Repeater");
    tickRepeater.property("Copies").setValue(24);
    tickRepeater.property("Transform").property("Rotation").setValue(360 / 24);

    clockDial.transform.position.setValue([540, 780]);
    clockDial.transform.rotation.expression = "time * 15"; // Rotación continua elegante
    clockDial.transform.opacity.setValueAtTime(1.9, 0);
    clockDial.transform.opacity.setValueAtTime(2.3, 50);
    clockDial.transform.opacity.setValueAtTime(6.5, 50);
    clockDial.transform.opacity.setValueAtTime(6.8, 0); // Desaparece limpiamente

    // =======================================================================
    // 💥 CAPA 4: PALABRAS SECUENCIALES TEMPORIZADAS (ENTRAN Y DESAPARECEN)
    // =======================================================================
    var CRIMSON_RED = [1.0, 0.08, 0.14]; // #FF1424
    var PURE_WHITE  = [0.98, 0.98, 0.98];

    // --- PALABRA 1: "EL ARTE" (0.2s -> 1.3s) ---
    var w1 = createTimedPosterText(
      comp,
      "Word_1_EL_ARTE",
      "EL ARTE",
      160,
      PURE_WHITE,
      [540, 780],
      0.2,
      1.3,
      -15,
      120
    );

    var tag1 = createTimedPosterText(
      comp,
      "Tag_1",
      "✦ CAPÍTULO 01 ✦",
      32,
      CRIMSON_RED,
      [540, 600],
      0.2,
      1.3,
      30,
      100,
      [100, 100]
    );

    // --- PALABRA 2: "DE" (1.3s -> 1.9s) ---
    var w2 = createTimedPosterText(
      comp,
      "Word_2_DE",
      "DE",
      140,
      PURE_WHITE,
      [540, 780],
      1.3,
      1.9,
      0,
      110,
      [70, 77]
    );

    // --- PALABRA 3: "DISFRUTAR" (1.9s -> 4.2s) -> GIGANTE ROJO CONDENSADO ---
    var w3 = createTimedPosterText(
      comp,
      "Word_3_DISFRUTAR",
      "DISFRUTAR",
      240,
      CRIMSON_RED,
      [540, 780],
      1.9,
      4.2,
      -18,
      150, // Estirado verticalmente
      [240, 360]
    );

    var sub3 = createTimedPosterText(
      comp,
      "Sub_3",
      "EN SU MÁXIMA EXPRESIÓN",
      36,
      PURE_WHITE,
      [540, 1080],
      2.1,
      4.2,
      20,
      100,
      [100, 100]
    );

    // --- PALABRA 4: "LOS" (4.2s -> 4.8s) ---
    var w4 = createTimedPosterText(
      comp,
      "Word_4_LOS",
      "LOS",
      150,
      PURE_WHITE,
      [540, 780],
      4.2,
      4.8,
      0,
      115,
      [150, 172]
    );

    // --- PALABRA 5: "FESTIVALES" (4.8s -> 6.8s) -> SLAM FINAL Y DESAPARICIÓN ---
    var w5 = createTimedPosterText(
      comp,
      "Word_5_FESTIVALES",
      "FESTIVALES",
      210,
      CRIMSON_RED,
      [540, 760],
      4.8,
      6.8, // Desaparece en 6.8s para que el video continúe limpio
      -15,
      140,
      [250, 350]
    );

    var finalTag = createTimedPosterText(
      comp,
      "Final_Tag",
      "[ VIVE LA EXPERIENCIA // 2026 ]",
      38,
      PURE_WHITE,
      [540, 1140],
      5.0,
      6.8,
      25,
      100,
      [100, 100]
    );

    // =======================================================================
    // 5. APERTURA AUTOMÁTICA EN VISOR
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de Producción Maestra: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "All_Tools_Master_Showcase.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX de Producción Maestra generado -> ${jsxFilePath}`);

  // ==========================================================================
  // HERRAMIENTA 4: SOCIAL DELIVERY ENGINE (Fase 25 - Multi-Aspecto + LUFS)
  // ==========================================================================
  console.log("4️⃣ [DELIVERY ENGINE] Generando variantes 9:16, 16:9, 1:1 con normalización LUFS...");
  const deliveryResult = MotionEngine.deliverSocialPackage(comp, "proj_festival_master", "rev_gold", {
    targetAspectRatios: ["9:16", "16:9", "1:1", "4:5"],
    thumbnailCount: 3,
  });

  const manifestPath = path.join(outputDir, "PlatformManifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(deliveryResult.manifest, null, 2), "utf-8");
  console.log(`   ✔ Manifiesto Multi-Plataforma guardado -> ${manifestPath}`);
  console.log(`   ✔ Variantes generadas: [${Object.keys(deliveryResult.pkg.variants).join(", ")}]`);
  console.log(`   ✔ Miniaturas automáticas extraídas: ${deliveryResult.pkg.thumbnails.length}`);

  // ==========================================================================
  // HERRAMIENTA 5: CLI VALIDATION & 7-FAMILY QA ENGINE (Fase 20 & 27)
  // ==========================================================================
  console.log("5️⃣ [CLI & QA ENGINE] Ejecutando batería de QA de 7 familias y validación...");
  await CLIRunner.run(["node", "bin", "validate", "festival_master.json"]);
  await CLIRunner.run(["node", "bin", "qa", "festival_master.json", "--threshold", "0.85"]);

  console.log("\n==========================================================================");
  console.log("🎉 ¡PRODUCCIÓN MAESTRA COMPLETADA AL 100% UTILIZANDO TODAS LAS HERRAMIENTAS!");
  console.log("==========================================================================\n");
}

runAllToolsMasterProduction().catch(console.error);
