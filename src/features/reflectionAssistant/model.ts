import type { ReflectionEnergy } from "../../state";

export type ReflectionAssistantInput = {
  missionTitle: string;
  energy: ReflectionEnergy;
  friction: string[];
  note: string;
  leadingDirections?: string[];
};

export type ReflectionAssistantResult = {
  summary: string;
  themes: string[];
  followUpQuestions: string[];
  source: "local" | "proxy";
};

export type ReflectionAssistantOptions = {
  /** Your server endpoint. Never put a model-provider API key in the mobile app. */
  proxyUrl?: string;
  fetch?: typeof globalThis.fetch;
};

const themeKeywords: Array<[string, RegExp]> = [
  ["people", /\b(team|people|together|group|collaborat|friend|community)\w*/i],
  ["making", /\b(build|make|design|create|prototype|hands-on)\w*/i],
  ["ideas", /\b(learn|question|research|idea|understand|discover|curious)\w*/i],
  ["impact", /\b(help|serve|impact|change|support|care)\w*/i],
  ["communication", /\b(write|speak|present|explain|debate|story)\w*/i],
  ["challenge", /\b(hard|stuck|confus|frustrat|overwhelm|difficult)\w*/i],
];

const sentence = (text: string) => text.trim().replace(/\s+/g, " ");

export function createLocalReflectionResult(
  input: ReflectionAssistantInput,
): ReflectionAssistantResult {
  const note = sentence(input.note);
  const detected = themeKeywords
    .filter(([, pattern]) => pattern.test(note))
    .map(([theme]) => theme);
  const themes = [...new Set([...detected, ...input.friction])].slice(0, 4);
  const energyText =
    input.energy === "energized"
      ? "gave you energy"
      : input.energy === "drained"
        ? "cost you energy"
        : "felt mixed or neutral";
  const detail = note
    ? ` You noted: “${note.slice(0, 180)}${note.length > 180 ? "…" : ""}”`
    : "";
  const direction = input.leadingDirections?.[0];

  return {
    summary: `${input.missionTitle} ${energyText}.${detail}`,
    themes,
    followUpQuestions: [
      input.energy === "drained"
        ? "Was the field itself draining, or was it the format, people, pace, or difficulty?"
        : "Which exact part would you choose to do again without résumé credit?",
      themes[0]
        ? `Where else have you noticed the same ${themes[0]} pattern?`
        : "What moment from the experience is easiest to remember, and why?",
      direction
        ? `What experiment would make you less certain—not more certain—about ${direction}?`
        : "What is one nearby experience that would test the opposite hypothesis?",
    ],
    source: "local",
  };
}

const isValidProxyResult = (
  value: unknown,
): value is Omit<ReflectionAssistantResult, "source"> => {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  return (
    typeof result.summary === "string" &&
    Array.isArray(result.themes) &&
    result.themes.every((item) => typeof item === "string") &&
    Array.isArray(result.followUpQuestions) &&
    result.followUpQuestions.every((item) => typeof item === "string")
  );
};

export function createReflectionAssistant(
  options: ReflectionAssistantOptions = {},
) {
  return async (
    input: ReflectionAssistantInput,
  ): Promise<ReflectionAssistantResult> => {
    const fallback = createLocalReflectionResult(input);
    const proxyUrl = options.proxyUrl?.trim();
    const fetcher = options.fetch ?? globalThis.fetch;
    if (!proxyUrl || !fetcher) return fallback;

    try {
      const response = await fetcher(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: 1, task: "reflect", input }),
      });
      if (!response.ok) return fallback;
      const result: unknown = await response.json();
      if (!isValidProxyResult(result)) return fallback;
      return {
        summary: result.summary.slice(0, 600),
        themes: result.themes.slice(0, 6),
        followUpQuestions: result.followUpQuestions.slice(0, 4),
        source: "proxy",
      };
    } catch {
      return fallback;
    }
  };
}
