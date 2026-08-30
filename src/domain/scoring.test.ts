import {
  applyFieldworkObservation,
  computeReadiness,
  createEvidenceProfile,
  normalizeEvidence,
  rankMajors,
} from "./scoring";
import type { EvidenceProfile, MajorFitProfile } from "./types";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const equal = <T>(actual: T, expected: T, message: string) => {
  assert(
    Object.is(actual, expected),
    `${message}: expected ${String(expected)}, received ${String(actual)}`,
  );
};

const observation = (
  signals: EvidenceProfile["observations"][number]["signals"],
): EvidenceProfile => ({
  observations: [
    {
      id: "test",
      source: "question",
      sourceId: "test",
      signals,
      weight: 1,
      label: "Test",
    },
  ],
});

const negative = normalizeEvidence(observation({ analyze: -0.75 }));
equal(
  negative.workModes.analyze,
  -0.75,
  "normalization preserves counter-evidence",
);

const bounded = normalizeEvidence(observation({ analyze: -3, build: 4 }));
equal(bounded.workModes.analyze, -1, "negative signals are clamped at -1");
equal(bounded.workModes.build, 1, "positive signals are clamped at 1");

const empty = createEvidenceProfile();
const first = applyFieldworkObservation(empty, {
  id: "club-visit",
  label: "Visited a project team",
  signals: { build: 0.8, coordination: -0.4 },
  weight: 1.5,
});
equal(
  empty.observations.length,
  0,
  "fieldwork application does not mutate the input profile",
);
equal(first.observations.length, 1, "fieldwork creates one observation");
equal(
  first.observations[0].id,
  "fieldwork:club-visit",
  "fieldwork ids are namespaced",
);
equal(
  first.observations[0].source,
  "fieldwork",
  "fieldwork uses the fieldwork source",
);
equal(
  first.observations[0].weight,
  1.5,
  "fieldwork preserves an explicit weight",
);

const revised = applyFieldworkObservation(first, {
  id: "club-visit",
  label: "Reflected after the visit",
  signals: { build: -0.2 },
});
equal(
  revised.observations.length,
  1,
  "reapplying the same fieldwork id replaces its observation",
);
equal(
  revised.observations[0].label,
  "Reflected after the visit",
  "replacement uses the latest reflection",
);
equal(revised.observations[0].weight, 1, "fieldwork defaults to unit weight");
equal(
  computeReadiness(revised).sourceBreadth,
  1,
  "fieldwork contributes to readiness source breadth",
);

const invalid = applyFieldworkObservation(revised, {
  id: "",
  label: "Invalid activity",
  signals: { build: 1 },
});
assert(
  invalid === revised,
  "invalid fieldwork is rejected without allocating a new profile",
);

const malformed: EvidenceProfile = {
  observations: [
    {
      id: "bad",
      source: "fieldwork",
      sourceId: "bad",
      signals: { analyze: Number.NaN },
      weight: 1,
      label: "Bad",
    },
  ],
};
equal(
  normalizeEvidence(malformed).workModes.analyze,
  0,
  "non-finite persisted signals do not poison normalization",
);

const tiedMajors: MajorFitProfile[] = [
  { id: "z", name: "Zeta", workModes: { analyze: 1 } },
  { id: "a", name: "Alpha", workModes: { analyze: 1 } },
];
const ranked = rankMajors(observation({ analyze: 1 }), tiedMajors);
equal(ranked[0].id, "a", "equal scores use a deterministic name tie-breaker");

const opposed = rankMajors(observation({ analyze: -1 }), tiedMajors);
equal(opposed[0].score, -100, "counter-evidence affects fit direction");

assert(true, "domain scoring tests completed");
