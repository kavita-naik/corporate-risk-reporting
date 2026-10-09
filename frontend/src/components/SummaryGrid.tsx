import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import type { AggregateGroup, AggregateResponse } from "../types";
import { formatCount, formatQty, formatUsdFine, signedClass } from "../format";

type Props = {
  aggregates: AggregateResponse | null;
  onDrilldown: (group: AggregateGroup) => void;
};

export function SummaryGrid({ aggregates, onDrilldown }: Props) {
  const groupBy = aggregates?.groupBy ?? "book";
  const comparable = groupBy === "commodity";

  const columnDefs = useMemo<ColDef<AggregateGroup>[]>(() => [
    { field: "key", headerName: groupBy === "commodity" ? "Commodity" : groupBy === "region" ? "Region" : "Book", flex: 1, minWidth: 140 },
    {
      field: "tradeCount",
      headerName: "Trades",
      width: 110,
      type: "numericColumn",
      valueFormatter: (p) => formatCount(p.value ?? 0),
    },
    {
      field: "pnl",
      headerName: "P&L (USD)",
      width: 160,
      type: "numericColumn",
      cellClass: (p) => signedClass(p.value ?? 0),
      valueFormatter: (p) => formatUsdFine(p.value ?? 0),
    },
    {
      field: "fxExposure",
      headerName: "FX exp. (USD)",
      width: 160,
      type: "numericColumn",
      cellClass: (p) => signedClass(p.value ?? 0),
      valueFormatter: (p) => formatUsdFine(p.value ?? 0),
    },
    comparable
      ? {
          field: "position",
          headerName: "Net position",
          width: 150,
          type: "numericColumn",
          valueFormatter: (p) => (p.value == null ? "—" : formatQty(p.value)),
        }
      : {
          headerName: "Position by commodity",
          flex: 1.4,
          minWidth: 240,
          sortable: false,
          valueGetter: (p) =>
            (p.data?.positionsByCommodity ?? [])
              .map((item) => `${item.commodity}: ${formatQty(item.position)}`)
              .join("  ·  "),
        },
  ], [comparable, groupBy]);

  return (
    <div className="summary-wrap">
      <p className="hint">
        {comparable
          ? "Net position is summed within a single commodity. Click a row to inspect the underlying trades."
          : "Position is not totaled across commodities — units are not comparable. Click a row to drill into that group."}
      </p>
      <div className="ag-theme-quartz-dark grid-host">
        <AgGridReact<AggregateGroup>
          rowData={aggregates?.groups ?? []}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, sortable: true }}
          rowHeight={40}
          headerHeight={40}
          suppressCellFocus
          animateRows={false}
          onRowClicked={(event) => event.data && onDrilldown(event.data)}
        />
      </div>
    </div>
  );
}
