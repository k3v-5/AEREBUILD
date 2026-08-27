import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";

async function createProCommercialShowcase() {
  console.log("\n========================================================");
  console.log("🎬 REFINANDO PIEZA COMERCIAL: CENTRADO EXACTO & TIPOGRAFÍA PRO");
  console.log("========================================================\n");

  const outputDir = path.resolve("./dist/pro_commercial");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const bounceCode = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.06, 5.0, 3.0));
  const wiggleSubtle = JSON.stringify(AEBridgeManager.expressions.wiggle(1.2, 8));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 (GOLD MASTER) — HIGH-END COMMERCIAL SHOWCASE
 * Project: CYBER_LAUNCH_2026 (1080x1920 @ 60fps)
 * Perfectly Centered Typography with ParagraphJustification.CENTER_JUSTIFY
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Create Motion Engine Commercial Piece");

  try {
    var project = app.project;
    var comp = project.items.addComp("CYBER_LAUNCH_2026", 1080, 1920, 1.0, 8.0, 60.0);
    comp.bgColor = [0.03, 0.04, 0.08]; // Fondo Ultra Dark Slate Navy

    // Helper para crear texto centrado con tipografía y color
    function createCenteredText(comp, name, text, fontSize, color, pos) {
      var layer = comp.layers.addText(text);
      layer.name = name;
      var textProp = layer.property("Source Text");
      var textDoc = textProp.value;
      textDoc.fontSize = fontSize;
      textDoc.fillColor = color;
      textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
      textProp.setValue(textDoc);
      layer.transform.position.setValue(pos);
      return layer;
    }

    // =======================================================================
    // 1. CAPA DE FONDO: LUZ AMBIENTAL PULSANTE
    // =======================================================================
    var bgGlow = comp.layers.addSolid([0.08, 0.03, 0.28], "Ambient_Purple_Glow", 1080, 1920, 1.0, 8.0);
    bgGlow.transform.opacity.setValue(40);
    bgGlow.transform.scale.expression = "linear(Math.sin(time * 2), -1, 1, [100, 100], [120, 120])";

    // =======================================================================
    // 2. HUD RADAR EXTERIOR (Orbitando alrededor del centro: 540, 720)
    // =======================================================================
    var hudLayer = comp.layers.addShape();
    hudLayer.name = "HUD_Radar_Ring";
    var hudGroup = hudLayer.property("Contents").addProperty("ADBE Vector Group");
    hudGroup.name = "Radar_Geometry";
    var hudContents = hudGroup.property("Contents");

    // Elipse Principal
    var hudCircle = hudContents.addProperty("ADBE Vector Shape - Ellipse");
    hudCircle.property("Size").setValue([860, 860]);

    // Trim Paths Animado con Rotación
    var hudTrim = hudContents.addProperty("ADBE Vector Filter - Trim");
    hudTrim.property("Start").setValueAtTime(0, 0);
    hudTrim.property("Start").setValueAtTime(1.5, 15);
    hudTrim.property("End").setValueAtTime(0, 0);
    hudTrim.property("End").setValueAtTime(1.5, 80);
    hudTrim.property("Offset").expression = "time * 30"; // Rotación continua

    // Stroke Neon Cyan
    var hudStroke = hudContents.addProperty("ADBE Vector Graphic - Stroke");
    hudStroke.property("Color").setValue([0.0, 0.95, 1.0]);
    hudStroke.property("Stroke Width").setValue(3.5);

    // Repeater Radial (4 cuadrantes)
    var hudRepeater = hudContents.addProperty("ADBE Vector Filter - Repeater");
    hudRepeater.property("Copies").setValue(4);
    hudRepeater.property("Transform").property("Rotation").setValue(90);

    hudLayer.transform.position.setValue([540, 720]);

    // =======================================================================
    // 3. HUD RETICLE INTERIOR (Hot Magenta, Radio 700px)
    // =======================================================================
    var innerRingLayer = comp.layers.addShape();
    innerRingLayer.name = "HUD_Inner_Tech_Circle";
    var innerGroup = innerRingLayer.property("Contents").addProperty("ADBE Vector Group");
    innerGroup.name = "Inner_Geometry";
    var innerContents = innerGroup.property("Contents");

    var innerCircle = innerContents.addProperty("ADBE Vector Shape - Ellipse");
    innerCircle.property("Size").setValue([700, 700]);

    var innerTrim = innerContents.addProperty("ADBE Vector Filter - Trim");
    innerTrim.property("Start").setValue(0);
    innerTrim.property("End").setValue(60);
    innerTrim.property("Offset").expression = "-time * 45"; // Contra-rotación

    var innerStroke = innerContents.addProperty("ADBE Vector Graphic - Stroke");
    innerStroke.property("Color").setValue([1.0, 0.0, 0.55]); // Hot Magenta
    innerStroke.property("Stroke Width").setValue(2.0);

    var innerRepeater = innerContents.addProperty("ADBE Vector Filter - Repeater");
    innerRepeater.property("Copies").setValue(3);
    innerRepeater.property("Transform").property("Rotation").setValue(120);

    innerRingLayer.transform.position.setValue([540, 720]);

    // =======================================================================
    // 4. CAPAS DE TEXTO PERFECTAMENTE CENTRADAS
    // =======================================================================

    // Badge Superior (Cyan, 32px)
    var badgeLayer = createCenteredText(
      comp,
      "HUD Category Tag",
      "[ SYSTEM OVERRIDE // NEXT-GEN AI ]",
      32,
      [0.0, 0.95, 1.0],
      [540, 420]
    );
    badgeLayer.transform.opacity.setValueAtTime(0, 0);
    badgeLayer.transform.opacity.setValueAtTime(0.6, 100);

    // Titular Principal (Blanco, 92px) con rebote elástico
    var heroLayer = createCenteredText(
      comp,
      "Hero Title",
      "MOTION ENGINE",
      92,
      [1.0, 1.0, 1.0],
      [540, 680]
    );
    heroLayer.transform.scale.setValueAtTime(0, [20, 20]);
    heroLayer.transform.scale.setValueAtTime(0.7, [100, 100]);
    heroLayer.transform.scale.expression = ${bounceCode};
    heroLayer.transform.position.expression = ${wiggleSubtle};

    // Subtítulo Dorado (Gold, 58px) con fade-in y slide
    var goldLayer = createCenteredText(
      comp,
      "Gold Subtitle",
      "GOLD MASTER v3.0",
      58,
      [1.0, 0.84, 0.0],
      [540, 790]
    );
    goldLayer.transform.opacity.setValueAtTime(0.5, 0);
    goldLayer.transform.opacity.setValueAtTime(1.1, 100);
    goldLayer.transform.position.setValueAtTime(0.5, [540, 830]);
    goldLayer.transform.position.setValueAtTime(1.1, [540, 790]);

    // Features Checklist (Centradas horizontalmente)
    var f1 = createCenteredText(
      comp,
      "Feature 1",
      "✦ 100% DETERMINISTIC KINEMATICS",
      36,
      [0.9, 0.92, 0.98],
      [540, 1060]
    );
    f1.transform.opacity.setValueAtTime(1.0, 0);
    f1.transform.opacity.setValueAtTime(1.4, 100);

    var f2 = createCenteredText(
      comp,
      "Feature 2",
      "✦ MULTI-AGENT SWARM ORCHESTRATION",
      36,
      [0.9, 0.92, 0.98],
      [540, 1140]
    );
    f2.transform.opacity.setValueAtTime(1.3, 0);
    f2.transform.opacity.setValueAtTime(1.7, 100);

    var f3 = createCenteredText(
      comp,
      "Feature 3",
      "✦ NATIVE AFTER EFFECTS COMPILATION",
      36,
      [0.9, 0.92, 0.98],
      [540, 1220]
    );
    f3.transform.opacity.setValueAtTime(1.6, 0);
    f3.transform.opacity.setValueAtTime(2.0, 100);

    // =======================================================================
    // 5. BOTÓN CTA VECTORIAL + TEXTO CENTRADO (Y = 1520)
    // =======================================================================
    var ctaButtonLayer = comp.layers.addShape();
    ctaButtonLayer.name = "CTA_Button_Pill";
    var ctaGroup = ctaButtonLayer.property("Contents").addProperty("ADBE Vector Group");
    var ctaContents = ctaGroup.property("Contents");

    var ctaRect = ctaContents.addProperty("ADBE Vector Shape - Rect");
    ctaRect.property("Size").setValue([660, 120]);
    ctaRect.property("Roundness").setValue(60); // Pill shape

    var ctaFill = ctaContents.addProperty("ADBE Vector Graphic - Fill");
    ctaFill.property("Color").setValue([0.0, 0.95, 1.0]); // Neon Cyan Fill

    ctaButtonLayer.transform.position.setValue([540, 1520]);
    ctaButtonLayer.transform.scale.setValueAtTime(0, [0, 0]);
    ctaButtonLayer.transform.scale.setValueAtTime(1.8, [100, 100]);
    ctaButtonLayer.transform.scale.expression = ${bounceCode};

    // Texto del Botón CTA
    var ctaTextLayer = createCenteredText(
      comp,
      "CTA Button Text",
      "GET STARTED NOW ->",
      42,
      [0.03, 0.04, 0.1], // Dark Navy Text
      [540, 1535]
    );
    ctaTextLayer.transform.scale.setValueAtTime(0, [0, 0]);
    ctaTextLayer.transform.scale.setValueAtTime(1.8, [100, 100]);
    ctaTextLayer.transform.scale.expression = ${bounceCode};

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

  const jsxFilePath = path.join(outputDir, "Cyberpunk_Commercial_Showcase.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX con centrado exacto generado -> ${jsxFilePath}`);
}

createProCommercialShowcase().catch(console.error);
