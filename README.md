# Wallet Watchlist

App for saving crypto wallet addresses and looking at portfolio / recent activity.
Portfolio data is mocked.

## Stack

- API: Node.js, Express, TypeScript, Zod, SQLite
- UI: React, Vite, React Router, Ant Design

## How to run

Two options, whichever is easier.

### Local (npm)

```bash
npm run install:all
npm run dev
```

Then open http://localhost:5173  
API is on http://localhost:4000, swagger at `/api/docs`.

API tests:

```bash
npm run test:server
```

### Docker

If you don't want to install deps locally, just spin it up with Docker.
Docker Desktop needs to be running.

```bash
docker compose up --build
```

- UI: http://localhost:8080
- API: http://localhost:4000
- Docs: http://localhost:8080/api/docs

SQLite lives in the `wallet-data` volume, so wallets survive restarts.

Stop it with:

```bash
docker compose down
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | liveness |
| GET | `/api/ready` | sqlite check |
| GET | `/api/docs` | swagger |
| GET | `/api/wallets` | list |
| POST | `/api/wallets` | create |
| GET | `/api/wallets/:id` | get one |
| PATCH | `/api/wallets/:id` | update label/notes |
| DELETE | `/api/wallets/:id` | delete |
| GET | `/api/wallets/:id/assets` | mock assets |
| GET | `/api/wallets/:id/activity` | mock activity |

Create body:

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "label": "Treasury",
  "network": "ethereum",
  "notes": "optional"
}
```

Networks: `ethereum`, `bitcoin`, `solana`, `polygon`.
Address is validated per network. Unique key is `(address, network)`.
Responses: `{ data }` or `{ error: { message, details? } }`.
All responses include `x-request-id`.

## Structure

```
server/src/
  app.ts
  server.ts
  modules/wallets/
  infrastructure/
  shared/
client/src/
  pages/
  components/
```

Flow on the API: route → controller → service → repository.

## Notes

- Started from scratch, no starter kit
- API is split into route → controller → service → repository so HTTP and DB stay separate
- Zod validates create/update; invalid address comes back as field errors for the form
- Same address can exist on different networks; unique key is `(address, network)`
- SQLite file in `server/data` (tests use `WALLET_DB_PATH`)
- Portfolio/activity are mocked and deterministic from address + network
- UI is plain Ant Design tables/forms — no heavy state library for three screens
- Can run with npm or Docker; Docker keeps DB in a volume
- Added request ids, `/api/ready`, swagger and a few API tests when there was time left
- No auth, pagination or real chain calls — out of scope for this demo
