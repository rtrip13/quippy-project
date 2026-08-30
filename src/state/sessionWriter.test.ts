import assert from "node:assert/strict";
import test from "node:test";
import { createSessionWriter, type SaveStatus } from "./sessionWriter";

test("coalesces a burst of edits into one write of the latest snapshot", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const writes: string[] = [];
  const statuses: SaveStatus[] = [];
  const writer = createSessionWriter(
    async (value) => {
      writes.push(value);
    },
    (status) => statuses.push(status),
  );
  t.after(() => writer.dispose());
  for (let revision = 1; revision <= 20; revision++) {
    writer.enqueue({ revision, serialized: `edit-${revision}` });
  }
  assert.deepEqual(writes, []);
  t.mock.timers.tick(250);
  await writer.flush();
  assert.deepEqual(writes, ["edit-20"]);
  assert.equal(statuses.at(-1), "saved");
  writer.enqueue({ revision: 20, serialized: "edit-20" });
  await writer.flush();
  assert.equal(writes.length, 1);
});

test("serializes writes and does not report saved while a newer edit is pending", async (t) => {
  const writes: string[] = [];
  const statuses: SaveStatus[] = [];
  let release!: () => void;
  const writer = createSessionWriter(
    (value) => {
      writes.push(value);
      return value === "first"
        ? new Promise<void>((resolve) => {
            release = resolve;
          })
        : Promise.resolve();
    },
    (status) => statuses.push(status),
  );
  t.after(() => writer.dispose());
  writer.enqueue({ revision: 1, serialized: "first" });
  const first = writer.flush();
  await Promise.resolve();
  writer.enqueue({ revision: 2, serialized: "intermediate" });
  writer.enqueue({ revision: 3, serialized: "latest" });
  assert.deepEqual(writes, ["first"]);
  assert.equal(statuses.at(-1), "saving");
  release();
  await first;
  await writer.flush();
  assert.deepEqual(writes, ["first", "latest"]);
  assert.equal(statuses.at(-1), "saved");
});

test("retries failures without creating concurrent writes", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let attempts = 0;
  const statuses: SaveStatus[] = [];
  const writer = createSessionWriter(
    async () => {
      if (++attempts === 1) throw new Error("Storage unavailable");
    },
    (status) => statuses.push(status),
  );
  t.after(() => writer.dispose());
  writer.enqueue({ revision: 1, serialized: "saved after retry" });
  await writer.flush();
  assert.equal(statuses.at(-1), "error");
  t.mock.timers.tick(1500);
  await writer.flush();
  assert.equal(attempts, 2);
  assert.equal(statuses.at(-1), "saved");
});

test("a reset supersedes an older failed write", async (t) => {
  const writes: string[] = [];
  let reject!: (error: Error) => void;
  const writer = createSessionWriter(
    (value) => {
      writes.push(value);
      return value === "old"
        ? new Promise<void>((_, fail) => {
            reject = fail;
          })
        : Promise.resolve();
    },
    () => undefined,
  );
  t.after(() => writer.dispose());
  writer.enqueue({ revision: 5, serialized: "old" });
  const old = writer.flush();
  await Promise.resolve();
  writer.enqueue({ revision: 6, serialized: "reset" });
  reject(new Error("Storage unavailable"));
  await old;
  await writer.flush();
  assert.deepEqual(writes, ["old", "reset"]);
});

test("background flush bypasses the debounce delay", async (t) => {
  const writes: string[] = [];
  const writer = createSessionWriter(
    async (value) => {
      writes.push(value);
    },
    () => undefined,
  );
  t.after(() => writer.dispose());
  writer.enqueue({ revision: 1, serialized: "before background" });
  await writer.flush();
  assert.deepEqual(writes, ["before background"]);
});

test("unmount finishes the latest queued snapshot after an older write", async () => {
  const writes: string[] = [];
  const statuses: SaveStatus[] = [];
  let release!: () => void;
  const writer = createSessionWriter(
    (value) => {
      writes.push(value);
      return value === "old"
        ? new Promise<void>((resolve) => {
            release = resolve;
          })
        : Promise.resolve();
    },
    (status) => statuses.push(status),
  );
  writer.enqueue({ revision: 1, serialized: "old" });
  const old = writer.flush();
  await Promise.resolve();
  writer.enqueue({ revision: 2, serialized: "latest" });
  writer.dispose();
  writer.dispose();
  release();
  await old;
  await Promise.resolve();
  assert.deepEqual(writes, ["old", "latest"]);
  assert.deepEqual(statuses, ["saving", "saving"]);
});

test("dispose cancels retries and ignores completion callbacks", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let reject!: (error: Error) => void;
  const statuses: SaveStatus[] = [];
  let attempts = 0;
  const writer = createSessionWriter(
    () => {
      attempts++;
      return new Promise<void>((_, fail) => {
        reject = fail;
      });
    },
    (status) => statuses.push(status),
  );
  writer.enqueue({ revision: 1, serialized: "old" });
  const pending = writer.flush();
  await Promise.resolve();
  writer.dispose();
  reject(new Error("Storage unavailable"));
  await pending;
  t.mock.timers.tick(5000);
  assert.equal(attempts, 1);
  assert.deepEqual(statuses, ["saving"]);
});
