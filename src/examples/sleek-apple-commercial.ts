import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";

async function createSleekAppleStyleShowcase() {
  console.log("\n========================================================");
  console.log("💎 CREANDO PIEZA DE DISEÑO PREMIUM (ESTILO APPLE / LINEAR)");
  console.log("========================================================\n");

  const outputDir = path.resolve("./dist/sleek_design");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const bounceCode = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.05, 5.0, 3.5));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — STUDIO PREMIUM AESTHETIC (APPLE / LINEAR STYLE)
 * High-End Kinetic Typography, Glassmorphism, Micro-Interactions & Modern Sans
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Create Premium Motion Graphics Showcase");

  try {
    var project = app.project;
    var comp = project.items.addComp("PREMIUM_DESIGN_2026", 1080, 1920, 1.0, 8.0, 60.0);
    comp.bgColor = [0.03, 0.03, 0.05]; // OLED Deep Black / Graphite

    // Helper tipográfico pro con fallback a fuentes Sans-Serif modernas
    function createModernText(comp, name, text, fontSize, color, pos, startTime, outTime, tracking) {
      var layer = comp.layers.addText(text);
      layer.name = name;
      var textProp = layer.property("Source Text");
      var textDoc = textProp.value;
      textDoc.fontSize = fontSize;
      textDoc.fillColor = color;
      textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
      textDoc.tracking = tracking || 10;
      
      // Intentar fuentes Sans-Serif ultra-bold modernas (Segoe UI Black, Arial Black, Impact)
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
    // 1. FONDO MINIMALISTA: GRADIENTE SUAVE DE LUZ AZULADA
    // =======================================================================
    var bgLight = comp.layers.addSolid([0.05, 0.08, 0.20], "Ambient_Backlight", 1080, 1920, 1.0, 8.0);
    bgLight.transform.opacity.setValue(35);
    bgLight.transform.scale.expression = "linear(Math.sin(time * 2), -1, 1, [100, 100], [115, 115])";

    // =======================================================================
    // 2. TAG SUPERIOR MINIMALISTA ESTILO VERCEL / LINEAR (Pill Glass)
    // =======================================================================
    var tagPill = comp.layers.addShape();
    tagPill.name = "Top_Pill_Badge";
    tagPill.inPoint = 0.0;
    tagPill.outPoint = 8.0;
    var tpGroup = tagPill.property("Contents").addProperty("ADBE Vector Group");
    var tpRect = tpGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    tpRect.property("Size").setValue([480, 70]);
    tpRect.property("Roundness").setValue(35);
    var tpFill = tpGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    tpFill.property("Color").setValue([0.10, 0.12, 0.18]);
    var tpStroke = tpGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    tpStroke.property("Color").setValue([0.25, 0.35, 0.55]); // Subtle Slate Border
    tpStroke.property("Stroke Width").setValue(1.5);
    tagPill.transform.position.setValue([540, 380]);
    tagPill.transform.opacity.setValueAtTime(0, 0);
    tagPill.transform.opacity.setValueAtTime(0.5, 100);

    var tagText = createModernText(
      comp,
      "Top_Badge_Text",
      "⚡ MOTION ENGINE 3.0",
      26,
      [0.4, 0.8, 1.0], // Electric Ice Blue
      [540, 390],
      0.0,
      8.0,
      40
    );
    tagText.transform.opacity.setValueAtTime(0, 0);
    tagText.transform.opacity.setValueAtTime(0.5, 100);

    // =======================================================================
    // 3. TITULAR PRINCIPAL EN 2 LÍNEAS (TIGHT LEADING, SANS ULTRA BOLD)
    // =======================================================================

    // Línea 1: "CREATE VIDEO" (Blanco puro, 104px)
    var titleLine1 = createModernText(
      comp,
      "Title_Line_1",
      "CREATE VIDEO",
      104,
      [1.0, 1.0, 1.0],
      [540, 560],
      0.1,
      8.0,
      -10
    );
    titleLine1.transform.scale.setValueAtTime(0.1, [85, 85]);
    titleLine1.transform.scale.setValueAtTime(0.6, [100, 100]);
    titleLine1.transform.scale.expression = ${bounceCode};

    // Línea 2: "AT LIGHTSPEED" (Cyan Neón Gradiente, 104px)
    var titleLine2 = createModernText(
      comp,
      "Title_Line_2",
      "AT LIGHTSPEED",
      104,
      [0.0, 0.90, 1.0],
      [540, 680],
      0.25,
      8.0,
      -10
    );
    titleLine2.transform.scale.setValueAtTime(0.25, [85, 85]);
    titleLine2.transform.scale.setValueAtTime(0.75, [100, 100]);
    titleLine2.transform.scale.expression = ${bounceCode};

    // Subtítulo Elegante
    var subHeadline = createModernText(
      comp,
      "Sub_Headline",
      "Autonomous AI Production for After Effects",
      34,
      [0.6, 0.65, 0.75], // Soft Muted Gray
      [540, 780],
      0.5,
      8.0,
      10
    );
    subHeadline.transform.opacity.setValueAtTime(0.5, 0);
    subHeadline.transform.opacity.setValueAtTime(0.9, 100);

    // =======================================================================
    // 4. TARJETA GLASSMORPHISM SLEEK CON 3 MÉTRICAS (Estilo Linear App)
    // =======================================================================
    var cardContainer = comp.layers.addShape();
    cardContainer.name = "Glass_Card_Container";
    cardContainer.inPoint = 0.6;
    cardContainer.outPoint = 8.0;
    var ccGroup = cardContainer.property("Contents").addProperty("ADBE Vector Group");
    var ccRect = ccGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    ccRect.property("Size").setValue([880, 420]);
    ccRect.property("Roundness").setValue(32);
    var ccFill = ccGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    ccFill.property("Color").setValue([0.06, 0.08, 0.14]); // Glass Slate
    var ccStroke = ccGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    ccStroke.property("Color").setValue([0.20, 0.25, 0.40]); // Subtle Glow Border
    ccStroke.property("Stroke Width").setValue(1.5);
    cardContainer.transform.position.setValue([540, 1100]);
    cardContainer.transform.scale.setValueAtTime(0.6, [90, 90]);
    cardContainer.transform.scale.setValueAtTime(1.0, [100, 100]);
    cardContainer.transform.scale.expression = ${bounceCode};

    // 3 Filas de Métricas con Separadores
    var m1 = createModernText(comp, "Metric_1", "✦  60 FPS DETERMINISTIC TIMELINE", 34, [0.95, 0.95, 1.0], [540, 990], 0.8, 8.0, 15);
    var m2 = createModernText(comp, "Metric_2", "✦  MULTI-AGENT PRODUCTION SWARM", 34, [0.95, 0.95, 1.0], [540, 1080], 1.0, 8.0, 15);
    var m3 = createModernText(comp, "Metric_3", "✦  EXTENDSCRIPT JSX DIRECT BRIDGE", 34, [0.0, 0.90, 1.0], [540, 1170], 1.2, 8.0, 15);

    // Animación de entrada suave en las métricas
    m1.transform.opacity.setValueAtTime(0.8, 0); m1.transform.opacity.setValueAtTime(1.1, 100);
    m2.transform.opacity.setValueAtTime(1.0, 0); m2.transform.opacity.setValueAtTime(1.3, 100);
    m3.transform.opacity.setValueAtTime(1.2, 0); m3.transform.opacity.setValueAtTime(1.5, 100);

    // =======================================================================
    // 5. BOTÓN CTA MINIMALISTA Y SOFISTICADO (Y = 1500)
    // =======================================================================
    var ctaPill = comp.layers.addShape();
    ctaPill.name = "CTA_Pill_Button";
    ctaPill.inPoint = 1.2;
    ctaPill.outPoint = 8.0;
    var cGroup = ctaPill.property("Contents").addProperty("ADBE Vector Group");
    var cRect = cGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    cRect.property("Size").setValue([720, 110]);
    cRect.property("Roundness").setValue(55);
    var cFill = cGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    cFill.property("Color").setValue([0.0, 0.85, 1.0]); // Clean Electric Cyan
    ctaPill.transform.position.setValue([540, 1500]);
    ctaPill.transform.scale.setValueAtTime(1.2, [0, 0]);
    ctaPill.transform.scale.setValueAtTime(1.6, [100, 100]);
    ctaPill.transform.scale.expression = ${bounceCode};

    var ctaText = createModernText(
      comp,
      "CTA_Button_Label",
      "GET STARTED WITH ENGINE →",
      36,
      [0.02, 0.04, 0.08], // Deep Navy Text
      [540, 1512],
      1.2,
      8.0,
      20
    );
    ctaText.transform.scale.setValueAtTime(1.2, [0, 0]);
    ctaText.transform.scale.setValueAtTime(1.6, [100, 100]);
    ctaText.transform.scale.expression = ${bounceCode};

    // =======================================================================
    // 6. APERTURA AUTOMÁTICA EN VISOR
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de Motion Engine: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "Sleek_Premium_Showcase.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX de diseño premium generado -> ${jsxFilePath}`);
}

createSleekAppleStyleShowcase().catch(console.error);
