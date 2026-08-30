import assert from "node:assert/strict";
import test from "node:test";
import { createInitialSessionState } from "../../state";
import {
  createShareSafeSession,
  createUserDataExport,
  serializeUserDataExport,
} from "./export";

test("creates a detached, versioned JSON export", () => {
  const state = createInitialSessionState();
  state.onboarding.admittedProgram = "Biology";
  const exported = createUserDataExport(state, "2026-08-30T12:00:00Z");
  exported.appState.onboarding.admittedProgram = "Changed";
  assert.equal(state.onboarding.admittedProgram, "Biology");
  assert.equal(JSON.parse(serializeUserDataExport(exported)).schemaVersion, 1);
});

test("share-safe state strips admissions and notes unless explicitly included", () => {
  const state = createInitialSessionState();
  state.onboarding.admittedProgram = "Biology";
  state.onboarding.admittedLikeNote = "Private";
  state.onboarding.declaredMajors = ["Biology", "Chemistry"];
  state.reflections.one = {
    missionId: "one",
    energy: "neutral",
    friction: [],
    note: "Also private",
    recordedAt: null,
  };
  const safe = createShareSafeSession(state, {
    includeAdmissionsContext: false,
  });
  assert.equal(safe.onboarding.admittedProgram, null);
  assert.deepEqual(safe.onboarding.declaredMajors, []);
  assert.equal(safe.onboarding.admittedLikeNote, "");
  assert.equal(safe.reflections.one.note, "");
});
