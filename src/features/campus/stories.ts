import type { ActivityMode, DimensionSignal, WorkMode } from "../../domain";

export type CompositeStudentStory = {
  id: string;
  title: string;
  startingPoint: string;
  experiment: string;
  turningPoint: string;
  takeaway: string;
  signals: readonly (WorkMode | ActivityMode)[];
  /** Always true: these are illustrative composites, never testimonials. */
  isComposite: true;
};

export const compositeStudentStories: readonly CompositeStudentStory[] = [
  {
    id: "medicine-to-reporting",
    title: "The questions mattered more than the label",
    startingPoint: "Entered college expecting a pre-health path.",
    experiment: "Reported one health-policy story for the student paper.",
    turningPoint:
      "Interviewing people and explaining a messy system produced more energy than memorizing the system alone.",
    takeaway:
      "Public health, journalism, and policy became hypotheses to test—not an instant major switch.",
    signals: ["investigate", "explain", "synthesize", "research"],
    isComposite: true,
  },
  {
    id: "engineering-to-policy",
    title: "Still a builder, with a different material",
    startingPoint: "Was admitted for engineering because making felt concrete.",
    experiment:
      "Joined a civic-technology team working with a community partner.",
    turningPoint:
      "The hardest and most interesting work was deciding what should be built and for whom.",
    takeaway:
      "Engineering remained viable while design, public policy, and service gained evidence.",
    signals: ["build", "serve", "strategize", "design"],
    isComposite: true,
  },
  {
    id: "business-to-design",
    title: "The slide deck was not the energizing part",
    startingPoint:
      "Considered business for its broad options and team setting.",
    experiment: "Helped prototype a campus product in a design club.",
    turningPoint:
      "User interviews and repeated prototypes were more compelling than pitching the final plan.",
    takeaway:
      "Product design and human-centered research deserved direct comparison with business.",
    signals: ["create", "investigate", "design", "make"],
    isComposite: true,
  },
  {
    id: "undecided-to-ecology",
    title: "Curiosity showed up outside the classroom",
    startingPoint:
      "Had no clear major and interpreted that as having no strong interests.",
    experiment:
      "Volunteered at a campus garden and joined a field observation.",
    turningPoint: "Kept asking questions after the assigned work was finished.",
    takeaway:
      "Environmental science became a testable direction because of behavior, not a quiz label.",
    signals: ["investigate", "serve", "research", "volunteer"],
    isComposite: true,
  },
  {
    id: "computing-to-teaching",
    title: "Explaining the code changed the hypothesis",
    startingPoint:
      "Liked computing but was unsure about solitary technical work.",
    experiment: "Tutored beginners at a peer coding night.",
    turningPoint:
      "Breaking down a concept was more satisfying than finishing the code first.",
    takeaway:
      "Computing, education, and developer communication could be explored together.",
    signals: ["build", "explain", "teach", "serve"],
    isComposite: true,
  },
  {
    id: "psychology-to-research",
    title: "A favorite topic became a favorite process",
    startingPoint: "Considered psychology because people were interesting.",
    experiment:
      "Observed a lab meeting and tried coding a small set of responses.",
    turningPoint:
      "Careful measurement and competing explanations felt satisfying rather than tedious.",
    takeaway:
      "Research-heavy social science gained evidence; clinical work still needed its own experiment.",
    signals: ["analyze", "investigate", "research", "synthesize"],
    isComposite: true,
  },
  {
    id: "arts-to-community",
    title: "The audience was part of the medium",
    startingPoint: "Expected studio art to be the clearest creative path.",
    experiment: "Designed materials for a student mutual-aid campaign.",
    turningPoint:
      "Collaboration and public response made the creative constraints feel meaningful.",
    takeaway:
      "Communication design and community organizing joined studio practice as live options.",
    signals: ["create", "organize", "serve", "design"],
    isComposite: true,
  },
  {
    id: "economics-to-health",
    title: "The dataset became interesting when the stakes were visible",
    startingPoint: "Considered economics for analytical flexibility.",
    experiment:
      "Analyzed a small health-access dataset for a service organization.",
    turningPoint:
      "The human question sustained attention through the frustrating cleanup work.",
    takeaway:
      "Economics, public health, and policy could be compared through applied projects.",
    signals: ["analyze", "serve", "research", "strategize"],
    isComposite: true,
  },
  {
    id: "architecture-to-product",
    title: "Iteration mattered at every scale",
    startingPoint: "Loved buildings, drawing, and visible outcomes.",
    experiment: "Joined a fabrication sprint for a small assistive product.",
    turningPoint:
      "Rapid testing felt energizing, even when the result was not architectural.",
    takeaway:
      "Architecture, industrial design, and mechanical design became adjacent hypotheses.",
    signals: ["build", "create", "design", "make"],
    isComposite: true,
  },
  {
    id: "biology-to-environment",
    title: "The system was more interesting than the cell",
    startingPoint: "Chose biology because science classes had gone well.",
    experiment: "Helped collect observations for a watershed project.",
    turningPoint:
      "Relationships across organisms, policy, and place drove questions long after the fieldwork.",
    takeaway:
      "Ecology and environmental studies earned exploration alongside molecular biology.",
    signals: ["investigate", "synthesize", "research", "volunteer"],
    isComposite: true,
  },
];

export type MatchedStudentStory = CompositeStudentStory & {
  matchScore: number;
};

export const matchCompositeStories = (
  profile: DimensionSignal,
  limit = 3,
): readonly MatchedStudentStory[] =>
  compositeStudentStories
    .map((story) => ({
      ...story,
      matchScore:
        story.signals.reduce(
          (total, signal) => total + Math.max(0, profile[signal] ?? 0),
          0,
        ) / story.signals.length,
    }))
    .sort((a, b) => b.matchScore - a.matchScore || a.id.localeCompare(b.id))
    .slice(0, Math.max(0, limit));
