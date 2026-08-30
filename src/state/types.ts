import type { Family } from "../data/schools/types";

export const SESSION_STATE_VERSION = 5 as const;

export type SessionStateVersion = typeof SESSION_STATE_VERSION;

export type DecisionPriorities = {
  earnings: number;
  recognition: number;
  balance: number;
  impact: number;
  flexibility: number;
};

export const DEFAULT_DECISION_PRIORITIES: Readonly<DecisionPriorities> = {
  earnings: 20,
  recognition: 20,
  balance: 20,
  impact: 20,
  flexibility: 20,
};

export type OnboardingState = {
  campusId: string | null;
  academicUnit: string | null;
  admittedProgram: string | null;
  admittedLikes: string[];
  admittedLikeNote: string;
  consideredMajors: string[];
  /** Distinguishes an explicit "none yet" answer from a skipped question. */
  noOtherMajorsYet: boolean;
  /** Legacy combined list retained for migration compatibility. */
  declaredMajors: string[];
  strengths: string[];
  enjoyment: string[];
  /** A non-negative integer allocation that must total 100 points. */
  decisionPriorities: DecisionPriorities;
  setupCompleted: boolean;
  /** Arrays preserve questions that allow more than one response. */
  profileAnswers: Record<string, string[]>;
  challengeOutcomes: Record<string, string>;
};

export type MissionStatus = "planned" | "completed" | "skipped";

export type MissionProgress = {
  status: MissionStatus;
  /** Supplied by the caller so reducer execution remains deterministic. */
  changedAt: string | null;
};

export type ReflectionEnergy = "energized" | "neutral" | "drained";
export type ReflectionCuriosity = "grew" | "held" | "faded";
export type ReflectionRepeatIntent = "yes" | "maybe" | "no";

export type FieldworkReflection = {
  missionId: string;
  energy: ReflectionEnergy;
  curiosity?: ReflectionCuriosity;
  repeatIntent?: ReflectionRepeatIntent;
  /** Only new, completed in-app work samples carry this context. */
  workSampleFamily?: Family;
  experienceCause?: "work" | "setting" | "unsure";
  friction: string[];
  note: string;
  /** Supplied by the caller; ISO-8601 is recommended. */
  recordedAt: string | null;
};

export type SessionState = {
  version: SessionStateVersion;
  /** Increments for every accepted action, including reset and hydrate. */
  revision: number;
  onboarding: OnboardingState;
  shortlist: string[];
  activeFocusByCampus: Record<string, string>;
  missions: Record<string, MissionProgress>;
  reflections: Record<string, FieldworkReflection>;
};

export type SessionAction =
  | { type: "fieldwork/focusSet"; campusId: string; focusId: string }
  | { type: "onboarding/campusSet"; campusId: string | null }
  | { type: "onboarding/academicUnitSet"; academicUnit: string | null }
  | { type: "onboarding/admittedProgramSet"; programName: string | null }
  | { type: "onboarding/admittedLikesSet"; reasonIds: string[] }
  | { type: "onboarding/admittedLikeNoteSet"; note: string }
  | { type: "onboarding/consideredMajorsSet"; majorNames: string[] }
  | { type: "onboarding/noOtherMajorsYetSet"; selected: boolean }
  | { type: "onboarding/declaredMajorsSet"; majorIds: string[] }
  | { type: "onboarding/strengthsSet"; subjects: string[] }
  | { type: "onboarding/enjoymentSet"; subjects: string[] }
  | {
      type: "onboarding/decisionPrioritiesSet";
      priorities: DecisionPriorities;
    }
  | { type: "onboarding/setupCompletedSet"; completed: boolean }
  | {
      type: "onboarding/profileAnswerSet";
      questionId: string;
      optionIds: string[];
    }
  | { type: "onboarding/profileAnswerRemoved"; questionId: string }
  | {
      type: "onboarding/challengeOutcomeSet";
      challengeId: string;
      outcomeId: string;
    }
  | { type: "onboarding/challengeOutcomeRemoved"; challengeId: string }
  | { type: "shortlist/added"; majorId: string }
  | { type: "shortlist/removed"; majorId: string }
  | { type: "shortlist/toggled"; majorId: string }
  | { type: "shortlist/replaced"; majorIds: string[] }
  | {
      type: "mission/statusSet";
      missionId: string;
      status: MissionStatus;
      changedAt?: string | null;
    }
  | { type: "mission/removed"; missionId: string }
  | { type: "reflection/saved"; reflection: FieldworkReflection }
  | { type: "reflection/removed"; missionId: string }
  | { type: "session/hydrated"; persisted: unknown }
  | { type: "session/reset" };
