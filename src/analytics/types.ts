export type OnboardingEntryPoint = "fresh" | "restart";
export type DurationBucket = "under_2m" | "2_to_5m" | "over_5m";
export type ResultOrigin = "reveal" | "explore" | "shortlist" | "comparison";
export type ReflectionSentiment = "energized" | "neutral" | "drained";
export type ResumeDestination =
  "onboarding" | "results" | "explore" | "shortlist" | "fieldwork";
export type DaysAwayBucket = "same_day" | "1_to_3d" | "4_to_7d" | "over_7d";
export type ShareArtifact = "comparison" | "fieldwork_report" | "shortlist";
export type ShareChannel = "native_sheet" | "copy_link" | "export";

type CampusPayload = { campusId: string };
type MajorPayload = CampusPayload & { majorId: string };
type MissionPayload = MajorPayload & { missionId: string };

export type BetaAnalyticsEvent =
  | {
      name: "onboarding_started";
      payload: { campusId?: string; entryPoint: OnboardingEntryPoint };
    }
  | {
      name: "onboarding_completed";
      payload: CampusPayload & {
        challengeCount: number;
        durationBucket: DurationBucket;
      };
    }
  | {
      name: "recommendations_revealed";
      payload: CampusPayload & { resultCount: number };
    }
  | {
      name: "result_opened";
      payload: MajorPayload & { rank: number; origin: ResultOrigin };
    }
  | {
      name: "shortlist_changed";
      payload: MajorPayload & { action: "added" | "removed" };
    }
  | {
      name: "mission_status_changed";
      payload: MissionPayload & { status: "started" | "completed" };
    }
  | {
      name: "reflection_submitted";
      payload: MissionPayload & { sentiment: ReflectionSentiment };
    }
  | {
      name: "session_resumed";
      payload: {
        destination: ResumeDestination;
        daysAwayBucket: DaysAwayBucket;
      };
    }
  | {
      name: "comparison_opened";
      payload: CampusPayload & {
        majorIds: readonly [string, string, ...string[]];
      };
    }
  | {
      name: "comparison_completed";
      payload: CampusPayload & {
        majorIds: readonly [string, string, ...string[]];
        selectedMajorId?: string;
      };
    }
  | {
      name: "share_requested";
      payload: { artifact: ShareArtifact; channel: ShareChannel };
    };

export type BetaAnalyticsEventName = BetaAnalyticsEvent["name"];

export type TrackedBetaAnalyticsEvent = BetaAnalyticsEvent & {
  readonly sequence: number;
  readonly occurredAt: string;
};

export type AnalyticsListener = (event: TrackedBetaAnalyticsEvent) => void;

export interface AnalyticsTracker {
  track(event: BetaAnalyticsEvent): TrackedBetaAnalyticsEvent | null;
  snapshot(): readonly TrackedBetaAnalyticsEvent[];
  subscribe(listener: AnalyticsListener): () => void;
}
