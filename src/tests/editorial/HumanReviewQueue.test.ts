import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { HumanReviewQueue } from "../../editorial/qa/human-review-queue.js";
import { EditorialQAFinding } from "../../editorial/qa/types.js";

describe("Fase 4I — Human Review Queue Suite", () => {
  const sampleFindings: EditorialQAFinding[] = [
    {
      id: "f_high_conf",
      ruleId: "QA-TIME-001",
      severity: "WARNING",
      message: "Minor flash frame",
      reason: "0.08s clip",
      evidence: [],
      confidence: 0.95, // >= 0.70 threshold -> no automatic review
      autoFixAvailable: true,
    },
    {
      id: "f_low_conf",
      ruleId: "QA-COGNITIVE-001",
      severity: "WARNING",
      message: "Borderline cognitive load",
      reason: "High speech density",
      evidence: [],
      confidence: 0.65, // < 0.75 threshold -> triggers review!
      autoFixAvailable: true,
    },
    {
      id: "f_blocking",
      ruleId: "QA-EVIDENCE-001",
      severity: "BLOCKING",
      message: "Unverified claim",
      reason: "Missing source",
      evidence: [],
      confidence: 0.95, // BLOCKING always triggers human review
      autoFixAvailable: false,
    },
  ];

  it("enforces rule-specific confidence thresholds and surfaces BLOCKING issues (REQ-4I-029)", () => {
    const queue = HumanReviewQueue.evaluateFindings(sampleFindings);

    // Should include f_low_conf and f_blocking, but NOT f_high_conf
    assert.equal(queue.length, 2);
    assert.ok(queue.some((item) => item.id === "rev_f_low_conf"));
    assert.ok(queue.some((item) => item.id === "rev_f_blocking"));
    assert.ok(!queue.some((item) => item.id === "rev_f_high_conf"));
  });

  it("sorts items by calculated priority descending deterministically (REQ-4I-031)", () => {
    const queue = HumanReviewQueue.evaluateFindings(sampleFindings);
    assert.ok(queue[0].priority >= queue[1].priority);
    assert.equal(queue[0].severity, "BLOCKING"); // BLOCKING has higher base priority
  });

  it("records immutable human editorial decisions without modifying original history (REQ-4I-032)", () => {
    const queue = HumanReviewQueue.evaluateFindings(sampleFindings);
    const item = queue[0];

    const { updatedItem, decision } = HumanReviewQueue.recordDecision({
      item,
      newStatus: "APPROVED",
      reason: "Editor verified primary source citation in printed archival records.",
      checksumBefore: "prev_hash_123",
    });

    assert.equal(updatedItem.status, "APPROVED");
    assert.equal(decision.previousStatus, "PENDING");
    assert.equal(decision.newStatus, "APPROVED");
    assert.equal(decision.actor, "HUMAN");
    assert.equal(decision.checksumBefore, "prev_hash_123");
    assert.ok(decision.checksumAfter.length === 64);
  });

  it("PBT: priority is always strictly bounded in [0.0, 1.0]", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("BLOCKING", "WARNING", "SUGGESTION" as const),
        fc.double({ min: 0.0, max: 1.0, noNaN: true }),
        fc.boolean(),
        (sev, conf, fix) => {
          const prio = HumanReviewQueue.calculatePriority(sev, conf, fix);
          return Number.isFinite(prio) && prio >= 0.0 && prio <= 1.0;
        }
      ),
      { numRuns: 50 }
    );
  });
});
