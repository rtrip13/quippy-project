import { sanitizeAnalyticsEvent } from "./sanitize";
import type {
  AnalyticsListener,
  AnalyticsTracker,
  BetaAnalyticsEvent,
  TrackedBetaAnalyticsEvent,
} from "./types";

type Clock = () => Date;

const freezeTrackedEvent = (
  event: BetaAnalyticsEvent,
  sequence: number,
  occurredAt: string,
): TrackedBetaAnalyticsEvent =>
  Object.freeze({
    ...event,
    payload: Object.freeze({
      ...event.payload,
      ...(event.name === "comparison_opened" ||
      event.name === "comparison_completed"
        ? { majorIds: Object.freeze([...event.payload.majorIds]) }
        : {}),
    }),
    sequence,
    occurredAt,
  }) as TrackedBetaAnalyticsEvent;

export const createMemoryAnalyticsTracker = ({
  clock = () => new Date(),
  maxEvents = 500,
}: {
  clock?: Clock;
  maxEvents?: number;
} = {}): AnalyticsTracker => {
  if (!Number.isInteger(maxEvents) || maxEvents < 1) {
    throw new RangeError("maxEvents must be a positive integer");
  }

  let sequence = 0;
  const events: TrackedBetaAnalyticsEvent[] = [];
  const listeners = new Set<AnalyticsListener>();

  return {
    track(input) {
      const event = sanitizeAnalyticsEvent(input);
      const tracked = freezeTrackedEvent(
        event,
        ++sequence,
        clock().toISOString(),
      );
      events.push(tracked);
      if (events.length > maxEvents)
        events.splice(0, events.length - maxEvents);
      listeners.forEach((listener) => listener(tracked));
      return tracked;
    },
    snapshot() {
      return Object.freeze([...events]);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const createNoopAnalyticsTracker = (): AnalyticsTracker => ({
  track(input) {
    sanitizeAnalyticsEvent(input);
    return null;
  },
  snapshot: () => Object.freeze([]),
  subscribe: () => () => undefined,
});

export const analytics = createNoopAnalyticsTracker();
