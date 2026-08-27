import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";
import { CLIRunner } from "../cli/CLIRunner.js";

async function generateGuadalajaraTurrazoMacroEdit() {
  console.log("\n==========================================================================");
  console.log("🎬 GENERANDO MACRO-EDIT DE 78 VIDEOS + 'TURRAZO.WAV' EN AFTER EFFECTS");
  console.log("   • Audio Master: D:/Documentos/Rolitas/turrazo.wav (220.8s)");
  console.log("   • Blindaje total: app.newProject(), null checks y try/catch en efectos");
  console.log("   • Efectos 'Texto Detrás del Sujeto' en 20230620_212618, 20230620_224844, 20230620_231413");
  console.log("   • Efecto 'Detrás -> Fast Blur 2s -> Delante' en 20230621_001126");
  console.log("==========================================================================\n");

  const outputDir = path.resolve("./dist/guadalajara_turrazo");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoDir = "E:/Respaldo/Guadalajara junio 23-20231019T123606Z-001/Guadalajara junio 23";
  const audioFilePath = "D:/Documentos/Rolitas/turrazo.wav";
  const compDuration = 220.8;

  // Obtener la lista completa de archivos MP4 válidos (>100KB)
  const allMp4s = fs.readdirSync(videoDir)
    .filter(f => f.endsWith(".mp4") && fs.statSync(path.join(videoDir, f)).size > 100000)
    .sort();

  console.log(`📁 Total de videos válidos detectados: ${allMp4s.length}`);

  // Clasificación temática de los clips
  const concertFileNames = [
    "20230620_205928.mp4",
    "20230620_210100.mp4",
    "20230620_210856.mp4",
    "20230620_212618.mp4", // Key video 1 (Behind text)
    "20230620_221318.mp4",
    "20230620_224844.mp4", // Key video 2 (Behind text)
    "20230620_231413.mp4", // Key video 3 (Behind text)
    "20230621_001126.mp4"  // Key video 4 (Behind -> Fast Blur -> Front)
  ].filter(f => allMp4s.includes(f));

  const dayNatureFiles = allMp4s.filter(f => !concertFileNames.includes(f));
  console.log(`🌿 Clips de Día / Naturaleza / Fauna: ${dayNatureFiles.length}`);
  console.log(`🎸 Clips de Concierto / Noche: ${concertFileNames.length}`);

  // Secuencia curada de los videos
  const orderedVideos = [...dayNatureFiles, ...concertFileNames];

  // Frases y palabras editoriales para los clips
  const phrases = [
    // Acto I: Naturaleza & Safari
    "GUADALAJARA 2023", "INSTINTO PURO", "VIDA SALVAJE", "MIRADA FELINA", "FUERZA NATURAL",
    "TIERRA DE GIGANTES", "REFLEJO ANCESTRAL", "LIBERTAD TOTAL", "EN SU HÁBITAT", "MAJESTUOSO",
    "ALAS AL VIENTO", "COLORES VIVOS", "RESPIRO PROFUNDO", "NATURALEZA VIVA", "FAUNA REAL",
    "EL REINO SALVAJE", "EN CADA RINCÓN", "SILENCIO Y PODER", "PASOS FIRMES", "SABIDURÍA ANIMAL",
    "SINFONÍA VERDE", "ORIGEN PRIMAL", "SERES ÚNICOS", "BELLEZA CRUDA", "INSTANTES ETERNOS",
    "EXPLORA", "DESCUBRE", "CONECTA", "VIVE", "SIENTE",
    "EL PULSO DE LA TIERRA", "SIN ATADURAS", "LUZ NATURAL", "HORIZONTES", "DESTINO SALVAJE",

    // Acto II: Aventura & Ciudad
    "CAMINOS ABIERTOS", "RUMBO AL ATARDECER", "ESPÍRITU VIAJERO", "CIUDAD DE LUZ", "AVENTURA TOTAL",
    "MEMORIAS DE VERANO", "UN DÍA INOLVIDABLE", "RISA Y AMIGOS", "HISTORIAS VIVAS", "HORA DORADA",
    "CALLES CON ALMA", "VIBRA MEXICANA", "CORAZÓN TAPATÍO", "EN MOVIMIENTO", "TIEMPO DE VOLAR",
    "SIN PRISA", "PASO A PASO", "VISTA PANORÁMICA", "ENERGÍA PURA", "CADA SEGUNDO CUENTA",
    "VIBRACIÓN ALTA", "SOL DE JUNIO", "NUNCA PARES", "HACIA LA NOCHE", "EL VIAJE COMIENZA",
    "LA CIUDAD DESPIERTA", "LLEGA LA FIESTA", "EXPECTATIVA", "PREPÁRATE", "LA NOCHE CAE",
    "CAOS HERMOSO", "BAJO LAS ESTRELLAS", "RUMBO AL ESCENARIO", "AQUÍ EMPIEZA TODO",

    // Acto III & IV: Concierto, Depth 3D & Clímax
    "LA NOCHE ES NUESTRA",
    "SUBE EL VOLUMEN",
    "FUEGO EN LA TARIMA",
    "EUFORIA COLECTIVA",      // 20230620_212618 (Detrás del sujeto)
    "MILES CANTANDO",
    "RETUMBA EL PECHO",       // 20230620_224844 (Detrás del sujeto)
    "ALMAS CONECTADAS",       // 20230620_231413 (Detrás del sujeto)
    "DESENFOQUE // ETERNIDAD" // 20230621_001126 (Detrás -> Fast Blur -> Delante)
  ];

  let currentStartTime = 0;
  const clipTimings: Array<{
    fileName: string;
    inTime: number;
    outTime: number;
    duration: number;
    phrase: string;
    isBehind: boolean;
    isBlurShift: boolean;
    fontIndex: number;
    colorIndex: number;
    effectIndex: number;
  }> = [];

  for (let i = 0; i < orderedVideos.length; i++) {
    const f = orderedVideos[i];
    let dur = 2.4;

    const isBehind = (f === "20230620_212618.mp4" || f === "20230620_224844.mp4" || f === "20230620_231413.mp4");
    const isBlurShift = (f === "20230621_001126.mp4");

    if (isBehind || isBlurShift) {
      dur = 4.4;
    } else if (i < 30) {
      dur = 2.4;
    } else if (i < 60) {
      dur = 2.2;
    } else {
      dur = 3.0;
    }

    const inTime = currentStartTime;
    const outTime = Math.min(inTime + dur, compDuration);
    currentStartTime = outTime;

    clipTimings.push({
      fileName: f,
      inTime,
      outTime,
      duration: outTime - inTime,
      phrase: phrases[i] || `MOMENTO #${i + 1}`,
      isBehind,
      isBlurShift,
      fontIndex: i % 6,
      colorIndex: i % 3,
      effectIndex: i % 5,
    });

    if (currentStartTime >= compDuration) break;
  }

  if (clipTimings.length > 0) {
    clipTimings[clipTimings.length - 1].outTime = compDuration;
    clipTimings[clipTimings.length - 1].duration = compDuration - clipTimings[clipTimings.length - 1].inTime;
  }

  const bounceCode = JSON.stringify(AEBridgeManager.expressions.inertiaBounce(0.03, 8.0, 4.5));

  const fullExtendScript = `/**
 * =======================================================================
 * MOTION GRAPHICS ENGINE v3.0 — GUADALAJARA MASTER EDIT (78 CLIPS)
 * Audio Master: "${audioFilePath}" (220.8s)
 * Video Source Dir: "${videoDir}"
 * =======================================================================
 */

(function() {
  try {
    // 🛡️ BLINDAJE 1: CREAR PROYECTO SI ESTÁ EN LA PANTALLA DE INICIO
    var project = app.project;
    if (!project) {
      project = app.newProject();
    }

    app.beginUndoGroup("Guadalajara 78 Clips Turrazo Master Edit");

    var compWidth = 1080;
    var compHeight = 1920;
    var compDuration = ${compDuration};
    var compFps = 60.0;

    var comp = project.items.addComp("GUADALAJARA_TURRAZO_MASTER_EDIT", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.02, 0.02, 0.03];
    comp.motionBlur = true;

    // 🎵 1. IMPORTAR PISTA DE AUDIO MASTER 'TURRAZO.WAV'
    var audioFile = new File("${audioFilePath}");
    if (audioFile.exists) {
      try {
        var audioImport = new ImportOptions(audioFile);
        var audioFootage = project.importFile(audioImport);
        if (audioFootage) {
          var audioLayer = comp.layers.add(audioFootage);
          audioLayer.name = "TURRAZO_AUDIO_MASTER";
          audioLayer.inPoint = 0;
          audioLayer.outPoint = compDuration;
        }
      } catch(ae) {}
    }

    // 🎨 PALETA DE COLORES OFICIAL (Rojo, Blanco, Amarillo)
    var COLORS = [
      [1.0, 0.08, 0.14], // 0: Rojo Carmesí #FF1424
      [0.98, 0.98, 0.98], // 1: Blanco Puro #FAFAFA
      [1.0, 0.78, 0.10]  // 2: Amarillo / Oro Neón #FFC71A
    ];

    var FONTS = ["Impact", "Arial-Black", "Haettenschweiler", "Anton", "TrebuchetMS-Bold", "SegoeUI-Black"];

    // Helper para crear texto responsivo con efectos de entrada dinámicos
    function createDynamicClipText(comp, name, text, targetSize, color, pos, inTime, outTime, fontName, effectType) {
      try {
        var layer = comp.layers.addText(text);
        layer.name = name;
        layer.motionBlur = true;
        layer.inPoint = inTime;
        layer.outPoint = outTime;

        var textProp = layer.property("Source Text");
        var textDoc = textProp.value;

        var maxSafeWidth = 900;
        var charCount = text.length;
        var calculatedSize = targetSize;
        var estimatedWidth = charCount * (targetSize * 0.55);
        if (estimatedWidth > maxSafeWidth) {
          calculatedSize = Math.floor(maxSafeWidth / (charCount * 0.55));
        }
        calculatedSize = Math.max(calculatedSize, 45);

        textDoc.fontSize = calculatedSize;
        textDoc.fillColor = color;
        textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
        textDoc.tracking = -10;

        try {
          textDoc.font = fontName;
        } catch(e) {
          textDoc.font = "Impact";
        }

        textProp.setValue(textDoc);
        layer.transform.position.setValue(pos);

        // Efectos de entrada rotativos
        if (effectType === 0) {
          layer.transform.scale.setValueAtTime(inTime, [160, 220]);
          layer.transform.scale.setValueAtTime(inTime + 0.18, [100, 135]);
          layer.transform.scale.expression = ${bounceCode};
        } else if (effectType === 1) {
          layer.transform.position.setValueAtTime(inTime, [pos[0], pos[1] + 100]);
          layer.transform.position.setValueAtTime(inTime + 0.20, pos);
          layer.transform.position.expression = ${bounceCode};
        } else if (effectType === 2) {
          layer.transform.position.setValueAtTime(inTime, [pos[0] - 180, pos[1]]);
          layer.transform.position.setValueAtTime(inTime + 0.20, pos);
          layer.transform.position.expression = ${bounceCode};
        } else if (effectType === 3) {
          layer.transform.position.setValueAtTime(inTime, [pos[0] + 180, pos[1]]);
          layer.transform.position.setValueAtTime(inTime + 0.20, pos);
          layer.transform.position.expression = ${bounceCode};
        } else {
          layer.transform.scale.setValueAtTime(inTime, [70, 70]);
          layer.transform.scale.setValueAtTime(inTime + 0.18, [100, 125]);
          layer.transform.scale.expression = ${bounceCode};
        }

        layer.transform.opacity.setValueAtTime(inTime, 100);
        layer.transform.opacity.setValueAtTime(outTime - 0.12, 100);
        layer.transform.opacity.setValueAtTime(outTime, 0);

        return layer;
      } catch(te) {
        return null;
      }
    }

    // Helper blindado para importar y escalar video
    function importAndFitVideo(comp, filePath, inTime, outTime, name) {
      try {
        var file = new File(filePath);
        if (!file.exists) return null;
        var imp = new ImportOptions(file);
        var foot = project.importFile(imp);
        if (!foot) return null;

        var layer = comp.layers.add(foot);
        if (!layer) return null;

        layer.name = name || file.name;
        layer.motionBlur = true;
        layer.inPoint = inTime;
        layer.outPoint = outTime;
        layer.startTime = inTime;

        layer.transform.anchorPoint.setValue([foot.width / 2, foot.height / 2]);
        layer.transform.position.setValue([compWidth / 2, compHeight / 2]);

        var scaleX = (compWidth / foot.width) * 100;
        var scaleY = (compHeight / foot.height) * 100;
        var coverScale = Math.max(scaleX, scaleY) * 1.02;
        layer.transform.scale.setValue([coverScale, coverScale]);

        return { layer: layer, footage: foot, coverScale: coverScale };
      } catch(ve) {
        return null;
      }
    }

    // =======================================================================
    // 🎥 2. MONTAJE DE LOS CLIPS CON EFECTOS ESPECIALES
    // =======================================================================
    var baseDir = "${videoDir}/";
    var clipsData = ${JSON.stringify(clipTimings)};

    for (var c = 0; c < clipsData.length; c++) {
      var item = clipsData[c];
      var videoPath = baseDir + item.fileName;
      var col = COLORS[item.colorIndex];
      var font = FONTS[item.fontIndex];

      if (item.isBlurShift) {
        // ===================================================================
        // 🌟 CASO ESPECIAL: 20230621_001126.mp4 (Detrás -> Fast Blur -> Delante)
        // ===================================================================
        var midTime = item.inTime + 2.0;

        // 1. Video Base
        var vf = importAndFitVideo(comp, videoPath, item.inTime, item.outTime, "Base_Video_" + item.fileName);
        if (vf && vf.layer) {
          try {
            var blurFX = vf.layer.property("Effects").addProperty("ADBE Fast Blur");
            if (blurFX) {
              blurFX.property("Blurriness").setValueAtTime(item.inTime, 0);
              blurFX.property("Blurriness").setValueAtTime(midTime - 0.1, 0);
              blurFX.property("Blurriness").setValueAtTime(midTime + 0.3, 35);
              blurFX.property("Repeat Edge Pixels").setValue(true);
            }
          } catch(e) {}
        }

        // 2. Texto DETRÁS (0 a 2s)
        createDynamicClipText(
          comp,
          "Behind_Text_" + item.fileName,
          "ETERNIDAD NOCTURNA",
          140,
          COLORS[0],
          [540, 680],
          item.inTime,
          midTime,
          FONTS[0],
          0
        );

        // 3. Sujeto por delante (0 a 2s mediante Luma/Extract)
        var fgLayer = importAndFitVideo(comp, videoPath, item.inTime, midTime, "Foreground_Subject_" + item.fileName);
        if (fgLayer && fgLayer.layer) {
          try {
            var ext = fgLayer.layer.property("Effects").addProperty("ADBE Extract");
            if (ext) {
              ext.property("Black Point").setValue(50);
              ext.property("White Point").setValue(200);
            }
          } catch(e) {}
        }

        // 4. Texto DELANTE (2s a 4.4s sobre el video desenfocado)
        createDynamicClipText(
          comp,
          "Front_Text_" + item.fileName,
          "EL CLÍMAX DE GUADALAJARA",
          130,
          COLORS[2],
          [540, 720],
          midTime,
          item.outTime,
          FONTS[1],
          1
        );

      } else if (item.isBehind) {
        // ===================================================================
        // 🌟 CASO ESPECIAL: TEXTO DETRÁS DEL SUJETO (20230620_212618, 224844, 231413)
        // ===================================================================
        importAndFitVideo(comp, videoPath, item.inTime, item.outTime, "Base_Video_" + item.fileName);

        createDynamicClipText(
          comp,
          "Behind_Text_" + item.fileName,
          item.phrase,
          150,
          col,
          [540, 680],
          item.inTime,
          item.outTime,
          font,
          item.effectIndex
        );

        var fg = importAndFitVideo(comp, videoPath, item.inTime, item.outTime, "Foreground_Subject_" + item.fileName);
        if (fg && fg.layer) {
          try {
            var ext2 = fg.layer.property("Effects").addProperty("ADBE Extract");
            if (ext2) {
              ext2.property("Black Point").setValue(45);
              ext2.property("White Point").setValue(190);
            }
          } catch(e) {}
        }

      } else {
        // ===================================================================
        // 🌿 CASO ESTÁNDAR: VIDEO + TEXTO DINÁMICO AUTO-FIT
        // ===================================================================
        importAndFitVideo(comp, videoPath, item.inTime, item.outTime, "Clip_" + (c + 1) + "_" + item.fileName);

        createDynamicClipText(
          comp,
          "Text_" + (c + 1) + "_" + item.fileName,
          item.phrase,
          135,
          col,
          [540, 640],
          item.inTime,
          item.outTime,
          font,
          item.effectIndex
        );
      }
    }

    // =======================================================================
    // 🌌 3. CAPA DE GRADACIÓN DE CONTRASTE CINEMÁTICO
    // =======================================================================
    var darkOverlay = comp.layers.addSolid([0.02, 0.02, 0.04], "Cinematic_Contrast_Overlay", compWidth, compHeight, 1.0, compDuration);
    darkOverlay.transform.opacity.setValue(32);

    // =======================================================================
    // 📊 4. HUD AUDIO SPECTRUM (32 Barras)
    // =======================================================================
    var eqLayer = comp.layers.addShape();
    eqLayer.name = "HUD_Equalizer_Bars";
    eqLayer.inPoint = 0.5;
    eqLayer.outPoint = compDuration - 0.5;
    var eqGroup = eqLayer.property("Contents").addProperty("ADBE Vector Group");
    var eqContents = eqGroup.property("Contents");
    var barRect = eqContents.addProperty("ADBE Vector Shape - Rect");
    barRect.property("Size").setValue([10, 45]);
    barRect.property("Roundness").setValue(3);
    var barFill = eqContents.addProperty("ADBE Vector Graphic - Fill");
    barFill.property("Color").setValue([1.0, 0.08, 0.14]);
    var barRepeater = eqContents.addProperty("ADBE Vector Filter - Repeater");
    barRepeater.property("Copies").setValue(28);
    barRepeater.property("Transform").property("Position").setValue([28, 0]);
    eqLayer.transform.position.setValue([160, 1840]);
    eqLayer.transform.scale.expression = "linear(Math.sin(time * 16), -1, 1, [100, 40], [100, 140])";
    eqLayer.transform.opacity.setValue(50);

    // =======================================================================
    // 📟 5. HUD TIMECODE
    // =======================================================================
    var tcLayer = comp.layers.addText("TURRAZO // 00:00:00:00");
    tcLayer.name = "HUD_Timecode";
    tcLayer.inPoint = 0.2;
    tcLayer.outPoint = compDuration - 0.5;
    var tcProp = tcLayer.property("Source Text");
    var tcDoc = tcProp.value;
    tcDoc.fontSize = 22;
    tcDoc.fillColor = [0.85, 0.88, 0.95];
    tcDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
    tcDoc.tracking = 30;
    tcProp.setValue(tcDoc);
    tcLayer.transform.position.setValue([540, 200]);
    tcProp.expression = "'REC [ ' + timeToTimecode(time) + ' ] // GUADALAJARA 2023'";

    // =======================================================================
    // 6. APERTURA EN EL VISOR DE AFTER EFFECTS
    // =======================================================================
    comp.openInViewer();

  } catch(err) {
    alert("Error en script de Macro-Edit Guadalajara: " + err.toString());
  } finally {
    try {
      app.endUndoGroup();
    } catch(ue) {}
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "Guadalajara_Turrazo_Master_Edit.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX blindado generado -> ${jsxFilePath}`);

  const compObj = MotionEngine.createComposition({
    id: "guadalajara_turrazo_comp",
    name: "GUADALAJARA_TURRAZO_MASTER_EDIT",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: compDuration,
  });

  MotionEngine.deliverSocialPackage(compObj, "proj_guadalajara", "rev_1");
  await CLIRunner.run(["node", "bin", "validate", "guadalajara.json"]);
  await CLIRunner.run(["node", "bin", "qa", "guadalajara.json", "--threshold", "0.85"]);

  console.log("\n==========================================================================");
  console.log("🎉 ¡PROYECTO BLINDADO LISTO PARA ABRIR EN AFTER EFFECTS!");
  console.log("==========================================================================\n");
}

generateGuadalajaraTurrazoMacroEdit().catch(console.error);
