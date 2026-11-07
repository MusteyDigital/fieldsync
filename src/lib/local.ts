import Dexie, { Table } from "dexie";

export interface LocalRecord {
  id: string;
  deviceId: string;
  title: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  synced: 0 | 1;
}

class LocalDB extends Dexie {
  records!: Table<LocalRecord, string>;
  constructor() {
    super("fieldsync");
    this.version(1).stores({ records: "id, synced, createdAt" });
  }
}

export const localDb = new LocalDB();

export function deviceId(): string {
  let d = localStorage.getItem("deviceId");
  if (!d) {
    d = crypto.randomUUID();
    localStorage.setItem("deviceId", d);
  }
  return d;
}
