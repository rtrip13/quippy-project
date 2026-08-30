import { createInitialSessionState } from "./initial";
import { isWorkSampleFamily } from "../features/fieldwork/workSamples";
import {
  DEFAULT_DECISION_PRIORITIES,
  SESSION_STATE_VERSION,
  type DecisionPriorities,
  type FieldworkReflection,
  type MissionProgress,
  type MissionStatus,
  type ReflectionCuriosity,
  type ReflectionEnergy,
  type ReflectionRepeatIntent,
  type SessionState,
} from "./types";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringOrNull = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const strings = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      ),
    ),
  ];
};

const stringMap = (value: unknown): Record<string, string> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].length > 0,
    ),
  );
};

const stringArrayMap = (value: unknown): Record<string, string[]> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, entry]) => [
        key,
        typeof entry === "string" ? [entry] : strings(entry),
      ])
      .filter(([, entry]) => (entry as string[]).length > 0),
  );
};

const decisionPriorities = (value: unknown): DecisionPriorities => {
  if (!isRecord(value)) return { ...DEFAULT_DECISION_PRIORITIES };
  const priorities: DecisionPriorities = {
    earnings: value.earnings as number,
    recognition: value.recognition as number,
    balance: value.balance as number,
    impact: value.impact as number,
    flexibility: value.flexibility as number,
  };
  const points = Object.values(priorities);
  return points.every((point) => Number.isInteger(point) && point >= 0) &&
    points.reduce((sum, point) => sum + point, 0) === 100
    ? priorities
    : { ...DEFAULT_DECISION_PRIORITIES };
};

const missionStatus = (value: unknown): MissionStatus | null =>
  value === "planned" || value === "completed" || value === "skipped"
    ? value
    : null;

const missionMap = (value: unknown): Record<string, MissionProgress> => {
  if (!isRecord(value)) return {};
  const result: Record<string, MissionProgress> = {};
  Object.entries(value).forEach(([missionId, entry]) => {
    if (!isRecord(entry)) return;
    const status = missionStatus(entry.status);
    if (status)
      result[missionId] = { status, changedAt: stringOrNull(entry.changedAt) };
  });
  return result;
};

const reflectionEnergy = (value: unknown): ReflectionEnergy | null =>
  value === "energized" || value === "neutral" || value === "drained"
    ? value
    : null;

const reflectionCuriosity = (
  value: unknown,
): ReflectionCuriosity | undefined =>
  value === "grew" || value === "held" || value === "faded" ? value : undefined;

const reflectionRepeatIntent = (
  value: unknown,
): ReflectionRepeatIntent | undefined =>
  value === "yes" || value === "maybe" || value === "no" ? value : undefined;

const reflectionMap = (value: unknown): Record<string, FieldworkReflection> => {
  if (!isRecord(value)) return {};
  const result: Record<string, FieldworkReflection> = {};
  Object.entries(value).forEach(([missionId, entry]) => {
    if (!isRecord(entry)) return;
    const energy = reflectionEnergy(entry.energy);
    if (!energy) return;
    const curiosity = reflectionCuriosity(entry.curiosity);
    const repeatIntent = reflectionRepeatIntent(entry.repeatIntent);
    result[missionId] = {
      missionId,
      energy,
      ...(curiosity ? { curiosity } : {}),
      ...(repeatIntent ? { repeatIntent } : {}),
      ...(isWorkSampleFamily(entry.workSampleFamily)
        ? { workSampleFamily: entry.workSampleFamily }
        : {}),
      ...(entry.experienceCause === "work" ||
      entry.experienceCause === "setting" ||
      entry.experienceCause === "unsure"
        ? { experienceCause: entry.experienceCause }
        : {}),
      friction: strings(entry.friction),
      note: typeof entry.note === "string" ? entry.note : "",
      recordedAt: stringOrNull(entry.recordedAt),
    };
  });
  return result;
};

/**
 * Accepts parsed persisted data from any supported version. Invalid or future-version
 * data safely becomes a fresh session. Versionless data is treated as the prototype v0
 * shape, where profile answers may be scalar strings.
 */
export function migrateSessionState(persisted: unknown): SessionState {
  if (!isRecord(persisted)) return createInitialSessionState();
  if (
    typeof persisted.version === "number" &&
    persisted.version > SESSION_STATE_VERSION
  ) {
    return createInitialSessionState();
  }

  const onboarding = isRecord(persisted.onboarding)
    ? persisted.onboarding
    : persisted;
  const revision =
    typeof persisted.revision === "number" &&
    Number.isSafeInteger(persisted.revision)
      ? Math.max(0, persisted.revision)
      : 0;
  const legacyDeclared = strings(
    onboarding.declaredMajors ?? onboarding.declared,
  );
  const noOtherMajorsLabel = "No other majors yet";
  const persistedConsideredMajors = strings(
    onboarding.consideredMajors ?? legacyDeclared.slice(1),
  );

  return {
    version: SESSION_STATE_VERSION,
    revision,
    onboarding: {
      campusId: stringOrNull(onboarding.campusId ?? onboarding.universityId),
      academicUnit: stringOrNull(onboarding.academicUnit ?? onboarding.unit),
      admittedProgram:
        stringOrNull(onboarding.admittedProgram) ?? legacyDeclared[0] ?? null,
      admittedLikes: strings(onboarding.admittedLikes),
      admittedLikeNote:
        typeof onboarding.admittedLikeNote === "string"
          ? onboarding.admittedLikeNote.trim()
          : "",
      consideredMajors: persistedConsideredMajors.filter(
        (major) => major !== noOtherMajorsLabel,
      ),
      noOtherMajorsYet:
        onboarding.noOtherMajorsYet === true ||
        persistedConsideredMajors.includes(noOtherMajorsLabel),
      declaredMajors: legacyDeclared.filter(
        (major) => major !== noOtherMajorsLabel,
      ),
      strengths: strings(onboarding.strengths),
      enjoyment: strings(onboarding.enjoyment ?? onboarding.enjoy),
      decisionPriorities: decisionPriorities(onboarding.decisionPriorities),
      setupCompleted: onboarding.setupCompleted === true,
      profileAnswers: stringArrayMap(onboarding.profileAnswers),
      challengeOutcomes: stringMap(onboarding.challengeOutcomes),
    },
    shortlist: strings(persisted.shortlist ?? persisted.savedMajorIds),
    activeFocusByCampus: stringMap(persisted.activeFocusByCampus),
    missions: missionMap(persisted.missions),
    reflections: reflectionMap(persisted.reflections),
  };
}
