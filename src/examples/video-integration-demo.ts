import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";

async function createVideoIntegrationProject() {
  console.log("\n========================================================");
  console.log("🎥 INTEGRANDO VIDEO REAL CON MOTION GRAPHICS EN AFTER EFFECTS");
  console.log("========================================================\n");

  const outputDir = path.resolve("./dist/video_project");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoFilePathWindows = "D:/Lap/Camera/20250405_214145.mp4";
  const bounceCode = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.05, 5.0, 3.5));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — REAL FOOTAGE COMPOSITING PIPELINE
 * Video Source: "${videoFilePathWindows}"
 * Auto-Import -> Auto-Fit Scaling -> Contrast Grading -> Kinetic Overlays
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Import Real Video with Motion Graphics");

  try {
    var project = app.project;

    // 1. IMPORTAR EL ARCHIVO DE VIDEO REAL DEL USUARIO
    var videoFile = new File("${videoFilePathWindows}");
    if (!videoFile.exists) {
      alert("No se encontró el archivo de video en: " + videoFile.fsName);
      return;
    }

    var importOptions = new ImportOptions(videoFile);
    var footage = project.importFile(importOptions);

    // 2. DETECTAR RESOLUCIÓN Y CREAR COMPOSICIÓN ADAPTADA
    var isVertical = (footage.height > footage.width) || (footage.height === 1920);
    var compWidth = isVertical ? 1080 : 1920;
    var compHeight = isVertical ? 1920 : 1080;
    var compFps = footage.frameRate > 0 ? footage.frameRate : 30.0;
    var compDuration = footage.duration > 0 ? footage.duration : 10.0;

    var comp = project.items.addComp("REAL_VIDEO_COMPOSITING", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.03, 0.03, 0.05];

    // Helper tipográfico moderno
    function createModernText(comp, name, text, fontSize, color, pos, startTime, outTime, tracking) {
      var layer = comp.layers.addText(text);
      layer.name = name;
      var textProp = layer.property("Source Text");
      var textDoc = textProp.value;
      textDoc.fontSize = fontSize;
      textDoc.fillColor = color;
      textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
      textDoc.tracking = tracking || 10;
      
      var fonts = ["SegoeUI-Black", "Arial-Black", "Impact", "SegoeUI-Bold", "Arial-BoldMT", "TrebuchetMS-Bold"];
      for (var f = 0; f < fonts.length; f++) {
        try {
          textDoc.font = fonts[f];
          break;
        } catch(e) {}
      }

      textProp.setValue(textDoc);
      layer.transform.position.setValue(pos);
      if (startTime !== undefined) layer.inPoint = startTime;
      if (outTime !== undefined) layer.outPoint = outTime;
      return layer;
    }

    // =======================================================================
    // 🎥 CAPA 1: VIDEO REAL DE FONDO (AUTO-FIT COVER)
    // =======================================================================
    var videoLayer = comp.layers.add(footage);
    videoLayer.name = "Footage_20250405_214145";
    videoLayer.transform.position.setValue([compWidth / 2, compHeight / 2]);

    var scaleX = (compWidth / footage.width) * 100;
    var scaleY = (compHeight / footage.height) * 100;
    var coverScale = Math.max(scaleX, scaleY);
    videoLayer.transform.scale.setValue([coverScale, coverScale]);

    // =======================================================================
    // 🌌 CAPA 2: GRADIENTE DE CONTRASTE CINEMÁTICO (Vignette / Dark Overlay)
    // =======================================================================
    var darkVignette = comp.layers.addSolid([0.02, 0.03, 0.07], "Contrast_Grade_Overlay", compWidth, compHeight, 1.0, compDuration);
    darkVignette.transform.opacity.setValue(40); // 40% oscurecimiento suave para legibilidad

    // =======================================================================
    // 🏷️ CAPA 3: BADGE SUPERIOR DE PRODUCCIÓN (t = 0.5s en adelante)
    // =======================================================================
    var topBadgePill = comp.layers.addShape();
    topBadgePill.name = "Top_Live_Badge";
    var bpGroup = topBadgePill.property("Contents").addProperty("ADBE Vector Group");
    var bpRect = bpGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    bpRect.property("Size").setValue([520, 64]);
    bpRect.property("Roundness").setValue(32);
    var bpFill = bpGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    bpFill.property("Color").setValue([0.08, 0.10, 0.16]);
    var bpStroke = bpGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    bpStroke.property("Color").setValue([0.0, 0.95, 1.0]); // Neon Cyan
    bpStroke.property("Stroke Width").setValue(1.5);
    topBadgePill.transform.position.setValue([compWidth / 2, isVertical ? 280 : 180]);
    topBadgePill.transform.opacity.setValueAtTime(0.0, 0);
    topBadgePill.transform.opacity.setValueAtTime(0.6, 100);

    var topBadgeText = createModernText(
      comp,
      "Top_Badge_Text",
      "🔴 LIVE FOOTAGE // AI COMPOSITING",
      24,
      [0.0, 0.95, 1.0],
      [compWidth / 2, (isVertical ? 280 : 180) + 8],
      0.0,
      compDuration,
      30
    );
    topBadgeText.transform.opacity.setValueAtTime(0.0, 0);
    topBadgeText.transform.opacity.setValueAtTime(0.6, 100);

    // =======================================================================
    // 🎯 CAPA 4: LOWER THIRD ELEGANTE DE PRESENTADOR / TEMA (t = 1.0s -> 6.0s)
    // =======================================================================
    var lowerThirdY = isVertical ? 1480 : 860;

    // Caja Glassmorphism
    var ltCard = comp.layers.addShape();
    ltCard.name = "Lower_Third_Card";
    ltCard.inPoint = 1.0;
    ltCard.outPoint = Math.min(compDuration, 7.0);
    var ltGroup = ltCard.property("Contents").addProperty("ADBE Vector Group");
    var ltRect = ltGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    ltRect.property("Size").setValue([isVertical ? 920 : 1100, 220]);
    ltRect.property("Roundness").setValue(36);
    var ltFill = ltGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    ltFill.property("Color").setValue([0.05, 0.07, 0.12]);
    var ltStroke = ltGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    ltStroke.property("Color").setValue([0.25, 0.35, 0.55]);
    ltStroke.property("Stroke Width").setValue(2.0);
    ltCard.transform.position.setValue([compWidth / 2, lowerThirdY]);
    ltCard.transform.scale.setValueAtTime(1.0, [80, 80]);
    ltCard.transform.scale.setValueAtTime(1.4, [100, 100]);
    ltCard.transform.scale.expression = ${bounceCode};

    // Título Principal del Lower Third
    var ltTitle = createModernText(
      comp,
      "LT_Main_Title",
      "NEXT-GEN VIDEO PRODUCTION",
      48,
      [1.0, 1.0, 1.0],
      [compWidth / 2, lowerThirdY - 35],
      1.1,
      Math.min(compDuration, 7.0),
      -5
    );
    ltTitle.transform.opacity.setValueAtTime(1.1, 0);
    ltTitle.transform.opacity.setValueAtTime(1.4, 100);

    // Subtítulo / Social Handle
    var ltSub = createModernText(
      comp,
      "LT_Subtitle",
      "✦ Powered by Motion Engine & Adobe After Effects MCP",
      28,
      [0.0, 0.90, 1.0], // Neon Cyan
      [compWidth / 2, lowerThirdY + 40],
      1.3,
      Math.min(compDuration, 7.0),
      15
    );
    ltSub.transform.opacity.setValueAtTime(1.3, 0);
    ltSub.transform.opacity.setValueAtTime(1.6, 100);

    // =======================================================================
    // 5. APERTURA AUTOMÁTICA EN VISOR DE AFTER EFFECTS
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de compositing: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "Production_With_Real_Video.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX de composición con video real generado -> ${jsxFilePath}`);

  console.log("\n========================================================");
  console.log("🎉 ¡PROYECTO CON TU VIDEO REAL LISTO PARA ABRIR!");
  console.log("========================================================\n");
}

createVideoIntegrationProject().catch(console.error);
