using Crr.Api.Models;
using Crr.Api.Models.Dtos;

namespace Crr.Api.Data;

public interface IPositionStore
{
    IReadOnlyList<RiskPosition> All { get; }
    FilterMetadataDto Metadata { get; }
    int Count { get; }
    RiskPosition? GetByTradeId(string tradeId);
}
