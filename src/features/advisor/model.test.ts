import assert from "node:assert/strict";
import test from "node:test";
import { createEvidenceProfile, normalizeEvidence } from "../../domain";
import { createInitialSessionState } from "../../state";
import { formatAdvisorBrief, generateAdvisorBrief } from "./model";

test("builds a useful brief while withholding free text by default", () => {
  const session = createInitialSessionState();
  session.onboarding.admittedProgram = "Engineering";
  session.onboarding.admittedLikes = ["building things"];
  session.onboarding.admittedLikeNote = "Private family context";
  session.onboarding.consideredMajors = ["Design"];
  session.reflections.demo = {
    missionId: "demo",
    energy: "energized",
    friction: ["iteration"],
    note: "Private reflection",
    recordedAt: null,
  };
  const evidence = normalizeEvidence({
    observations: [
      {
        id: "build-signal",
        source: "fieldwork",
        sourceId: "demo",
        label: "Built something",
        signals: { build: 1, handsOn: 0.8 },
        weight: 1,
      },
    ],
  });
  const brief = generateAdvisorBrief({
    session,
    campusName: "Test University",
    rankedDirections: [{ id: "design", name: "Design", score: 82 }],
    evidence,
    generatedAt: "2026-08-30T12:00:00Z",
  });

  assert.equal(brief.startingPoint?.admittedFor, "Engineering");
  assert.equal(brief.startingPoint?.note, undefined);
  assert.equal(brief.fieldwork[0].note, undefined);
  assert.match(brief.tensions[0], /not currently among/);
  assert.match(formatAdvisorBrief(brief), /EXPLORATION BRIEF/);
});

test("honors student disclosure controls", () => {
  const session = createInitialSessionState();
  session.onboarding.admittedProgram = "History";
  const brief = generateAdvisorBrief({
    session,
    campusName: "Test University",
    rankedDirections: [{ id: "math", name: "Mathematics", score: 70 }],
    evidence: normalizeEvidence(createEvidenceProfile()),
    generatedAt: "now",
    preferences: { includeAdmissionsContext: false },
  });
  assert.equal(brief.startingPoint, undefined);
  assert.match(brief.tensions[0], /not yet been tested/);
  assert.doesNotMatch(formatAdvisorBrief(brief), /History/);
  assert.doesNotMatch(JSON.stringify(brief), /History/);
});

test("formatted brief includes completed fieldwork and only explicitly shared notes", () => {
  const session = createInitialSessionState();
  session.reflections.demo = {
    missionId: "demo",
    energy: "drained",
    friction: ["iteration"],
    note: "Private reflection",
    recordedAt: null,
  };
  const input = {
    session,
    campusName: "Test University",
    rankedDirections: [],
    evidence: normalizeEvidence(createEvidenceProfile()),
    generatedAt: "now",
  };
  const safe = formatAdvisorBrief(generateAdvisorBrief(input));
  assert.match(safe, /demo.*drained/);
  assert.doesNotMatch(safe, /Private reflection/);
  const shared = formatAdvisorBrief(
    generateAdvisorBrief({
      ...input,
      preferences: { includeFieldworkNotes: true },
    }),
  );
  assert.match(shared, /Private reflection/);
});
