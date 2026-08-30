import {
  ChallengeDefinition,
  DimensionSignal,
  QuestionDefinition,
} from "./types";

// Prototype heuristics: these mappings are transparent starting hypotheses, not psychometrics.
// Product analytics and student feedback should be used to validate/revise them over time.
export const questionDefinitions: QuestionDefinition[] = [
  {
    id: "group_stuck",
    prompt: "A group is stuck. What do you naturally do?",
    maxSelections: 1,
    options: [
      {
        id: "cause",
        label: "Find the cause",
        signals: { analyze: 1, investigate: 0.8, debugging: 0.5 },
      },
      {
        id: "plan",
        label: "Make a plan",
        signals: { organize: 1, strategize: 0.8, structured: 0.5 },
      },
      {
        id: "alternatives",
        label: "Generate alternatives",
        signals: { create: 1, synthesize: 0.6, ambiguity: 0.5 },
      },
      {
        id: "explain",
        label: "Explain the problem",
        signals: { explain: 1, teach: 0.7, discuss: 0.5 },
      },
      {
        id: "prototype",
        label: "Start building",
        signals: { build: 1, make: 0.9, handsOn: 0.7 },
      },
    ],
  },
  {
    id: "ideal_project",
    prompt: "Which project sounds most satisfying?",
    maxSelections: 1,
    options: [
      {
        id: "prototype",
        label: "Make a working prototype",
        signals: { build: 1, make: 1, iteration: 0.5 },
      },
      {
        id: "question",
        label: "Follow an unanswered question",
        signals: { investigate: 1, research: 1, deepFocus: 0.6 },
      },
      {
        id: "guide",
        label: "Help someone understand",
        signals: { explain: 1, teach: 1, serve: 0.4 },
      },
      {
        id: "experience",
        label: "Create an experience",
        signals: { perform: 0.7, create: 1, design: 0.7 },
      },
      {
        id: "campaign",
        label: "Rally people around an idea",
        signals: { organize: 0.7, persuade: 1, publicFacing: 0.7 },
      },
    ],
  },
  {
    id: "preferred_mess",
    prompt: "Which kind of mess would you rather untangle?",
    maxSelections: 1,
    options: [
      {
        id: "evidence",
        label: "Conflicting evidence",
        signals: { analyze: 1, research: 0.8, ambiguity: 0.6 },
      },
      {
        id: "technology",
        label: "Broken technology",
        signals: { debugging: 1, build: 0.8, precision: 0.5 },
      },
      {
        id: "organization",
        label: "An inefficient organization",
        signals: { organize: 1, strategize: 0.8, coordination: 0.6 },
      },
      {
        id: "story",
        label: "A confusing story",
        signals: { synthesize: 1, explain: 0.7, create: 0.5 },
      },
      {
        id: "physical",
        label: "A physical process",
        signals: { handsOn: 1, make: 0.8, investigate: 0.6 },
      },
    ],
  },
  {
    id: "proud_make",
    prompt: "What have you made that you are proud of?",
    maxSelections: 2,
    options: [
      {
        id: "code-object",
        label: "Code or a physical object",
        signals: { build: 1, make: 0.9, precision: 0.5 },
      },
      {
        id: "writing",
        label: "Writing or research",
        signals: { synthesize: 0.8, explain: 0.7, research: 0.7 },
      },
      {
        id: "art",
        label: "Art or a performance",
        signals: { create: 1, perform: 0.8, iteration: 0.5 },
      },
      {
        id: "event",
        label: "An event or organization",
        signals: { organize: 1, coordination: 0.9, publicFacing: 0.5 },
      },
      {
        id: "community",
        label: "A community project",
        signals: { serve: 1, collaborative: 0.7, handsOn: 0.4 },
      },
    ],
  },
  {
    id: "tolerable_friction",
    prompt: "Which frustration can you tolerate best?",
    maxSelections: 1,
    options: [
      {
        id: "model",
        label: "Reworking a model",
        signals: { iteration: 1, analyze: 0.7, precision: 0.5 },
      },
      {
        id: "revision",
        label: "Revising until it lands",
        signals: { iteration: 1, create: 0.6, explain: 0.5 },
      },
      {
        id: "debug",
        label: "Debugging one stubborn issue",
        signals: { debugging: 1, deepFocus: 0.8, precision: 0.6 },
      },
      {
        id: "people",
        label: "Coordinating many people",
        signals: { coordination: 1, organize: 0.8, collaborative: 0.6 },
      },
      {
        id: "unknown",
        label: "Working without a clear answer",
        signals: { ambiguity: 1, investigate: 0.7, create: 0.5 },
      },
    ],
  },
  {
    id: "work_setting",
    prompt: "Where do you do your best work?",
    maxSelections: 2,
    options: [
      {
        id: "solo",
        label: "Quietly, on my own",
        signals: { independent: 1, deepFocus: 0.9 },
      },
      {
        id: "small-team",
        label: "With a small team",
        signals: { collaborative: 1, coordination: 0.5 },
      },
      {
        id: "people",
        label: "In front of people",
        signals: { publicFacing: 1, perform: 0.6, persuade: 0.5 },
      },
      {
        id: "workshop",
        label: "In a lab, studio, or field",
        signals: { handsOn: 1, make: 0.7, investigate: 0.5 },
      },
      {
        id: "clear-plan",
        label: "With a clear plan",
        signals: { structured: 1, organize: 0.6 },
      },
    ],
  },
  {
    id: "learning_entry",
    prompt: "How do you like to meet a new idea?",
    maxSelections: 1,
    weight: 0.85,
    options: [
      {
        id: "see-example",
        label: "See a real example",
        signals: { handsOn: 0.8, investigate: 0.7, make: 0.4 },
      },
      {
        id: "read-think",
        label: "Read and think quietly",
        signals: { independent: 0.8, deepFocus: 1, research: 0.5 },
      },
      {
        id: "talk-it-out",
        label: "Talk it through",
        signals: { discuss: 1, collaborative: 0.8, explain: 0.5 },
      },
      {
        id: "try-it",
        label: "Try it and adjust",
        signals: { make: 0.9, iteration: 1, build: 0.5 },
      },
      {
        id: "teach-it",
        label: "Explain it to someone",
        signals: { teach: 1, explain: 0.9, serve: 0.4 },
      },
    ],
  },
  {
    id: "curiosity_hook",
    prompt: "Which question could keep you curious the longest?",
    maxSelections: 1,
    weight: 0.85,
    options: [
      {
        id: "living-world",
        label: "How does the living world work?",
        signals: { investigate: 1, research: 0.8, precision: 0.4 },
      },
      {
        id: "people",
        label: "Why do people behave this way?",
        signals: { investigate: 0.8, synthesize: 0.7, serve: 0.5 },
      },
      {
        id: "machines",
        label: "How could this machine work better?",
        signals: { build: 1, debugging: 0.7, design: 0.6 },
      },
      {
        id: "systems",
        label: "Why does this system reward that?",
        signals: { analyze: 0.8, strategize: 1, persuade: 0.4 },
      },
      {
        id: "meaning",
        label: "What does this story or moment mean?",
        signals: { synthesize: 1, research: 0.6, ambiguity: 0.7 },
      },
    ],
  },
  {
    id: "class_energy",
    prompt: "Which class moment gives you the most energy?",
    maxSelections: 1,
    weight: 0.85,
    options: [
      {
        id: "debate",
        label: "A lively debate",
        signals: { discuss: 1, persuade: 0.8, publicFacing: 0.5 },
      },
      {
        id: "solve",
        label: "Cracking a hard problem",
        signals: { analyze: 1, precision: 0.7, deepFocus: 0.6 },
      },
      {
        id: "lab",
        label: "A lab or field investigation",
        signals: { handsOn: 1, investigate: 0.9, research: 0.5 },
      },
      {
        id: "studio",
        label: "A studio critique or rehearsal",
        signals: { create: 1, perform: 0.6, iteration: 0.7 },
      },
      {
        id: "case",
        label: "Working through a real case",
        signals: { strategize: 0.8, synthesize: 0.8, collaborative: 0.5 },
      },
    ],
  },
  {
    id: "desired_impact",
    prompt: "What would make schoolwork feel meaningful?",
    maxSelections: 1,
    weight: 0.85,
    options: [
      {
        id: "understand",
        label: "Understanding something no one has explained",
        signals: { investigate: 1, research: 0.8, deepFocus: 0.5 },
      },
      {
        id: "useful",
        label: "Making something people can use",
        signals: { build: 0.9, design: 0.8, serve: 0.6 },
      },
      {
        id: "help",
        label: "Helping a person directly",
        signals: { serve: 1, teach: 0.6, collaborative: 0.5 },
      },
      {
        id: "change",
        label: "Changing a rule or system",
        signals: { persuade: 0.9, organize: 0.7, strategize: 0.8 },
      },
      {
        id: "move",
        label: "Making people feel or see differently",
        signals: { create: 0.9, perform: 0.5, explain: 0.7 },
      },
    ],
  },
  {
    id: "assignment_shape",
    prompt: "Which assignment would you choose?",
    maxSelections: 1,
    weight: 0.85,
    options: [
      {
        id: "deep-dive",
        label: "One deep research question",
        signals: { research: 1, deepFocus: 0.9, synthesize: 0.5 },
      },
      {
        id: "build-test",
        label: "Build and test a solution",
        signals: { build: 1, make: 0.8, iteration: 0.8 },
      },
      {
        id: "present",
        label: "Present a convincing case",
        signals: { persuade: 1, explain: 0.7, publicFacing: 0.7 },
      },
      {
        id: "creative",
        label: "Create an original piece",
        signals: { create: 1, design: 0.7, ambiguity: 0.5 },
      },
      {
        id: "team-plan",
        label: "Lead a team toward a result",
        signals: { organize: 1, coordination: 0.8, collaborative: 0.6 },
      },
    ],
  },
];

export const subjectMappings: Record<string, DimensionSignal> = {
  Math: { analyze: 1, precision: 0.7, deepFocus: 0.5 },
  "Computer Science": { build: 0.9, analyze: 0.8, debugging: 0.8 },
  Biology: { investigate: 0.8, research: 0.7, synthesize: 0.4 },
  Chemistry: { investigate: 0.8, precision: 0.8, handsOn: 0.5 },
  Physics: { analyze: 1, investigate: 0.7, precision: 0.6 },
  "English / Literature": { synthesize: 1, explain: 0.8, ambiguity: 0.6 },
  History: { synthesize: 0.9, research: 0.8, explain: 0.6 },
  "Government / Politics": { persuade: 0.8, discuss: 0.8, strategize: 0.6 },
  Psychology: { investigate: 0.7, synthesize: 0.6, serve: 0.5 },
  Economics: { analyze: 0.8, strategize: 0.8, synthesize: 0.5 },
  Business: { organize: 0.8, strategize: 0.8, persuade: 0.5 },
  "Art / Design": { create: 1, design: 1, iteration: 0.6 },
  "Music / Performing Arts": { create: 0.8, perform: 1, repetition: 0.7 },
  "Foreign Languages": { explain: 0.7, synthesize: 0.6, ambiguity: 0.5 },
  Other: { investigate: 0.3, create: 0.3 },
};

export const challengeDefinitions: ChallengeDefinition[] = [
  {
    id: "price-move",
    label: "Explored how price changes behavior",
    outcomes: [
      {
        id: "small-change",
        label: "Tested a small change",
        signals: { analyze: 0.7, precision: 0.6 },
      },
      {
        id: "large-change",
        label: "Tested an edge case",
        signals: { investigate: 0.8, ambiguity: 0.5 },
      },
      {
        id: "explored-range",
        label: "Explored several outcomes",
        signals: { investigate: 1, strategize: 0.7, iteration: 0.6 },
      },
    ],
  },
  {
    id: "double-ping",
    label: "Diagnosed a duplicated confirmation",
    outcomes: [
      {
        id: "interface",
        label: "Checked the visible interface",
        signals: { design: 0.7, investigate: 0.5 },
      },
      {
        id: "workflow",
        label: "Checked the workflow",
        signals: { analyze: 0.8, organize: 0.6 },
      },
      {
        id: "system",
        label: "Checked the underlying system",
        signals: { debugging: 1, build: 0.7, deepFocus: 0.5 },
      },
    ],
  },
  {
    id: "five-seconds",
    label: "Worked with brief, incomplete information",
    outcomes: [
      {
        id: "details",
        label: "Held onto exact details",
        signals: { precision: 1, deepFocus: 0.6 },
      },
      {
        id: "pattern",
        label: "Held onto the pattern",
        signals: { synthesize: 1, analyze: 0.6 },
      },
      {
        id: "story",
        label: "Built a story from the pieces",
        signals: { create: 0.8, synthesize: 0.8, ambiguity: 0.5 },
      },
    ],
  },
  {
    id: "first-fix",
    label: "Chose a first intervention",
    outcomes: [
      {
        id: "student",
        label: "Changed the student experience",
        signals: { serve: 0.9, design: 0.7 },
      },
      {
        id: "message",
        label: "Changed the explanation",
        signals: { explain: 0.9, persuade: 0.6 },
      },
      {
        id: "process",
        label: "Changed the process",
        signals: { organize: 0.9, strategize: 0.8 },
      },
      {
        id: "evidence",
        label: "Asked for more evidence",
        signals: { investigate: 1, research: 0.8 },
      },
    ],
  },
  {
    id: "curiosity-map",
    label: "Followed a curiosity path",
    weight: 1.1,
    outcomes: [
      {
        id: "living-world",
        label: "Followed the living-world clue first",
        signals: { investigate: 1, research: 0.8, handsOn: 0.4 },
      },
      {
        id: "people",
        label: "Followed the people clue first",
        signals: { investigate: 0.7, synthesize: 0.8, serve: 0.5 },
      },
      {
        id: "machines",
        label: "Followed the machine clue first",
        signals: { build: 1, debugging: 0.8, design: 0.5 },
      },
      {
        id: "systems",
        label: "Followed the systems clue first",
        signals: { analyze: 0.8, strategize: 1, ambiguity: 0.5 },
      },
      {
        id: "stories",
        label: "Followed the story clue first",
        signals: { synthesize: 1, research: 0.6, explain: 0.5 },
      },
    ],
  },
  {
    id: "curiosity-question",
    label: "Asked a curiosity question",
    weight: 1.1,
    outcomes: [
      {
        id: "cause",
        label: "Asked what caused it",
        signals: { investigate: 1, analyze: 0.8, research: 0.4 },
      },
      {
        id: "next",
        label: "Asked what happens next",
        signals: { strategize: 0.8, synthesize: 0.7, ambiguity: 0.5 },
      },
      {
        id: "affected",
        label: "Asked who is affected",
        signals: { serve: 1, synthesize: 0.7, investigate: 0.4 },
      },
      {
        id: "test",
        label: "Asked how to test it",
        signals: { research: 1, precision: 0.8, handsOn: 0.5 },
      },
      {
        id: "change",
        label: "Asked how to change it",
        signals: { build: 0.8, create: 0.7, iteration: 0.7 },
      },
    ],
  },
  {
    id: "classroom-snapshots",
    label: "Entered a classroom scene",
    weight: 1.1,
    outcomes: [
      {
        id: "debate",
        label: "Entered the debate room",
        signals: { discuss: 1, persuade: 0.8, publicFacing: 0.6 },
      },
      {
        id: "problem",
        label: "Entered the problem-solving room",
        signals: { analyze: 1, precision: 0.7, deepFocus: 0.6 },
      },
      {
        id: "lab",
        label: "Entered the lab and field room",
        signals: { investigate: 0.9, handsOn: 1, research: 0.6 },
      },
      {
        id: "studio",
        label: "Entered the studio room",
        signals: { create: 1, design: 0.8, iteration: 0.6 },
      },
      {
        id: "case",
        label: "Entered the real-case room",
        signals: { strategize: 0.8, synthesize: 0.7, collaborative: 0.6 },
      },
    ],
  },
];
