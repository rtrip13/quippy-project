import { strict as assert } from "node:assert";
import test from "node:test";
import type { EvidenceProfile } from "./types";
import { buildEvidenceTimeline } from "./evidenceTimeline";

const profile: EvidenceProfile = {
  observations: [
    {
      id: "fieldwork:economics:work-sample",
      source: "fieldwork",
      sourceId: "economics:work-sample",
      signals: { build: -0.6, iteration: -0.4 },
      weight: 1.1,
      label: "Fieldwork felt drained",
    },
    {
      id: "challenge:first-fix",
      source: "challenge",
      sourceId: "first-fix",
      signals: { investigate: 0.8 },
      weight: 1.2,
      label: "Asked for more evidence",
    },
    {
      id: "subject_enjoyment:Economics",
      source: "subject_enjoyment",
      sourceId: "Economics",
      signals: { analyze: 0.7 },
      weight: 0.7,
      label: "Economics",
    },
  ],
};

const reflections = {
  "economics:work-sample": {
    missionId: "economics:work-sample",
    energy: "drained" as const,
    curiosity: "held" as const,
    repeatIntent: "no" as const,
    friction: ["repetition"],
    note: "",
    recordedAt: "2026-08-30T18:00:00.000Z",
  },
};

test("builds the complete evidence story in stable category order", () => {
  const first = buildEvidenceTimeline({ profile, reflections });
  const second = buildEvidenceTimeline({ profile, reflections });

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.map((entry) => entry.category),
    ["YOU SAID", "YOU DID", "REALITY CHECK", "PATTERN UPDATED"],
  );
  assert.match(first[0].text, /Economics holds your attention/);
  assert.match(first[2].text, /Try one small work sample cost you energy/);
  assert.match(first[3].text, /weakened the signal/);
  assert.equal(first[3].tone, "counter");
});

test("supports a profile before fieldwork without inventing later stages", () => {
  const entries = buildEvidenceTimeline({
    profile: { observations: profile.observations.slice(1) },
  });
  assert.deepEqual(
    entries.map((entry) => entry.category),
    ["YOU SAID", "YOU DID"],
  );
});

test("sorts map reflections deterministically by timestamp then id", () => {
  const entries = buildEvidenceTimeline({
    profile: { observations: [] },
    reflections: {
      later: {
        ...reflections["economics:work-sample"],
        missionId: "later:talk-to-major",
        recordedAt: "2026-08-30T19:00:00.000Z",
      },
      earlier: {
        ...reflections["economics:work-sample"],
        missionId: "earlier:preview-course",
        recordedAt: "2026-08-30T17:00:00.000Z",
      },
    },
  });
  assert.deepEqual(
    entries.map((entry) => entry.sourceId),
    ["earlier:preview-course", "later:talk-to-major"],
  );
});
