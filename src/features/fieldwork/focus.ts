import type { Family, Major, SchoolData } from "../../data/schools/types";
import { workSamples } from "./workSamples";

export type FieldworkFocus = {
  id: string;
  name: string;
  family: Family;
  program?: Major;
};
export const directionId = (family: string) =>
  `direction-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

export function fieldworkFocusOptions(school: SchoolData): FieldworkFocus[] {
  return [
    ...Object.keys(workSamples).map((family) => ({
      id: directionId(family),
      name: family,
      family: family as Family,
    })),
    ...school.catalog.programs.map((program) => ({ ...program, program })),
  ];
}

/** A selected field survives rank changes; an invalid/cross-school ID does not. */
export function resolveFieldworkFocus(
  school: SchoolData,
  id?: string | null,
  fallbackId?: string,
): FieldworkFocus {
  const options = fieldworkFocusOptions(school);
  return (
    options.find((option) => option.id === id) ??
    options.find((option) => option.id === fallbackId) ??
    options[0]
  );
}
