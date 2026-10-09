import type { PositionFilters } from "../types";

export function toQuery(filters: PositionFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  return params.toString();
}

export function emptyFilters(): PositionFilters {
  return {};
}

export function hasActiveFilters(filters: PositionFilters): boolean {
  return Object.values(filters).some((value) => value !== undefined && value !== "");
}
