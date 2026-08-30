export const WORK_MODES = [
  "analyze",
  "build",
  "create",
  "explain",
  "investigate",
  "organize",
  "persuade",
  "serve",
  "strategize",
  "synthesize",
] as const;

export const ACTIVITY_MODES = [
  "compete",
  "design",
  "discuss",
  "make",
  "perform",
  "research",
  "volunteer",
  "teach",
] as const;

export const ENVIRONMENT_FACTORS = [
  "collaborative",
  "independent",
  "handsOn",
  "publicFacing",
  "structured",
  "fastPaced",
  "deepFocus",
] as const;

export const FRICTION_FACTORS = [
  "ambiguity",
  "debugging",
  "iteration",
  "precision",
  "repetition",
  "coordination",
] as const;

export type WorkMode = (typeof WORK_MODES)[number];
export type ActivityMode = (typeof ACTIVITY_MODES)[number];
export type EnvironmentFactor = (typeof ENVIRONMENT_FACTORS)[number];
export type FrictionFactor = (typeof FRICTION_FACTORS)[number];
export type EvidenceDimension =
  WorkMode | ActivityMode | EnvironmentFactor | FrictionFactor;
export type EvidenceGroup =
  "workModes" | "activityModes" | "environment" | "friction";
export type EvidenceSource =
  | "question"
  | "subject_strength"
  | "subject_enjoyment"
  | "challenge"
  | "fieldwork";

export type DimensionSignal = Partial<Record<EvidenceDimension, number>>;

export type EvidenceObservation = {
  id: string;
  source: EvidenceSource;
  sourceId: string;
  /** Dimension values use a -1..1 scale. Negative values are valid counter-evidence. */
  signals: DimensionSignal;
  weight: number;
  label: string;
};

export type EvidenceProfile = {
  observations: EvidenceObservation[];
};

export type NormalizedEvidence = {
  workModes: Record<WorkMode, number>;
  activityModes: Record<ActivityMode, number>;
  environment: Record<EnvironmentFactor, number>;
  friction: Record<FrictionFactor, number>;
  /** 0..1 estimate of how much weighted evidence supports each dimension. */
  confidence: Record<EvidenceDimension, number>;
};

export type QuestionOption = {
  id: string;
  label: string;
  signals: DimensionSignal;
};

export type QuestionDefinition = {
  id: string;
  prompt: string;
  helper?: string;
  options: QuestionOption[];
  maxSelections?: number;
  weight?: number;
};

export type SubjectSelections = {
  strengths?: string[];
  enjoyment?: string[];
};

/** A real-world activity or reflection that adds evidence after the initial flow. */
export type FieldworkObservation = {
  /** Stable identifier for the activity, used to replace a previous reflection for the same work. */
  id: string;
  label: string;
  signals: DimensionSignal;
  weight?: number;
};

export type ChallengeOutcome = {
  id: string;
  label: string;
  signals: DimensionSignal;
  /** Optional behavioral strength (for example, how far a slider was explored). */
  weight?: number;
};

export type ChallengeDefinition = {
  id: string;
  label: string;
  outcomes: ChallengeOutcome[];
  weight?: number;
};

export type MajorFitProfile = {
  id: string;
  name: string;
  workModes: Partial<Record<WorkMode, number>>;
  activityModes?: Partial<Record<ActivityMode, number>>;
  environment?: Partial<Record<EnvironmentFactor, number>>;
  friction?: Partial<Record<FrictionFactor, number>>;
};

export type FitReason = {
  dimension: EvidenceDimension;
  contribution: number;
};

export type MajorFitResult = {
  id: string;
  name: string;
  score: number;
  reasons: FitReason[];
};

export type ReadinessResult = {
  score: number;
  level: "early" | "developing" | "well_evidenced";
  evidenceCount: number;
  sourceBreadth: number;
  explanation: string;
};

export type ClubProfile = {
  id: string;
  name: string;
  workModes?: Partial<Record<WorkMode, number>>;
  activityModes?: Partial<Record<ActivityMode, number>>;
  environment?: Partial<Record<EnvironmentFactor, number>>;
  friction?: Partial<Record<FrictionFactor, number>>;
  /** Kept outside fit so logistics never masquerade as student identity. */
  availability?: "open" | "application" | "audition" | "unknown";
};

export type ClubFitResult = {
  id: string;
  name: string;
  score: number;
  reasons: FitReason[];
  availability: ClubProfile["availability"];
};
