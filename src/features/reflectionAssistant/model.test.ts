import assert from "node:assert/strict";
import test from "node:test";
import {
  createLocalReflectionResult,
  createReflectionAssistant,
} from "./model";

const input = {
  missionTitle: "Try a work sample",
  energy: "energized" as const,
  friction: ["iteration"],
  note: "I liked building with a team, even when we got stuck.",
  leadingDirections: ["Design"],
};

test("local reflection assistance is deterministic and theme-aware", () => {
  const first = createLocalReflectionResult(input);
  const second = createLocalReflectionResult(input);
  assert.deepEqual(first, second);
  assert.deepEqual(first.themes.slice(0, 2), ["people", "making"]);
  assert.equal(first.source, "local");
});

test("uses a valid proxy response without sending provider credentials", async () => {
  let request: RequestInit | undefined;
  const assistant = createReflectionAssistant({
    proxyUrl: "https://example.test/reflect",
    fetch: async (_url, init) => {
      request = init;
      return new Response(
        JSON.stringify({
          summary: "A concise pattern.",
          themes: ["collaboration"],
          followUpQuestions: ["What happened next?"],
        }),
        { status: 200 },
      );
    },
  });
  const result = await assistant(input);
  assert.equal(result.source, "proxy");
  assert.deepEqual(request?.headers, { "Content-Type": "application/json" });
});

test("falls back locally on proxy failure or malformed output", async () => {
  const assistant = createReflectionAssistant({
    proxyUrl: "https://example.test/reflect",
    fetch: async () => new Response("{}", { status: 200 }),
  });
  assert.equal((await assistant(input)).source, "local");
});
