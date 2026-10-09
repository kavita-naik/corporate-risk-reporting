namespace Crr.Api.Models;

/// <summary>
/// Shared filter / page / sort contract used by both the paged list and aggregation endpoints
/// so KPI tiles and group totals always cover the same filtered universe as the grid.
/// </summary>
public sealed class PositionQuery
{
    public int StartRow { get; init; }
    public int EndRow { get; init; } = 100;
    public string? SortField { get; init; }
    public string? SortDir { get; init; }

    public string? Book { get; init; }
    public string? Commodity { get; init; }
    public string? Counterparty { get; init; }
    public string? Region { get; init; }
    public string? InstrumentType { get; init; }
    public string? Currency { get; init; }

    /// <summary>Case-insensitive contains across counterparty, commodity, and tradeId.</summary>
    public string? Search { get; init; }

    public DateOnly? AsOfFrom { get; init; }
    public DateOnly? AsOfTo { get; init; }
    public decimal? PnlMin { get; init; }
    public decimal? PnlMax { get; init; }

    public string GroupBy { get; init; } = "book";

    public int PageSize => Math.Clamp(EndRow - StartRow, 1, 500);
}
