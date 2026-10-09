import type { AggregateResponse } from "../types";
import { formatCount, formatUsd, signedClass } from "../format";

type Props = {
  aggregates: AggregateResponse | null;
  loading: boolean;
};

export function KpiBar({ aggregates, loading }: Props) {
  const totals = aggregates?.totals;
  return (
    <section className="kpi-bar">
      <Kpi label="Matching trades" value={totals ? formatCount(totals.tradeCount) : "—"} loading={loading} />
      <Kpi
        label="P&L (USD)"
        value={totals ? formatUsd(totals.pnl) : "—"}
        tone={totals ? signedClass(totals.pnl) : ""}
        loading={loading}
      />
      <Kpi
        label="FX exposure (USD)"
        value={totals ? formatUsd(totals.fxExposure) : "—"}
        tone={totals ? signedClass(totals.fxExposure) : ""}
        loading={loading}
      />
    </section>
  );
}

function Kpi({
  label,
  value,
  tone,
  loading,
}: {
  label: string;
  value: string;
  tone?: string;
  loading: boolean;
}) {
  return (
    <article className="kpi">
      <span className="kpi-label">{label}</span>
      <strong className={`kpi-value ${tone ?? ""} ${loading ? "muted" : ""}`}>{value}</strong>
    </article>
  );
}
