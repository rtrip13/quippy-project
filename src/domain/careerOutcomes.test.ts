import assert from "node:assert/strict";
import test from "node:test";

import type { Family } from "../data/schools";
import {
  getCareerOutcome,
  nationalFamilyCareerOutcomes,
  schoolMajorCareerOutcomes,
} from "./careerOutcomes";

const families: readonly Family[] = [
  "Computing & Data",
  "Engineering & Built Environment",
  "Natural & Physical Sciences",
  "Health & Human Services",
  "Business & Economics",
  "Social & Behavioral Sciences",
  "Humanities & Languages",
  "Arts, Design & Performance",
  "Communication & Media",
  "Education, Public Service & Policy",
  "Interdisciplinary & Individualized",
];

test("prefers a school-major outcome over the national family fallback", () => {
  const outcome = getCareerOutcome({
    schoolId: "umich",
    majorId: "economics",
    family: "Business & Economics",
  });

  assert.equal(outcome.scope, "school_major");
  assert.equal(outcome.cohortYear, 2020);
  assert.deepEqual(outcome.earnings.figures, [
    { statistic: "median", amount: 67_000 },
  ]);
  assert.match(outcome.caveat, /not a salary guarantee/i);
  assert.match(outcome.source.url, /umich\.edu/);
});

test("falls back to a clearly labeled national family outlook", () => {
  const outcome = getCareerOutcome({
    schoolId: "umich",
    majorId: "computer-science-bs",
    family: "Computing & Data",
  });

  assert.equal(outcome.scope, "national_family");
  assert.equal(outcome.cohortYear, 2023);
  assert.equal(outcome.earnings.figures[0]?.amount, 100_000);
  assert.match(outcome.population, /^U\.S\./);
  assert.match(outcome.caveat, /not an outcome for this college/i);
  assert.match(outcome.source.url, /^https:\/\/www\.bls\.gov\//);
});

test("keeps mean, median, and range distinct for Ross graduate data", () => {
  const outcome = schoolMajorCareerOutcomes.find(
    ({ majorId }) => majorId === "business",
  );

  assert.ok(outcome);
  assert.equal(outcome.earnings.period, "starting_salary");
  assert.deepEqual(outcome.earnings.figures, [
    { statistic: "mean", amount: 94_909 },
    { statistic: "median", amount: 100_000 },
  ]);
  assert.deepEqual(outcome.earnings.range, {
    low: 42_000,
    high: 250_000,
  });
  assert.match(outcome.population, /graduate acceptances/i);
});

test("every displayed source has an explicit review date", () => {
  for (const outcome of [
    ...schoolMajorCareerOutcomes,
    ...Object.values(nationalFamilyCareerOutcomes),
  ]) {
    assert.equal(outcome.source.reviewedOn, "2026-08-30");
    assert.match(outcome.source.reviewedOn, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("covers every major family with official national context", () => {
  assert.deepEqual(
    Object.keys(nationalFamilyCareerOutcomes).sort(),
    [...families].sort(),
  );

  for (const family of families) {
    const outcome = nationalFamilyCareerOutcomes[family];
    assert.equal(outcome.family, family);
    assert.equal(outcome.scope, "national_family");
    assert.equal(outcome.earnings.figures[0]?.statistic, "median");
    assert.ok(outcome.occupations.length >= 3);
    assert.deepEqual(outcome.employers, []);
    assert.match(outcome.source.url, /^https:\/\/www\.bls\.gov\//);
  }
});
