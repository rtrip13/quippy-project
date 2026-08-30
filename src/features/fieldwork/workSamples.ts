import type { Family } from "../../data/schools/types";
import type { DimensionSignal } from "../../domain/types";

type WorkSample = {
  title: string;
  prompt: string;
  steps: readonly string[];
  deliverable: string;
  signals: DimensionSignal;
};

/** Original, ungraded exercises. These are not university assignments or aptitude tests. */
export const workSamples: Record<Family, WorkSample> = {
  "Computing & Data": {
    title: "Design a tiny study planner",
    prompt:
      "A student has three assignments and two free evenings. How should a planner decide what to show first? No coding experience needed.",
    steps: [
      "List the inputs: deadlines, estimated effort, and available time.",
      "Write five plain-English rules or pseudocode that orders the assignments.",
      "Test your rules with a missed deadline and an assignment that takes twice as long. Revise one rule.",
    ],
    deliverable: "Your rules plus one test case that broke the first version.",
    signals: { analyze: 0.8, build: 0.7, debugging: 0.7 },
  },
  "Engineering & Built Environment": {
    title: "Prototype a paper bridge",
    prompt:
      "Use one sheet of paper to span a gap between two books. Explore how shape changes a structure.",
    steps: [
      "Set a small gap on a stable table. Sketch two possible paper shapes.",
      "Build the first shape and gently test it with a few coins. Keep objects away from table edges.",
      "Fold a second shape. Keep the gap and load the same, then compare and revise.",
    ],
    deliverable:
      "Two sketches and a sentence about which design worked better and why.",
    signals: { build: 0.8, design: 0.7, iteration: 0.7 },
  },
  "Natural & Physical Sciences": {
    title: "Design a test that could prove you wrong",
    prompt:
      "Suppose a plant near a window grows faster than one farther away. Is light the explanation? You only need paper for this exercise.",
    steps: [
      "Write your hypothesis and two alternative explanations.",
      "Design a comparison: what would you change, measure, and keep the same?",
      "Invent one possible result that would contradict your hypothesis. Explain what you would test next.",
    ],
    deliverable:
      "A short experiment plan with a prediction and a disconfirming result.",
    signals: { investigate: 0.8, analyze: 0.6, precision: 0.7 },
  },
  "Health & Human Services": {
    title: "Make a service easier to navigate",
    prompt:
      "A fictional student is trying to find the right campus support office and feels overwhelmed. Practice service design—not diagnosis or medical advice.",
    steps: [
      "Write three respectful questions to understand what help the student wants.",
      "Sketch a simple welcome and referral process without collecting private information.",
      "Revise it for someone who has limited time or cannot attend in person.",
    ],
    deliverable: "A short support script and one accessibility improvement.",
    signals: { serve: 0.8, explain: 0.6, organize: 0.5 },
  },
  "Business & Economics": {
    title: "Price a fictional campus pop-up",
    prompt:
      "A fictional club sells notebooks. At $4 it expects 40 buyers; at $6 it expects 25. Each notebook costs $2 and the table fee is $30. These numbers are invented.",
    steps: [
      "Calculate revenue and profit under each price, including the table fee.",
      "Choose a price and explain the tradeoff between profit and access.",
      "What if demand is 30% lower? Recalculate and identify the assumption you would test first.",
    ],
    deliverable:
      "Two calculations, a decision, and the assumption most likely to change it.",
    signals: { analyze: 0.8, strategize: 0.8, ambiguity: 0.4 },
  },
  "Social & Behavioral Sciences": {
    title: "Question a claim about student behavior",
    prompt:
      "A fictional survey says students who join clubs feel more connected. Does joining a club cause that feeling?",
    steps: [
      "Write two other explanations for the relationship.",
      "Draft three neutral interview questions about belonging. Do not collect anyone's personal information.",
      "Outline what evidence would distinguish your explanations and what your study still could not establish.",
    ],
    deliverable: "An interview outline and one limitation you would disclose.",
    signals: { investigate: 0.8, synthesize: 0.6, ambiguity: 0.7 },
  },
  "Humanities & Languages": {
    title: "Make two readings of the same sentence",
    prompt:
      "“The city called it progress; Mara kept the old key.” This original sentence is your entire text. Explore how language changes meaning.",
    steps: [
      "Write two different interpretations, each anchored to a particular word or contrast.",
      "Make a 100-word case for the interpretation you find more convincing.",
      "Write the strongest objection to your reading and revise one sentence of your argument.",
    ],
    deliverable: "A short close reading with an objection—not a right answer.",
    signals: { synthesize: 0.8, explain: 0.7, ambiguity: 0.6 },
  },
  "Arts, Design & Performance": {
    title: "Make the same idea feel two ways",
    prompt:
      "Communicate “a new beginning” using a sketch, eight lines of writing, or a short movement or rhythm sequence. Pick materials you already have.",
    steps: [
      "Create a rough first version in five minutes.",
      "Make a second version that feels uncertain instead of hopeful, or hopeful instead of uncertain.",
      "Compare the two. Revise one deliberate choice and explain the effect.",
    ],
    deliverable: "Two rough versions and one note about your revision.",
    signals: { create: 0.8, design: 0.7, iteration: 0.7 },
  },
  "Communication & Media": {
    title: "Tell one story for two audiences",
    prompt:
      "A fictional campus library is extending its hours for one week. Write about it without inventing quotes or presenting it as real news.",
    steps: [
      "List what you would need to verify before publishing: dates, access, staffing, and who is affected.",
      "Write a 60-word announcement for students and a 60-word briefing for staff.",
      "Cut each to 40 words while keeping the essential facts. Compare what you chose to keep.",
    ],
    deliverable:
      "Two audience-specific drafts and your verification checklist.",
    signals: { explain: 0.8, create: 0.6, precision: 0.6 },
  },
  "Education, Public Service & Policy": {
    title: "Explain a hard idea simply",
    prompt:
      "Choose something you know well: a game rule, a math idea, or a historical event. Design a five-minute explanation for a beginner.",
    steps: [
      "Write what the learner should be able to do afterward.",
      "Create an example, an explanation, and one question that checks understanding.",
      "Imagine the learner misunderstands. Try a different example instead of repeating the same words.",
    ],
    deliverable: "A miniature lesson and a backup explanation.",
    signals: { explain: 0.8, teach: 0.7, serve: 0.5 },
  },
  "Interdisciplinary & Individualized": {
    title: "Connect two ways of seeing a problem",
    prompt:
      "Choose an everyday campus problem, such as a crowded dining hall. Look at it through two different fields.",
    steps: [
      "Write what each field would ask and what evidence each would use.",
      "Sketch a small solution combining the two approaches.",
      "Name a conflict between those approaches and a test that would help resolve it.",
    ],
    deliverable:
      "A one-page proposal that connects two methods without hiding their tradeoffs.",
    signals: { synthesize: 0.8, strategize: 0.6, ambiguity: 0.7 },
  },
};

export function isWorkSampleFamily(value: unknown): value is Family {
  return typeof value === "string" && Object.hasOwn(workSamples, value);
}
