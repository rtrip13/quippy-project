import { fieldworkMissions } from "../features/fieldwork/model";
import type { FieldworkReflection } from "../state";
import type {
  EvidenceDimension,
  EvidenceObservation,
  EvidenceProfile,
  EvidenceSource,
} from "./types";

export const EVIDENCE_TIMELINE_CATEGORIES = [
  "YOU SAID",
  "YOU DID",
  "REALITY CHECK",
  "PATTERN UPDATED",
] as const;

export type EvidenceTimelineCategory =
  (typeof EVIDENCE_TIMELINE_CATEGORIES)[number];

export type EvidenceTimelineTone = "positive" | "neutral" | "counter";

export type EvidenceTimelineEntry = {
  id: string;
  category: EvidenceTimelineCategory;
  text: string;
  source: EvidenceSource | "reflection";
  sourceId: string;
  tone: EvidenceTimelineTone;
  occurredAt: string | null;
};

export type EvidenceTimelineRequest = {
  profile: EvidenceProfile;
  reflections?: Record<string, FieldworkReflection> | FieldworkReflection[];
};

const categoryOrder = new Map(
  EVIDENCE_TIMELINE_CATEGORIES.map((category, index) => [category, index]),
);

const dimensionCopy: Partial<Record<EvidenceDimension, string>> = {
  analyze: "working with patterns and evidence",
  build: "turning ideas into working things",
  create: "making new possibilities",
  explain: "making difficult ideas clear",
  investigate: "following unanswered questions",
  organize: "coordinating people and moving parts",
  persuade: "building a case",
  serve: "doing work that is useful to people",
  strategize: "weighing decisions and tradeoffs",
  synthesize: "connecting unlike ideas",
  collaborative: "working with other people",
  deepFocus: "sustained focus",
  publicFacing: "working in public",
  ambiguity: "tolerating an unclear answer",
  debugging: "staying with a stubborn problem",
  iteration: "staying through revision",
};

const missionTitle = (missionId: string) => {
  const activityId = missionId.split(":").at(-1) ?? missionId;
  return (
    fieldworkMissions.find((mission) => mission.id === activityId)?.title ??
    "Fieldwork"
  );
};

const strongestSignal = (observation: EvidenceObservation) =>
  (Object.entries(observation.signals) as [EvidenceDimension, number][])
    .filter(([, value]) => Number.isFinite(value) && value !== 0)
    .sort(
      ([dimensionA, valueA], [dimensionB, valueB]) =>
        Math.abs(valueB) - Math.abs(valueA) ||
        dimensionA.localeCompare(dimensionB),
    )[0];

const observedTone = (
  observation: EvidenceObservation,
): EvidenceTimelineTone => {
  const signal = strongestSignal(observation)?.[1] ?? 0;
  return signal < 0 ? "counter" : signal > 0 ? "positive" : "neutral";
};

const spokenText = (observation: EvidenceObservation) => {
  if (observation.source === "subject_enjoyment")
    return `${observation.label} holds your attention.`;
  if (observation.source === "subject_strength")
    return `You already feel capable in ${observation.label}.`;
  return `You chose “${observation.label}.”`;
};

const didText = (observation: EvidenceObservation) =>
  `In a work sample, you ${observation.label.replace(/[.]$/, "").toLowerCase()}.`;

const updateText = (observation: EvidenceObservation) => {
  const signal = strongestSignal(observation);
  if (!signal) return observation.label;
  const [dimension, value] = signal;
  const behavior =
    dimensionCopy[dimension] ??
    dimension.replace(/([A-Z])/g, " $1").toLowerCase();
  return value < 0
    ? `That weakened the signal for ${behavior}.`
    : `That strengthened the signal for ${behavior}.`;
};

const observationEntry = (
  observation: EvidenceObservation,
): EvidenceTimelineEntry | null => {
  if (
    observation.source === "question" ||
    observation.source === "subject_enjoyment" ||
    observation.source === "subject_strength"
  ) {
    return {
      id: `said:${observation.id}`,
      category: "YOU SAID",
      text: spokenText(observation),
      source: observation.source,
      sourceId: observation.sourceId,
      tone: "neutral",
      occurredAt: null,
    };
  }
  if (observation.source === "challenge") {
    return {
      id: `did:${observation.id}`,
      category: "YOU DID",
      text: didText(observation),
      source: observation.source,
      sourceId: observation.sourceId,
      tone: observedTone(observation),
      occurredAt: null,
    };
  }
  if (observation.source === "fieldwork") {
    return {
      id: `updated:${observation.id}`,
      category: "PATTERN UPDATED",
      text: updateText(observation),
      source: observation.source,
      sourceId: observation.sourceId,
      tone: observedTone(observation),
      occurredAt: null,
    };
  }
  return null;
};

const reflectionEntry = (
  reflection: FieldworkReflection,
): EvidenceTimelineEntry => {
  const energyCopy = {
    energized: "gave you energy",
    neutral: "left your energy unchanged",
    drained: "cost you energy",
  } as const;
  return {
    id: `reality:${reflection.missionId}`,
    category: "REALITY CHECK",
    text: `${missionTitle(reflection.missionId)} ${energyCopy[reflection.energy]}.`,
    source: "reflection",
    sourceId: reflection.missionId,
    tone:
      reflection.energy === "energized"
        ? "positive"
        : reflection.energy === "drained"
          ? "counter"
          : "neutral",
    occurredAt: reflection.recordedAt,
  };
};

/**
 * Builds a transparent ledger from the evidence already in session state.
 * Category-first ordering preserves the product story; IDs and timestamps make
 * the result stable even when records arrive from object maps or hydration.
 */
export function buildEvidenceTimeline({
  profile,
  reflections = {},
}: EvidenceTimelineRequest): EvidenceTimelineEntry[] {
  const reflectionList = Array.isArray(reflections)
    ? reflections
    : Object.values(reflections);
  const reflectionByMission = new Map(
    reflectionList.map((reflection) => [reflection.missionId, reflection]),
  );

  const entries = profile.observations
    .map((observation) => {
      const entry = observationEntry(observation);
      if (
        entry?.category === "PATTERN UPDATED" &&
        reflectionByMission.has(observation.sourceId)
      ) {
        entry.occurredAt = reflectionByMission.get(
          observation.sourceId,
        )!.recordedAt;
      }
      return entry;
    })
    .filter((entry): entry is EvidenceTimelineEntry => entry !== null);

  reflectionList.forEach((reflection) =>
    entries.push(reflectionEntry(reflection)),
  );

  return entries.sort((a, b) => {
    const categoryDifference =
      (categoryOrder.get(a.category) ?? 0) -
      (categoryOrder.get(b.category) ?? 0);
    if (categoryDifference) return categoryDifference;
    const timeDifference = (a.occurredAt ?? "").localeCompare(
      b.occurredAt ?? "",
    );
    return timeDifference || a.id.localeCompare(b.id);
  });
}
