using Crr.Api.Models;
using Crr.Api.Models.Dtos;

namespace Crr.Api.Data;

public sealed class InMemoryPositionStore : IPositionStore
{
    private readonly Dictionary<string, RiskPosition> _byId;

    private InMemoryPositionStore(IReadOnlyList<RiskPosition> rows)
    {
        All = rows;
        _byId = rows.ToDictionary(r => r.TradeId, StringComparer.OrdinalIgnoreCase);
        Metadata = BuildMetadata(rows);
    }

    public IReadOnlyList<RiskPosition> All { get; }
    public FilterMetadataDto Metadata { get; }
    public int Count => All.Count;

    public RiskPosition? GetByTradeId(string tradeId) =>
        _byId.TryGetValue(tradeId, out var row) ? row : null;

    public static InMemoryPositionStore From(IReadOnlyList<RiskPosition> rows) => new(rows);

    public static InMemoryPositionStore LoadFromCsv(string csvPath, ILogger logger)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var rows = CsvPositionLoader.Load(csvPath);
        sw.Stop();
        logger.LogInformation(
            "Loaded {Count} risk positions from {Path} in {ElapsedMs} ms",
            rows.Count,
            csvPath,
            sw.ElapsedMilliseconds);
        return new InMemoryPositionStore(rows);
    }

    private static FilterMetadataDto BuildMetadata(IReadOnlyList<RiskPosition> rows)
    {
        if (rows.Count == 0)
        {
            return new FilterMetadataDto([], [], [], [], [], [], DateOnly.MinValue, DateOnly.MinValue, 0);
        }

        return new FilterMetadataDto(
            rows.Select(r => r.Book).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList(),
            rows.Select(r => r.Commodity).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList(),
            rows.Select(r => r.Region).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList(),
            rows.Select(r => r.InstrumentType).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList(),
            rows.Select(r => r.Currency).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList(),
            rows.Select(r => r.Counterparty).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(x => x).ToList(),
            rows.Min(r => r.AsOfDate),
            rows.Max(r => r.AsOfDate),
            rows.Count);
    }
}
