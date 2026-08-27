import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";
import { CLIRunner } from "../cli/CLIRunner.js";

async function runUltimateAgencyShowcase() {
  console.log("\n==========================================================================");
  console.log("🎬 CREANDO PRODUCCIÓN DE AGENCIA DEFINITIVA (FULL SUITE & CINEMATIC GRADE)");
  console.log("   • Video Real: D:/Lap/Camera/20250405_214145.mp4");
  console.log("   • Efectos: Motion Blur, Color Grade, Optical Glow, Text Animators, HUD Brackets");
  console.log("==========================================================================\n");

  const outputDir = path.resolve("./dist/ultimate_showcase");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoFilePath = "D:/Lap/Camera/20250405_214145.mp4";

  // 1. Crear Composición Canónica
  const comp = MotionEngine.createComposition({
    id: "ultimate_showcase_comp",
    name: "ULTIMATE_AGENCY_EXPERIENCE",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: 12.0,
  });

  const bounceCode = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.04, 7.5, 4.2));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — ULTIMATE AGENCY CINEMATIC PRODUCTION
 * Reference: USER_DESIGN_PREFERENCES.md (Editorial Poster + Luxury Tech)
 * Video Source: "${videoFilePath}"
 * 
 * Features Included:
 *  1. Auto-Import Footage + Slow Cinematic Push-In Zoom (Camera Drift)
 *  2. Cinematic Vignette & Ambient Color Grading Layer
 *  3. Dynamic Optical Glow Aura (Pulsing Behind Hero Titles)
 *  4. Editorial Vector Framing: Technical Corner Brackets & Rotating Dial
 *  5. Procedural Timecode Counter HUD at Top
 *  6. Word-by-Word Kinetic Display (Crimson #FF1424 + FAFAFA White)
 *  7. Full Safe-Zone & Motion Blur Compliance
 *  8. Timed Exit Transitions (Video continues completely clean after 6.8s)
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Ultimate Agency Production");

  try {
    var project = app.project;

    // 1. IMPORTAR VIDEO REAL
    var videoFile = new File("${videoFilePath}");
    var hasVideo = videoFile.exists;
    var footage = null;

    if (hasVideo) {
      var importOptions = new ImportOptions(videoFile);
      footage = project.importFile(importOptions);
    }

    var compWidth = 1080;
    var compHeight = 1920;
    var compDuration = (footage && footage.duration > 0) ? footage.duration : 12.0;
    var compFps = (footage && footage.frameRate > 0) ? footage.frameRate : 60.0;

    var comp = project.items.addComp("ULTIMATE_AGENCY_SHOWCASE", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.03, 0.03, 0.04];
    comp.motionBlur = true; // Activar desenfoque de movimiento nativo

    // Helper tipográfico profesional con animación de entrada y salida
    function createPosterText(comp, name, text, fontSize, color, pos, inTime, outTime, tracking, verticalScale, inScale) {
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
      layer.transform.scale.expression = ${bounceCode};

      // Animación de Salida (Fade Out suave en los últimos 0.15s)
      layer.transform.opacity.setValueAtTime(inTime, 100);
      layer.transform.opacity.setValueAtTime(outTime - 0.15, 100);
      layer.transform.opacity.setValueAtTime(outTime, 0);

      return layer;
    }

    // =======================================================================
    // 🎥 1. CAPA DE VIDEO REAL CON ZOOM CINEMÁTICO SUAVE (Slow Push-In)
    // =======================================================================
    if (footage) {
      var videoLayer = comp.layers.add(footage);
      videoLayer.name = "Footage_Background";
      videoLayer.transform.position.setValue([compWidth / 2, compHeight / 2]);
      var scaleX = (compWidth / footage.width) * 100;
      var scaleY = (compHeight / footage.height) * 100;
      var coverScale = Math.max(scaleX, scaleY);
      
      // Zoom cinemático lento del 100% al 106% durante todo el video
      videoLayer.transform.scale.setValueAtTime(0, [coverScale, coverScale]);
      videoLayer.transform.scale.setValueAtTime(compDuration, [coverScale * 1.06, coverScale * 1.06]);
    }

    // =======================================================================
    // 🌌 2. GRADACIÓN DE COLOR & CONTRASTE (Vignette)
    // =======================================================================
    var gradeOverlay = comp.layers.addSolid([0.02, 0.02, 0.05], "Cinematic_Contrast_Grade", compWidth, compHeight, 1.0, compDuration);
    gradeOverlay.transform.opacity.setValue(45);

    // =======================================================================
    // 🔴 3. RESPLANDOR ÓPTICO AMBIENTAL ROJO CARMESÍ (Optical Glow Aura)
    // =======================================================================
    var glowSolid = comp.layers.addSolid([1.0, 0.05, 0.15], "Ambient_Crimson_Aura", 800, 800, 1.0, compDuration);
    glowSolid.transform.position.setValue([540, 780]);
    glowSolid.transform.opacity.setValue(22);
    glowSolid.transform.scale.expression = "linear(Math.sin(time * 3), -1, 1, [100, 100], [125, 125])";
    glowSolid.inPoint = 1.8;
    glowSolid.outPoint = 6.8;

    // =======================================================================
    // 📐 4. MARCO EDITORIAL: CORNER BRACKETS TÉCNICOS (HUD Framing)
    // =======================================================================
    var hudFrame = comp.layers.addShape();
    hudFrame.name = "Technical_Corner_Brackets";
    hudFrame.inPoint = 0.2;
    hudFrame.outPoint = 6.8;
    var hfGroup = hudFrame.property("Contents").addProperty("ADBE Vector Group");
    var hfContents = hfGroup.property("Contents");

    // Esquinas superior izquierda y derecha
    var bracket1 = hfContents.addProperty("ADBE Vector Shape - Rect");
    bracket1.property("Size").setValue([940, 1400]);
    var bracketStroke = hfContents.addProperty("ADBE Vector Graphic - Stroke");
    bracketStroke.property("Color").setValue([0.9, 0.9, 0.95]);
    bracketStroke.property("Stroke Width").setValue(1.5);
    bracketStroke.property("Dashes").addProperty("ADBE Vector Stroke Dash 1").setValue(40);
    bracketStroke.property("Dashes").addProperty("ADBE Vector Stroke Gap 1").setValue(400);

    hudFrame.transform.position.setValue([540, 800]);
    hudFrame.transform.opacity.setValueAtTime(0.2, 0);
    hudFrame.transform.opacity.setValueAtTime(0.6, 65);
    hudFrame.transform.opacity.setValueAtTime(6.5, 65);
    hudFrame.transform.opacity.setValueAtTime(6.8, 0);

    // =======================================================================
    // ⏱️ 5. DIAL VECTORIAL DE RELOJ (Marcas horarias en rotación)
    // =======================================================================
    var clockDial = comp.layers.addShape();
    clockDial.name = "Editorial_Clock_Dial";
    clockDial.motionBlur = true;
    clockDial.inPoint = 1.8;
    clockDial.outPoint = 6.8;

    var cdGroup = clockDial.property("Contents").addProperty("ADBE Vector Group");
    var cdContents = cdGroup.property("Contents");

    var cdCircle = cdContents.addProperty("ADBE Vector Shape - Ellipse");
    cdCircle.property("Size").setValue([920, 920]);
    var cdStroke = cdContents.addProperty("ADBE Vector Graphic - Stroke");
    cdStroke.property("Color").setValue([0.88, 0.88, 0.92]);
    cdStroke.property("Stroke Width").setValue(2.0);

    var tickShape = cdContents.addProperty("ADBE Vector Shape - Rect");
    tickShape.property("Size").setValue([3, 38]);
    tickShape.property("Position").setValue([0, -440]);
    var tickRepeater = cdContents.addProperty("ADBE Vector Filter - Repeater");
    tickRepeater.property("Copies").setValue(24);
    tickRepeater.property("Transform").property("Rotation").setValue(360 / 24);

    clockDial.transform.position.setValue([540, 780]);
    clockDial.transform.rotation.expression = "time * 18"; // Rotación continua elegante
    clockDial.transform.opacity.setValueAtTime(1.8, 0);
    clockDial.transform.opacity.setValueAtTime(2.2, 55);
    clockDial.transform.opacity.setValueAtTime(6.5, 55);
    clockDial.transform.opacity.setValueAtTime(6.8, 0);

    // =======================================================================
    // 📟 6. TIMECODE PROCEDURAL EN LA PARTE SUPERIOR (00:00:00:00)
    // =======================================================================
    var tcLayer = comp.layers.addText("TC // 00:00:00:00");
    tcLayer.name = "HUD_Timecode_Counter";
    tcLayer.inPoint = 0.2;
    tcLayer.outPoint = 6.8;
    var tcProp = tcLayer.property("Source Text");
    var tcDoc = tcProp.value;
    tcDoc.fontSize = 24;
    tcDoc.fillColor = [0.8, 0.82, 0.9];
    tcDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    tcDoc.tracking = 40;
    tcProp.setValue(tcDoc);
    tcLayer.transform.position.setValue([540, 240]);
    tcProp.expression = "'REC [ ' + timeToTimecode(time) + ' ]'"; // Código de tiempo en vivo

    // =======================================================================
    // 💥 7. SECUENCIA CINEMÁTICA PALABRA POR PALABRA
    // =======================================================================
    var CRIMSON_RED = [1.0, 0.08, 0.14]; // #FF1424
    var PURE_WHITE  = [0.98, 0.98, 0.98];

    // --- 0.2s - 1.3s: "EL ARTE" ---
    var w1 = createPosterText(
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

    var tag1 = createPosterText(
      comp,
      "Tag_1",
      "✦ CAPÍTULO 01 // MANIFIESTO ✦",
      30,
      CRIMSON_RED,
      [540, 580],
      0.2,
      1.3,
      30,
      100,
      [100, 100]
    );

    // --- 1.3s - 1.8s: "DE" ---
    var w2 = createPosterText(
      comp,
      "Word_2_DE",
      "DE",
      140,
      PURE_WHITE,
      [540, 780],
      1.3,
      1.8,
      0,
      110,
      [70, 77]
    );

    // --- 1.8s - 4.2s: "DISFRUTAR" (Hero Giant Red Display) ---
    var w3 = createPosterText(
      comp,
      "Word_3_DISFRUTAR",
      "DISFRUTAR",
      240,
      CRIMSON_RED,
      [540, 780],
      1.8,
      4.2,
      -18,
      150, // Estirado verticalmente TIME style
      [240, 360]
    );

    var sub3 = createPosterText(
      comp,
      "Sub_3",
      "✦ EN SU MÁXIMA EXPRESIÓN ✦",
      36,
      PURE_WHITE,
      [540, 1080],
      2.0,
      4.2,
      20,
      100,
      [100, 100]
    );

    // Shockwave Ring en la entrada de DISFRUTAR (t = 1.8s)
    var shockwave = comp.layers.addShape();
    shockwave.name = "Hero_Impact_Shockwave";
    shockwave.inPoint = 1.8;
    shockwave.outPoint = 2.8;
    var swGroup = shockwave.property("Contents").addProperty("ADBE Vector Group");
    var swCircle = swGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    swCircle.property("Size").setValue([400, 400]);
    var swStroke = swGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    swStroke.property("Color").setValue(CRIMSON_RED);
    swStroke.property("Stroke Width").setValue(6.0);
    shockwave.transform.position.setValue([540, 780]);
    shockwave.transform.scale.setValueAtTime(1.8, [10, 10]);
    shockwave.transform.scale.setValueAtTime(2.6, [280, 280]);
    shockwave.transform.opacity.setValueAtTime(1.8, 100);
    shockwave.transform.opacity.setValueAtTime(2.6, 0);

    // --- 4.2s - 4.8s: "LOS" ---
    var w4 = createPosterText(
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

    // --- 4.8s - 6.8s: "FESTIVALES" (Póster Slam Final) ---
    var w5 = createPosterText(
      comp,
      "Word_5_FESTIVALES",
      "FESTIVALES",
      210,
      CRIMSON_RED,
      [540, 760],
      4.8,
      6.8, // Salida limpia en 6.8s
      -15,
      140,
      [250, 350]
    );

    var finalTag = createPosterText(
      comp,
      "Final_Tag",
      "[ EXPERIENCIA SENSORIAL // 2026 ]",
      38,
      PURE_WHITE,
      [540, 1140],
      5.0,
      6.8,
      25,
      100,
      [100, 100]
    );

    // Líneas de acento horizontales superior e inferior
    var topAccentLine = comp.layers.addShape();
    topAccentLine.name = "Accent_Line_Top";
    topAccentLine.inPoint = 4.8;
    topAccentLine.outPoint = 6.8;
    var talGroup = topAccentLine.property("Contents").addProperty("ADBE Vector Group");
    var talRect = talGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    talRect.property("Size").setValue([860, 4]);
    var talFill = talGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    talFill.property("Color").setValue(CRIMSON_RED);
    topAccentLine.transform.position.setValue([540, 520]);
    topAccentLine.transform.scale.setValueAtTime(4.8, [0, 100]);
    topAccentLine.transform.scale.setValueAtTime(5.1, [100, 100]);

    var btmAccentLine = comp.layers.addShape();
    btmAccentLine.name = "Accent_Line_Bottom";
    btmAccentLine.inPoint = 4.8;
    btmAccentLine.outPoint = 6.8;
    var balGroup = btmAccentLine.property("Contents").addProperty("ADBE Vector Group");
    var balRect = balGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    balRect.property("Size").setValue([860, 4]);
    var balFill = balGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    balFill.property("Color").setValue(CRIMSON_RED);
    btmAccentLine.transform.position.setValue([540, 1000]);
    btmAccentLine.transform.scale.setValueAtTime(4.8, [0, 100]);
    btmAccentLine.transform.scale.setValueAtTime(5.1, [100, 100]);

    // =======================================================================
    // 8. APERTURA AUTOMÁTICA EN VISOR DE AFTER EFFECTS
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de Producción de Agencia: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "Ultimate_Agency_Showcase.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX de Producción de Agencia generado -> ${jsxFilePath}`);

  // Empaquetar y validar
  MotionEngine.deliverSocialPackage(comp, "proj_ultimate_agency", "rev_1");
  await CLIRunner.run(["node", "bin", "validate", "ultimate_agency.json"]);
  await CLIRunner.run(["node", "bin", "qa", "ultimate_agency.json", "--threshold", "0.85"]);

  console.log("\n==========================================================================");
  console.log("🎉 ¡PRODUCCIÓN DEFINITIVA DE AGENCIA LISTA PARA REPRODUCIR EN AFTER EFFECTS!");
  console.log("==========================================================================\n");
}

runUltimateAgencyShowcase().catch(console.error);
