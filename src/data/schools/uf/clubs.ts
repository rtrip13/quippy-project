import type { ClubProfile } from "../../../domain";

export type UfClub = ClubProfile & {
  campusId: "uf";
  categories: string[];
  description: string;
  sourceUrl: string;
  directoryUrl: string;
  membershipAccess: "open" | "application" | "audition" | "unknown";
  commitment: "light" | "moderate" | "substantial" | "variable";
  whyFieldwork: string;
};

const directoryUrl = "https://orgs.studentinvolvement.ufl.edu/organizations";
const club = (
  profile: Omit<UfClub, "campusId" | "directoryUrl" | "availability">,
): UfClub => ({
  ...profile,
  campusId: "uf",
  directoryUrl,
  availability: profile.membershipAccess,
});

// Descriptions are grounded in UF's public GatorConnect records. Signals are editorial 0–1
// estimates for exploration, never eligibility or aptitude judgments. Recruiting can change.
export const ufClubs: UfClub[] = [
  club({
    id: "uf-gator-robotics",
    name: "Gator Robotics",
    categories: ["robotics", "making", "peer learning"],
    description:
      "A multidisciplinary group where students design, build, and experiment with robots.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organization/Gator-Robotics",
    membershipAccess: "open",
    commitment: "moderate",
    workModes: {
      analyze: 0.8,
      build: 1,
      create: 0.8,
      investigate: 0.8,
      strategize: 0.6,
    },
    activityModes: { design: 1, make: 1, research: 0.6, teach: 0.4 },
    environment: {
      collaborative: 0.9,
      independent: 0.3,
      handsOn: 1,
      publicFacing: 0.3,
      structured: 0.6,
      fastPaced: 0.6,
      deepFocus: 0.8,
    },
    whyFieldwork:
      "Visit a build meeting and notice whether learning through physical iteration keeps you engaged.",
  }),
  club({
    id: "uf-speech-debate",
    name: "Speech and Debate Society",
    categories: ["debate", "public speaking", "competition"],
    description:
      "A registered organization centered on speech, argument, and debate practice.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organization/Speech-and-Debate-Society",
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
      "Watch a practice and test whether researching, framing, and defending an argument feels energizing.",
  }),
  club({
    id: "uf-footprints",
    name: "Footprints: Buddy and Support Program",
    categories: ["service", "children", "creative support"],
    description:
      "A student-run service organization supporting pediatric patients through play, creative projects, and community partnerships.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organization/Footprints-Buddy-and-Support-Program",
    membershipAccess: "unknown",
    commitment: "moderate",
    workModes: {
      create: 0.6,
      explain: 0.5,
      organize: 0.6,
      serve: 1,
      synthesize: 0.4,
    },
    activityModes: { make: 0.5, perform: 0.3, volunteer: 1, teach: 0.4 },
    environment: {
      collaborative: 0.9,
      independent: 0.3,
      handsOn: 0.8,
      publicFacing: 0.7,
      structured: 0.8,
      fastPaced: 0.6,
      deepFocus: 0.6,
    },
    whyFieldwork:
      "Learn about one volunteer role and reflect on whether close, relationship-centered service fits your energy.",
  }),
  club({
    id: "uf-enactus",
    name: "Enactus Club",
    categories: ["social innovation", "entrepreneurship", "community projects"],
    description:
      "A student-led group developing practical projects around social innovation and responsible business.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organization/enactus-club",
    membershipAccess: "unknown",
    commitment: "moderate",
    workModes: {
      analyze: 0.7,
      build: 0.8,
      create: 0.8,
      explain: 0.7,
      organize: 0.8,
      serve: 0.7,
      strategize: 0.9,
      synthesize: 0.7,
    },
    activityModes: {
      compete: 0.4,
      design: 0.9,
      discuss: 0.6,
      make: 0.8,
      research: 0.6,
      volunteer: 0.7,
    },
    environment: {
      collaborative: 0.9,
      independent: 0.3,
      handsOn: 0.8,
      publicFacing: 0.7,
      structured: 0.7,
      fastPaced: 0.7,
      deepFocus: 0.6,
    },
    whyFieldwork:
      "Join a project discussion and see whether turning a community challenge into a workable test appeals to you.",
  }),
  club({
    id: "uf-womens-student-association",
    name: "Women's Student Association",
    categories: ["community", "advocacy", "leadership"],
    description:
      "An open student organization focused on community, leadership development, mentorship, and gender-based issues.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organization/Womens-Student-Association",
    membershipAccess: "open",
    commitment: "variable",
    workModes: {
      explain: 0.8,
      organize: 0.9,
      persuade: 0.7,
      serve: 0.8,
      strategize: 0.7,
      synthesize: 0.6,
    },
    activityModes: { discuss: 0.8, teach: 0.7, volunteer: 0.7 },
    environment: {
      collaborative: 0.9,
      independent: 0.2,
      handsOn: 0.5,
      publicFacing: 0.9,
      structured: 0.7,
      fastPaced: 0.6,
      deepFocus: 0.4,
    },
    whyFieldwork:
      "Attend one program and notice whether facilitating connection or advocating around an issue draws you in.",
  }),
  club({
    id: "uf-vietnamese-student-organization",
    name: "Vietnamese Student Organization",
    categories: ["culture", "community", "performance"],
    description:
      "A cultural community organized around connection, dance, sports, leadership, and sharing Vietnamese culture.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organization/Vietnamese-Student-Organization",
    membershipAccess: "unknown",
    commitment: "variable",
    workModes: { create: 0.7, explain: 0.7, organize: 0.8, serve: 0.6 },
    activityModes: { discuss: 0.6, perform: 0.7, teach: 0.6, volunteer: 0.4 },
    environment: {
      collaborative: 1,
      independent: 0.2,
      handsOn: 0.7,
      publicFacing: 0.8,
      structured: 0.6,
      fastPaced: 0.6,
      deepFocus: 0.3,
    },
    whyFieldwork:
      "Try a cultural or social program and identify whether performance, planning, or community-building feels most natural.",
  }),
  club({
    id: "uf-circle-k",
    name: "Circle K International",
    categories: ["service", "community", "leadership"],
    description:
      "A student-led service organization connecting members with volunteer work and community outreach.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organization/Circle-K-International",
    membershipAccess: "unknown",
    commitment: "variable",
    workModes: { explain: 0.6, organize: 0.8, serve: 1, strategize: 0.6 },
    activityModes: { discuss: 0.4, volunteer: 1, teach: 0.4 },
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
      "Choose one service project and notice whether people, logistics, or the practical task gives you the strongest signal.",
  }),
  club({
    id: "uf-photography-wildlife-conservation",
    name: "Society of Photography for Wildlife Conservation",
    categories: ["photography", "wildlife", "conservation"],
    description:
      "A registered organization connecting photography practice with interest in wildlife and conservation.",
    sourceUrl:
      "https://orgs.studentinvolvement.ufl.edu/Organizations/Download/pdf",
    membershipAccess: "unknown",
    commitment: "variable",
    workModes: {
      analyze: 0.4,
      create: 1,
      explain: 0.5,
      investigate: 0.8,
      serve: 0.5,
      synthesize: 0.6,
    },
    activityModes: {
      design: 0.7,
      discuss: 0.5,
      make: 1,
      research: 0.6,
      volunteer: 0.4,
    },
    environment: {
      collaborative: 0.6,
      independent: 0.8,
      handsOn: 0.8,
      publicFacing: 0.5,
      structured: 0.3,
      fastPaced: 0.3,
      deepFocus: 0.8,
    },
    whyFieldwork:
      "Try a photo outing and see whether patient observation plus a conservation purpose deepens your focus.",
  }),
];
