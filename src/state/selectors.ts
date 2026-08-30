import {
  DEFAULT_DECISION_PRIORITIES,
  type FieldworkReflection,
  type SessionState,
} from "./types";

export const selectOnboarding = (state: SessionState) => state.onboarding;
export const selectShortlist = (state: SessionState) => state.shortlist;
export const selectMissions = (state: SessionState) => state.missions;
export const selectReflections = (state: SessionState) => state.reflections;

export const selectCompletedMissionIds = (state: SessionState): string[] =>
  Object.entries(state.missions)
    .filter(([, mission]) => mission.status === "completed")
    .map(([missionId]) => missionId);

export const selectReflectionForMission = (
  state: SessionState,
  missionId: string,
): FieldworkReflection | undefined => state.reflections[missionId];

/** Adapter for the current single-answer scoring API. */
export const selectScalarProfileAnswers = (
  state: SessionState,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(state.onboarding.profileAnswers)
      .filter(([, optionIds]) => optionIds.length > 0)
      .map(([questionId, optionIds]) => [questionId, optionIds[0]]),
  );

export const selectHasMeaningfulProgress = (state: SessionState): boolean => {
  const onboarding = state.onboarding;
  return Boolean(
    onboarding.campusId ||
    onboarding.academicUnit ||
    onboarding.admittedProgram ||
    onboarding.admittedLikes.length ||
    onboarding.admittedLikeNote ||
    onboarding.consideredMajors.length ||
    onboarding.noOtherMajorsYet ||
    onboarding.declaredMajors.length ||
    onboarding.strengths.length ||
    onboarding.enjoyment.length ||
    onboarding.setupCompleted ||
    Object.entries(onboarding.decisionPriorities).some(
      ([priority, points]) =>
        points !==
        DEFAULT_DECISION_PRIORITIES[
          priority as keyof typeof DEFAULT_DECISION_PRIORITIES
        ],
    ) ||
    Object.keys(onboarding.profileAnswers).length ||
    Object.keys(onboarding.challengeOutcomes).length ||
    state.shortlist.length ||
    Object.keys(state.missions).length ||
    Object.keys(state.reflections).length,
  );
};

export type SessionProgress = {
  profileAnswers: number;
  challengeOutcomes: number;
  shortlistedMajors: number;
  completedMissions: number;
  reflections: number;
};

export const selectSessionProgress = (
  state: SessionState,
): SessionProgress => ({
  profileAnswers: Object.keys(state.onboarding.profileAnswers).length,
  challengeOutcomes: Object.keys(state.onboarding.challengeOutcomes).length,
  shortlistedMajors: state.shortlist.length,
  completedMissions: selectCompletedMissionIds(state).length,
  reflections: Object.keys(state.reflections).length,
});
