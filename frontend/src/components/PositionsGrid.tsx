import { useCallback, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
} from "ag-grid-community";
import type { PositionFilters, RiskPosition } from "../types";
import { fetchPositions } from "../api/client";
import { formatQty, formatUsdFine, signedClass } from "../format";

const COLUMN_STATE_KEY = "crr.columnState";

type Props = {
  filters: PositionFilters;
  onSelect: (row: RiskPosition) => void;
};

export function PositionsGrid({ filters, onSelect }: Props) {
  const apiRef = useRef<GridApi<RiskPosition> | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const columnDefs = useMemo<ColDef<RiskPosition>[]>(() => [
    { field: "tradeId", headerName: "Trade", width: 130, filter: "agTextColumnFilter" },
    { field: "book", headerName: "Book", width: 130 },
    { field: "commodity", headerName: "Commodity", width: 140, filter: "agTextColumnFilter" },
    { field: "counterparty", headerName: "Counterparty", flex: 1, minWidth: 170, filter: "agTextColumnFilter" },
    { field: "region", headerName: "Region", width: 100 },
    { field: "instrumentType", headerName: "Instrument", width: 120 },
    {
      field: "position",
      headerName: "Position",
      width: 120,
      type: "numericColumn",
      valueFormatter: (p) => (p.value == null ? "" : formatQty(p.value)),
    },
    { field: "currency", headerName: "CCY", width: 80 },
    {
      field: "marketPrice",
      headerName: "Mkt price",
      width: 120,
      type: "numericColumn",
      valueFormatter: (p) => (p.value == null ? "" : formatUsdFine(p.value)),
    },
    {
      field: "pnl",
      headerName: "P&L (USD)",
      width: 140,
      type: "numericColumn",
      cellClass: (p) => signedClass(p.value ?? 0),
      valueFormatter: (p) => (p.value == null ? "" : formatUsdFine(p.value)),
    },
    {
      field: "fxExposure",
      headerName: "FX exp. (USD)",
      width: 140,
      type: "numericColumn",
      cellClass: (p) => signedClass(p.value ?? 0),
      valueFormatter: (p) => (p.value == null ? "" : formatUsdFine(p.value)),
    },
    { field: "asOfDate", headerName: "As of", width: 120 },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    suppressHeaderMenuButton: true,
  }), []);

  const datasource = useMemo<IDatasource>(() => ({
    getRows: async (params: IGetRowsParams) => {
      try {
        const sort = params.sortModel[0];
        const merged = applyColumnFilters(filtersRef.current, params.filterModel);
        const page = await fetchPositions({
          ...merged,
          startRow: params.startRow,
          endRow: params.endRow,
          sortField: sort?.colId,
          sortDir: sort?.sort,
        });
        params.successCallback(page.rows, page.lastRow);
      } catch (error) {
        console.error(error);
        params.failCallback();
      }
    },
  }), []);

  const onGridReady = useCallback((event: GridReadyEvent<RiskPosition>) => {
    apiRef.current = event.api;
    const saved = window.localStorage.getItem(COLUMN_STATE_KEY);
    if (saved) {
      try {
        event.api.applyColumnState({ state: JSON.parse(saved), applyOrder: true });
      } catch {
        /* ignore corrupt state */
      }
    }
    event.api.setGridOption("datasource", datasource);
  }, [datasource]);

  useEffect(() => {
    apiRef.current?.purgeInfiniteCache();
  }, [filters]);

  return (
    <div className="ag-theme-quartz-dark grid-host">
      <AgGridReact<RiskPosition>
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowModelType="infinite"
        cacheBlockSize={100}
        maxBlocksInCache={12}
        infiniteInitialRowCount={100}
        rowHeight={32}
        headerHeight={34}
        animateRows={false}
        suppressCellFocus
        rowSelection="single"
        onGridReady={onGridReady}
        onRowClicked={(event) => event.data && onSelect(event.data)}
        onColumnMoved={persistColumns}
        onColumnResized={persistColumns}
        onColumnVisible={persistColumns}
      />
    </div>
  );
}

function persistColumns(event: { api: GridApi }) {
  window.localStorage.setItem(COLUMN_STATE_KEY, JSON.stringify(event.api.getColumnState()));
}

function applyColumnFilters(base: PositionFilters, filterModel: Record<string, { filter?: string }> | undefined): PositionFilters {
  if (!filterModel) return base;
  const next = { ...base };
  if (filterModel.counterparty?.filter) next.counterparty = filterModel.counterparty.filter;
  if (filterModel.commodity?.filter && !next.commodity) next.commodity = filterModel.commodity.filter;
  if (filterModel.tradeId?.filter) next.search = filterModel.tradeId.filter;
  return next;
}
