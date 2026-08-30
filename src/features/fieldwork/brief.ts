import type { Family, SchoolData } from "../../data/schools/types";
import { selectAcademicSource } from "../resources/model";
import { workSamples } from "./workSamples";

export type MissionBrief = {
  title: string;
  prompt: string;
  steps: readonly string[];
  deliverable: string;
  resource?: { label: string; url: string };
  outreach?: string;
};

export function buildMissionBrief(
  missionId: string,
  focus: { name: string; family: Family },
  school: SchoolData,
  campusResource?: { title: string; url?: string },
): MissionBrief {
  const field = focus.name.toLowerCase();
  const academic = selectAcademicSource(field, school);
  const resource = campusResource?.url
    ? { label: campusResource.title, url: campusResource.url }
    : academic;
  switch (missionId.split(":").at(-1)) {
    case "work-sample":
      return workSamples[focus.family];
    case "preview-course":
      return {
        title: `Look inside a ${field} course`,
        prompt:
          "Don't just read the course title. Find the recurring work behind it.",
        steps: [
          "Open the official academic source below, or your campus catalog. Find one introductory course in this field.",
          "Look for a syllabus or assignment description. Note one typical task and one prerequisite to verify.",
          "Spend five minutes attempting a small part of the task. If no sample is public, use the work-sample mission instead.",
        ],
        deliverable:
          "The course name, one actual task, and the part you would want to keep exploring.",
        resource: academic,
      };
    case "find-group":
      return {
        title: `Find a low-pressure way into ${field}`,
        prompt:
          "Your goal is one accessible first visit—not a membership commitment.",
        steps: [
          "Open a campus organization page and confirm it is currently active.",
          "Find a public meeting, newcomer activity, or organizer contact. Check access requirements.",
          "Write down or send the question below. If the group is selective, ask what non-members can attend.",
        ],
        deliverable:
          "One group, its contact or next step, and how a newcomer can participate.",
        resource,
        outreach: `Hi! I'm a ${school.shortName} student exploring ${field}. Is there a beginner-friendly meeting or activity I could try without committing to membership? What should I know before visiting?`,
      };
    case "ask-hard-question":
    case "talk-to-major":
      return {
        title: `Have one honest conversation about ${field}`,
        prompt:
          "Ask for ten minutes. A student group or department peer advisor is a useful starting point; nobody has to share private information.",
        steps: [
          "Find a peer advisor or student organization contact through an official campus page.",
          "Use the invitation below. Only send it yourself if you want to.",
          "Ask: Which assignment took the most effort? What do you repeat every week? What would you try before choosing this field?",
        ],
        deliverable:
          "One concrete example of routine work and one thing you want to test yourself. Reflect after the conversation, not just after sending the invitation.",
        resource,
        outreach: `Hi! I'm exploring ${field} at ${school.shortName}. Would you have ten minutes to talk about what the coursework is actually like—including the frustrating parts? No worries if now isn't a good time.`,
      };
    case "attend-event":
      return {
        title: `Try one ${field} gathering`,
        prompt:
          "Choose a public talk, beginner workshop, or open student meeting. Verify the date and access before going.",
        steps: [
          "Use an official campus page to find a current event related to this field.",
          "Check time, location, cost, and whether newcomers may attend. Put the details in your calendar if useful.",
          "During the event, notice one activity you enjoyed and one that felt difficult. An online public event counts too.",
        ],
        deliverable:
          "The event you attended and a specific moment you would—or wouldn't—repeat.",
        resource,
      };
    default:
      return {
        title: "Decide what to test next",
        prompt:
          "Review real experiences, not the excitement of the label. If you haven't tried anything yet, start with the work sample.",
        steps: [
          "Look at your completed missions and name the one that taught you most.",
          "Write the strongest evidence for this direction and the strongest evidence against it.",
          "Choose one next step: explore deeper, compare another field, or pause this direction. None is a permanent commitment.",
        ],
        deliverable:
          "A provisional decision and the next piece of evidence that could change it.",
      };
  }
}
