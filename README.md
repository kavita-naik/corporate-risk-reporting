# Corporate Risk Reporting (CRR)

A vertical slice of an internal risk-reporting desk: a .NET 10 API over 50,000 synthetic risk positions, and a React + AG Grid Community UI that pages, sorts, filters, and drills without pulling the full dataset into the browser.

## Prerequisites

- .NET SDK 10.0.x (`dotnet --list-sdks`)
- Node.js 18+ and npm

If SDK 10 is not installed:

```bash
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 10.0
export PATH="$HOME/.dotnet:$PATH"
export DOTNET_ROOT="$HOME/.dotnet"
```

No Docker or PostgreSQL is required. The API loads `backend/data/risk_positions.csv` into memory at startup (see [DESIGN.md](DESIGN.md) for the tradeoff).

## Data

The supplied `risk_positions.csv` already contains **50,000** rows. It is copied to `backend/data/risk_positions.csv`. There is no extra seeding step.

## Run locally

Use two terminals.

### 1. API — http://localhost:5080

```bash
cd backend
dotnet test Crr.sln
dotnet run --project src/Crr.Api/Crr.Api.csproj --urls http://localhost:5080
```

Sanity checks:

```bash
curl -s http://localhost:5080/health
curl -s "http://localhost:5080/api/positions?startRow=0&endRow=2&sortField=pnl&sortDir=desc"
curl -s "http://localhost:5080/api/positions/aggregates?groupBy=book"
```

| Endpoint | Purpose |
|---|---|
| `GET /health` | Process up, row count |
| `GET /api/positions` | Server-side page / sort / filter (AG Grid infinite model) |
| `GET /api/positions/aggregates` | Totals for **all rows matching the active filters**, grouped by `book`, `commodity`, or `region` |
| `GET /api/positions/meta` | Distinct books, commodities, regions, dates |
| `GET /api/positions/{tradeId}` | Single-trade detail |

Shared query params: `book`, `commodity`, `counterparty`, `region`, `instrumentType`, `currency`, `search`, `asOfFrom`, `asOfTo`, `pnlMin`, `pnlMax`, `sortField`, `sortDir`, `startRow`, `endRow`, `groupBy`.

### 2. UI — http://localhost:5173

```bash
cd frontend
npm install
npm test
npm run dev
```

Optional: `VITE_API_URL=http://localhost:5080` (this is the default).

## What to try

- Scroll the **Positions** grid — only 100-row blocks are requested.
- Sort P&L, filter a book, or type a counterparty in Search.
- Open **By book** / **By commodity** for API-backed group totals, then click a row to drill into the matching trades.
- Click a trade for the detail drawer. Column layout and named views persist in `localStorage`.

## Tests and CI

- Backend: `dotnet test` in `backend/` (filter, sort, page, aggregation rules).
- Frontend: `npm test` (query-string builder) and `npm run build`.
- GitHub Actions: `.github/workflows/ci.yml` runs both.

## Layout

```
backend/src/Crr.Api/     ASP.NET Core 10 API
backend/tests/           xUnit
backend/data/            50k-row CSV
frontend/                Vite + React + TypeScript + AG Grid Community
```
