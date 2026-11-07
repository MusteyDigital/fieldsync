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
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [seen] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let first = true;
    const load = async () => {
      try {
        const r = await fetch("/api/records", { cache: "no-store" });
        const data: Row[] = (await r.json()).records;
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
    const t = setInterval(load, 2000);
    return () => clearInterval(t);
  }, [seen]);

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
