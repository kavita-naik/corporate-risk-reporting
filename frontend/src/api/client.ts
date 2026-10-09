import type {
  AggregateResponse,
  FilterMetadata,
  PagedPositionsResponse,
  PositionFilters,
  RiskPosition,
} from "../types";
import { toQuery } from "./query";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5080";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${path}`);
  }
  return response.json() as Promise<T>;
}

export function fetchPositions(filters: PositionFilters): Promise<PagedPositionsResponse> {
  return getJson(`/api/positions?${toQuery(filters)}`);
}

export function fetchAggregates(filters: PositionFilters): Promise<AggregateResponse> {
  return getJson(`/api/positions/aggregates?${toQuery(filters)}`);
}

export function fetchMeta(): Promise<FilterMetadata> {
  return getJson("/api/positions/meta");
}

export function fetchPosition(tradeId: string): Promise<RiskPosition> {
  return getJson(`/api/positions/${encodeURIComponent(tradeId)}`);
}
