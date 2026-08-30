import {
  DEFAULT_DECISION_PRIORITIES,
  SESSION_STATE_VERSION,
  type SessionState,
} from "./types";

export function createInitialSessionState(revision = 0): SessionState {
  return {
    version: SESSION_STATE_VERSION,
    revision,
    onboarding: {
      campusId: null,
      academicUnit: null,
      admittedProgram: null,
      admittedLikes: [],
      admittedLikeNote: "",
      consideredMajors: [],
      noOtherMajorsYet: false,
      declaredMajors: [],
      strengths: [],
      enjoyment: [],
      decisionPriorities: { ...DEFAULT_DECISION_PRIORITIES },
      setupCompleted: false,
      profileAnswers: {},
      challengeOutcomes: {},
    },
    shortlist: [],
    activeFocusByCampus: {},
    missions: {},
    reflections: {},
  };
}

export const initialSessionState: SessionState = createInitialSessionState();
