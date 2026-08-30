import type { DimensionSignal } from "../../domain";
import type { FieldworkReflection } from "../../state";
import { workSamples } from "./workSamples";

export type FieldworkMission = {
  id: string;
  phase: string;
  title: string;
  body: string;
  time: string;
};

export const fieldworkMissions: readonly FieldworkMission[] = [
  {
    id: "work-sample",
    phase: "TRY NOW · FROM HOME",
    title: "Try one small work sample",
    body: "A tiny version of the work. No grade attached.",
    time: "15 min",
  },
  {
    id: "preview-course",
    phase: "TRY NOW · FROM HOME",
    title: "Preview an intro course",
    body: "See what the real coursework looks like.",
    time: "10 min",
  },
  {
    id: "find-group",
    phase: "PLAN NOW · VISIT AFTER ARRIVAL",
    title: "Find one group doing the work",
    body: "Get around students already doing it.",
    time: "15 min",
  },
  {
    id: "ask-hard-question",
    phase: "REMOTE CONVERSATION OR WELCOME WEEK",
    title: "Ask about the difficult parts",
    body: "“What's the assignment you hated most?”",
    time: "5 min",
  },
  {
    id: "attend-event",
    phase: "WEEKS 1–2",
    title: "Attend one real thing",
    body: "A mass meeting, public talk, or department event.",
    time: "30–60 min",
  },
  {
    id: "talk-to-major",
    phase: "WEEKS 1–2",
    title: "Talk to one current major",
    body: "Ask what a normal Tuesday actually looks like.",
    time: "15 min",
  },
  {
    id: "reality-check",
    phase: "BEFORE ADD/DROP",
    title: "Reality check",
    body: "Did your curiosity survive contact with reality?",
    time: "3 min",
  },
];

const dimensionsByActivity: Record<string, DimensionSignal> = {
  "preview-course": { investigate: 0.8, deepFocus: 0.5 },
  "work-sample": { build: 0.8, iteration: 0.7 },
  "find-group": { collaborative: 0.8, discuss: 0.5 },
  "ask-hard-question": { investigate: 0.7, ambiguity: 0.5 },
  "attend-event": { publicFacing: 0.6, discuss: 0.5 },
  "talk-to-major": { explain: 0.5, investigate: 0.7 },
  "reality-check": { synthesize: 0.8, strategize: 0.5 },
};

const activityIdFrom = (missionId: string) => missionId.split(":").at(-1) ?? "";

export const isKnownFieldworkMissionId = (missionId: string) =>
  Boolean(dimensionsByActivity[activityIdFrom(missionId)]);

export function signalsForFieldworkReflection(
  reflection: FieldworkReflection,
): DimensionSignal {
  const energySignal =
    reflection.energy === "energized"
      ? 0.75
      : reflection.energy === "drained"
        ? -0.65
        : 0.2;
  const curiositySignal =
    reflection.curiosity === "grew"
      ? 0.3
      : reflection.curiosity === "faded"
        ? -0.35
        : 0;
  const repeatSignal =
    reflection.repeatIntent === "yes"
      ? 0.25
      : reflection.repeatIntent === "no"
        ? -0.3
        : 0;
  const direction = Math.max(
    -1,
    Math.min(1, energySignal + curiositySignal + repeatSignal),
  );
  // Do not turn a bad room, poor timing, or social discomfort into dislike of a field.
  // Keep the reflection in the timeline, but wait for clearer evidence to change rankings.
  if (
    reflection.experienceCause === "setting" ||
    reflection.experienceCause === "unsure"
  )
    return {};
  const dimensions =
    activityIdFrom(reflection.missionId) === "work-sample" &&
    reflection.workSampleFamily
      ? workSamples[reflection.workSampleFamily].signals
      : (dimensionsByActivity[activityIdFrom(reflection.missionId)] ?? {});
  return Object.fromEntries(
    Object.entries(dimensions).map(([dimension, value]) => [
      dimension,
      value * direction,
    ]),
  ) as DimensionSignal;
}
