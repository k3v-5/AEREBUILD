import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";
import { CLIRunner } from "../cli/CLIRunner.js";

async function generateTwoMinuteFestivalMasterpiece() {
  console.log("\n==========================================================================");
  console.log("🎬 GENERANDO PRODUCCIÓN DEFINITIVA DE 2 MINUTOS CON EFECTOS TOTALES");
  console.log("   • Bass Punch & Camera Shakes aplicados DIRECTAMENTE AL VIDEO DE FONDO");
  console.log("   • White Flashes, Shockwaves, Audio Visualizer HUD & Scanning Lines");
  console.log("   • 6 Actos Narrativos de Tipografía Cinematográfica Editorial");
  console.log("   • Estilo: TIME Editorial Poster (#FF1424 Crimson + FAFAFA White)");
  console.log("==========================================================================\n");

  const outputDir = path.resolve("./dist/festival_2min");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoFilePath = "D:/Lap/Camera/20250405_214145.mp4";
  const bouncePunchy = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.03, 8.0, 4.5));
  const cameraShakeFootage = JSON.stringify(AEBridgeManager.expressions.wiggle(10, 22));

  const comp = MotionEngine.createComposition({
    id: "festival_2min_comp",
    name: "FESTIVAL_2MIN_FULL_FX_MASTERPIECE",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: 120.0,
  });

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — 2-MINUTE MASTER FESTIVAL FULL FX SUITE
 * Complete Audiovisual Production Pipeline:
 *  1. Real Footage with DIRECT BASS PUNCH ZOOMS & CAMERA SHAKES on drops
 *  2. White Flash Impact Transitions on major scene shifts
 *  3. Kinetic Shockwave Impact Rings & Particle Bursts
 *  4. HUD Audio Equalizer Spectrum Simulator (Bottom Bar)
 *  5. Continuous Cybernetic Scanning Laser Line & Technical Brackets
 *  6. 6-Act Dynamic Speech Typography (TIME Poster Style #FF1424 + White)
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("2-Minute Full FX Master Festival Production");

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
    var compDuration = (footage && footage.duration > 0) ? footage.duration : 120.0;
    var compFps = (footage && footage.frameRate > 0) ? footage.frameRate : 60.0;

    var comp = project.items.addComp("FESTIVAL_2MIN_FULL_FX_MASTERPIECE", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.02, 0.02, 0.03];
    comp.motionBlur = true; // Activar desenfoque de movimiento nativo

    // Helper tipográfico profesional optimizado para 60 FPS
    function createPosterText(comp, name, text, fontSize, color, pos, inTime, outTime, tracking, verticalScale, inScale, isShaky) {
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
      var startScale = inScale ? [inScale[0], inScale[1] * (vScale / 100)] : [160, 160 * (vScale / 100)];

      // Animación de Entrada Rápida con Rebote Físico
      layer.transform.scale.setValueAtTime(inTime, startScale);
      layer.transform.scale.setValueAtTime(inTime + 0.18, baseScale);
      layer.transform.scale.expression = ${bouncePunchy};

      // Animación de Salida Suave (Fade out de 0.15s)
      layer.transform.opacity.setValueAtTime(inTime, 100);
      layer.transform.opacity.setValueAtTime(outTime - 0.15, 100);
      layer.transform.opacity.setValueAtTime(outTime, 0);

      if (isShaky) {
        layer.transform.position.expression = ${cameraShakeFootage};
      }

      return layer;
    }

    // Helper para crear Shockwaves expansivos en drops
    function createShockwave(comp, name, time, color, centerPos) {
      var sw = comp.layers.addShape();
      sw.name = name;
      sw.inPoint = time;
      sw.outPoint = time + 0.7;
      var swGroup = sw.property("Contents").addProperty("ADBE Vector Group");
      var swCirc = swGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
      swCirc.property("Size").setValue([300, 300]);
      var swStroke = swGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
      swStroke.property("Color").setValue(color || [1.0, 0.08, 0.14]);
      swStroke.property("Stroke Width").setValue(6.0);
      sw.transform.position.setValue(centerPos || [compWidth / 2, compHeight / 2]);
      sw.transform.scale.setValueAtTime(time, [10, 10]);
      sw.transform.scale.setValueAtTime(time + 0.65, [320, 320]);
      sw.transform.opacity.setValueAtTime(time, 100);
      sw.transform.opacity.setValueAtTime(time + 0.65, 0);
      return sw;
    }

    // Helper para crear White Flash Transitions
    function createWhiteFlash(comp, name, inTime) {
      var flash = comp.layers.addSolid([1.0, 1.0, 1.0], name, compWidth, compHeight, 1.0, 0.25);
      flash.inPoint = inTime;
      flash.outPoint = inTime + 0.25;
      flash.transform.opacity.setValueAtTime(inTime, 85);
      flash.transform.opacity.setValueAtTime(inTime + 0.22, 0);
      return flash;
    }

    // =======================================================================
    // 🎥 1. CAPA DE VIDEO REAL CON BASS PUNCH ZOOMS & SHAKES DIRECTOS
    // =======================================================================
    if (footage) {
      var videoLayer = comp.layers.add(footage);
      videoLayer.name = "Footage_With_Bass_Punches";
      videoLayer.motionBlur = true;
      videoLayer.transform.position.setValue([compWidth / 2, compHeight / 2]);
      var scaleX = (compWidth / footage.width) * 100;
      var scaleY = (compHeight / footage.height) * 100;
      var coverScale = Math.max(scaleX, scaleY);
      
      // Escala base con zoom continuo suave
      videoLayer.transform.scale.setValueAtTime(0, [coverScale, coverScale]);
      videoLayer.transform.scale.setValueAtTime(compDuration, [coverScale * 1.06, coverScale * 1.06]);

      // 💥 INYECCIÓN DE BASS PUNCH ZOOMS (GOLPES DE GRAVES DIRECTOS AL VIDEO):
      var dropTimes = [1.7, 12.0, 21.2, 30.5, 40.5, 45.8, 50.8, 61.5, 72.0, 81.5, 91.0, 101.5, 106.5, 112.5];
      for (var d = 0; d < dropTimes.length; d++) {
        var dt = dropTimes[d];
        videoLayer.transform.scale.setValueAtTime(dt, [coverScale * 1.15, coverScale * 1.15]); // Snap zoom in
        videoLayer.transform.scale.setValueAtTime(dt + 0.25, [coverScale * 1.01, coverScale * 1.01]); // Snap zoom out
      }
      videoLayer.transform.scale.expression = ${bouncePunchy};
    }

    // =======================================================================
    // 🌌 2. GRADACIÓN DE CONTRASTE CINEMÁTICO
    // =======================================================================
    var darkOverlay = comp.layers.addSolid([0.02, 0.02, 0.04], "Cinematic_Contrast_Grade", compWidth, compHeight, 1.0, compDuration);
    darkOverlay.transform.opacity.setValue(38);

    // =======================================================================
    // ⚡ 3. WHITE FLASH TRANSITIONS EN CADA CAMBIO DE ACTO
    // =======================================================================
    var flashTimes = [0.2, 20.0, 40.0, 60.0, 80.0, 100.0, 116.5];
    for (var f = 0; f < flashTimes.length; f++) {
      createWhiteFlash(comp, "Flash_Act_" + (f + 1), flashTimes[f]);
    }

    // =======================================================================
    // 💥 4. SHOCKWAVE EXPANSIONS EN LOS GRANDES DROPS
    // =======================================================================
    createShockwave(comp, "Shockwave_Drop_1", 1.7, [1.0, 0.08, 0.14], [540, 940]);
    createShockwave(comp, "Shockwave_Drop_2", 40.5, [1.0, 0.08, 0.14], [540, 760]);
    createShockwave(comp, "Shockwave_Drop_3", 91.0, [1.0, 0.08, 0.14], [540, 900]);
    createShockwave(comp, "Shockwave_Drop_4", 106.5, [1.0, 0.08, 0.14], [540, 900]);

    // =======================================================================
    // 📊 5. HUD AUDIO EQUALIZER SPECTRUM (BARRAS VECTORIALES INFERIORES)
    // =======================================================================
    var eqLayer = comp.layers.addShape();
    eqLayer.name = "HUD_Audio_Equalizer_Bars";
    eqLayer.inPoint = 0.5;
    eqLayer.outPoint = compDuration - 0.5;
    var eqGroup = eqLayer.property("Contents").addProperty("ADBE Vector Group");
    var eqContents = eqGroup.property("Contents");

    var barRect = eqContents.addProperty("ADBE Vector Shape - Rect");
    barRect.property("Size").setValue([12, 60]);
    barRect.property("Roundness").setValue(4);
    var barFill = eqContents.addProperty("ADBE Vector Graphic - Fill");
    barFill.property("Color").setValue([1.0, 0.08, 0.14]); // Rojo
    var barRepeater = eqContents.addProperty("ADBE Vector Filter - Repeater");
    barRepeater.property("Copies").setValue(32);
    barRepeater.property("Transform").property("Position").setValue([28, 0]);

    eqLayer.transform.position.setValue([100, 1820]);
    eqLayer.transform.scale.expression = "linear(Math.sin(time * 16), -1, 1, [100, 40], [100, 160])";
    eqLayer.transform.opacity.setValue(60);

    // =======================================================================
    // 🚨 6. SCANNING LASER LINE HUD (LÍNEA HORIZONTAL DINÁMICA)
    // =======================================================================
    var scanLine = comp.layers.addShape();
    scanLine.name = "HUD_Laser_Scanning_Line";
    scanLine.inPoint = 0.5;
    scanLine.outPoint = compDuration - 0.5;
    var slGroup = scanLine.property("Contents").addProperty("ADBE Vector Group");
    var slRect = slGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    slRect.property("Size").setValue([1000, 2]);
    var slFill = slGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    slFill.property("Color").setValue([0.9, 0.95, 1.0]);
    scanLine.transform.position.expression = "[540, linear(Math.sin(time * 1.5), -1, 1, 350, 1650)]";
    scanLine.transform.opacity.setValue(35);

    // =======================================================================
    // 📐 7. HUD TIMECODE & TECHNICAL CORNER BRACKETS
    // =======================================================================
    var tcLayer = comp.layers.addText("LIVE // 00:00:00:00");
    tcLayer.name = "HUD_Timecode";
    tcLayer.inPoint = 0.2;
    tcLayer.outPoint = compDuration - 0.5;
    var tcProp = tcLayer.property("Source Text");
    var tcDoc = tcProp.value;
    tcDoc.fontSize = 24;
    tcDoc.fillColor = [0.8, 0.85, 0.95];
    tcDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    tcDoc.tracking = 35;
    tcProp.setValue(tcDoc);
    tcLayer.transform.position.setValue([540, 220]);
    tcProp.expression = "'REC [ ' + timeToTimecode(time) + ' ] // FESTIVAL MANIFESTO'";

    // =======================================================================
    // 🎨 PALETA DE COLOR OFICIAL (USER_DESIGN_PREFERENCES.md)
    // =======================================================================
    var CRIMSON_RED = [1.0, 0.08, 0.14]; // #FF1424 Rojo Póster
    var PURE_WHITE  = [0.98, 0.98, 0.98];
    var GOLD_ACCENT = [1.0, 0.75, 0.10];

    // =======================================================================
    // 🔥 ACTO 1: EL MANIFIESTO Y LA ATMÓSFERA (0s -> 20s)
    // =======================================================================
    createPosterText(comp, "A1_Tag", "✦ CAPÍTULO 01 // EL MANIFIESTO ✦", 28, CRIMSON_RED, [540, 520], 0.5, 3.2, 30);
    createPosterText(comp, "A1_EL_ARTE", "EL ARTE", 160, PURE_WHITE, [540, 700], 0.5, 3.2, -15, 120, [180, 216]);
    createPosterText(comp, "A1_DISFRUTAR", "DISFRUTAR", 230, CRIMSON_RED, [540, 940], 1.2, 3.2, -18, 150, [240, 360], true);

    createPosterText(comp, "A1_NO_SOLO", "NO ES SOLO", 140, PURE_WHITE, [540, 680], 3.5, 6.5, -12, 120);
    createPosterText(comp, "A1_LA_MUSICA", "LA MÚSICA", 210, CRIMSON_RED, [540, 880], 4.2, 6.5, -15, 140, [220, 308]);

    createPosterText(comp, "A1_ES_LA", "ES LA", 120, PURE_WHITE, [540, 640], 6.8, 10.5, 10);
    createPosterText(comp, "A1_ATMOSFERA", "ATMÓSFERA", 220, CRIMSON_RED, [540, 840], 7.4, 10.5, -16, 145);
    createPosterText(comp, "A1_Sub1", "DONDE TODO COBRA SENTIDO", 34, PURE_WHITE, [540, 1080], 7.8, 10.5, 20);

    createPosterText(comp, "A1_MILES", "MILES DE ALMAS", 140, PURE_WHITE, [540, 700], 11.0, 15.0, -10, 120);
    createPosterText(comp, "A1_RITMO", "UN SOLO LATIDO", 190, CRIMSON_RED, [540, 900], 12.0, 15.0, -15, 140, [240, 336], true);

    createPosterText(comp, "A1_CONEXION", "CONEXIÓN REAL", 180, PURE_WHITE, [540, 780], 15.5, 19.5, -14, 130);
    createPosterText(comp, "A1_Tag2", "[ SIN FILTROS // 2026 ]", 34, CRIMSON_RED, [540, 980], 16.0, 19.5, 25);

    // =======================================================================
    // ⚠️ ACTO 2: EL ERROR DE LA PANTALLA (20s -> 40s)
    // =======================================================================
    createPosterText(comp, "A2_Tag", "⚠️ ERROR COMÚN #01", 30, GOLD_ACCENT, [540, 520], 20.0, 24.0, 30);
    createPosterText(comp, "A2_VIVIR", "VIVIR A TRAVÉS", 150, PURE_WHITE, [540, 700], 20.5, 24.0, -12, 120);
    createPosterText(comp, "A2_PANTALLA", "DE UNA PANTALLA", 180, CRIMSON_RED, [540, 900], 21.2, 24.0, -15, 135, [230, 310], true);

    createPosterText(comp, "A2_GRABAR", "GRABAR TODO EL SHOW", 130, PURE_WHITE, [540, 680], 24.5, 29.0, -10, 115);
    createPosterText(comp, "A2_SIN_ESTAR", "SIN ESTAR AHÍ", 190, CRIMSON_RED, [540, 880], 25.5, 29.0, -15, 140, [220, 308]);

    createPosterText(comp, "A2_CONSEJO", "GUARDA EL TELÉFONO", 150, PURE_WHITE, [540, 700], 29.5, 34.5, -12, 120);
    createPosterText(comp, "A2_OJOS", "ABRE LOS OJOS", 210, CRIMSON_RED, [540, 900], 30.5, 34.5, -16, 145, [240, 348], true);

    createPosterText(comp, "A2_MOMENTO", "EL MOMENTO ES AHORA", 160, PURE_WHITE, [540, 780], 35.0, 39.5, -14, 130);
    createPosterText(comp, "A2_Sub2", "NO SE REPITE NUNCA", 38, CRIMSON_RED, [540, 1020], 35.8, 39.5, 25);

    // =======================================================================
    // 💡 ACTO 3: EL SECRETO Y LA ENERGÍA FÍSICA (40s -> 60s)
    // =======================================================================
    createPosterText(comp, "A3_Tag", "✦ CAPÍTULO 02 // EL SECRETO ✦", 28, CRIMSON_RED, [540, 520], 40.0, 44.5, 30);
    createPosterText(comp, "A3_ENERGIA", "ENERGÍA PURA", 220, CRIMSON_RED, [540, 760], 40.5, 44.5, -18, 150, [250, 375], true);

    createPosterText(comp, "A3_CUANDO", "CUANDO EL BAJO", 140, PURE_WHITE, [540, 680], 45.0, 49.5, -10, 120);
    createPosterText(comp, "A3_PECHO", "RETUMBA EN TU PECHO", 170, CRIMSON_RED, [540, 880], 45.8, 49.5, -15, 135, [230, 310], true);

    createPosterText(comp, "A3_PIERDES", "PIERDES LA NOCIÓN", 140, PURE_WHITE, [540, 680], 50.0, 55.0, -10, 120);
    createPosterText(comp, "A3_TIEMPO", "DEL TIEMPO", 230, CRIMSON_RED, [540, 900], 50.8, 55.0, -18, 150, [250, 375], true);

    createPosterText(comp, "A3_PRESENTE", "SOLO EXISTE EL PRESENTE", 130, PURE_WHITE, [540, 780], 55.5, 59.5, -8, 120);
    createPosterText(comp, "A3_Sub3", "[ LIBERTAD ABSOLUTA ]", 36, CRIMSON_RED, [540, 1000], 56.0, 59.5, 30);

    // =======================================================================
    // 🧭 ACTO 4: PRO TIPS Y LOGÍSTICA DE EXPERTO (60s -> 80s)
    // =======================================================================
    createPosterText(comp, "A4_Tag", "✦ PRO TIPS DE FESTIVAL ✦", 28, GOLD_ACCENT, [540, 520], 60.0, 65.0, 30);
    createPosterText(comp, "A4_HIDRATA", "HIDRÁTATE SIEMPRE", 150, PURE_WHITE, [540, 720], 60.5, 65.0, -12, 120);
    createPosterText(comp, "A4_RESISTE", "EL CUERPO AGUANTA", 180, CRIMSON_RED, [540, 920], 61.5, 65.0, -15, 140, [220, 308], true);

    createPosterText(comp, "A4_LINEUP", "CONOCE EL LINEUP", 150, PURE_WHITE, [540, 680], 65.5, 70.5, -10, 120);
    createPosterText(comp, "A4_SORPRENDE", "DÉJATE SORPRENDER", 190, CRIMSON_RED, [540, 880], 66.5, 70.5, -16, 140, [230, 322]);

    createPosterText(comp, "A4_MOMENTOS", "LOS MEJORES MOMENTOS", 130, PURE_WHITE, [540, 700], 71.0, 76.0, -10, 115);
    createPosterText(comp, "A4_PLAN", "NUNCA ESTÁN PLANEADOS", 180, CRIMSON_RED, [540, 900], 72.0, 76.0, -15, 140, [240, 336], true);

    createPosterText(comp, "A4_EXPLORA", "CAMINA Y DESCUBRE", 160, PURE_WHITE, [540, 780], 76.5, 79.8, -12, 125);

    // =======================================================================
    // 🤝 ACTO 5: LA TRIBU Y LA COMUNIDAD (80s -> 100s)
    // =======================================================================
    createPosterText(comp, "A5_Tag", "✦ CAPÍTULO 03 // LA TRIBU ✦", 28, CRIMSON_RED, [540, 520], 80.0, 84.5, 30);
    createPosterText(comp, "A5_DESCONOCIDOS", "DESCONOCIDOS", 180, PURE_WHITE, [540, 720], 80.5, 84.5, -15, 130);
    createPosterText(comp, "A5_CANTANDO", "CANTANDO JUNTOS", 190, CRIMSON_RED, [540, 920], 81.5, 84.5, -15, 140, [240, 336], true);

    createPosterText(comp, "A5_CERO_EGO", "CERO EGO", 210, PURE_WHITE, [540, 700], 85.0, 89.5, -16, 140);
    createPosterText(comp, "A5_VIBRACION", "SOLO BUENA VIBRA", 190, CRIMSON_RED, [540, 920], 86.0, 89.5, -15, 140, [230, 322]);

    createPosterText(comp, "A5_ABRAZOS", "SONRISAS Y ABRAZOS", 140, PURE_WHITE, [540, 700], 90.0, 94.5, -10, 120);
    createPosterText(comp, "A5_MAGIA", "ESA ES LA MAGIA", 220, CRIMSON_RED, [540, 900], 91.0, 94.5, -18, 150, [250, 375], true);

    createPosterText(comp, "A5_RECORDAR", "LO QUE VAS A RECORDAR", 140, PURE_WHITE, [540, 780], 95.0, 99.5, -10, 120);
    createPosterText(comp, "A5_Tag5", "[ PARA SIEMPRE ]", 38, CRIMSON_RED, [540, 980], 95.8, 99.5, 30);

    // =======================================================================
    // 🚀 ACTO 6: EL GRAN CLÍMAX Y LLAMADO A LA ACCIÓN (100s -> 120s)
    // =======================================================================
    createPosterText(comp, "A6_Tag", "✦ EL CLÍMAX // 2026 ✦", 30, CRIMSON_RED, [540, 500], 100.0, 105.0, 30);
    createPosterText(comp, "A6_EL_FESTIVAL", "EL FESTIVAL SE ACABA", 140, PURE_WHITE, [540, 700], 100.5, 105.0, -10, 120);
    createPosterText(comp, "A6_RECUERDO", "EL RECUERDO ES ETERNO", 170, CRIMSON_RED, [540, 900], 101.5, 105.0, -15, 135, [220, 297], true);

    createPosterText(comp, "A6_VIVELO", "VÍVELO HOY", 190, PURE_WHITE, [540, 680], 105.5, 111.0, -15, 135);
    createPosterText(comp, "A6_SIN_MIEDO", "SIN MIEDO", 250, CRIMSON_RED, [540, 900], 106.5, 111.0, -20, 155, [260, 400], true);

    createPosterText(comp, "A6_HAZLO", "SAL A VIVIRLO", 200, PURE_WHITE, [540, 720], 111.5, 116.5, -16, 140);
    createPosterText(comp, "A6_MAXIMO", "AL MÁXIMO", 240, CRIMSON_RED, [540, 940], 112.5, 116.5, -18, 150, [250, 375], true);

    createPosterText(comp, "A6_Final_Badge", "[ VIVE LA EXPERIENCIA // 2026 ]", 42, PURE_WHITE, [540, 800], 116.8, compDuration, 25, 110, [100, 110]);
    createPosterText(comp, "A6_CTA", "✦ COMPARTE CON TU TRIBU ✦", 32, CRIMSON_RED, [540, 960], 117.2, compDuration, 30);

    // =======================================================================
    // 8. APERTURA AUTOMÁTICA EN VISOR DE AFTER EFFECTS
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de Producción 2 Minutos: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "Festival_2Min_Full_FX_Masterpiece.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX de 2 Minutos con Full FX Suite generado -> ${jsxFilePath}`);

  // Ejecutar Delivery y QA
  MotionEngine.deliverSocialPackage(comp, "proj_festival_2min_fx", "rev_gold_fx");
  await CLIRunner.run(["node", "bin", "validate", "festival_2min_fx.json"]);
  await CLIRunner.run(["node", "bin", "qa", "festival_2min_fx.json", "--threshold", "0.85"]);

  console.log("\n==========================================================================");
  console.log("🎉 ¡PRODUCCIÓN DE 2 MINUTOS CON FULL FX SUITE LISTA EN AFTER EFFECTS!");
  console.log("==========================================================================\n");
}

generateTwoMinuteFestivalMasterpiece().catch(console.error);
