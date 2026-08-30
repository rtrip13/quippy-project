import assert from "node:assert/strict";
import test from "node:test";

import { clubsForSchool, schoolRegistry } from "../../data/schools";
import {
  CLUB_DATA_REVIEWED_ON,
  campusActionsForClub,
  campusActionsForSchool,
  campusCoverage,
  clubIntelligence,
} from "./model";
import { compositeStudentStories, matchCompositeStories } from "./stories";

test("every named school has sourced, date-free campus actions", () => {
  const coverage = campusCoverage();
  schoolRegistry
    .filter((school) => school.id !== "other")
    .forEach((school) => {
      assert.ok(coverage[school.id].clubCount >= 6);
      assert.equal(
        coverage[school.id].actionCount,
        coverage[school.id].clubCount * 3,
      );
      const actions = campusActionsForSchool(school.id);
      assert.ok(actions.length > 0);
      actions.forEach((action) => {
        assert.doesNotMatch(action.detail, /\b20\d{2}\b/);
        if (action.url) assert.match(action.url, /^https:\/\//);
      });
    });
});

test("club intelligence separates editorial logistics from fit", () => {
  const club = clubsForSchool("umich")[0];
  const details = clubIntelligence("umich", club);
  assert.equal(details.reviewedOn, CLUB_DATA_REVIEWED_ON);
  assert.match(details.primaryUrl, /^https:\/\//);
  assert.match(details.freshnessNote, /Verify/i);
  assert.ok(details.beginnerGuidance.length > 20);
  assert.equal(campusActionsForClub("umich", club).length, 3);
});

test("preferred clubs control action order", () => {
  const clubs = clubsForSchool("ufl");
  const preferred = clubs[clubs.length - 1];
  const [first] = campusActionsForSchool("ufl", [preferred.id], 1);
  assert.equal(first.clubId, preferred.id);
});

test("student stories are disclosed composites and match deterministically", () => {
  assert.ok(compositeStudentStories.length >= 8);
  assert.ok(compositeStudentStories.length <= 12);
  compositeStudentStories.forEach((story) =>
    assert.equal(story.isComposite, true),
  );

  const matches = matchCompositeStories(
    { build: 1, design: 1, make: 0.8, create: 0.7 },
    2,
  );
  assert.equal(matches.length, 2);
  assert.ok(matches[0].matchScore >= matches[1].matchScore);
  assert.ok(matches[0].signals.includes("build"));
});
