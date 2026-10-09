import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AggregateResponse } from "../types";
import { formatUsd, formatUsdCompact } from "../format";

type Props = {
  aggregates: AggregateResponse | null;
};

type TipProps = {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
};

const tick = { fill: "#93a3b5", fontSize: 11 };

export function PnlChart({ aggregates }: Props) {
  const data = (aggregates?.groups ?? []).map((group) => ({
    name: group.key,
    pnl: Math.round(group.pnl),
  }));
  const crowded = data.length > 6;

  return (
    <article className="chart-card">
      <header>
        <div className="chart-title">
          <span>P&amp;L by {aggregates?.groupBy ?? "book"}</span>
          <small>Matching filters</small>
        </div>
        <div className="legend" aria-hidden="true">
          <span><i className="swatch pos" /> Gain</span>
          <span><i className="swatch neg" /> Loss</span>
        </div>
      </header>
      <div className="chart-body">
        {data.length === 0 ? (
          <p className="muted">No aggregate data</p>
        ) : (
          <ResponsiveContainer key={aggregates?.groupBy ?? "book"} width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={{ top: 2, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#243140" />
              <XAxis
                type="number"
                tick={{ fill: "#93a3b5", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => formatUsdCompact(value)}
                height={18}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#c5d0dc", fontSize: crowded ? 10 : 11 }}
                axisLine={false}
                tickLine={false}
                width={crowded ? 78 : 88}
                interval={0}
              />
              <ReferenceLine x={0} stroke="#3a4c60" />
              <Tooltip
                cursor={false}
                content={<ChartTooltip />}
                animationDuration={120}
              />
              <Bar dataKey="pnl" radius={[3, 3, 3, 3]} maxBarSize={42}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.pnl >= 0 ? "#3ddc97" : "#ff6b6b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}

function ChartTooltip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  const pnl = Number(payload[0]?.value ?? 0);
  const tone = pnl > 0 ? "pos" : pnl < 0 ? "neg" : "";
  return (
    <div className="chart-tooltip" role="status">
      <p className="chart-tooltip-label">{label}</p>
      <p className={`chart-tooltip-value ${tone}`}>{formatUsd(pnl)}</p>
      <p className="chart-tooltip-caption">P&amp;L</p>
    </div>
  );
}
