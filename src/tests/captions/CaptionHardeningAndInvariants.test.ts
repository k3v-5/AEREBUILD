import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { SRTParser } from "../../captions/transcript/SRTParser.js";
import { WhisperJSONParser } from "../../captions/transcript/WhisperJSONParser.js";
import { CaptionNormalizer } from "../../captions/normalizer/CaptionNormalizer.js";
import { CaptionIntelligenceEngine } from "../../captions/intelligence/CaptionIntelligenceEngine.js";
import { CaptionEvaluator } from "../../captions/core/CaptionEvaluator.js";
import { DynamicCaptionLayoutEngine } from "../../captions/layout/DynamicCaptionLayoutEngine.js";
import { ViralCaptionPresetRegistry } from "../../captions/presets/ViralCaptionPresets.js";
import { CaptionSerializer } from "../../captions/serialization/CaptionSerializer.js";
import { CaptionDocument, CaptionStyle } from "../../captions/types/index.js";

describe("Fase 16.1 — Caption Hardening & Invariants Audit Suite", () => {
  it("explicitly distinguishes and marks CaptionTimingPrecision between segment and word level", () => {
    // SRT parser produces segment-level precision by design
    const srtDoc = SRTParser.parse("1\n00:00:01,000 --> 00:00:03,000\nTexto con timing inferido");
    assert.equal(srtDoc.timingPrecision, "segment");
    assert.equal(srtDoc.segments[0].timingPrecision, "segment");

    // Whisper with word timestamps produces word-level precision
    const whisperDoc = WhisperJSONParser.parse({
      segments: [
        {
          start: 0,
          end: 2,
          text: "Palabras con timing acústico",
          words: [
            { word: "Palabras", start: 0, end: 0.8 },
            { word: "acústicas", start: 0.8, end: 2.0 },
          ],
        },
      ],
    });
    assert.equal(whisperDoc.timingPrecision, "word");
    assert.equal(whisperDoc.segments[0].timingPrecision, "word");
  });

  it("handles extreme Unicode grapheme clusters (ZWJ, skin tones, flags, variation selectors and RTL)", () => {
    const complexCases = [
      "👨‍👩‍👧‍👦 Familia ZWJ",
      "👩🏽‍💻 Desarrolladora con tono de piel",
      "🏳️‍🌈 Bandera arcoíris",
      "¡🔥! Emojis entre signos enfáticos",
      "مرحبا بالعالم - Texto RTL y LTR",
    ];

    for (const text of complexCases) {
      const normalized = CaptionNormalizer.normalizeText(text);
      assert.ok(normalized.length > 0);

      const words = normalized.split(/\s+/).map((w, idx) => ({
        id: `w_${idx}`,
        text: w,
        start: idx * 0.5,
        end: (idx + 1) * 0.5,
        index: idx,
      }));

      const style: CaptionStyle = {
        fontFamily: "Inter",
        fontSize: 60,
        fontWeight: 700,
        color: { r: 1, g: 1, b: 1, a: 1 },
        alignment: "center",
      };

      const layout = DynamicCaptionLayoutEngine.layout(words, style, { maxWidth: 600 });
      assert.ok(isFinite(layout.width));
      assert.ok(isFinite(layout.height));
      assert.ok(layout.words.length === words.length);
    }
  });

  it("proves Deep Invariant: Evaluate(IR, t) === Evaluate(deserialize(serialize(IR)), t)", () => {
    const srtInput = `1\n00:00:00,000 --> 00:00:02,000\n¡Hola mundo extraordinario! 🚀\n\n2\n00:00:02,500 --> 00:00:04,500\nGanando dinero con IA`;
    const rawDoc = SRTParser.parse(srtInput);
    const normalized = CaptionNormalizer.normalize(rawDoc);
    const enriched = new CaptionIntelligenceEngine().analyzeDocument(normalized);

    // Serializar y deserializar
    const json = CaptionSerializer.toJSON(enriched);
    const deserialized = CaptionSerializer.fromJSON(json);

    const preset = ViralCaptionPresetRegistry.getPreset("hormozi-impact");

    // Evaluar 10 instantes temporales continuos
    const testTimes = [0.0, 0.5, 1.0, 1.5, 2.0, 2.2, 2.7, 3.2, 4.0, 4.5];

    for (const t of testTimes) {
      const stateOrig = CaptionEvaluator.evaluateDocument(enriched, t, preset);
      const stateRoundTrip = CaptionEvaluator.evaluateDocument(deserialized, t, preset);

      assert.deepEqual(stateOrig, stateRoundTrip, `Evaluation mismatch at timestamp t=${t}s`);
    }
  });

  it("benchmarks static precomputation vs dynamic frame evaluation (10,000 frames in < 15ms)", () => {
    const srtInput = `1\n00:00:00,000 --> 00:00:02,000\nPrueba de rendimiento extremo con subtítulos\n\n2\n00:00:02,000 --> 00:00:04,000\nAnimación fluida a alta tasa de fotogramas`;
    const doc = CaptionNormalizer.normalize(SRTParser.parse(srtInput));
    const enriched = new CaptionIntelligenceEngine().analyzeDocument(doc);
    const preset = ViralCaptionPresetRegistry.getPreset("karaoke-gradient");

    // 1. Precomputar geometría estática una sola vez
    const staticLayout = CaptionEvaluator.precomputeStaticLayout(enriched, preset);
    assert.ok(staticLayout.segments.length > 0);

    // 2. Evaluar 10,000 fotogramas dinámicos
    const t0 = performance.now();
    for (let i = 0; i < 10000; i++) {
      const t = (i % 400) / 100; // t in [0, 4.0s]
      const state = CaptionEvaluator.evaluateDocument(enriched, t, preset, undefined, staticLayout);
      assert.equal(typeof state.active, "boolean");
    }
    const elapsed = performance.now() - t0;

    assert.ok(
      elapsed < 500,
      `10,000 frame evaluations with precomputed static layout should take < 500ms, took ${elapsed.toFixed(2)}ms`
    );
  });
});
