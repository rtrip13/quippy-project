export type SaveStatus = "idle" | "saving" | "saved" | "error";

type Snapshot = { revision: number; serialized: string };

/** One write at a time; rapid edits replace the pending snapshot, not each other. */
export function createSessionWriter(
  write: (serialized: string) => Promise<void>,
  onStatus: (status: SaveStatus) => void,
  delayMs = 250,
  retryMs = 1500,
) {
  let pending: Snapshot | undefined;
  let inFlight: Snapshot | undefined;
  let savedRevision = -1;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let task: Promise<void> | undefined;

  const cancelTimer = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  const schedule = (delay: number) => {
    cancelTimer();
    timer = setTimeout(() => void flush(), delay);
  };

  const flush = (): Promise<void> => {
    cancelTimer();
    if (disposed) return Promise.resolve();
    if (task) return task;
    if (!pending) return Promise.resolve();
    const snapshot = pending;
    pending = undefined;
    inFlight = snapshot;
    task = Promise.resolve()
      .then(() => write(snapshot.serialized))
      .then(() => {
        savedRevision = snapshot.revision;
        if (!disposed) onStatus(pending ? "saving" : "saved");
      })
      .catch(() => {
        if (disposed) return;
        // A newer snapshot (including a reset) always wins over a failed write.
        pending ??= snapshot;
        onStatus("error");
        schedule(retryMs);
      })
      .finally(() => {
        task = undefined;
        inFlight = undefined;
        if (!disposed && pending && timer === undefined) void flush();
      });
    return task;
  };

  return {
    enqueue(snapshot: Snapshot) {
      if (
        disposed ||
        snapshot.revision === savedRevision ||
        snapshot.revision === pending?.revision ||
        snapshot.revision === inFlight?.revision
      )
        return;
      pending = snapshot;
      onStatus("saving");
      if (!inFlight) schedule(delayMs);
    },
    flush,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelTimer();
      const finalSnapshot = pending;
      pending = undefined;
      // Finish the latest edit on unmount, after any older in-flight write.
      // Do not update React state or start retries after disposal.
      if (finalSnapshot) {
        void (task ?? Promise.resolve())
          .then(() => write(finalSnapshot.serialized))
          .catch(() => undefined);
      }
    },
  };
}
