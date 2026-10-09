# Design notes

## Shape of the slice

The brief asks for a fast reporting surface over ~50k risk positions, not a warehouse. I kept the core narrow: one filtered universe, two read models (paged rows + group totals), and a UI that never materializes the full set.

Layering on the API is conventional rather than ceremonial: `Controllers` bind HTTP, `PositionQueryService` owns filter/sort/page/aggregate rules, `InMemoryPositionStore` is the data access boundary. List and aggregate endpoints share `PositionQuery`, so KPI tiles and the chart always cover the same rows as the grid — not the current page.

## Handling the dataset

50k rows is small for a server and large for a browser. The CSV is parsed once at startup (CsvHelper, ~100ms on a laptop) and held in memory with a `tradeId` dictionary for detail lookups. Each request is LINQ filter → sort → `Skip`/`Take`. That is fast enough here (low-single-digit milliseconds) and keeps the submission runnable without Docker.

AG Grid Community uses the **Infinite Row Model** with 100-row blocks. Sorting, toolbar filters, and column text filters are forwarded as query parameters. The UI only ever holds a handful of blocks, so scrolling stays smooth.

**In-memory vs Postgres.** In-memory wins for a time-boxed local demo: zero ops, deterministic fixture, trivial tests. It loses the moment data is larger than RAM, needs concurrent writers, or must survive process restart. The next step would be Postgres with indexes on `book`, `commodity`, `region`, `asOf_date`, and `(counterparty, commodity)` plus `LIMIT/OFFSET` or keyset pagination. Aggregates would be `GROUP BY` with the same `WHERE` clause. I would not introduce a database before those constraints appear.

## Grouping without AG Grid Enterprise

Community cannot do built-in row grouping or pivoting. Group views are ordinary client-row grids bound to `GET /api/positions/aggregates?groupBy=book|commodity`. Clicking a group writes that key into the shared filter set and switches to the infinite positions grid — a master/detail drilldown. Individual trades open a detail drawer (`GET /api/positions/{tradeId}`).

**Position totals.** Position is a signed quantity whose unit depends on the commodity (metric tons vs lots vs freight units). When grouping by commodity, net position is summed and marked `positionComparable: true`. When grouping by book or region, the API returns `position: null` and a `positionsByCommodity` breakdown instead of a single misleading total. P&L and FX exposure are always USD and are safe to sum.

## Search now, OpenSearch later

`search` is a case-insensitive `Contains` across counterparty, commodity, and trade id — enough for 25 counterparties and a known commodity list. True fuzzy / type-ahead search is the OpenSearch job.

If I added OpenSearch I would keep Postgres (or the CSV load) as source of truth and treat the cluster as a read index:

- **Index:** `risk-positions` with keyword fields for `book`, `commodity`, `region`, `instrumentType`, `currency`, `tradeId`; `text` + `edge_ngram` on `counterparty` and `commodity`; `scaled_float` for `pnl` / `fxExposure` / `position`; `date` for `asOfDate`.
- **Query:** `bool` filter context for exact dimensions and date/P&L ranges; `multi_match` with `fuzziness: AUTO` on the search box. Pagination via `search_after` (not deep `from`).
- **Aggregates:** same query’s `filter` + `terms` buckets on book/commodity, with `sum` metrics. The UI contract would not change.

## Stretch that landed vs. next

Shipped on purpose because they are cheap and visible: P&L bar chart over the filtered universe, `localStorage` column state, named saved views, xUnit + Vitest, GitHub Actions.

With more time I would add keyset pagination and integration tests against the real CSV, replace contains-search with OpenSearch, persist saved views server-side per user, and add a WebSocket or poll for as-of refresh. I would not add more widgets until those paths are boringly reliable.
