import { Family, Major, SchoolCatalog } from "../types";

const ARTS = "Division for the Arts";
const HUMANITIES = "Division for the Humanities";
const STEM = "Division of Natural Science and Mathematics";
const SOCIAL = "Division of Social Sciences and Education";

const rows: readonly [string, string, Family][] = [
  ["Art and Visual Culture", ARTS, "Arts, Design & Performance"],
  ["Dance and Performance Choreography", ARTS, "Arts, Design & Performance"],
  ["Music", ARTS, "Arts, Design & Performance"],
  ["Theater and Performance", ARTS, "Arts, Design & Performance"],
  ["African Diaspora and the World", HUMANITIES, "Humanities & Languages"],
  ["Comparative Women's Studies", HUMANITIES, "Social & Behavioral Sciences"],
  ["English", HUMANITIES, "Humanities & Languages"],
  ["History", HUMANITIES, "Humanities & Languages"],
  ["Philosophy and Religious Studies", HUMANITIES, "Humanities & Languages"],
  ["World Languages and Literature", HUMANITIES, "Humanities & Languages"],
  ["Biology", STEM, "Natural & Physical Sciences"],
  ["Chemistry and Biochemistry", STEM, "Natural & Physical Sciences"],
  ["Computer and Information Sciences", STEM, "Computing & Data"],
  ["Mathematics", STEM, "Natural & Physical Sciences"],
  ["Physics", STEM, "Natural & Physical Sciences"],
  ["Dual Degree Engineering Program", STEM, "Engineering & Built Environment"],
  ["Environmental and Health Sciences", STEM, "Health & Human Services"],
  ["African Diaspora Studies", SOCIAL, "Social & Behavioral Sciences"],
  ["Economics", SOCIAL, "Business & Economics"],
  ["Education Studies", SOCIAL, "Education, Public Service & Policy"],
  ["Global & Diaspora Studies", SOCIAL, "Interdisciplinary & Individualized"],
  ["Political Science", SOCIAL, "Education, Public Service & Policy"],
  ["Psychology", SOCIAL, "Social & Behavioral Sciences"],
  ["Sociology and Anthropology", SOCIAL, "Social & Behavioral Sciences"],
];

const toId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const spelmanStarterPrograms: readonly Major[] = rows.map(
  ([name, school, family]) => ({
    id: `spelman-${toId(name)}`,
    name,
    school,
    family,
    access: "school_specific",
  }),
);

export const spelmanStarterCatalog: SchoolCatalog = {
  depth: "starter",
  programs: spelmanStarterPrograms,
  note: "A starter set transcribed from Spelman’s official academic-divisions page, not a promise of complete or current degree and admissions details.",
};
