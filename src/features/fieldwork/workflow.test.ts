import assert from "node:assert/strict";
import test from "node:test";
import { getSchoolData, schoolRegistry } from "../../data/schools";
import {
  createInitialSessionState,
  migrateSessionState,
  selectCompletedMissionIds,
  sessionActions,
  sessionReducer,
} from "../../state";
import { buildMissionBrief } from "./brief";
import {
  directionId,
  fieldworkFocusOptions,
  resolveFieldworkFocus,
} from "./focus";
import { fieldworkMissions, signalsForFieldworkReflection } from "./model";
import { isWorkSampleFamily, workSamples } from "./workSamples";

const baseReflection = {
  missionId: "umich:direction-humanities-languages:work-sample",
  energy: "energized" as const,
  curiosity: "grew" as const,
  repeatIntent: "yes" as const,
  experienceCause: "work" as const,
  friction: [],
  note: "I enjoyed revising the argument.",
  recordedAt: "2026-08-30T12:00:00Z",
};

test("every direction has a distinct, self-contained work sample", () => {
  const samples = Object.values(workSamples);
  assert.equal(samples.length, 11);
  assert.equal(new Set(samples.map((sample) => sample.prompt)).size, 11);
  for (const sample of samples) {
    assert.equal(sample.steps.length, 3);
    assert.ok(sample.deliverable.length > 20);
    assert.ok(Object.keys(sample.signals).length >= 2);
  }
  assert.equal(isWorkSampleFamily("toString"), false);
  assert.equal(isWorkSampleFamily("not-a-family"), false);
});

test("all seven missions have a concrete brief, including unknown-campus fallback", () => {
  for (const school of schoolRegistry) {
    for (const focus of fieldworkFocusOptions(school).filter(
      (option) => !option.program,
    )) {
      for (const mission of fieldworkMissions) {
        const brief = buildMissionBrief(
          `${school.id}:${focus.id}:${mission.id}`,
          focus,
          school,
        );
        assert.ok(brief.title && brief.prompt && brief.deliverable);
        assert.equal(brief.steps.length, 3);
        if (mission.id === "work-sample")
          assert.equal(brief.resource, undefined);
        if (brief.resource)
          assert.ok(
            school.officialSources.some(
              (source) => source.url === brief.resource?.url,
            ),
          );
      }
    }
  }
});

test("a campus resource and outreach draft do not imply an event date or send a message", () => {
  const school = getSchoolData("umich");
  const focus = resolveFieldworkFocus(
    school,
    directionId("Humanities & Languages"),
  );
  const resource = {
    title: "Official group page",
    url: "https://example.edu/group",
  };
  const brief = buildMissionBrief("talk-to-major", focus, school, resource);
  assert.equal(brief.resource?.url, resource.url);
  assert.match(brief.outreach!, /ten minutes/);
  assert.match(brief.deliverable, /after the conversation/);
});

test("focus remains selected when the recommendation order changes", () => {
  const school = getSchoolData("umich");
  const selected = directionId("Humanities & Languages");
  assert.equal(
    resolveFieldworkFocus(school, selected, directionId("Computing & Data")).id,
    selected,
  );
  const program = school.catalog.programs[0];
  assert.equal(
    resolveFieldworkFocus(school, program.id).program?.id,
    program.id,
  );
  const fallback = directionId("Business & Economics");
  assert.equal(
    resolveFieldworkFocus(getSchoolData("ucla"), program.id, fallback).id,
    fallback,
  );
});

test("switching focus preserves completed missions and saves a separate choice per campus", () => {
  let state = createInitialSessionState();
  state = sessionReducer(state, sessionActions.reflectionSaved(baseReflection));
  state = sessionReducer(
    state,
    sessionActions.missionStatusSet(
      baseReflection.missionId,
      "completed",
      baseReflection.recordedAt,
    ),
  );
  state = sessionReducer(
    state,
    sessionActions.fieldworkFocusSet("umich", directionId("Computing & Data")),
  );
  state = sessionReducer(
    state,
    sessionActions.fieldworkFocusSet(
      "ucla",
      directionId("Arts, Design & Performance"),
    ),
  );
  const restored = migrateSessionState(JSON.parse(JSON.stringify(state)));
  assert.equal(
    restored.activeFocusByCampus.umich,
    directionId("Computing & Data"),
  );
  assert.equal(
    restored.activeFocusByCampus.ucla,
    directionId("Arts, Design & Performance"),
  );
  assert.deepEqual(selectCompletedMissionIds(restored), [
    baseReflection.missionId,
  ]);
  assert.equal(
    restored.reflections[baseReflection.missionId].note,
    baseReflection.note,
  );
  assert.strictEqual(
    sessionReducer(
      state,
      sessionActions.fieldworkFocusSet(
        "umich",
        directionId("Computing & Data"),
      ),
    ),
    state,
  );
});

test("starting a mission persists planned status without manufacturing evidence", () => {
  const state = sessionReducer(
    createInitialSessionState(),
    sessionActions.missionStatusSet(
      baseReflection.missionId,
      "planned",
      baseReflection.recordedAt,
    ),
  );
  const restored = migrateSessionState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.missions[baseReflection.missionId].status, "planned");
  assert.deepEqual(selectCompletedMissionIds(restored), []);
  assert.deepEqual(restored.reflections, {});
});

test("humanities and computing work samples produce different evidence", () => {
  const humanities = signalsForFieldworkReflection({
    ...baseReflection,
    workSampleFamily: "Humanities & Languages",
  });
  const computing = signalsForFieldworkReflection({
    ...baseReflection,
    workSampleFamily: "Computing & Data",
  });
  assert.ok(humanities.synthesize! > 0);
  assert.equal(humanities.build, undefined);
  assert.ok(computing.build! > 0);
  assert.equal(computing.synthesize, undefined);
});

test("setting-related or uncertain reactions do not alter work-fit signals", () => {
  for (const experienceCause of ["setting", "unsure"] as const) {
    assert.deepEqual(
      signalsForFieldworkReflection({
        ...baseReflection,
        experienceCause,
        energy: "drained",
        workSampleFamily: "Humanities & Languages",
      }),
      {},
    );
  }
  const negative = signalsForFieldworkReflection({
    ...baseReflection,
    experienceCause: "work",
    energy: "drained",
    curiosity: "faded",
    repeatIntent: "no",
    workSampleFamily: "Humanities & Languages",
  });
  assert.ok(negative.synthesize! < 0);
});

test("sample context survives hydration, but old reflections are not retroactively reinterpreted", () => {
  const old = migrateSessionState({
    version: 4,
    reflections: { old: { ...baseReflection, missionId: "old" } },
  });
  assert.deepEqual(old.activeFocusByCampus, {});
  assert.equal(old.reflections.old.workSampleFamily, undefined);
  const state = sessionReducer(
    createInitialSessionState(),
    sessionActions.reflectionSaved({
      ...baseReflection,
      workSampleFamily: "Humanities & Languages",
    }),
  );
  const restored = migrateSessionState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(
    restored.reflections[baseReflection.missionId],
    state.reflections[baseReflection.missionId],
  );
  const invalid = migrateSessionState({
    reflections: {
      invalid: {
        ...baseReflection,
        workSampleFamily: "toString",
        experienceCause: "bogus",
      },
    },
  });
  assert.equal(invalid.reflections.invalid.workSampleFamily, undefined);
  assert.equal(invalid.reflections.invalid.experienceCause, undefined);
});

test("editing a reflection replaces the clue and resetting clears saved focus", () => {
  let state = sessionReducer(
    createInitialSessionState(),
    sessionActions.reflectionSaved(baseReflection),
  );
  state = sessionReducer(
    state,
    sessionActions.reflectionSaved({
      ...baseReflection,
      note: "An updated take",
    }),
  );
  assert.equal(Object.keys(state.reflections).length, 1);
  assert.equal(
    state.reflections[baseReflection.missionId].note,
    "An updated take",
  );
  state = sessionReducer(
    state,
    sessionActions.fieldworkFocusSet("umich", "economics"),
  );
  const reset = sessionReducer(state, sessionActions.reset());
  assert.deepEqual(reset.activeFocusByCampus, {});
  assert.deepEqual(reset.reflections, {});
});
