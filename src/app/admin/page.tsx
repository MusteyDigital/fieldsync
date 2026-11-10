"use client";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  device_id: string;
  title: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  synced_at: string;
};

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [seen] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let first = true;
    let t: ReturnType<typeof setInterval> | undefined;
    const load = async () => {
      try {
        const r = await fetch("/api/records", { cache: "no-store" });
        if (r.status === 401) {
          setAuthed(false);
          clearInterval(t);
          return;
        }
        const data: Row[] = (await r.json()).records;
        setAuthed(true);
        const incoming = data.filter((x) => !seen.has(x.id)).map((x) => x.id);
        data.forEach((x) => seen.add(x.id));
        setRows(data);
        if (!first && incoming.length) {
          setFresh(new Set(incoming));
          setTimeout(() => setFresh(new Set()), 3000);
        }
        first = false;
      } catch {}
    };
    load();
    t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [attempt, seen]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode: pass }),
    });
    if (r.ok) {
      setPass("");
      setAuthed(null);
      setAttempt((n) => n + 1);
    } else {
      setErr("Wrong passcode");
    }
  }

  if (authed === null) {
    return <main className="p-6 text-gray-400">Loading...</main>;
  }

  if (authed === false) {
    return (
      <main className="mx-auto max-w-sm space-y-3 p-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        <form onSubmit={login} className="space-y-2">
          <input
            type="password"
            autoFocus
            className="w-full rounded border border-gray-400 bg-white p-2 text-black placeholder-gray-500"
            placeholder="Passcode"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button className="w-full rounded bg-blue-600 p-2 text-white">Sign in</button>
        </form>
        {err && <p className="text-sm text-red-500">{err}</p>}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-1 text-2xl font-bold">Live Dashboard</h1>
      <p className="mb-4 text-sm text-gray-400">{rows.length} records · refreshes every 2s</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="p-2">Title</th>
              <th className="p-2">Device</th>
              <th className="p-2">Location</th>
              <th className="p-2">Captured</th>
              <th className="p-2">Arrived</th>
              <th className="p-2">Delay</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const delay = Math.max(
                0,
                Math.round((new Date(r.synced_at).getTime() - new Date(r.created_at).getTime()) / 1000)
              );
              return (
                <tr
                  key={r.id}
                  className={`border-t border-gray-700 transition-colors duration-1000 ${
                    fresh.has(r.id) ? "bg-green-900" : ""
                  }`}
                >
                  <td className="p-2 font-medium">{r.title}</td>
                  <td className="p-2">{r.device_id.slice(0, 8)}</td>
                  <td className="p-2">
                    {r.lat != null && r.lng != null ? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}` : "—"}
                  </td>
                  <td className="p-2">{new Date(r.created_at).toLocaleTimeString()}</td>
                  <td className="p-2">{new Date(r.synced_at).toLocaleTimeString()}</td>
                  <td className="p-2">{delay < 5 ? "instant" : `${delay}s after capture`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
