import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { TextElement } from "../elements/TextElement.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";

async function createProCommercialShowcase() {
  console.log("\n========================================================");
  console.log("🎬 CREANDO PIEZA BROADCAST / COMMERCIAL DE ALTA PRODUCCIÓN");
  console.log("========================================================\n");

  const outputDir = path.resolve("./dist/pro_commercial");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Composición Principal 9:16 (Vertical Story / Reels / Shorts 1080x1920 60 FPS)
  const comp = MotionEngine.createComposition({
    id: "pro_commercial_comp",
    name: "CYBER_LAUNCH_2026",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: 8.0,
  });

  const bounceCode = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.08, 6.0, 3.5));
  const wiggleSubtle = JSON.stringify(AEBridgeManager.expressions.wiggle(1.5, 12));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 (GOLD MASTER) — HIGH-END COMMERCIAL SHOWCASE
 * Project: CYBER_LAUNCH_2026 (1080x1920 @ 60fps)
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Create Motion Engine Commercial Piece");

  try {
    var project = app.project;
    var comp = project.items.addComp("CYBER_LAUNCH_2026", 1080, 1920, 1.0, 8.0, 60.0);
    comp.bgColor = [0.03, 0.04, 0.07]; // Fondo Ultra Dark Navy

    // =======================================================================
    // 1. CAPA DE FONDO: GRADIENTE & LUZ AMBIENTAL (Solid)
    // =======================================================================
    var bgGlow = comp.layers.addSolid([0.08, 0.02, 0.25], "Ambient_Purple_Glow", 1080, 1920, 1.0, 8.0);
    bgGlow.transform.opacity.setValue(50);
    bgGlow.transform.scale.expression = "linear(Math.sin(time * 2), -1, 1, [100, 100], [125, 125])";

    // =======================================================================
    // 2. HUD RETICLE: ANILLO RADAR EXTERIOR CON REPEATER (Neon Cyan)
    // =======================================================================
    var hudLayer = comp.layers.addShape();
    hudLayer.name = "HUD_Radar_Ring";
    var hudGroup = hudLayer.property("Contents").addProperty("ADBE Vector Group");
    hudGroup.name = "Radar_Geometry";
    var hudContents = hudGroup.property("Contents");

    // Elipse Principal
    var hudCircle = hudContents.addProperty("ADBE Vector Shape - Ellipse");
    hudCircle.property("Size").setValue([540, 540]);

    // Trim Paths Animado
    var hudTrim = hudContents.addProperty("ADBE Vector Filter - Trim");
    hudTrim.property("Start").setValueAtTime(0, 0);
    hudTrim.property("Start").setValueAtTime(1.5, 20);
    hudTrim.property("End").setValueAtTime(0, 0);
    hudTrim.property("End").setValueAtTime(1.5, 85);
    hudTrim.property("Offset").setValue(0);
    hudTrim.property("Offset").expression = "time * 45"; // Rotación continua

    // Stroke Neon Cyan
    var hudStroke = hudContents.addProperty("ADBE Vector Graphic - Stroke");
    hudStroke.property("Color").setValue([0.0, 0.95, 1.0]);
    hudStroke.property("Stroke Width").setValue(4.0);

    // Repeater Radial (4 cuadrantes)
    var hudRepeater = hudContents.addProperty("ADBE Vector Filter - Repeater");
    hudRepeater.property("Copies").setValue(4);
    hudRepeater.property("Transform").property("Rotation").setValue(90);

    hudLayer.transform.position.setValue([540, 820]);

    // =======================================================================
    // 3. HUD RETICLE: ANILLO INTERIOR DISCONTINUO (Hot Magenta)
    // =======================================================================
    var innerRingLayer = comp.layers.addShape();
    innerRingLayer.name = "HUD_Inner_Tech_Circle";
    var innerGroup = innerRingLayer.property("Contents").addProperty("ADBE Vector Group");
    innerGroup.name = "Inner_Geometry";
    var innerContents = innerGroup.property("Contents");

    var innerCircle = innerContents.addProperty("ADBE Vector Shape - Ellipse");
    innerCircle.property("Size").setValue([420, 420]);

    var innerTrim = innerContents.addProperty("ADBE Vector Filter - Trim");
    innerTrim.property("Start").setValue(0);
    innerTrim.property("End").setValue(60);
    innerTrim.property("Offset").expression = "-time * 60"; // Rotación contraria

    var innerStroke = innerContents.addProperty("ADBE Vector Graphic - Stroke");
    innerStroke.property("Color").setValue([1.0, 0.0, 0.55]); // Hot Magenta
    innerStroke.property("Stroke Width").setValue(2.5);

    var innerRepeater = innerContents.addProperty("ADBE Vector Filter - Repeater");
    innerRepeater.property("Copies").setValue(3);
    innerRepeater.property("Transform").property("Rotation").setValue(120);

    innerRingLayer.transform.position.setValue([540, 820]);

    // =======================================================================
    // 4. BOTÓN CTA VECTORIAL CON BORDES REDONDEADOS (Electric Cyan Pill)
    // =======================================================================
    var ctaButtonLayer = comp.layers.addShape();
    ctaButtonLayer.name = "CTA_Button_Pill";
    var ctaGroup = ctaButtonLayer.property("Contents").addProperty("ADBE Vector Group");
    var ctaContents = ctaGroup.property("Contents");

    var ctaRect = ctaContents.addProperty("ADBE Vector Shape - Rect");
    ctaRect.property("Size").setValue([620, 120]);
    ctaRect.property("Roundness").setValue(60); // Pill shape

    var ctaFill = ctaContents.addProperty("ADBE Vector Graphic - Fill");
    ctaFill.property("Color").setValue([0.0, 0.95, 1.0]); // Neon Cyan Fill

    ctaButtonLayer.transform.position.setValue([540, 1540]);
    ctaButtonLayer.transform.scale.setValueAtTime(0, [0, 0]);
    ctaButtonLayer.transform.scale.setValueAtTime(1.8, [100, 100]);
    ctaButtonLayer.transform.scale.expression = ${bounceCode};

    // =======================================================================
    // 5. CAPAS DE TEXTO CINEMATOGRÁFICAS
    // =======================================================================

    // Badge Superior
    var badgeLayer = comp.layers.addText("[ SYSTEM OVERRIDE // NEXT-GEN AI ]");
    badgeLayer.name = "HUD Category Tag";
    badgeLayer.transform.anchorPoint.setValue([0, 0]);
    badgeLayer.transform.position.setValue([540, 480]);
    badgeLayer.transform.opacity.setValueAtTime(0, 0);
    badgeLayer.transform.opacity.setValueAtTime(0.6, 100);

    // Titular Principal (MOTION ENGINE) con animación elástica
    var heroLayer = comp.layers.addText("MOTION ENGINE");
    heroLayer.name = "Hero Title";
    heroLayer.transform.anchorPoint.setValue([0, 0]);
    heroLayer.transform.position.setValue([540, 780]);
    heroLayer.transform.position.expression = ${wiggleSubtle};
    heroLayer.transform.scale.setValueAtTime(0, [20, 20]);
    heroLayer.transform.scale.setValueAtTime(0.7, [100, 100]);
    heroLayer.transform.scale.expression = ${bounceCode};

    // Subtítulo Dorado (GOLD MASTER v3.0)
    var goldLayer = comp.layers.addText("GOLD MASTER v3.0");
    goldLayer.name = "Gold Subtitle";
    goldLayer.transform.anchorPoint.setValue([0, 0]);
    goldLayer.transform.position.setValue([540, 920]);
    goldLayer.transform.opacity.setValueAtTime(0.5, 0);
    goldLayer.transform.opacity.setValueAtTime(1.1, 100);
    goldLayer.transform.position.setValueAtTime(0.5, [540, 960]);
    goldLayer.transform.position.setValueAtTime(1.1, [540, 920]);

    // Features Checklist
    var f1 = comp.layers.addText("✦ 100% DETERMINISTIC KINEMATICS");
    f1.name = "Feature 1";
    f1.transform.position.setValue([540, 1140]);
    f1.transform.opacity.setValueAtTime(1.0, 0);
    f1.transform.opacity.setValueAtTime(1.4, 100);

    var f2 = comp.layers.addText("✦ MULTI-AGENT SWARM ORCHESTRATION");
    f2.name = "Feature 2";
    f2.transform.position.setValue([540, 1220]);
    f2.transform.opacity.setValueAtTime(1.3, 0);
    f2.transform.opacity.setValueAtTime(1.7, 100);

    var f3 = comp.layers.addText("✦ NATIVE AFTER EFFECTS COMPILATION");
    f3.name = "Feature 3";
    f3.transform.position.setValue([540, 1300]);
    f3.transform.opacity.setValueAtTime(1.6, 0);
    f3.transform.opacity.setValueAtTime(2.0, 100);

    // Texto del Botón CTA
    var ctaTextLayer = comp.layers.addText("GET STARTED NOW ->");
    ctaTextLayer.name = "CTA Button Text";
    ctaTextLayer.transform.position.setValue([540, 1555]);
    ctaTextLayer.transform.scale.setValueAtTime(0, [0, 0]);
    ctaTextLayer.transform.scale.setValueAtTime(1.8, [100, 100]);
    ctaTextLayer.transform.scale.expression = ${bounceCode};

    // =======================================================================
    // 6. APERTURA DIRECTA EN EL VISOR DE AFTER EFFECTS
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
  console.log(`   ✔ Archivo JSX de alta producción creado -> ${jsxFilePath}`);

  // 4. Generar paquete social multi-aspecto (9:16, 16:9, 1:1)
  console.log("4️⃣ Generando paquete de distribución multi-aspecto (TikTok, YouTube, IG)...");
  const delivery = MotionEngine.deliverSocialPackage(comp, "cyberpunk_launch", "rev_1", {
    targetAspectRatios: ["9:16", "16:9", "1:1"],
    thumbnailCount: 3,
  });

  const manifestPath = path.join(outputDir, "PlatformManifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(delivery.manifest, null, 2), "utf-8");
  console.log(`   ✔ Manifiesto Social guardado -> ${manifestPath}`);

  console.log("\n========================================================");
  console.log("🎉 ¡PIEZA COMERCIAL LISTA PARA ABRIR EN AFTER EFFECTS!");
  console.log("========================================================\n");
}

createProCommercialShowcase().catch(console.error);
