import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";
import { CLIRunner } from "../cli/CLIRunner.js";

async function generateDenseTwoMinuteFestivalMasterpiece() {
  console.log("\n==========================================================================");
  console.log("🎬 GENERANDO MASTER DE 2 MINUTOS CON LÍNEA DE TIEMPO 100% LLENA (0s -> 120s)");
  console.log("   • +50 Capas Animadas continuas a lo largo de los 120 segundos");
  console.log("   • Bass Punch Zooms continuos en el video cada 4-5 segundos");
  console.log("   • Flashes, Shockwaves, Equalizer, Scanner y Diales en todo el video");
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
    name: "FESTIVAL_2MIN_FULL_TIMELINE_MASTERPIECE",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: 120.0,
  });

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — 2-MINUTE 100% DENSE TIMELINE PRODUCTION
 * Continuous Narrative, Overlays & FX covering every second from 0s to 120s
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("2-Minute Full Dense Timeline Festival Production");

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
    var compDuration = 120.0;
    if (footage && footage.duration > 0) {
      compDuration = Math.max(footage.duration, 120.0);
    }
    var compFps = (footage && footage.frameRate > 0) ? footage.frameRate : 60.0;

    var comp = project.items.addComp("FESTIVAL_2MIN_FULL_TIMELINE_MASTERPIECE", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.02, 0.02, 0.03];
    comp.motionBlur = true; // Activar desenfoque de movimiento nativo

    // Helper tipográfico profesional
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

      layer.transform.scale.setValueAtTime(inTime, startScale);
      layer.transform.scale.setValueAtTime(inTime + 0.18, baseScale);
      layer.transform.scale.expression = ${bouncePunchy};

      layer.transform.opacity.setValueAtTime(inTime, 100);
      layer.transform.opacity.setValueAtTime(outTime - 0.15, 100);
      layer.transform.opacity.setValueAtTime(outTime, 0);

      if (isShaky) {
        layer.transform.position.expression = ${cameraShakeFootage};
      }

      return layer;
    }

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

    function createWhiteFlash(comp, name, inTime) {
      var flash = comp.layers.addSolid([1.0, 1.0, 1.0], name, compWidth, compHeight, 1.0, 0.25);
      flash.inPoint = inTime;
      flash.outPoint = inTime + 0.25;
      flash.transform.opacity.setValueAtTime(inTime, 85);
      flash.transform.opacity.setValueAtTime(inTime + 0.22, 0);
      return flash;
    }

    // =======================================================================
    // 🎥 1. CAPA DE VIDEO REAL (BASS PUNCH ZOOMS EN TODA LA LÍNEA DE TIEMPO)
    // =======================================================================
    if (footage) {
      var videoLayer = comp.layers.add(footage);
      videoLayer.name = "Footage_With_Bass_Punches";
      videoLayer.motionBlur = true;
      videoLayer.transform.position.setValue([compWidth / 2, compHeight / 2]);
      var scaleX = (compWidth / footage.width) * 100;
      var scaleY = (compHeight / footage.height) * 100;
      var coverScale = Math.max(scaleX, scaleY);
      
      videoLayer.transform.scale.setValueAtTime(0, [coverScale, coverScale]);
      videoLayer.transform.scale.setValueAtTime(compDuration, [coverScale * 1.06, coverScale * 1.06]);

      // GOLPES DE ZOOM (BASS PUNCHES) DISTRIBUIDOS CADA 4-5 SEGUNDOS (0s a 120s):
      var drops = [1.5, 6.5, 11.5, 18.0, 24.5, 29.5, 36.0, 42.5, 48.0, 54.0, 60.0, 66.0, 72.5, 78.0, 84.0, 90.0, 96.0, 102.0, 108.0, 114.0, 118.0];
      for (var d = 0; d < drops.length; d++) {
        var dt = drops[d];
        videoLayer.transform.scale.setValueAtTime(dt, [coverScale * 1.15, coverScale * 1.15]);
        videoLayer.transform.scale.setValueAtTime(dt + 0.25, [coverScale * 1.01, coverScale * 1.01]);
      }
      videoLayer.transform.scale.expression = ${bouncePunchy};
    }

    // =======================================================================
    // 🌌 2. GRADACIÓN DE CONTRASTE CINEMÁTICO (0s a 120s)
    // =======================================================================
    var darkOverlay = comp.layers.addSolid([0.02, 0.02, 0.04], "Cinematic_Contrast_Grade", compWidth, compHeight, 1.0, compDuration);
    darkOverlay.transform.opacity.setValue(38);

    // =======================================================================
    // ⚡ 3. WHITE FLASHES A LO LARGO DE LOS 120 SEGUNDOS
    // =======================================================================
    var flashTimes = [0.2, 18.0, 36.0, 54.0, 72.0, 90.0, 108.0, 116.5];
    for (var f = 0; f < flashTimes.length; f++) {
      createWhiteFlash(comp, "Flash_" + (f + 1), flashTimes[f]);
    }

    // =======================================================================
    // 💥 4. SHOCKWAVES A LO LARGO DE LOS 120 SEGUNDOS
    // =======================================================================
    var swTimes = [1.5, 18.0, 36.0, 54.0, 72.0, 90.0, 108.0, 114.0];
    for (var s = 0; s < swTimes.length; s++) {
      createShockwave(comp, "Shockwave_" + (s + 1), swTimes[s], [1.0, 0.08, 0.14], [540, 800]);
    }

    // =======================================================================
    // 📊 5. HUD AUDIO EQUALIZER (0s a 120s)
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
    barFill.property("Color").setValue([1.0, 0.08, 0.14]);
    var barRepeater = eqContents.addProperty("ADBE Vector Filter - Repeater");
    barRepeater.property("Copies").setValue(32);
    barRepeater.property("Transform").property("Position").setValue([28, 0]);
    eqLayer.transform.position.setValue([100, 1820]);
    eqLayer.transform.scale.expression = "linear(Math.sin(time * 16), -1, 1, [100, 40], [100, 160])";
    eqLayer.transform.opacity.setValue(60);

    // =======================================================================
    // 🚨 6. SCANNING LASER LINE HUD (0s a 120s)
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
    // 📟 7. TIMECODE HUD EN LA PARTE SUPERIOR (0s a 120s)
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
    // 🎨 PALETA DE COLOR OFICIAL
    // =======================================================================
    var CRIMSON_RED = [1.0, 0.08, 0.14]; // #FF1424
    var PURE_WHITE  = [0.98, 0.98, 0.98];
    var GOLD_ACCENT = [1.0, 0.75, 0.10];
    var MUTED_GRAY  = [0.75, 0.75, 0.82];

    // =======================================================================
    // 💥 TIPOGRAFÍA CONTINUA CUBRIENDO CADA SEGUNDO DE 0s A 120s (+50 CAPAS):
    // =======================================================================

    // [0s - 18s] ACTO 1: EL MANIFIESTO
    createPosterText(comp, "T_01", "✦ CAPÍTULO 01 // MANIFIESTO ✦", 28, CRIMSON_RED, [540, 520], 0.5, 3.0, 30);
    createPosterText(comp, "T_02", "EL ARTE", 160, PURE_WHITE, [540, 700], 0.5, 3.0, -15, 120);
    createPosterText(comp, "T_03", "DE DISFRUTAR", 220, CRIMSON_RED, [540, 920], 1.2, 3.0, -18, 150);

    createPosterText(comp, "T_04", "NO ES SOLO", 140, PURE_WHITE, [540, 680], 3.2, 6.2, -12, 120);
    createPosterText(comp, "T_05", "LA MÚSICA", 210, CRIMSON_RED, [540, 880], 4.0, 6.2, -15, 140);

    createPosterText(comp, "T_06", "ES LA", 120, PURE_WHITE, [540, 640], 6.5, 9.8, 10);
    createPosterText(comp, "T_07", "ATMÓSFERA", 220, CRIMSON_RED, [540, 840], 7.2, 9.8, -16, 145);
    createPosterText(comp, "T_08", "DONDE TODO TIENE SENTIDO", 34, PURE_WHITE, [540, 1080], 7.6, 9.8, 20);

    createPosterText(comp, "T_09", "MILES DE PERSONAS", 140, PURE_WHITE, [540, 700], 10.0, 13.8, -10, 120);
    createPosterText(comp, "T_10", "UN SOLO LATIDO", 200, CRIMSON_RED, [540, 900], 11.0, 13.8, -15, 140, [220, 308], true);

    createPosterText(comp, "T_11", "CONEXIÓN REAL", 180, PURE_WHITE, [540, 780], 14.0, 17.8, -14, 130);
    createPosterText(comp, "T_12", "[ SIN PANTALLAS DE POR MEDIO ]", 32, CRIMSON_RED, [540, 980], 14.6, 17.8, 25);

    // [18s - 36s] ACTO 2: EL ERROR COMÚN
    createPosterText(comp, "T_13", "⚠️ ERROR #01 DE FESTIVAL", 30, GOLD_ACCENT, [540, 520], 18.0, 22.0, 30);
    createPosterText(comp, "T_14", "VIVIR EL SHOW", 150, PURE_WHITE, [540, 700], 18.5, 22.0, -12, 120);
    createPosterText(comp, "T_15", "A TRAVÉS DE LA CÁMARA", 160, CRIMSON_RED, [540, 900], 19.2, 22.0, -14, 130, [200, 260], true);

    createPosterText(comp, "T_16", "GRABAR CADA MINUTO", 140, PURE_WHITE, [540, 680], 22.2, 26.0, -10, 115);
    createPosterText(comp, "T_17", "SIN SENTIR LA MÚSICA", 180, CRIMSON_RED, [540, 880], 23.0, 26.0, -15, 135);

    createPosterText(comp, "T_18", "GUARDA EL TELÉFONO", 160, PURE_WHITE, [540, 700], 26.2, 30.5, -14, 125);
    createPosterText(comp, "T_19", "ABRE LOS OJOS", 220, CRIMSON_RED, [540, 920], 27.2, 30.5, -18, 150, [240, 360], true);

    createPosterText(comp, "T_20", "EL MOMENTO ES HOY", 160, PURE_WHITE, [540, 760], 31.0, 35.5, -12, 130);
    createPosterText(comp, "T_21", "[ NO VA A VOLVER ]", 38, CRIMSON_RED, [540, 980], 31.8, 35.5, 25);

    // [36s - 54s] ACTO 3: EL SECRETO
    createPosterText(comp, "T_22", "✦ CAPÍTULO 02 // EL SECRETO ✦", 28, CRIMSON_RED, [540, 520], 36.0, 40.0, 30);
    createPosterText(comp, "T_23", "ENERGÍA COLECTIVA", 190, CRIMSON_RED, [540, 760], 36.5, 40.0, -16, 145, [240, 348], true);

    createPosterText(comp, "T_24", "CUANDO EL BAJO", 140, PURE_WHITE, [540, 680], 40.2, 44.2, -10, 120);
    createPosterText(comp, "T_25", "RETUMBA EN TU PECHO", 170, CRIMSON_RED, [540, 880], 41.0, 44.2, -15, 135, [220, 297], true);

    createPosterText(comp, "T_26", "PIERDES LA NOCIÓN", 140, PURE_WHITE, [540, 680], 44.5, 48.8, -10, 120);
    createPosterText(comp, "T_27", "DEL TIEMPO", 240, CRIMSON_RED, [540, 900], 45.5, 48.8, -18, 150, [250, 375], true);

    createPosterText(comp, "T_28", "SOLO EXISTE", 140, PURE_WHITE, [540, 680], 49.0, 53.5, 0, 120);
    createPosterText(comp, "T_29", "EL PRESENTE", 220, CRIMSON_RED, [540, 900], 50.0, 53.5, -16, 145);

    // [54s - 72s] ACTO 4: PRO TIPS
    createPosterText(comp, "T_30", "✦ PRO TIPS DE EXPERTO ✦", 28, GOLD_ACCENT, [540, 520], 54.0, 58.2, 30);
    createPosterText(comp, "T_31", "HIDRÁTATE SIEMPRE", 150, PURE_WHITE, [540, 720], 54.5, 58.2, -12, 120);
    createPosterText(comp, "T_32", "EL CUERPO AGUANTA", 180, CRIMSON_RED, [540, 920], 55.5, 58.2, -15, 140);

    createPosterText(comp, "T_33", "CONOCE EL LINEUP", 150, PURE_WHITE, [540, 680], 58.5, 62.8, -10, 120);
    createPosterText(comp, "T_34", "DÉJATE LLEVAR", 200, CRIMSON_RED, [540, 880], 59.5, 62.8, -16, 140, [230, 322]);

    createPosterText(comp, "T_35", "LOS MEJORES MOMENTOS", 130, PURE_WHITE, [540, 700], 63.0, 67.5, -10, 115);
    createPosterText(comp, "T_36", "NUNCA SE PLANEAN", 190, CRIMSON_RED, [540, 900], 64.0, 67.5, -15, 140);

    createPosterText(comp, "T_37", "CAMINA Y EXPLORA", 160, PURE_WHITE, [540, 760], 67.8, 71.8, -12, 125);
    createPosterText(comp, "T_38", "ESCENARIOS SECRETOS", 170, CRIMSON_RED, [540, 960], 68.5, 71.8, -14, 130);

    // [72s - 90s] ACTO 5: LA COMUNIDAD
    createPosterText(comp, "T_39", "✦ CAPÍTULO 03 // LA TRIBU ✦", 28, CRIMSON_RED, [540, 520], 72.0, 76.5, 30);
    createPosterText(comp, "T_40", "DESCONOCIDOS", 180, PURE_WHITE, [540, 720], 72.5, 76.5, -15, 130);
    createPosterText(comp, "T_41", "CANTANDO JUNTOS", 190, CRIMSON_RED, [540, 920], 73.5, 76.5, -15, 140, [240, 336], true);

    createPosterText(comp, "T_42", "CERO JUZGAR", 190, PURE_WHITE, [540, 700], 77.0, 81.2, -15, 135);
    createPosterText(comp, "T_43", "SOLO BUENA VIBRA", 190, CRIMSON_RED, [540, 900], 78.0, 81.2, -15, 140);

    createPosterText(comp, "T_44", "SONRISAS Y ABRAZOS", 140, PURE_WHITE, [540, 700], 81.5, 85.8, -10, 120);
    createPosterText(comp, "T_45", "ESA ES LA MAGIA", 220, CRIMSON_RED, [540, 900], 82.5, 85.8, -18, 150, [250, 375], true);

    createPosterText(comp, "T_46", "LO QUE RECORDARÁS", 150, PURE_WHITE, [540, 760], 86.0, 89.8, -12, 125);
    createPosterText(comp, "T_47", "[ PARA TODA LA VIDA ]", 36, CRIMSON_RED, [540, 960], 86.8, 89.8, 25);

    // [90s - 108s] ACTO 6: EL CLÍMAX
    createPosterText(comp, "T_48", "✦ EL CLÍMAX // 2026 ✦", 30, CRIMSON_RED, [540, 500], 90.0, 94.5, 30);
    createPosterText(comp, "T_49", "EL FESTIVAL TERMINA", 140, PURE_WHITE, [540, 700], 90.5, 94.5, -10, 120);
    createPosterText(comp, "T_50", "LA EXPERIENCIA QUEDA", 180, CRIMSON_RED, [540, 900], 91.5, 94.5, -15, 135, [220, 297], true);

    createPosterText(comp, "T_51", "NO TE QUEDES MIRANDO", 140, PURE_WHITE, [540, 680], 95.0, 99.2, -10, 120);
    createPosterText(comp, "T_52", "SÉ PARTE DEL SHOW", 200, CRIMSON_RED, [540, 880], 96.0, 99.2, -16, 140, [230, 322]);

    createPosterText(comp, "T_53", "BAILA", 240, PURE_WHITE, [540, 680], 99.5, 103.5, -18, 150);
    createPosterText(comp, "T_54", "CANTA", 240, CRIMSON_RED, [540, 920], 100.5, 103.5, -18, 150, [250, 375], true);

    createPosterText(comp, "T_55", "SÉ LIBRE", 230, PURE_WHITE, [540, 780], 104.0, 107.8, -16, 145);

    // [108s - 120s] CIERRE Y LLAMADO A LA ACCIÓN
    createPosterText(comp, "T_56", "VÍVELO HOY", 190, PURE_WHITE, [540, 680], 108.0, 113.5, -15, 135);
    createPosterText(comp, "T_57", "SIN MIEDO", 250, CRIMSON_RED, [540, 900], 109.0, 113.5, -20, 155, [260, 400], true);

    createPosterText(comp, "T_58", "SAL A VIVIRLO", 200, PURE_WHITE, [540, 720], 114.0, 117.8, -16, 140);
    createPosterText(comp, "T_59", "AL MÁXIMO", 240, CRIMSON_RED, [540, 940], 114.8, 117.8, -18, 150, [250, 375], true);

    createPosterText(comp, "T_60", "[ VIVE LA EXPERIENCIA // 2026 ]", 42, PURE_WHITE, [540, 800], 118.0, compDuration, 25, 110, [100, 110]);
    createPosterText(comp, "T_61", "✦ COMPARTE CON TU TRIBU ✦", 32, CRIMSON_RED, [540, 960], 118.4, compDuration, 30);

    // =======================================================================
    // 8. APERTURA EN VISOR
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de Producción 2 Minutos Completa: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "Festival_2Min_Full_FX_Masterpiece.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX denso de 2 Minutos (+60 Capas) generado -> ${jsxFilePath}`);

  MotionEngine.deliverSocialPackage(comp, "proj_festival_dense", "rev_dense");
  await CLIRunner.run(["node", "bin", "validate", "festival_dense.json"]);
  await CLIRunner.run(["node", "bin", "qa", "festival_dense.json", "--threshold", "0.85"]);

  console.log("\n==========================================================================");
  console.log("🎉 ¡LÍNEA DE TIEMPO DE 2 MINUTOS 100% LLENA Y LISTA EN AFTER EFFECTS!");
  console.log("==========================================================================\n");
}

generateDenseTwoMinuteFestivalMasterpiece().catch(console.error);
