export type Family =
  | "Computing & Data"
  | "Engineering & Built Environment"
  | "Natural & Physical Sciences"
  | "Health & Human Services"
  | "Business & Economics"
  | "Social & Behavioral Sciences"
  | "Humanities & Languages"
  | "Arts, Design & Performance"
  | "Communication & Media"
  | "Education, Public Service & Policy"
  | "Interdisciplinary & Individualized";

export type Access =
  | "direct"
  | "prerequisites"
  | "internal_application"
  | "cross_campus_transfer"
  | "school_specific";

export type Major = {
  id: string;
  name: string;
  school: string;
  family: Family;
  access: Access;
};

export type SchoolDataDepth = "full" | "starter" | "generic";

export type SchoolCatalog = {
  /** Matches the parent school's dataDepth; kept here to make catalogs portable later. */
  depth: SchoolDataDepth;
  programs: readonly Major[];
  note: string;
};

export type SchoolSource = {
  label: string;
  url: string;
};

export type SchoolData = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  academicUnits: readonly string[];
  dataDepth: SchoolDataDepth;
  catalog: SchoolCatalog;
  officialSources: readonly SchoolSource[];
};
