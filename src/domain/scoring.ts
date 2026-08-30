import {
  ACTIVITY_MODES,
  ActivityMode,
  ChallengeDefinition,
  ClubFitResult,
  ClubProfile,
  DimensionSignal,
  ENVIRONMENT_FACTORS,
  EnvironmentFactor,
  EvidenceDimension,
  EvidenceObservation,
  EvidenceProfile,
  EvidenceSource,
  FieldworkObservation,
  FitReason,
  FRICTION_FACTORS,
  FrictionFactor,
  MajorFitProfile,
  MajorFitResult,
  NormalizedEvidence,
  QuestionDefinition,
  ReadinessResult,
  SubjectSelections,
  WORK_MODES,
  WorkMode,
} from "./types";
import {
  challengeDefinitions,
  questionDefinitions,
  subjectMappings,
} from "./mappings";

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const dimensions: EvidenceDimension[] = [
  ...WORK_MODES,
  ...ACTIVITY_MODES,
  ...ENVIRONMENT_FACTORS,
  ...FRICTION_FACTORS,
];

const keyed = <K extends string>(keys: readonly K[], value = 0) =>
  Object.fromEntries(keys.map((key) => [key, value])) as Record<K, number>;

export const createEvidenceProfile = (): EvidenceProfile => ({
  observations: [],
});

const replaceObservation = (
  profile: EvidenceProfile,
  observation: EvidenceObservation,
): EvidenceProfile => ({
  observations: [
    ...profile.observations.filter((item) => item.id !== observation.id),
    observation,
  ],
});

const findQuestion = (id: string, definitions: QuestionDefinition[]) =>
  definitions.find((question) => question.id === id);

export function applyQuestionResponse(
  profile: EvidenceProfile,
  questionId: string,
  optionIds: string | string[],
  definitions = questionDefinitions,
): EvidenceProfile {
  const question = findQuestion(questionId, definitions);
  if (!question) return profile;
  const ids = Array.isArray(optionIds) ? optionIds : [optionIds];
  const selected = question.options
    .filter((option) => ids.includes(option.id))
    .slice(0, question.maxSelections ?? 1);
  if (!selected.length) return profile;
  const signals: DimensionSignal = {};
  selected.forEach((option) =>
    dimensions.forEach((dimension) => {
      if (option.signals[dimension] !== undefined)
        signals[dimension] =
          (signals[dimension] ?? 0) +
          option.signals[dimension]! / selected.length;
    }),
  );
  return replaceObservation(profile, {
    id: `question:${questionId}`,
    source: "question",
    sourceId: questionId,
    signals,
    weight: question.weight ?? 1,
    label: selected.map((option) => option.label).join(" + "),
  });
}

export function applySubjectSelections(
  profile: EvidenceProfile,
  selections: SubjectSelections,
): EvidenceProfile {
  const withoutSubjects = profile.observations.filter(
    (item) =>
      item.source !== "subject_strength" && item.source !== "subject_enjoyment",
  );
  const observations: EvidenceObservation[] = [];
  const add = (
    subjects: string[],
    source: "subject_strength" | "subject_enjoyment",
    weight: number,
  ) => {
    subjects.forEach((subject) => {
      const signals = subjectMappings[subject];
      if (signals)
        observations.push({
          id: `${source}:${subject}`,
          source,
          sourceId: subject,
          signals,
          weight,
          label: subject,
        });
    });
  };
  // Enjoyment is intentionally stronger than reported ease: fit is about sustainable curiosity,
  // not simply reproducing prior grades or access to coursework.
  add(selections.strengths ?? [], "subject_strength", 0.45);
  add(selections.enjoyment ?? [], "subject_enjoyment", 0.7);
  return { observations: [...withoutSubjects, ...observations] };
}

export function applyChallengeOutcome(
  profile: EvidenceProfile,
  challengeId: string,
  outcomeId: string,
  definitions: ChallengeDefinition[] = challengeDefinitions,
): EvidenceProfile {
  const challenge = definitions.find((item) => item.id === challengeId);
  const outcome = challenge?.outcomes.find((item) => item.id === outcomeId);
  if (!challenge || !outcome) return profile;
  return replaceObservation(profile, {
    id: `challenge:${challengeId}`,
    source: "challenge",
    sourceId: challengeId,
    signals: outcome.signals,
    weight: (challenge.weight ?? 1.2) * (outcome.weight ?? 1),
    label: outcome.label,
  });
}

/**
 * Adds or replaces evidence collected from trying the work in the real world. Reusing an id updates
 * that activity instead of inflating readiness with duplicate observations.
 */
export function applyFieldworkObservation(
  profile: EvidenceProfile,
  observation: FieldworkObservation,
): EvidenceProfile {
  const sourceId = observation.id.trim();
  const weight = observation.weight ?? 1;
  const signals = Object.fromEntries(
    dimensions.flatMap((dimension) => {
      const signal = observation.signals[dimension];
      return signal !== undefined && Number.isFinite(signal)
        ? [[dimension, signal]]
        : [];
    }),
  ) as DimensionSignal;
  if (
    !sourceId ||
    !observation.label.trim() ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    !Object.keys(signals).length
  ) {
    return profile;
  }
  return replaceObservation(profile, {
    id: `fieldwork:${sourceId}`,
    source: "fieldwork",
    sourceId,
    signals,
    weight,
    label: observation.label.trim(),
  });
}

export function normalizeEvidence(
  profile: EvidenceProfile,
): NormalizedEvidence {
  const totals = keyed(dimensions);
  const weights = keyed(dimensions);
  profile.observations.forEach((observation) => {
    if (!Number.isFinite(observation.weight) || observation.weight <= 0) return;
    dimensions.forEach((dimension) => {
      const signal = observation.signals[dimension];
      if (signal === undefined || !Number.isFinite(signal)) return;
      totals[dimension] += clamp(signal, -1, 1) * observation.weight;
      weights[dimension] += observation.weight;
    });
  });
  const value = (dimension: EvidenceDimension) =>
    weights[dimension]
      ? clamp(totals[dimension] / weights[dimension], -1, 1)
      : 0;
  const confidence = keyed(dimensions);
  dimensions.forEach((dimension) => {
    confidence[dimension] = clamp(weights[dimension] / 3);
  });
  return {
    workModes: Object.fromEntries(
      WORK_MODES.map((key) => [key, value(key)]),
    ) as Record<WorkMode, number>,
    activityModes: Object.fromEntries(
      ACTIVITY_MODES.map((key) => [key, value(key)]),
    ) as Record<ActivityMode, number>,
    environment: Object.fromEntries(
      ENVIRONMENT_FACTORS.map((key) => [key, value(key)]),
    ) as Record<EnvironmentFactor, number>,
    friction: Object.fromEntries(
      FRICTION_FACTORS.map((key) => [key, value(key)]),
    ) as Record<FrictionFactor, number>,
    confidence,
  };
}

const profileVector = (profile: NormalizedEvidence) => ({
  ...profile.workModes,
  ...profile.activityModes,
  ...profile.environment,
  ...profile.friction,
});

const targetVector = (
  target: MajorFitProfile | ClubProfile,
): DimensionSignal => ({
  ...target.workModes,
  ...target.activityModes,
  ...target.environment,
  ...target.friction,
});

const cosine = (a: DimensionSignal, b: DimensionSignal) => {
  let dot = 0,
    normA = 0,
    normB = 0;
  dimensions.forEach((dimension) => {
    if (b[dimension] === undefined) return;
    const av = a[dimension] ?? 0;
    const bv = b[dimension] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  });
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
};

const reasonsFor = (
  student: DimensionSignal,
  target: DimensionSignal,
): FitReason[] =>
  dimensions
    .filter((dimension) => target[dimension] !== undefined)
    .map((dimension) => ({
      dimension,
      contribution: (student[dimension] ?? 0) * target[dimension]!,
    }))
    .filter((reason) => reason.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);

/**
 * Scores only observable broad-factor evidence. Declared/considered majors are deliberately not
 * accepted by this API, preventing a prior label from becoming a self-fulfilling ranking input.
 */
export function rankMajors(
  profile: EvidenceProfile,
  majors: MajorFitProfile[],
): MajorFitResult[] {
  const student = profileVector(normalizeEvidence(profile));
  return majors
    .map((major) => {
      const target = targetVector(major);
      return {
        id: major.id,
        name: major.name,
        score: Math.round(cosine(student, target) * 100),
        reasons: reasonsFor(student, target),
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export function rankClubs(
  profile: EvidenceProfile,
  clubs: ClubProfile[],
): ClubFitResult[] {
  const student = profileVector(normalizeEvidence(profile));
  return clubs
    .map((club) => {
      const target = targetVector(club);
      return {
        id: club.id,
        name: club.name,
        score: Math.round(cosine(student, target) * 100),
        reasons: reasonsFor(student, target),
        availability: club.availability ?? "unknown",
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export function computeReadiness(profile: EvidenceProfile): ReadinessResult {
  const sources = new Set<EvidenceSource>(
    profile.observations.map((item) => item.source),
  );
  const evidenceCount = profile.observations.length;
  const represented = dimensions.filter((dimension) =>
    profile.observations.some((item) => item.signals[dimension] !== undefined),
  ).length;
  // Readiness means confidence in the recommendation evidence, never aptitude or admission odds.
  const score = Math.round(
    100 *
      clamp(
        0.5 * Math.min(evidenceCount / 12, 1) +
          0.25 * Math.min(sources.size / 4, 1) +
          0.25 * Math.min(represented / 16, 1),
      ),
  );
  const level =
    score >= 75 ? "well_evidenced" : score >= 40 ? "developing" : "early";
  return {
    score,
    level,
    evidenceCount,
    sourceBreadth: sources.size,
    explanation:
      level === "well_evidenced"
        ? "Your pattern is supported by several kinds of evidence."
        : level === "developing"
          ? "Your pattern is taking shape; fieldwork can test it."
          : "This is an early hypothesis, not a conclusion.",
  };
}
