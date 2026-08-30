import assert from "node:assert/strict";
import test from "node:test";
import { readSessionSnapshot } from "./sessionReader";

test("a storage outage blocks hydration instead of allowing an empty overwrite", async () => {
  let unavailable = true;
  const read = async () => {
    if (unavailable) throw new Error("Storage unavailable");
    return JSON.stringify({ shortlist: ["saved-program"] });
  };
  assert.deepEqual(await readSessionSnapshot(read), { status: "error" });
  unavailable = false;
  assert.deepEqual(await readSessionSnapshot(read), {
    status: "ready",
    data: { shortlist: ["saved-program"] },
  });
});

test("malformed stored JSON is preserved rather than treated as a new session", async () => {
  for (const stored of ["", "{unfinished", "undefined"]) {
    assert.deepEqual(await readSessionSnapshot(async () => stored), {
      status: "error",
    });
  }
  assert.deepEqual(await readSessionSnapshot(async () => null), {
    status: "ready",
    data: null,
  });
});
