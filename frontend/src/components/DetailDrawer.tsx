import type { RiskPosition } from "../types";
import { formatQty, formatUsdFine, signedClass } from "../format";

type Props = {
  row: RiskPosition | null;
  onClose: () => void;
};

export function DetailDrawer({ row, onClose }: Props) {
  if (!row) return null;

  return (
    <aside className="drawer" aria-label="Trade detail">
      <header>
        <div>
          <p className="eyebrow">Trade detail</p>
          <h2>{row.tradeId}</h2>
        </div>
        <button type="button" className="ghost" onClick={onClose}>
          Close
        </button>
      </header>
      <p className="drawer-sub">
        {row.commodity} · {row.book} · {row.region}
      </p>
      <div className="drawer-metrics">
        <div>
          <span>P&amp;L (USD)</span>
          <strong className={signedClass(row.pnl)}>{formatUsdFine(row.pnl)}</strong>
        </div>
        <div>
          <span>FX exposure</span>
          <strong className={signedClass(row.fxExposure)}>{formatUsdFine(row.fxExposure)}</strong>
        </div>
      </div>
      <dl>
        <Item label="Book" value={row.book} />
        <Item label="Commodity" value={row.commodity} />
        <Item label="Counterparty" value={row.counterparty} />
        <Item label="Region" value={row.region} />
        <Item label="Instrument" value={row.instrumentType} />
        <Item label="Currency" value={row.currency} />
        <Item label="As of" value={row.asOfDate} />
        <Item label="Position" value={formatQty(row.position)} />
        <Item label="Market price" value={formatUsdFine(row.marketPrice)} />
      </dl>
    </aside>
  );
}

function Item({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={tone}>{value}</dd>
    </div>
  );
}
