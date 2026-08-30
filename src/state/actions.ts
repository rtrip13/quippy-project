import type {
  DecisionPriorities,
  FieldworkReflection,
  MissionStatus,
  SessionAction,
} from "./types";

export const sessionActions = {
  fieldworkFocusSet: (campusId: string, focusId: string): SessionAction => ({
    type: "fieldwork/focusSet",
    campusId,
    focusId,
  }),
  campusSet: (campusId: string | null): SessionAction => ({
    type: "onboarding/campusSet",
    campusId,
  }),
  academicUnitSet: (academicUnit: string | null): SessionAction => ({
    type: "onboarding/academicUnitSet",
    academicUnit,
  }),
  admittedProgramSet: (programName: string | null): SessionAction => ({
    type: "onboarding/admittedProgramSet",
    programName,
  }),
  admittedLikesSet: (reasonIds: string[]): SessionAction => ({
    type: "onboarding/admittedLikesSet",
    reasonIds,
  }),
  admittedLikeNoteSet: (note: string): SessionAction => ({
    type: "onboarding/admittedLikeNoteSet",
    note,
  }),
  consideredMajorsSet: (majorNames: string[]): SessionAction => ({
    type: "onboarding/consideredMajorsSet",
    majorNames,
  }),
  noOtherMajorsYetSet: (selected: boolean): SessionAction => ({
    type: "onboarding/noOtherMajorsYetSet",
    selected,
  }),
  declaredMajorsSet: (majorIds: string[]): SessionAction => ({
    type: "onboarding/declaredMajorsSet",
    majorIds,
  }),
  strengthsSet: (subjects: string[]): SessionAction => ({
    type: "onboarding/strengthsSet",
    subjects,
  }),
  enjoymentSet: (subjects: string[]): SessionAction => ({
    type: "onboarding/enjoymentSet",
    subjects,
  }),
  decisionPrioritiesSet: (priorities: DecisionPriorities): SessionAction => ({
    type: "onboarding/decisionPrioritiesSet",
    priorities,
  }),
  setupCompletedSet: (completed: boolean): SessionAction => ({
    type: "onboarding/setupCompletedSet",
    completed,
  }),
  profileAnswerSet: (
    questionId: string,
    optionIds: string[],
  ): SessionAction => ({
    type: "onboarding/profileAnswerSet",
    questionId,
    optionIds,
  }),
  challengeOutcomeSet: (
    challengeId: string,
    outcomeId: string,
  ): SessionAction => ({
    type: "onboarding/challengeOutcomeSet",
    challengeId,
    outcomeId,
  }),
  shortlistToggled: (majorId: string): SessionAction => ({
    type: "shortlist/toggled",
    majorId,
  }),
  missionStatusSet: (
    missionId: string,
    status: MissionStatus,
    changedAt: string | null = null,
  ): SessionAction => ({
    type: "mission/statusSet",
    missionId,
    status,
    changedAt,
  }),
  reflectionSaved: (reflection: FieldworkReflection): SessionAction => ({
    type: "reflection/saved",
    reflection,
  }),
  hydrated: (persisted: unknown): SessionAction => ({
    type: "session/hydrated",
    persisted,
  }),
  reset: (): SessionAction => ({ type: "session/reset" }),
};
