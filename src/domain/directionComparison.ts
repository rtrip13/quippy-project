import type {
  EvidenceDimension,
  FrictionFactor,
  MajorFitProfile,
  WorkMode,
} from "./types";

export type ComparisonLevel = "low" | "medium" | "high";

export type DirectionComparison = {
  id: string;
  name: string;
  workStyle: { dimension: WorkMode; score: number }[];
  collaboration: { score: number; level: ComparisonLevel };
  quantitativeIntensity: { score: number; level: ComparisonLevel };
  frustrations: { dimension: FrictionFactor; score: number }[];
  creativeFreedom: { score: number; level: ComparisonLevel };
  suggestedExperiments: string[];
  rubric: string;
};

const value = (number: number | undefined) =>
  Math.max(0, Math.min(1, number ?? 0));
const percent = (number: number) => Math.round(number * 100);
const level = (number: number): ComparisonLevel =>
  number >= 0.67 ? "high" : number >= 0.34 ? "medium" : "low";

const experimentByDimension: Partial<Record<EvidenceDimension, string>> = {
  analyze:
    "Take apart a real dataset or argument and write down what changes your conclusion.",
  build:
    "Build a rough prototype in one sitting, then note which part you want to improve.",
  create:
    "Make two contrasting versions of the same idea and ask someone to react.",
  explain:
    "Teach a difficult idea to a peer and notice which part feels energizing.",
  investigate: "Follow one unanswered question through three credible sources.",
  organize:
    "Plan a small campus event or project with owners, timing, and constraints.",
  persuade:
    "Make the strongest case for a campus change to a skeptical friend.",
  serve:
    "Shadow or volunteer in a role where another person depends on your work.",
  strategize:
    "Create a decision memo with options, tradeoffs, and a recommendation.",
  synthesize: "Turn several conflicting sources into a one-page explanation.",
  collaborative:
    "Join one working meeting and notice whether coordination adds or drains energy.",
  publicFacing: "Try a public-facing shift, presentation, or office hour.",
  handsOn:
    "Attend a lab, studio, clinic, or maker session and do the work yourself.",
  research:
    "Ask a graduate student to show you one ordinary hour of their research process.",
  design:
    "Redesign one frustrating campus experience and test the sketch with a student.",
};

const rankedDimensions = (direction: MajorFitProfile) =>
  Object.entries({
    ...direction.workModes,
    ...direction.activityModes,
    ...direction.environment,
  })
    .filter(
      (entry): entry is [EvidenceDimension, number] =>
        Number.isFinite(entry[1]) && entry[1] > 0,
    )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

/** Creates display-ready, deterministic comparison facets from an explainable fit profile. */
export function compareInterestDirection(
  direction: MajorFitProfile,
): DirectionComparison {
  const workStyle = Object.entries(direction.workModes)
    .filter((entry): entry is [WorkMode, number] => Number.isFinite(entry[1]))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([dimension, score]) => ({ dimension, score: percent(value(score)) }));
  const collaborationValue = value(direction.environment?.collaborative);
  // This is a workload-characteristic rubric, not a claim about course prerequisites or ability.
  const quantitativeValue =
    value(direction.workModes.analyze) * 0.5 +
    value(direction.friction?.precision) * 0.3 +
    value(direction.activityModes?.research) * 0.2;
  const creativeValue =
    value(direction.workModes.create) * 0.45 +
    value(direction.activityModes?.design) * 0.35 +
    value(direction.friction?.ambiguity) * 0.2;
  const frustrations = Object.entries(direction.friction ?? {})
    .filter((entry): entry is [FrictionFactor, number] =>
      Number.isFinite(entry[1]),
    )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([dimension, score]) => ({ dimension, score: percent(value(score)) }));
  const suggestedExperiments = rankedDimensions(direction)
    .map(([dimension]) => experimentByDimension[dimension])
    .filter((item): item is string => Boolean(item))
    .filter((item, index, all) => all.indexOf(item) === index)
    .slice(0, 3);
  return {
    id: direction.id,
    name: direction.name,
    workStyle,
    collaboration: {
      score: percent(collaborationValue),
      level: level(collaborationValue),
    },
    quantitativeIntensity: {
      score: percent(quantitativeValue),
      level: level(quantitativeValue),
    },
    frustrations,
    creativeFreedom: {
      score: percent(creativeValue),
      level: level(creativeValue),
    },
    suggestedExperiments,
    rubric:
      "Scores describe the direction's working pattern from transparent profile factors; they do not measure student ability or admission odds.",
  };
}

export function compareInterestDirections(
  directions: MajorFitProfile[],
): DirectionComparison[] {
  return directions.map(compareInterestDirection);
}
