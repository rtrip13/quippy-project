import assert from "node:assert/strict";
import test from "node:test";
import { majors } from "./majors";
import {
  getUmichMajorDecisionContent,
  umichMajorDecisionContent,
} from "./majorContent";

test("ships deep decision content for fifteen valid Michigan majors", () => {
  assert.equal(umichMajorDecisionContent.length, 15);
  assert.equal(
    new Set(umichMajorDecisionContent.map(({ majorId }) => majorId)).size,
    15,
  );
  const known = new Set(majors.map(({ id }) => id));
  umichMajorDecisionContent.forEach((entry) => {
    assert.equal(known.has(entry.majorId), true);
    assert.ok(entry.everydayWork.length > 40);
    assert.ok(entry.sampleWork.length > 40);
    assert.equal(entry.tradeoffs.length, 2);
  });
});

test("looks up content without inventing a fallback record", () => {
  assert.equal(getUmichMajorDecisionContent("economics")?.majorId, "economics");
  assert.equal(getUmichMajorDecisionContent("not-a-major"), undefined);
});
