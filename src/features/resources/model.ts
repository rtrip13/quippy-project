import type { SchoolData, SchoolSource } from "../../data/schools";

export type ResourceRecommendationType =
  | "video_search"
  | "official_academic"
  | "academic_directory"
  | "work_exploration";

export type ResourceRecommendation = {
  label: string;
  type: ResourceRecommendationType;
  provider: string;
  url: string;
  description: string;
};

const ACADEMIC_SOURCE_TERMS: Readonly<Record<string, number>> = {
  major: 8,
  majors: 8,
  degree: 7,
  degrees: 7,
  program: 7,
  programs: 7,
  undergraduate: 6,
  catalog: 5,
  academics: 4,
  academic: 4,
  department: 3,
  college: 2,
  colleges: 2,
  school: 1,
  schools: 1,
};

const wordsIn = (value: string) =>
  value.toLowerCase().match(/[a-z0-9]+/g) ?? [];

const academicSourceScore = (source: SchoolSource, fieldWords: Set<string>) =>
  wordsIn(source.label).reduce(
    (score, word) =>
      score +
      (ACADEMIC_SOURCE_TERMS[word] ?? 0) +
      (fieldWords.has(word) ? 10 : 0),
    0,
  );

/** Selects the strongest catalog/program source without inferring URLs. */
export const selectAcademicSource = (
  field: string,
  school: SchoolData,
): SchoolSource | undefined => {
  const fieldWords = new Set(wordsIn(field).filter((word) => word.length > 2));

  return school.officialSources
    .map((source, index) => ({
      source,
      index,
      score: academicSourceScore(source, fieldWords),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.source;
};

const encodedQuery = (query: string) => encodeURIComponent(query);

/**
 * Returns discovery starting points, not endorsements of particular creators or jobs.
 * Search destinations are labelled as searches because their results can change or personalize.
 */
export const getResourceRecommendations = (
  field: string,
  school: SchoolData,
): readonly ResourceRecommendation[] => {
  const subject = field.trim() || "this field";
  const academicSource = selectAcademicSource(subject, school);

  const academicResource: ResourceRecommendation = academicSource
    ? {
        label: `Check ${school.shortName}'s program details`,
        type: "official_academic",
        provider: school.shortName,
        url: academicSource.url,
        description: `${academicSource.label} is the official starting point for current programs and requirements.`,
      }
    : {
        label: "Find your school's current catalog",
        type: "academic_directory",
        provider: "College Navigator (NCES)",
        url: "https://nces.ed.gov/collegenavigator/",
        description:
          "Select your school, then use its official website link to verify current programs and requirements.",
      };

  return [
    {
      label: `Search honest days in ${subject}`,
      type: "video_search",
      provider: "YouTube search",
      url: `https://www.youtube.com/results?search_query=${encodedQuery(
        `${subject} day in the life student coursework assignments career daily tasks honest`,
      )}`,
      description:
        "An unreviewed search—not a curated recommendation. Compare student coursework with the routine parts of related jobs.",
    },
    academicResource,
    {
      label: `Inspect the work behind ${subject}`,
      type: "work_exploration",
      provider: "O*NET OnLine",
      url: `https://www.onetonline.org/find/quick?s=${encodedQuery(subject)}`,
      description:
        "Search related occupations, then inspect their tasks, work activities, and work context—not just their titles.",
    },
  ];
};
