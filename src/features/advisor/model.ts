import type {
  EvidenceDimension,
  MajorFitResult,
  NormalizedEvidence,
} from "../../domain";
import type { SessionState } from "../../state";

export type AdvisorBriefPreferences = {
  includeAdmissionsContext?: boolean;
  includeFreeText?: boolean;
  includeFieldworkNotes?: boolean;
};

export type AdvisorBriefInput = {
  session: SessionState;
  campusName: string;
  rankedDirections: readonly Pick<MajorFitResult, "id" | "name" | "score">[];
  evidence: NormalizedEvidence;
  generatedAt: string;
  preferences?: AdvisorBriefPreferences;
};

export type AdvisorBrief = {
  version: 1;
  generatedAt: string;
  campusName: string;
  startingPoint?: {
    admittedFor: string | null;
    likes: string[];
    note?: string;
    alternatives: string[];
  };
  currentHypotheses: Array<{ id: string; name: string; fit: number }>;
  evidenceThemes: Array<{
    dimension: EvidenceDimension;
    strength: number;
    confidence: number;
  }>;
  fieldwork: Array<{
    missionId: string;
    energy: string;
    friction: string[];
    note?: string;
  }>;
  tensions: string[];
  conversationPrompts: string[];
  disclosure: string;
};

const dimensionLabels: Partial<Record<EvidenceDimension, string>> = {
  analyze: "analyzing complex questions",
  build: "building tangible things",
  create: "creating original work",
  explain: "explaining ideas",
  investigate: "investigating unanswered questions",
  organize: "organizing people and systems",
  persuade: "persuading an audience",
  serve: "helping people directly",
  strategize: "setting direction",
  synthesize: "connecting ideas",
  collaborative: "collaborative settings",
  independent: "independent work",
  handsOn: "hands-on work",
  publicFacing: "public-facing work",
  structured: "structured environments",
  fastPaced: "fast-paced environments",
  deepFocus: "long periods of deep focus",
};

const evidenceEntries = (evidence: NormalizedEvidence) => {
  const groups = [
    evidence.workModes,
    evidence.activityModes,
    evidence.environment,
    evidence.friction,
  ] as const;

  return groups
    .flatMap((group) => Object.entries(group))
    .map(([dimension, strength]) => ({
      dimension: dimension as EvidenceDimension,
      strength,
      confidence: evidence.confidence[dimension as EvidenceDimension] ?? 0,
    }))
    .filter(({ strength, confidence }) => strength > 0.15 && confidence > 0)
    .sort(
      (left, right) =>
        right.strength * right.confidence - left.strength * left.confidence ||
        left.dimension.localeCompare(right.dimension),
    );
};

export function generateAdvisorBrief({
  session,
  campusName,
  rankedDirections,
  evidence,
  generatedAt,
  preferences = {},
}: AdvisorBriefInput): AdvisorBrief {
  const includeAdmissions = preferences.includeAdmissionsContext !== false;
  const includeFreeText = preferences.includeFreeText === true;
  const includeFieldworkNotes = preferences.includeFieldworkNotes === true;
  const onboarding = session.onboarding;
  const currentHypotheses = rankedDirections.slice(0, 3).map((direction) => ({
    id: direction.id,
    name: direction.name,
    fit: Math.round(direction.score),
  }));
  const evidenceThemes = evidenceEntries(evidence).slice(0, 5);
  const fieldwork = Object.values(session.reflections)
    .sort((a, b) => a.missionId.localeCompare(b.missionId))
    .map((reflection) => ({
      missionId: reflection.missionId,
      energy: reflection.energy,
      friction: [...reflection.friction],
      ...(includeFieldworkNotes && reflection.note.trim()
        ? { note: reflection.note.trim() }
        : {}),
    }));

  const tensions: string[] = [];
  const admitted = includeAdmissions
    ? onboarding.admittedProgram?.trim()
    : undefined;
  if (
    admitted &&
    currentHypotheses.length > 0 &&
    !currentHypotheses.some(
      ({ name }) => name.toLocaleLowerCase() === admitted.toLocaleLowerCase(),
    )
  ) {
    tensions.push(
      `The admitted program (${admitted}) is not currently among the three strongest evidence-backed directions.`,
    );
  }
  const energized = fieldwork.filter(
    ({ energy }) => energy === "energized",
  ).length;
  const drained = fieldwork.filter(({ energy }) => energy === "drained").length;
  if (drained > energized) {
    tensions.push(
      "More completed experiments felt draining than energizing; distinguish the field itself from the specific setting or task.",
    );
  }
  if (!fieldwork.length) {
    tensions.push(
      "The current pattern comes from assessment evidence only and has not yet been tested through fieldwork.",
    );
  }

  const strongestTheme = evidenceThemes[0];
  const prompts = [
    admitted
      ? `What did you hope ${admitted} would let you do, beyond earning the credential?`
      : "What kind of problem would feel worth working on even when the work gets difficult?",
    strongestTheme
      ? `Where have you already enjoyed ${dimensionLabels[strongestTheme.dimension] ?? strongestTheme.dimension}?`
      : "Which activity has made you lose track of time recently?",
    "What is the smallest real-world experiment that could challenge your leading hypothesis?",
  ];

  return {
    version: 1,
    generatedAt,
    campusName,
    ...(includeAdmissions
      ? {
          startingPoint: {
            admittedFor: onboarding.admittedProgram,
            likes: [...onboarding.admittedLikes],
            ...(includeFreeText && onboarding.admittedLikeNote.trim()
              ? { note: onboarding.admittedLikeNote.trim() }
              : {}),
            alternatives: [...onboarding.consideredMajors],
          },
        }
      : {}),
    currentHypotheses,
    evidenceThemes,
    fieldwork,
    tensions,
    conversationPrompts: prompts,
    disclosure:
      "This brief summarizes student-controlled exploration evidence. It is not an aptitude test, diagnosis, or admissions recommendation.",
  };
}

export function formatAdvisorBrief(brief: AdvisorBrief): string {
  const lines = [
    "UNLABELED — EXPLORATION BRIEF",
    `${brief.campusName} · ${brief.generatedAt}`,
    "",
  ];
  if (brief.startingPoint) {
    lines.push(
      "STARTING POINT",
      `Admitted for: ${brief.startingPoint.admittedFor ?? "Not provided"}`,
      `What appealed: ${brief.startingPoint.likes.join(", ") || "Not provided"}`,
      `Other directions considered: ${brief.startingPoint.alternatives.join(", ") || "None yet"}`,
      ...(brief.startingPoint.note
        ? [`Student note: ${brief.startingPoint.note}`]
        : []),
      "",
    );
  }
  lines.push(
    "CURRENT HYPOTHESES",
    ...(brief.currentHypotheses.length
      ? brief.currentHypotheses.map(
          ({ name, fit }) => `• ${name} (${fit}% fit signal)`,
        )
      : ["• More evidence needed"]),
    "",
    "EVIDENCE THEMES",
    ...(brief.evidenceThemes.length
      ? brief.evidenceThemes.map(
          ({ dimension, strength, confidence }) =>
            `• ${dimensionLabels[dimension] ?? dimension}: ${Math.round(strength * 100)} strength / ${Math.round(confidence * 100)} confidence`,
        )
      : ["• More evidence needed"]),
    "",
    "FIELDWORK",
    ...(brief.fieldwork.length
      ? brief.fieldwork.flatMap(({ missionId, energy, friction, note }) => [
          `• ${missionId}: ${energy}${friction.length ? ` · Friction: ${friction.join(", ")}` : ""}`,
          ...(note ? [`  Student note: ${note}`] : []),
        ])
      : ["• No fieldwork reflections yet"]),
    "",
    "TENSIONS TO EXPLORE",
    ...(brief.tensions.length
      ? brief.tensions.map((item) => `• ${item}`)
      : ["• No clear tension yet"]),
    "",
    "QUESTIONS FOR THE CONVERSATION",
    ...brief.conversationPrompts.map((item) => `• ${item}`),
    "",
    brief.disclosure,
  );
  return lines.join("\n");
}
