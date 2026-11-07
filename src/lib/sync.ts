import { localDb } from "./local";

let running = false;

export async function syncNow(): Promise<number> {
  if (running || !navigator.onLine) return 0;
  running = true;
  try {
    const pending = await localDb.records.where("synced").equals(0).limit(100).toArray();
    if (!pending.length) return 0;

    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        records: pending.map(({ synced: _synced, ...r }) => r),
      }),
    });
    if (!res.ok) return 0;

    const { accepted } = (await res.json()) as { accepted: string[] };
    await localDb.records.where("id").anyOf(accepted).modify({ synced: 1 });
    return accepted.length;
  } catch {
    return 0;
  } finally {
    running = false;
  }
}
