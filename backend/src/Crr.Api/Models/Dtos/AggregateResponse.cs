namespace Crr.Api.Models.Dtos;

public sealed record AggregateResponse(
    string GroupBy,
    IReadOnlyList<AggregateGroupDto> Groups,
    AggregateTotalsDto Totals);

public sealed record AggregateGroupDto(
    string Key,
    int TradeCount,
    decimal Pnl,
    decimal FxExposure,
    decimal? Position,
    bool PositionComparable,
    IReadOnlyList<CommodityPositionDto>? PositionsByCommodity);

public sealed record CommodityPositionDto(string Commodity, decimal Position, int TradeCount);

public sealed record AggregateTotalsDto(
    int TradeCount,
    decimal Pnl,
    decimal FxExposure);
