import assert from "node:assert/strict";
import test from "node:test";
import type { SchoolData } from "../../data/schools";
import {
  buildMajorComparison,
  normalizeComparisonSelection,
  toggleComparisonSelection,
} from "./model";

const school: SchoolData = {
  id: "test",
  name: "Test University",
  shortName: "Test U",
  location: "Test City",
  academicUnits: ["College"],
  dataDepth: "starter",
  catalog: {
    depth: "starter",
    note: "Test catalog note.",
    programs: [
      {
        id: "cs",
        name: "Computer Science",
        school: "College",
        family: "Computing & Data",
        access: "prerequisites",
      },
      {
        id: "history",
        name: "History",
        school: "College",
        family: "Humanities & Languages",
        access: "direct",
      },
      {
        id: "design",
        name: "Design",
        school: "College",
        family: "Arts, Design & Performance",
        access: "internal_application",
      },
      {
        id: "policy",
        name: "Policy",
        school: "College",
        family: "Education, Public Service & Policy",
        access: "school_specific",
      },
    ],
  },
  officialSources: [],
};

test("normalizes to unique, known programs and caps comparison at three", () => {
  assert.deepEqual(
    normalizeComparisonSelection(
      ["cs", "missing", "cs", "history", "design", "policy"],
      school.catalog.programs,
    ),
    ["cs", "history", "design"],
  );
});

test("toggle adds, removes, rejects unknown IDs, and respects the cap", () => {
  assert.deepEqual(
    toggleComparisonSelection(["cs"], "history", school.catalog.programs),
    ["cs", "history"],
  );
  assert.deepEqual(
    toggleComparisonSelection(
      ["cs", "history", "design"],
      "policy",
      school.catalog.programs,
    ),
    ["cs", "history", "design"],
  );
  assert.deepEqual(
    toggleComparisonSelection(["cs", "history"], "cs", school.catalog.programs),
    ["history"],
  );
  assert.deepEqual(
    toggleComparisonSelection(["cs"], "unknown", school.catalog.programs),
    ["cs"],
  );
});

test("builds access and honest fallback sections", () => {
  const comparison = buildMajorComparison(school, ["cs", "history", "missing"]);

  assert.equal(comparison.canCompare, true);
  assert.deepEqual(comparison.missingIds, ["missing"]);
  assert.equal(
    comparison.programs[0].accessLabel.includes("prerequisites"),
    true,
  );
  assert.equal(
    comparison.programs[0].sections.every((section) => section.isFallback),
    true,
  );
  assert.match(comparison.programs[0].sections[1].note ?? "", /not curated/);
});

test("uses curated content section-by-section while retaining honest fallbacks", () => {
  const comparison = buildMajorComparison(school, ["cs", "history"], {
    cs: {
      coursework: ["Programming foundations", "Algorithms"],
      sampleWork: ["Build and test a small interactive system"],
    },
  });
  const cs = comparison.programs[0];

  assert.deepEqual(cs.sections[1].items, [
    "Programming foundations",
    "Algorithms",
  ]);
  assert.equal(cs.sections[1].isFallback, false);
  assert.equal(cs.sections[2].isFallback, false);
  assert.equal(cs.sections[3].isFallback, true);
});

test("requires at least two programs before comparison is ready", () => {
  const comparison = buildMajorComparison(school, ["cs"]);
  assert.equal(comparison.canCompare, false);
  assert.equal(
    comparison.selectionMessage,
    "Choose 1 more program to compare.",
  );
});
