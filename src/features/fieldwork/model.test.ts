import assert from "node:assert/strict";
import test from "node:test";
import { signalsForFieldworkReflection } from "./model";

const reflection = {
  missionId: "preview-course",
  friction: [] as string[],
  note: "",
  recordedAt: "2026-08-30T12:00:00.000Z",
};

test("rich reflection signals strengthen sustained curiosity", () => {
  const signals = signalsForFieldworkReflection({
    ...reflection,
    energy: "energized",
    curiosity: "grew",
    repeatIntent: "yes",
  });
  assert.equal(signals.investigate, 0.8);
  assert.equal(signals.deepFocus, 0.5);
});

test("rich reflection signals distinguish novelty from durable interest", () => {
  const signals = signalsForFieldworkReflection({
    ...reflection,
    energy: "energized",
    curiosity: "faded",
    repeatIntent: "no",
  });
  assert.ok((signals.investigate ?? 0) < 0.1);
  assert.ok((signals.investigate ?? 0) > 0);
});

test("older reflections remain valid without the richer fields", () => {
  const signals = signalsForFieldworkReflection({
    ...reflection,
    energy: "neutral",
  });
  assert.ok(Math.abs((signals.investigate ?? 0) - 0.16) < 0.0001);
});
