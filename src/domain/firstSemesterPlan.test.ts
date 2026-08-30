import { buildFirstSemesterPlan } from "./firstSemesterPlan";
import type { Major } from "../data/schools/types";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const psychology: Major = {
  id: "psychology",
  name: "Psychology",
  school: "College of Literature, Science, and the Arts",
  family: "Social & Behavioral Sciences",
  access: "direct",
};

const plan = buildFirstSemesterPlan(psychology, {
  belonging: 55,
  workload: 30,
  careerOptions: 15,
});

assert(plan.source === "specific_major", "a concrete major is preserved");
assert(plan.majorId === "psychology", "the selected major remains traceable");
assert(plan.slots.length === 4, "the plan has four bounded requirement slots");
assert(
  plan.slots.map(({ kind }) => kind).join(",") ===
    "foundation,exploration,breadth,community",
  "all required slot kinds appear in stable order",
);
assert(
  plan.priorityOrder[0] === "belonging",
  "the highest allocation shapes the plan first",
);
assert(
  plan.slots[0].selectionGuidance.includes("relationships can form"),
  "priority guidance reaches the draft",
);
assert(
  plan.slots.every(({ verificationRequired }) => verificationRequired),
  "every dynamic recommendation requires verification",
);
assert(
  plan.disclaimer.includes("not registration or degree advice"),
  "the plan states its advising boundary",
);

const fallback = buildFirstSemesterPlan(null, {});
assert(fallback.source === "broad_fallback", "missing majors use a fallback");
assert(fallback.majorId === null, "the fallback invents no program id");
assert(
  fallback.slots[0].title === "Foundation to verify",
  "the fallback does not imply a campus-specific requirement",
);

const broad: Major = {
  id: "broad-social-behavioral-sciences",
  name: "Social & Behavioral Sciences",
  school: "Broad field — confirm programs with your university",
  family: "Social & Behavioral Sciences",
  access: "school_specific",
};
assert(
  buildFirstSemesterPlan(broad).source === "broad_fallback",
  "broad recommendation categories are not treated as specific majors",
);
