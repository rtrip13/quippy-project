import { MajorFitProfile } from "../../../domain";
import { Family, majors } from "./majors";

// Broad prototype heuristics for the felt work of a program. These are deliberately editable,
// explainable hypotheses—not aptitude measurements or claims about every student's experience.
const familyDefaults: Record<Family, Omit<MajorFitProfile, "id" | "name">> = {
  "Computing & Data": {
    workModes: { analyze: 0.9, build: 0.9, investigate: 0.6 },
    activityModes: { make: 0.8, research: 0.5 },
    environment: { deepFocus: 0.8, independent: 0.6, collaborative: 0.4 },
    friction: { debugging: 0.9, precision: 0.7 },
  },
  "Engineering & Built Environment": {
    workModes: { analyze: 0.8, build: 1, create: 0.6, investigate: 0.6 },
    activityModes: { make: 1, design: 0.7 },
    environment: { handsOn: 0.8, collaborative: 0.6, structured: 0.5 },
    friction: { iteration: 0.8, precision: 0.8 },
  },
  "Natural & Physical Sciences": {
    workModes: { analyze: 0.8, investigate: 1, synthesize: 0.5 },
    activityModes: { research: 1, make: 0.4 },
    environment: { deepFocus: 0.7, handsOn: 0.6 },
    friction: { precision: 0.8, ambiguity: 0.6, repetition: 0.5 },
  },
  "Health & Human Services": {
    workModes: { investigate: 0.7, serve: 1, explain: 0.6 },
    activityModes: { volunteer: 0.8, research: 0.5, teach: 0.5 },
    environment: { collaborative: 0.8, handsOn: 0.7, fastPaced: 0.6 },
    friction: { precision: 0.7, coordination: 0.7, repetition: 0.5 },
  },
  "Business & Economics": {
    workModes: { analyze: 0.7, organize: 0.8, strategize: 1, persuade: 0.6 },
    activityModes: { discuss: 0.6, compete: 0.5, research: 0.4 },
    environment: { collaborative: 0.7, publicFacing: 0.5, fastPaced: 0.5 },
    friction: { ambiguity: 0.7, coordination: 0.6 },
  },
  "Social & Behavioral Sciences": {
    workModes: { investigate: 0.8, synthesize: 0.8, explain: 0.6, serve: 0.4 },
    activityModes: { research: 0.8, discuss: 0.7 },
    environment: { collaborative: 0.5, deepFocus: 0.5 },
    friction: { ambiguity: 0.8, coordination: 0.4 },
  },
  "Humanities & Languages": {
    workModes: { synthesize: 1, explain: 0.9, create: 0.6, investigate: 0.5 },
    activityModes: { research: 0.8, discuss: 0.8, teach: 0.4 },
    environment: { independent: 0.7, deepFocus: 0.8 },
    friction: { ambiguity: 0.8, iteration: 0.7 },
  },
  "Arts, Design & Performance": {
    workModes: { create: 1, build: 0.5, explain: 0.4 },
    activityModes: { design: 1, perform: 0.8, make: 0.8 },
    environment: { publicFacing: 0.7, handsOn: 0.8, collaborative: 0.6 },
    friction: { iteration: 1, repetition: 0.8, ambiguity: 0.6 },
  },
  "Communication & Media": {
    workModes: { explain: 0.9, persuade: 0.8, create: 0.8, synthesize: 0.7 },
    activityModes: { discuss: 0.8, perform: 0.5, design: 0.5 },
    environment: { publicFacing: 0.8, collaborative: 0.7, fastPaced: 0.6 },
    friction: { iteration: 0.7, coordination: 0.6 },
  },
  "Education, Public Service & Policy": {
    workModes: {
      serve: 0.8,
      explain: 0.8,
      organize: 0.7,
      persuade: 0.7,
      synthesize: 0.6,
    },
    activityModes: { teach: 0.8, volunteer: 0.7, discuss: 0.7, research: 0.5 },
    environment: { collaborative: 0.8, publicFacing: 0.7 },
    friction: { ambiguity: 0.8, coordination: 0.8 },
  },
  "Interdisciplinary & Individualized": {
    workModes: {
      synthesize: 1,
      create: 0.7,
      investigate: 0.7,
      strategize: 0.5,
    },
    activityModes: { research: 0.7, design: 0.5, discuss: 0.5 },
    environment: { independent: 0.7, collaborative: 0.5 },
    friction: { ambiguity: 1, iteration: 0.6 },
  },
};

const overrides: Record<string, Partial<MajorFitProfile>> = {
  economics: {
    workModes: {
      analyze: 0.9,
      investigate: 0.8,
      strategize: 1,
      synthesize: 0.8,
    },
    activityModes: { research: 0.7, discuss: 0.6 },
    friction: { ambiguity: 0.9, precision: 0.6 },
  },
  "computer-science-bs": {
    workModes: { analyze: 0.9, build: 1, investigate: 0.7, create: 0.5 },
    activityModes: { make: 0.9 },
    environment: { deepFocus: 0.9, independent: 0.7, collaborative: 0.5 },
    friction: { debugging: 1, precision: 0.8, iteration: 0.8 },
  },
  "computer-science-bse": {
    workModes: { analyze: 0.9, build: 1, investigate: 0.7, create: 0.5 },
    activityModes: { make: 0.9 },
    environment: { deepFocus: 0.9, independent: 0.7, collaborative: 0.5 },
    friction: { debugging: 1, precision: 0.8, iteration: 0.8 },
  },
  "public-policy": {
    workModes: {
      analyze: 0.7,
      synthesize: 0.9,
      persuade: 0.9,
      organize: 0.7,
      serve: 0.6,
    },
    activityModes: { research: 0.8, discuss: 0.9, volunteer: 0.6 },
    environment: { collaborative: 0.8, publicFacing: 0.8 },
    friction: { ambiguity: 1, coordination: 0.7 },
  },
  psychology: {
    workModes: { investigate: 1, synthesize: 0.7, serve: 0.6, explain: 0.5 },
    activityModes: { research: 0.9, volunteer: 0.5 },
    friction: { ambiguity: 0.8, precision: 0.5 },
  },
  english: {
    workModes: { synthesize: 1, explain: 1, create: 0.8 },
    activityModes: { research: 0.7, discuss: 0.8 },
    environment: { independent: 0.8, deepFocus: 0.9 },
    friction: { ambiguity: 1, iteration: 0.9 },
  },
  business: {
    workModes: { strategize: 1, organize: 0.9, persuade: 0.8, analyze: 0.6 },
    activityModes: { compete: 0.7, discuss: 0.8 },
    environment: { collaborative: 0.9, publicFacing: 0.8, fastPaced: 0.7 },
    friction: { coordination: 0.9, ambiguity: 0.6 },
  },
  nursing: {
    workModes: { serve: 1, investigate: 0.9, explain: 0.7, organize: 0.6 },
    activityModes: { volunteer: 0.9, teach: 0.6 },
    environment: { handsOn: 1, collaborative: 1, fastPaced: 0.9 },
    friction: { precision: 0.9, coordination: 0.9, repetition: 0.6 },
  },
  architecture: {
    workModes: { create: 1, build: 0.9, synthesize: 0.6 },
    activityModes: { design: 1, make: 0.9 },
    environment: { handsOn: 0.8, collaborative: 0.6, deepFocus: 0.7 },
    friction: { iteration: 1, precision: 0.7, ambiguity: 0.7 },
  },
  "mechanical-engineering": {
    workModes: { build: 1, analyze: 0.9, investigate: 0.7, create: 0.6 },
    activityModes: { make: 1, design: 0.8 },
    environment: { handsOn: 0.9, collaborative: 0.6 },
    friction: { precision: 0.9, iteration: 0.8 },
  },
  history: {
    workModes: { synthesize: 1, investigate: 0.8, explain: 0.8 },
    activityModes: { research: 1, discuss: 0.7 },
    environment: { independent: 0.8, deepFocus: 0.9 },
    friction: { ambiguity: 0.9, iteration: 0.6 },
  },
};

export const umichMajorProfiles: MajorFitProfile[] = majors.map((major) => ({
  id: major.id,
  name: major.name,
  ...familyDefaults[major.family],
  ...overrides[major.id],
}));
