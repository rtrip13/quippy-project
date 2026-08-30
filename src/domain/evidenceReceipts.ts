import { challengeDefinitions, questionDefinitions } from "./mappings";
import { subjectBranchDefinitions } from "./subjectBranches";
import type {
  DimensionSignal,
  EvidenceDimension,
  MajorFitResult,
  SubjectSelections,
} from "./types";

export type EvidenceReceiptSource =
  "profile" | "subject_enjoyment" | "subject_strength" | "challenge";

export type EvidenceReceipt = {
  id: string;
  text: string;
  source: EvidenceReceiptSource;
  dimensions: EvidenceDimension[];
  /** Internal ranking value; useful when visually explaining why a receipt was chosen. */
  relevance: number;
};

export type EvidenceReceiptAnswers = {
  profileAnswers?: Record<string, string[]>;
  subjects?: SubjectSelections;
  challengeOutcomes?: Record<string, string>;
};

export type EvidenceReceiptRequest = EvidenceReceiptAnswers & {
  result: Pick<MajorFitResult, "id" | "name" | "reasons">;
  limit?: number;
};

type ReceiptCandidate = Omit<EvidenceReceipt, "relevance"> & {
  signals: DimensionSignal;
  subject?: string;
};

const dimensionsOf = (signals: DimensionSignal): EvidenceDimension[] =>
  (Object.keys(signals) as EvidenceDimension[]).filter(
    (dimension) => (signals[dimension] ?? 0) > 0,
  );

const normalized = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const subjectMatchesMajor = (
  subject: string,
  majorId: string,
  majorName: string,
) => {
  const subjectTokens = normalized(subject)
    .split(" ")
    .filter((token) => token.length > 2 && token !== "science");
  const major = `${normalized(majorId)} ${normalized(majorName)}`;
  return subjectTokens.some((token) => major.includes(token));
};

const questionReceipt = (questionId: string, optionLabel: string): string => {
  const copy: Record<string, (label: string) => string> = {
    group_stuck: (label) =>
      `When a group got stuck, you chose to ${label.toLowerCase()}.`,
    ideal_project: (label) =>
      `Your most satisfying project would ${label.toLowerCase()}.`,
    preferred_mess: (label) =>
      `You would rather untangle ${label.toLowerCase()}.`,
    proud_make: (label) => `You were proud to make ${label.toLowerCase()}.`,
    tolerable_friction: (label) => `You can tolerate ${label.toLowerCase()}.`,
    work_setting: (label) => `You do your best work ${label.toLowerCase()}.`,
    learning_entry: (label) =>
      `You prefer to meet a new idea by choosing “${label.toLowerCase()}.”`,
    curiosity_hook: (label) =>
      `The question most likely to hold your curiosity was “${label}”`,
    class_energy: (label) =>
      `The class moment that gives you energy is ${label.toLowerCase()}.`,
    desired_impact: (label) =>
      `Schoolwork feels meaningful when it involves ${label.toLowerCase()}.`,
    assignment_shape: (label) =>
      `Given a choice, you would pick ${label.toLowerCase()}.`,
  };
  return copy[questionId]?.(optionLabel) ?? `You chose “${optionLabel}.”`;
};

const challengeReceipt: Record<string, Record<string, string>> = {
  "price-move": {
    "small-change":
      "You tested a small price change before jumping to an extreme.",
    "large-change":
      "You tested the pricing edge case to expose its consequences.",
    "explored-range": "You explored several price outcomes before deciding.",
  },
  "double-ping": {
    interface:
      "You checked the visible experience behind the duplicate confirmation.",
    workflow: "You traced the duplicate confirmation through its workflow.",
    system: "You traced the duplicate confirmation to the underlying system.",
  },
  "five-seconds": {
    details: "With incomplete information, you held onto the exact details.",
    pattern: "With incomplete information, you held onto the larger pattern.",
    story: "You built a coherent story from incomplete pieces.",
  },
  "first-fix": {
    student: "Your first intervention focused on the student experience.",
    message: "Your first intervention clarified the explanation.",
    process: "Your first intervention changed the process.",
    evidence: "You asked for more evidence before choosing an intervention.",
  },
  "curiosity-map": {
    "living-world": "Your first curiosity path led toward the living world.",
    people: "Your first curiosity path led toward how people think and act.",
    machines: "Your first curiosity path led toward machines and invention.",
    systems:
      "Your first curiosity path led toward rules, incentives, and systems.",
    stories:
      "Your first curiosity path led toward stories, culture, and meaning.",
  },
  "curiosity-question": {
    cause: "Your first question asked what caused the situation.",
    next: "Your first question asked what might happen next.",
    affected: "Your first question focused on who would be affected.",
    test: "Your first question asked how the idea could be tested.",
    change: "Your first question asked how the situation could be changed.",
  },
  "classroom-snapshots": {
    debate: "You chose a classroom built around live debate.",
    problem: "You chose a classroom built around solving a hard problem.",
    lab: "You chose a classroom built around lab and field investigation.",
    studio: "You chose a classroom built around making and critique.",
    case: "You chose a classroom built around a real case and decision.",
  },
};

/** Converts persisted onboarding answers into factual, user-facing evidence statements. */
export function buildEvidenceReceipts({
  profileAnswers = {},
  subjects = {},
  challengeOutcomes = {},
}: EvidenceReceiptAnswers): ReceiptCandidate[] {
  const candidates: ReceiptCandidate[] = [];
  const standardQuestions = new Map(
    questionDefinitions.map((question) => [question.id, question]),
  );
  const subjectQuestions = new Map(
    Object.values(subjectBranchDefinitions).map((question) => [
      question.id,
      question,
    ]),
  );

  Object.entries(profileAnswers)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([questionId, optionIds]) => {
      const question = standardQuestions.get(questionId);
      const subjectQuestion = subjectQuestions.get(questionId);
      const definition = question ?? subjectQuestion;
      if (!definition) return;
      optionIds.forEach((optionId) => {
        const option = definition.options.find((item) => item.id === optionId);
        if (!option) return;
        candidates.push({
          id: `profile:${questionId}:${optionId}`,
          text: subjectQuestion
            ? `In ${subjectQuestion.subject}, you were drawn to ${option.label.toLowerCase()}.`
            : questionReceipt(questionId, option.label),
          source: "profile",
          signals: option.signals,
          dimensions: dimensionsOf(option.signals),
          subject: subjectQuestion?.subject,
        });
      });
    });

  const addSubjects = (
    values: string[] | undefined,
    source: "subject_enjoyment" | "subject_strength",
  ) => {
    [...(values ?? [])].sort().forEach((subject) => {
      candidates.push({
        id: `${source}:${subject}`,
        text:
          source === "subject_enjoyment"
            ? `You said ${subject} holds your attention.`
            : `You already feel capable in ${subject}.`,
        source,
        signals: {},
        dimensions: [],
        subject,
      });
    });
  };
  // Enjoyment is stronger evidence of sustainable interest than perceived ease.
  addSubjects(subjects.enjoyment, "subject_enjoyment");
  addSubjects(subjects.strengths, "subject_strength");

  Object.entries(challengeOutcomes)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([challengeId, outcomeId]) => {
      const challenge = challengeDefinitions.find(
        (item) => item.id === challengeId,
      );
      const outcome = challenge?.outcomes.find((item) => item.id === outcomeId);
      if (!challenge || !outcome) return;
      candidates.push({
        id: `challenge:${challengeId}:${outcomeId}`,
        text:
          challengeReceipt[challengeId]?.[outcomeId] ??
          `In the work sample, you ${outcome.label.toLowerCase()}.`,
        source: "challenge",
        signals: outcome.signals,
        dimensions: dimensionsOf(outcome.signals),
      });
    });

  return candidates;
}

/** Selects the receipts that best support this result's stated fit reasons. */
export function selectEvidenceReceipts(
  result: Pick<MajorFitResult, "id" | "name" | "reasons">,
  candidates: ReceiptCandidate[],
  limit = 3,
): EvidenceReceipt[] {
  const reasonWeights = new Map(
    result.reasons.map((reason, index) => [
      reason.dimension,
      Math.max(reason.contribution, 0.05) * (result.reasons.length - index),
    ]),
  );
  const sourceBonus: Record<EvidenceReceiptSource, number> = {
    challenge: 0.35,
    profile: 0.2,
    subject_enjoyment: 0.15,
    subject_strength: 0,
  };

  return candidates
    .map(({ signals: _signals, subject, ...receipt }) => ({
      ...receipt,
      relevance:
        receipt.dimensions.reduce(
          (score, dimension) => score + (reasonWeights.get(dimension) ?? 0),
          0,
        ) +
        sourceBonus[receipt.source] +
        (subject && subjectMatchesMajor(subject, result.id, result.name)
          ? 4
          : 0),
    }))
    .filter((receipt) => receipt.relevance > sourceBonus[receipt.source])
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        a.source.localeCompare(b.source) ||
        a.id.localeCompare(b.id),
    )
    .filter(
      (receipt, index, all) =>
        all.findIndex((candidate) => candidate.text === receipt.text) === index,
    )
    .slice(0, Math.max(0, limit));
}

/** One-call adapter intended for result-card rendering in App.tsx. */
export function getEvidenceReceipts({
  result,
  limit = 3,
  ...answers
}: EvidenceReceiptRequest): EvidenceReceipt[] {
  return selectEvidenceReceipts(result, buildEvidenceReceipts(answers), limit);
}
