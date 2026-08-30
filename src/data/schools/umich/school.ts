import { academicUnits, majors } from "./majors";
import type { SchoolData } from "../types";
import { defineCampusBundle } from "../../campusBundle";
import { umichClubs } from "./clubs";
import { umichMajorProfiles } from "./majorProfiles";

const school: SchoolData = {
  id: "umich",
  name: "University of Michigan",
  shortName: "Michigan",
  location: "Ann Arbor, MI",
  academicUnits,
  dataDepth: "full",
  catalog: {
    depth: "full",
    programs: majors,
    note: "Seeded from the University of Michigan undergraduate admissions program list; always verify current requirements with the university.",
  },
  officialSources: [
    {
      label: "U-M schools and colleges",
      url: "https://umich.edu/schools-colleges/",
    },
    {
      label: "U-M majors and degrees",
      url: "https://admissions.umich.edu/academics-majors/majors-degrees",
    },
  ],
};

export const umichBundle = defineCampusBundle({
  schemaVersion: 1,
  school,
  majors,
  clubs: umichClubs,
  majorProfiles: umichMajorProfiles,
  freshness: {
    catalog: { reviewedAt: "2026-08-30", reviewAfter: "2027-02-28" },
    clubs: { reviewedAt: "2026-08-30", reviewAfter: "2026-11-30" },
    major_profiles: { reviewedAt: "2026-08-30", reviewAfter: "2027-02-28" },
  },
  provenance: [
    {
      id: "umich-majors-degrees",
      label: "U-M majors and degrees",
      publisher: "University of Michigan Office of Undergraduate Admissions",
      url: "https://admissions.umich.edu/academics-majors/majors-degrees",
      sourceType: "official",
      appliesTo: ["catalog"],
      accessedAt: "2026-08-30",
    },
    {
      id: "umich-maize-pages",
      label: "Maize Pages student organization directory",
      publisher: "University of Michigan",
      url: "https://maizepages.umich.edu/organizations",
      sourceType: "official",
      appliesTo: ["clubs"],
      accessedAt: "2026-08-30",
    },
    {
      id: "unlabeled-major-profile-heuristics",
      label:
        "Editorial work-pattern heuristics informed by the U-M program catalog",
      publisher: "UNLABELED",
      url: "https://admissions.umich.edu/academics-majors/majors-degrees",
      sourceType: "editorial",
      appliesTo: ["major_profiles"],
      accessedAt: "2026-08-30",
    },
  ],
});

/** Existing registry-facing export; kept stable while richer consumers adopt umichBundle. */
export const umich: SchoolData = umichBundle.school;
