import { normalizeEvidence } from "./scoring";
import type {
  DimensionSignal,
  EvidenceDimension,
  EvidenceProfile,
  MajorFitProfile,
  NormalizedEvidence,
} from "./types";

export type AdmissionsIntent = {
  admittedFor?: string;
  likedDimensions?: DimensionSignal;
  consideredMajors?: string[];
};

export type BeliefEvidenceStatus =
  | "aligned"
  | "worth_testing"
  | "in_tension"
  | "not_enough_evidence"
  | "unresolved_direction";

export type BeliefEvidenceDimension = {
  dimension: EvidenceDimension;
  intent: number;
  observed: number;
  confidence: number;
  gap: number;
};

export type BeliefEvidenceItem = {
  label: string;
  directionId?: string;
  kind: "admitted" | "considered";
  status: BeliefEvidenceStatus;
  agreement: number | null;
  supporting: BeliefEvidenceDimension[];
  tensions: BeliefEvidenceDimension[];
  explanation: string;
};

export type BeliefEvidenceMap = {
  items: BeliefEvidenceItem[];
  summary: string;
  disclaimer: string;
};

const dimensions = (profile: NormalizedEvidence): DimensionSignal => ({
  ...profile.workModes,
  ...profile.activityModes,
  ...profile.environment,
  ...profile.friction,
});

const directionVector = (profile: MajorFitProfile): DimensionSignal => ({
  ...profile.workModes,
  ...profile.activityModes,
  ...profile.environment,
  ...profile.friction,
});

const normalizedName = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/\b(ba|bs|bba|bfa|bse|major|program|degree)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokens = (value: string) =>
  new Set(normalizedName(value).split(" ").filter(Boolean));

/** Resolve typed admissions labels without making an AI-generated semantic guess. */
export function resolveInterestDirection(
  label: string,
  directions: MajorFitProfile[],
): MajorFitProfile | undefined {
  const query = normalizedName(label);
  if (!query) return undefined;
  const exact = directions.find(
    (direction) =>
      normalizedName(direction.name) === query ||
      normalizedName(direction.id) === query,
  );
  if (exact) return exact;

  const queryTokens = tokens(query);
  const candidates = directions
    .map((direction) => {
      const candidateTokens = tokens(`${direction.name} ${direction.id}`);
      const overlap = [...queryTokens].filter((token) =>
        candidateTokens.has(token),
      ).length;
      const union = new Set([...queryTokens, ...candidateTokens]).size;
      return { direction, score: union ? overlap / union : 0 };
    })
    .filter(({ score }) => score >= 0.5)
    .sort(
      (a, b) =>
        b.score - a.score || a.direction.name.localeCompare(b.direction.name),
    );
  return candidates[0]?.direction;
}

const explanationFor = (
  status: BeliefEvidenceStatus,
  supporting: BeliefEvidenceDimension[],
  tensions: BeliefEvidenceDimension[],
) => {
  const support = supporting[0]?.dimension;
  const tension = tensions[0]?.dimension;
  if (status === "not_enough_evidence")
    return "There is not enough observed evidence yet; treat this as a hypothesis to test.";
  if (status === "aligned")
    return support
      ? `Your observed ${support} signal supports this starting direction.`
      : "Your observed pattern broadly supports this starting direction.";
  if (status === "in_tension")
    return tension
      ? `Your current ${tension} evidence pulls against an important part of this direction.`
      : "Your observed pattern currently pulls against this starting direction.";
  return tension && support
    ? `Some evidence supports this direction through ${support}, while ${tension} is worth testing.`
    : "The evidence is mixed, so a small real-world experiment would be more useful than a verdict.";
};

function compareDirection(
  label: string,
  kind: BeliefEvidenceItem["kind"],
  evidence: NormalizedEvidence,
  direction?: MajorFitProfile,
): BeliefEvidenceItem {
  if (!direction) {
    return {
      label,
      kind,
      status: "unresolved_direction",
      agreement: null,
      supporting: [],
      tensions: [],
      explanation:
        "This direction is not in the current comparison library, so no fit claim was made.",
    };
  }

  const observed = dimensions(evidence);
  const target = directionVector(direction);
  const compared = Object.entries(target)
    .filter((entry): entry is [EvidenceDimension, number] =>
      Number.isFinite(entry[1]),
    )
    .map(([dimension, intent]) => {
      const confidence = evidence.confidence[dimension];
      const observedValue = observed[dimension] ?? 0;
      return {
        dimension,
        intent,
        observed: observedValue,
        confidence,
        gap: (observedValue - intent) * confidence,
      };
    });
  const usable = compared.filter(({ confidence }) => confidence >= 0.2);
  const weightedAgreement = usable.reduce(
    (sum, item) => sum + item.observed * item.intent * item.confidence,
    0,
  );
  const totalWeight = usable.reduce(
    (sum, item) => sum + Math.abs(item.intent) * item.confidence,
    0,
  );
  const agreement = totalWeight ? weightedAgreement / totalWeight : 0;
  const supporting = usable
    .filter((item) => item.observed * item.intent > 0.12)
    .sort(
      (a, b) =>
        b.observed * b.intent * b.confidence -
          a.observed * a.intent * a.confidence ||
        a.dimension.localeCompare(b.dimension),
    )
    .slice(0, 3);
  const tensions = usable
    .filter((item) => item.observed * item.intent < -0.08)
    .sort(
      (a, b) =>
        a.observed * a.intent * a.confidence -
          b.observed * b.intent * b.confidence ||
        a.dimension.localeCompare(b.dimension),
    )
    .slice(0, 3);
  const status: BeliefEvidenceStatus = !usable.length
    ? "not_enough_evidence"
    : agreement >= 0.35
      ? "aligned"
      : agreement <= -0.15
        ? "in_tension"
        : "worth_testing";
  return {
    label,
    directionId: direction.id,
    kind,
    status,
    agreement: Math.round(agreement * 100),
    supporting,
    tensions,
    explanation: explanationFor(status, supporting, tensions),
  };
}

/**
 * Keeps admissions intent visible beside behavioral evidence without feeding that intent into
 * scoring. `likedDimensions` is retained as user-authored context and deliberately not scored.
 */
export function buildBeliefEvidenceMap(
  intent: AdmissionsIntent,
  profile: EvidenceProfile,
  directions: MajorFitProfile[],
): BeliefEvidenceMap {
  const evidence = normalizeEvidence(profile);
  const labels = [
    ...(intent.admittedFor?.trim()
      ? [{ label: intent.admittedFor.trim(), kind: "admitted" as const }]
      : []),
    ...(intent.consideredMajors ?? [])
      .map((label) => label.trim())
      .filter(Boolean)
      .filter(
        (label, index, all) =>
          all.findIndex(
            (other) => normalizedName(other) === normalizedName(label),
          ) === index &&
          normalizedName(label) !== normalizedName(intent.admittedFor ?? ""),
      )
      .map((label) => ({ label, kind: "considered" as const })),
  ];
  const items = labels.map(({ label, kind }) =>
    compareDirection(
      label,
      kind,
      evidence,
      resolveInterestDirection(label, directions),
    ),
  );
  const aligned = items.filter((item) => item.status === "aligned").length;
  const tensions = items.filter((item) => item.status === "in_tension").length;
  return {
    items,
    summary: !items.length
      ? "Add an admitted or considered direction to compare your starting beliefs with evidence."
      : tensions
        ? `${tensions} starting ${tensions === 1 ? "belief is" : "beliefs are"} worth pressure-testing.`
        : aligned
          ? `${aligned} starting ${aligned === 1 ? "belief is" : "beliefs are"} supported by your current evidence.`
          : "Your starting beliefs remain open hypotheses; fieldwork can make the picture clearer.",
    disclaimer:
      "Admissions intent is shown as context, never used to inflate an interest score.",
  };
}
