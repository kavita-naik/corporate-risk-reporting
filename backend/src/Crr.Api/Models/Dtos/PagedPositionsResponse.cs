namespace Crr.Api.Models.Dtos;

public sealed record PagedPositionsResponse(
    IReadOnlyList<RiskPosition> Rows,
    int LastRow,
    int StartRow);
