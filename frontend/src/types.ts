export type RiskPosition = {
  tradeId: string;
  book: string;
  commodity: string;
  counterparty: string;
  region: string;
  instrumentType: string;
  position: number;
  currency: string;
  marketPrice: number;
  pnl: number;
  fxExposure: number;
  asOfDate: string;
};

export type PositionFilters = {
  book?: string;
  commodity?: string;
  counterparty?: string;
  region?: string;
  instrumentType?: string;
  currency?: string;
  search?: string;
  asOfFrom?: string;
  asOfTo?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
  startRow?: number;
  endRow?: number;
  groupBy?: "book" | "commodity" | "region";
};

export type PagedPositionsResponse = {
  rows: RiskPosition[];
  lastRow: number;
  startRow: number;
};

export type CommodityPosition = {
  commodity: string;
  position: number;
  tradeCount: number;
};

export type AggregateGroup = {
  key: string;
  tradeCount: number;
  pnl: number;
  fxExposure: number;
  position: number | null;
  positionComparable: boolean;
  positionsByCommodity: CommodityPosition[] | null;
};

export type AggregateResponse = {
  groupBy: "book" | "commodity" | "region";
  groups: AggregateGroup[];
  totals: {
    tradeCount: number;
    pnl: number;
    fxExposure: number;
  };
};

export type FilterMetadata = {
  books: string[];
  commodities: string[];
  regions: string[];
  instrumentTypes: string[];
  currencies: string[];
  counterparties: string[];
  minAsOfDate: string;
  maxAsOfDate: string;
  rowCount: number;
};

export type SavedView = {
  name: string;
  filters: PositionFilters;
  view: "positions" | "summary";
  groupBy: "book" | "commodity";
};
