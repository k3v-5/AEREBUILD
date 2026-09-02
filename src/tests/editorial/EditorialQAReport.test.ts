import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EditorialQAReportBuilder } from "../../editorial/qa/editorial-qa-report.js";
import { EditorialQAFinding, createFinding } from "../../editorial/qa/editorial-findings.js";
import { HumanReviewItem } from "../../editorial/qa/human-review-queue.js";

describe("REQ-030 §17, §18, §30: EditorialQAReport Suite", () => {
  it("determines correct status across all 4 canonical states (§18)", () => {
    // 1. BLOCKED
    assert.equal(
      EditorialQAReportBuilder.determineStatus({
        blockingCount: 1,
        warningCount: 0,
        pendingReviewsCount: 0,
      }),
      "BLOCKED"
    );

    // 2. REVIEW_REQUIRED
    assert.equal(
      EditorialQAReportBuilder.determineStatus({
        blockingCount: 0,
        warningCount: 2,
        pendingReviewsCount: 1,
      }),
      "REVIEW_REQUIRED"
    );

    // 3. PASS_WITH_WARNINGS
    assert.equal(
      EditorialQAReportBuilder.determineStatus({
        blockingCount: 0,
        warningCount: 1,
        pendingReviewsCount: 0,
      }),
      "PASS_WITH_WARNINGS"
    );

    // 4. PASS
    assert.equal(
      EditorialQAReportBuilder.determineStatus({
        blockingCount: 0,
        warningCount: 0,
        pendingReviewsCount: 0,
      }),
      "PASS"
    );
  });
  it("calculates scores clamped strictly to [0.00, 100.00] (§17)", () => {
    const findings: EditorialQAFinding[] = [
      createFinding({
        id: "f1",
        ruleId: "QA-STRUCT-001",
        severity: "BLOCKING",
        category: "STRUCTURAL",
        title: "Missing Clip",
        message: "Missing clip",
        affectedNodeIds: ["c1"],
        confidence: 1.0,
      }),
      createFinding({
        id: "f2",
        ruleId: "QA-PACE-001",
        severity: "WARNING",
        category: "PACING",
        title: "Pacing Drift",
        message: "Pacing drift",
        affectedNodeIds: ["p1"],
        confidence: 0.85,
      }),
    ];

    const score = EditorialQAReportBuilder.calculateScores(findings);

    assert.ok(score.overall >= 0 && score.overall <= 100);
    assert.ok(score.technical >= 0 && score.technical <= 100);
    assert.ok(score.pacing >= 0 && score.pacing <= 100);
    assert.ok(score.narrative === 100); // unaffected category is 100
  });

  it("builds canonical report and generates reproducible SHA-256 seal (§30, §31)", () => {
    const findings: EditorialQAFinding[] = [];
    const reviewQueue: HumanReviewItem[] = [];

    const report1 = EditorialQAReportBuilder.buildReport({
      inputChecksumSha256: "a".repeat(64),
      findings,
      reviewQueue,
    });

    const report2 = EditorialQAReportBuilder.buildReport({
      inputChecksumSha256: "a".repeat(64),
      findings,
      reviewQueue,
    });

    assert.equal(report1.status, "PASS");
    assert.equal(report1.score.overall, 100);
    assert.equal(report1.checksumSha256, report2.checksumSha256);
    assert.equal(report1.checksumSha256.length, 64);
  });
});
