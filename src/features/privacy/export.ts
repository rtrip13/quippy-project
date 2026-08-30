import { migrateSessionState, type SessionState } from "../../state";

export type UserDataExport = {
  schema: "unlabeled.user-data";
  schemaVersion: 1;
  exportedAt: string;
  appState: SessionState;
};

export type SharePrivacyOptions = {
  includeAdmissionsContext?: boolean;
  includeFreeText?: boolean;
  includeFieldworkNotes?: boolean;
};

/** Produces a detached, serializable copy; mutations cannot alter live state. */
export function createUserDataExport(
  state: SessionState,
  exportedAt: string,
): UserDataExport {
  const appState = migrateSessionState(JSON.parse(JSON.stringify(state)));
  return {
    schema: "unlabeled.user-data",
    schemaVersion: 1,
    exportedAt,
    appState,
  };
}

export function serializeUserDataExport(value: UserDataExport): string {
  return JSON.stringify(value, null, 2);
}

/** Removes sensitive context from a detached copy before it is shared. */
export function createShareSafeSession(
  state: SessionState,
  options: SharePrivacyOptions = {},
): SessionState {
  const copy = createUserDataExport(state, "redacted-copy").appState;
  if (options.includeAdmissionsContext === false) {
    copy.onboarding.admittedProgram = null;
    copy.onboarding.admittedLikes = [];
    copy.onboarding.consideredMajors = [];
    copy.onboarding.declaredMajors = [];
    copy.onboarding.noOtherMajorsYet = false;
  }
  if (options.includeFreeText !== true) {
    copy.onboarding.admittedLikeNote = "";
  }
  if (options.includeFieldworkNotes !== true) {
    copy.reflections = Object.fromEntries(
      Object.entries(copy.reflections).map(([id, reflection]) => [
        id,
        { ...reflection, note: "" },
      ]),
    );
  }
  return copy;
}

export const privacyControlCopy = {
  localStorage:
    "Your exploration data stays on this device unless you choose to export or share it.",
  evidenceControl:
    "You can remove reflections or reset all evidence at any time.",
  sharing:
    "Admissions context and free-text notes are optional in every share artifact.",
  ai: "AI assistance is optional. Raw responses are never sent directly to a model provider from the app.",
} as const;
