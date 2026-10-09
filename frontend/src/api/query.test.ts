import { describe, expect, it } from "vitest";
import { hasActiveFilters, toQuery } from "./query";

describe("toQuery", () => {
  it("omits empty values and serializes paging fields", () => {
    expect(
      toQuery({
        book: "Ferrous",
        search: "",
        startRow: 0,
        endRow: 100,
        sortField: "pnl",
        sortDir: "desc",
      }),
    ).toBe("book=Ferrous&startRow=0&endRow=100&sortField=pnl&sortDir=desc");
  });
});

describe("hasActiveFilters", () => {
  it("is false for an empty filter set", () => {
    expect(hasActiveFilters({})).toBe(false);
  });
});
