import type { ClubProfile } from "../../../domain";

export type BerkeleyClub = ClubProfile & {
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

// Editorial, major-neutral estimates of what participating may feel like—not claims about
// aptitude or belonging. Organization details and recruiting can change; verify on CalLink.
export const berkeleyClubs: BerkeleyClub[] = [
  {
    id: "berkeley-pie",
    name: "Pioneers in Engineering",
    categories: ["STEM outreach", "robotics", "education"],
    description:
      "Designs and runs hands-on STEM programs, including a robotics competition for Bay Area high school students.",
    sourceUrls: ["https://callink.berkeley.edu/organization/pie"],
    membershipAccess: "check-current-requirements",
    commitment: "substantial",
    availability: "unknown",
    workModes: {
      build: 0.9,
      create: 0.7,
      explain: 0.9,
      organize: 0.8,
      serve: 0.9,
    },
    activityModes: { design: 0.8, make: 0.9, teach: 1, volunteer: 0.8 },
    environment: {
      collaborative: 1,
      handsOn: 0.9,
      publicFacing: 0.8,
      structured: 0.8,
    },
    whyFieldwork:
      "Join an outreach or build session to test whether making technical ideas accessible to younger students feels energizing.",
  },
  {
    id: "berkeley-daily-californian",
    name: "The Daily Californian",
    categories: ["journalism", "media", "campus life"],
    description:
      "An independent, student-run newspaper covering UC Berkeley and the city of Berkeley.",
    sourceUrls: ["https://callink.berkeley.edu/organization/dailycal"],
    membershipAccess: "application-or-selection",
    commitment: "variable",
    availability: "application",
    workModes: {
      investigate: 0.9,
      synthesize: 0.9,
      explain: 0.9,
      organize: 0.6,
    },
    activityModes: { research: 0.8, design: 0.4, discuss: 0.6 },
    environment: {
      collaborative: 0.7,
      independent: 0.7,
      publicFacing: 0.9,
      fastPaced: 0.9,
      deepFocus: 0.7,
    },
    friction: {
      ambiguity: 0.8,
      iteration: 0.8,
      precision: 0.9,
      coordination: 0.7,
    },
    whyFieldwork:
      "Attend an information session or pitch a story to see whether finding, verifying, and explaining what matters holds your attention.",
  },
  {
    id: "berkeley-concrete-canoe",
    name: "Cal Concrete Canoe",
    categories: ["design-build", "competition", "team project"],
    description:
      "A multidisciplinary team that designs, constructs, presents, and races a concrete canoe.",
    sourceUrls: ["https://callink.berkeley.edu/organization/concretecanoe"],
    membershipAccess: "open",
    commitment: "substantial",
    availability: "open",
    workModes: {
      analyze: 0.8,
      build: 1,
      create: 0.7,
      organize: 0.8,
      strategize: 0.7,
    },
    activityModes: { compete: 0.9, design: 1, make: 1, research: 0.5 },
    environment: {
      collaborative: 1,
      handsOn: 1,
      structured: 0.9,
      fastPaced: 0.7,
    },
    friction: {
      debugging: 0.7,
      iteration: 0.9,
      precision: 0.9,
      coordination: 0.9,
    },
    whyFieldwork:
      "Observe a design review or build day to learn whether a tangible, deadline-driven team project suits you.",
  },
  {
    id: "berkeley-cal-debate",
    name: "Policy Debate (Cal Debate)",
    categories: ["debate", "policy", "competition"],
    description:
      "Trains students in evidence-based policy debate, critical thinking, and persuasive communication for national competition.",
    sourceUrls: ["https://callink.berkeley.edu/organization/policydebate"],
    membershipAccess: "application-or-selection",
    commitment: "substantial",
    availability: "application",
    workModes: {
      analyze: 1,
      investigate: 0.9,
      persuade: 1,
      strategize: 0.9,
      synthesize: 0.9,
    },
    activityModes: { compete: 1, discuss: 1, research: 0.9 },
    environment: {
      collaborative: 0.7,
      publicFacing: 1,
      structured: 0.8,
      fastPaced: 1,
      deepFocus: 0.8,
    },
    friction: { ambiguity: 0.8, precision: 0.9, repetition: 0.7 },
    whyFieldwork:
      "Watch a practice round and notice whether researching both sides and responding under pressure is exciting or draining.",
  },
  {
    id: "berkeley-bmun",
    name: "Berkeley Model United Nations Conference",
    categories: ["international affairs", "education", "event production"],
    description:
      "Plans and hosts a large Model UN conference that teaches high school students diplomacy, public speaking, and policy debate.",
    sourceUrls: ["https://callink.berkeley.edu/organization/bmun"],
    membershipAccess: "application-or-selection",
    commitment: "substantial",
    availability: "application",
    workModes: {
      explain: 0.8,
      organize: 1,
      persuade: 0.8,
      serve: 0.7,
      strategize: 0.9,
    },
    activityModes: { discuss: 0.9, teach: 0.8, volunteer: 0.5 },
    environment: {
      collaborative: 1,
      publicFacing: 1,
      structured: 0.9,
      fastPaced: 0.9,
    },
    friction: { ambiguity: 0.7, coordination: 1, precision: 0.8 },
    whyFieldwork:
      "Help with a committee or conference task to compare policy discussion with the behind-the-scenes work of producing a major event.",
  },
  {
    id: "berkeley-danceworx",
    name: "Danceworx",
    categories: ["dance", "performance", "creative community"],
    description:
      "A student-run dance group where selected dancers rehearse original choreography and perform in a semester showcase.",
    sourceUrls: ["https://callink.berkeley.edu/organization/danceworx"],
    membershipAccess: "audition",
    commitment: "moderate",
    availability: "audition",
    workModes: { create: 1, build: 0.5, explain: 0.4 },
    activityModes: { design: 0.8, make: 0.5, perform: 1 },
    environment: {
      collaborative: 0.9,
      handsOn: 1,
      publicFacing: 1,
      structured: 0.8,
    },
    friction: {
      iteration: 0.9,
      precision: 0.8,
      repetition: 1,
      coordination: 0.8,
    },
    whyFieldwork:
      "Try a workshop or watch a rehearsal to test whether repeated physical refinement with a group creates momentum for you.",
  },
  {
    id: "berkeley-circle-k",
    name: "Circle K International",
    categories: ["community service", "leadership", "social"],
    description:
      "Organizes varied community-service projects while developing leadership and fellowship among members.",
    sourceUrls: ["https://callink.berkeley.edu/organization/cki"],
    membershipAccess: "open",
    commitment: "variable",
    availability: "open",
    workModes: { organize: 0.8, serve: 1, explain: 0.5, strategize: 0.5 },
    activityModes: { volunteer: 1, teach: 0.5, make: 0.4 },
    environment: {
      collaborative: 1,
      handsOn: 0.8,
      publicFacing: 0.8,
      fastPaced: 0.6,
    },
    friction: { coordination: 0.8, ambiguity: 0.5 },
    whyFieldwork:
      "Choose one short service project and reflect on whether direct help, event coordination, or the community itself was most rewarding.",
  },
  {
    id: "berkeley-vertical-farming",
    name: "Vertical Farming at Berkeley",
    categories: ["sustainability", "food systems", "research and prototyping"],
    description:
      "Develops and tests interdisciplinary vertical-farming systems aimed at food security and lower-impact production.",
    sourceUrls: [
      "https://callink.berkeley.edu/organization/verticalfarmingatberkeley",
    ],
    membershipAccess: "check-current-requirements",
    commitment: "moderate",
    availability: "unknown",
    workModes: {
      analyze: 0.8,
      build: 0.9,
      investigate: 0.9,
      create: 0.7,
      strategize: 0.7,
    },
    activityModes: { design: 0.8, make: 0.8, research: 0.9 },
    environment: {
      collaborative: 0.9,
      handsOn: 0.9,
      structured: 0.6,
      deepFocus: 0.8,
    },
    friction: { ambiguity: 0.8, debugging: 0.8, iteration: 1, precision: 0.7 },
    whyFieldwork:
      "Visit a project meeting or prototype session to see whether experimenting on a complex sustainability problem feels compelling.",
  },
];
