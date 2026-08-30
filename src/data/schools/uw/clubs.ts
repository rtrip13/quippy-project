import type { ClubProfile } from "../../../domain";

export type UwSeattleClub = ClubProfile & {
  campusId: "uw";
  categories: string[];
  description: string;
  sourceUrl: string;
  directoryUrl: string;
  membershipAccess: "open" | "application" | "audition" | "unknown";
  commitment: "light" | "moderate" | "substantial" | "variable";
  whyFieldwork: string;
};

const directoryUrl = "https://huskylink.washington.edu/club_signup?view=all";
const club = (
  profile: Omit<UwSeattleClub, "campusId" | "directoryUrl" | "availability">,
): UwSeattleClub => ({
  ...profile,
  campusId: "uw",
  directoryUrl,
  availability: profile.membershipAccess,
});

// Facts and links are sourced from UW Seattle's public HuskyLink RSO directory. Scoring fields
// are major-neutral editorial descriptors, not validated member outcomes or admissions guidance.
export const uwSeattleClubs: UwSeattleClub[] = [
  club({
    id: "uw-advanced-robotics",
    name: "Advanced Robotics at the University of Washington",
    categories: ["robotics", "competition", "multidisciplinary projects"],
    description:
      "A multidisciplinary team that designs, builds, and programs robots for RoboMaster competition.",
    sourceUrl: "https://huskylink.washington.edu/organization/robomstr",
    membershipAccess: "application",
    commitment: "substantial",
    workModes: {
      analyze: 0.9,
      build: 1,
      create: 0.8,
      investigate: 0.8,
      organize: 0.7,
      strategize: 0.9,
      synthesize: 0.8,
    },
    activityModes: { compete: 1, design: 1, make: 1, research: 0.7 },
    environment: {
      collaborative: 1,
      independent: 0.4,
      handsOn: 1,
      publicFacing: 0.5,
      structured: 0.9,
      fastPaced: 0.9,
      deepFocus: 0.9,
    },
    whyFieldwork:
      "Watch a design review and notice whether coordinated technical work under competition constraints excites you.",
  }),
  club({
    id: "uw-circle-k",
    name: "Circle K International at the University of Washington",
    categories: ["service", "community outreach", "leadership"],
    description:
      "A student-led organization connecting members with volunteer work and outreach across greater Seattle.",
    sourceUrl: "https://huskylink.washington.edu/organization/circlkuw",
    membershipAccess: "unknown",
    commitment: "variable",
    workModes: { explain: 0.6, organize: 0.8, serve: 1, strategize: 0.6 },
    activityModes: { discuss: 0.4, teach: 0.3, volunteer: 1 },
    environment: {
      collaborative: 0.9,
      independent: 0.3,
      handsOn: 0.8,
      publicFacing: 0.7,
      structured: 0.6,
      fastPaced: 0.6,
      deepFocus: 0.3,
    },
    whyFieldwork:
      "Try one volunteer project and note whether direct service, logistics, or meeting the community is the strongest signal.",
  }),
  club({
    id: "uw-developpe-dance",
    name: "Developpe Dance Club",
    categories: ["dance", "creative learning", "performance"],
    description:
      "An all-level ballet and contemporary dance community with classes, choreography, and public performance.",
    sourceUrl:
      "https://huskylink.washington.edu/organization/developpe_dance_club",
    membershipAccess: "open",
    commitment: "variable",
    workModes: {
      create: 1,
      explain: 0.5,
      organize: 0.5,
      serve: 0.4,
      synthesize: 0.5,
    },
    activityModes: { design: 0.7, perform: 1, teach: 0.8 },
    environment: {
      collaborative: 0.9,
      independent: 0.3,
      handsOn: 1,
      publicFacing: 0.8,
      structured: 0.7,
      fastPaced: 0.6,
      deepFocus: 0.7,
    },
    whyFieldwork:
      "Take one class and see whether embodied repetition, expression, and ensemble learning bring out sustained focus.",
  }),
  club({
    id: "uw-chinese-debate",
    name: "Chinese Debate Club at University of Washington",
    categories: ["debate", "Chinese language", "competition"],
    description:
      "A debate community developing Chinese-language speaking, argument, and critical-thinking skills.",
    sourceUrl:
      "https://huskylink.washington.edu/organization/chinesedebateclub_uw",
    membershipAccess: "unknown",
    commitment: "moderate",
    workModes: {
      analyze: 0.9,
      explain: 1,
      investigate: 0.8,
      persuade: 1,
      strategize: 0.9,
      synthesize: 0.8,
    },
    activityModes: { compete: 0.9, discuss: 1, perform: 0.8, research: 0.8 },
    environment: {
      collaborative: 0.8,
      independent: 0.5,
      handsOn: 0.2,
      publicFacing: 1,
      structured: 0.8,
      fastPaced: 0.8,
      deepFocus: 0.7,
    },
    whyFieldwork:
      "Observe a practice and test whether fast argument, research, and linguistic precision feel rewarding.",
  }),
  club({
    id: "uw-husky-records",
    name: "Husky Records",
    categories: ["music", "production", "creative business"],
    description:
      "A student-led record label helping local artists record, mix, distribute, and promote music.",
    sourceUrl: directoryUrl,
    membershipAccess: "unknown",
    commitment: "moderate",
    workModes: {
      analyze: 0.5,
      build: 0.6,
      create: 1,
      explain: 0.7,
      organize: 0.8,
      persuade: 0.7,
      strategize: 0.8,
      synthesize: 0.8,
    },
    activityModes: {
      design: 0.7,
      discuss: 0.5,
      make: 1,
      perform: 0.4,
      research: 0.4,
    },
    environment: {
      collaborative: 0.9,
      independent: 0.5,
      handsOn: 0.8,
      publicFacing: 0.8,
      structured: 0.7,
      fastPaced: 0.7,
      deepFocus: 0.8,
    },
    whyFieldwork:
      "Sit in on a production or planning conversation and see whether craft, artist support, or release strategy draws you in.",
  }),
  club({
    id: "uw-dubs-art-club",
    name: "Dub's Art Club",
    categories: ["visual art", "creative community", "making"],
    description:
      "A community where UW artists and art enthusiasts create and share work together.",
    sourceUrl: directoryUrl,
    membershipAccess: "open",
    commitment: "light",
    workModes: { create: 1, explain: 0.4, serve: 0.3, synthesize: 0.6 },
    activityModes: { design: 0.8, discuss: 0.5, make: 1, teach: 0.4 },
    environment: {
      collaborative: 0.6,
      independent: 0.8,
      handsOn: 0.9,
      publicFacing: 0.4,
      structured: 0.3,
      fastPaced: 0.3,
      deepFocus: 0.8,
    },
    whyFieldwork:
      "Join one making session and notice whether private craft, feedback, or creating alongside others feels best.",
  }),
  club({
    id: "uw-synapse",
    name: "Synapse at the University of Washington",
    categories: ["peer support", "brain injury", "community education"],
    description:
      "A community supporting people with brain injury through social connection and public awareness.",
    sourceUrl: directoryUrl,
    membershipAccess: "unknown",
    commitment: "moderate",
    workModes: {
      explain: 0.7,
      organize: 0.6,
      persuade: 0.5,
      serve: 1,
      synthesize: 0.5,
    },
    activityModes: { discuss: 0.8, teach: 0.8, volunteer: 1 },
    environment: {
      collaborative: 0.9,
      independent: 0.3,
      handsOn: 0.6,
      publicFacing: 0.7,
      structured: 0.6,
      fastPaced: 0.4,
      deepFocus: 0.6,
    },
    whyFieldwork:
      "Attend an open activity and reflect on whether listening, supporting, and explaining health experiences feels meaningful.",
  }),
  club({
    id: "uw-husky-business-journal",
    name: "The Husky Business Journal",
    categories: ["video", "reporting", "local business"],
    description:
      "A student publication using research, reporting, and video to explore businesses in Seattle.",
    sourceUrl: directoryUrl,
    membershipAccess: "unknown",
    commitment: "moderate",
    workModes: {
      analyze: 0.7,
      create: 0.9,
      explain: 0.9,
      investigate: 0.9,
      organize: 0.6,
      synthesize: 0.8,
    },
    activityModes: {
      design: 0.6,
      discuss: 0.6,
      make: 0.9,
      perform: 0.4,
      research: 0.9,
    },
    environment: {
      collaborative: 0.8,
      independent: 0.6,
      handsOn: 0.6,
      publicFacing: 0.9,
      structured: 0.7,
      fastPaced: 0.7,
      deepFocus: 0.8,
    },
    whyFieldwork:
      "Watch or help plan one story and test whether researching a real organization for a public audience holds your interest.",
  }),
];
