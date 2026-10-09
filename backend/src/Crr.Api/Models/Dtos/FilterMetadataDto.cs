namespace Crr.Api.Models.Dtos;

public sealed record FilterMetadataDto(
    IReadOnlyList<string> Books,
    IReadOnlyList<string> Commodities,
    IReadOnlyList<string> Regions,
    IReadOnlyList<string> InstrumentTypes,
    IReadOnlyList<string> Currencies,
    IReadOnlyList<string> Counterparties,
    DateOnly MinAsOfDate,
    DateOnly MaxAsOfDate,
    int RowCount);
