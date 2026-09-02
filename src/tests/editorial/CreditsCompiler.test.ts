import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { CreditsCompiler } from "../../editorial/credits/credits-compiler.js";
import { PersonEntity } from "../../editorial/contracts/knowledge-graph.types.js";
import { ArchivalAsset } from "../../editorial/contracts/archive.types.js";

describe("Fase 4C — Credits & Attribution Compiler Suite", () => {
  const samplePeople: PersonEntity[] = [
    {
      id: "p_01",
      name: "Dr. Elena Rostova",
      role: "EXPERT",
      title: "Chief Climatologist",
      affiliation: "Atmospheric Science Institute",
    },
    {
      id: "p_02",
      name: "Marcus Vance",
      role: "WITNESS",
      title: "Local Community Leader",
      affiliation: "Valley Residents Association",
    },
    {
      id: "p_03",
      name: "Sarah Chen",
      role: "INTERVIEWER",
      title: "Senior Investigative Journalist",
    },
  ];

  const sampleArchives: ArchivalAsset[] = [
    {
      id: "a_01",
      sourcePath: "/archive/news1.mp4",
      title: "1980 News Bulletin",
      sourceArchive: "National Public Broadcast",
      licenseStatus: "PUBLIC_DOMAIN",
      aspectRatio: "4:3",
      isStillPhoto: false,
    },
    {
      id: "a_02",
      sourcePath: "/archive/doc1.png",
      title: "City Council Minutes 1982",
      sourceArchive: "City Municipal Archives",
      licenseStatus: "PUBLIC_DOMAIN",
      aspectRatio: "1:1",
      isStillPhoto: true,
    },
  ];

  it("compiles speaker lower-thirds with uppercase text and TIME_INSIGNIA styling (REQ-088)", () => {
    const appearances = [
      { speakerId: "p_01", startSeconds: 15.0, durationSeconds: 5.0 },
      { speakerId: "p_02", startSeconds: 45.0, durationSeconds: 6.0 },
    ];

    const lowerThirds = CreditsCompiler.compileSpeakerLowerThirds({
      people: samplePeople,
      speakerAppearances: appearances,
    });

    assert.equal(lowerThirds.length, 2);
    assert.equal(lowerThirds[0].fullName, "DR. ELENA ROSTOVA");
    assert.equal(lowerThirds[0].roleOrTitle, "CHIEF CLIMATOLOGIST");
    assert.equal(lowerThirds[0].affiliation, "ATMOSPHERIC SCIENCE INSTITUTE");
    assert.equal(lowerThirds[0].style, "TIME_INSIGNIA");
    assert.equal(lowerThirds[0].timelineStartSeconds, 15.0);
    assert.equal(lowerThirds[0].timelineEndSeconds, 20.0);
  });

  it("compiles structured end credits grouped into thematic sections (REQ-089)", () => {
    const plan = CreditsCompiler.compileFullCredits({
      projectId: "doc_credits_01",
      people: samplePeople,
      archivalAssets: sampleArchives,
      directorName: "Alex Rivera",
      producerName: "Maria Santos",
      musicCredits: ["Symphonic Variations in D Minor", "Ambient Drone Suite"],
      mode: "CARDS",
    });

    assert.equal(plan.projectId, "doc_credits_01");
    assert.equal(plan.endCreditsMode, "CARDS");
    assert.ok(plan.endCredits.length >= 4);

    // Section 1: Leadership
    const s1 = plan.endCredits.find((s) => s.sectionTitle === "CREATIVE & PRODUCTION");
    assert.ok(s1 !== undefined);
    assert.equal(s1.entries[0].role, "DIRECTED BY");
    assert.deepEqual(s1.entries[0].names, ["Alex Rivera"]);

    // Section 2: Featured Voices
    const s2 = plan.endCredits.find((s) => s.sectionTitle === "FEATURED VOICES");
    assert.ok(s2 !== undefined);
    assert.equal(s2.entries.length, 2); // Elena Rostova & Marcus Vance (Expert & Witness)

    // Section 3: Archival
    const s3 = plan.endCredits.find((s) => s.sectionTitle === "ARCHIVAL FOOTAGE & PHOTOGRAPHY");
    assert.ok(s3 !== undefined);

    // Section 4: Music
    const s4 = plan.endCredits.find((s) => s.sectionTitle === "MUSIC & SOUND DESIGN");
    assert.ok(s4 !== undefined);
  });

  it("guarantees 100% deterministic SHA-256 credits plan checksum across runs", () => {
    const plan1 = CreditsCompiler.compileFullCredits({
      projectId: "det_credits",
      people: samplePeople,
      archivalAssets: sampleArchives,
      directorName: "Director Name",
    });
    const plan2 = CreditsCompiler.compileFullCredits({
      projectId: "det_credits",
      people: samplePeople,
      archivalAssets: sampleArchives,
      directorName: "Director Name",
    });

    assert.equal(plan1.checksumSha256.length, 64);
    assert.equal(plan1.checksumSha256, plan2.checksumSha256);
  });

  it("PBT: estimated credits duration is strictly positive and bounded", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("CARDS", "CRAWL", "STATIC_SLATE"),
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            role: fc.constantFrom("EXPERT", "WITNESS", "GUEST", "NARRATOR"),
            title: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          }),
          { maxLength: 10 }
        ),
        (mode, people) => {
          const plan = CreditsCompiler.compileFullCredits({
            projectId: "pbt_credits_test",
            people: people as PersonEntity[],
            mode: mode as "CARDS" | "CRAWL" | "STATIC_SLATE",
          });

          return plan.estimatedEndCreditsDurationSeconds > 0.0 && plan.estimatedEndCreditsDurationSeconds <= 300.0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
