import { createInitialSessionState } from "./initial";
import { migrateSessionState } from "./migrations";
import type { DecisionPriorities, SessionAction, SessionState } from "./types";

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
const validDecisionPriorities = (priorities: DecisionPriorities): boolean => {
  const points = Object.values(priorities);
  return (
    points.length === 5 &&
    points.every((point) => Number.isInteger(point) && point >= 0) &&
    points.reduce((sum, point) => sum + point, 0) === 100
  );
};
// Repeated UI synchronization must not create revisions or disk writes.
const sameValue = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object")
    return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const a = left as Record<string, unknown>;
  const b = right as Record<string, unknown>;
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        sameValue(a[key], b[key]),
    )
  );
};
const next = (
  state: SessionState,
  patch: Omit<Partial<SessionState>, "revision">,
): SessionState =>
  Object.entries(patch).every(([key, value]) =>
    sameValue(state[key as keyof SessionState], value),
  )
    ? state
    : {
        ...state,
        ...patch,
        revision: state.revision + 1,
      };

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "fieldwork/focusSet":
      if (
        !action.campusId ||
        !action.focusId ||
        state.activeFocusByCampus[action.campusId] === action.focusId
      )
        return state;
      return next(state, {
        activeFocusByCampus: {
          ...state.activeFocusByCampus,
          [action.campusId]: action.focusId,
        },
      });
    case "onboarding/campusSet":
      return next(state, {
        onboarding: { ...state.onboarding, campusId: action.campusId },
      });
    case "onboarding/academicUnitSet":
      return next(state, {
        onboarding: { ...state.onboarding, academicUnit: action.academicUnit },
      });
    case "onboarding/admittedProgramSet":
      return next(state, {
        onboarding: {
          ...state.onboarding,
          admittedProgram: action.programName,
        },
      });
    case "onboarding/admittedLikesSet":
      return next(state, {
        onboarding: {
          ...state.onboarding,
          admittedLikes: unique(action.reasonIds),
        },
      });
    case "onboarding/admittedLikeNoteSet":
      return next(state, {
        onboarding: {
          ...state.onboarding,
          admittedLikeNote: action.note.trim(),
        },
      });
    case "onboarding/consideredMajorsSet":
      return next(state, {
        onboarding: {
          ...state.onboarding,
          consideredMajors: unique(action.majorNames),
          noOtherMajorsYet: action.majorNames.length
            ? false
            : state.onboarding.noOtherMajorsYet,
        },
      });
    case "onboarding/noOtherMajorsYetSet":
      return next(state, {
        onboarding: {
          ...state.onboarding,
          noOtherMajorsYet: action.selected,
          consideredMajors: action.selected
            ? []
            : state.onboarding.consideredMajors,
        },
      });
    case "onboarding/declaredMajorsSet":
      return next(state, {
        onboarding: {
          ...state.onboarding,
          declaredMajors: unique(action.majorIds),
        },
      });
    case "onboarding/strengthsSet":
      return next(state, {
        onboarding: { ...state.onboarding, strengths: unique(action.subjects) },
      });
    case "onboarding/enjoymentSet":
      return next(state, {
        onboarding: { ...state.onboarding, enjoyment: unique(action.subjects) },
      });
    case "onboarding/decisionPrioritiesSet":
      if (!validDecisionPriorities(action.priorities)) return state;
      return next(state, {
        onboarding: {
          ...state.onboarding,
          decisionPriorities: { ...action.priorities },
        },
      });
    case "onboarding/setupCompletedSet":
      if (state.onboarding.setupCompleted === action.completed) return state;
      return next(state, {
        onboarding: {
          ...state.onboarding,
          setupCompleted: action.completed,
        },
      });
    case "onboarding/profileAnswerSet": {
      const optionIds = unique(action.optionIds);
      if (!optionIds.length) {
        const { [action.questionId]: _, ...profileAnswers } =
          state.onboarding.profileAnswers;
        return next(state, {
          onboarding: { ...state.onboarding, profileAnswers },
        });
      }
      return next(state, {
        onboarding: {
          ...state.onboarding,
          profileAnswers: {
            ...state.onboarding.profileAnswers,
            [action.questionId]: optionIds,
          },
        },
      });
    }
    case "onboarding/profileAnswerRemoved": {
      const { [action.questionId]: _, ...profileAnswers } =
        state.onboarding.profileAnswers;
      return next(state, {
        onboarding: { ...state.onboarding, profileAnswers },
      });
    }
    case "onboarding/challengeOutcomeSet":
      return next(state, {
        onboarding: {
          ...state.onboarding,
          challengeOutcomes: {
            ...state.onboarding.challengeOutcomes,
            [action.challengeId]: action.outcomeId,
          },
        },
      });
    case "onboarding/challengeOutcomeRemoved": {
      const { [action.challengeId]: _, ...challengeOutcomes } =
        state.onboarding.challengeOutcomes;
      return next(state, {
        onboarding: { ...state.onboarding, challengeOutcomes },
      });
    }
    case "shortlist/added":
      return state.shortlist.includes(action.majorId)
        ? state
        : next(state, { shortlist: [...state.shortlist, action.majorId] });
    case "shortlist/removed":
      return state.shortlist.includes(action.majorId)
        ? next(state, {
            shortlist: state.shortlist.filter((id) => id !== action.majorId),
          })
        : state;
    case "shortlist/toggled":
      return next(state, {
        shortlist: state.shortlist.includes(action.majorId)
          ? state.shortlist.filter((id) => id !== action.majorId)
          : [...state.shortlist, action.majorId],
      });
    case "shortlist/replaced":
      return next(state, { shortlist: unique(action.majorIds) });
    case "mission/statusSet":
      return next(state, {
        missions: {
          ...state.missions,
          [action.missionId]: {
            status: action.status,
            changedAt: action.changedAt ?? null,
          },
        },
      });
    case "mission/removed": {
      const { [action.missionId]: _, ...missions } = state.missions;
      return next(state, { missions });
    }
    case "reflection/saved": {
      const reflection = {
        ...action.reflection,
        friction: unique(action.reflection.friction),
        note: action.reflection.note.trim(),
      };
      return next(state, {
        reflections: {
          ...state.reflections,
          [reflection.missionId]: reflection,
        },
      });
    }
    case "reflection/removed": {
      const { [action.missionId]: _, ...reflections } = state.reflections;
      return next(state, { reflections });
    }
    case "session/hydrated": {
      const hydrated = migrateSessionState(action.persisted);
      return {
        ...hydrated,
        revision: Math.max(state.revision, hydrated.revision) + 1,
      };
    }
    case "session/reset":
      return createInitialSessionState(state.revision + 1);
  }
}
