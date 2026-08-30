import assert from "node:assert/strict";
import test from "node:test";
import { genericBroadFieldPrograms } from "../../data/schools/genericCatalog";
import {
  getTuesdayMoments,
  getBundledTuesdayMoments,
  isTuesdayMoments,
  scenarioKeys,
  tuesdayChoices,
} from "./model";
import approvedScenarios from "./approvedScenarios.json";

test("all broad fields have distinct, complete scenarios", () => {
  const openingScenes = new Set<string>();
  for (const program of genericBroadFieldPrograms) {
    const moments = getTuesdayMoments(program);
    assert.ok(isTuesdayMoments(moments), program.family);
    openingScenes.add(moments[0].text);
    assert.equal(new Set(moments.map((moment) => moment.text)).size, 3);
  }
  assert.equal(openingScenes.size, genericBroadFieldPrograms.length);
});

test("economics has its own tasks rather than the business examples", () => {
  const economics = getTuesdayMoments({
    id: "economics",
    family: "Business & Economics",
  });
  const business = getTuesdayMoments({
    id: "business",
    family: "Business & Economics",
  });
  assert.ok(isTuesdayMoments(economics));
  assert.notDeepEqual(economics, business);
  assert.deepEqual(
    getTuesdayMoments({
      id: "ucla-economics",
      name: "Economics",
      family: "Business & Economics",
    }),
    economics,
  );
});

test("every shipped field has reviewed content with the assigned disciplines and consistent interest scale", () => {
  assert.deepEqual(
    Object.keys(approvedScenarios).sort(),
    [...scenarioKeys].sort(),
  );
  for (const key of scenarioKeys) {
    const moments = approvedScenarios[key];
    const anchors = getBundledTuesdayMoments(key);
    assert.ok(isTuesdayMoments(moments), key);
    moments.forEach((moment, index) => {
      assert.equal(moment.place, anchors[index].place);
      assert.deepEqual(moment.choices, tuesdayChoices);
    });
  }
});

test("missing focus still offers concrete, answerable examples", () => {
  assert.ok(isTuesdayMoments(getTuesdayMoments()));
});

test("ranked direction IDs resolve through their family, without a catalog major match", () => {
  const direction = getTuesdayMoments({
    id: "direction-social-behavioral-sciences",
    family: "Social & Behavioral Sciences",
  });
  const catalog = getTuesdayMoments({
    id: "psychology",
    family: "Social & Behavioral Sciences",
  });
  assert.deepEqual(direction, catalog);
  assert.notDeepEqual(direction, getTuesdayMoments());
  assert.ok(
    isTuesdayMoments(getTuesdayMoments({ id: "unknown", family: "unknown" })),
  );
});

test("reject malformed model output before it can become app content", () => {
  const moments = getTuesdayMoments();
  for (const invalid of [null, {}, [], moments.slice(0, 2)]) {
    assert.equal(isTuesdayMoments(invalid), false);
  }
  for (const invalidMoment of [
    null,
    { ...moments[0], question: "An assertion without a question" },
    { ...moments[0], text: " " },
    { ...moments[0], text: "x".repeat(421) },
    { ...moments[0], choices: ["Yes", "Yes", "No"] },
    { ...moments[0], choices: ["Yes", 42, "No"] },
    { ...moments[0], choices: ["Yes", " ", "No"] },
  ]) {
    assert.equal(isTuesdayMoments([invalidMoment, ...moments.slice(1)]), false);
  }
});

test("approved content is valid; broken entries safely use bundled examples", () => {
  for (const [key, value] of Object.entries(approvedScenarios)) {
    assert.ok(isTuesdayMoments(value), `Invalid approved scenarios: ${key}`);
  }
  const entries = approvedScenarios as Record<string, unknown>;
  const previous = entries.economics;
  try {
    entries.economics = [{ text: "Broken generated entry" }];
    assert.ok(
      isTuesdayMoments(
        getTuesdayMoments({ id: "economics", family: "Business & Economics" }),
      ),
    );
    const custom = getTuesdayMoments();
    entries.economics = custom;
    assert.deepEqual(
      getTuesdayMoments({ id: "economics", family: "Business & Economics" }),
      custom,
    );
  } finally {
    if (previous === undefined) delete entries.economics;
    else entries.economics = previous;
  }
});
