import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { HumanReviewInterface } from "../../editorial/qa/review-ui/human-review-interface.js";
import { HumanReviewItem } from "../../editorial/qa/human-review-queue.js";

describe("P2 — Human Review Visual Interface & Signing Suite (REQ-081)", () => {
  const sampleItems: HumanReviewItem[] = [
    {
      id: "item_01",
      issueId: "QA-ATTN-001-f1",
      priority: 85,
      status: "PENDING",
      severity: "BLOCKING",
      reason: "Attention drop below threshold during climax",
      confidence: 0.65,
      affectedEntityIds: ["clip_climax_01"],
      proposedAction: "Trim preceding pause by 1.2s",
    },
    {
      id: "item_02",
      issueId: "QA-AUD-001-f2",
      priority: 60,
      status: "PENDING",
      severity: "WARNING",
      reason: "Plosive transient detected in voice track",
      confidence: 0.55,
      affectedEntityIds: ["clip_voice_02"],
      proposedAction: "Apply 80Hz highpass filter",
    },
    {
      id: "item_03",
      issueId: "QA-STRUCT-001-f3",
      priority: 30,
      status: "PENDING",
      severity: "SUGGESTION",
      reason: "Consider J-Cut for speaker anticipation",
      confidence: 0.90,
      affectedEntityIds: ["clip_broll_03"],
      proposedAction: "Add 0.4s audio lead",
    },
  ];

  it("lists and filters pending review items stably by severity and confidence", () => {
    const ui = new HumanReviewInterface(sampleItems);
    assert.equal(ui.getPendingCount(), 3);

    // Filter by severity
    const blocking = ui.listPending({ severity: "BLOCKING" });
    assert.equal(blocking.length, 1);
    assert.equal(blocking[0].id, "item_01");

    // Filter by max confidence <= 0.70
    const lowConf = ui.listPending({ maxConfidence: 0.70 });
    assert.equal(lowConf.length, 2);
    assert.equal(lowConf[0].severity, "BLOCKING"); // Stable sorting by severity first
    assert.equal(lowConf[1].severity, "WARNING");
  });

  it("inspects decision with detailed multi-variable deltas", () => {
    const ui = new HumanReviewInterface(sampleItems);
    const inspection = ui.inspectItem("item_01");

    assert.equal(inspection.item.id, "item_01");
    assert.ok(inspection.beforeSnippet.includes("clip_climax_01"));
    assert.ok(inspection.afterSnippet.includes("Trim preceding pause"));
    assert.equal(typeof inspection.attentionDelta, "number");
    assert.equal(typeof inspection.cognitiveLoadDelta, "number");
  });

  it("signs decision with canonical SHA-256 and verifies against exact IR and QA report hashes", () => {
    const ui = new HumanReviewInterface(sampleItems);
    const currentIrHash = crypto.createHash("sha256").update("ir_content_v1").digest("hex");
    const currentQaHash = crypto.createHash("sha256").update("qa_report_v1").digest("hex");

    // Sign decision to APPROVE
    const signed = ui.signDecision({
      itemId: "item_01",
      action: "APPROVE",
      reviewer: "LeadEditor_Alice",
      comment: "Approved trim to maintain dramatic tension.",
      currentIrHash,
      currentQaReportHash: currentQaHash,
    });

    assert.ok(signed.canonicalSignatureSha256.length === 64);
    assert.equal(ui.getPendingCount(), 2); // Item removed from pending

    // Verify valid signature
    const validCheck = ui.verifyDecisionSignature(signed, currentIrHash, currentQaHash);
    assert.equal(validCheck.isValid, true);

    // Verification fails if IR changed
    const modifiedIrHash = crypto.createHash("sha256").update("ir_content_v2").digest("hex");
    const invalidIrCheck = ui.verifyDecisionSignature(signed, modifiedIrHash, currentQaHash);
    assert.equal(invalidIrCheck.isValid, false);
    assert.ok(invalidIrCheck.errorReason?.includes("IR_HASH_MISMATCH"));

    // Verification fails if QA report changed
    const modifiedQaHash = crypto.createHash("sha256").update("qa_report_v2").digest("hex");
    const invalidQaCheck = ui.verifyDecisionSignature(signed, currentIrHash, modifiedQaHash);
    assert.equal(invalidQaCheck.isValid, false);
    assert.ok(invalidQaCheck.errorReason?.includes("QA_REPORT_HASH_MISMATCH"));
  });

  it("guarantees 100% deterministic signature for identical parameters", () => {
    const ui1 = new HumanReviewInterface(sampleItems);
    const ui2 = new HumanReviewInterface(sampleItems);

    const irHash = "abc".repeat(20) + "abcd";
    const qaHash = "def".repeat(20) + "defg";

    const s1 = ui1.signDecision({
      itemId: "item_02",
      action: "REJECT",
      reviewer: "Editor_Bob",
      currentIrHash: irHash,
      currentQaReportHash: qaHash,
      signedAt: "2026-09-02T12:00:00.000Z",
    });

    const s2 = ui2.signDecision({
      itemId: "item_02",
      action: "REJECT",
      reviewer: "Editor_Bob",
      currentIrHash: irHash,
      currentQaReportHash: qaHash,
      signedAt: "2026-09-02T12:00:00.000Z",
    });

    assert.equal(s1.decisionId, s2.decisionId);
    assert.equal(s1.canonicalSignatureSha256, s2.canonicalSignatureSha256);
  });

  it("renders complete offline dashboard HTML string", () => {
    const ui = new HumanReviewInterface(sampleItems);
    const html = ui.renderOfflineDashboardHtml();

    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes("Human Review Queue (REQ-081)"));
    assert.ok(html.includes("QA-ATTN-001-f1"));
    assert.ok(html.includes("QA-AUD-001-f2"));
    assert.ok(html.includes("QA-STRUCT-001-f3"));
  });
});
