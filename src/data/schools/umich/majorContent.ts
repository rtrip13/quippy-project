import { majors } from "./majors";

export type MajorDecisionContent = {
  majorId: string;
  everydayWork: string;
  sampleWork: string;
  firstLook: string;
  tradeoffs: readonly [string, string];
  questionsToAsk: readonly [string, string];
  editorialStatus: "reviewed_hypothesis";
};

const content = [
  [
    "economics",
    "Build and challenge models of how people and institutions respond to constraints.",
    "Explain a surprising price change using two competing hypotheses and the evidence each would need.",
    "Read an introductory problem set and attempt one question before reading the solution.",
    "Models make messy behavior easier to reason about.",
    "The math and assumptions can feel more prominent than the human story.",
    "How quantitative are the required courses?",
    "Which assignment best represents upper-level work?",
  ],
  [
    "computer-science-bs",
    "Translate ambiguous needs into precise systems, then debug the gap between intention and behavior.",
    "Build a tiny tool, give it to one person, and repair the first failure they encounter.",
    "Try a beginner programming exercise and keep a note of how the debugging felt.",
    "You can make useful systems from nothing but logic and iteration.",
    "Long stretches may be spent tracing one invisible mistake.",
    "How much work is collaborative versus individual?",
    "What makes students decide the debugging is worth it?",
  ],
  [
    "data-science-bs",
    "Clean imperfect data, choose defensible methods, and communicate what the results do and do not support.",
    "Take a public dataset and explain one pattern plus one reason it might be misleading.",
    "Open a beginner data notebook and reproduce one chart.",
    "Evidence can reveal patterns that intuition misses.",
    "Most of the work is cleaning, checking, and qualifying—not dramatic prediction.",
    "Which courses emphasize communication and ethics?",
    "How often do projects begin with messy real data?",
  ],
  [
    "mechanical-engineering",
    "Model physical systems, prototype parts, test failure, and revise within real constraints.",
    "Redesign an everyday mechanism to reduce weight, friction, or manufacturing complexity.",
    "Watch a student design-team review and note which problems hold your attention.",
    "Ideas become physical objects whose performance can be measured.",
    "Precision, prerequisite chains, and repeated testing consume substantial time.",
    "When do students first build something substantial?",
    "Which required task surprises new majors most?",
  ],
  [
    "architecture",
    "Turn human needs, site constraints, and visual ideas into spatial proposals through repeated critique.",
    "Sketch three ways a small shared space could support both quiet and social use.",
    "Review one studio project from first draft through final revision.",
    "The work combines systems, people, materials, and visual judgment.",
    "Studio iteration and critique can demand significant time without one correct answer.",
    "What does a normal studio week actually require?",
    "How are technical constraints introduced into design work?",
  ],
  [
    "biology",
    "Use observation and experiments to explain living systems across scales.",
    "Design a simple experiment that distinguishes between two explanations for a biological pattern.",
    "Read the methods section of a student-friendly research article and diagram the experiment.",
    "Small observations can connect to large questions about living systems.",
    "Precision, repetition, and prerequisite science courses are unavoidable parts of the path.",
    "When do undergraduates begin independent investigation?",
    "How much required work happens in labs?",
  ],
  [
    "nursing",
    "Combine clinical observation, technical procedure, communication, and rapid prioritization in service of patients.",
    "Work through a simple care scenario and explain which concern you would assess first and why.",
    "Ask a current student to describe an ordinary clinical day, including its least glamorous task.",
    "The work has immediate human relevance and visible responsibility.",
    "Emotional load, precision, schedules, and coordination are central—not side effects.",
    "Which clinical setting feels most different from expectations?",
    "What repetitive work must students learn to tolerate?",
  ],
  [
    "psychology",
    "Form testable questions about behavior, gather evidence, and separate appealing explanations from supported ones.",
    "Rewrite a popular claim about behavior as a study with measurable variables and possible confounds.",
    "Compare a popular psychology article with the research it cites.",
    "Everyday human questions become structured investigations.",
    "Evidence is often probabilistic, methods-heavy, and less personally diagnostic than expected.",
    "How much statistics and research design is required?",
    "What distinguishes classroom psychology from clinical practice?",
  ],
  [
    "public-policy",
    "Synthesize evidence, values, institutions, and implementation constraints into decisions that affect communities.",
    "Compare two responses to a campus problem and identify who benefits, who bears costs, and what evidence is missing.",
    "Read one policy memo and mark every factual claim, value judgment, and implementation assumption.",
    "Analysis can connect directly to public decisions and institutional change.",
    "Good options still involve compromise, ambiguity, and slow coordination.",
    "How often do students work with real organizations?",
    "Which quantitative methods are expected?",
  ],
  [
    "political-science",
    "Analyze power, institutions, collective behavior, and competing explanations using historical and empirical evidence.",
    "Explain one political outcome using two different theories and identify evidence that would favor either one.",
    "Read a short scholarly argument and map its claim, mechanism, and evidence.",
    "Current events gain deeper institutional and historical structure.",
    "Reading, methodology, and unresolved disagreement are persistent parts of the work.",
    "How empirical are the different subfields?",
    "Which assignments best represent advanced study?",
  ],
  [
    "business",
    "Coordinate people, evidence, resources, and persuasion to make decisions under uncertainty.",
    "Create a one-page recommendation for a small organization choosing between two growth options.",
    "Analyze a short case and commit to a recommendation before reading others' views.",
    "Projects often connect analysis to visible decisions and teamwork.",
    "Coordination, competition, presentation, and imperfect group work can dominate the experience.",
    "How much of the curriculum is team-based?",
    "What work feels least like the public image of business?",
  ],
  [
    "english",
    "Read closely, interpret ambiguity, build arguments, and revise language until it carries precise meaning.",
    "Compare two interpretations of a short passage and defend the stronger one with textual evidence.",
    "Read an essay draft alongside its revision and identify what changed in the argument.",
    "Language and interpretation receive sustained, serious attention.",
    "The work requires extensive reading, uncertain conclusions, and repeated revision.",
    "How much writing is analytical versus creative?",
    "What does advanced seminar preparation feel like each week?",
  ],
  [
    "history",
    "Reconstruct explanations from incomplete sources and argue carefully about change, context, and causation.",
    "Use three conflicting sources to write a provisional explanation and list what remains unknowable.",
    "Examine a primary source before reading the historian's interpretation of it.",
    "Evidence turns broad stories about the past into contestable arguments.",
    "Reading volume, source criticism, and ambiguity can be demanding.",
    "When do students work directly with archives or primary sources?",
    "How does historical writing differ from high-school essays?",
  ],
  [
    "communication-and-media",
    "Study and create messages while considering audience, medium, institutions, and cultural impact.",
    "Reframe the same campus announcement for three audiences and explain every change.",
    "Analyze how one story changes across video, social, and long-form formats.",
    "The work connects creative choices to audience behavior and public meaning.",
    "Deadlines, revision, coordination, and subjective feedback are common.",
    "How much of the program is making media versus analyzing it?",
    "Which project best represents upper-level work?",
  ],
  [
    "art-and-design",
    "Develop visual ideas through making, critique, material experimentation, and repeated revision.",
    "Create three materially different responses to the same prompt and document what each reveals.",
    "Attend a critique or compare an early study with a finished student project.",
    "Ideas become visible experiences that can affect people directly.",
    "Critique, repetition, self-direction, and uncertain evaluation are fundamental.",
    "How much time do studio courses require outside class?",
    "How do students balance personal voice with practical constraints?",
  ],
] as const;

export const umichMajorDecisionContent: readonly MajorDecisionContent[] =
  content.map(
    ([
      majorId,
      everydayWork,
      sampleWork,
      firstLook,
      gain,
      cost,
      questionA,
      questionB,
    ]) => ({
      majorId,
      everydayWork,
      sampleWork,
      firstLook,
      tradeoffs: [gain, cost],
      questionsToAsk: [questionA, questionB],
      editorialStatus: "reviewed_hypothesis",
    }),
  );

const knownMajorIds = new Set(majors.map(({ id }) => id));
umichMajorDecisionContent.forEach(({ majorId }) => {
  if (!knownMajorIds.has(majorId)) {
    throw new Error(
      `Decision content references unknown U-M major "${majorId}"`,
    );
  }
});

export const getUmichMajorDecisionContent = (majorId: string) =>
  umichMajorDecisionContent.find((entry) => entry.majorId === majorId);
