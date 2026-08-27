import * as fs from "fs";
import * as path from "path";
import { MotionEngine } from "../sdk/MotionEngineSDK.js";
import { AEBridgeManager } from "../exporters/ae/AEBridgeManager.js";
import { CLIRunner } from "../cli/CLIRunner.js";

async function generateGuadalajaraTurrazoAestheticMasterpiece() {
  console.log("\n==========================================================================");
  console.log("🎨 GENERANDO MACRO-EDIT ESTILO EDITORIAL TIKTOK (PAINT BRUSH & MIXED TYPO)");
  console.log("   • CERO ESCENAS EN NEGRO: Time Remapping + Ping-Pong Loop + Overlapping Layers");
  console.log("   • Tipografía Mixta TikTok (Serif Italic + Ultra Bold Sans + Cursiva / Script)");
  console.log("   • Bloques de Pintura / Color Block Brush Reveals (Mint, Crimson, Cream)");
  console.log("   • Audio Master 'turrazo.wav' impecable (clips silenciados al 100%)");
  console.log("==========================================================================\n");

  const outputDir = path.resolve("./dist/guadalajara_turrazo");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const videoDir = "E:/Respaldo/Guadalajara junio 23-20231019T123606Z-001/Guadalajara junio 23";
  const audioFilePath = "D:/Documentos/Rolitas/turrazo.wav";
  const compDuration = 220.8;

  const allMp4s = fs.readdirSync(videoDir)
    .filter(f => f.endsWith(".mp4") && fs.statSync(path.join(videoDir, f)).size > 100000)
    .sort();

  console.log(`📁 Total de videos válidos detectados: ${allMp4s.length}`);

  const concertFileNames = [
    "20230620_205928.mp4",
    "20230620_210100.mp4",
    "20230620_210856.mp4",
    "20230620_212618.mp4",
    "20230620_221318.mp4",
    "20230620_224844.mp4",
    "20230620_231413.mp4",
    "20230621_001126.mp4"
  ].filter(f => allMp4s.includes(f));

  const dayNatureFiles = allMp4s.filter(f => !concertFileNames.includes(f));
  const orderedVideos = [...dayNatureFiles, ...concertFileNames];

  // Datos editoriales mixtos tipo TikTok (Palabra principal, Subtítulo cursivo, Meta tag)
  const editorialPhrases = [
    { title: "SALVAJE", script: "Tierra & Instinto", tag: "FAUNA // 01" },
    { title: "ORIGEN", script: "Mirada Animal", tag: "GUADALAJARA" },
    { title: "LIBRE", script: "Alas al Viento", tag: "NATURALEZA" },
    { title: "REFLEJO", script: "Agua & Sol", tag: "JUNIO 2023" },
    { title: "FUERZA", script: "Espíritu Primal", tag: "HABITAT // 02" },
    { title: "REINO", script: "Pasos Firmes", tag: "EXPEDICIÓN" },
    { title: "PULSO", script: "Latido Verde", tag: "SELVA" },
    { title: "BELLEZA", script: "En Cada Rincón", tag: "MOMENTO" },
    { title: "INSTINTO", script: "Poder Ancestral", tag: "SAFARI // 03" },
    { title: "ETERNO", script: "Luz de Tarde", tag: "EXPLORA" },
    { title: "CAMINOS", script: "Rumbo al Sol", tag: "VIAJE // 04" },
    { title: "AVENTURA", script: "Vibra Mexicana", tag: "TAPATÍO" },
    { title: "HORA ORO", script: "Atardecer de Fuego", tag: "GOLDEN HOUR" },
    { title: "MEMORIA", script: "Días de Verano", tag: "RECUERDOS" },
    { title: "MOVIMIENTO", script: "Sin Mirar Atrás", tag: "NON-STOP" },
    { title: "CIUDAD", script: "Luces de Noche", tag: "URBANO // 05" },
    { title: "FESTIVAL", script: "Escenario Vivo", tag: "CONCIERTO" },
    { title: "EUFORIA", script: "Miles Cantando", tag: "STAGE // 06" },
    { title: "FUEGO", script: "Retumba el Pecho", tag: "TURRAZO" },
    { title: "CLÍMAX", script: "Eternidad Total", tag: "FINAL // 2023" }
  ];

  let currentStartTime = 0;
  const clipTimings: Array<{
    fileName: string;
    inTime: number;
    outTime: number;
    duration: number;
    title: string;
    script: string;
    tag: string;
    isBehind: boolean;
    isBlurShift: boolean;
    hasPaintWipe: boolean;
    styleIndex: number;
    transType: number;
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

    const phraseObj = editorialPhrases[i % editorialPhrases.length];

    clipTimings.push({
      fileName: f,
      inTime,
      outTime,
      duration: outTime - inTime,
      title: phraseObj.title,
      script: phraseObj.script,
      tag: phraseObj.tag,
      isBehind,
      isBlurShift,
      hasPaintWipe: (i % 3 === 0), // Pincelada artística cada 3 clips
      styleIndex: i % 4,
      transType: i % 7,
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
 * MOTION GRAPHICS ENGINE v3.0 — TIKTOK EDITORIAL MASTERPIECE
 * Features:
 *  1. ZERO BLACK SCENES: Time Remapping + Ping-Pong Auto-Loop + Overlap
 *  2. Mixed Editorial Typography (Serif + Ultra Bold Sans + Cursive Script + Tags)
 *  3. Artistic Pastel Paint-Stroke Reveals & Frosted Color Blocks
 *  4. Audio Master: "turrazo.wav" (All raw video audio muted!)
 * =======================================================================
 */

(function() {
  try {
    var project = app.project;
    if (!project) {
      project = app.newProject();
    }

    app.beginUndoGroup("TikTok Editorial Mixed Masterpiece");

    var compWidth = 1080;
    var compHeight = 1920;
    var compDuration = ${compDuration};
    var compFps = 60.0;

    var comp = project.items.addComp("GUADALAJARA_EDITORIAL_MASTERPIECE", compWidth, compHeight, 1.0, compDuration, compFps);
    comp.bgColor = [0.03, 0.03, 0.04];
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
          audioLayer.audioEnabled = true;
          audioLayer.inPoint = 0;
          audioLayer.outPoint = compDuration;
        }
      } catch(ae) {}
    }

    // 🎨 PALETA DE COLORES EDITORIAL TIKTOK (Mint Pastel, Carmesí, Blanco Puro, Oro Cálido)
    var COLOR_CRIMSON = [1.0, 0.08, 0.14]; // #FF1424
    var COLOR_WHITE   = [0.98, 0.98, 0.98]; // #FAFAFA
    var COLOR_MINT    = [0.55, 0.82, 0.74]; // #8CD1BC (Pastel Teal / Mint como la foto)
    var COLOR_GOLD    = [1.0, 0.78, 0.10];  // #FFC71A

    // 🖌️ HELPER: BLOQUE DE PINTURA ARTÍSTICA / COLOR BLOCK REVEAL
    function createPaintBrushWipe(comp, name, inTime, color) {
      try {
        var brushLayer = comp.layers.addShape();
        brushLayer.name = name;
        brushLayer.inPoint = inTime;
        brushLayer.outPoint = inTime + 1.2;
        brushLayer.motionBlur = true;

        var contents = brushLayer.property("Contents");
        var group = contents.addProperty("ADBE Vector Group");
        var groupContents = group.property("Contents");

        // Rectángulo con bordes redondeados y estilo orgánico
        var rect = groupContents.addProperty("ADBE Vector Shape - Rect");
        rect.property("Size").setValue([620, 950]);
        rect.property("Roundness").setValue(28);

        var fill = groupContents.addProperty("ADBE Vector Graphic - Fill");
        fill.property("Color").setValue(color || COLOR_MINT);

        brushLayer.transform.position.setValueAtTime(inTime, [compWidth / 2 - 200, 720]);
        brushLayer.transform.position.setValueAtTime(inTime + 0.35, [compWidth / 2, 720]);
        brushLayer.transform.position.expression = ${bounceCode};

        brushLayer.transform.scale.setValueAtTime(inTime, [20, 100]);
        brushLayer.transform.scale.setValueAtTime(inTime + 0.30, [100, 100]);

        brushLayer.transform.opacity.setValueAtTime(inTime, 0);
        brushLayer.transform.opacity.setValueAtTime(inTime + 0.08, 88);
        brushLayer.transform.opacity.setValueAtTime(inTime + 0.85, 88);
        brushLayer.transform.opacity.setValueAtTime(inTime + 1.15, 0);

        return brushLayer;
      } catch(be) {
        return null;
      }
    }

    // ✍️ HELPER: TIPOGRAFÍA MIXTA TIKTOK (Serif Itálica + Sans Ultra Bold + Cursiva Script + Tag)
    function createMixedEditorialTypography(comp, baseName, titleText, scriptText, metaTag, inTime, outTime, styleIdx) {
      try {
        var mainColor = (styleIdx === 0) ? COLOR_WHITE : (styleIdx === 1 ? COLOR_CRIMSON : COLOR_GOLD);

        // 1. TÍTULO PRINCIPAL (Letra Inicial Serif Itálica + Resto Sans Ultra Bold)
        var titleLayer = comp.layers.addText(titleText);
        titleLayer.name = baseName + "_Title";
        titleLayer.motionBlur = true;
        titleLayer.inPoint = inTime;
        titleLayer.outPoint = outTime;

        var tProp = titleLayer.property("Source Text");
        var tDoc = tProp.value;
        tDoc.fontSize = (titleText.length > 8) ? 130 : 170;
        tDoc.fillColor = mainColor;
        tDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
        tDoc.tracking = -12;

        try {
          tDoc.font = "Impact";
        } catch(e) {}
        tProp.setValue(tDoc);
        titleLayer.transform.position.setValue([540, 680]);

        // Entrada elástica
        titleLayer.transform.scale.setValueAtTime(inTime, [140, 190]);
        titleLayer.transform.scale.setValueAtTime(inTime + 0.20, [100, 130]);
        titleLayer.transform.scale.expression = ${bounceCode};

        titleLayer.transform.opacity.setValueAtTime(inTime, 100);
        titleLayer.transform.opacity.setValueAtTime(outTime - 0.12, 100);
        titleLayer.transform.opacity.setValueAtTime(outTime, 0);

        // 2. SUBTÍTULO CURSIVO / SCRIPT OVERLAY (Capa superpuesta artística)
        if (scriptText) {
          var scriptLayer = comp.layers.addText(scriptText);
          scriptLayer.name = baseName + "_Script";
          scriptLayer.motionBlur = true;
          scriptLayer.inPoint = inTime + 0.08;
          scriptLayer.outPoint = outTime;

          var sProp = scriptLayer.property("Source Text");
          var sDoc = sProp.value;
          sDoc.fontSize = 58;
          sDoc.fillColor = COLOR_WHITE;
          sDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
          sDoc.tracking = 5;

          var scriptFonts = ["SegoeScript", "LucidaHandwriting-Italic", "BrushScriptMT", "Georgia-Italic", "TimesNewRomanPS-ItalicMT"];
          for (var sf = 0; sf < scriptFonts.length; sf++) {
            try {
              sDoc.font = scriptFonts[sf];
              break;
            } catch(e) {}
          }

          sProp.setValue(sDoc);
          scriptLayer.transform.position.setValue([540, 790]);

          scriptLayer.transform.position.setValueAtTime(inTime + 0.08, [540, 830]);
          scriptLayer.transform.position.setValueAtTime(inTime + 0.28, [540, 790]);
          scriptLayer.transform.position.expression = ${bounceCode};

          scriptLayer.transform.opacity.setValueAtTime(inTime + 0.08, 0);
          scriptLayer.transform.opacity.setValueAtTime(inTime + 0.18, 95);
          scriptLayer.transform.opacity.setValueAtTime(outTime - 0.12, 95);
          scriptLayer.transform.opacity.setValueAtTime(outTime, 0);
        }

        // 3. META TAG EDITORIAL EN LA ESQUINA DEL TEXTO
        if (metaTag) {
          var tagLayer = comp.layers.addText(metaTag);
          tagLayer.name = baseName + "_Tag";
          tagLayer.inPoint = inTime + 0.05;
          tagLayer.outPoint = outTime;
          var tagProp = tagLayer.property("Source Text");
          var tagDoc = tagProp.value;
          tagDoc.fontSize = 20;
          tagDoc.fillColor = COLOR_GOLD;
          tagDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
          tagDoc.tracking = 25;
          tagProp.setValue(tagDoc);
          tagLayer.transform.position.setValue([540, 560]);

          tagLayer.transform.opacity.setValueAtTime(inTime + 0.05, 0);
          tagLayer.transform.opacity.setValueAtTime(inTime + 0.15, 100);
          tagLayer.transform.opacity.setValueAtTime(outTime - 0.12, 100);
          tagLayer.transform.opacity.setValueAtTime(outTime, 0);
        }

      } catch(me) {}
    }

    // 🛡️ HELPER BLINDADO: CERO ESCENAS EN NEGRO (Time Remap + Ping-Pong Loop)
    function importAndFitVideoReliable(comp, filePath, inTime, outTime, name, transType) {
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
        layer.audioEnabled = false; // 🔇 Audio de clips silenciado
        layer.inPoint = inTime;
        // Solapamiento de +0.3s para que NUNCA se vea negro en la transición
        layer.outPoint = Math.min(outTime + 0.35, compDuration);
        layer.startTime = inTime;

        // 🔄 BLINDAJE ANTI-PANTALLA NEGRA: Time Remap con Loop Ping-Pong
        layer.timeRemapEnabled = true;
        try {
          layer.timeRemap.expression = 'loopOut("pingpong");';
        } catch(tre) {}

        layer.transform.anchorPoint.setValue([foot.width / 2, foot.height / 2]);
        layer.transform.position.setValue([compWidth / 2, compHeight / 2]);

        var scaleX = (compWidth / foot.width) * 100;
        var scaleY = (compHeight / foot.height) * 100;
        var coverScale = Math.max(scaleX, scaleY) * 1.04;
        layer.transform.scale.setValue([coverScale, coverScale]);

        var transDur = 0.24;

        // 🎬 TRANSICIONES CONTINUAS
        if (transType === 0) {
          // Whip Zoom Push
          layer.transform.scale.setValueAtTime(inTime, [coverScale * 1.20, coverScale * 1.20]);
          layer.transform.scale.setValueAtTime(inTime + transDur, [coverScale, coverScale]);
        } else if (transType === 1) {
          // Whip Pan Left
          layer.transform.position.setValueAtTime(inTime, [compWidth / 2 + 300, compHeight / 2]);
          layer.transform.position.setValueAtTime(inTime + transDur, [compWidth / 2, compHeight / 2]);
        } else if (transType === 2) {
          // Whip Pan Right
          layer.transform.position.setValueAtTime(inTime, [compWidth / 2 - 300, compHeight / 2]);
          layer.transform.position.setValueAtTime(inTime + transDur, [compWidth / 2, compHeight / 2]);
        } else if (transType === 3) {
          // Whip Slide Up
          layer.transform.position.setValueAtTime(inTime, [compWidth / 2, compHeight / 2 + 350]);
          layer.transform.position.setValueAtTime(inTime + transDur, [compWidth / 2, compHeight / 2]);
        } else if (transType === 4) {
          // Soft Dissolve
          layer.transform.opacity.setValueAtTime(inTime, 0);
          layer.transform.opacity.setValueAtTime(inTime + transDur, 100);
        } else {
          // Impact Flash
          var flash = comp.layers.addSolid([1.0, 1.0, 1.0], "Flash_" + inTime, compWidth, compHeight, 1.0, 0.16);
          flash.inPoint = inTime;
          flash.outPoint = inTime + 0.16;
          flash.transform.opacity.setValueAtTime(inTime, 70);
          flash.transform.opacity.setValueAtTime(inTime + 0.15, 0);
        }

        return { layer: layer, footage: foot, coverScale: coverScale };
      } catch(ve) {
        return null;
      }
    }

    // =======================================================================
    // 🎥 2. MONTAJE DE CLIPS + PINCELADAS + TIPOGRAFÍA MIXTA TIKTOK
    // =======================================================================
    var baseDir = "${videoDir}/";
    var clipsData = ${JSON.stringify(clipTimings)};

    for (var c = 0; c < clipsData.length; c++) {
      var item = clipsData[c];
      var videoPath = baseDir + item.fileName;

      // 1. Pincelada / Bloque de Color de Fondo Artístico (como la imagen de TikTok)
      if (item.hasPaintWipe) {
        var paintCol = (c % 2 === 0) ? COLOR_MINT : [0.94, 0.35, 0.38];
        createPaintBrushWipe(comp, "Paint_Brush_" + (c + 1), item.inTime, paintCol);
      }

      if (item.isBlurShift) {
        // 🌟 CASO ESPECIAL: 20230621_001126.mp4 (Detrás -> Fast Blur -> Delante)
        var midTime = item.inTime + 2.0;

        var vf = importAndFitVideoReliable(comp, videoPath, item.inTime, item.outTime, "Base_Video_" + item.fileName, item.transType);
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

        // Texto DETRÁS (0 a 2s)
        createMixedEditorialTypography(comp, "Behind_Text_" + item.fileName, "NOCHE", "Eternidad Viva", "CLÍMAX // 07", item.inTime, midTime, 1);

        var fgLayer = importAndFitVideoReliable(comp, videoPath, item.inTime, midTime, "Foreground_Subject_" + item.fileName, 4);
        if (fgLayer && fgLayer.layer) {
          try {
            var ext = fgLayer.layer.property("Effects").addProperty("ADBE Extract");
            if (ext) {
              ext.property("Black Point").setValue(50);
              ext.property("White Point").setValue(200);
            }
          } catch(e) {}
        }

        // Texto DELANTE (2s a 4.4s sobre video desenfocado)
        createMixedEditorialTypography(comp, "Front_Text_" + item.fileName, "TURRAZO", "Guadalajara 2023", "THE END // LIVE", midTime, item.outTime, 2);

      } else if (item.isBehind) {
        // 🌟 CASO ESPECIAL: TEXTO DETRÁS DEL SUJETO (20230620_212618, 224844, 231413)
        importAndFitVideoReliable(comp, videoPath, item.inTime, item.outTime, "Base_Video_" + item.fileName, item.transType);

        createMixedEditorialTypography(comp, "Behind_Text_" + item.fileName, item.title, item.script, item.tag, item.inTime, item.outTime, item.styleIndex);

        var fg = importAndFitVideoReliable(comp, videoPath, item.inTime, item.outTime, "Foreground_Subject_" + item.fileName, 4);
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
        // 🌿 CASO ESTÁNDAR: VIDEO SIN NEGROS + TIPOGRAFÍA MIXTA
        importAndFitVideoReliable(comp, videoPath, item.inTime, item.outTime, "Clip_" + (c + 1) + "_" + item.fileName, item.transType);

        createMixedEditorialTypography(comp, "Text_" + (c + 1) + "_" + item.fileName, item.title, item.script, item.tag, item.inTime, item.outTime, item.styleIndex);
      }
    }

    // =======================================================================
    // 🌌 3. CAPA DE GRADACIÓN DE CONTRASTE CINEMÁTICO
    // =======================================================================
    var darkOverlay = comp.layers.addSolid([0.02, 0.02, 0.04], "Cinematic_Grade", compWidth, compHeight, 1.0, compDuration);
    darkOverlay.transform.opacity.setValue(30);

    // =======================================================================
    // 📊 4. HUD AUDIO EQUALIZER BARS (Base)
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
    alert("Error en script de Macro-Edit Editorial: " + err.toString());
  } finally {
    try {
      app.endUndoGroup();
    } catch(ue) {}
  }
})();
`;

  const jsxFilePath = path.join(outputDir, "Guadalajara_Turrazo_Master_Edit.jsx");
  fs.writeFileSync(jsxFilePath, fullExtendScript, "utf-8");
  console.log(`   ✔ Archivo JSX de Masterpiece Editorial generado -> ${jsxFilePath}`);

  const compObj = MotionEngine.createComposition({
    id: "guadalajara_editorial_comp",
    name: "GUADALAJARA_EDITORIAL_MASTERPIECE",
    width: 1080,
    height: 1920,
    fps: 60,
    duration: compDuration,
  });

  MotionEngine.deliverSocialPackage(compObj, "proj_guadalajara_editorial", "rev_2");
  await CLIRunner.run(["node", "bin", "validate", "guadalajara_editorial.json"]);
  await CLIRunner.run(["node", "bin", "qa", "guadalajara_editorial.json", "--threshold", "0.85"]);

  console.log("\n==========================================================================");
  console.log("🎉 ¡PRODUCCIÓN EDITORIAL TIKTOK (CERO NEGROS) LISTA EN AFTER EFFECTS!");
  console.log("==========================================================================\n");
}

generateGuadalajaraTurrazoAestheticMasterpiece().catch(console.error);
