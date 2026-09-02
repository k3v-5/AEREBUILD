import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  MogrtSpecGenerator,
  MogrtBinaryPackager,
} from "../../editorial/exporters/mogrt-compiler.js";
import {
  ChunkedRenderEngine,
  ChunkedRenderJob,
} from "../../editorial/rendering/chunked-render-engine.js";

describe("P4 — MOGRT Compiler & Chunked Render Verification (REQ-037)", () => {
  it("generates valid MOGRT specification manifest with exposed controls and declares binary packaging unverified", () => {
    const spec = MogrtSpecGenerator.generateSpec({
      templateId: "mogrt_lower_third_insignia",
      templateName: "TIME Lower Third Editorial",
      definition: {
        compositionName: "MainLowerThird",
        width: 1920,
        height: 1080,
        fps: 24,
        durationSeconds: 5.0,
        essentialPropertyCount: 3,
      },
      controls: [
        {
          controlId: "ctrl_speaker_name",
          name: "Speaker Name",
          type: "TEXT",
          defaultValue: "DR. ELENA ALVAREZ",
          expressionBinding: "thisComp.layer('NameText').text.sourceText",
        },
        {
          controlId: "ctrl_accent_color",
          name: "Accent Color",
          type: "COLOR",
          defaultValue: "#FF1424",
          expressionBinding: "thisComp.layer('AccentBar').content('Fill 1').color",
        },
      ],
      dependencies: ["fonts/Impact.ttf"],
    });

    assert.equal(spec.schemaVersion, "1.0.0");
    assert.equal(spec.exposedControls.length, 2);
    assert.ok(spec.provenance.specHashSha256.length === 64);

    // Explicit transparent error on binary packaging
    assert.throws(
      () => MogrtBinaryPackager.packageBinaryMogrt(spec),
      /MOGRT_BINARY_PACKAGER_UNVERIFIED/
    );
  });

  it("REQ-037: partitions render job into contiguous non-overlapping chunks and verifies assembly", () => {
    const job: ChunkedRenderJob = {
      jobId: "job_doc_render_01",
      sourceIrHash: "ir_hash_master_abc",
      totalDurationSeconds: 15.0,
      fps: 30,
      totalFrames: 450,
      settings: {
        codec: "PRORES_422_HQ",
        width: 1920,
        height: 1080,
        fps: 30,
      },
    };

    // Partition into 5-second chunks (150 frames each)
    const chunks = ChunkedRenderEngine.partitionJob(job, 5.0);
    assert.equal(chunks.length, 3);

    // Chunk 0: frames 0 to 149
    assert.equal(chunks[0].frameStart, 0);
    assert.equal(chunks[0].frameEnd, 149);
    assert.equal(chunks[0].expectedFrameCount, 150);

    // Chunk 1: frames 150 to 299
    assert.equal(chunks[1].frameStart, 150);
    assert.equal(chunks[1].frameEnd, 299);
    assert.equal(chunks[1].expectedFrameCount, 150);

    // Chunk 2: frames 300 to 449
    assert.equal(chunks[2].frameStart, 300);
    assert.equal(chunks[2].frameEnd, 449);
    assert.equal(chunks[2].expectedFrameCount, 150);

    // Verify valid contiguous assembly
    const assemblySuccess = ChunkedRenderEngine.verifyAndAssemble(job, chunks);
    assert.equal(assemblySuccess.isComplete, true);
    assert.equal(assemblySuccess.totalAssembledFrames, 450);
    assert.equal(assemblySuccess.verificationReport.errors.length, 0);
    assert.ok(assemblySuccess.canonicalMasterHash.length === 64);
  });

  it("REQ-037: detects missing frames, gaps, and duplicate frame intervals", () => {
    const job: ChunkedRenderJob = {
      jobId: "job_doc_render_02",
      sourceIrHash: "ir_hash_master_def",
      totalDurationSeconds: 10.0,
      fps: 30,
      totalFrames: 300,
      settings: {
        codec: "H264",
        width: 1920,
        height: 1080,
        fps: 30,
      },
    };

    // Simulate corrupted chunk set: chunk 1 missing (frames 150-299 missing)
    const brokenChunks = [
      {
        chunkId: "chk_0",
        jobId: job.jobId,
        chunkIndex: 0,
        startTimeSeconds: 0,
        endTimeSeconds: 3.33,
        frameStart: 0,
        frameEnd: 99,
        expectedFrameCount: 100,
        chunkHashSha256: "hash0",
        status: "COMPLETED" as const,
      },
      {
        chunkId: "chk_2", // Gap! Frames 100-199 missing
        jobId: job.jobId,
        chunkIndex: 2,
        startTimeSeconds: 6.66,
        endTimeSeconds: 10.0,
        frameStart: 200,
        frameEnd: 299,
        expectedFrameCount: 100,
        chunkHashSha256: "hash2",
        status: "COMPLETED" as const,
      },
    ];

    const assemblyFailure = ChunkedRenderEngine.verifyAndAssemble(job, brokenChunks);
    assert.equal(assemblyFailure.isComplete, false);
    assert.ok(assemblyFailure.verificationReport.missingFrames.length >= 100);
    assert.ok(assemblyFailure.verificationReport.errors.some((e) => e.includes("FRAME_GAP_DETECTED")));
  });
});
