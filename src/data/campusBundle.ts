import type { SchoolData } from "./schools/types";

export type CampusContentArea = "catalog" | "clubs" | "major_profiles";
const CONTENT_AREAS: readonly CampusContentArea[] = [
  "catalog",
  "clubs",
  "major_profiles",
];

export type ContentFreshness = {
  /** ISO calendar date on which a human last checked this content. */
  reviewedAt: string;
  /** ISO calendar date by which this content should be checked again. */
  reviewAfter: string;
};

export type ContentProvenance = {
  id: string;
  label: string;
  publisher: string;
  url: string;
  sourceType: "official" | "editorial";
  appliesTo: readonly CampusContentArea[];
  /** ISO calendar date on which the source was consulted. */
  accessedAt: string;
};

type Identified = { id: string };
type LinkedClub = Identified & { maizePagesUrl: string };

export type CampusBundle<
  TMajor extends Identified = Identified,
  TClub extends LinkedClub = LinkedClub,
  TMajorProfile extends Identified = Identified,
> = {
  schemaVersion: 1;
  school: SchoolData;
  majors: readonly TMajor[];
  clubs: readonly TClub[];
  majorProfiles: readonly TMajorProfile[];
  freshness: Readonly<Record<CampusContentArea, ContentFreshness>>;
  provenance: readonly ContentProvenance[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(value: string, field: string): void {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    !ISO_DATE.test(value) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid ${field} date: "${value}"`);
  }
}

function assertUniqueIds(items: readonly Identified[], label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.id.trim()) throw new Error(`${label} contains an empty id`);
    if (seen.has(item.id))
      throw new Error(`${label} contains duplicate id "${item.id}"`);
    seen.add(item.id);
  }
}

function assertWebUrl(value: string, field: string): void {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid ${field} URL: "${value}"`);
  }
  if (parsed.protocol !== "https:" || !parsed.hostname) {
    throw new Error(`${field} URL must use HTTPS: "${value}"`);
  }
}

/**
 * Defines the runtime boundary for campus-owned content. Validation happens when a campus bundle
 * is imported, keeping malformed editorial data from reaching recommendation or navigation code.
 */
export function defineCampusBundle<
  TMajor extends Identified,
  TClub extends LinkedClub,
  TMajorProfile extends Identified,
>(
  bundle: CampusBundle<TMajor, TClub, TMajorProfile>,
): CampusBundle<TMajor, TClub, TMajorProfile> {
  assertUniqueIds(bundle.majors, "majors");
  assertUniqueIds(bundle.clubs, "clubs");
  assertUniqueIds(bundle.majorProfiles, "majorProfiles");
  assertUniqueIds(bundle.provenance, "provenance");

  const majorIds = new Set(bundle.majors.map((major) => major.id));
  assertUniqueIds(bundle.school.catalog.programs, "school.catalog.programs");
  const catalogIds = new Set(
    bundle.school.catalog.programs.map((major) => major.id),
  );
  for (const major of bundle.majors) {
    if (!catalogIds.has(major.id)) {
      throw new Error(
        `Major "${major.id}" is missing from school.catalog.programs`,
      );
    }
  }
  for (const profile of bundle.majorProfiles) {
    if (!majorIds.has(profile.id)) {
      throw new Error(
        `Major profile "${profile.id}" does not reference a known major`,
      );
    }
  }

  bundle.school.officialSources.forEach((source, index) =>
    assertWebUrl(source.url, `officialSources[${index}]`),
  );
  bundle.clubs.forEach((club) =>
    assertWebUrl(club.maizePagesUrl, `club "${club.id}"`),
  );
  bundle.provenance.forEach((source) => {
    assertWebUrl(source.url, `provenance "${source.id}"`);
    assertIsoDate(source.accessedAt, `provenance "${source.id}" accessedAt`);
    if (
      !source.appliesTo.length ||
      source.appliesTo.some((area) => !CONTENT_AREAS.includes(area))
    ) {
      throw new Error(
        `Provenance "${source.id}" must name a valid content area`,
      );
    }
  });

  CONTENT_AREAS.forEach((area) => {
    const freshness = bundle.freshness[area];
    if (!freshness) throw new Error(`Missing freshness metadata for ${area}`);
    assertIsoDate(freshness.reviewedAt, `${area}.reviewedAt`);
    assertIsoDate(freshness.reviewAfter, `${area}.reviewAfter`);
    if (freshness.reviewAfter < freshness.reviewedAt) {
      throw new Error(`${area}.reviewAfter cannot be before reviewedAt`);
    }
    if (!bundle.provenance.some((source) => source.appliesTo.includes(area))) {
      throw new Error(`No provenance source covers ${area}`);
    }
  });

  return bundle;
}
