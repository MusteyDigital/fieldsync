"use client";
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { localDb, deviceId } from "@/lib/local";
import { syncNow } from "@/lib/sync";

function getPosition(): Promise<GeolocationPosition | null> {
  return new Promise((res) => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(res, () => res(null), {
      timeout: 2500,
      maximumAge: 60000,
    });
  });
}

export default function Collector() {
  const [online, setOnline] = useState(true);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const records = useLiveQuery(() => localDb.records.orderBy("createdAt").reverse().toArray(), []);
  const pending = records?.filter((r) => r.synced === 0).length ?? 0;

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => {
      setOnline(true);
      syncNow();
    };
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    syncNow();
    const t = setInterval(syncNow, 15000);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
      clearInterval(t);
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t || busy.current) return;
    busy.current = true;
    setSaving(true);

    const n = notes;
    const createdAt = new Date().toISOString();
    setTitle("");
    setNotes("");

    try {
      const pos = await getPosition();
      await localDb.records.add({
        id: crypto.randomUUID(),
        deviceId: deviceId(),
        title: t,
        notes: n,
        lat: pos?.coords.latitude ?? null,
        lng: pos?.coords.longitude ?? null,
        createdAt,
        synced: 0,
      });
      syncNow();
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">FieldSync</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs text-white ${online ? "bg-green-600" : "bg-red-600"}`}
        >
          {online ? "Online" : "Offline"} · {pending} pending
        </span>
      </header>

      <form onSubmit={save} className="space-y-2">
        <input
          className="w-full rounded border border-gray-400 bg-white p-2 text-black placeholder-gray-500"
          placeholder="Title (e.g. Site visit: Garki)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded border border-gray-400 bg-white p-2 text-black placeholder-gray-500"
          rows={3}
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          disabled={saving}
          className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save record"}
        </button>
      </form>

      <ul className="space-y-2">
        {records?.map((r) => (
          <li key={r.id} className="rounded border p-2 text-sm">
            <div className="flex justify-between">
              <b>{r.title}</b>
              <span>{r.synced ? "✅ synced" : "⏳ queued"}</span>
            </div>
            <div className="text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
