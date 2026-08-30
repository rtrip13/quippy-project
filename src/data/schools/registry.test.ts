import assert from "node:assert/strict";
import test from "node:test";
import { getSchoolData } from "./registry";

const starterSchoolIds = [
  "uc-berkeley",
  "ucla",
  "ut-austin",
  "ufl",
  "uw-seattle",
  "stanford",
  "harvard",
  "mit",
  "nyu",
  "howard",
] as const;

test("named starter schools expose specific, school-prefixed programs", () => {
  starterSchoolIds.forEach((schoolId) => {
    const school = getSchoolData(schoolId);
    assert.equal(school.dataDepth, "starter", schoolId);
    assert.equal(school.catalog.depth, "starter", schoolId);
    assert.ok(school.catalog.programs.length >= 10, schoolId);
    assert.ok(
      school.catalog.programs.every(
        (program) =>
          program.id.startsWith(`${schoolId}-`) &&
          !program.id.startsWith("broad-") &&
          program.name !== program.family,
      ),
      schoolId,
    );
    assert.ok(
      new Set(school.catalog.programs.map((program) => program.family)).size >=
        6,
      schoolId,
    );
  });
});

test("unknown schools retain the honest generic broad-field fallback", () => {
  const school = getSchoolData("not-in-registry");
  assert.equal(school.id, "other");
  assert.equal(school.dataDepth, "generic");
  assert.ok(
    school.catalog.programs.every((program) => program.id.startsWith("broad-")),
  );
});
