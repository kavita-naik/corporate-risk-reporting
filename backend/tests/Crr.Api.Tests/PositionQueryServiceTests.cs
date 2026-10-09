using Crr.Api.Data;
using Crr.Api.Models;
using Crr.Api.Services;
using Xunit;

namespace Crr.Api.Tests;

public sealed class PositionQueryServiceTests
{
    private readonly PositionQueryService _service = new(InMemoryPositionStore.From(SampleRows()));

    [Fact]
    public void Query_FiltersByBook_AndPaginates()
    {
        var result = _service.Query(new PositionQuery
        {
            Book = "Ferrous",
            StartRow = 0,
            EndRow = 1,
            SortField = "tradeId",
            SortDir = "asc",
        });

        Assert.Equal(2, result.LastRow);
        Assert.Single(result.Rows);
        Assert.Equal("TRD-1", result.Rows[0].TradeId);
        Assert.All(result.Rows, row => Assert.Equal("Ferrous", row.Book));
    }

    [Fact]
    public void Query_SearchMatchesCounterpartyAndCommodity()
    {
        var byName = _service.Query(new PositionQuery { Search = "ridge", StartRow = 0, EndRow = 20 });
        Assert.Equal(2, byName.LastRow);
        Assert.All(byName.Rows, row =>
            Assert.Contains("Ridge", row.Counterparty, StringComparison.OrdinalIgnoreCase));

        var byCommodity = _service.Query(new PositionQuery { Search = "copper", StartRow = 0, EndRow = 20 });
        Assert.Equal(1, byCommodity.LastRow);
        Assert.Equal("Copper", byCommodity.Rows[0].Commodity);
    }

    [Fact]
    public void Query_SortsPnlDescending()
    {
        var result = _service.Query(new PositionQuery
        {
            SortField = "pnl",
            SortDir = "desc",
            StartRow = 0,
            EndRow = 10,
        });

        var pnls = result.Rows.Select(r => r.Pnl).ToList();
        Assert.Equal(pnls.OrderByDescending(x => x), pnls);
        Assert.Equal(1000m, pnls[0]);
    }

    [Fact]
    public void Aggregate_ByBook_OmitsCrossCommodityPosition()
    {
        var result = _service.Aggregate(new PositionQuery { GroupBy = "book" });

        Assert.Equal(4, result.Totals.TradeCount);
        Assert.Equal(1600m, result.Totals.Pnl);
        var ferrous = result.Groups.Single(g => g.Key == "Ferrous");
        Assert.False(ferrous.PositionComparable);
        Assert.Null(ferrous.Position);
        Assert.Equal(2, ferrous.TradeCount);
        Assert.Equal(2, ferrous.PositionsByCommodity!.Count);
    }

    [Fact]
    public void Aggregate_ByCommodity_SumsPosition_AndHonorsFilters()
    {
        var result = _service.Aggregate(new PositionQuery { GroupBy = "commodity", Book = "Ferrous" });

        Assert.Equal(2, result.Totals.TradeCount);
        Assert.All(result.Groups, g => Assert.True(g.PositionComparable));
        var hrc = result.Groups.Single(g => g.Key == "HRC Steel");
        Assert.Equal(10m, hrc.Position);
    }

    [Fact]
    public void GetByTradeId_ReturnsMatch()
    {
        Assert.Equal("Copper", _service.GetByTradeId("TRD-2")!.Commodity);
        Assert.Null(_service.GetByTradeId("missing"));
    }

    private static IReadOnlyList<RiskPosition> SampleRows() =>
    [
        Row("TRD-1", "Ferrous", "HRC Steel", "Cobalt Ridge", "APAC", "Swap", 10m, "USD", 600m, 100m, 50m, new(2026, 6, 10)),
        Row("TRD-2", "Non-Ferrous", "Copper", "Kavan Metals", "EMEA", "Future", 5m, "EUR", 8000m, 1000m, -20m, new(2026, 6, 12)),
        Row("TRD-3", "Ferrous", "Iron Ore", "Argent Resources", "AMER", "Physical", -3m, "USD", 110m, 400m, 15m, new(2026, 6, 15)),
        Row("TRD-4", "Ags", "Corn", "Vanguard Ridge", "APAC", "Swap", 8m, "CNY", 170m, 100m, 5m, new(2026, 7, 1)),
    ];

    private static RiskPosition Row(
        string tradeId,
        string book,
        string commodity,
        string counterparty,
        string region,
        string instrumentType,
        decimal position,
        string currency,
        decimal marketPrice,
        decimal pnl,
        decimal fxExposure,
        DateOnly asOfDate) =>
        new()
        {
            TradeId = tradeId,
            Book = book,
            Commodity = commodity,
            Counterparty = counterparty,
            Region = region,
            InstrumentType = instrumentType,
            Position = position,
            Currency = currency,
            MarketPrice = marketPrice,
            Pnl = pnl,
            FxExposure = fxExposure,
            AsOfDate = asOfDate,
        };
}
