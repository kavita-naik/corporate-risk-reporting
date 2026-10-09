import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { FilterBar } from "./components/FilterBar";
import { KpiBar } from "./components/KpiBar";
import { PnlChart } from "./components/PnlChart";
import { PositionsGrid } from "./components/PositionsGrid";
import { SummaryGrid } from "./components/SummaryGrid";
import { DetailDrawer } from "./components/DetailDrawer";
import { SavedViews } from "./components/SavedViews";
import { fetchAggregates, fetchMeta } from "./api/client";
import { emptyFilters, hasActiveFilters } from "./api/query";
import type { AggregateGroup, AggregateResponse, FilterMetadata, PositionFilters, RiskPosition, SavedView } from "./types";

const VIEWS_KEY = "crr.savedViews";

export default function App() {
  const [meta, setMeta] = useState<FilterMetadata | null>(null);
  const [filters, setFilters] = useState<PositionFilters>(emptyFilters);
  const [view, setView] = useState<"positions" | "summary">("positions");
  const [groupBy, setGroupBy] = useState<"book" | "commodity">("book");
  const [aggregates, setAggregates] = useState<AggregateResponse | null>(null);
  const [aggLoading, setAggLoading] = useState(true);
  const [selected, setSelected] = useState<RiskPosition | null>(null);
  const [drillLabel, setDrillLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => loadViews());

  const onFiltersChange = useCallback((next: PositionFilters) => {
    setFilters(next);
  }, []);

  useEffect(() => {
    fetchMeta()
      .then(setMeta)
      .catch((err: Error) => setError(`API unavailable — start the .NET host on port 5080. ${err.message}`));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAggLoading(true);
    fetchAggregates({ ...filters, groupBy })
      .then((data) => {
        if (!cancelled) {
          setAggregates(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setAggLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, groupBy]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function drillInto(group: AggregateGroup) {
    const next = { ...filters };
    if (groupBy === "commodity") next.commodity = group.key;
    else next.book = group.key;
    setFilters(next);
    setDrillLabel(`${groupBy}: ${group.key}`);
    setView("positions");
    setSelected(null);
  }

  function clearFilters() {
    setFilters(emptyFilters());
    setDrillLabel(null);
  }

  function saveView(name: string) {
    const next = [
      { name, filters, view, groupBy },
      ...savedViews.filter((item) => item.name !== name),
    ];
    setSavedViews(next);
    window.localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
  }

  function loadView(saved: SavedView) {
    setFilters(saved.filters);
    setView(saved.view);
    setGroupBy(saved.groupBy);
    setDrillLabel(null);
  }

  function deleteView(name: string) {
    const next = savedViews.filter((item) => item.name !== name);
    setSavedViews(next);
    window.localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
  }

  const groupCount = aggregates?.groups.length ?? 3;
  const heroHeight = Math.max(188, Math.min(292, 36 + groupCount * 17));

  return (
    <div className={`app ${selected ? "with-drawer" : ""}`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Trading risk</p>
          <h1>Corporate Risk Reporting</h1>
        </div>
        <p className="meta-line">
          <span className={`live ${meta ? "on" : ""}`} aria-hidden="true" />
          {meta
            ? `${meta.rowCount.toLocaleString()} positions · ${meta.minAsOfDate} → ${meta.maxAsOfDate}`
            : "Connecting to the book…"}
        </p>
      </header>

      {error && <div className="banner">{error}</div>}

      <div className="hero" style={{ "--hero-h": `${heroHeight}px` } as CSSProperties}>
        <KpiBar aggregates={aggregates} loading={aggLoading} />
        <PnlChart aggregates={aggregates} />
      </div>

      <FilterBar meta={meta} filters={filters} onChange={onFiltersChange} />

      <div className="toolbar">
        <div className="tabs">
          <button type="button" className={view === "positions" ? "active" : ""} onClick={() => setView("positions")}>
            Positions
          </button>
          <button
            type="button"
            className={view === "summary" && groupBy === "book" ? "active" : ""}
            onClick={() => {
              setGroupBy("book");
              setView("summary");
              setSelected(null);
            }}
          >
            By book
          </button>
          <button
            type="button"
            className={view === "summary" && groupBy === "commodity" ? "active" : ""}
            onClick={() => {
              setGroupBy("commodity");
              setView("summary");
              setSelected(null);
            }}
          >
            By commodity
          </button>
        </div>
        <div className="toolbar-actions">
          {drillLabel && <span className="crumb">Drilled into {drillLabel}</span>}
          {hasActiveFilters(filters) && (
            <button type="button" className="ghost" onClick={clearFilters}>
              Clear filters
            </button>
          )}
          <SavedViews views={savedViews} onSave={saveView} onLoad={loadView} onDelete={deleteView} />
        </div>
      </div>

      <main className="workspace">
        {view === "positions" ? (
          <PositionsGrid filters={filters} onSelect={setSelected} />
        ) : (
          <SummaryGrid aggregates={aggregates} onDrilldown={drillInto} />
        )}
        <DetailDrawer row={selected} onClose={() => setSelected(null)} />
      </main>
    </div>
  );
}

function loadViews(): SavedView[] {
  try {
    const raw = window.localStorage.getItem(VIEWS_KEY);
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}
