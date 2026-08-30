import assert from "node:assert/strict";
import test from "node:test";

import {
  AnalyticsPrivacyError,
  createMemoryAnalyticsTracker,
  createNoopAnalyticsTracker,
  sanitizeAnalyticsEvent,
} from "./index";

test("memory tracker records deterministic immutable funnel events", () => {
  const tracker = createMemoryAnalyticsTracker({
    clock: () => new Date("2026-08-30T12:00:00.000Z"),
  });
  const received: string[] = [];
  const unsubscribe = tracker.subscribe((event) => received.push(event.name));

  const tracked = tracker.track({
    name: "result_opened",
    payload: {
      campusId: "umich",
      majorId: "economics",
      rank: 2,
      origin: "reveal",
    },
  });

  assert.deepEqual(tracked, {
    name: "result_opened",
    payload: {
      campusId: "umich",
      majorId: "economics",
      rank: 2,
      origin: "reveal",
    },
    sequence: 1,
    occurredAt: "2026-08-30T12:00:00.000Z",
  });
  assert.deepEqual(received, ["result_opened"]);
  assert.ok(Object.isFrozen(tracker.snapshot()));
  assert.ok(Object.isFrozen(tracker.snapshot()[0]?.payload));

  unsubscribe();
  tracker.track({
    name: "share_requested",
    payload: { artifact: "comparison", channel: "native_sheet" },
  });
  assert.deepEqual(received, ["result_opened"]);
});

test("memory tracker limits snapshots but keeps monotonic sequence numbers", () => {
  const tracker = createMemoryAnalyticsTracker({ maxEvents: 1 });
  tracker.track({
    name: "session_resumed",
    payload: { destination: "results", daysAwayBucket: "same_day" },
  });
  const second = tracker.track({
    name: "recommendations_revealed",
    payload: { campusId: "umich", resultCount: 5 },
  });

  assert.equal(tracker.snapshot().length, 1);
  assert.equal(second?.sequence, 2);
});

test("sanitizer rejects raw notes and profile answers at any depth", () => {
  for (const unsafe of [
    {
      name: "reflection_submitted",
      payload: {
        campusId: "umich",
        majorId: "economics",
        missionId: "interview",
        sentiment: "energized",
        note: "I talked to a named student",
      },
    },
    {
      name: "onboarding_completed",
      payload: {
        campusId: "umich",
        challengeCount: 5,
        durationBucket: "2_to_5m",
        context: { profileAnswers: ["private answer"] },
      },
    },
  ]) {
    assert.throws(() => sanitizeAnalyticsEvent(unsafe), AnalyticsPrivacyError);
  }
});

test("sanitizer rejects unknown fields, identifying strings, and invalid comparison data", () => {
  assert.throws(
    () =>
      sanitizeAnalyticsEvent({
        name: "share_requested",
        payload: {
          artifact: "comparison",
          channel: "native_sheet",
          recipient: "person@example.com",
        },
      }),
    AnalyticsPrivacyError,
  );
  assert.throws(
    () =>
      sanitizeAnalyticsEvent({
        name: "result_opened",
        payload: {
          campusId: "University of Michigan",
          majorId: "economics",
          rank: 1,
          origin: "reveal",
        },
      }),
    AnalyticsPrivacyError,
  );
  assert.throws(
    () =>
      sanitizeAnalyticsEvent({
        name: "comparison_completed",
        payload: {
          campusId: "umich",
          majorIds: ["economics", "statistics"],
          selectedMajorId: "history",
        },
      }),
    AnalyticsPrivacyError,
  );
});

test("noop tracker validates privacy without retaining events", () => {
  const tracker = createNoopAnalyticsTracker();
  assert.equal(
    tracker.track({
      name: "shortlist_changed",
      payload: { campusId: "umich", majorId: "economics", action: "added" },
    }),
    null,
  );
  assert.deepEqual(tracker.snapshot(), []);
});
