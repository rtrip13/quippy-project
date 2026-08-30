import {
  compareInterestDirection,
  compareInterestDirections,
} from "./directionComparison";
import type { MajorFitProfile } from "./types";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const direction: MajorFitProfile = {
  id: "design-engineering",
  name: "Design Engineering",
  workModes: { build: 1, create: 0.9, analyze: 0.6 },
  activityModes: { design: 1, make: 0.8, research: 0.2 },
  environment: { collaborative: 0.8, handsOn: 0.9 },
  friction: { iteration: 1, precision: 0.6, ambiguity: 0.7 },
};

const comparison = compareInterestDirection(direction);
assert(comparison.workStyle[0].dimension === "build", "work style is ranked");
assert(comparison.collaboration.level === "high", "collaboration is labeled");
assert(
  comparison.quantitativeIntensity.score === 52,
  "quantitative rubric remains deterministic",
);
assert(
  comparison.creativeFreedom.level === "high",
  "creative freedom is labeled",
);
assert(
  comparison.frustrations[0].dimension === "iteration",
  "likely friction is surfaced",
);
assert(comparison.suggestedExperiments.length === 3, "experiments are bounded");
assert(
  compareInterestDirections([direction, { ...direction, id: "second" }])[1]
    .id === "second",
  "side-by-side order follows the caller's selection",
);
