import type { ClubProfile } from "../../../domain";

export type UtAustinClub = ClubProfile & {
  campusId: "utexas";
  categories: string[];
  description: string;
  sourceUrl: string;
  directoryUrl: string;
  membershipAccess: "open" | "application" | "audition" | "unknown";
  commitment: "light" | "moderate" | "substantial" | "variable";
  whyFieldwork: string;
};

const directoryUrl = "https://utexas.campuslabs.com/engage/organizations";
const club = (
  profile: Omit<UtAustinClub, "campusId" | "directoryUrl" | "availability">,
): UtAustinClub => ({
  ...profile,
  campusId: "utexas",
  directoryUrl,
  availability: profile.membershipAccess,
});

// Organization facts and links come from UT Austin's public HornsLink directory. Fit signals are
// editorial, major-neutral 0–1 descriptors; current recruiting details belong to each organization.
export const utAustinClubs: UtAustinClub[] = [
  club({
    id: "utexas-aerial-robotics",
    name: "Texas Aerial Robotics",
    categories: ["robotics", "autonomous systems", "competition"],
    description:
      "A team that builds autonomous aerial systems and works on navigation, perception, and decision-making problems.",
    sourceUrl: "https://utexas.campuslabs.com/engage/organization/TAR",
    membershipAccess: "application",
    commitment: "substantial",
    workModes: {
      analyze: 0.9,
      build: 1,
      create: 0.8,
      investigate: 0.9,
      organize: 0.6,
      strategize: 0.8,
      synthesize: 0.8,
    },
    activityModes: { compete: 0.8, design: 1, make: 1, research: 0.8 },
    environment: {
      collaborative: 1,
      independent: 0.4,
      handsOn: 1,
      publicFacing: 0.4,
      structured: 0.8,
      fastPaced: 0.8,
      deepFocus: 0.9,
    },
    whyFieldwork:
      "Observe a technical meeting and see whether solving one system across hardware and software feels absorbing.",
  }),
  club({
    id: "utexas-eclair",
    name: "ECLAIR",
    categories: ["robotics", "artificial intelligence", "project learning"],
    description:
      "An all-skill-level robotics and AI community that supplies training and resources for student-led projects.",
    sourceUrl: "https://utexas.campuslabs.com/engage/organization/eclair",
    membershipAccess: "open",
    commitment: "variable",
    workModes: {
      analyze: 0.7,
      build: 1,
      create: 0.9,
      explain: 0.6,
      investigate: 0.8,
      serve: 0.4,
    },
    activityModes: { design: 1, make: 1, research: 0.7, teach: 0.6 },
    environment: {
      collaborative: 0.9,
      independent: 0.5,
      handsOn: 1,
      publicFacing: 0.3,
      structured: 0.5,
      fastPaced: 0.6,
      deepFocus: 0.8,
    },
    whyFieldwork:
      "Try a project session and compare the pull of inventing your own idea with contributing to someone else’s.",
  }),
  club({
    id: "utexas-student-media",
    name: "Texas Student Media",
    categories: ["journalism", "radio", "video and publishing"],
    description:
      "A student media network spanning newspaper, humor, yearbook, radio, television, digital work, and advertising.",
    sourceUrl: "https://utexas.campuslabs.com/engage/organization/tsm",
    membershipAccess: "application",
    commitment: "variable",
    workModes: {
      analyze: 0.7,
      create: 0.9,
      explain: 1,
      investigate: 0.9,
      organize: 0.7,
      persuade: 0.6,
      synthesize: 0.8,
    },
    activityModes: {
      design: 0.7,
      discuss: 0.7,
      make: 0.8,
      perform: 0.6,
      research: 0.8,
      teach: 0.3,
    },
    environment: {
      collaborative: 0.8,
      independent: 0.6,
      handsOn: 0.6,
      publicFacing: 1,
      structured: 0.8,
      fastPaced: 0.9,
      deepFocus: 0.7,
    },
    whyFieldwork:
      "Attend an introduction and test whether reporting, production, or shaping a public story gives you momentum.",
  }),
  club({
    id: "utexas-community-engagement-collective",
    name: "Community Engagement Collective",
    categories: ["service", "civic engagement", "operations"],
    description:
      "A student network coordinating service, civic engagement, trips, volunteer management, and community partnerships.",
    sourceUrl: "https://utexas.campuslabs.com/engage/organization/cec",
    membershipAccess: "unknown",
    commitment: "moderate",
    workModes: {
      explain: 0.7,
      organize: 1,
      persuade: 0.6,
      serve: 1,
      strategize: 0.8,
      synthesize: 0.6,
    },
    activityModes: { design: 0.5, discuss: 0.6, volunteer: 1, teach: 0.4 },
    environment: {
      collaborative: 1,
      independent: 0.3,
      handsOn: 0.8,
      publicFacing: 0.8,
      structured: 0.8,
      fastPaced: 0.7,
      deepFocus: 0.4,
    },
    whyFieldwork:
      "Join one planning or service activity and notice whether coordinating people or doing the direct work fits better.",
  }),
  club({
    id: "utexas-ctmun",
    name: "Central Texas Model United Nations",
    categories: ["international affairs", "simulation", "events"],
    description:
      "A Model United Nations organization that runs conferences and supports a traveling collegiate team.",
    sourceUrl: "https://utexas.campuslabs.com/engage/organization/ctmun",
    membershipAccess: "application",
    commitment: "moderate",
    workModes: {
      analyze: 0.8,
      explain: 0.9,
      investigate: 0.8,
      organize: 0.9,
      persuade: 1,
      strategize: 0.9,
      synthesize: 0.8,
    },
    activityModes: {
      compete: 0.7,
      discuss: 1,
      perform: 0.6,
      research: 0.8,
      teach: 0.5,
    },
    environment: {
      collaborative: 0.9,
      independent: 0.4,
      handsOn: 0.4,
      publicFacing: 1,
      structured: 0.9,
      fastPaced: 0.8,
      deepFocus: 0.7,
    },
    whyFieldwork:
      "Observe a committee simulation and test whether negotiation under incomplete information feels engaging.",
  }),
  club({
    id: "utexas-dance-action",
    name: "Dance Action",
    categories: ["dance", "creative production", "performance"],
    description:
      "An open student-run dance group offering classes and student-choreographed experimental performances.",
    sourceUrl: "https://utexas.campuslabs.com/engage/organization/danceaction",
    membershipAccess: "open",
    commitment: "variable",
    workModes: {
      create: 1,
      explain: 0.6,
      organize: 0.7,
      serve: 0.4,
      synthesize: 0.6,
    },
    activityModes: { design: 0.8, make: 0.7, perform: 1, teach: 0.6 },
    environment: {
      collaborative: 0.9,
      independent: 0.4,
      handsOn: 1,
      publicFacing: 0.9,
      structured: 0.5,
      fastPaced: 0.7,
      deepFocus: 0.6,
    },
    whyFieldwork:
      "Try a class or performance and notice whether movement, choreography, or producing the show creates the strongest pull.",
  }),
  club({
    id: "utexas-outreach",
    name: "OUTreach at the University of Texas",
    categories: ["service", "LGBTQ+ community", "education"],
    description:
      "A service and education community connecting students with volunteering, speakers, discussion, and social support.",
    sourceUrl: "https://utexas.campuslabs.com/engage/organization/outreach",
    membershipAccess: "open",
    commitment: "variable",
    workModes: {
      explain: 0.8,
      organize: 0.7,
      persuade: 0.6,
      serve: 1,
      synthesize: 0.5,
    },
    activityModes: { discuss: 0.8, research: 0.3, teach: 0.8, volunteer: 1 },
    environment: {
      collaborative: 0.9,
      independent: 0.3,
      handsOn: 0.6,
      publicFacing: 0.8,
      structured: 0.6,
      fastPaced: 0.5,
      deepFocus: 0.4,
    },
    whyFieldwork:
      "Attend a meeting or volunteer event and see whether education, direct service, or community-building resonates most.",
  }),
  club({
    id: "utexas-texas-ballroom",
    name: "Texas Ballroom",
    categories: ["dance", "social learning", "competition"],
    description:
      "A partner-dance community with beginner instruction, social dancing, and optional competitive training.",
    sourceUrl:
      "https://utexas.campuslabs.com/engage/organization/texasballroom",
    membershipAccess: "open",
    commitment: "variable",
    workModes: { create: 0.7, explain: 0.5, serve: 0.4, strategize: 0.4 },
    activityModes: { compete: 0.6, perform: 0.9, teach: 0.7 },
    environment: {
      collaborative: 1,
      independent: 0.1,
      handsOn: 1,
      publicFacing: 0.8,
      structured: 0.8,
      fastPaced: 0.7,
      deepFocus: 0.6,
    },
    whyFieldwork:
      "Take one beginner class and test how you respond to embodied practice, real-time partnership, and repetition.",
  }),
];
