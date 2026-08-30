import {
  clubsForSchool,
  schoolRegistry,
  type SchoolClub,
} from "../../data/schools";

export const CLUB_DATA_REVIEWED_ON = "2026-08-30" as const;

export type ClubAccessLevel = "open" | "selection" | "audition" | "verify";

export type ClubIntelligence = {
  clubId: string;
  schoolId: string;
  accessLevel: ClubAccessLevel;
  accessLabel: string;
  commitmentLabel: string;
  beginnerGuidance: string;
  reviewedOn: typeof CLUB_DATA_REVIEWED_ON;
  freshnessNote: string;
  primaryUrl: string;
  directoryUrl?: string;
};

const sourceForClub = (club: SchoolClub): string =>
  club.maizePagesUrl ??
  club.clubUrl ??
  club.sourceUrl ??
  club.sourceUrls?.[0] ??
  club.directoryUrl ??
  "";

const accessDetails = (
  membershipAccess: string,
): Pick<
  ClubIntelligence,
  "accessLevel" | "accessLabel" | "beginnerGuidance"
> => {
  if (membershipAccess === "open") {
    return {
      accessLevel: "open",
      accessLabel: "Listed as open",
      beginnerGuidance:
        "The listing says open; ask whether there is a newcomer meeting or low-commitment first role.",
    };
  }
  if (
    membershipAccess === "application" ||
    membershipAccess === "application-or-selection"
  ) {
    return {
      accessLevel: "selection",
      accessLabel: "Application or selection may apply",
      beginnerGuidance:
        "Ask what beginners can attend before applying and when the next selection cycle starts.",
    };
  }
  if (membershipAccess === "audition") {
    return {
      accessLevel: "audition",
      accessLabel: "Audition may apply",
      beginnerGuidance:
        "Ask whether rehearsals, workshops, or performances are open to prospective members.",
    };
  }
  return {
    accessLevel: "verify",
    accessLabel: "Check current requirements",
    beginnerGuidance:
      "Beginner friendliness is not confirmed. Ask what a first visit looks like before committing.",
  };
};

const commitmentLabel = (commitment: string): string => {
  switch (commitment) {
    case "light":
      return "Usually light; confirm this term";
    case "moderate":
      return "Usually moderate; confirm this term";
    case "substantial":
      return "Usually substantial; ask about peak weeks";
    default:
      return "Varies by role and term";
  }
};

/** Logistics are kept separate from fit so access never becomes a personality signal. */
export const clubIntelligence = (
  schoolId: string,
  club: SchoolClub,
): ClubIntelligence => ({
  clubId: club.id,
  schoolId,
  ...accessDetails(club.membershipAccess),
  commitmentLabel: commitmentLabel(club.commitment),
  reviewedOn: CLUB_DATA_REVIEWED_ON,
  freshnessNote:
    "Organization status, meetings, and recruiting can change. Verify on the linked official page before attending.",
  primaryUrl: sourceForClub(club),
  directoryUrl: club.directoryUrl,
});

export type CampusActionKind = "verify" | "observe" | "try" | "reflect";

export type CampusAction = {
  id: string;
  schoolId: string;
  clubId: string;
  kind: CampusActionKind;
  title: string;
  detail: string;
  timing: "anytime" | "next-public-opportunity" | "after-participating";
  effort: "5 minutes" | "20 minutes" | "one meeting";
  url?: string;
  reflectionPrompt?: string;
};

/** Creates useful experiments without claiming a meeting date or current availability. */
export const campusActionsForClub = (
  schoolId: string,
  club: SchoolClub,
): readonly CampusAction[] => {
  const intelligence = clubIntelligence(schoolId, club);
  return [
    {
      id: `${schoolId}:${club.id}:verify`,
      schoolId,
      clubId: club.id,
      kind: "verify",
      title: `Check ${club.name}`,
      detail: `Confirm its current status, next public opportunity, access, and time commitment. ${intelligence.accessLabel}.`,
      timing: "anytime",
      effort: "5 minutes",
      url: intelligence.primaryUrl,
    },
    {
      id: `${schoolId}:${club.id}:observe`,
      schoolId,
      clubId: club.id,
      kind: "observe",
      title: "Try one real room",
      detail: club.whyFieldwork,
      timing: "next-public-opportunity",
      effort: "one meeting",
      url: intelligence.primaryUrl,
      reflectionPrompt:
        "What part of the actual work pulled you in—and what part only sounded good beforehand?",
    },
    {
      id: `${schoolId}:${club.id}:reflect`,
      schoolId,
      clubId: club.id,
      kind: "reflect",
      title: "Capture the signal",
      detail:
        "Record energy, frustration, curiosity after the novelty, and whether you would return without résumé credit.",
      timing: "after-participating",
      effort: "5 minutes",
      reflectionPrompt:
        "Would you choose to do this again if nobody else ever saw it on your résumé? Why?",
    },
  ];
};

export const campusActionsForSchool = (
  schoolId: string,
  preferredClubIds: readonly string[] = [],
  limit = 6,
): readonly CampusAction[] => {
  const clubs = clubsForSchool(schoolId);
  const preferred = new Map(preferredClubIds.map((id, index) => [id, index]));
  const ordered = [...clubs].sort((a, b) => {
    const aRank = preferred.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bRank = preferred.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });
  return ordered
    .flatMap((club) => campusActionsForClub(schoolId, club))
    .slice(0, limit);
};

export const campusCoverage = (): Readonly<
  Record<string, { clubCount: number; actionCount: number }>
> =>
  Object.fromEntries(
    schoolRegistry
      .filter((school) => school.id !== "other")
      .map((school) => {
        const clubs = clubsForSchool(school.id);
        return [
          school.id,
          { clubCount: clubs.length, actionCount: clubs.length * 3 },
        ];
      }),
  );
