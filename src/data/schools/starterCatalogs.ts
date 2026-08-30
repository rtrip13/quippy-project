import type { Family, Major, SchoolCatalog } from "./types";

type ProgramRow = readonly [name: string, school: string, family: Family];

const toId = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const starterCatalog = (
  schoolId: string,
  sourceLabel: string,
  rows: readonly ProgramRow[],
): SchoolCatalog => ({
  depth: "starter",
  programs: rows.map(([name, school, family]): Major => ({
    id: `${schoolId}-${toId(name)}`,
    name,
    school,
    family,
    access: "school_specific",
  })),
  note: `Representative undergraduate programs from ${sourceLabel}; verify the current catalog, requirements, and admissions path with the university.`,
});

export const berkeleyStarterCatalog = starterCatalog(
  "uc-berkeley",
  "UC Berkeley's official undergraduate degree list",
  [
    [
      "Computer Science",
      "College of Computing, Data Science, and Society",
      "Computing & Data",
    ],
    [
      "Data Science",
      "College of Computing, Data Science, and Society",
      "Computing & Data",
    ],
    [
      "Mechanical Engineering",
      "College of Engineering",
      "Engineering & Built Environment",
    ],
    ["Chemistry", "College of Chemistry", "Natural & Physical Sciences"],
    [
      "Molecular Environmental Biology",
      "Rausser College of Natural Resources",
      "Natural & Physical Sciences",
    ],
    [
      "Business Administration",
      "Haas School of Business",
      "Business & Economics",
    ],
    ["Economics", "College of Letters & Science", "Business & Economics"],
    [
      "Psychology",
      "College of Letters & Science",
      "Social & Behavioral Sciences",
    ],
    ["English", "College of Letters & Science", "Humanities & Languages"],
    [
      "Architecture",
      "College of Environmental Design",
      "Arts, Design & Performance",
    ],
  ],
);

export const uclaStarterCatalog = starterCatalog(
  "ucla",
  "UCLA's official undergraduate majors list",
  [
    ["Computer Science", "Samueli School of Engineering", "Computing & Data"],
    [
      "Mechanical Engineering",
      "Samueli School of Engineering",
      "Engineering & Built Environment",
    ],
    ["Biology", "The College", "Natural & Physical Sciences"],
    ["Chemistry", "The College", "Natural & Physical Sciences"],
    ["Nursing", "School of Nursing", "Health & Human Services"],
    ["Economics", "The College", "Business & Economics"],
    ["Psychology", "The College", "Social & Behavioral Sciences"],
    ["English", "The College", "Humanities & Languages"],
    [
      "Design Media Arts",
      "School of the Arts & Architecture",
      "Arts, Design & Performance",
    ],
    ["Communication", "The College", "Communication & Media"],
  ],
);

export const utAustinStarterCatalog = starterCatalog(
  "ut-austin",
  "UT Austin's official undergraduate majors list",
  [
    ["Computer Science", "College of Natural Sciences", "Computing & Data"],
    [
      "Aerospace Engineering",
      "Cockrell School of Engineering",
      "Engineering & Built Environment",
    ],
    ["Biology", "College of Natural Sciences", "Natural & Physical Sciences"],
    ["Nursing", "School of Nursing", "Health & Human Services"],
    ["Finance", "McCombs School of Business", "Business & Economics"],
    ["Economics", "College of Liberal Arts", "Business & Economics"],
    ["Psychology", "College of Liberal Arts", "Social & Behavioral Sciences"],
    [
      "Government",
      "College of Liberal Arts",
      "Education, Public Service & Policy",
    ],
    ["Journalism", "Moody College of Communication", "Communication & Media"],
    ["Studio Art", "College of Fine Arts", "Arts, Design & Performance"],
    ["Architecture", "School of Architecture", "Arts, Design & Performance"],
  ],
);

export const floridaStarterCatalog = starterCatalog(
  "ufl",
  "UF's official undergraduate majors catalog",
  [
    [
      "Computer Science",
      "College of Liberal Arts and Sciences",
      "Computing & Data",
    ],
    [
      "Mechanical Engineering",
      "Herbert Wertheim College of Engineering",
      "Engineering & Built Environment",
    ],
    [
      "Biology",
      "College of Liberal Arts and Sciences",
      "Natural & Physical Sciences",
    ],
    ["Nursing", "College of Nursing", "Health & Human Services"],
    ["Finance", "Warrington College of Business", "Business & Economics"],
    [
      "Economics",
      "College of Liberal Arts and Sciences",
      "Business & Economics",
    ],
    [
      "Psychology",
      "College of Liberal Arts and Sciences",
      "Social & Behavioral Sciences",
    ],
    [
      "Political Science",
      "College of Liberal Arts and Sciences",
      "Education, Public Service & Policy",
    ],
    [
      "Journalism",
      "College of Journalism and Communications",
      "Communication & Media",
    ],
    [
      "Architecture",
      "College of Design, Construction and Planning",
      "Arts, Design & Performance",
    ],
  ],
);

export const washingtonStarterCatalog = starterCatalog(
  "uw-seattle",
  "UW's official undergraduate programs list",
  [
    [
      "Computer Science",
      "Paul G. Allen School of Computer Science & Engineering",
      "Computing & Data",
    ],
    ["Informatics", "The Information School", "Computing & Data"],
    [
      "Mechanical Engineering",
      "College of Engineering",
      "Engineering & Built Environment",
    ],
    ["Biology", "College of Arts & Sciences", "Natural & Physical Sciences"],
    ["Nursing", "School of Nursing", "Health & Human Services"],
    [
      "Business Administration",
      "Michael G. Foster School of Business",
      "Business & Economics",
    ],
    ["Economics", "College of Arts & Sciences", "Business & Economics"],
    [
      "Psychology",
      "College of Arts & Sciences",
      "Social & Behavioral Sciences",
    ],
    [
      "Political Science",
      "College of Arts & Sciences",
      "Education, Public Service & Policy",
    ],
    ["English", "College of Arts & Sciences", "Humanities & Languages"],
    [
      "Architecture",
      "College of Built Environments",
      "Arts, Design & Performance",
    ],
  ],
);

export const stanfordStarterCatalog = starterCatalog(
  "stanford",
  "Stanford's official undergraduate majors list",
  [
    ["Computer Science", "School of Engineering", "Computing & Data"],
    ["Data Science", "School of Humanities and Sciences", "Computing & Data"],
    [
      "Mechanical Engineering",
      "School of Engineering",
      "Engineering & Built Environment",
    ],
    [
      "Biology",
      "School of Humanities and Sciences",
      "Natural & Physical Sciences",
    ],
    [
      "Chemistry",
      "School of Humanities and Sciences",
      "Natural & Physical Sciences",
    ],
    ["Economics", "School of Humanities and Sciences", "Business & Economics"],
    [
      "Psychology",
      "School of Humanities and Sciences",
      "Social & Behavioral Sciences",
    ],
    [
      "Political Science",
      "School of Humanities and Sciences",
      "Education, Public Service & Policy",
    ],
    ["English", "School of Humanities and Sciences", "Humanities & Languages"],
    [
      "Art Practice",
      "School of Humanities and Sciences",
      "Arts, Design & Performance",
    ],
    [
      "Earth Systems",
      "Doerr School of Sustainability",
      "Interdisciplinary & Individualized",
    ],
  ],
);

export const harvardStarterCatalog = starterCatalog(
  "harvard",
  "Harvard College's official concentrations list",
  [
    ["Computer Science", "Harvard College", "Computing & Data"],
    ["Applied Mathematics", "Harvard College", "Computing & Data"],
    [
      "Biomedical Engineering",
      "Harvard College",
      "Engineering & Built Environment",
    ],
    ["Chemistry", "Harvard College", "Natural & Physical Sciences"],
    ["Economics", "Harvard College", "Business & Economics"],
    ["Psychology", "Harvard College", "Social & Behavioral Sciences"],
    ["Government", "Harvard College", "Education, Public Service & Policy"],
    ["History", "Harvard College", "Humanities & Languages"],
    ["English", "Harvard College", "Humanities & Languages"],
    [
      "Art, Film, and Visual Studies",
      "Harvard College",
      "Arts, Design & Performance",
    ],
    ["Social Studies", "Harvard College", "Interdisciplinary & Individualized"],
  ],
);

export const mitStarterCatalog = starterCatalog(
  "mit",
  "MIT's official undergraduate programs list",
  [
    [
      "Electrical Engineering and Computer Science",
      "MIT Schwarzman College of Computing",
      "Computing & Data",
    ],
    [
      "Mechanical Engineering",
      "School of Engineering",
      "Engineering & Built Environment",
    ],
    ["Biology", "School of Science", "Natural & Physical Sciences"],
    ["Chemistry", "School of Science", "Natural & Physical Sciences"],
    [
      "Economics",
      "School of Humanities, Arts, and Social Sciences",
      "Business & Economics",
    ],
    [
      "Brain and Cognitive Sciences",
      "School of Science",
      "Social & Behavioral Sciences",
    ],
    [
      "Political Science",
      "School of Humanities, Arts, and Social Sciences",
      "Education, Public Service & Policy",
    ],
    [
      "Comparative Media Studies",
      "School of Humanities, Arts, and Social Sciences",
      "Communication & Media",
    ],
    [
      "Architecture",
      "School of Architecture and Planning",
      "Arts, Design & Performance",
    ],
    [
      "Art and Design",
      "School of Architecture and Planning",
      "Arts, Design & Performance",
    ],
    [
      "Urban Studies and Planning",
      "School of Architecture and Planning",
      "Interdisciplinary & Individualized",
    ],
  ],
);

export const nyuStarterCatalog = starterCatalog(
  "nyu",
  "NYU's official undergraduate majors and programs directory",
  [
    ["Computer Science", "College of Arts and Science", "Computing & Data"],
    [
      "Mechanical Engineering",
      "Tandon School of Engineering",
      "Engineering & Built Environment",
    ],
    ["Biology", "College of Arts and Science", "Natural & Physical Sciences"],
    ["Nursing", "Rory Meyers College of Nursing", "Health & Human Services"],
    ["Business", "Leonard N. Stern School of Business", "Business & Economics"],
    ["Economics", "College of Arts and Science", "Business & Economics"],
    [
      "Psychology",
      "College of Arts and Science",
      "Social & Behavioral Sciences",
    ],
    [
      "Politics",
      "College of Arts and Science",
      "Education, Public Service & Policy",
    ],
    ["English", "College of Arts and Science", "Humanities & Languages"],
    [
      "Film and Television",
      "Tisch School of the Arts",
      "Arts, Design & Performance",
    ],
    [
      "Media, Culture, and Communication",
      "Steinhardt School of Culture, Education, and Human Development",
      "Communication & Media",
    ],
    [
      "Global Public Health",
      "School of Global Public Health",
      "Interdisciplinary & Individualized",
    ],
  ],
);

export const howardStarterCatalog = starterCatalog(
  "howard",
  "Howard's official undergraduate academic programs list",
  [
    [
      "Computer Science",
      "College of Engineering and Architecture",
      "Computing & Data",
    ],
    [
      "Mechanical Engineering",
      "College of Engineering and Architecture",
      "Engineering & Built Environment",
    ],
    ["Biology", "College of Arts and Sciences", "Natural & Physical Sciences"],
    [
      "Nursing",
      "College of Nursing and Allied Health Sciences",
      "Health & Human Services",
    ],
    ["Finance", "School of Business", "Business & Economics"],
    ["Economics", "College of Arts and Sciences", "Business & Economics"],
    [
      "Psychology",
      "College of Arts and Sciences",
      "Social & Behavioral Sciences",
    ],
    [
      "Political Science",
      "College of Arts and Sciences",
      "Education, Public Service & Policy",
    ],
    ["Journalism", "School of Communications", "Communication & Media"],
    [
      "Art",
      "Chadwick A. Boseman College of Fine Arts",
      "Arts, Design & Performance",
    ],
    [
      "Elementary Education",
      "School of Education",
      "Education, Public Service & Policy",
    ],
    ["Social Work", "School of Social Work", "Health & Human Services"],
  ],
);
