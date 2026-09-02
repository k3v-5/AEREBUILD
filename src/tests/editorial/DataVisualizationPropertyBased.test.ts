import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import {
  normalizeValue,
  denormalizeValue,
  generateDeterministicId,
  canonicalStringify,
  contrastRatio,
  validateHexColor,
} from "../../editorial/data-visualization/index.js";

describe("REQ-025 — Data Visualization Property-Based Testing (PBT)", () => {
  it("PBT: normalizeValue always yields a number strictly in [0.0, 1.0]", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        fc.double({ min: -1e6, max: 1e6, noNaN: true }),
        (v, a, b) => {
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          const norm = normalizeValue(v, min, max);
          assert.ok(norm >= 0.0 && norm <= 1.0, `Normalized value ${norm} not in [0, 1]`);
        }
      ),
      { numRuns: 500 }
    );
  });

  it("PBT: denormalizeValue is the exact mathematical inverse of normalizeValue within domain", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e4, max: 1e4, noNaN: true }),
        fc.double({ min: 1.0, max: 1e4, noNaN: true }),
        (min, range) => {
          const max = min + range;
          const original = min + range * 0.45;
          const norm = normalizeValue(original, min, max);
          const recovered = denormalizeValue(norm, min, max);
          const diff = Math.abs(recovered - original);
          assert.ok(diff < 1e-4, `Diff ${diff} exceeds tolerance for original ${original}`);
        }
      ),
      { numRuns: 300 }
    );
  });

  it("PBT: generateDeterministicId is strictly deterministic and never produces empty strings", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.integer({ min: 0, max: 10000 }),
        (prefix, visId, idx) => {
          const id1 = generateDeterministicId(prefix, { visId, idx });
          const id2 = generateDeterministicId(prefix, { idx, visId }); // Orden alterado de claves

          assert.equal(id1, id2, "Deterministic ID must be invariant to property order");
          assert.ok(id1.startsWith(`${prefix}_`), "ID must start with requested prefix");
          assert.ok(id1.length > prefix.length + 1, "ID must contain generated hash part");
        }
      ),
      { numRuns: 200 }
    );
  });

  it("PBT: canonicalStringify produces identical outputs regardless of object key order", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.double({ min: -1e5, max: 1e5, noNaN: true }),
        fc.boolean(),
        (str, num, bool) => {
          const objA = { alpha: str, beta: num, gamma: bool };
          const objB = { gamma: bool, alpha: str, beta: num };

          const canonA = canonicalStringify(objA);
          const canonB = canonicalStringify(objB);
          assert.equal(canonA, canonB, "Canonical serialization must be order-independent");
        }
      ),
      { numRuns: 200 }
    );
  });

  it("PBT: contrastRatio is always strictly between 1.0 and 21.0 for valid hex colors", () => {
    const hexGen = fc.integer({ min: 0, max: 0xffffff }).map((n) => `#${n.toString(16).padStart(6, "0")}`);

    fc.assert(
      fc.property(hexGen, hexGen, (c1, c2) => {
        assert.ok(validateHexColor(c1));
        assert.ok(validateHexColor(c2));

        const ratio = contrastRatio(c1, c2);
        assert.ok(ratio >= 1.0 && ratio <= 21.0, `Contrast ratio ${ratio} out of bounds [1, 21]`);
      }),
      { numRuns: 200 }
    );
  });
});
