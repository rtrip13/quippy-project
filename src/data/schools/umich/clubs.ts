import type { ClubProfile } from "../../../domain";

type ClubWorkMode =
  | "analyze"
  | "build"
  | "create"
  | "communicate"
  | "organize"
  | "support"
  | "investigate";

type ClubActivity =
  | "make"
  | "research"
  | "compete"
  | "perform"
  | "serve"
  | "discuss"
  | "publish"
  | "lead";

export type MembershipAccess =
  | "open"
  | "application-or-selection"
  | "audition"
  | "check-current-requirements";

type RawClubProfile = {
  id: string;
  name: string;
  categories: string[];
  description: string;
  maizePagesUrl: string;
  membershipAccess: MembershipAccess;
  workModes: Record<ClubWorkMode, number>;
  activities: Record<ClubActivity, number>;
  environment: {
    collaboration: number;
    publicFacing: number;
    handsOn: number;
    structure: number;
    commitment: "light" | "moderate" | "substantial" | "variable";
  };
  whyFieldwork: string;
};

export type UmichClub = ClubProfile & {
  categories: string[];
  description: string;
  maizePagesUrl: string;
  membershipAccess: MembershipAccess;
  commitment: RawClubProfile["environment"]["commitment"];
  whyFieldwork: string;
};

type Scores<T extends string> = Partial<Record<T, number>>;

const work = (scores: Scores<ClubWorkMode>): Record<ClubWorkMode, number> => ({
  analyze: 0,
  build: 0,
  create: 0,
  communicate: 0,
  organize: 0,
  support: 0,
  investigate: 0,
  ...scores,
});

const activity = (
  scores: Scores<ClubActivity>,
): Record<ClubActivity, number> => ({
  make: 0,
  research: 0,
  compete: 0,
  perform: 0,
  serve: 0,
  discuss: 0,
  publish: 0,
  lead: 0,
  ...scores,
});

const searchUrl = (name: string) =>
  `https://maizepages.umich.edu/organizations?query=${encodeURIComponent(name)}`;

// These profiles are editorial starting points for exploration, not claims about aptitude or
// belonging. Scores are normalized 0–1 estimates of what participation may feel like. Club
// structure and recruiting practices can change, so students should confirm them on Maize Pages.
const rawClubs: RawClubProfile[] = [
  {
    id: "solar-car",
    name: "University of Michigan Solar Car Team",
    categories: ["project team", "mobility", "sustainability"],
    description:
      "A multidisciplinary team that designs, builds, and races solar electric vehicles.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/umsolar",
    membershipAccess: "open",
    workModes: work({
      analyze: 0.8,
      build: 1,
      create: 0.7,
      communicate: 0.5,
      organize: 0.8,
      investigate: 0.7,
    }),
    activities: activity({
      make: 1,
      research: 0.7,
      compete: 0.8,
      publish: 0.3,
      lead: 0.7,
    }),
    environment: {
      collaboration: 1,
      publicFacing: 0.5,
      handsOn: 1,
      structure: 0.9,
      commitment: "substantial",
    },
    whyFieldwork:
      "Try a build session or team meeting to see whether a long, shared technical project gives you energy.",
  },
  {
    id: "michigan-hackers",
    name: "Michigan Hackers",
    categories: ["technology", "projects", "peer learning"],
    description:
      "A technology community where students learn together and contribute to project teams.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/michiganhackers",
    membershipAccess: "open",
    workModes: work({
      analyze: 0.7,
      build: 1,
      create: 0.8,
      communicate: 0.6,
      support: 0.5,
      investigate: 0.7,
    }),
    activities: activity({ make: 1, research: 0.5, discuss: 0.5, lead: 0.5 }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.3,
      handsOn: 0.8,
      structure: 0.6,
      commitment: "variable",
    },
    whyFieldwork:
      "Attend a hack night and notice whether learning by making with peers feels better than learning alone.",
  },
  {
    id: "michigan-data-science-team",
    name: "Michigan Data Science Team",
    categories: ["data", "technology", "projects"],
    description:
      "A student organization centered on practical data science, machine learning, and peer development.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/mdst",
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 1,
      build: 0.8,
      communicate: 0.5,
      organize: 0.4,
      investigate: 0.9,
    }),
    activities: activity({
      make: 0.8,
      research: 0.9,
      discuss: 0.5,
      publish: 0.3,
    }),
    environment: {
      collaboration: 0.8,
      publicFacing: 0.3,
      handsOn: 0.7,
      structure: 0.7,
      commitment: "moderate",
    },
    whyFieldwork:
      "Sit in on a project presentation and test whether turning messy information into an answer holds your attention.",
  },
  {
    id: "mracing",
    name: "MRacing Formula SAE",
    categories: ["project team", "mobility", "competition"],
    description:
      "A student team that designs, builds, and races a formula-style car.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/mracing",
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.8,
      build: 1,
      create: 0.6,
      organize: 0.8,
      investigate: 0.6,
    }),
    activities: activity({ make: 1, research: 0.5, compete: 1, lead: 0.7 }),
    environment: {
      collaboration: 1,
      publicFacing: 0.4,
      handsOn: 1,
      structure: 0.9,
      commitment: "substantial",
    },
    whyFieldwork:
      "Observe a design review or shop session and see whether precision under a team deadline feels motivating.",
  },
  {
    id: "autonomous-robotic-vehicle",
    name: "Autonomous Robotic Vehicle Team",
    categories: ["robotics", "project team", "technology"],
    description:
      "A project team that develops an autonomous ground vehicle across hardware and software subteams.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/arv",
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.9,
      build: 1,
      create: 0.7,
      organize: 0.6,
      investigate: 0.8,
    }),
    activities: activity({ make: 1, research: 0.7, compete: 0.8, lead: 0.5 }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.2,
      handsOn: 1,
      structure: 0.8,
      commitment: "substantial",
    },
    whyFieldwork:
      "Try an introductory meeting and notice whether debugging across physical and digital systems feels satisfying.",
  },
  {
    id: "mhacks",
    name: "MHacks",
    categories: ["technology", "events", "community building"],
    description:
      "The student team behind a hackathon community focused on making and sharing new projects.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/mhacks",
    membershipAccess: "application-or-selection",
    workModes: work({
      build: 0.7,
      create: 0.8,
      communicate: 0.8,
      organize: 1,
      support: 0.6,
    }),
    activities: activity({ make: 0.7, serve: 0.4, publish: 0.5, lead: 1 }),
    environment: {
      collaboration: 1,
      publicFacing: 0.9,
      handsOn: 0.7,
      structure: 0.8,
      commitment: "variable",
    },
    whyFieldwork:
      "Volunteer at or attend a build event to compare making a project with creating the conditions for others to make.",
  },
  {
    id: "wcbn",
    name: "WCBN FM",
    categories: ["radio", "music", "media"],
    description:
      "A student-run freeform radio station with broadcasting, production, design, engineering, and operations roles.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/wcbn",
    membershipAccess: "open",
    workModes: work({
      create: 0.9,
      communicate: 1,
      organize: 0.6,
      support: 0.4,
      investigate: 0.5,
    }),
    activities: activity({
      perform: 0.7,
      discuss: 0.8,
      publish: 1,
      make: 0.5,
      lead: 0.5,
    }),
    environment: {
      collaboration: 0.7,
      publicFacing: 1,
      handsOn: 0.6,
      structure: 0.5,
      commitment: "variable",
    },
    whyFieldwork:
      "Tour the station or try training and see whether shaping a live experience for an audience feels natural.",
  },
  {
    id: "dance-marathon",
    name: "Dance Marathon at the University of Michigan",
    categories: ["service", "health", "fundraising"],
    description:
      "A student-led organization supporting pediatric programs through service, relationships, awareness, and fundraising.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/DMUM",
    membershipAccess: "open",
    workModes: work({
      communicate: 0.8,
      organize: 0.9,
      support: 1,
      create: 0.5,
    }),
    activities: activity({ serve: 1, lead: 0.8, perform: 0.3, publish: 0.4 }),
    environment: {
      collaboration: 1,
      publicFacing: 0.9,
      handsOn: 0.6,
      structure: 0.8,
      commitment: "moderate",
    },
    whyFieldwork:
      "Join one service or planning activity and notice whether relationship-centered work sustains your attention.",
  },
  {
    id: "michigan-daily",
    name: "The Michigan Daily",
    categories: ["journalism", "media", "publishing"],
    description:
      "The independent student newspaper serving the University of Michigan community.",
    maizePagesUrl: searchUrl("The Michigan Daily"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.7,
      create: 0.8,
      communicate: 1,
      organize: 0.6,
      investigate: 1,
    }),
    activities: activity({
      research: 0.8,
      discuss: 0.7,
      publish: 1,
      make: 0.5,
      lead: 0.5,
    }),
    environment: {
      collaboration: 0.8,
      publicFacing: 1,
      handsOn: 0.5,
      structure: 0.8,
      commitment: "moderate",
    },
    whyFieldwork:
      "Attend an introductory session or pitch a small story to test whether curiosity sharpens when publication is real.",
  },
  {
    id: "wolverine-support-network",
    name: "Wolverine Support Network",
    categories: ["well-being", "peer support", "community"],
    description:
      "A peer community focused on connection, student mental health, and well-being.",
    maizePagesUrl: searchUrl("Wolverine Support Network"),
    membershipAccess: "open",
    workModes: work({
      communicate: 0.8,
      organize: 0.5,
      support: 1,
      investigate: 0.3,
    }),
    activities: activity({ serve: 0.9, discuss: 1, lead: 0.5 }),
    environment: {
      collaboration: 0.8,
      publicFacing: 0.3,
      handsOn: 0.4,
      structure: 0.6,
      commitment: "moderate",
    },
    whyFieldwork:
      "Try a group or open event and reflect on whether listening and building trust feels energizing or draining.",
  },
  {
    id: "musket",
    name: "MUSKET",
    categories: ["theatre", "performance", "production"],
    description:
      "A student-run musical theatre organization with performance, technical, and production opportunities.",
    maizePagesUrl: searchUrl("MUSKET"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      build: 0.5,
      create: 1,
      communicate: 0.9,
      organize: 0.8,
      support: 0.5,
    }),
    activities: activity({ make: 0.7, perform: 1, lead: 0.7 }),
    environment: {
      collaboration: 1,
      publicFacing: 1,
      handsOn: 0.8,
      structure: 0.9,
      commitment: "substantial",
    },
    whyFieldwork:
      "Help backstage or observe rehearsal to learn whether coordinated creative pressure brings out your best focus.",
  },
  {
    id: "outrage-dance",
    name: "Outrage Dance Group",
    categories: ["dance", "performance", "creative practice"],
    description: "A jazz and contemporary dance performance team.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/outragedance",
    membershipAccess: "audition",
    workModes: work({
      create: 1,
      communicate: 0.7,
      organize: 0.4,
      support: 0.5,
    }),
    activities: activity({ perform: 1, make: 0.6, compete: 0.3 }),
    environment: {
      collaboration: 0.9,
      publicFacing: 1,
      handsOn: 1,
      structure: 0.7,
      commitment: "moderate",
    },
    whyFieldwork:
      "Attend a performance or open practice and notice how you respond to repetition, embodiment, and ensemble work.",
  },
  {
    id: "michigan-pops-orchestra",
    name: "Michigan Pops Orchestra",
    categories: ["music", "performance", "ensemble"],
    description:
      "A student-run orchestra that brings together musicians for ensemble performance.",
    maizePagesUrl: searchUrl("Michigan Pops Orchestra"),
    membershipAccess: "audition",
    workModes: work({
      create: 0.9,
      communicate: 0.7,
      organize: 0.6,
      support: 0.4,
    }),
    activities: activity({ perform: 1, make: 0.5, lead: 0.4 }),
    environment: {
      collaboration: 1,
      publicFacing: 0.9,
      handsOn: 0.9,
      structure: 0.9,
      commitment: "moderate",
    },
    whyFieldwork:
      "Sit in on a concert or rehearsal and test whether contributing one precise part to a larger whole appeals to you.",
  },
  {
    id: "student-astronomical-society",
    name: "Student Astronomical Society",
    categories: ["science", "observation", "community"],
    description:
      "A student community for exploring and sharing interest in astronomy.",
    maizePagesUrl: searchUrl("Student Astronomical Society"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.7,
      communicate: 0.6,
      investigate: 1,
      support: 0.3,
    }),
    activities: activity({ research: 0.8, discuss: 0.8, publish: 0.3 }),
    environment: {
      collaboration: 0.6,
      publicFacing: 0.4,
      handsOn: 0.5,
      structure: 0.4,
      commitment: "light",
    },
    whyFieldwork:
      "Join an observing or discussion session and see whether open-ended questions pull you toward deeper investigation.",
  },
  {
    id: "michigan-birding-club",
    name: "Michigan Birding Club",
    categories: ["nature", "observation", "outdoors"],
    description:
      "A student group for learning about birds and practicing observation in the field.",
    maizePagesUrl: searchUrl("Michigan Birding Club"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.4,
      communicate: 0.5,
      support: 0.3,
      investigate: 1,
    }),
    activities: activity({ research: 0.8, discuss: 0.6, serve: 0.3 }),
    environment: {
      collaboration: 0.6,
      publicFacing: 0.2,
      handsOn: 0.8,
      structure: 0.3,
      commitment: "variable",
    },
    whyFieldwork:
      "Try one outing and notice whether slow observation in a changing environment makes you more curious.",
  },
  {
    id: "michigan-debate",
    name: "Michigan Debate",
    categories: ["debate", "research", "competition"],
    description:
      "A competitive debate community built around research, argument, and public speaking.",
    maizePagesUrl: searchUrl("Michigan Debate"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 1,
      create: 0.6,
      communicate: 1,
      organize: 0.5,
      investigate: 0.9,
    }),
    activities: activity({ research: 1, compete: 1, perform: 0.8, discuss: 1 }),
    environment: {
      collaboration: 0.8,
      publicFacing: 1,
      handsOn: 0.3,
      structure: 0.9,
      commitment: "substantial",
    },
    whyFieldwork:
      "Watch a practice round and test whether building and defending an argument feels playful or exhausting.",
  },
  {
    id: "munum",
    name: "Model United Nations at the University of Michigan",
    categories: ["international affairs", "simulation", "events"],
    description:
      "A student organization centered on Model United Nations conferences and diplomatic simulation.",
    maizePagesUrl: searchUrl(
      "Model United Nations at the University of Michigan",
    ),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.7,
      communicate: 1,
      organize: 0.9,
      support: 0.4,
      investigate: 0.8,
    }),
    activities: activity({
      research: 0.8,
      compete: 0.5,
      perform: 0.6,
      discuss: 1,
      lead: 0.8,
    }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.9,
      handsOn: 0.4,
      structure: 0.9,
      commitment: "moderate",
    },
    whyFieldwork:
      "Observe a committee simulation and see whether negotiation amid incomplete information holds your attention.",
  },
  {
    id: "society-women-engineers",
    name: "Society of Women Engineers at the University of Michigan",
    categories: ["engineering", "professional", "community"],
    description:
      "A student community supporting connection, development, outreach, and leadership in engineering.",
    maizePagesUrl: searchUrl("Society of Women Engineers"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      communicate: 0.8,
      organize: 0.9,
      support: 0.9,
      build: 0.3,
    }),
    activities: activity({ serve: 0.8, discuss: 0.6, lead: 0.9, make: 0.3 }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.7,
      handsOn: 0.4,
      structure: 0.8,
      commitment: "variable",
    },
    whyFieldwork:
      "Attend one outreach or professional event and compare helping a community grow with doing project work yourself.",
  },
  {
    id: "optimize",
    name: "optiMize Social Innovation",
    categories: ["social impact", "entrepreneurship", "projects"],
    description:
      "A student-led community for developing ideas and projects aimed at social impact.",
    maizePagesUrl: searchUrl("optiMize Social Innovation"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.6,
      build: 0.8,
      create: 0.9,
      communicate: 0.8,
      organize: 0.8,
      support: 0.6,
      investigate: 0.6,
    }),
    activities: activity({
      make: 0.9,
      research: 0.5,
      serve: 0.8,
      discuss: 0.7,
      lead: 0.8,
    }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.7,
      handsOn: 0.7,
      structure: 0.6,
      commitment: "moderate",
    },
    whyFieldwork:
      "Join a workshop and see whether moving from a community problem to a testable idea feels compelling.",
  },
  {
    id: "michigan-investment-group",
    name: "Michigan Investment Group",
    categories: ["markets", "finance", "professional"],
    description:
      "A student organization for learning about investing, markets, and financial analysis.",
    maizePagesUrl: searchUrl("Michigan Investment Group"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 1,
      communicate: 0.7,
      organize: 0.4,
      investigate: 0.9,
    }),
    activities: activity({
      research: 1,
      compete: 0.4,
      discuss: 0.8,
      publish: 0.4,
    }),
    environment: {
      collaboration: 0.7,
      publicFacing: 0.5,
      handsOn: 0.3,
      structure: 0.7,
      commitment: "moderate",
    },
    whyFieldwork:
      "Listen to a thesis discussion and notice whether evidence, uncertainty, and defending a judgment energize you.",
  },
  {
    id: "michigan-economics-society",
    name: "Michigan Economics Society",
    categories: ["economics", "discussion", "professional"],
    description:
      "A student community for exploring economic ideas, current questions, and related opportunities.",
    maizePagesUrl:
      "https://maizepages.umich.edu/organization/michiganeconomicssociety",
    membershipAccess: "open",
    workModes: work({
      analyze: 0.9,
      communicate: 0.7,
      investigate: 0.8,
      organize: 0.4,
    }),
    activities: activity({
      research: 0.7,
      discuss: 1,
      publish: 0.3,
      lead: 0.4,
    }),
    environment: {
      collaboration: 0.7,
      publicFacing: 0.5,
      handsOn: 0.2,
      structure: 0.5,
      commitment: "light",
    },
    whyFieldwork:
      "Attend one discussion and test whether using models to explain human choices makes you want to keep asking questions.",
  },
  {
    id: "habitat-for-humanity",
    name: "Habitat for Humanity at the University of Michigan",
    categories: ["service", "housing", "community"],
    description:
      "A campus chapter connecting students with housing-focused service and advocacy.",
    maizePagesUrl: searchUrl("Habitat for Humanity"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      build: 0.8,
      communicate: 0.6,
      organize: 0.8,
      support: 0.9,
    }),
    activities: activity({ make: 0.8, serve: 1, discuss: 0.4, lead: 0.6 }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.6,
      handsOn: 0.9,
      structure: 0.7,
      commitment: "variable",
    },
    whyFieldwork:
      "Try one service shift and see whether visible, physical progress tied to a community need matters to you.",
  },
  {
    id: "circle-k",
    name: "Circle K at the University of Michigan",
    categories: ["service", "leadership", "community"],
    description:
      "A collegiate service organization offering community projects, connection, and leadership opportunities.",
    maizePagesUrl: searchUrl("Circle K"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      communicate: 0.7,
      organize: 0.8,
      support: 1,
      build: 0.3,
    }),
    activities: activity({ serve: 1, discuss: 0.5, lead: 0.8, make: 0.3 }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.7,
      handsOn: 0.7,
      structure: 0.7,
      commitment: "variable",
    },
    whyFieldwork:
      "Choose one small service project and notice which part—people, logistics, or the task itself—you want more of.",
  },
  {
    id: "bluelab",
    name: "BLUElab",
    categories: ["sustainability", "design", "project teams"],
    description:
      "A community of student project teams applying design and engineering to sustainability challenges.",
    maizePagesUrl: searchUrl("BLUElab"),
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.7,
      build: 0.9,
      create: 0.8,
      communicate: 0.6,
      organize: 0.7,
      support: 0.5,
      investigate: 0.7,
    }),
    activities: activity({
      make: 1,
      research: 0.7,
      serve: 0.7,
      discuss: 0.5,
      lead: 0.6,
    }),
    environment: {
      collaboration: 1,
      publicFacing: 0.5,
      handsOn: 0.9,
      structure: 0.7,
      commitment: "moderate",
    },
    whyFieldwork:
      "Visit a project meeting and see whether designing with a real community and constraints changes how the work feels.",
  },
  {
    id: "michigan-photography-club",
    name: "Michigan Photography Club",
    categories: ["photography", "visual art", "community"],
    description:
      "A student community for practicing photography, sharing work, and learning from other photographers.",
    maizePagesUrl:
      "https://maizepages.umich.edu/organization/michiganphotographyclub",
    membershipAccess: "open",
    workModes: work({
      analyze: 0.3,
      create: 1,
      communicate: 0.7,
      investigate: 0.6,
      support: 0.3,
    }),
    activities: activity({
      make: 1,
      research: 0.3,
      discuss: 0.6,
      publish: 0.7,
    }),
    environment: {
      collaboration: 0.5,
      publicFacing: 0.6,
      handsOn: 0.8,
      structure: 0.3,
      commitment: "light",
    },
    whyFieldwork:
      "Join a photo walk and test whether framing and noticing the world gives you a distinct kind of focus.",
  },
  {
    id: "cares",
    name: "Campus Advocates for Empowerment, Resilience, and Safety",
    categories: ["health", "advocacy", "public policy"],
    description:
      "A student advocacy group focused on research-informed campus health and well-being policies.",
    maizePagesUrl: "https://maizepages.umich.edu/organization/cares",
    membershipAccess: "check-current-requirements",
    workModes: work({
      analyze: 0.7,
      create: 0.4,
      communicate: 0.9,
      organize: 0.8,
      support: 0.8,
      investigate: 0.8,
    }),
    activities: activity({
      research: 0.8,
      serve: 0.8,
      lead: 0.8,
      discuss: 0.7,
    }),
    environment: {
      collaboration: 0.9,
      publicFacing: 0.9,
      handsOn: 0.4,
      structure: 0.6,
      commitment: "moderate",
    },
    whyFieldwork:
      "Attend a planning meeting and see whether turning evidence about a community problem into advocacy feels meaningful.",
  },
];

const access: Record<MembershipAccess, ClubProfile["availability"]> = {
  open: "open",
  "application-or-selection": "application",
  audition: "audition",
  "check-current-requirements": "unknown",
};

// Translate the more editorial source fields into the shared, major-agnostic scoring vocabulary.
// Keeping this boundary here lets UI copy evolve without forking the recommendation model.
export const umichClubs: UmichClub[] = rawClubs.map((club) => ({
  id: club.id,
  name: club.name,
  categories: club.categories,
  description: club.description,
  maizePagesUrl: club.maizePagesUrl,
  membershipAccess: club.membershipAccess,
  commitment: club.environment.commitment,
  whyFieldwork: club.whyFieldwork,
  availability: access[club.membershipAccess],
  workModes: {
    analyze: club.workModes.analyze,
    build: club.workModes.build,
    create: club.workModes.create,
    explain: club.workModes.communicate,
    investigate: club.workModes.investigate,
    organize: club.workModes.organize,
    persuade: club.workModes.communicate * 0.7,
    serve: club.workModes.support,
    strategize: Math.max(club.workModes.analyze, club.workModes.organize),
    synthesize:
      (club.workModes.analyze +
        club.workModes.investigate +
        club.workModes.communicate) /
      3,
  },
  activityModes: {
    compete: club.activities.compete,
    design: Math.max(club.activities.make * 0.8, club.workModes.create),
    discuss: club.activities.discuss,
    make: club.activities.make,
    perform: club.activities.perform,
    research: club.activities.research,
    volunteer: club.activities.serve,
    teach: Math.max(
      club.activities.discuss * 0.6,
      club.activities.publish * 0.5,
    ),
  },
  environment: {
    collaborative: club.environment.collaboration,
    independent: Math.max(0, 1 - club.environment.collaboration * 0.8),
    handsOn: club.environment.handsOn,
    publicFacing: club.environment.publicFacing,
    structured: club.environment.structure,
    fastPaced:
      (club.environment.publicFacing +
        club.environment.handsOn +
        club.environment.structure) /
      3,
    deepFocus:
      (club.workModes.analyze +
        club.workModes.investigate +
        (1 - club.environment.publicFacing)) /
      3,
  },
}));
