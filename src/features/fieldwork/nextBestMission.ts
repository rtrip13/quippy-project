import type {
  EvidenceDimension,
  MajorFitResult,
  NormalizedEvidence,
} from "../../domain";
import { fieldworkMissions } from "./model";

export type NextBestFieldworkMission = {
  missionId: string;
  known: string;
  uncertainty: string;
  rationale: string;
  falsificationPrompts: string[];
};

type MissionTest = {
  missionId: string;
  dimensions: readonly EvidenceDimension[];
  rationale: string;
  prompts: readonly string[];
};

const missionTests: readonly MissionTest[] = [
  {
    missionId: "preview-course",
    dimensions: ["analyze", "research", "deepFocus", "precision"],
    rationale:
      "A real assignment tests whether the coursework holds your attention.",
    prompts: [
      "Did you want to keep going after the preview ended?",
      "Which part felt tedious rather than difficult?",
      "Would you choose another assignment like this?",
    ],
  },
  {
    missionId: "work-sample",
    dimensions: [
      "build",
      "create",
      "design",
      "make",
      "handsOn",
      "iteration",
      "repetition",
    ],
    rationale:
      "A small work sample tests the activity, not the idea of the field.",
    prompts: [
      "Did making the thing give you energy?",
      "Did revision feel useful or repetitive?",
      "Would you do a harder version without a grade?",
    ],
  },
  {
    missionId: "find-group",
    dimensions: ["collaborative", "coordination", "volunteer"],
    rationale:
      "A working group reveals whether the field's social rhythm fits you.",
    prompts: [
      "Did collaboration sharpen or slow your thinking?",
      "What kind of coordination drained you?",
      "Would you return if nobody expected you to?",
    ],
  },
  {
    missionId: "ask-hard-question",
    dimensions: ["investigate", "ambiguity", "debugging"],
    rationale:
      "The least glamorous work is a sharper test than another success story.",
    prompts: [
      "Did the frustrating part still make you curious?",
      "Which recurring task would wear you down?",
      "What answer would make you cross this field off?",
    ],
  },
  {
    missionId: "attend-event",
    dimensions: ["publicFacing", "discuss", "perform", "persuade", "compete"],
    rationale:
      "Watching the work in public tests whether its pace and exchange appeal to you.",
    prompts: [
      "Did you want to join the conversation?",
      "What part felt performative rather than useful?",
      "Would this environment energize you every week?",
    ],
  },
  {
    missionId: "talk-to-major",
    dimensions: ["explain", "teach", "serve", "structured", "fastPaced"],
    rationale:
      "A normal Tuesday exposes the routines hidden by course and career labels.",
    prompts: [
      "Which routine sounded unexpectedly draining?",
      "What did they spend more time doing than you expected?",
      "Would you trade your current Tuesday for theirs?",
    ],
  },
  {
    missionId: "reality-check",
    dimensions: ["synthesize", "strategize", "organize", "independent"],
    rationale:
      "A deliberate review tests whether the pattern survives conflicting evidence.",
    prompts: [
      "What evidence does not fit this recommendation?",
      "Are you drawn to the work or its outcome?",
      "What would you test before committing?",
    ],
  },
];

const labels: Record<EvidenceDimension, string> = {
  analyze: "analysis",
  build: "building",
  create: "creating",
  explain: "explaining",
  investigate: "investigation",
  organize: "organizing",
  persuade: "persuasion",
  serve: "service",
  strategize: "strategy",
  synthesize: "synthesis",
  compete: "competition",
  design: "design",
  discuss: "discussion",
  make: "making",
  perform: "performance",
  research: "research",
  volunteer: "volunteering",
  teach: "teaching",
  collaborative: "collaborative work",
  independent: "independent work",
  handsOn: "hands-on work",
  publicFacing: "public-facing work",
  structured: "structured work",
  fastPaced: "fast-paced work",
  deepFocus: "deep focus",
  ambiguity: "ambiguity",
  debugging: "debugging",
  iteration: "iteration",
  precision: "precision",
  repetition: "repetition",
  coordination: "coordination",
};

const confidenceFor = (
  evidence: Pick<NormalizedEvidence, "confidence">,
  dimension: EvidenceDimension,
) => Math.max(0, Math.min(1, evidence.confidence[dimension] ?? 0));

/** Chooses the smallest mission that tests an important, weakly evidenced fit reason. */
export function selectNextBestFieldworkMission(
  result: Pick<MajorFitResult, "reasons">,
  evidence: Pick<NormalizedEvidence, "confidence">,
  availableMissionIds?: readonly string[],
): NextBestFieldworkMission {
  const reasons = result.reasons.length
    ? result.reasons
    : [{ dimension: "investigate" as const, contribution: 0 }];
  const reasonRank = new Map(
    reasons.map((reason, index) => [reason.dimension, reasons.length - index]),
  );
  const uncertaintyScore = (dimension: EvidenceDimension) => {
    const reason = reasons.find((item) => item.dimension === dimension);
    if (!reason) return 0;
    return (
      Math.max(0.05, reason.contribution) *
      (reasonRank.get(dimension) ?? 1) *
      (1 - confidenceFor(evidence, dimension))
    );
  };

  const available = availableMissionIds?.length
    ? missionTests.filter((mission) =>
        availableMissionIds.includes(mission.missionId),
      )
    : missionTests;
  const selected = (available.length ? available : missionTests)
    .map((mission, index) => ({
      mission,
      index,
      score: mission.dimensions.reduce(
        (total, dimension) => total + uncertaintyScore(dimension),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].mission;

  const testedDimension =
    [...selected.dimensions]
      .filter((dimension) => reasonRank.has(dimension))
      .sort(
        (a, b) =>
          uncertaintyScore(b) - uncertaintyScore(a) ||
          (reasonRank.get(b) ?? 0) - (reasonRank.get(a) ?? 0),
      )[0] ?? reasons[0].dimension;
  const knownDimension = [...reasons].sort(
    (a, b) =>
      confidenceFor(evidence, b.dimension) -
        confidenceFor(evidence, a.dimension) || b.contribution - a.contribution,
  )[0].dimension;
  const knownConfidence = confidenceFor(evidence, knownDimension);

  return {
    missionId: selected.missionId,
    known:
      knownConfidence >= 0.6
        ? `Evidence consistently points to ${labels[knownDimension]}.`
        : `There is an early signal toward ${labels[knownDimension]}.`,
    uncertainty: `We still need direct evidence about ${labels[testedDimension]}.`,
    rationale: selected.rationale,
    falsificationPrompts: [...selected.prompts],
  };
}

// Fail fast in development if this model drifts from the canonical mission list.
const knownMissionIds = new Set(fieldworkMissions.map((mission) => mission.id));
missionTests.forEach(({ missionId }) => {
  if (!knownMissionIds.has(missionId)) {
    throw new Error(`Unknown fieldwork mission: ${missionId}`);
  }
});
