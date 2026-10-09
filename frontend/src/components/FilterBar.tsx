import { useEffect, useState } from "react";
import type { FilterMetadata, PositionFilters } from "../types";

type Props = {
  meta: FilterMetadata | null;
  filters: PositionFilters;
  onChange: (filters: PositionFilters) => void;
};

export function FilterBar({ meta, filters, onChange }: Props) {
  const [search, setSearch] = useState(filters.search ?? "");

  useEffect(() => {
    setSearch(filters.search ?? "");
  }, [filters.search]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if ((filters.search ?? "") === search) return;
      onChange({ ...filters, search: search || undefined });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [search, filters, onChange]);

  function set<K extends keyof PositionFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="filter-bar">
      <label className="grow">
        <span>Search</span>
        <input
          value={search}
          placeholder="Counterparty, commodity, trade id"
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <Select label="Book" value={filters.book} options={meta?.books} onChange={(v) => set("book", v)} />
      <Select label="Commodity" value={filters.commodity} options={meta?.commodities} onChange={(v) => set("commodity", v)} />
      <Select label="Region" value={filters.region} options={meta?.regions} onChange={(v) => set("region", v)} />
      <Select label="Instrument" value={filters.instrumentType} options={meta?.instrumentTypes} onChange={(v) => set("instrumentType", v)} />
      <Select label="Currency" value={filters.currency} options={meta?.currencies} onChange={(v) => set("currency", v)} />
      <div className="date-range">
        <label>
          <span>From</span>
          <input type="date" value={filters.asOfFrom ?? ""} onChange={(event) => set("asOfFrom", event.target.value)} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={filters.asOfTo ?? ""} onChange={(event) => set("asOfTo", event.target.value)} />
        </label>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options?: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        <option value="">All</option>
        {(options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
