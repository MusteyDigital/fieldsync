# FieldSync

Offline-first field data collector PWA. Capture records with no network, and they sync automatically when the connection returns.

![Offline queue](docs/offline.png)

## Why

Field teams (surveyors, inspectors, agents) often work where connectivity is poor. FieldSync never blocks on the network: every record is saved on the device first, then synced in the background.

## How it works

- **Capture:** records are written to IndexedDB (Dexie) with a client-generated UUID and a GPS stamp.
- **Queue:** unsynced records are flagged and retried on reconnect and every 15 seconds.
- **Idempotent sync:** the API uses `INSERT ... ON CONFLICT (id) DO NOTHING`, so retries and double sends never create duplicates.
- **Installable:** a service worker caches the app shell, so it loads with no network and installs as a standalone app.
- **Live dashboard:** `/admin` polls the API and shows when each record was captured vs when it arrived.

![Live dashboard](docs/dashboard.png)

## Stack

Next.js (App Router, TypeScript), Tailwind, Dexie (IndexedDB), PostgreSQL, Zod, service worker.

## Run locally

```bash
git clone git@github.com:MusteyDigital/fieldsync.git
cd fieldsync
npm install
createdb fieldsync
psql fieldsync -f db/schema.sql
echo 'DATABASE_URL=postgres://postgres:postgres@localhost:5432/fieldsync' > .env.local
npm run build && npm start
```

The service worker only registers in a production build.

## Demo

1. Open `/admin` in one window and `/` in another.
2. In DevTools, Application, Service workers, tick **Offline**.
3. Save a few records. They show as queued.
4. Untick **Offline**. They sync and appear on the dashboard with their capture delay.

## Roadmap

- Conflict resolution for edited records
- Photo attachments with a chunked upload queue
- Per-agent auth and devices
