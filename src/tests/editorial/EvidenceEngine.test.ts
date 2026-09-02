import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { EvidenceEngine } from "../../editorial/evidence/evidence-engine.js";
import { ClaimEntity } from "../../editorial/contracts/knowledge-graph.types.js";

describe("Fase 4C — Fact & Evidence Layer Engine Suite", () => {
  const sampleClaims: ClaimEntity[] = [
    {
      id: "claim_01",
      text: "Global carbon emissions peaked in 2024 according to the IEA report.",
      speakerId: "speaker_expert_1",
      sourceCitation: "International Energy Agency, World Energy Outlook 2024, p. 45",
      evidenceAssetIds: ["asset_pdf_iea_report", "asset_graph_emissions_2024"],
      confidence: 0.98,
      status: "UNVERIFIED",
      requiresOnScreenCitation: true,
    },
    {
      id: "claim_02",
      text: "Local temperatures reached 48 degrees Celsius during the heatwave.",
      speakerId: "speaker_witness_1",
      sourceCitation: "National Meteorological Service Station Data",
      evidenceAssetIds: ["asset_photo_thermometer"],
      confidence: 0.95,
      status: "UNVERIFIED",
      requiresOnScreenCitation: false,
    },
    {
      id: "claim_03",
      text: "Unverified rumor without backing documentation.",
      evidenceAssetIds: [],
      confidence: 0.40,
      status: "UNVERIFIED",
      requiresOnScreenCitation: false,
    },
  ];

  it("audits claims, verifies backed assertions and generates lower-third citation cards", () => {
    const report = EvidenceEngine.auditEvidence({
      projectId: "doc_factcheck_01",
      claims: sampleClaims,
      claimTimings: {
        claim_01: { startSeconds: 12.0, durationSeconds: 6.0 },
      },
    });

    assert.equal(report.projectId, "doc_factcheck_01");
    assert.equal(report.totalClaims, 3);
    assert.equal(report.verifiedClaims, 2);
    assert.equal(report.unverifiedClaims, 1);
    assert.equal(report.missingSourceClaims, 0);

    // Verify claim 1 generated citation card
    assert.equal(report.citationCards.length, 1);
    const card = report.citationCards[0];
    assert.equal(card.claimId, "claim_01");
    assert.equal(card.timelineStartSeconds, 12.0);
    assert.equal(card.timelineEndSeconds, 18.0);
    assert.ok(card.onScreenText.includes("International Energy Agency"));
  });

  it("flags missing citations as blocking issues when on-screen citation is required", () => {
    const problematicClaims: ClaimEntity[] = [
      {
        id: "claim_missing",
        text: "The financial deficit was $4.5B.",
        evidenceAssetIds: ["asset_financial_doc"],
        sourceCitation: "", // Empty citation
        status: "UNVERIFIED",
        requiresOnScreenCitation: true,
        confidence: 0.9,
      },
    ];

    const report = EvidenceEngine.auditEvidence({
      projectId: "doc_missing_citation",
      claims: problematicClaims,
    });

    assert.equal(report.missingSourceClaims, 1);
    assert.equal(report.audits[0].status, "MISSING_SOURCE");
    assert.equal(report.audits[0].blockingIssue, true);
  });

  it("guarantees 100% deterministic SHA-256 report checksum", () => {
    const report1 = EvidenceEngine.auditEvidence({
      projectId: "doc_det_fact",
      claims: sampleClaims,
    });
    const report2 = EvidenceEngine.auditEvidence({
      projectId: "doc_det_fact",
      claims: sampleClaims,
    });

    assert.equal(report1.checksumSha256.length, 64);
    assert.equal(report1.checksumSha256, report2.checksumSha256);
  });

  it("PBT: evidenceIntegrityScore is always strictly bounded within [0.0, 100.0]", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            text: fc.string({ minLength: 1 }),
            sourceCitation: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
            evidenceAssetIds: fc.array(fc.string({ minLength: 1 })),
            confidence: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
            status: fc.constantFrom("VERIFIED", "UNVERIFIED", "CONTRADICTED", "MISSING_SOURCE", "EDITOR_REVIEW"),
            requiresOnScreenCitation: fc.boolean(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (generatedClaims) => {
          const report = EvidenceEngine.auditEvidence({
            projectId: "pbt_fact_test",
            claims: generatedClaims as ClaimEntity[],
          });
          return report.evidenceIntegrityScore >= 0.0 && report.evidenceIntegrityScore <= 100.0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
