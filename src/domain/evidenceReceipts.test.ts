import { getEvidenceReceipts } from "./evidenceReceipts";
import type { MajorFitResult } from "./types";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const economics: MajorFitResult = {
  id: "economics",
  name: "Economics",
  score: 82,
  reasons: [
    { dimension: "investigate", contribution: 0.8 },
    { dimension: "analyze", contribution: 0.7 },
    { dimension: "ambiguity", contribution: 0.5 },
  ],
};

const request = {
  result: economics,
  profileAnswers: {
    preferred_mess: ["evidence"],
    tolerable_friction: ["unknown"],
  },
  subjects: {
    strengths: ["Math"],
    enjoyment: ["Economics"],
  },
  challengeOutcomes: {
    "price-move": "explored-range",
    "first-fix": "evidence",
  },
};

const first = getEvidenceReceipts(request);
const second = getEvidenceReceipts(request);

assert(first.length === 3, "returns the requested default receipt count");
assert(
  JSON.stringify(first) === JSON.stringify(second),
  "receipt selection is deterministic",
);
assert(
  first.some((receipt) => receipt.text.includes("Economics")),
  "directly relevant subject enjoyment is surfaced",
);
assert(
  first.some((receipt) => receipt.source === "challenge"),
  "behavioral challenge evidence is surfaced",
);
assert(
  getEvidenceReceipts({ ...request, limit: 1 }).length === 1,
  "explicit limits are honored",
);
assert(
  getEvidenceReceipts({ result: economics }).length === 0,
  "missing answers safely produce no receipts",
);
