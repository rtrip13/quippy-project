import {
  DimensionSignal,
  EvidenceDimension,
  QuestionDefinition,
} from "./types";

/**
 * Subject follow-ups distinguish how a student likes to engage with a subject.
 * They are transparent product hypotheses, not personality or aptitude measures.
 */
export type SubjectBranchDefinition = QuestionDefinition & {
  subject: string;
};

export const subjectBranchDefinitions: Record<string, SubjectBranchDefinition> =
  {
    Math: {
      id: "subject_math",
      subject: "Math",
      prompt: "What part of math pulls you in?",
      maxSelections: 1,
      options: [
        {
          id: "prove",
          label: "Finding why a rule works",
          signals: { analyze: 1, precision: 0.7, deepFocus: 0.4 },
        },
        {
          id: "model",
          label: "Modeling something real",
          signals: { synthesize: 0.8, investigate: 0.7, ambiguity: 0.4 },
        },
        {
          id: "solve",
          label: "Cracking a hard problem",
          signals: { strategize: 0.8, iteration: 0.7, analyze: 0.6 },
        },
        {
          id: "explain",
          label: "Making it click for someone",
          signals: { explain: 1, teach: 0.8, collaborative: 0.4 },
        },
      ],
    },
    "Computer Science": {
      id: "subject_computer_science",
      subject: "Computer Science",
      prompt: "What makes coding satisfying?",
      maxSelections: 1,
      options: [
        {
          id: "build",
          label: "Making an idea work",
          signals: { build: 1, make: 0.8, iteration: 0.5 },
        },
        {
          id: "debug",
          label: "Tracing a stubborn bug",
          signals: { debugging: 1, investigate: 0.8, deepFocus: 0.5 },
        },
        {
          id: "design",
          label: "Shaping how people use it",
          signals: { design: 1, create: 0.7, serve: 0.4 },
        },
        {
          id: "systems",
          label: "Understanding the system underneath",
          signals: { analyze: 1, precision: 0.6, synthesize: 0.5 },
        },
      ],
    },
    Biology: {
      id: "subject_biology",
      subject: "Biology",
      prompt: "What keeps you curious in biology?",
      maxSelections: 1,
      options: [
        {
          id: "mechanism",
          label: "How living systems work",
          signals: { investigate: 1, analyze: 0.7, synthesize: 0.5 },
        },
        {
          id: "field",
          label: "Observing life in the field",
          signals: { research: 0.8, handsOn: 1, ambiguity: 0.4 },
        },
        {
          id: "experiment",
          label: "Testing an explanation",
          signals: { research: 1, precision: 0.7, iteration: 0.5 },
        },
        {
          id: "people",
          label: "Using it to help people",
          signals: { serve: 1, explain: 0.5, collaborative: 0.4 },
        },
      ],
    },
    Chemistry: {
      id: "subject_chemistry",
      subject: "Chemistry",
      prompt: "What feels most rewarding in chemistry?",
      maxSelections: 1,
      options: [
        {
          id: "predict",
          label: "Predicting what will happen",
          signals: { analyze: 1, precision: 0.7, strategize: 0.4 },
        },
        {
          id: "lab",
          label: "Running the experiment",
          signals: { handsOn: 1, investigate: 0.8, iteration: 0.5 },
        },
        {
          id: "molecules",
          label: "Seeing patterns at a tiny scale",
          signals: { synthesize: 0.8, deepFocus: 0.7, analyze: 0.5 },
        },
        {
          id: "make",
          label: "Creating a useful material",
          signals: { make: 1, build: 0.7, design: 0.5 },
        },
      ],
    },
    Physics: {
      id: "subject_physics",
      subject: "Physics",
      prompt: "Which side of physics hooks you?",
      maxSelections: 1,
      options: [
        {
          id: "why",
          label: "Explaining why things move",
          signals: { analyze: 1, explain: 0.6, precision: 0.5 },
        },
        {
          id: "unknown",
          label: "Chasing an unanswered question",
          signals: { investigate: 1, research: 0.8, ambiguity: 0.6 },
        },
        {
          id: "apparatus",
          label: "Building and testing a setup",
          signals: { build: 0.9, handsOn: 1, iteration: 0.5 },
        },
        {
          id: "model",
          label: "Turning reality into a model",
          signals: { synthesize: 1, analyze: 0.7, deepFocus: 0.4 },
        },
      ],
    },
    "English / Literature": {
      id: "subject_english_literature",
      subject: "English / Literature",
      prompt: "What draws you into a text?",
      maxSelections: 1,
      options: [
        {
          id: "interpret",
          label: "Finding what is beneath the surface",
          signals: { synthesize: 1, ambiguity: 0.8, analyze: 0.5 },
        },
        {
          id: "write",
          label: "Shaping language of my own",
          signals: { create: 1, iteration: 0.7, deepFocus: 0.4 },
        },
        {
          id: "discuss",
          label: "Hearing competing readings",
          signals: { discuss: 1, collaborative: 0.7, explain: 0.5 },
        },
        {
          id: "persuade",
          label: "Building a convincing case",
          signals: { persuade: 1, explain: 0.8, strategize: 0.4 },
        },
      ],
    },
    History: {
      id: "subject_history",
      subject: "History",
      prompt: "What makes history come alive?",
      maxSelections: 1,
      options: [
        {
          id: "sources",
          label: "Piecing together original sources",
          signals: { research: 1, investigate: 0.8, precision: 0.4 },
        },
        {
          id: "causes",
          label: "Tracing why events unfolded",
          signals: { analyze: 1, synthesize: 0.8, strategize: 0.4 },
        },
        {
          id: "stories",
          label: "Telling overlooked stories",
          signals: { explain: 0.8, create: 0.7, serve: 0.5 },
        },
        {
          id: "debate",
          label: "Debating what the evidence means",
          signals: { discuss: 1, persuade: 0.7, ambiguity: 0.6 },
        },
      ],
    },
    "Government / Politics": {
      id: "subject_government_politics",
      subject: "Government / Politics",
      prompt: "What part of public life interests you?",
      maxSelections: 1,
      options: [
        {
          id: "systems",
          label: "How institutions shape outcomes",
          signals: { analyze: 1, synthesize: 0.7, strategize: 0.5 },
        },
        {
          id: "debate",
          label: "Arguing an idea in good faith",
          signals: { discuss: 1, persuade: 0.9, publicFacing: 0.5 },
        },
        {
          id: "organize",
          label: "Getting people behind a change",
          signals: { organize: 1, coordination: 0.8, collaborative: 0.5 },
        },
        {
          id: "evidence",
          label: "Testing whether a policy works",
          signals: { research: 1, investigate: 0.8, precision: 0.4 },
        },
      ],
    },
    Psychology: {
      id: "subject_psychology",
      subject: "Psychology",
      prompt: "What makes behavior interesting to you?",
      maxSelections: 1,
      options: [
        {
          id: "patterns",
          label: "Finding patterns in how people act",
          signals: { investigate: 1, analyze: 0.7, synthesize: 0.5 },
        },
        {
          id: "listen",
          label: "Understanding one person deeply",
          signals: { serve: 0.8, deepFocus: 0.6, ambiguity: 0.5 },
        },
        {
          id: "experiment",
          label: "Designing a careful study",
          signals: { research: 1, design: 0.7, precision: 0.6 },
        },
        {
          id: "communicate",
          label: "Making insights useful to others",
          signals: { explain: 1, teach: 0.6, publicFacing: 0.4 },
        },
      ],
    },
    Economics: {
      id: "subject_economics",
      subject: "Economics",
      prompt: "Which economic question grabs you?",
      maxSelections: 1,
      options: [
        {
          id: "choices",
          label: "Why people make certain choices",
          signals: { investigate: 0.8, synthesize: 0.7, ambiguity: 0.5 },
        },
        {
          id: "data",
          label: "Finding a pattern in the numbers",
          signals: { analyze: 1, research: 0.7, precision: 0.5 },
        },
        {
          id: "rules",
          label: "How changing a rule shifts outcomes",
          signals: { strategize: 1, analyze: 0.6, synthesize: 0.5 },
        },
        {
          id: "tradeoffs",
          label: "Debating a difficult tradeoff",
          signals: { discuss: 0.9, persuade: 0.7, ambiguity: 0.6 },
        },
      ],
    },
    Business: {
      id: "subject_business",
      subject: "Business",
      prompt: "Which part of making something succeed appeals to you?",
      maxSelections: 1,
      options: [
        {
          id: "idea",
          label: "Spotting an unmet need",
          signals: { investigate: 0.7, create: 0.8, strategize: 0.6 },
        },
        {
          id: "plan",
          label: "Turning chaos into a plan",
          signals: { organize: 1, structured: 0.8, coordination: 0.5 },
        },
        {
          id: "message",
          label: "Getting people excited about it",
          signals: { persuade: 1, publicFacing: 0.7, create: 0.4 },
        },
        {
          id: "improve",
          label: "Improving how the operation runs",
          signals: { analyze: 0.8, iteration: 0.7, strategize: 0.7 },
        },
      ],
    },
    "Art / Design": {
      id: "subject_art_design",
      subject: "Art / Design",
      prompt: "What part of creating keeps you going?",
      maxSelections: 1,
      options: [
        {
          id: "express",
          label: "Expressing something hard to say",
          signals: { create: 1, ambiguity: 0.7, independent: 0.4 },
        },
        {
          id: "solve",
          label: "Solving a problem visually",
          signals: { design: 1, strategize: 0.6, serve: 0.4 },
        },
        {
          id: "craft",
          label: "Refining the smallest details",
          signals: { iteration: 1, precision: 0.8, deepFocus: 0.5 },
        },
        {
          id: "reaction",
          label: "Creating a reaction in others",
          signals: { publicFacing: 0.8, persuade: 0.6, create: 0.7 },
        },
      ],
    },
    "Music / Performing Arts": {
      id: "subject_music_performing_arts",
      subject: "Music / Performing Arts",
      prompt: "What brings you back to performing?",
      maxSelections: 1,
      options: [
        {
          id: "practice",
          label: "Getting better through repetition",
          signals: { repetition: 1, iteration: 0.8, precision: 0.5 },
        },
        {
          id: "ensemble",
          label: "Locking in with a group",
          signals: { collaborative: 1, coordination: 0.8, deepFocus: 0.4 },
        },
        {
          id: "interpret",
          label: "Making the work feel like mine",
          signals: { create: 0.9, ambiguity: 0.6, synthesize: 0.5 },
        },
        {
          id: "audience",
          label: "Sharing a live moment",
          signals: { perform: 1, publicFacing: 0.9, explain: 0.3 },
        },
      ],
    },
    "Foreign Languages": {
      id: "subject_foreign_languages",
      subject: "Foreign Languages",
      prompt: "What makes another language worth learning?",
      maxSelections: 1,
      options: [
        {
          id: "connect",
          label: "Connecting with more people",
          signals: { collaborative: 0.8, serve: 0.6, discuss: 0.7 },
        },
        {
          id: "culture",
          label: "Seeing how another culture thinks",
          signals: { synthesize: 0.9, investigate: 0.7, ambiguity: 0.5 },
        },
        {
          id: "fluency",
          label: "Working toward real fluency",
          signals: { repetition: 0.9, precision: 0.7, deepFocus: 0.5 },
        },
        {
          id: "translate",
          label: "Finding the exact way to say it",
          signals: { explain: 1, precision: 0.7, create: 0.4 },
        },
      ],
    },
    Other: {
      id: "subject_other",
      subject: "Other",
      prompt: "What keeps pulling you back to it?",
      maxSelections: 1,
      options: [
        {
          id: "understand",
          label: "Understanding how it works",
          signals: { investigate: 1, analyze: 0.7, deepFocus: 0.4 },
        },
        {
          id: "make",
          label: "Making something of my own",
          signals: { create: 0.9, make: 0.9, iteration: 0.5 },
        },
        {
          id: "share",
          label: "Sharing it with other people",
          signals: { explain: 0.8, collaborative: 0.7, publicFacing: 0.4 },
        },
        {
          id: "challenge",
          label: "Taking on a harder challenge",
          signals: { strategize: 0.8, ambiguity: 0.6, precision: 0.5 },
        },
      ],
    },
  };

const questionCoverage = (
  question: SubjectBranchDefinition,
  observed: DimensionSignal,
) => {
  const dimensions = new Set<EvidenceDimension>();
  question.options.forEach((option) => {
    (Object.keys(option.signals) as EvidenceDimension[]).forEach((dimension) =>
      dimensions.add(dimension),
    );
  });
  if (!dimensions.size) return 0;
  return (
    [...dimensions].reduce(
      (total, dimension) =>
        total + (1 - Math.min(1, Math.max(0, observed[dimension] ?? 0))),
      0,
    ) / dimensions.size
  );
};

/**
 * Selects at most three follow-ups. Enjoyment order remains the main priority;
 * equally near choices favor questions that cover dimensions with less evidence.
 */
export function selectSubjectBranchQuestions(
  enjoyedSubjects: string[],
  observedSignals: DimensionSignal = {},
  limit = 3,
): SubjectBranchDefinition[] {
  const seen = new Set<string>();
  return enjoyedSubjects
    .map((subject, index) => ({
      question: subjectBranchDefinitions[subject],
      index,
    }))
    .filter(
      (item): item is { question: SubjectBranchDefinition; index: number } => {
        if (!item.question || seen.has(item.question.subject)) return false;
        seen.add(item.question.subject);
        return true;
      },
    )
    .sort((a, b) => {
      // Every two adjacent choices form a priority tier, with coverage breaking ties.
      const tierDifference = Math.floor(a.index / 2) - Math.floor(b.index / 2);
      if (tierDifference) return tierDifference;
      const coverageDifference =
        questionCoverage(b.question, observedSignals) -
        questionCoverage(a.question, observedSignals);
      return coverageDifference || a.index - b.index;
    })
    .slice(0, Math.max(0, Math.min(3, limit)))
    .map((item) => item.question);
}
