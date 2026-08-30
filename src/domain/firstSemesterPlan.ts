import type { Major } from "../data/schools/types";

export type SemesterPriority =
  "affordability" | "prestige" | "workload" | "careerOptions" | "belonging";

export type SemesterPriorities = Partial<Record<SemesterPriority, number>>;

export type RequirementSlotKind =
  "foundation" | "exploration" | "breadth" | "community";

export type FirstSemesterSlot = {
  id: RequirementSlotKind;
  kind: RequirementSlotKind;
  title: string;
  purpose: string;
  selectionGuidance: string;
  creditRange: readonly [number, number];
  verificationRequired: boolean;
};

export type FirstSemesterPlan = {
  majorId: string | null;
  majorName: string;
  schoolName: string | null;
  source: "specific_major" | "broad_fallback";
  priorityOrder: SemesterPriority[];
  slots: FirstSemesterSlot[];
  estimatedAcademicCredits: readonly [number, number];
  disclaimer: string;
};

export const FIRST_SEMESTER_PLAN_DISCLAIMER =
  "This is an exploration draft, not registration or degree advice. Verify course availability, prerequisites, placement, credit load, and degree requirements with the university and an academic advisor.";

const PRIORITY_ORDER: readonly SemesterPriority[] = [
  "affordability",
  "prestige",
  "workload",
  "careerOptions",
  "belonging",
];

const priorityGuidance: Record<SemesterPriority, string> = {
  affordability:
    "Prefer options already covered by your program and avoid extra materials or fees.",
  prestige:
    "Use official department outcomes and access to faculty—not reputation alone—as evidence.",
  workload:
    "Balance reading, problem sets, labs, studios, and group work rather than stacking one demanding format.",
  careerOptions:
    "Favor a transferable skill or introductory course that keeps more than one path open.",
  belonging:
    "Choose at least one small, discussion-based, cohort, or student-group experience where relationships can form.",
};

const rankedPriorities = (priorities: SemesterPriorities): SemesterPriority[] =>
  [...PRIORITY_ORDER].sort(
    (a, b) =>
      Math.max(0, priorities[b] ?? 0) - Math.max(0, priorities[a] ?? 0) ||
      PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b),
  );

const guidanceFor = (
  priorities: readonly SemesterPriority[],
  count = 2,
): string =>
  priorities
    .slice(0, count)
    .map((priority) => priorityGuidance[priority])
    .join(" ");

const isSpecificMajor = (major: Major | null | undefined): major is Major =>
  Boolean(major && !major.id.startsWith("broad-"));

/**
 * Builds an honest planning scaffold without inventing course numbers, sections,
 * prerequisites, or registration availability.
 */
export function buildFirstSemesterPlan(
  major: Major | null | undefined,
  priorities: SemesterPriorities = {},
): FirstSemesterPlan {
  const specific = isSpecificMajor(major);
  const priorityOrder = rankedPriorities(priorities);
  const majorName = specific ? major.name : "an interest direction";
  const schoolName = specific ? major.school : null;
  const commonGuidance = guidanceFor(priorityOrder);

  const slots: FirstSemesterSlot[] = [
    {
      id: "foundation",
      kind: "foundation",
      title: specific ? `${major.name} foundation` : "Foundation to verify",
      purpose: specific
        ? `Reserve room for one or two official first-year requirements or prerequisites for ${major.name}.`
        : "Reserve room for one or two foundational courses after confirming a specific program.",
      selectionGuidance: `${commonGuidance} Confirm the correct starting level and sequence with the department.`,
      creditRange: [6, 8],
      verificationRequired: true,
    },
    {
      id: "exploration",
      kind: "exploration",
      title: "Exploration course",
      purpose: specific
        ? `Test the everyday questions and work of ${major.name} before overcommitting.`
        : "Use one introductory course to compare a specific field with your current broad direction.",
      selectionGuidance: `${guidanceFor(priorityOrder, 1)} Prefer a course with a real work sample, project, lab, studio, or substantial discussion.`,
      creditRange: [3, 4],
      verificationRequired: true,
    },
    {
      id: "breadth",
      kind: "breadth",
      title: "Breadth or general-education course",
      purpose:
        "Make progress on a verified breadth requirement while testing a second kind of work.",
      selectionGuidance: `${priorityGuidance.workload} Confirm that the course fulfills the intended requirement before enrolling.`,
      creditRange: [3, 4],
      verificationRequired: true,
    },
    {
      id: "community",
      kind: "community",
      title: "Campus community experiment",
      purpose: specific
        ? `Attend a beginner-friendly club, department event, or peer group connected to ${major.name}.`
        : "Attend a beginner-friendly club or event connected to the field you are testing.",
      selectionGuidance: `${priorityGuidance.belonging} Verify the event date, access rules, and current organization status before attending.`,
      creditRange: [0, 0],
      verificationRequired: true,
    },
  ];

  return {
    majorId: specific ? major.id : null,
    majorName,
    schoolName,
    source: specific ? "specific_major" : "broad_fallback",
    priorityOrder,
    slots,
    estimatedAcademicCredits: [12, 16],
    disclaimer: FIRST_SEMESTER_PLAN_DISCLAIMER,
  };
}
