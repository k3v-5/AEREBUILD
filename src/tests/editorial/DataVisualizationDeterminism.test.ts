import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  compileVisualization,
  verifyVisualizationChecksum,
} from "../../editorial/data-visualization/index.js";

describe("REQ-025 — Data Visualization Determinism & Cryptographic Sealing", () => {
  const fixturePath = path.resolve(process.cwd(), "fixtures/data-visualization/investigative-economy.json");
  const rawData = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  const { dataset, spec } = rawData;

  it("produces byte-identical SHA-256 output across 100 repeated compilations", () => {
    const firstResult = compileVisualization(dataset, spec);
    assert.equal(firstResult.success, true);
    assert.ok(firstResult.checksumSha256);
    assert.equal(firstResult.checksumSha256.length, 64);

    const masterHash = firstResult.checksumSha256;

    for (let i = 0; i < 100; i++) {
      const runResult = compileVisualization(dataset, spec);
      assert.equal(runResult.checksumSha256, masterHash, `Compilation run ${i} produced a different SHA-256 hash!`);
    }
  });

  it("verifies cryptographic seal integrity via verifyVisualizationChecksum", () => {
    const result = compileVisualization(dataset, spec);
    assert.ok(result.ir);

    const isValid = verifyVisualizationChecksum(result.ir);
    assert.equal(isValid, true, "Seal verification should succeed for unmodified IR");
  });

  it("detects tampering when any coordinate or property is modified in the sealed IR", () => {
    const result = compileVisualization(dataset, spec);
    assert.ok(result.ir);

    // Clonar e introducir tamper en coordenada
    const tamperedIR = JSON.parse(JSON.stringify(result.ir));
    tamperedIR.layers[1].transform.position.x += 0.01;

    const isValid = verifyVisualizationChecksum(tamperedIR);
    assert.equal(isValid, false, "Seal verification must fail when IR is tampered");
  });
});
