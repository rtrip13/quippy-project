import assert from "node:assert/strict";
import test from "node:test";
import { getSchoolData } from "../../data/schools/registry";
import { buildFirstSemesterPlan } from "../../domain/firstSemesterPlan";
import { directionId, resolveFieldworkFocus } from "./focus";

test("a broad direction does not silently become the first catalog major", () => {
  const school = getSchoolData("umich");
  const focus = resolveFieldworkFocus(
    school,
    directionId("Social & Behavioral Sciences"),
  );
  assert.equal(focus.program, undefined);
  const plan = buildFirstSemesterPlan(focus.program);
  assert.equal(plan.majorId, null);
  assert.equal(plan.source, "broad_fallback");
});

test("an explicitly selected major stays selected when recommendations change", () => {
  const school = getSchoolData("umich");
  const economics = school.catalog.programs.find(
    (program) => program.name === "Economics",
  )!;
  assert.ok(economics);
  const focus = resolveFieldworkFocus(
    school,
    economics.id,
    directionId("Social & Behavioral Sciences"),
  );
  assert.equal(focus.program?.id, economics.id);
  assert.equal(buildFirstSemesterPlan(focus.program).majorName, "Economics");
});

test("a foreign campus program cannot leak into the current campus plan", () => {
  const school = getSchoolData("umich");
  const focus = resolveFieldworkFocus(
    school,
    "invalid-foreign-program",
    directionId("Computing & Data"),
  );
  assert.equal(focus.family, "Computing & Data");
  assert.equal(focus.program, undefined);
});
