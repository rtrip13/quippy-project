import assert from "node:assert/strict";
import test from "node:test";

import { schoolClubsById, schoolRegistry } from "../data/schools";

test("every supported named campus has a diverse verified club starter set", () => {
  const namedSchools = schoolRegistry.filter((school) => school.id !== "other");
  const allIds = new Set<string>();

  namedSchools.forEach((school) => {
    const clubs = schoolClubsById[school.id] ?? [];
    assert.ok(
      clubs.length >= 6,
      `${school.shortName} should have at least 6 clubs`,
    );

    clubs.forEach((club) => {
      assert.ok(!allIds.has(club.id), `duplicate club id: ${club.id}`);
      allIds.add(club.id);
      assert.ok(club.categories.length > 0, `${club.name} needs categories`);
      assert.ok(
        club.whyFieldwork.length > 0,
        `${club.name} needs fieldwork copy`,
      );
      const sourceUrl =
        club.maizePagesUrl ??
        club.clubUrl ??
        club.sourceUrl ??
        club.sourceUrls?.[0] ??
        club.directoryUrl;
      assert.match(
        sourceUrl ?? "",
        /^https:\/\//,
        `${club.name} needs an HTTPS source`,
      );
    });
  });
});
