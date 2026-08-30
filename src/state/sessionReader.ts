/** A failed read must never be mistaken for an empty device and overwritten. */
export async function readSessionSnapshot(
  read: () => Promise<string | null>,
): Promise<{ status: "ready"; data: unknown } | { status: "error" }> {
  try {
    const stored = await read();
    return {
      status: "ready",
      data: stored === null ? null : JSON.parse(stored),
    };
  } catch {
    return { status: "error" };
  }
}
