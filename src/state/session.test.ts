import assert from "node:assert/strict";
import test from "node:test";
import type { SessionAction } from "./types";

import {
  DEFAULT_DECISION_PRIORITIES,
  SESSION_STATE_VERSION,
  createInitialSessionState,
  migrateSessionState,
  selectCompletedMissionIds,
  selectHasMeaningfulProgress,
  selectReflectionForMission,
  selectScalarProfileAnswers,
  selectSessionProgress,
  sessionActions,
  sessionReducer,
} from "./index";

test("repeated onboarding synchronization preserves state identity and revision", () => {
  const actions: SessionAction[] = [
    sessionActions.campusSet("umich"),
    sessionActions.academicUnitSet("LSA"),
    sessionActions.admittedProgramSet("Economics"),
    sessionActions.admittedLikesSet(["Questions", "Questions"]),
    sessionActions.admittedLikeNoteSet("  Curious about incentives  "),
    sessionActions.consideredMajorsSet(["Psychology"]),
    sessionActions.noOtherMajorsYetSet(false),
    sessionActions.declaredMajorsSet(["Economics", "Psychology"]),
    sessionActions.strengthsSet(["Math"]),
    sessionActions.enjoymentSet(["History"]),
    sessionActions.decisionPrioritiesSet({ ...DEFAULT_DECISION_PRIORITIES }),
    sessionActions.profileAnswerSet("question", ["option"]),
    sessionActions.challengeOutcomeSet("challenge", "outcome"),
  ];
  const state = actions.reduce(sessionReducer, createInitialSessionState());
  assert.strictEqual(actions.reduce(sessionReducer, state), state);
  const changed = sessionReducer(state, sessionActions.enjoymentSet(["Art"]));
  assert.equal(changed.revision, state.revision + 1);
  assert.deepEqual(changed.onboarding.enjoyment, ["Art"]);
});

test("removing absent answers and reapplying an empty shortlist are no-ops", () => {
  const state = createInitialSessionState();
  assert.strictEqual(
    sessionReducer(state, {
      type: "onboarding/profileAnswerRemoved",
      questionId: "missing",
    }),
    state,
  );
  assert.strictEqual(
    sessionReducer(state, {
      type: "onboarding/challengeOutcomeRemoved",
      challengeId: "missing",
    }),
    state,
  );
  assert.strictEqual(
    sessionReducer(state, { type: "shortlist/replaced", majorIds: [] }),
    state,
  );
});

test("stores a valid 100-point decision-priority allocation", () => {
  const initial = createInitialSessionState();
  assert.deepEqual(
    initial.onboarding.decisionPriorities,
    DEFAULT_DECISION_PRIORITIES,
  );
  assert.equal(
    Object.values(initial.onboarding.decisionPriorities).reduce(
      (sum, points) => sum + points,
      0,
    ),
    100,
  );

  const allocation = {
    earnings: 30,
    recognition: 10,
    balance: 25,
    impact: 20,
    flexibility: 15,
  };
  const updated = sessionReducer(
    initial,
    sessionActions.decisionPrioritiesSet(allocation),
  );

  assert.deepEqual(updated.onboarding.decisionPriorities, allocation);
  assert.equal(updated.revision, initial.revision + 1);
});

test("stores explicit setup completion and defaults legacy sessions to incomplete", () => {
  const initial = createInitialSessionState();
  assert.equal(initial.onboarding.setupCompleted, false);

  const completed = sessionReducer(
    initial,
    sessionActions.setupCompletedSet(true),
  );
  assert.equal(completed.onboarding.setupCompleted, true);
  assert.equal(completed.revision, initial.revision + 1);
  assert.strictEqual(
    sessionReducer(completed, sessionActions.setupCompletedSet(true)),
    completed,
  );

  const migratedCompleted = migrateSessionState({
    version: SESSION_STATE_VERSION,
    onboarding: { setupCompleted: true },
  });
  assert.equal(migratedCompleted.onboarding.setupCompleted, true);

  const migratedMissing = migrateSessionState({
    version: 3,
    onboarding: {},
  });
  assert.equal(migratedMissing.onboarding.setupCompleted, false);
});

test("rejects invalid allocations and defaults missing or corrupt persistence", () => {
  const initial = createInitialSessionState();
  const invalid = sessionReducer(
    initial,
    sessionActions.decisionPrioritiesSet({
      earnings: 30,
      recognition: 30,
      balance: 30,
      impact: 30,
      flexibility: -20,
    }),
  );
  assert.strictEqual(invalid, initial);

  const migratedMissing = migrateSessionState({
    version: 3,
    onboarding: {},
  });
  assert.deepEqual(
    migratedMissing.onboarding.decisionPriorities,
    DEFAULT_DECISION_PRIORITIES,
  );

  const migratedValid = migrateSessionState({
    version: SESSION_STATE_VERSION,
    onboarding: {
      decisionPriorities: {
        earnings: 5,
        recognition: 10,
        balance: 35,
        impact: 40,
        flexibility: 10,
      },
    },
  });
  assert.deepEqual(migratedValid.onboarding.decisionPriorities, {
    earnings: 5,
    recognition: 10,
    balance: 35,
    impact: 40,
    flexibility: 10,
  });

  const migratedCorrupt = migrateSessionState({
    version: SESSION_STATE_VERSION,
    onboarding: {
      decisionPriorities: {
        earnings: 20,
        recognition: 20,
        balance: 20,
        impact: 20,
        flexibility: 19,
      },
    },
  });
  assert.deepEqual(
    migratedCorrupt.onboarding.decisionPriorities,
    DEFAULT_DECISION_PRIORITIES,
  );
});

test("migrates versionless prototype persistence into the current schema", () => {
  const migrated = migrateSessionState({
    universityId: "umich",
    unit: "Literature, Science, and the Arts",
    declared: ["Economics", "Economics"],
    strengths: ["Math"],
    enjoy: ["History"],
    profileAnswers: {
      group_stuck: "cause",
      work_setting: ["solo", "solo", "small-team"],
    },
    challengeOutcomes: { "price-move": "explored-range", invalid: 42 },
    savedMajorIds: ["economics", "economics", "history"],
  });

  assert.equal(migrated.version, SESSION_STATE_VERSION);
  assert.equal(migrated.onboarding.campusId, "umich");
  assert.equal(
    migrated.onboarding.academicUnit,
    "Literature, Science, and the Arts",
  );
  assert.deepEqual(migrated.onboarding.declaredMajors, ["Economics"]);
  assert.equal(migrated.onboarding.admittedProgram, "Economics");
  assert.deepEqual(migrated.onboarding.consideredMajors, []);
  assert.equal(migrated.onboarding.noOtherMajorsYet, false);
  assert.deepEqual(migrated.onboarding.profileAnswers, {
    group_stuck: ["cause"],
    work_setting: ["solo", "small-team"],
  });
  assert.deepEqual(migrated.onboarding.challengeOutcomes, {
    "price-move": "explored-range",
  });
  assert.deepEqual(migrated.shortlist, ["economics", "history"]);
  assert.deepEqual(selectScalarProfileAnswers(migrated), {
    group_stuck: "cause",
    work_setting: "solo",
  });
});

test("persists admissions intent as distinct context fields", () => {
  let state = createInitialSessionState();
  state = sessionReducer(
    state,
    sessionActions.admittedProgramSet("Journalism"),
  );
  state = sessionReducer(
    state,
    sessionActions.admittedLikesSet([
      "The questions it asks",
      "The questions it asks",
      "The career options feel strong",
    ]),
  );
  state = sessionReducer(
    state,
    sessionActions.admittedLikeNoteSet("  I like explaining what changed.  "),
  );
  state = sessionReducer(
    state,
    sessionActions.consideredMajorsSet(["History", "History", "Economics"]),
  );

  assert.equal(state.onboarding.admittedProgram, "Journalism");
  assert.deepEqual(state.onboarding.admittedLikes, [
    "The questions it asks",
    "The career options feel strong",
  ]);
  assert.equal(
    state.onboarding.admittedLikeNote,
    "I like explaining what changed.",
  );
  assert.deepEqual(state.onboarding.consideredMajors, ["History", "Economics"]);
});

test("keeps an explicit no-other-majors answer exclusive and migrates its legacy label", () => {
  let state = sessionReducer(
    createInitialSessionState(),
    sessionActions.consideredMajorsSet(["History"]),
  );
  state = sessionReducer(state, sessionActions.noOtherMajorsYetSet(true));
  assert.equal(state.onboarding.noOtherMajorsYet, true);
  assert.deepEqual(state.onboarding.consideredMajors, []);

  state = sessionReducer(
    state,
    sessionActions.consideredMajorsSet(["Economics"]),
  );
  assert.equal(state.onboarding.noOtherMajorsYet, false);
  assert.deepEqual(state.onboarding.consideredMajors, ["Economics"]);

  const migrated = migrateSessionState({
    version: 2,
    onboarding: {
      admittedProgram: "Journalism",
      consideredMajors: ["No other majors yet"],
      declaredMajors: ["Journalism", "No other majors yet"],
    },
  });
  assert.equal(migrated.onboarding.noOtherMajorsYet, true);
  assert.deepEqual(migrated.onboarding.consideredMajors, []);
  assert.deepEqual(migrated.onboarding.declaredMajors, ["Journalism"]);
});

test("hydrates persisted mission and reflection data and advances revision", () => {
  const current = createInitialSessionState(3);
  const hydrated = sessionReducer(
    current,
    sessionActions.hydrated({
      version: SESSION_STATE_VERSION,
      revision: 8,
      onboarding: {},
      missions: {
        "preview-course": {
          status: "completed",
          changedAt: "2026-08-30T10:00:00.000Z",
        },
        broken: { status: "unknown" },
      },
      reflections: {
        "preview-course": {
          missionId: "ignored-in-favor-of-key",
          energy: "energized",
          friction: ["ambiguity"],
          note: "The questions stayed interesting.",
          recordedAt: "2026-08-30T10:05:00.000Z",
        },
      },
    }),
  );

  assert.equal(hydrated.revision, 9);
  assert.deepEqual(selectCompletedMissionIds(hydrated), ["preview-course"]);
  assert.equal(
    selectReflectionForMission(hydrated, "preview-course")?.missionId,
    "preview-course",
  );
  assert.equal(selectSessionProgress(hydrated).reflections, 1);
});

test("records mission progress and a normalized fieldwork reflection", () => {
  let state = createInitialSessionState();
  state = sessionReducer(
    state,
    sessionActions.missionStatusSet(
      "talk-to-major",
      "completed",
      "2026-08-30T12:00:00.000Z",
    ),
  );
  state = sessionReducer(
    state,
    sessionActions.reflectionSaved({
      missionId: "talk-to-major",
      energy: "neutral",
      curiosity: "held",
      repeatIntent: "maybe",
      friction: ["coordination", "coordination", "ambiguity"],
      note: "  The routine was more collaborative than expected.  ",
      recordedAt: "2026-08-30T12:15:00.000Z",
    }),
  );

  assert.deepEqual(selectCompletedMissionIds(state), ["talk-to-major"]);
  assert.deepEqual(selectReflectionForMission(state, "talk-to-major"), {
    missionId: "talk-to-major",
    energy: "neutral",
    curiosity: "held",
    repeatIntent: "maybe",
    friction: ["coordination", "ambiguity"],
    note: "The routine was more collaborative than expected.",
    recordedAt: "2026-08-30T12:15:00.000Z",
  });
  assert.deepEqual(selectSessionProgress(state), {
    profileAnswers: 0,
    challengeOutcomes: 0,
    shortlistedMajors: 0,
    completedMissions: 1,
    reflections: 1,
  });
});

test("shortlist add and remove operations are idempotent", () => {
  const initial = createInitialSessionState();
  const added = sessionReducer(initial, {
    type: "shortlist/added",
    majorId: "economics",
  });
  const addedAgain = sessionReducer(added, {
    type: "shortlist/added",
    majorId: "economics",
  });

  assert.deepEqual(added.shortlist, ["economics"]);
  assert.strictEqual(addedAgain, added);

  const removed = sessionReducer(addedAgain, {
    type: "shortlist/removed",
    majorId: "economics",
  });
  const removedAgain = sessionReducer(removed, {
    type: "shortlist/removed",
    majorId: "economics",
  });
  assert.deepEqual(removed.shortlist, []);
  assert.strictEqual(removedAgain, removed);
});

test("reset clears all progress and monotonically advances revision", () => {
  let state = sessionReducer(
    createInitialSessionState(),
    sessionActions.campusSet("umich"),
  );
  state = sessionReducer(state, sessionActions.shortlistToggled("economics"));
  assert.equal(selectHasMeaningfulProgress(state), true);

  const reset = sessionReducer(state, sessionActions.reset());
  assert.deepEqual(reset, createInitialSessionState(state.revision + 1));
  assert.equal(selectHasMeaningfulProgress(reset), false);
});

test("corrupt and future-version persistence safely produce a fresh session", () => {
  assert.deepEqual(migrateSessionState(null), createInitialSessionState());
  assert.deepEqual(
    migrateSessionState("not an object"),
    createInitialSessionState(),
  );
  assert.deepEqual(
    migrateSessionState({
      version: SESSION_STATE_VERSION + 1,
      shortlist: ["economics"],
    }),
    createInitialSessionState(),
  );

  const corruptCurrent = migrateSessionState({
    version: SESSION_STATE_VERSION,
    revision: -10,
    onboarding: {
      strengths: "Math",
      profileAnswers: { valid: [], invalid: 4 },
    },
    missions: { one: null, two: { status: "completed", changedAt: 99 } },
    reflections: { one: { energy: "unknown" } },
  });
  assert.equal(corruptCurrent.revision, 0);
  assert.deepEqual(corruptCurrent.onboarding.strengths, []);
  assert.deepEqual(corruptCurrent.onboarding.profileAnswers, {});
  assert.deepEqual(corruptCurrent.missions, {
    two: { status: "completed", changedAt: null },
  });
  assert.deepEqual(corruptCurrent.reflections, {});
});
