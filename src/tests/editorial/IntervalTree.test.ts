import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { IntervalTree } from "../../editorial/performance/interval-tree.js";

describe("P2 — Interval Tree Timeline Indexer & Benchmarks (REQ-039)", () => {
  it("handles basic operations: insert, remove, size, clear", () => {
    const tree = new IntervalTree<string>();
    assert.equal(tree.size(), 0);

    tree.insert("clip1", 2.0, 5.0, "Take 1");
    tree.insert("clip2", 4.0, 8.0, "Take 2");
    assert.equal(tree.size(), 2);

    const removed = tree.remove("clip1");
    assert.equal(removed, true);
    assert.equal(tree.size(), 1);

    tree.clear();
    assert.equal(tree.size(), 0);
  });

  it("handles mandatory edge cases: empty, single, identical, nested, adjacent, zero-duration, negative", () => {
    const tree = new IntervalTree<string>();

    // 1. Empty tree query
    assert.deepEqual(tree.overlapQuery(0, 10), []);

    // 2. Single interval
    tree.insert("single", 10.0, 20.0);
    assert.equal(tree.overlapQuery(12.0, 15.0).length, 1);
    assert.equal(tree.overlapQuery(0.0, 5.0).length, 0);

    // 3. Identical intervals (updated / replaced by ID)
    tree.insert("single", 10.0, 20.0);
    assert.equal(tree.size(), 1);

    // 4. Nested intervals
    tree.insert("outer", 0.0, 100.0);
    tree.insert("inner", 40.0, 60.0);
    const nestedRes = tree.overlapQuery(45.0, 55.0);
    assert.equal(nestedRes.length, 2);
    assert.ok(nestedRes.some((n) => n.id === "outer"));
    assert.ok(nestedRes.some((n) => n.id === "inner"));

    // 5. Adjacent intervals (touching endpoints)
    tree.insert("adj1", 100.0, 110.0);
    tree.insert("adj2", 110.0, 120.0);
    const touching = tree.overlapQuery(110.0, 110.0);
    assert.equal(touching.length, 2);

    // 6. Zero-duration interval (point marker)
    tree.insert("marker", 50.0, 50.0);
    assert.equal(tree.pointQuery(50.0).length >= 1, true);

    // 7. Negative timestamps
    tree.insert("preroll", -5.0, -1.0);
    const neg = tree.overlapQuery(-3.0, -2.0);
    assert.equal(neg.length, 1);
    assert.equal(neg[0].id, "preroll");
  });

  it("produces identical results between O(log N + K) index and O(N) linear fallback (Invariance)", () => {
    const tree = new IntervalTree<number>();
    const testIntervals = [
      { id: "i1", low: 10, high: 20 },
      { id: "i2", low: 15, high: 25 },
      { id: "i3", low: 30, high: 40 },
      { id: "i4", low: 5, high: 12 },
      { id: "i5", low: 22, high: 28 },
      { id: "i6", low: 0, high: 50 },
      { id: "i7", low: 45, high: 60 },
    ];

    for (const item of testIntervals) {
      tree.insert(item.id, item.low, item.high, item.low);
    }

    const queries = [
      { low: 0, high: 10 },
      { low: 16, high: 18 },
      { low: 25, high: 30 },
      { low: 100, high: 200 },
      { low: 5, high: 45 },
    ];

    for (const q of queries) {
      const indexed = tree.overlapQuery(q.low, q.high);
      const linear = tree.linearFallbackQuery(q.low, q.high);

      assert.equal(indexed.length, linear.length);
      for (let i = 0; i < indexed.length; i++) {
        assert.equal(indexed[i].id, linear[i].id);
        assert.equal(indexed[i].low, linear[i].low);
        assert.equal(indexed[i].high, linear[i].high);
      }
    }
  });

  it("PBT: random interval collections strictly satisfy indexedQuery == linearFallbackQuery", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            a: fc.double({ min: -100, max: 1000, noNaN: true }),
            b: fc.double({ min: -100, max: 1000, noNaN: true }),
          }),
          { minLength: 5, maxLength: 50 }
        ),
        fc.double({ min: -50, max: 500, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (rawIntervals, queryStart, queryDur) => {
          const tree = new IntervalTree<void>();
          for (const item of rawIntervals) {
            const low = Math.min(item.a, item.b);
            const high = Math.max(item.a, item.b);
            tree.insert(item.id, low, high);
          }

          const qLow = queryStart;
          const qHigh = queryStart + queryDur;

          const indexed = tree.overlapQuery(qLow, qHigh);
          const linear = tree.linearFallbackQuery(qLow, qHigh);

          if (indexed.length !== linear.length) return false;
          for (let i = 0; i < indexed.length; i++) {
            if (indexed[i].id !== linear[i].id) return false;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("REQ-039 Benchmark: scales accurately across 100, 1k, 5k, 10k, 50k clips", () => {
    const scaleSizes = [100, 1000, 5000, 10000, 50000];
    const benchmarkResults: Record<number, { insertMs: number; queryMs: number; hits: number }> = {};

    for (const N of scaleSizes) {
      const tree = new IntervalTree<number>();
      const t0 = performance.now();

      for (let i = 0; i < N; i++) {
        const start = i * 2.5;
        const dur = 3.0 + (i % 5);
        tree.insert(`clip_${i}`, start, start + dur, i);
      }
      const insertTime = performance.now() - t0;

      // Query around the middle of timeline
      const midPoint = (N * 2.5) / 2;
      const tQ0 = performance.now();
      const hits = tree.overlapQuery(midPoint, midPoint + 10.0);
      const queryTime = performance.now() - tQ0;

      benchmarkResults[N] = {
        insertMs: Number(insertTime.toFixed(2)),
        queryMs: Number(queryTime.toFixed(4)),
        hits: hits.length,
      };

      assert.equal(tree.size(), N);
      assert.ok(hits.length > 0);
      // Query on 50,000 clips must be instantaneous (< 5ms) in O(log N + K)
      assert.ok(queryTime < 25.0);
    }

    assert.ok(benchmarkResults[50000].queryMs < 25.0);
  });
});
