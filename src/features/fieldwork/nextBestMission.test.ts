import { normalizeEvidence } from "../../domain";
import type { EvidenceDimension, MajorFitResult } from "../../domain";
import { fieldworkMissions } from "./model";
import { selectNextBestFieldworkMission } from "./nextBestMission";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const result: MajorFitResult = {
  id: "economics",
  name: "Economics",
  score: 0.82,
  reasons: [
    { dimension: "investigate", contribution: 0.8 },
    { dimension: "analyze", contribution: 0.7 },
    { dimension: "ambiguity", contribution: 0.5 },
  ],
};

const evidenceWith = (values: Partial<Record<EvidenceDimension, number>>) => {
  const evidence = normalizeEvidence({ observations: [] });
  Object.assign(evidence.confidence, values);
  return evidence;
};

const first = selectNextBestFieldworkMission(
  result,
  evidenceWith({ investigate: 0.1, analyze: 0.9, ambiguity: 0.8 }),
);
assert(
  first.missionId === "ask-hard-question",
  "tests the important reason with the weakest evidence",
);
assert(
  first.uncertainty.includes("investigation"),
  "names the uncertainty the mission resolves",
);
assert(
  first.falsificationPrompts.length === 3,
  "returns a concise set of falsification prompts",
);

const second = selectNextBestFieldworkMission(
  result,
  evidenceWith({ investigate: 0.95, analyze: 0.1, ambiguity: 0.9 }),
);
assert(
  second.missionId === "preview-course",
  "changes the mission when a different reason is least certain",
);
assert(
  second.known === "Evidence consistently points to investigation.",
  "uses stronger language only for higher-confidence evidence",
);
assert(
  fieldworkMissions.some((mission) => mission.id === second.missionId),
  "always returns a canonical fieldwork mission id",
);

const repeated = selectNextBestFieldworkMission(
  result,
  evidenceWith({ investigate: 0.1, analyze: 0.9, ambiguity: 0.8 }),
);
assert(
  JSON.stringify(first) === JSON.stringify(repeated),
  "selection and copy are deterministic",
);

const availableOnly = selectNextBestFieldworkMission(result, evidenceWith({}), [
  "work-sample",
  "preview-course",
]);
assert(
  ["work-sample", "preview-course"].includes(availableOnly.missionId),
  "can recommend only unfinished, available experiments",
);
const lastRemaining = selectNextBestFieldworkMission(result, evidenceWith({}), [
  "reality-check",
]);
assert(
  lastRemaining.missionId === "reality-check",
  "does not repeat a completed mission when only one remains",
);
