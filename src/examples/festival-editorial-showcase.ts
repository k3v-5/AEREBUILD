import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";

async function createFestivalEditorialShowcase() {
  console.log("\n========================================================");
  console.log("🔥 GENERANDO ESTILO EDITORIAL POSTER / HIGH-IMPACT");
  console.log("   Texto: 'EL ARTE DE DISFRUTAR LOS FESTIVALES'");
  console.log("========================================================\n");

  const outputDir = path.resolve("./dist/festival_editorial");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoFilePath = "D:/Lap/Camera/20250405_214145.mp4";
  const bouncePunchy = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.04, 7.0, 4.0));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — HIGH-IMPACT EDITORIAL POSTER TYPOGRAPHY
 * Style Reference: Giant Condensed Crimson Display + Minimalist Clock Dial
 * Video Source: "${videoFilePath}"
 * Sequence: "EL ARTE" -> "DE" -> "DISFRUTAR" (Giant Red) -> "LOS" -> "FESTIVALES" (Poster Slam)
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Editorial Poster Festival Production");

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
    var compDuration = footage && footage.duration > 0 ? footage.duration : 8.0;
    var compFps = footage && footage.frameRate > 0 ? footage.frameRate : 60.0;

    var comp = project.items.addComp("EL_ARTE_DE_DISFRUTAR_FESTIVALES", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.03, 0.03, 0.04];
    comp.motionBlur = true; // Activar desenfoque de movimiento nativo

    // Helper para tipografía display condensada ultra-bold
    function createPosterText(comp, name, text, fontSize, color, pos, startTime, outTime, tracking, verticalScale) {
      var layer = comp.layers.addText(text);
      layer.name = name;
      layer.motionBlur = true;
      var textProp = layer.property("Source Text");
      var textDoc = textProp.value;
      textDoc.fontSize = fontSize;
      textDoc.fillColor = color;
      textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
      textDoc.tracking = tracking || -10;

      // Usar fuente condensada display estilo póster (Impact / Arial Black)
      var fonts = ["Impact", "Arial-Black", "Haettenschweiler", "Arial-BoldMT", "TrebuchetMS-Bold"];
      for (var f = 0; f < fonts.length; f++) {
        try {
          textDoc.font = fonts[f];
          break;
        } catch(e) {}
      }

      textProp.setValue(textDoc);
      layer.transform.position.setValue(pos);
      if (verticalScale) {
        layer.transform.scale.setValue([100, verticalScale]);
      }
      if (startTime !== undefined) layer.inPoint = startTime;
      if (outTime !== undefined) layer.outPoint = outTime;
      return layer;
    }

    // =======================================================================
    // 🎥 CAPA 1: VIDEO REAL AUTO-ESCALADO AL LIENZO 9:16
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
    // 🌌 CAPA 2: DEGRADADO OSCURO DE CONTRASTE CINEMÁTICO
    // =======================================================================
    var darkOverlay = comp.layers.addSolid([0.02, 0.02, 0.04], "Contrast_Grade", compWidth, compHeight, 1.0, compDuration);
    darkOverlay.transform.opacity.setValue(45); // Viñeteado suave para resaltar los rojos

    // =======================================================================
    // ⏱️ CAPA 3: ELEMENTO GRÁFICO EDITORIAL (MINIMAL CLOCK / RADAR DIAL)
    // =======================================================================
    var clockDial = comp.layers.addShape();
    clockDial.name = "Editorial_Clock_Dial";
    clockDial.motionBlur = true;
    clockDial.inPoint = 2.0;
    clockDial.outPoint = 8.0;

    var cdGroup = clockDial.property("Contents").addProperty("ADBE Vector Group");
    cdGroup.name = "Dial_Ticks";
    var cdContents = cdGroup.property("Contents");

    // Anillo exterior fino
    var cdCircle = cdContents.addProperty("ADBE Vector Shape - Ellipse");
    cdCircle.property("Size").setValue([920, 920]);
    var cdStroke = cdContents.addProperty("ADBE Vector Graphic - Stroke");
    cdStroke.property("Color").setValue([0.85, 0.85, 0.88]); // Blanco/Gris Editorial
    cdStroke.property("Stroke Width").setValue(2.0);

    // Ticks del reloj (Marcas horarias)
    var tickShape = cdContents.addProperty("ADBE Vector Shape - Rect");
    tickShape.property("Size").setValue([3, 40]);
    tickShape.property("Position").setValue([0, -440]);
    var tickRepeater = cdContents.addProperty("ADBE Vector Filter - Repeater");
    tickRepeater.property("Copies").setValue(24);
    tickRepeater.property("Transform").property("Rotation").setValue(360 / 24);

    clockDial.transform.position.setValue([540, 780]);
    clockDial.transform.rotation.expression = "time * 15"; // Rotación lenta y elegante
    clockDial.transform.opacity.setValueAtTime(2.0, 0);
    clockDial.transform.opacity.setValueAtTime(2.6, 60);

    // =======================================================================
    // 💥 CAPA 4: PALABRAS SECUENCIALES EDITORIALES (TIKTOK PACING)
    // =======================================================================

    var CRIMSON_RED = [1.0, 0.08, 0.14]; // #FF1424 Rojo Póster Impactante
    var PURE_WHITE  = [0.98, 0.98, 0.98];

    // --- PALABRA 1 & 2: "EL ARTE" (0.2s - 1.5s) ---
    var w1 = createPosterText(
      comp,
      "Word_1_EL_ARTE",
      "EL ARTE",
      160,
      PURE_WHITE,
      [540, 780],
      0.2,
      1.5,
      -15,
      120
    );
    w1.transform.scale.setValueAtTime(0.2, [180, 216]);
    w1.transform.scale.setValueAtTime(0.45, [100, 120]);
    w1.transform.scale.expression = ${bouncePunchy};

    // Sub-badge arriba de "EL ARTE"
    var subTag = createPosterText(
      comp,
      "Word_1_Tag",
      "✦ CAPÍTULO 01 ✦",
      32,
      CRIMSON_RED,
      [540, 600],
      0.2,
      1.5,
      30
    );
    subTag.transform.opacity.setValueAtTime(0.2, 0);
    subTag.transform.opacity.setValueAtTime(0.4, 100);

    // --- PALABRA 3: "DE" (1.5s - 2.2s) ---
    var w2 = createPosterText(
      comp,
      "Word_2_DE",
      "DE",
      140,
      PURE_WHITE,
      [540, 780],
      1.5,
      2.2,
      0,
      110
    );
    w2.transform.scale.setValueAtTime(1.5, [70, 77]);
    w2.transform.scale.setValueAtTime(1.75, [100, 110]);
    w2.transform.scale.expression = ${bouncePunchy};

    // --- PALABRA 4: "DISFRUTAR" (2.2s - 4.8s) -> GIGANTE ROJO CONDENSADO ESTILO TIME ---
    var w3 = createPosterText(
      comp,
      "Word_3_DISFRUTAR",
      "DISFRUTAR",
      240, // TEXTO GIGANTE CONDENSADO
      CRIMSON_RED,
      [540, 780],
      2.2,
      4.8,
      -18,
      150 // Estirado verticalmente como en la imagen
    );
    w3.transform.scale.setValueAtTime(2.2, [240, 360]);
    w3.transform.scale.setValueAtTime(2.5, [100, 150]);
    w3.transform.scale.expression = ${bouncePunchy};

    // Texto secundario debajo de DISFRUTAR
    var subDisfrutar = createPosterText(
      comp,
      "Word_3_Sub",
      "EN SU MÁXIMA EXPRESIÓN",
      36,
      PURE_WHITE,
      [540, 1080],
      2.4,
      4.8,
      20
    );
    subDisfrutar.transform.opacity.setValueAtTime(2.4, 0);
    subDisfrutar.transform.opacity.setValueAtTime(2.8, 100);

    // --- PALABRA 5: "LOS" (4.8s - 5.5s) ---
    var w4 = createPosterText(
      comp,
      "Word_4_LOS",
      "LOS",
      150,
      PURE_WHITE,
      [540, 780],
      4.8,
      5.5,
      0,
      115
    );
    w4.transform.scale.setValueAtTime(4.8, [150, 172]);
    w4.transform.scale.setValueAtTime(5.05, [100, 115]);
    w4.transform.scale.expression = ${bouncePunchy};

    // --- PALABRA 6: "FESTIVALES" (5.5s - 8.0s) -> SLAM POSTER FINAL ---
    var w5 = createPosterText(
      comp,
      "Word_5_FESTIVALES",
      "FESTIVALES",
      210, // GIGANTE ROJO
      CRIMSON_RED,
      [540, 760],
      5.5,
      compDuration,
      -15,
      140
    );
    w5.transform.scale.setValueAtTime(5.5, [250, 350]);
    w5.transform.scale.setValueAtTime(5.8, [100, 140]);
    w5.transform.scale.expression = ${bouncePunchy};

    // Badge final inferior
    var finalTag = createPosterText(
      comp,
      "Word_5_Final_Tag",
      "[ VIVE LA EXPERIENCIA // 2026 ]",
      38,
      PURE_WHITE,
      [540, 1140],
      5.7,
      compDuration,
      25
    );
    finalTag.transform.opacity.setValueAtTime(5.7, 0);
    finalTag.transform.opacity.setValueAtTime(6.1, 100);

    // =======================================================================
    // 5. APERTURA AUTOMÁTICA EN VISOR DE AFTER EFFECTS
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de Festival Editorial: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "El_Arte_De_Disfrutar_Festivales.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX Editorial generado con éxito -> ${jsxFilePath}`);
}

createFestivalEditorialShowcase().catch(console.error);
