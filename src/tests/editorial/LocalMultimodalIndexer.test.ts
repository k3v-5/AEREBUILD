import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import {
  VideoFrameAnalyzer,
  DeterministicLocalEmbeddingAdapter,
  DeterministicHeuristicProvider,
  LocalMultimodalModelProvider,
  MultimodalIndexer,
  SemanticSearchEngine,
} from "../../editorial/perception/index.js";

describe("P3 — Local Multimodal Video Indexer & Semantic Search (REQ-013)", () => {
  const provider = new DeterministicLocalEmbeddingAdapter();

  it("extracts perceptual visual and motion features from shot descriptions", () => {
    const nightShot = VideoFrameAnalyzer.analyzeShot({
      shotId: "s1",
      sourceAssetId: "a1",
      startTimeSeconds: 0,
      durationSeconds: 5,
      description: "City skyline at night with car traffic and walking pedestrians",
      tags: ["night", "city", "walking"],
    });

    assert.equal(nightShot.lightingMood, "NIGHT");
    assert.equal(nightShot.motion.cameraMotion, "TRACKING");
    assert.ok(nightShot.detectedEntities.some((e) => e.name === "person"));
    assert.ok(nightShot.detectedEntities.some((e) => e.name === "vehicle"));
    assert.ok(nightShot.detectedEntities.some((e) => e.name === "architecture"));
    assert.equal(nightShot.dominantColors[0].hex, "#0b132b");
  });

  it("guarantees 100% deterministic L2-normalized semantic embeddings", () => {
    const v1 = provider.generateTextEmbedding("persona caminando sola de noche");
    const v2 = provider.generateTextEmbedding("persona caminando sola de noche");

    assert.deepEqual(v1, v2);
    assert.equal(v1.length, 128);

    // L2 norm must equal 1.0 (within float tolerance)
    let sumSq = 0;
    for (const x of v1) sumSq += x * x;
    assert.ok(Math.abs(Math.sqrt(sumSq) - 1.0) < 1e-4);

    // Cosine similarity with itself is 1.0
    const simSelf = provider.cosineSimilarity(v1, v2);
    assert.equal(simSelf, 1.0);
  });

  it("supports incremental indexing, persistence, and deterministic rebuild (REQ-013 §7-§9)", () => {
    const indexer = new MultimodalIndexer(provider);

    const feat1 = VideoFrameAnalyzer.analyzeShot({
      shotId: "shot_city_night",
      sourceAssetId: "asset_broll_01",
      startTimeSeconds: 0,
      durationSeconds: 4,
      description: "Plano de ciudad de noche con tráfico",
    });

    const feat2 = VideoFrameAnalyzer.analyzeShot({
      shotId: "shot_park_day",
      sourceAssetId: "asset_broll_02",
      startTimeSeconds: 10,
      durationSeconds: 5,
      description: "Parque verde en día soleado con niños jugando",
    });

    indexer.indexShot({
      shotId: "shot_city_night",
      sourceAssetId: "asset_broll_01",
      sourceAssetHash: "hash_01",
      startTimeSeconds: 0,
      durationSeconds: 4,
      visualFeatures: feat1,
      detectedSubjects: ["city", "night", "traffic"],
      transcriptText: "Las luces de la ciudad nunca descansan",
    });

    indexer.indexShot({
      shotId: "shot_park_day",
      sourceAssetId: "asset_broll_02",
      sourceAssetHash: "hash_02",
      startTimeSeconds: 10,
      durationSeconds: 5,
      visualFeatures: feat2,
      detectedSubjects: ["park", "nature", "daylight"],
    });

    assert.equal(indexer.size(), 2);
    const hash1 = indexer.calculateCanonicalIndexHash();

    // Serialize and restore
    const savedJson = indexer.saveToJson();
    assert.ok(savedJson.includes('"schemaVersion": "4.0.0"'));

    const restoredIndexer = new MultimodalIndexer(provider);
    restoredIndexer.loadFromJson(savedJson);

    assert.equal(restoredIndexer.size(), 2);
    const hash2 = restoredIndexer.calculateCanonicalIndexHash();
    assert.equal(hash1, hash2);

    // Incremental update
    indexer.updateAsset("asset_broll_01", "hash_01_v2", [
      {
        shotId: "shot_city_night_v2",
        startTimeSeconds: 0,
        durationSeconds: 6,
        visualFeatures: feat1,
        detectedSubjects: ["city", "night"],
      },
    ]);

    assert.equal(indexer.size(), 2);
    assert.ok(!indexer.getRecord("shot_city_night"));
    assert.ok(indexer.getRecord("shot_city_night_v2"));
  });

  it("rejects corrupted index or mismatched model metadata", () => {
    const indexer = new MultimodalIndexer(provider);

    // Corrupt JSON
    assert.throws(() => indexer.loadFromJson("{ invalid json"), /INDEX_CORRUPT_ERROR/);

    // Schema mismatch
    assert.throws(
      () => indexer.loadFromJson(JSON.stringify({ manifest: { schemaVersion: "3.0.0" } })),
      /INDEX_SCHEMA_MISMATCH/
    );

    // Model hash mismatch
    assert.throws(
      () =>
        indexer.loadFromJson(
          JSON.stringify({
            manifest: {
              schemaVersion: "4.0.0",
              providerType: "DETERMINISTIC_HEURISTIC",
              modelId: "other-model",
              modelHash: "wrong_hash",
            },
          })
        ),
      /INDEX_MODEL_MISMATCH/
    );
  });

  it("strictly distinguishes DeterministicHeuristicProvider from LocalMultimodalModelProvider and refuses fake neural embeddings", () => {
    const heuristic = new DeterministicHeuristicProvider();
    assert.equal(heuristic.providerType, "DETERMINISTIC_HEURISTIC");
    assert.equal(heuristic.getModelInfo().isNeuralWeightsAvailable, false);

    const neural = new LocalMultimodalModelProvider({
      modelPath: "non_existent_weights.onnx",
      modelId: "siglip-test",
    });

    assert.equal(neural.providerType, "LOCAL_MULTIMODAL_NEURAL");
    assert.equal(neural.getModelInfo().isNeuralWeightsAvailable, false);

    // Throws explicit error instead of fabricating fake vectors
    assert.throws(
      () => neural.generateTextEmbedding("test query"),
      /MISSING_LOCAL_NEURAL_WEIGHTS/
    );
  });

  it("executes semantic search with structured explanations and ranks candidates accurately (REQ-013 §5-§6)", () => {
    const indexer = new MultimodalIndexer(provider);

    const featNight = VideoFrameAnalyzer.analyzeShot({
      shotId: "sh_night",
      sourceAssetId: "asset_night",
      startTimeSeconds: 0,
      durationSeconds: 4,
      description: "Plano de ciudad de noche con rascacielos iluminados",
    });

    const featWalk = VideoFrameAnalyzer.analyzeShot({
      shotId: "sh_walk",
      sourceAssetId: "asset_walk",
      startTimeSeconds: 0,
      durationSeconds: 6,
      description: "Persona caminando sola por calle solitaria con paso lento",
    });

    indexer.indexShot({
      shotId: "sh_night",
      sourceAssetId: "asset_night",
      sourceAssetHash: "hash_night",
      startTimeSeconds: 0,
      durationSeconds: 4,
      visualFeatures: featNight,
      detectedSubjects: ["city", "night", "skyline"],
    });

    indexer.indexShot({
      shotId: "sh_walk",
      sourceAssetId: "asset_walk",
      sourceAssetHash: "hash_walk",
      startTimeSeconds: 0,
      durationSeconds: 6,
      visualFeatures: featWalk,
      detectedSubjects: ["person", "walking", "solitude"],
    });

    const searchEngine = new SemanticSearchEngine(indexer, provider);

    // Query 1: "plano de ciudad de noche"
    const resultsCity = searchEngine.search("plano de ciudad de noche");
    assert.ok(resultsCity.length > 0);
    assert.equal(resultsCity[0].shotId, "sh_night");
    assert.ok(resultsCity[0].score > 60.0);
    assert.ok(resultsCity[0].matchingFeatures.some((f) => f.includes("Nighttime")));
    assert.ok(resultsCity[0].explanation.sceneContextMatch > 0.8);

    // Query 2: "persona caminando sola"
    const resultsWalk = searchEngine.search("persona caminando sola");
    assert.ok(resultsWalk.length > 0);
    assert.equal(resultsWalk[0].shotId, "sh_walk");
    assert.ok(resultsWalk[0].score >= 50.0);
    assert.ok(resultsWalk[0].explanation.visualSubjectMatch > 0.8);

    // Conversion to SemanticBRollCandidate for B-Roll Director
    const bRollCandidates = searchEngine.toBRollCandidates(resultsCity);
    assert.equal(bRollCandidates.length, resultsCity.length);
    assert.equal(bRollCandidates[0].id, "sh_night");
    assert.equal(bRollCandidates[0].categoryFamily, "broll_perceptual");
  });

  it("PBT: cosine similarity is always bounded in [-1.0, 1.0] and symmetric", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (s1, s2) => {
          const emb1 = provider.generateTextEmbedding(s1);
          const emb2 = provider.generateTextEmbedding(s2);

          const sim1 = provider.cosineSimilarity(emb1, emb2);
          const sim2 = provider.cosineSimilarity(emb2, emb1);

          return (
            sim1 >= -1.0 &&
            sim1 <= 1.0 &&
            Math.abs(sim1 - sim2) < 1e-5
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
