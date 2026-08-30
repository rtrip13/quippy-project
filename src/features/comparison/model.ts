import type { Access, Family, Major, SchoolData } from "../../data/schools";

export const MIN_COMPARISON_PROGRAMS = 2;
export const MAX_COMPARISON_PROGRAMS = 3;

export type ComparisonSectionKey =
  "workStyle" | "coursework" | "sampleWork" | "tradeoffs";

export type ProgramComparisonDetails = Partial<
  Record<ComparisonSectionKey, readonly string[]>
>;

export type ProgramComparisonDetailsById = Readonly<
  Record<string, ProgramComparisonDetails>
>;

export type ComparisonSection = {
  key: ComparisonSectionKey;
  title: string;
  items: readonly string[];
  isFallback: boolean;
  note?: string;
};

export type ComparedProgram = {
  program: Major;
  accessLabel: string;
  sections: readonly ComparisonSection[];
};

export type MajorComparisonModel = {
  programs: readonly ComparedProgram[];
  selectedIds: readonly string[];
  missingIds: readonly string[];
  canCompare: boolean;
  selectionMessage: string;
  catalogNote?: string;
};

const SECTION_TITLES: Record<ComparisonSectionKey, string> = {
  workStyle: "Work style",
  coursework: "Coursework",
  sampleWork: "Sample work",
  tradeoffs: "Tradeoffs to explore",
};

const FAMILY_WORK_STYLE: Record<Family, readonly string[]> = {
  "Computing & Data": [
    "Analyze systems and patterns",
    "Build, test, and debug",
    "Spend time in focused technical work",
  ],
  "Engineering & Built Environment": [
    "Design within real constraints",
    "Build and test iterations",
    "Combine team projects with precise analysis",
  ],
  "Natural & Physical Sciences": [
    "Investigate questions with evidence",
    "Work carefully with methods and measurements",
    "Move between focused analysis and hands-on research",
  ],
  "Health & Human Services": [
    "Apply evidence to human needs",
    "Coordinate closely with other people",
    "Practice precise, service-oriented work",
  ],
  "Business & Economics": [
    "Analyze choices and incentives",
    "Form strategies under uncertainty",
    "Communicate decisions to other people",
  ],
  "Social & Behavioral Sciences": [
    "Study people, institutions, and behavior",
    "Interpret qualitative or quantitative evidence",
    "Explain patterns with room for ambiguity",
  ],
  "Humanities & Languages": [
    "Read and interpret closely",
    "Develop arguments through writing",
    "Connect ideas across contexts",
  ],
  "Arts, Design & Performance": [
    "Create through repeated practice",
    "Give and receive critique",
    "Turn ideas into public or tangible work",
  ],
  "Communication & Media": [
    "Shape ideas for an audience",
    "Create and revise stories or media",
    "Collaborate under deadlines",
  ],
  "Education, Public Service & Policy": [
    "Explain complex issues clearly",
    "Work with communities and institutions",
    "Organize action amid competing needs",
  ],
  "Interdisciplinary & Individualized": [
    "Connect methods from multiple fields",
    "Define your own questions and direction",
    "Work comfortably with open-ended choices",
  ],
};

const ACCESS_LABELS: Record<Access, string> = {
  direct: "Direct entry",
  prerequisites: "Complete prerequisites before declaring or applying",
  internal_application: "Internal application may be required",
  cross_campus_transfer: "Cross-campus transfer may be required",
  school_specific: "Path varies by school; confirm with the institution",
};

const FALLBACK_CONTENT: Record<
  Exclude<ComparisonSectionKey, "workStyle">,
  readonly string[]
> = {
  coursework: [
    "Review the required foundation courses",
    "Check how much room remains for electives or a second interest",
    "Look at the usual sequence and any grade requirements",
  ],
  sampleWork: [
    "Open two upper-level course descriptions and imagine the weekly work",
    "Find a student project, paper, performance, lab, or portfolio example",
    "Try one small task from the field before committing",
  ],
  tradeoffs: [
    "Ask which recurring frustrations are part of the work",
    "Check whether access rules affect timing or flexibility",
    "Compare the daily work—not only careers or subject names",
  ],
};

export function getAccessLabel(access: Access): string {
  return ACCESS_LABELS[access];
}

/** Keeps controlled selection state valid without inventing unknown programs. */
export function normalizeComparisonSelection(
  selectedIds: readonly string[],
  programs: readonly Major[],
): string[] {
  const knownIds = new Set(programs.map((program) => program.id));
  const normalized: string[] = [];

  for (const id of selectedIds) {
    if (
      knownIds.has(id) &&
      !normalized.includes(id) &&
      normalized.length < MAX_COMPARISON_PROGRAMS
    ) {
      normalized.push(id);
    }
  }

  return normalized;
}

export function toggleComparisonSelection(
  selectedIds: readonly string[],
  programId: string,
  programs: readonly Major[],
): string[] {
  const normalized = normalizeComparisonSelection(selectedIds, programs);
  if (normalized.includes(programId)) {
    return normalized.filter((id) => id !== programId);
  }
  if (
    normalized.length >= MAX_COMPARISON_PROGRAMS ||
    !programs.some((program) => program.id === programId)
  ) {
    return normalized;
  }
  return [...normalized, programId];
}

function fallbackNote(school: SchoolData, section: ComparisonSectionKey) {
  if (section === "workStyle") {
    return "Broad family pattern, not a claim about every course or student.";
  }
  if (school.dataDepth === "generic") {
    return `Program-level ${SECTION_TITLES[section].toLowerCase()} is not curated for ${school.shortName} yet. Use these prompts, then verify with the official catalog.`;
  }
  return `Verified ${SECTION_TITLES[section].toLowerCase()} is not curated for this program yet. Use these prompts, then confirm with ${school.shortName}.`;
}

function resolveSection(
  key: ComparisonSectionKey,
  program: Major,
  school: SchoolData,
  details?: ProgramComparisonDetails,
): ComparisonSection {
  const curated = details?.[key]?.filter((item) => item.trim());
  const isFallback = !curated?.length;
  const items = isFallback
    ? key === "workStyle"
      ? FAMILY_WORK_STYLE[program.family]
      : FALLBACK_CONTENT[key]
    : curated;

  return {
    key,
    title: SECTION_TITLES[key],
    items,
    isFallback,
    note: isFallback ? fallbackNote(school, key) : undefined,
  };
}

export function buildMajorComparison(
  school: SchoolData,
  selectedIds: readonly string[],
  detailsByProgramId: ProgramComparisonDetailsById = {},
): MajorComparisonModel {
  const programById = new Map(
    school.catalog.programs.map((program) => [program.id, program]),
  );
  const missingIds = [...new Set(selectedIds)].filter(
    (id) => !programById.has(id),
  );
  const normalizedIds = normalizeComparisonSelection(
    selectedIds,
    school.catalog.programs,
  );
  const programs = normalizedIds.map((id) => {
    const program = programById.get(id)!;
    return {
      program,
      accessLabel: getAccessLabel(program.access),
      sections: (
        ["workStyle", "coursework", "sampleWork", "tradeoffs"] as const
      ).map((key) =>
        resolveSection(key, program, school, detailsByProgramId[id]),
      ),
    };
  });
  const remaining = Math.max(MIN_COMPARISON_PROGRAMS - programs.length, 0);

  return {
    programs,
    selectedIds: normalizedIds,
    missingIds,
    canCompare: programs.length >= MIN_COMPARISON_PROGRAMS,
    selectionMessage: remaining
      ? `Choose ${remaining} more program${remaining === 1 ? "" : "s"} to compare.`
      : `${programs.length} programs selected.`,
    catalogNote: school.catalog.note || undefined,
  };
}
