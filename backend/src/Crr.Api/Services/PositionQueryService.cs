using Crr.Api.Data;
using Crr.Api.Models;
using Crr.Api.Models.Dtos;

namespace Crr.Api.Services;

public sealed class PositionQueryService : IPositionQueryService
{
    private readonly IPositionStore _store;

    public PositionQueryService(IPositionStore store)
    {
        _store = store;
    }

    public FilterMetadataDto Metadata => _store.Metadata;

    public RiskPosition? GetByTradeId(string tradeId) => _store.GetByTradeId(tradeId);

    public PagedPositionsResponse Query(PositionQuery query)
    {
        var filtered = Filter(_store.All, query);
        var sorted = Sort(filtered, query.SortField, query.SortDir);
        var start = Math.Max(query.StartRow, 0);
        var size = query.PageSize;
        var page = sorted.Skip(start).Take(size).ToList();
        return new PagedPositionsResponse(page, filtered.Count, start);
    }

    public AggregateResponse Aggregate(PositionQuery query)
    {
        var filtered = Filter(_store.All, query);
        var groupBy = NormalizeGroupBy(query.GroupBy);
        var totals = new AggregateTotalsDto(
            filtered.Count,
            filtered.Sum(r => r.Pnl),
            filtered.Sum(r => r.FxExposure));

        IEnumerable<IGrouping<string, RiskPosition>> groups = groupBy switch
        {
            "commodity" => filtered.GroupBy(r => r.Commodity),
            "region" => filtered.GroupBy(r => r.Region),
            _ => filtered.GroupBy(r => r.Book),
        };

        var rows = groups
            .Select(g => ToGroup(g.Key, g.ToList(), positionComparable: groupBy == "commodity"))
            .OrderByDescending(g => g.Pnl)
            .ToList();

        return new AggregateResponse(groupBy, rows, totals);
    }

    public static List<RiskPosition> Filter(IReadOnlyList<RiskPosition> source, PositionQuery query)
    {
        IEnumerable<RiskPosition> rows = source;

        if (!string.IsNullOrWhiteSpace(query.Book))
        {
            rows = rows.Where(r => r.Book.Equals(query.Book, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.Commodity))
        {
            rows = rows.Where(r => r.Commodity.Equals(query.Commodity, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.Region))
        {
            rows = rows.Where(r => r.Region.Equals(query.Region, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.InstrumentType))
        {
            rows = rows.Where(r => r.InstrumentType.Equals(query.InstrumentType, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.Currency))
        {
            rows = rows.Where(r => r.Currency.Equals(query.Currency, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.Counterparty))
        {
            rows = rows.Where(r => r.Counterparty.Contains(query.Counterparty, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            rows = rows.Where(r =>
                r.Counterparty.Contains(term, StringComparison.OrdinalIgnoreCase)
                || r.Commodity.Contains(term, StringComparison.OrdinalIgnoreCase)
                || r.TradeId.Contains(term, StringComparison.OrdinalIgnoreCase));
        }

        if (query.AsOfFrom is { } from)
        {
            rows = rows.Where(r => r.AsOfDate >= from);
        }

        if (query.AsOfTo is { } to)
        {
            rows = rows.Where(r => r.AsOfDate <= to);
        }

        if (query.PnlMin is { } pnlMin)
        {
            rows = rows.Where(r => r.Pnl >= pnlMin);
        }

        if (query.PnlMax is { } pnlMax)
        {
            rows = rows.Where(r => r.Pnl <= pnlMax);
        }

        return rows as List<RiskPosition> ?? rows.ToList();
    }

    public static IReadOnlyList<RiskPosition> Sort(
        IReadOnlyList<RiskPosition> rows,
        string? sortField,
        string? sortDir)
    {
        var desc = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);
        IEnumerable<RiskPosition> ordered = (sortField?.Trim().ToLowerInvariant()) switch
        {
            "tradeid" => desc ? rows.OrderByDescending(r => r.TradeId) : rows.OrderBy(r => r.TradeId),
            "book" => desc ? rows.OrderByDescending(r => r.Book) : rows.OrderBy(r => r.Book),
            "commodity" => desc ? rows.OrderByDescending(r => r.Commodity) : rows.OrderBy(r => r.Commodity),
            "counterparty" => desc ? rows.OrderByDescending(r => r.Counterparty) : rows.OrderBy(r => r.Counterparty),
            "region" => desc ? rows.OrderByDescending(r => r.Region) : rows.OrderBy(r => r.Region),
            "instrumenttype" => desc ? rows.OrderByDescending(r => r.InstrumentType) : rows.OrderBy(r => r.InstrumentType),
            "position" => desc ? rows.OrderByDescending(r => r.Position) : rows.OrderBy(r => r.Position),
            "currency" => desc ? rows.OrderByDescending(r => r.Currency) : rows.OrderBy(r => r.Currency),
            "marketprice" => desc ? rows.OrderByDescending(r => r.MarketPrice) : rows.OrderBy(r => r.MarketPrice),
            "pnl" => desc ? rows.OrderByDescending(r => r.Pnl) : rows.OrderBy(r => r.Pnl),
            "fxexposure" => desc ? rows.OrderByDescending(r => r.FxExposure) : rows.OrderBy(r => r.FxExposure),
            "asofdate" => desc ? rows.OrderByDescending(r => r.AsOfDate) : rows.OrderBy(r => r.AsOfDate),
            _ => rows,
        };

        return ordered as IReadOnlyList<RiskPosition> ?? ordered.ToList();
    }

    private static AggregateGroupDto ToGroup(string key, List<RiskPosition> rows, bool positionComparable)
    {
        var positionsByCommodity = rows
            .GroupBy(r => r.Commodity)
            .Select(g => new CommodityPositionDto(g.Key, g.Sum(x => x.Position), g.Count()))
            .OrderBy(x => x.Commodity)
            .ToList();

        return new AggregateGroupDto(
            key,
            rows.Count,
            rows.Sum(r => r.Pnl),
            rows.Sum(r => r.FxExposure),
            positionComparable ? rows.Sum(r => r.Position) : null,
            positionComparable,
            positionComparable ? null : positionsByCommodity);
    }

    private static string NormalizeGroupBy(string? groupBy) =>
        groupBy?.Trim().ToLowerInvariant() switch
        {
            "commodity" => "commodity",
            "region" => "region",
            _ => "book",
        };
}
