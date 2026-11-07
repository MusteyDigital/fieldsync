CREATE TABLE IF NOT EXISTS records (
  id          UUID PRIMARY KEY,
  device_id   TEXT NOT NULL,
  title       TEXT NOT NULL,
  notes       TEXT NOT NULL DEFAULT '',
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  created_at  TIMESTAMPTZ NOT NULL,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS records_synced_idx ON records (synced_at DESC);
