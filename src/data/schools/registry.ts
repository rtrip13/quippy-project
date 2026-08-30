import { genericBroadFieldCatalog } from "./genericCatalog";
import { spelmanStarterCatalog } from "./spelman/catalog";
import {
  berkeleyStarterCatalog,
  floridaStarterCatalog,
  harvardStarterCatalog,
  howardStarterCatalog,
  mitStarterCatalog,
  nyuStarterCatalog,
  stanfordStarterCatalog,
  uclaStarterCatalog,
  utAustinStarterCatalog,
  washingtonStarterCatalog,
} from "./starterCatalogs";
import type { SchoolCatalog, SchoolData } from "./types";
import { umich } from "./umich/school";

type GenericSchoolInput = Omit<SchoolData, "catalog" | "dataDepth">;

const genericSchool = (school: GenericSchoolInput): SchoolData => ({
  ...school,
  dataDepth: "generic",
  catalog: genericBroadFieldCatalog,
});

const starterSchool = (
  school: GenericSchoolInput,
  catalog: SchoolCatalog,
): SchoolData => ({ ...school, dataDepth: "starter", catalog });

const berkeley = starterSchool(
  {
    id: "uc-berkeley",
    name: "University of California, Berkeley",
    shortName: "UC Berkeley",
    location: "Berkeley, CA",
    academicUnits: [
      "Haas School of Business",
      "College of Chemistry",
      "College of Computing, Data Science, and Society",
      "College of Engineering",
      "College of Environmental Design",
      "College of Letters & Science",
      "Rausser College of Natural Resources",
    ],
    officialSources: [
      {
        label: "UC Berkeley schools and colleges",
        url: "https://www.berkeley.edu/academics/schools-colleges/",
      },
      {
        label: "UC Berkeley undergraduate degree programs",
        url: "https://guide.berkeley.edu/undergraduate/degree-programs/",
      },
    ],
  },
  berkeleyStarterCatalog,
);

const ucla = starterSchool(
  {
    id: "ucla",
    name: "University of California, Los Angeles",
    shortName: "UCLA",
    location: "Los Angeles, CA",
    academicUnits: [
      "The College",
      "School of the Arts & Architecture",
      "School of Education & Information Studies",
      "Samueli School of Engineering",
      "Herb Alpert School of Music",
      "Joe C. Wen School of Nursing",
      "Luskin School of Public Affairs",
      "Fielding School of Public Health",
      "School of Theater, Film and Television",
    ],
    officialSources: [
      {
        label: "UCLA college and schools",
        url: "https://www.ucla.edu/academics/college-and-schools",
      },
      {
        label: "UCLA majors",
        url: "https://admission.ucla.edu/apply/majors",
      },
    ],
  },
  uclaStarterCatalog,
);

const utAustin = starterSchool(
  {
    id: "ut-austin",
    name: "The University of Texas at Austin",
    shortName: "UT Austin",
    location: "Austin, TX",
    academicUnits: [
      "Cockrell School of Engineering",
      "College of Education",
      "College of Fine Arts",
      "College of Liberal Arts",
      "College of Natural Sciences",
      "Jackson School of Geosciences",
      "McCombs School of Business",
      "Moody College of Communication",
      "School of Architecture",
      "School of Nursing",
      "Steve Hicks School of Social Work",
    ],
    officialSources: [
      {
        label: "UT Austin colleges and schools",
        url: "https://www.utexas.edu/academics/colleges-schools",
      },
      {
        label: "UT Austin undergraduate majors",
        url: "https://admissions.utexas.edu/explore/academics/majors/",
      },
    ],
  },
  utAustinStarterCatalog,
);

const florida = starterSchool(
  {
    id: "ufl",
    name: "University of Florida",
    shortName: "Florida",
    location: "Gainesville, FL",
    academicUnits: [
      "College of Agricultural and Life Sciences",
      "College of the Arts",
      "Warrington College of Business",
      "College of Design, Construction and Planning",
      "College of Education",
      "Herbert Wertheim College of Engineering",
      "College of Health and Human Performance",
      "College of Journalism and Communications",
      "College of Liberal Arts and Sciences",
      "College of Nursing",
      "College of Public Health and Health Professions",
    ],
    officialSources: [
      { label: "UF colleges", url: "https://www.ufl.edu/academics/colleges/" },
      {
        label: "UF undergraduate colleges and schools",
        url: "https://catalog.ufl.edu/UGRD/colleges-schools/",
      },
    ],
  },
  floridaStarterCatalog,
);

const washington = starterSchool(
  {
    id: "uw-seattle",
    name: "University of Washington",
    shortName: "UW Seattle",
    location: "Seattle, WA",
    academicUnits: [
      "College of Arts & Sciences",
      "College of Built Environments",
      "Michael G. Foster School of Business",
      "College of Education",
      "College of Engineering",
      "College of the Environment",
      "The Information School",
      "School of Nursing",
      "School of Public Health",
    ],
    officialSources: [
      {
        label: "UW colleges and schools",
        url: "https://www.washington.edu/about/academics/",
      },
      {
        label: "UW majors",
        url: "https://admit.washington.edu/academics/majors/",
      },
    ],
  },
  washingtonStarterCatalog,
);

const stanford = starterSchool(
  {
    id: "stanford",
    name: "Stanford University",
    shortName: "Stanford",
    location: "Stanford, CA",
    academicUnits: [
      "Graduate School of Business",
      "Doerr School of Sustainability",
      "Graduate School of Education",
      "School of Engineering",
      "School of Humanities and Sciences",
      "Stanford Law School",
      "School of Medicine",
    ],
    officialSources: [
      {
        label: "Stanford’s seven schools",
        url: "https://www.stanford.edu/academics/schools",
      },
      {
        label: "Stanford undergraduate majors",
        url: "https://majors.stanford.edu/majors",
      },
    ],
  },
  stanfordStarterCatalog,
);

const harvard = starterSchool(
  {
    id: "harvard",
    name: "Harvard University",
    shortName: "Harvard",
    location: "Cambridge, MA",
    academicUnits: [
      "Harvard College",
      "Harvard John A. Paulson School of Engineering and Applied Sciences",
      "Harvard Business School",
      "Harvard Graduate School of Design",
      "Harvard Graduate School of Education",
      "Harvard Kennedy School",
      "Harvard Law School",
      "Harvard Medical School",
      "Harvard T.H. Chan School of Public Health",
    ],
    officialSources: [
      {
        label: "Harvard schools",
        url: "https://www.harvard.edu/academics/schools/",
      },
      {
        label: "Harvard College concentrations",
        url: "https://college.harvard.edu/academics/liberal-arts-sciences/concentrations",
      },
    ],
  },
  harvardStarterCatalog,
);

const mit = starterSchool(
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    shortName: "MIT",
    location: "Cambridge, MA",
    academicUnits: [
      "School of Architecture and Planning",
      "School of Engineering",
      "School of Humanities, Arts, and Social Sciences",
      "MIT Sloan School of Management",
      "School of Science",
      "MIT Schwarzman College of Computing",
    ],
    officialSources: [
      {
        label: "MIT schools and departments",
        url: "https://www.mit.edu/education/schools-and-departments/",
      },
      {
        label: "MIT undergraduate degree charts",
        url: "https://catalog.mit.edu/degree-charts/",
      },
    ],
  },
  mitStarterCatalog,
);

const nyu = starterSchool(
  {
    id: "nyu",
    name: "New York University",
    shortName: "NYU",
    location: "New York, NY",
    academicUnits: [
      "College of Arts and Science",
      "Liberal Studies",
      "Gallatin School of Individualized Study",
      "Leonard N. Stern School of Business",
      "Rory Meyers College of Nursing",
      "School of Global Public Health",
      "Silver School of Social Work",
      "Steinhardt School of Culture, Education, and Human Development",
      "Tandon School of Engineering",
      "Tisch School of the Arts",
    ],
    officialSources: [
      {
        label: "NYU schools and locations",
        url: "https://www.nyu.edu/academics/academic-programs.html",
      },
      {
        label: "NYU undergraduate majors and programs",
        url: "https://www.nyu.edu/admissions/undergraduate-admissions/academics/majors-and-programs.html",
      },
    ],
  },
  nyuStarterCatalog,
);

const howard = starterSchool(
  {
    id: "howard",
    name: "Howard University",
    shortName: "Howard",
    location: "Washington, DC",
    academicUnits: [
      "Chadwick A. Boseman College of Fine Arts",
      "College of Arts and Sciences",
      "College of Engineering and Architecture",
      "College of Nursing and Allied Health Sciences",
      "School of Business",
      "School of Communications",
      "School of Education",
      "School of Social Work",
    ],
    officialSources: [
      { label: "Howard academics", url: "https://howard.edu/academics" },
      {
        label: "Howard undergraduate programs",
        url: "https://admission.howard.edu/undergraduate/academic-programs",
      },
    ],
  },
  howardStarterCatalog,
);

const spelman: SchoolData = {
  id: "spelman",
  name: "Spelman College",
  shortName: "Spelman",
  location: "Atlanta, GA",
  academicUnits: [
    "Division for the Arts",
    "Division for the Humanities",
    "Division of Natural Science and Mathematics",
    "Division of Social Sciences and Education",
  ],
  dataDepth: "starter",
  catalog: spelmanStarterCatalog,
  officialSources: [
    {
      label: "Spelman academic divisions",
      url: "https://www.spelman.edu/provost-office/academic-divisions.html",
    },
    { label: "About Spelman", url: "https://www.spelman.edu/about/" },
  ],
};

export const otherUniversity: SchoolData = genericSchool({
  id: "other",
  name: "Other university",
  shortName: "Other university",
  location: "Campus not yet selected",
  academicUnits: ["Academic structure varies by university"],
  officialSources: [],
});

/** Searchable options; the honest fallback is always last. */
export const schoolRegistry: readonly SchoolData[] = [
  umich,
  berkeley,
  ucla,
  utAustin,
  florida,
  washington,
  stanford,
  harvard,
  mit,
  nyu,
  howard,
  spelman,
  otherUniversity,
];

export const schoolsById: Readonly<Record<string, SchoolData>> =
  Object.fromEntries(schoolRegistry.map((school) => [school.id, school]));

export const getSchoolData = (id: string | null | undefined): SchoolData =>
  (id && schoolsById[id]) || otherUniversity;
