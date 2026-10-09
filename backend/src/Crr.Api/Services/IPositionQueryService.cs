using Crr.Api.Models;
using Crr.Api.Models.Dtos;

namespace Crr.Api.Services;

public interface IPositionQueryService
{
    PagedPositionsResponse Query(PositionQuery query);
    AggregateResponse Aggregate(PositionQuery query);
    RiskPosition? GetByTradeId(string tradeId);
    FilterMetadataDto Metadata { get; }
}
