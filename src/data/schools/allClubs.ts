import type { ClubProfile } from "../../domain";
import { berkeleyClubs } from "./berkeley/clubs";
import { clubsByCampusId } from "./campusClubs";
import { uclaClubs } from "./ucla/clubs";
import { ufClubs } from "./uf/clubs";
import { umichClubs } from "./umich/clubs";
import { utAustinClubs } from "./utexas/clubs";
import { uwSeattleClubs } from "./uw/clubs";

export type SchoolClub = ClubProfile & {
  categories: readonly string[];
  description: string;
  membershipAccess: string;
  commitment: string;
  whyFieldwork: string;
  maizePagesUrl?: string;
  sourceUrl?: string;
  sourceUrls?: readonly string[];
  clubUrl?: string;
  directoryUrl?: string;
};

export const schoolClubsById: Readonly<Record<string, readonly SchoolClub[]>> =
  {
    umich: umichClubs,
    "uc-berkeley": berkeleyClubs,
    ucla: uclaClubs,
    ufl: ufClubs,
    "ut-austin": utAustinClubs,
    "uw-seattle": uwSeattleClubs,
    ...clubsByCampusId,
  };

export const clubsForSchool = (schoolId: string): readonly SchoolClub[] =>
  schoolClubsById[schoolId] ?? [];
