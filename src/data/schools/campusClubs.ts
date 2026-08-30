import type { ClubProfile } from "../../domain";

export type CampusMembershipAccess =
  | "open"
  | "application-or-selection"
  | "audition"
  | "check-current-requirements";
export type CampusId =
  "stanford" | "harvard" | "mit" | "nyu" | "howard" | "spelman";

export type CampusClub = ClubProfile & {
  campusId: CampusId;
  categories: readonly string[];
  description: string;
  clubUrl: string;
  directoryUrl: string;
  membershipAccess: CampusMembershipAccess;
  commitment: "light" | "moderate" | "substantial" | "variable";
  whyFieldwork: string;
};

type SignalPreset =
  "build" | "investigate" | "media" | "perform" | "serve" | "strategize";
const signals: Record<
  SignalPreset,
  Pick<ClubProfile, "workModes" | "activityModes" | "environment">
> = {
  build: {
    workModes: {
      analyze: 0.7,
      build: 1,
      create: 0.8,
      investigate: 0.7,
      organize: 0.5,
    },
    activityModes: { design: 0.9, make: 1, research: 0.5, compete: 0.5 },
    environment: {
      collaborative: 0.9,
      handsOn: 1,
      structured: 0.7,
      deepFocus: 0.6,
    },
  },
  investigate: {
    workModes: { analyze: 0.9, investigate: 1, synthesize: 0.8, explain: 0.5 },
    activityModes: { research: 1, discuss: 0.6, teach: 0.4 },
    environment: {
      collaborative: 0.6,
      independent: 0.7,
      deepFocus: 0.9,
      structured: 0.5,
    },
  },
  media: {
    workModes: {
      create: 0.8,
      explain: 1,
      investigate: 0.8,
      organize: 0.6,
      synthesize: 0.8,
    },
    activityModes: { discuss: 0.7, design: 0.6, make: 0.5, research: 0.7 },
    environment: {
      collaborative: 0.8,
      publicFacing: 1,
      fastPaced: 0.8,
      structured: 0.6,
    },
  },
  perform: {
    workModes: { create: 1, explain: 0.7, organize: 0.5, synthesize: 0.5 },
    activityModes: { perform: 1, design: 0.7, make: 0.6, discuss: 0.5 },
    environment: {
      collaborative: 0.9,
      handsOn: 0.7,
      publicFacing: 1,
      fastPaced: 0.6,
    },
  },
  serve: {
    workModes: {
      serve: 1,
      explain: 0.7,
      organize: 0.8,
      persuade: 0.6,
      strategize: 0.5,
    },
    activityModes: { volunteer: 1, discuss: 0.7, teach: 0.6 },
    environment: {
      collaborative: 1,
      handsOn: 0.7,
      publicFacing: 0.8,
      structured: 0.6,
    },
  },
  strategize: {
    workModes: {
      analyze: 0.7,
      organize: 0.9,
      persuade: 0.9,
      strategize: 1,
      synthesize: 0.7,
    },
    activityModes: { compete: 0.7, discuss: 1, research: 0.6, teach: 0.4 },
    environment: {
      collaborative: 0.8,
      publicFacing: 0.9,
      fastPaced: 0.7,
      structured: 0.7,
    },
  },
};

const availability: Record<
  CampusMembershipAccess,
  ClubProfile["availability"]
> = {
  open: "open",
  "application-or-selection": "application",
  audition: "audition",
  "check-current-requirements": "unknown",
};
type ClubInput = Omit<
  CampusClub,
  "availability" | "workModes" | "activityModes" | "environment"
> & { profile: SignalPreset };
const club = ({ profile, ...input }: ClubInput): CampusClub => ({
  ...input,
  ...signals[profile],
  availability: availability[input.membershipAccess],
});

const STANFORD = "https://cardinalengage.stanford.edu/club_signup?view=all";
const HARVARD = "https://dso.college.harvard.edu/list-student-organizations";
const MIT = "https://engage.mit.edu/club_signup?view=all";
const NYU = "https://engage.nyu.edu/organizations";
const HOWARD = "https://howard.campuslabs.com/engage/organizations";
const SPELMAN = "https://spelready.spelman.edu/club_signup?view=all";

// Editorial signals describe likely participation work, never identity, aptitude, or belonging.
// Names and URLs were checked against official campus directories/pages on 2026-08-30.
export const stanfordClubs: readonly CampusClub[] = [
  club({
    id: "stanford-solar-car",
    campusId: "stanford",
    name: "Stanford Solar Car Project",
    categories: ["engineering", "sustainability", "competition"],
    description:
      "A student-run team that designs, builds, and races solar-powered vehicles.",
    clubUrl: "https://solarcar.stanford.edu/",
    directoryUrl: STANFORD,
    membershipAccess: "open",
    commitment: "substantial",
    profile: "build",
    whyFieldwork:
      "Try a build meeting to test whether long-cycle, multidisciplinary making holds your attention.",
  }),
  club({
    id: "stanford-robotics",
    campusId: "stanford",
    name: "Stanford Robotics Club",
    categories: ["robotics", "projects", "peer learning"],
    description:
      "A project community for hands-on robotics ranging from drones to submersibles.",
    clubUrl:
      "https://cardinalengage.stanford.edu/club_signup?category_tags=7031222&group_type=50783&view=all",
    directoryUrl: STANFORD,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "build",
    whyFieldwork:
      "Visit a project session and notice whether debugging physical systems feels energizing.",
  }),
  club({
    id: "stanford-sports-analytics",
    campusId: "stanford",
    name: "Stanford Sports Analytics Club",
    categories: ["data", "sports", "discussion"],
    description:
      "A group for sports-analysis discussion, projects, and career exploration.",
    clubUrl:
      "https://cardinalengage.stanford.edu/club_signup?category_tags=7031222&group_type=50783&view=all",
    directoryUrl: STANFORD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "investigate",
    whyFieldwork:
      "Join a project conversation to see whether evidence makes a familiar topic more interesting.",
  }),
  club({
    id: "stanford-daily",
    campusId: "stanford",
    name: "The Stanford Daily",
    categories: ["journalism", "media", "publishing"],
    description:
      "Stanford’s independent student newspaper and an outlet for reporting and production.",
    clubUrl: "https://stanforddaily.com/",
    directoryUrl: STANFORD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "media",
    whyFieldwork:
      "Pitch or shadow a story and test whether a real audience sharpens your curiosity.",
  }),
  club({
    id: "stanford-spoken-word",
    campusId: "stanford",
    name: "Stanford Spoken Word Collective",
    categories: ["writing", "performance", "community"],
    description:
      "A student arts group centered on spoken-word writing, sharing, and performance.",
    clubUrl: "https://arts.stanford.edu/for-students/student-groups/",
    directoryUrl: STANFORD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "perform",
    whyFieldwork:
      "Attend a sharing session and notice whether shaping language for a room feels alive.",
  }),
  club({
    id: "stanford-seeds",
    campusId: "stanford",
    name: "Stanford SEEDS",
    categories: ["ecology", "education", "inclusion"],
    description:
      "A group expanding ecology awareness and pathways for underrepresented students.",
    clubUrl:
      "https://sustainable.stanford.edu/tools/student-sustainability-groups-directory/",
    directoryUrl: STANFORD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "serve",
    whyFieldwork:
      "Try a field or outreach event and compare learning ecology with helping others access it.",
  }),
];

export const harvardClubs: readonly CampusClub[] = [
  club({
    id: "harvard-robotics",
    campusId: "harvard",
    name: "Harvard Undergraduate Robotics Club",
    categories: ["robotics", "projects", "engineering"],
    description:
      "A SEAS-affiliated community for robotics projects and technical leadership.",
    clubUrl: "https://seas.harvard.edu/robotics/harvard-robotics-clubs",
    directoryUrl: HARVARD,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "build",
    whyFieldwork:
      "Observe a project session and test your patience for iterative physical and software work.",
  }),
  club({
    id: "harvard-ewb",
    campusId: "harvard",
    name: "Harvard College Engineers Without Borders",
    categories: ["engineering", "service", "projects"],
    description:
      "A project-focused SEAS organization applying engineering in community-centered work.",
    clubUrl:
      "https://seas.harvard.edu/office-student-organizations/find-seas-affiliated-student-organization",
    directoryUrl: HARVARD,
    membershipAccess: "check-current-requirements",
    commitment: "substantial",
    profile: "serve",
    whyFieldwork:
      "Notice whether technical constraints plus community needs motivate you.",
  }),
  club({
    id: "harvard-sports-analytics",
    campusId: "harvard",
    name: "Harvard Sports Analysis Collective",
    categories: ["data", "sports", "projects"],
    description:
      "A SEAS-affiliated group for analytical sports questions and projects.",
    clubUrl:
      "https://seas.harvard.edu/office-student-organizations/find-seas-affiliated-student-organization",
    directoryUrl: HARVARD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "investigate",
    whyFieldwork:
      "Try one analysis and see whether turning debate into a testable question feels satisfying.",
  }),
  club({
    id: "harvard-computer-society",
    campusId: "harvard",
    name: "Harvard Computer Society",
    categories: ["computing", "community", "projects"],
    description:
      "A student computing community recognized among Harvard’s SEAS organizations.",
    clubUrl:
      "https://seas.harvard.edu/office-student-organizations/find-seas-affiliated-student-organization",
    directoryUrl: HARVARD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "build",
    whyFieldwork:
      "Compare a collaborative computing event with how solo technical work feels.",
  }),
  club({
    id: "harvard-pbha",
    campusId: "harvard",
    name: "Phillips Brooks House Association",
    categories: ["public service", "mentoring", "community"],
    description:
      "A student-led public-service organization coordinating programs across Greater Boston.",
    clubUrl:
      "https://publicservice.fas.harvard.edu/student-organization-finder",
    directoryUrl: HARVARD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "serve",
    whyFieldwork:
      "Try one sustained service shift and notice whether relationship-centered work gives you energy.",
  }),
  club({
    id: "harvard-band",
    campusId: "harvard",
    name: "Harvard University Band",
    categories: ["music", "performance", "traditions"],
    description:
      "A student musical ensemble offering collaborative performance experiences.",
    clubUrl:
      "https://college.harvard.edu/admissions/why-harvard/student-activities",
    directoryUrl: HARVARD,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "perform",
    whyFieldwork:
      "Attend a rehearsal and test whether repeated practice becomes rewarding in a group.",
  }),
];

export const mitClubs: readonly CampusClub[] = [
  club({
    id: "mit-techx",
    campusId: "mit",
    name: "TechX",
    categories: ["technology", "events", "community"],
    description:
      "A student organization promoting knowledge of technology and the technology industry.",
    clubUrl:
      "https://engage.mit.edu/club_signup?category_tags=6788249&group_type=",
    directoryUrl: MIT,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "strategize",
    whyFieldwork:
      "Help with one event and see whether creating the setting for others to learn suits you.",
  }),
  club({
    id: "mit-the-tech",
    campusId: "mit",
    name: "The Tech",
    categories: ["journalism", "media", "publishing"],
    description:
      "MIT’s student newspaper, staffed by volunteer writers, editors, photographers, and business teams.",
    clubUrl: "https://facts.mit.edu/surprise/the-tech/",
    directoryUrl: MIT,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "media",
    whyFieldwork:
      "Try a small reporting or production task and notice how a deadline changes your focus.",
  }),
  club({
    id: "mit-rune",
    campusId: "mit",
    name: "Rune",
    categories: ["literary arts", "publishing", "design"],
    description:
      "A creative publication offering the MIT community an outlet to showcase artistic work.",
    clubUrl: "https://engage.mit.edu/club_signup?category_tags=6788246",
    directoryUrl: MIT,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "media",
    whyFieldwork:
      "Submit or help edit a piece and test whether curation is as engaging as creation.",
  }),
  club({
    id: "mit-wmbr",
    campusId: "mit",
    name: "WMBR",
    categories: ["radio", "music", "media"],
    description: "MIT’s student-run, commercial-free radio station.",
    clubUrl: "https://catalog.mit.edu/mit/campus-life/media/",
    directoryUrl: MIT,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "perform",
    whyFieldwork:
      "Explore a show or production role and see whether shaping a live audience experience clicks.",
  }),
  club({
    id: "mit-film-video",
    campusId: "mit",
    name: "MIT Student Film & Video Production Club",
    categories: ["film", "production", "storytelling"],
    description:
      "A student club for learning and practicing film and television production.",
    clubUrl: "https://catalog.mit.edu/mit/campus-life/media/",
    directoryUrl: MIT,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "perform",
    whyFieldwork:
      "Join a production task and notice whether coordinating creative and technical details feels worthwhile.",
  }),
  club({
    id: "mit-science-club-for-girls",
    campusId: "mit",
    name: "Science Club for Girls",
    categories: ["science", "education", "service"],
    description:
      "A community-service option highlighted by MIT for students interested in science outreach.",
    clubUrl:
      "https://studentlife.mit.edu/campus-communities/student-activities/",
    directoryUrl: MIT,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "serve",
    whyFieldwork:
      "Try one outreach activity and see whether explaining science deepens your own interest.",
  }),
];

export const nyuClubs: readonly CampusClub[] = [
  club({
    id: "nyu-robotics",
    campusId: "nyu",
    name: "Robotics Club at New York University",
    categories: ["robotics", "projects", "competition"],
    description:
      "A multidisciplinary group for robotics seminars, building sessions, and competitions.",
    clubUrl: "https://engage.nyu.edu/organization/robotics-club",
    directoryUrl: NYU,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "build",
    whyFieldwork:
      "Join a build session and test whether learning by debugging with peers sustains you.",
  }),
  club({
    id: "nyu-fine-arts-society",
    campusId: "nyu",
    name: "Fine Arts Society",
    categories: ["visual arts", "museums", "discussion"],
    description:
      "An all-NYU community exploring visual culture through visits, talks, screenings, and discussion.",
    clubUrl: "https://engage.nyu.edu/organization/fine-arts-society",
    directoryUrl: NYU,
    membershipAccess: "open",
    commitment: "variable",
    profile: "investigate",
    whyFieldwork:
      "Attend a gallery visit and notice whether interpreting visual choices feels absorbing.",
  }),
  club({
    id: "nyu-cas-council",
    campusId: "nyu",
    name: "CAS Student Council",
    categories: ["student government", "advocacy", "events"],
    description:
      "The elected College of Arts and Science body for student advocacy and programming.",
    clubUrl: "https://engage.nyu.edu/organization/cas-student-council",
    directoryUrl: NYU,
    membershipAccess: "application-or-selection",
    commitment: "substantial",
    profile: "strategize",
    whyFieldwork:
      "Observe a meeting and test whether representing competing needs feels energizing.",
  }),
  club({
    id: "nyu-poly-programming",
    campusId: "nyu",
    name: "Poly Programming Club",
    categories: ["computing", "competition", "peer learning"],
    description:
      "NYU Tandon’s competitive programming club, with beginner pathways and team competitions.",
    clubUrl:
      "https://engineering.nyu.edu/life-tandon/student-life/student-organizations/organizations-directory",
    directoryUrl: NYU,
    membershipAccess: "open",
    commitment: "variable",
    profile: "investigate",
    whyFieldwork:
      "Try a practice problem and notice whether constraints and rapid feedback pull you in.",
  }),
  club({
    id: "nyu-feminist-theatre",
    campusId: "nyu",
    name: "feminist theatre company",
    categories: ["theatre", "performance", "social justice"],
    description:
      "A Tisch student club creating collaborative feminist-driven performance work.",
    clubUrl: "https://engage.nyu.edu/organization/ftc",
    directoryUrl: NYU,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "perform",
    whyFieldwork:
      "Attend a creative session and test whether making art around ideas feels natural.",
  }),
  club({
    id: "nyu-community-service",
    campusId: "nyu",
    name: "NYU SPS Community Service Committee",
    categories: ["service", "events", "community"],
    description:
      "An SPS committee connecting students with recurring and one-day community service projects.",
    clubUrl:
      "https://www.sps.nyu.edu/experience/life-at-sps/student-community-engagement/student-organizations.html",
    directoryUrl: NYU,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "serve",
    whyFieldwork:
      "Try a service project and notice whether direct community work gives you momentum.",
  }),
];

export const howardClubs: readonly CampusClub[] = [
  club({
    id: "howard-husa",
    campusId: "howard",
    name: "Howard University Student Association",
    categories: ["student government", "advocacy", "leadership"],
    description:
      "Howard’s official representative voice for students and a platform for advocacy and programming.",
    clubUrl: "https://howard.campuslabs.com/engage/organization/husa",
    directoryUrl: HOWARD,
    membershipAccess: "application-or-selection",
    commitment: "substantial",
    profile: "strategize",
    whyFieldwork:
      "Observe an open meeting or program and test your appetite for public responsibility.",
  }),
  club({
    id: "howard-nsbe",
    campusId: "howard",
    name: "National Society of Black Engineers",
    categories: ["engineering", "professional", "service"],
    description:
      "A STEM community offering professional development, networking, service, and peer support.",
    clubUrl: "https://howard.campuslabs.com/ENGAGE/organization/nsbe",
    directoryUrl: HOWARD,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "serve",
    whyFieldwork:
      "Try a workshop or service activity and notice whether technical community-building fits.",
  }),
  club({
    id: "howard-film",
    campusId: "howard",
    name: "Howard University Film Organization",
    categories: ["film", "production", "storytelling"],
    description:
      "A filmmaking community spanning acting, directing, cinematography, writing, and production.",
    clubUrl:
      "https://howard.campuslabs.com/ENGAGE/organization/howarduniversityfilmorganization",
    directoryUrl: HOWARD,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "perform",
    whyFieldwork:
      "Join a workshop or screening discussion and compare making stories with interpreting them.",
  }),
  club({
    id: "howard-chess",
    campusId: "howard",
    name: "Howard University Chess Club",
    categories: ["games", "competition", "peer learning"],
    description:
      "An all-levels chess community offering lessons, tutoring, casual play, and tournaments.",
    clubUrl:
      "https://howard.campuslabs.com/engage/organization/howarduniversitychessclub",
    directoryUrl: HOWARD,
    membershipAccess: "open",
    commitment: "variable",
    profile: "strategize",
    whyFieldwork:
      "Play a coached game and notice whether strategic revision after mistakes feels rewarding.",
  }),
  club({
    id: "howard-rotaract",
    campusId: "howard",
    name: "Rotaract Club of Howard University",
    categories: ["service", "leadership", "community"],
    description:
      "A service organization working on local, regional, and international community needs.",
    clubUrl: "https://howard.campuslabs.com/engage/organization/rotaractclub",
    directoryUrl: HOWARD,
    membershipAccess: "open",
    commitment: "variable",
    profile: "serve",
    whyFieldwork:
      "Try one project and notice whether organizing around a concrete need motivates you.",
  }),
  club({
    id: "howard-elite-models",
    campusId: "howard",
    name: "HU Elite Models",
    categories: ["fashion", "performance", "mentoring"],
    description:
      "A performance and service organization focused on expression, confidence, and community impact.",
    clubUrl: "https://howard.campuslabs.com/engage/organization/elitemodels",
    directoryUrl: HOWARD,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "perform",
    whyFieldwork:
      "Attend an event and test whether expressive, audience-facing work fits.",
  }),
];

export const spelmanClubs: readonly CampusClub[] = [
  club({
    id: "spelman-debate",
    campusId: "spelman",
    name: "Spelman College Speech and Debate Team",
    categories: ["speech", "debate", "competition"],
    description:
      "A registered academic organization centered on speech and debate.",
    clubUrl: SPELMAN,
    directoryUrl: SPELMAN,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "strategize",
    whyFieldwork:
      "Observe a practice and test whether building and defending an argument energizes you.",
  }),
  club({
    id: "spelman-dance",
    campusId: "spelman",
    name: "Spelman Dance Student Association",
    categories: ["dance", "performance", "community"],
    description:
      "A registered academic organization supporting Spelman’s student dance community.",
    clubUrl: SPELMAN,
    directoryUrl: SPELMAN,
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    profile: "perform",
    whyFieldwork:
      "Try a rehearsal or event and notice how embodied repetition affects your energy.",
  }),
  club({
    id: "spelman-film-journalism",
    campusId: "spelman",
    name: "Spelman Film and Journalism Association",
    categories: ["film", "journalism", "media"],
    description:
      "A registered organization connecting film, journalism, and media-making interests.",
    clubUrl: SPELMAN,
    directoryUrl: SPELMAN,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "media",
    whyFieldwork:
      "Try one reporting or production task and see which side of storytelling pulls you in.",
  }),
  club({
    id: "spelman-acm",
    campusId: "spelman",
    name: "Spelman Chapter of ACM",
    categories: ["computing", "professional", "peer learning"],
    description:
      "Spelman’s registered student chapter of the Association for Computing Machinery.",
    clubUrl: SPELMAN,
    directoryUrl: SPELMAN,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "build",
    whyFieldwork:
      "Attend a technical activity and compare learning alongside peers with learning alone.",
  }),
  club({
    id: "spelman-esports",
    campusId: "spelman",
    name: "Spelman Esports Club",
    categories: ["gaming", "competition", "community"],
    description:
      "A registered interest and affinity organization for esports and gaming community.",
    clubUrl: SPELMAN,
    directoryUrl: SPELMAN,
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    profile: "strategize",
    whyFieldwork:
      "Notice whether team strategy or the competition itself is the stronger draw.",
  }),
  club({
    id: "spelman-ambassadors",
    campusId: "spelman",
    name: "Spelman College Student Ambassadors",
    categories: ["leadership", "communication", "campus service"],
    description:
      "A registered academic organization representing Spelman and supporting campus engagement.",
    clubUrl: SPELMAN,
    directoryUrl: SPELMAN,
    membershipAccess: "application-or-selection",
    commitment: "moderate",
    profile: "serve",
    whyFieldwork:
      "Test whether helping others navigate a community feels meaningful.",
  }),
];

export const clubsByCampusId: Readonly<
  Record<CampusId, readonly CampusClub[]>
> = {
  stanford: stanfordClubs,
  harvard: harvardClubs,
  mit: mitClubs,
  nyu: nyuClubs,
  howard: howardClubs,
  spelman: spelmanClubs,
};

export const privateAndHbcuClubs: readonly CampusClub[] =
  Object.values(clubsByCampusId).flat();
