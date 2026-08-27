import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";

async function generateTikTokViralMasterpiece() {
  console.log("\n========================================================");
  console.log("🔥 GENERANDO PRODUCCIÓN TIKTOK / REELS VIRAL DE ALTA GAMA");
  console.log("========================================================\n");

  const outputDir = path.resolve("./dist/tiktok_viral");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const comp = MotionEngine.createComposition({
    id: "tiktok_viral_comp",
    name: "TIKTOK_VIRAL_MASTERPIECE",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: 8.0,
  });

  const bounceCode = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.06, 5.5, 3.2));
  const wiggleCode = JSON.stringify(AEBridgeManager.expressions.wiggle(2.0, 15));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — ULTRA HIGH-RETENTION TIKTOK / REELS AD
 * Multi-Scene Dynamic Story: Hook (0-2.5s) -> Tech Reveal (2.5-5.5s) -> CTA (5.5-8.0s)
 * Full Safe-Zone Compliance, Animated EQ Bars, Hormozi-Style Boxes & Clicks
 * =======================================================================
 */

(function() {
  app.beginUndoGroup("Create TikTok High-End Viral Production");

  try {
    var project = app.project;
    var comp = project.items.addComp("TIKTOK_VIRAL_PROMO", 1080, 1920, 1.0, 8.0, 60.0);
    comp.bgColor = [0.04, 0.05, 0.09]; // Deep Tech Slate

    // Helper para crear texto centrado con propiedades avanzadas
    function createText(comp, name, text, fontSize, color, pos, startTime, outTime) {
      var layer = comp.layers.addText(text);
      layer.name = name;
      var textProp = layer.property("Source Text");
      var textDoc = textProp.value;
      textDoc.fontSize = fontSize;
      textDoc.fillColor = color;
      textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
      textProp.setValue(textDoc);
      layer.transform.position.setValue(pos);
      if (startTime !== undefined) layer.inPoint = startTime;
      if (outTime !== undefined) layer.outPoint = outTime;
      return layer;
    }

    // =======================================================================
    // 0. FONDO AMBIENTAL: LUZ PULSANTE & REJILLA
    // =======================================================================
    var bgGlow = comp.layers.addSolid([0.10, 0.03, 0.25], "Background_Ambient_Glow", 1080, 1920, 1.0, 8.0);
    bgGlow.transform.opacity.setValue(55);
    bgGlow.transform.scale.expression = "linear(Math.sin(time * 3), -1, 1, [100, 100], [125, 125])";

    // =======================================================================
    // 🎬 ESCENA 1: EL GANCHO / THE HOOK (0.0s - 2.5s)
    // =======================================================================

    // 1.1 Shockwave Ring en t = 0
    var shockwave = comp.layers.addShape();
    shockwave.name = "Scene1_Shockwave";
    shockwave.inPoint = 0.0;
    shockwave.outPoint = 1.8;
    var swGroup = shockwave.property("Contents").addProperty("ADBE Vector Group");
    var swCircle = swGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    swCircle.property("Size").setValue([400, 400]);
    var swStroke = swGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    swStroke.property("Color").setValue([1.0, 0.25, 0.0]); // Hot Orange/Red
    swStroke.property("Stroke Width").setValue(8.0);
    shockwave.transform.position.setValue([540, 800]);
    shockwave.transform.scale.setValueAtTime(0.0, [0, 0]);
    shockwave.transform.scale.setValueAtTime(0.8, [320, 320]);
    shockwave.transform.opacity.setValueAtTime(0.0, 100);
    shockwave.transform.opacity.setValueAtTime(0.8, 0);

    // 1.2 Badge Superior: "🚨 STOP SCROLLING"
    var hookBadge = createText(
      comp,
      "Hook_Badge",
      "🚨 STOP DOING THIS IN 2026",
      34,
      [1.0, 0.3, 0.2], // Neon Coral Red
      [540, 480],
      0.0,
      2.5
    );
    hookBadge.transform.scale.setValueAtTime(0.0, [0, 0]);
    hookBadge.transform.scale.setValueAtTime(0.3, [100, 100]);
    hookBadge.transform.scale.expression = ${bounceCode};

    // 1.3 Titular Grande Hook: "CODING VIDEO"
    var hookTitle1 = createText(
      comp,
      "Hook_Title_1",
      "CODING VIDEO",
      96,
      [1.0, 1.0, 1.0],
      [540, 700],
      0.1,
      2.5
    );
    hookTitle1.transform.scale.setValueAtTime(0.1, [180, 180]);
    hookTitle1.transform.scale.setValueAtTime(0.4, [100, 100]);
    hookTitle1.transform.scale.expression = ${bounceCode};

    // 1.4 Caja de Resalte Hormozi Style (Yellow Box detrás de "MANUALLY")
    var yellowBox = comp.layers.addShape();
    yellowBox.name = "Hook_Highlight_Box";
    yellowBox.inPoint = 0.3;
    yellowBox.outPoint = 2.5;
    var ybGroup = yellowBox.property("Contents").addProperty("ADBE Vector Group");
    var ybRect = ybGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    ybRect.property("Size").setValue([680, 130]);
    ybRect.property("Roundness").setValue(24);
    var ybFill = ybGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    ybFill.property("Color").setValue([1.0, 0.85, 0.0]); // Bright Yellow
    yellowBox.transform.position.setValue([540, 840]);
    yellowBox.transform.scale.setValueAtTime(0.3, [0, 0]);
    yellowBox.transform.scale.setValueAtTime(0.6, [100, 100]);
    yellowBox.transform.scale.expression = ${bounceCode};

    // 1.5 Texto dentro de la caja amarilla: "BY HAND ❌"
    var hookTitle2 = createText(
      comp,
      "Hook_Title_2",
      "BY HAND ❌",
      90,
      [0.05, 0.05, 0.08], // Dark Charcoal Text
      [540, 840],
      0.35,
      2.5
    );

    // 1.6 Subtítulo del Hook
    var hookSub = createText(
      comp,
      "Hook_Subtitle",
      "Watch how AI generates this in 1-click 👇",
      38,
      [0.85, 0.9, 1.0],
      [540, 1020],
      0.6,
      2.5
    );
    hookSub.transform.opacity.setValueAtTime(0.6, 0);
    hookSub.transform.opacity.setValueAtTime(0.9, 100);

    // =======================================================================
    // 🎬 ESCENA 2: LA SOLUCIÓN & ENGINE TECH CARD (2.5s - 5.5s)
    // =======================================================================

    // 2.1 Tarjeta Glassmorphism Contenedora
    var techCard = comp.layers.addShape();
    techCard.name = "Scene2_Glass_Card";
    techCard.inPoint = 2.5;
    techCard.outPoint = 5.5;
    var tcGroup = techCard.property("Contents").addProperty("ADBE Vector Group");
    var tcRect = tcGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    tcRect.property("Size").setValue([920, 820]);
    tcRect.property("Roundness").setValue(40);
    var tcFill = tcGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    tcFill.property("Color").setValue([0.08, 0.10, 0.18]); // Glass Dark Fill
    var tcStroke = tcGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    tcStroke.property("Color").setValue([0.0, 0.95, 1.0]); // Neon Cyan Border
    tcStroke.property("Stroke Width").setValue(3.0);
    techCard.transform.position.setValue([540, 860]);
    techCard.transform.scale.setValueAtTime(2.5, [70, 70]);
    techCard.transform.scale.setValueAtTime(2.9, [100, 100]);
    techCard.transform.scale.expression = ${bounceCode};

    // 2.2 Cabecera de la Tarjeta
    var s2Header = createText(
      comp,
      "Scene2_Header",
      "⚡ MOTION ENGINE v3.0",
      54,
      [0.0, 0.95, 1.0],
      [540, 560],
      2.6,
      5.5
    );

    // 2.3 Métricas con Checkmarks Verdes
    var m1 = createText(
      comp,
      "Metric_1",
      "✔ 100% BIT-FOR-BIT DETERMINISM",
      36,
      [1.0, 1.0, 1.0],
      [540, 680],
      2.8,
      5.5
    );
    var m2 = createText(
      comp,
      "Metric_2",
      "✔ DISTRIBUTED MULTI-AGENT SWARM",
      36,
      [1.0, 1.0, 1.0],
      [540, 760],
      3.1,
      5.5
    );
    var m3 = createText(
      comp,
      "Metric_3",
      "✔ SOCIAL MULTI-ASPECT EXPORT",
      36,
      [1.0, 1.0, 1.0],
      [540, 840],
      3.4,
      5.5
    );

    // 2.4 BARRAS ECUALIZADORAS DE AUDIO ANIMADAS (Waveform Audio Visualizer)
    for (var b = 0; b < 11; b++) {
      var bar = comp.layers.addShape();
      bar.name = "Audio_Wave_Bar_" + (b + 1);
      bar.inPoint = 2.5;
      bar.outPoint = 5.5;
      var bGroup = bar.property("Contents").addProperty("ADBE Vector Group");
      var bRect = bGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
      bRect.property("Size").setValue([16, 120]);
      bRect.property("Roundness").setValue(8);
      var bFill = bGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
      bFill.property("Color").setValue([0.0, 0.95, 1.0]); // Neon Cyan
      var posX = 540 + (b - 5) * 36;
      bar.transform.position.setValue([posX, 1060]);
      // Expresión de pulso rítmico individual para cada barra
      var speed = 12 + (b % 3) * 4;
      var phase = b * 0.6;
      bar.transform.scale.expression = "var s = linear(Math.abs(Math.sin(time * " + speed + " + " + phase + ")), 0, 1, 20, 100); [100, s];";
    }

    // =======================================================================
    // 🎬 ESCENA 3: LLAMADA A LA ACCIÓN / THE CTA (5.5s - 8.0s)
    // =======================================================================

    // 3.1 Radar Orbit Reticle en Escena 3
    var radarS3 = comp.layers.addShape();
    radarS3.name = "Scene3_Radar_Reticle";
    radarS3.inPoint = 5.5;
    radarS3.outPoint = 8.0;
    var rGroup = radarS3.property("Contents").addProperty("ADBE Vector Group");
    var rCirc = rGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    rCirc.property("Size").setValue([780, 780]);
    var rTrim = rGroup.property("Contents").addProperty("ADBE Vector Filter - Trim");
    rTrim.property("Start").setValue(10);
    rTrim.property("End").setValue(75);
    rTrim.property("Offset").expression = "time * 60";
    var rStroke = rGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    rStroke.property("Color").setValue([1.0, 0.0, 0.6]); // Hot Neon Pink
    rStroke.property("Stroke Width").setValue(3.0);
    var rRep = rGroup.property("Contents").addProperty("ADBE Vector Filter - Repeater");
    rRep.property("Copies").setValue(3);
    rRep.property("Transform").property("Rotation").setValue(120);
    radarS3.transform.position.setValue([540, 750]);

    // 3.2 Titular de Cierre: "BUILD PRO VIDEOS"
    var s3Title = createText(
      comp,
      "Scene3_Title",
      "BUILD PRO VIDEOS",
      84,
      [1.0, 1.0, 1.0],
      [540, 680],
      5.5,
      8.0
    );
    s3Title.transform.scale.setValueAtTime(5.5, [30, 30]);
    s3Title.transform.scale.setValueAtTime(5.9, [100, 100]);
    s3Title.transform.scale.expression = ${bounceCode};

    // 3.3 Subtítulo de Cierre: "IN SECONDS WITH AI"
    var s3Sub = createText(
      comp,
      "Scene3_Subtitle",
      "WITH DIRECT AFTER EFFECTS EXPORT",
      40,
      [1.0, 0.85, 0.0], // Gold
      [540, 780],
      5.7,
      8.0
    );

    // 3.4 Botón CTA Gigante Neon Cyan & Magenta
    var ctaPill = comp.layers.addShape();
    ctaPill.name = "Scene3_CTA_Pill";
    ctaPill.inPoint = 5.8;
    ctaPill.outPoint = 8.0;
    var cpGroup = ctaPill.property("Contents").addProperty("ADBE Vector Group");
    var cpRect = cpGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
    cpRect.property("Size").setValue([760, 140]);
    cpRect.property("Roundness").setValue(70);
    var cpFill = cpGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
    cpFill.property("Color").setValue([0.0, 0.95, 1.0]); // Neon Cyan
    ctaPill.transform.position.setValue([540, 1380]);
    ctaPill.transform.scale.setValueAtTime(5.8, [0, 0]);
    ctaPill.transform.scale.setValueAtTime(6.2, [100, 100]);
    ctaPill.transform.scale.expression = "linear(Math.sin(time * 6), -1, 1, [97, 97], [104, 104])"; // Pulsar

    // 3.5 Texto del Botón CTA
    var ctaText = createText(
      comp,
      "Scene3_CTA_Text",
      "TRY ON GITHUB NOW 🚀",
      46,
      [0.03, 0.04, 0.10], // Deep Dark Navy
      [540, 1380],
      5.8,
      8.0
    );
    ctaText.transform.scale.expression = "linear(Math.sin(time * 6), -1, 1, [97, 97], [104, 104])";

    // 3.6 Cursor Animado haciendo Click en el Botón (en t = 6.7s)
    var clickRipple = comp.layers.addShape();
    clickRipple.name = "CTA_Click_Ripple";
    clickRipple.inPoint = 6.6;
    clickRipple.outPoint = 7.6;
    var crGroup = clickRipple.property("Contents").addProperty("ADBE Vector Group");
    var crCircle = crGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
    crCircle.property("Size").setValue([200, 200]);
    var crStroke = crGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
    crStroke.property("Color").setValue([1.0, 1.0, 1.0]);
    crStroke.property("Stroke Width").setValue(5.0);
    clickRipple.transform.position.setValue([540, 1380]);
    clickRipple.transform.scale.setValueAtTime(6.6, [10, 10]);
    clickRipple.transform.scale.setValueAtTime(7.2, [180, 180]);
    clickRipple.transform.opacity.setValueAtTime(6.6, 100);
    clickRipple.transform.opacity.setValueAtTime(7.2, 0);

    // =======================================================================
    // 4. APERTURA AUTOMÁTICA EN VISOR
    // =======================================================================
    comp.openInViewer();

  } catch (err) {
    alert("Error en script de Motion Engine: " + err.toString());
  } finally {
    app.endUndoGroup();
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "TikTok_Viral_Masterpiece.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX de Producción TikTok generado -> ${jsxFilePath}`);

  console.log("\n========================================================");
  console.log("🎉 ¡PRODUCCIÓN TIKTOK DE ALTA GAMA LISTA!");
  console.log("========================================================\n");
}

generateTikTokViralMasterpiece().catch(console.error);
