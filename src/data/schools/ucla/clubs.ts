import type { ClubProfile } from "../../../domain";

export type UclaClub = ClubProfile & {
  categories: string[];
  description: string;
  sourceUrls: string[];
  membershipAccess:
    | "open"
    | "application-or-selection"
    | "audition"
    | "check-current-requirements";
  commitment: "light" | "moderate" | "substantial" | "variable";
  whyFieldwork: string;
};

const directoryUrl = "https://sa.ucla.edu/RCO/public/search";

// Organization descriptions are grounded in UCLA's official SOLE directory. Scores are
// editorial exploration aids, not aptitude judgments; students should confirm current access.
export const uclaClubs: UclaClub[] = [
  {
    id: "ucla-rocket-project",
    name: "Rocket Project at UCLA",
    categories: ["aerospace", "design-build", "team project"],
    description:
      "Teaches rocket engineering through a hands-on design-build-test cycle spanning technical project teams.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/engineering",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "substantial",
    availability: "unknown",
    workModes: { analyze: 0.9, build: 1, investigate: 0.8, organize: 0.7 },
    activityModes: { design: 1, make: 1, research: 0.7 },
    environment: {
      collaborative: 1,
      handsOn: 1,
      structured: 0.9,
      fastPaced: 0.7,
    },
    friction: {
      debugging: 0.9,
      iteration: 0.9,
      precision: 1,
      coordination: 0.8,
    },
    whyFieldwork:
      "Observe a build or test review and notice whether careful iteration on a physical system pulls you in.",
  },
  {
    id: "ucla-creative-labs",
    name: "Creative Labs UCLA",
    categories: ["creative projects", "design", "community"],
    description:
      "A community where students collaborate on creative projects and discover new creative practices.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/academic",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    availability: "unknown",
    workModes: { create: 1, build: 0.7, explain: 0.5, organize: 0.5 },
    activityModes: { design: 1, make: 0.9, discuss: 0.5 },
    environment: {
      collaborative: 0.9,
      handsOn: 0.7,
      structured: 0.4,
      publicFacing: 0.6,
    },
    friction: { ambiguity: 0.9, iteration: 0.9, coordination: 0.6 },
    whyFieldwork:
      "Join a project critique or making session to see whether open-ended creation with people from other disciplines feels freeing.",
  },
  {
    id: "ucla-debate-union",
    name: "Debate Union at UCLA",
    categories: ["debate", "competition", "public speaking"],
    description:
      "Teaches British Parliamentary debate, competes in tournaments, and creates space for reasoned argument.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/academic",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    availability: "unknown",
    workModes: { analyze: 0.9, persuade: 1, strategize: 0.9, synthesize: 0.8 },
    activityModes: { compete: 1, discuss: 1, research: 0.5 },
    environment: {
      collaborative: 0.7,
      publicFacing: 1,
      fastPaced: 1,
      structured: 0.7,
    },
    friction: { ambiguity: 0.8, repetition: 0.6, precision: 0.7 },
    whyFieldwork:
      "Try a practice debate and separate your reaction to public pressure from your reaction to rapid argument-building.",
  },
  {
    id: "ucla-bruin-policy-institute",
    name: "Bruin Policy Institute",
    categories: ["public policy", "research", "publishing"],
    description:
      "A student policy think tank that discusses policy, publishes evidence-backed memos, and advocates for solutions.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/social-activism",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    availability: "unknown",
    workModes: {
      analyze: 0.9,
      investigate: 0.9,
      persuade: 0.8,
      synthesize: 1,
      explain: 0.8,
    },
    activityModes: { research: 1, discuss: 0.8, design: 0.3 },
    environment: {
      collaborative: 0.8,
      independent: 0.7,
      publicFacing: 0.7,
      deepFocus: 0.9,
    },
    friction: { ambiguity: 0.9, iteration: 0.8, precision: 0.9 },
    whyFieldwork:
      "Attend a policy discussion or memo workshop to test whether turning evidence into a defensible recommendation sustains your focus.",
  },
  {
    id: "ucla-unicamp",
    name: "UCLA UniCamp",
    categories: ["youth", "community service", "camp"],
    description:
      "UCLA's official student charity connects student volunteers with youth from underserved Los Angeles communities through camp programming.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/community-service",
    ],
    membershipAccess: "application-or-selection",
    commitment: "substantial",
    availability: "application",
    workModes: { serve: 1, organize: 0.9, explain: 0.8, create: 0.6 },
    activityModes: { volunteer: 1, teach: 0.8, perform: 0.4, make: 0.4 },
    environment: {
      collaborative: 1,
      publicFacing: 1,
      handsOn: 1,
      fastPaced: 0.9,
      structured: 0.8,
    },
    friction: { coordination: 1, ambiguity: 0.7, repetition: 0.6 },
    whyFieldwork:
      "Explore a volunteer information session and ask whether sustained mentoring and high-energy group leadership fit how you like to help.",
  },
  {
    id: "ucla-bruin-earth-solutions",
    name: "Bruin Earth Solutions",
    categories: ["sustainability", "campus projects", "interdisciplinary"],
    description:
      "Runs student-led sustainability projects across engineering, science, policy, and campus operations.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/engineering",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "variable",
    availability: "unknown",
    workModes: {
      investigate: 0.7,
      build: 0.7,
      organize: 0.8,
      serve: 0.7,
      strategize: 0.8,
    },
    activityModes: { design: 0.7, make: 0.6, research: 0.7, volunteer: 0.6 },
    environment: {
      collaborative: 0.9,
      handsOn: 0.7,
      publicFacing: 0.6,
      structured: 0.6,
    },
    friction: { ambiguity: 0.8, coordination: 0.8, iteration: 0.7 },
    whyFieldwork:
      "Sit in on one project meeting and notice whether the technical, behavior-change, or coordination part of sustainability work interests you most.",
  },
  {
    id: "ucla-datares",
    name: "DataRes at UCLA",
    categories: ["data", "research", "project work"],
    description:
      "Builds data-science experience and community through project work, analysis, and communicating results.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/engineering",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    availability: "unknown",
    workModes: {
      analyze: 1,
      build: 0.7,
      investigate: 0.9,
      synthesize: 0.9,
      explain: 0.7,
    },
    activityModes: { research: 0.9, design: 0.5, make: 0.5 },
    environment: {
      collaborative: 0.8,
      independent: 0.7,
      structured: 0.7,
      deepFocus: 0.9,
    },
    friction: {
      debugging: 0.8,
      iteration: 0.8,
      precision: 0.9,
      ambiguity: 0.7,
    },
    whyFieldwork:
      "Watch a project presentation or try a beginner workshop to see whether extracting a story from messy data feels satisfying.",
  },
  {
    id: "ucla-project-literacy",
    name: "Project Literacy at UCLA",
    categories: ["tutoring", "community service", "education"],
    description:
      "Supports literacy in the Los Angeles region through one-on-one tutoring for youth and adults.",
    sourceUrls: [
      directoryUrl,
      "https://community.ucla.edu/studentorgs/community-service",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    availability: "unknown",
    workModes: { serve: 1, explain: 1, organize: 0.5, investigate: 0.4 },
    activityModes: { teach: 1, volunteer: 1, discuss: 0.6 },
    environment: {
      collaborative: 0.5,
      independent: 0.7,
      publicFacing: 0.8,
      structured: 0.7,
      deepFocus: 0.7,
    },
    friction: { repetition: 0.8, iteration: 0.8, coordination: 0.5 },
    whyFieldwork:
      "Try a tutoring orientation and notice whether patient one-to-one explanation gives you energy and a sense of progress.",
  },
];
