import { Family, Major, SchoolCatalog } from "./types";

const broadFields: readonly Family[] = [
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

const toId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * These are exploration categories, not claims about a university's majors or admissions paths.
 * A single shared instance makes generic coverage obvious and easy to replace with richer packages.
 */
export const genericBroadFieldPrograms: readonly Major[] = broadFields.map(
  (family) => ({
    id: `broad-${toId(family)}`,
    name: family,
    school: "Broad field — confirm programs with your university",
    family,
    access: "school_specific",
  }),
);

export const genericBroadFieldCatalog: SchoolCatalog = {
  depth: "generic",
  programs: genericBroadFieldPrograms,
  note: "Broad exploration fields only. This is not a university program catalog; confirm offerings and requirements with the institution.",
};
