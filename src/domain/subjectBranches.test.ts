import {
  applyQuestionResponse,
  createEvidenceProfile,
  normalizeEvidence,
} from "./scoring";
import {
  selectSubjectBranchQuestions,
  subjectBranchDefinitions,
} from "./subjectBranches";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const selected = selectSubjectBranchQuestions(
  ["Math", "Computer Science", "Biology", "Math", "Unknown"],
  { analyze: 0.9, precision: 0.8 },
  3,
);

assert(selected.length === 3, "adaptive branching caps follow-ups at three");
assert(
  new Set(selected.map((question) => question.subject)).size === 3,
  "adaptive branching removes duplicate subjects",
);
assert(
  selected.every((question) => question.options.length === 4),
  "each selected subject offers multiple ways to enjoy the same subject",
);

const withMathReason = applyQuestionResponse(
  createEvidenceProfile(),
  "subject_math",
  "explain",
  Object.values(subjectBranchDefinitions),
);
const pattern = normalizeEvidence(withMathReason);

assert(pattern.workModes.explain > 0, "subject reasons add work-mode evidence");
assert(
  pattern.activityModes.teach > 0,
  "subject reasons distinguish the activity behind an enjoyed subject",
);
