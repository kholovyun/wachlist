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
- SQLite file in `server/data` (tests use `WALLET_DB_PATH`)
- Mocks are deterministic from address + network
- No auth for this demo
- Skipped pagination and real chain calls on purpose
