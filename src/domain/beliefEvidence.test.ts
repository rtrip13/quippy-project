import {
  buildBeliefEvidenceMap,
  resolveInterestDirection,
} from "./beliefEvidence";
import type { EvidenceProfile, MajorFitProfile } from "./types";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const directions: MajorFitProfile[] = [
  {
    id: "computer-science-bs",
    name: "Computer Science (BS)",
    workModes: { build: 1, analyze: 0.8 },
    friction: { debugging: 0.9 },
  },
  {
    id: "history",
    name: "History",
    workModes: { synthesize: 1, explain: 0.8 },
    friction: { ambiguity: 0.7 },
  },
];

const profile: EvidenceProfile = {
  observations: [
    {
      id: "one",
      source: "question",
      sourceId: "one",
      label: "Built things",
      weight: 3,
      signals: { build: 1, analyze: 0.8, debugging: 0.7 },
    },
  ],
};

assert(
  resolveInterestDirection("Computer Science major", directions)?.id ===
    "computer-science-bs",
  "typed degree labels resolve deterministically",
);

const map = buildBeliefEvidenceMap(
  {
    admittedFor: "Computer Science",
    consideredMajors: ["History", "computer science bs", "Unlisted subject"],
    likedDimensions: { build: 1 },
  },
  profile,
  directions,
);
assert(map.items.length === 3, "duplicate admissions beliefs are removed");
assert(map.items[0].status === "aligned", "matching evidence is aligned");
assert(
  map.items[2].status === "unresolved_direction" &&
    map.items[2].agreement === null,
  "unknown labels produce no invented score",
);
assert(
  map.disclaimer.includes("never used"),
  "the result explains separation from scoring",
);

const early = buildBeliefEvidenceMap(
  { admittedFor: "History" },
  { observations: [] },
  directions,
);
assert(
  early.items[0].status === "not_enough_evidence",
  "empty evidence stays explicitly inconclusive",
);
