import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/server-db";

const Rec = z.object({
  id: z.string().uuid(),
  deviceId: z.string().min(1),
  title: z.string().min(1).max(200),
  notes: z.string().max(5000).default(""),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  createdAt: z.string().datetime(),
});

export async function POST(req: Request) {
  const parsed = z.object({ records: z.array(Rec).max(200) }).safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const accepted: string[] = [];
  for (const r of parsed.data.records) {
    await pool.query(
      `INSERT INTO records (id, device_id, title, notes, lat, lng, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [r.id, r.deviceId, r.title, r.notes, r.lat ?? null, r.lng ?? null, r.createdAt]
    );
    accepted.push(r.id);
  }
  return NextResponse.json({ accepted });
}

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, device_id, title, notes, lat, lng, created_at, synced_at
     FROM records ORDER BY synced_at DESC LIMIT 100`
  );
  return NextResponse.json({ records: rows });
}
