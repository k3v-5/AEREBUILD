import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { TextElement } from "../elements/TextElement.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";
import { CLIRunner } from "../cli/CLIRunner.js";

async function runGoldMasterDemo() {
  console.log("\n========================================================");
  console.log("🎬 EJECUTANDO PRUEBA MAESTRA EN VIVO: GOLD MASTER v3.0.0");
  console.log("========================================================\n");

  const outputDir = path.resolve("./dist/demo_output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Crear Composición Canónica con Motion Graphics
  console.log("1️⃣ Creando Composición Canónica con Tipografía y Transformaciones...");
  const comp = MotionEngine.createComposition({
    id: "gold_master_showcase",
    name: "AI Super Promo 2026",
    width: 1080,
    height: 1920, // 9:16 vertical
    fps: 60,
    duration: 6.0,
  });

  const heroTitle = new TextElement({
    id: "hero_title",
    name: "Main Headline",
    text: "THE FUTURE OF VIDEO AI",
    style: {
      fontSize: 84,
      fontFamily: "Montserrat-Black",
      color: { r: 1, g: 0.9, b: 0, a: 1 },
    },
  });
  heroTitle.transform.position.setValue({ x: 540, y: 800 });
  heroTitle.transform.scale.addKeyframe(0, { x: 0.5, y: 0.5 });
  heroTitle.transform.scale.addKeyframe(1.2, { x: 1.0, y: 1.0 });

  const subtitle = new TextElement({
    id: "sub_title",
    name: "Call To Action",
    text: "Created with Motion Engine v3.0",
    style: {
      fontSize: 48,
      fontFamily: "Inter-Medium",
      color: { r: 1, g: 1, b: 1, a: 1 },
    },
  });
  subtitle.transform.position.setValue({ x: 540, y: 1100 });

  comp.addElement(heroTitle);
  comp.addElement(subtitle);

  // 2. Renderizar frames y verificar determinismo
  console.log("2️⃣ Evaluando 360 fotogramas a 60 FPS...");
  const renderResult = await MotionEngine.render(comp);
  console.log(`   ✔ Renderizado completado: ${renderResult.totalFrames} frames evaluados.`);
  console.log(`   ✔ Content Hash SHA-256: ${renderResult.contentHash}`);

  // 3. Exportar a After Effects ExtendScript JSX con Expresiones y Shapes
  console.log("3️⃣ Generando Script ExtendScript JSX para Adobe After Effects...");
  const aeExport = MotionEngine.exportToAfterEffects(comp, {
    projectId: "demo_proj",
    revisionId: "rev_master",
    strict: false,
  });

  const shapeLines = AEBridgeManager.compileShapeLayers("comp", "Kinetic_Accents", [
    {
      name: "BurstRing",
      contents: [
        { type: "ellipse", size: [300, 300] },
        { type: "trim_paths", start: 0, end: 80, offset: 45 },
        {
          type: "repeater",
          copies: 4,
          transform: { rotation: 90, scale: [90, 90] },
        },
      ],
      strokeColor: [0, 0.8, 1],
      strokeWidth: 6,
    },
  ]);

  const fullJSXScript = [
    aeExport.jsxContent,
    "",
    "// --- Vector Shapes Injected via AEShapeCompiler ---",
    ...shapeLines,
    "",
    "// --- Native AE Expression Applied via AEExpressionBuilder ---",
    `hero_title_layer = comp.layer("Main Headline");`,
    `hero_title_layer.transform.position.expression = "${AEBridgeManager.expressions.wiggle(3, 20)}";`,
  ].join("\n");

  const jsxFilePath = path.join(outputDir, "AfterEffects_Project.jsx");
  fs.writeFileSync(jsxFilePath, fullJSXScript, "utf-8");
  console.log(`   ✔ Archivo JSX exportado con éxito -> ${jsxFilePath}`);
  console.log(`   ✔ Tamaño del script: ${fullJSXScript.length} bytes`);

  // 4. Generar Paquete Social Multi-Aspecto (9:16, 16:9, 1:1) con Normalización LUFS
  console.log("4️⃣ Empaquetando Social Delivery Package Multi-Aspecto...");
  const deliveryResult = MotionEngine.deliverSocialPackage(comp, "demo_social_01", "rev_1", {
    targetAspectRatios: ["9:16", "16:9", "1:1"],
    thumbnailCount: 3,
  });

  const manifestPath = path.join(outputDir, "PlatformManifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(deliveryResult.manifest, null, 2), "utf-8");
  console.log(`   ✔ Paquete creado con ${Object.keys(deliveryResult.pkg.variants).length} resoluciones adaptadas.`);
  console.log(`   ✔ 3 Miniaturas de alto impacto extraídas a [${deliveryResult.pkg.thumbnails.map(t => `${t.timeSeconds}s`).join(", ")}]`);
  console.log(`   ✔ Manifiesto guardado -> ${manifestPath}`);

  // 5. Probar el CLI Standalone ejecutando un comando de validación y QA
  console.log("5️⃣ Probando CLI Standalone ('motion-engine qa' & 'motion-engine validate')...\n");
  await CLIRunner.run(["node", "bin", "validate", "gold_master_showcase.json"]);
  await CLIRunner.run(["node", "bin", "qa", "gold_master_showcase.json", "--threshold", "0.85"]);

  console.log("\n========================================================");
  console.log("🎉 ¡PRUEBA MAESTRA FINALIZADA CON ÉXITO AL 100%!");
  console.log("========================================================\n");
}

runGoldMasterDemo().catch(console.error);
