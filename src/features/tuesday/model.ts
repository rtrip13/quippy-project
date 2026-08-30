import type { Family } from "../../data/schools/types";
import approvedScenarios from "./approvedScenarios.json";

export type TuesdayMoment = {
  time: string;
  place: string;
  text: string;
  question: string;
  choices: [string, string, string];
};

type Scene = [place: string, text: string, task: string];
const scenes: Record<Family | "economics", [Scene, Scene, Scene]> = {
  "Social & Behavioral Sciences": [
    [
      "Psychology · study design",
      "Students who sleep less also report more stress. You sketch a study to check whether sleep affects stress, or whether exams could explain both.",
      "designing a study to untangle sleep and stress",
    ],
    [
      "Sociology · interview analysis",
      "You read six short interviews about why students skip campus events. You tag comments about cost, timing, and feeling unwelcome, then compare patterns.",
      "sorting interview responses into patterns",
    ],
    [
      "Research methods · checking a claim",
      "Your survey mostly reached students in one residence hall. You revise the conclusion so it does not claim to describe the whole campus.",
      "checking who a survey leaves out",
    ],
  ],
  "Computing & Data": [
    [
      "Programming · debug a sign-up form",
      "A club sign-up form crashes when someone leaves their name blank. You trace what happens to that empty value, add a check, and try the form again.",
      "tracking down this bug",
    ],
    [
      "Data analysis · clean a spreadsheet",
      "A bike-share spreadsheet lists the same station under three names. You merge the duplicates before making a chart of the busiest stops.",
      "cleaning messy data before making a chart",
    ],
    [
      "Software testing · try to break it",
      "Your form works for one person. Now you test duplicate submissions, very long names, and missing fields, recording what fails each time.",
      "testing the same form with different edge cases",
    ],
  ],
  "Engineering & Built Environment": [
    [
      "Design exercise · a wobbling shelf",
      "A shelf bends under a stack of books. You sketch two brace designs and compare how each transfers weight to the wall.",
      "comparing ways to support the shelf",
    ],
    [
      "Prototype workshop · test a brace",
      "Your cardboard brace holds three books but folds under four. You measure where it buckles, change the shape, and test it with the same load.",
      "rebuilding a prototype after it fails",
    ],
    [
      "Design review · check the constraints",
      "Your stronger brace blocks the space below the shelf. You revise the drawing to keep the support while leaving room for someone to sit.",
      "revising a design around competing constraints",
    ],
  ],
  "Natural & Physical Sciences": [
    [
      "Lab exercise · an unexpected result",
      "Two cups of water cool at different rates. You plan a repeat with equal volumes and matching containers to check whether the container explains the difference.",
      "planning a controlled experiment",
    ],
    [
      "Lab notebook · measure and compare",
      "You record both temperatures every two minutes and plot the readings. One point looks wrong, so you check the notebook before deciding what to do with it.",
      "measuring carefully and checking an odd result",
    ],
    [
      "Lab report · explain the uncertainty",
      "The repeat shows a smaller difference. You write a paragraph explaining what the measurements support and what you would need to test again.",
      "explaining why an experiment is inconclusive",
    ],
  ],
  "Health & Human Services": [
    [
      "Practice interview · understand a barrier",
      "In a fictional case, someone keeps missing appointments because the bus route changed. You prepare questions about their schedule and what support they want.",
      "asking questions to understand someone's care barriers",
    ],
    [
      "Class role-play · explain a plan",
      "A classmate plays someone confused by an appointment handout. You explain the steps in plain language, then ask them to describe the plan back to you.",
      "practicing a clear, patient explanation",
    ],
    [
      "Case notes · document the handoff",
      "You turn the role-play into a short note: what the person said, which barriers remain, and what the next team member needs to follow up on.",
      "writing careful notes after a conversation",
    ],
  ],
  "Business & Economics": [
    [
      "Business case · a campus café",
      "A café sells out at lunch but loses money overall. You compare ingredient costs, staffing, and sales to find which items actually cover their costs.",
      "using costs and sales to investigate a business problem",
    ],
    [
      "Team recommendation · pick a tradeoff",
      "The café can raise prices or shorten its quiet evening hours. Your group compares the likely effect on customers, staff, and weekly costs.",
      "weighing two imperfect business options",
    ],
    [
      "Spreadsheet · check the assumptions",
      "Your recommendation assumes lunchtime sales stay steady. You recalculate with 20% fewer orders and explain whether you would still make the same choice.",
      "rechecking a recommendation when the numbers change",
    ],
  ],
  economics: [
    [
      "Economics · why did rent rise?",
      "Rent rose near campus after enrollment grew, but few apartments were built. You draw a supply-and-demand graph and explain what could happen if more housing opens.",
      "using a model to explain a rent change",
    ],
    [
      "Problem set · compare explanations",
      "Rent also rose in a nearby town with flat enrollment. You compare construction costs and housing availability to see which explanation fits both places.",
      "comparing evidence for competing economic explanations",
    ],
    [
      "Model revision · challenge an assumption",
      "Your model assumes students can move freely. You add moving costs and a long bus commute, then explain how those constraints change your prediction.",
      "reworking a model when an assumption fails",
    ],
  ],
  "Humanities & Languages": [
    [
      "Close reading · two accounts",
      "Two letters describe the same factory strike differently. You underline phrases that reveal each writer's perspective and choose a passage to support your interpretation.",
      "comparing how two writers describe the same event",
    ],
    [
      "Seminar · defend an interpretation",
      "A classmate reads one phrase as sincere; you think it is sarcastic. You compare surrounding sentences and explain which reading the text supports.",
      "discussing competing interpretations of a passage",
    ],
    [
      "Essay revision · narrow a claim",
      "Your draft says every worker supported the strike, but one letter disagrees. You rewrite the claim and check that each quotation supports the new version.",
      "revising an argument after finding conflicting evidence",
    ],
  ],
  "Arts, Design & Performance": [
    [
      "Design studio · make three versions",
      "You design a poster for a student concert. You try three arrangements of the title, date, and image so someone walking past can quickly find the essentials.",
      "making several visual versions of the same idea",
    ],
    [
      "Critique · watch someone use it",
      "A classmate likes the image but cannot find the concert date. You observe where they look first, then change the spacing and size of the text.",
      "using critique to revise your design",
    ],
    [
      "Production · refine the details",
      "A test print makes the small text hard to read. You adjust the contrast, check the margins, and print another version before calling it finished.",
      "repeating small revisions to get the details right",
    ],
  ],
  "Communication & Media": [
    [
      "Reporting exercise · find the story",
      "Campus bus service has changed. You draft questions for a commuter and a transit organizer to find out what changed and whose experience is missing.",
      "interviewing different people about the same issue",
    ],
    [
      "Editing · build a short explainer",
      "You have five minutes of interview audio and room for a 45-second clip. You choose excerpts that explain the change without distorting what anyone meant.",
      "editing a clear story from longer interviews",
    ],
    [
      "Fact check · verify before publishing",
      "An interview says the last bus leaves at ten, but the timetable says ten-thirty. You verify the route and date, then correct the script and captions.",
      "checking small factual details before publishing",
    ],
  ],
  "Education, Public Service & Policy": [
    [
      "Policy exercise · library hours",
      "Students want the library open later, but the budget can fund only ten extra staff hours. You compare later closing times with opening on Sunday.",
      "comparing ways to use a limited public budget",
    ],
    [
      "Community feedback · who is missing?",
      "Most survey replies came from students living on campus. You draft questions for commuters and students with jobs before choosing a schedule.",
      "seeking feedback from people a proposal may overlook",
    ],
    [
      "Policy memo · make it workable",
      "You recommend Sunday opening. Now you write who would staff it, how much it costs, and what attendance data would tell you whether to keep it.",
      "turning a proposal into an implementation plan",
    ],
  ],
  "Interdisciplinary & Individualized": [
    [
      "Project design · a hotter campus",
      "You want to understand why one campus courtyard feels hotter than another. You plan to combine temperature readings, shade maps, and student interviews.",
      "combining different methods to study one problem",
    ],
    [
      "Synthesis · evidence disagrees",
      "The coolest courtyard gets little use. Interviews point to uncomfortable seating, so you revise your explanation to include design as well as temperature.",
      "connecting findings that do not initially agree",
    ],
    [
      "Project scope · decide what to leave out",
      "You cannot measure every courtyard this term. You choose two, explain why they are useful comparisons, and state what your project cannot conclude.",
      "narrowing a broad project into something testable",
    ],
  ],
};

export const scenarioKeys = Object.keys(scenes) as (keyof typeof scenes)[];
export const tuesdayChoices: [string, string, string] = [
  "Interested — I'd like to try it",
  "Unsure — I'd need to try it first",
  "Not interested — I'd rather do other work",
];

export function isTuesdayMoments(value: unknown): value is TuesdayMoment[] {
  if (!Array.isArray(value) || value.length !== 3) return false;
  return value.every((moment) => {
    if (!moment || typeof moment !== "object") return false;
    const text = (key: string, max: number) =>
      typeof moment[key] === "string" &&
      moment[key].trim().length > 0 &&
      moment[key].length <= max;
    return (
      text("time", 20) &&
      text("place", 90) &&
      text("text", 420) &&
      text("question", 180) &&
      moment.question.endsWith("?") &&
      Array.isArray(moment.choices) &&
      moment.choices.length === 3 &&
      moment.choices.every(
        (choice: unknown) =>
          typeof choice === "string" &&
          choice.trim().length > 0 &&
          choice.length <= 100,
      ) &&
      new Set(moment.choices).size === 3
    );
  });
}

export function getTuesdayScenarioKey(program?: {
  id: string;
  family?: string;
  name?: string;
}) {
  return program?.id === "economics" ||
    program?.name?.toLowerCase() === "economics"
    ? "economics"
    : (scenarioKeys.find(
        (key) => key !== "economics" && key === program?.family,
      ) ?? "Interdisciplinary & Individualized");
}

export function getTuesdayMoments(program?: {
  id: string;
  family?: string;
  name?: string;
}): TuesdayMoment[] {
  const key = getTuesdayScenarioKey(program);
  const approved = (approvedScenarios as Record<string, unknown>)[key];
  if (isTuesdayMoments(approved)) return approved;
  return getBundledTuesdayMoments(key);
}

/** Stable editorial anchors; generation must never recursively use previous AI drafts. */
export function getBundledTuesdayMoments(
  key: (typeof scenarioKeys)[number],
): TuesdayMoment[] {
  return scenes[key].map(([place, text, task], index) => ({
    time: ["10:00 AM", "2:30 PM", "5:00 PM"][index],
    place,
    text,
    question: `How interested would you be in ${task}?`,
    choices: [...tuesdayChoices],
  }));
}
