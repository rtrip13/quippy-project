import type { Family } from "../data/schools";

export type CareerOutcomeScope = "school_major" | "national_family";
export type EarningsStatistic = "median" | "mean";
export type EarningsPeriod =
  "starting_salary" | "annual_wage" | "annualized_internship";

export type MoneyRange = {
  low: number;
  high: number;
};

export type EarningsSummary = {
  currency: "USD";
  period: EarningsPeriod;
  figures: readonly {
    statistic: EarningsStatistic;
    amount: number;
  }[];
  range?: MoneyRange;
};

export type OutcomeCoverage = {
  sampleSize?: number;
  reportingRate?: number;
  note?: string;
};

export type OutcomeSource = {
  label: string;
  url: string;
  reviewedOn: string;
};

export type CareerOutcome = {
  id: string;
  scope: CareerOutcomeScope;
  family: Family;
  schoolId?: string;
  majorId?: string;
  population: string;
  cohortYear: number;
  monthsAfterGraduation?: number;
  earnings: EarningsSummary;
  coverage?: OutcomeCoverage;
  employers: readonly string[];
  occupations: readonly string[];
  source: OutcomeSource;
  caveat: string;
};

export type CareerOutcomeRequest = {
  schoolId: string;
  majorId: string;
  family: Family;
};

const SCHOOL_CAVEAT =
  "These are reported outcomes from a past cohort, not a salary guarantee. Pay varies by role, location, experience, industry, further study, and reporting coverage. Employers are examples, not placement odds or hiring partners.";

const NATIONAL_CAVEAT =
  "This is national field-of-degree context, not an outcome for this college or a salary guarantee. It describes employed workers with a bachelor's or higher degree in a broad field; pay varies by role, location, experience, industry, further study, and survey coverage.";

const umichEconomicsSource =
  "https://lsa.umich.edu/content/dam/econ-assets/Econdocs/UGDestinationFiles/Career%20Center%20Survey%20Flyer%202020.pdf";
const rossSource =
  "https://michiganross.umich.edu/undergraduate/bba/careers/employment-data";

export const schoolMajorCareerOutcomes: readonly CareerOutcome[] = [
  {
    id: "umich-economics-2020-first-destination",
    scope: "school_major",
    family: "Business & Economics",
    schoolId: "umich",
    majorId: "economics",
    population: "U-M Economics majors in the 2020 First Destination Survey",
    cohortYear: 2020,
    earnings: {
      currency: "USD",
      period: "starting_salary",
      figures: [{ statistic: "median", amount: 67_000 }],
    },
    coverage: {
      note: "The published flyer reports 74% employed and 15% continuing education; it does not state a response count or response rate.",
    },
    employers: [
      "Accenture",
      "Amazon",
      "Bank of America",
      "Deloitte",
      "Federal Reserve Bank of Cleveland",
      "Ford Motor Company",
      "J.P. Morgan",
    ],
    occupations: [
      "Management consulting",
      "Internet and software",
      "Investment and commercial banking",
    ],
    source: {
      label: "U-M Economics 2020 First Destination Survey flyer",
      url: umichEconomicsSource,
      reviewedOn: "2026-08-30",
    },
    caveat: SCHOOL_CAVEAT,
  },
  {
    id: "umich-business-2025-graduate-acceptances",
    scope: "school_major",
    family: "Business & Economics",
    schoolId: "umich",
    majorId: "business",
    population: "Michigan Ross BBA graduate acceptances reported for 2025",
    cohortYear: 2025,
    earnings: {
      currency: "USD",
      period: "starting_salary",
      figures: [
        { statistic: "mean", amount: 94_909 },
        { statistic: "median", amount: 100_000 },
      ],
      range: { low: 42_000, high: 250_000 },
    },
    coverage: {
      note: "The public table reports accepted full-time offers and base salary, excluding signing bonuses; it does not state a salary-reporting sample size on the page.",
    },
    employers: [
      "JPMorgan Chase & Co.",
      "Bank of America",
      "Deloitte",
      "McKinsey & Company",
      "Capital One",
      "Boston Consulting Group",
      "Goldman Sachs",
    ],
    occupations: [
      "Finance",
      "Consulting",
      "Marketing and sales",
      "Operations and supply chain management",
    ],
    source: {
      label: "Michigan Ross BBA employment data, 2024–2025",
      url: rossSource,
      reviewedOn: "2026-08-30",
    },
    caveat: SCHOOL_CAVEAT,
  },
];

type NationalFieldSeed = {
  family: Family;
  field: string;
  median: number;
  employment: number;
  occupations: readonly string[];
  slug: string;
};

const nationalFieldSeeds: readonly NationalFieldSeed[] = [
  {
    family: "Computing & Data",
    field: "Computer and information technology",
    median: 100_000,
    employment: 2_991_550,
    occupations: [
      "Software developers",
      "Computer occupations, all other",
      "Computer and information systems managers",
    ],
    slug: "computer-and-information/computer-and-information-technology",
  },
  {
    family: "Engineering & Built Environment",
    field: "Engineering",
    median: 100_000,
    employment: 5_568_160,
    occupations: [
      "Software developers",
      "Engineers, all other",
      "Civil engineers",
    ],
    slug: "engineering/engineering",
  },
  {
    family: "Natural & Physical Sciences",
    field: "Physical science",
    median: 80_000,
    employment: 1_984_110,
    occupations: [
      "Physicians, all other",
      "Physical scientists, all other",
      "Chemists",
    ],
    slug: "physical-science/physical-science",
  },
  {
    family: "Health & Human Services",
    field: "Healthcare and related",
    median: 72_000,
    employment: 5_729_840,
    occupations: [
      "Registered nurses",
      "Nurse practitioners",
      "Medical and health services managers",
    ],
    slug: "healthcare-and-related/healthcare-and-related",
  },
  {
    family: "Business & Economics",
    field: "Business",
    median: 75_000,
    employment: 13_736_300,
    occupations: [
      "Accountants and auditors",
      "Managers, all other",
      "Financial managers",
    ],
    slug: "business/business",
  },
  {
    family: "Social & Behavioral Sciences",
    field: "Social science",
    median: 75_000,
    employment: 5_226_990,
    occupations: ["Lawyers", "Managers, all other", "Management analysts"],
    slug: "social-science/social-science",
  },
  {
    family: "Humanities & Languages",
    field: "English",
    median: 60_000,
    employment: 1_943_540,
    occupations: [
      "Elementary school teachers, except special education",
      "Lawyers",
      "Writers and authors",
    ],
    slug: "english/english",
  },
  {
    family: "Arts, Design & Performance",
    field: "Fine and performing arts",
    median: 50_000,
    employment: 3_067_160,
    occupations: ["Graphic designers", "Managers, all other", "Art directors"],
    slug: "fine-arts/fine-arts",
  },
  {
    family: "Communication & Media",
    field: "Communications",
    median: 65_000,
    employment: 3_079_130,
    occupations: [
      "Managers, all other",
      "Marketing managers",
      "Market research analysts and marketing specialists",
    ],
    slug: "communications/communications",
  },
  {
    family: "Education, Public Service & Policy",
    field: "Public policy and social services",
    median: 55_000,
    employment: 994_200,
    occupations: [
      "Social workers, all other",
      "Social and community service managers",
      "Elementary school teachers, except special education",
    ],
    slug: "public-policy-and-social-services/public-policy-and-social-services",
  },
  {
    family: "Interdisciplinary & Individualized",
    field: "Interdisciplinary studies",
    median: 60_000,
    employment: 696_040,
    occupations: [
      "Elementary school teachers, except special education",
      "Managers, all other",
      "Dietitians and nutritionists",
    ],
    slug: "interdisciplinary-studies/interdisciplinary-studies",
  },
];

export const nationalFamilyCareerOutcomes: Readonly<
  Record<Family, CareerOutcome>
> = Object.fromEntries(
  nationalFieldSeeds.map((seed) => [
    seed.family,
    {
      id: `national-${seed.family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-2023`,
      scope: "national_family" as const,
      family: seed.family,
      population: `U.S. employed workers with a bachelor's or higher degree in ${seed.field}`,
      cohortYear: 2023,
      earnings: {
        currency: "USD" as const,
        period: "annual_wage" as const,
        figures: [{ statistic: "median" as const, amount: seed.median }],
      },
      coverage: {
        note: `BLS reports ${seed.employment.toLocaleString("en-US")} employed degree holders in this 2023 ACS field estimate; this is a population estimate, not the survey sample size.`,
      },
      employers: [],
      occupations: seed.occupations,
      source: {
        label: `U.S. BLS Field of Degree: ${seed.field}, 2023`,
        url: `https://www.bls.gov/ooh/field-of-degree/${seed.slug}-field-of-degree.htm`,
        reviewedOn: "2026-08-30",
      },
      caveat: `${NATIONAL_CAVEAT} “${seed.field}” is the closest available BLS field for the broader ${seed.family} family and may not represent every program in it.`,
    },
  ]),
) as unknown as Record<Family, CareerOutcome>;

export function getCareerOutcome({
  schoolId,
  majorId,
  family,
}: CareerOutcomeRequest): CareerOutcome {
  return (
    schoolMajorCareerOutcomes.find(
      (outcome) => outcome.schoolId === schoolId && outcome.majorId === majorId,
    ) ?? nationalFamilyCareerOutcomes[family]
  );
}
