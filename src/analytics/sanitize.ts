import type { BetaAnalyticsEvent, BetaAnalyticsEventName } from "./types";

const forbiddenKeyPattern =
  /^(answers?|profile|profileanswers?|notes?|freetext|response|email|phone|name)$/i;
const safeIdPattern = /^[a-z0-9][a-z0-9._:-]{0,127}$/i;

export class AnalyticsPrivacyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsPrivacyError";
  }
}

const fail = (message: string): never => {
  throw new AnalyticsPrivacyError(message);
};

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return fail(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
};

const rejectSensitiveKeys = (value: unknown, path = "event"): void => {
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      rejectSensitiveKeys(item, `${path}[${index}]`),
    );
    return;
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    if (
      !(path === "event" && key === "name") &&
      forbiddenKeyPattern.test(key)
    ) {
      fail(`Sensitive analytics field rejected: ${path}.${key}`);
    }
    rejectSensitiveKeys(child, `${path}.${key}`);
  });
};

const exactKeys = (
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): void => {
  const allowed = new Set([...required, ...optional]);
  for (const key of required) {
    if (!(key in value)) fail(`Missing analytics field: ${key}`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(`Unknown analytics field rejected: ${key}`);
  }
};

const id = (value: unknown, label: string): string => {
  if (typeof value !== "string" || !safeIdPattern.test(value)) {
    return fail(`${label} must be a non-identifying stable ID`);
  }
  return value;
};

const integer = (
  value: unknown,
  label: string,
  min: number,
  max: number,
): number => {
  if (
    !Number.isInteger(value) ||
    (value as number) < min ||
    (value as number) > max
  ) {
    return fail(`${label} must be an integer from ${min} to ${max}`);
  }
  return value as number;
};

const choice = <T extends string>(
  value: unknown,
  label: string,
  choices: readonly T[],
): T => {
  if (typeof value !== "string" || !choices.includes(value as T)) {
    return fail(`${label} is not an allowed analytics value`);
  }
  return value as T;
};

const ids = (value: unknown): readonly [string, string, ...string[]] => {
  if (!Array.isArray(value) || value.length < 2 || value.length > 3) {
    return fail("majorIds must contain two or three IDs");
  }
  const sanitized = value.map((item) => id(item, "majorIds"));
  if (new Set(sanitized).size !== sanitized.length) {
    return fail("majorIds must be unique");
  }
  return sanitized as [string, string, ...string[]];
};

const campus = (payload: Record<string, unknown>) =>
  id(payload.campusId, "campusId");
const major = (payload: Record<string, unknown>) =>
  id(payload.majorId, "majorId");
const mission = (payload: Record<string, unknown>) =>
  id(payload.missionId, "missionId");

export const sanitizeAnalyticsEvent = (input: unknown): BetaAnalyticsEvent => {
  rejectSensitiveKeys(input);
  const event = record(input, "event");
  exactKeys(event, ["name", "payload"]);
  const name = choice(event.name, "name", [
    "onboarding_started",
    "onboarding_completed",
    "recommendations_revealed",
    "result_opened",
    "shortlist_changed",
    "mission_status_changed",
    "reflection_submitted",
    "session_resumed",
    "comparison_opened",
    "comparison_completed",
    "share_requested",
  ] satisfies readonly BetaAnalyticsEventName[]);
  const payload = record(event.payload, "payload");

  switch (name) {
    case "onboarding_started":
      exactKeys(payload, ["entryPoint"], ["campusId"]);
      return {
        name,
        payload: {
          entryPoint: choice(payload.entryPoint, "entryPoint", [
            "fresh",
            "restart",
          ]),
          ...(payload.campusId === undefined
            ? {}
            : { campusId: id(payload.campusId, "campusId") }),
        },
      };
    case "onboarding_completed":
      exactKeys(payload, ["campusId", "challengeCount", "durationBucket"]);
      return {
        name,
        payload: {
          campusId: campus(payload),
          challengeCount: integer(
            payload.challengeCount,
            "challengeCount",
            0,
            100,
          ),
          durationBucket: choice(payload.durationBucket, "durationBucket", [
            "under_2m",
            "2_to_5m",
            "over_5m",
          ]),
        },
      };
    case "recommendations_revealed":
      exactKeys(payload, ["campusId", "resultCount"]);
      return {
        name,
        payload: {
          campusId: campus(payload),
          resultCount: integer(payload.resultCount, "resultCount", 0, 100),
        },
      };
    case "result_opened":
      exactKeys(payload, ["campusId", "majorId", "rank", "origin"]);
      return {
        name,
        payload: {
          campusId: campus(payload),
          majorId: major(payload),
          rank: integer(payload.rank, "rank", 1, 100),
          origin: choice(payload.origin, "origin", [
            "reveal",
            "explore",
            "shortlist",
            "comparison",
          ]),
        },
      };
    case "shortlist_changed":
      exactKeys(payload, ["campusId", "majorId", "action"]);
      return {
        name,
        payload: {
          campusId: campus(payload),
          majorId: major(payload),
          action: choice(payload.action, "action", ["added", "removed"]),
        },
      };
    case "mission_status_changed":
      exactKeys(payload, ["campusId", "majorId", "missionId", "status"]);
      return {
        name,
        payload: {
          campusId: campus(payload),
          majorId: major(payload),
          missionId: mission(payload),
          status: choice(payload.status, "status", ["started", "completed"]),
        },
      };
    case "reflection_submitted":
      exactKeys(payload, ["campusId", "majorId", "missionId", "sentiment"]);
      return {
        name,
        payload: {
          campusId: campus(payload),
          majorId: major(payload),
          missionId: mission(payload),
          sentiment: choice(payload.sentiment, "sentiment", [
            "energized",
            "neutral",
            "drained",
          ]),
        },
      };
    case "session_resumed":
      exactKeys(payload, ["destination", "daysAwayBucket"]);
      return {
        name,
        payload: {
          destination: choice(payload.destination, "destination", [
            "onboarding",
            "results",
            "explore",
            "shortlist",
            "fieldwork",
          ]),
          daysAwayBucket: choice(payload.daysAwayBucket, "daysAwayBucket", [
            "same_day",
            "1_to_3d",
            "4_to_7d",
            "over_7d",
          ]),
        },
      };
    case "comparison_opened":
      exactKeys(payload, ["campusId", "majorIds"]);
      return {
        name,
        payload: { campusId: campus(payload), majorIds: ids(payload.majorIds) },
      };
    case "comparison_completed": {
      exactKeys(payload, ["campusId", "majorIds"], ["selectedMajorId"]);
      const majorIds = ids(payload.majorIds);
      const selectedMajorId =
        payload.selectedMajorId === undefined
          ? undefined
          : id(payload.selectedMajorId, "selectedMajorId");
      if (
        selectedMajorId !== undefined &&
        !majorIds.includes(selectedMajorId)
      ) {
        fail("selectedMajorId must be one of majorIds");
      }
      return {
        name,
        payload: {
          campusId: campus(payload),
          majorIds,
          ...(selectedMajorId === undefined ? {} : { selectedMajorId }),
        },
      };
    }
    case "share_requested":
      exactKeys(payload, ["artifact", "channel"]);
      return {
        name,
        payload: {
          artifact: choice(payload.artifact, "artifact", [
            "comparison",
            "fieldwork_report",
            "shortlist",
          ]),
          channel: choice(payload.channel, "channel", [
            "native_sheet",
            "copy_link",
            "export",
          ]),
        },
      };
  }
};
