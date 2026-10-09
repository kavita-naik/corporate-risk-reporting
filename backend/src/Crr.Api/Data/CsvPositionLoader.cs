using System.Globalization;
using Crr.Api.Models;
using CsvHelper;
using CsvHelper.Configuration;

namespace Crr.Api.Data;

public static class CsvPositionLoader
{
    public static string ResolvePath(IHostEnvironment env, IConfiguration config)
    {
        var configured = config["Data:CsvPath"];
        var candidates = new[]
        {
            configured is null ? null : Path.GetFullPath(Path.Combine(env.ContentRootPath, configured)),
            Path.Combine(env.ContentRootPath, "data", "risk_positions.csv"),
            Path.Combine(env.ContentRootPath, "..", "..", "data", "risk_positions.csv"),
            Path.Combine(AppContext.BaseDirectory, "data", "risk_positions.csv"),
            Path.GetFullPath(Path.Combine(env.ContentRootPath, "..", "..", "..", "risk_positions.csv")),
        };

        foreach (var path in candidates)
        {
            if (path is not null && File.Exists(path))
            {
                return path;
            }
        }

        throw new FileNotFoundException(
            "Could not find risk_positions.csv. Expected it at backend/data/risk_positions.csv.");
    }

    public static IReadOnlyList<RiskPosition> Load(string csvPath)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            TrimOptions = TrimOptions.Trim,
            PrepareHeaderForMatch = args => args.Header.Trim(),
        };

        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(reader, config);
        csv.Context.RegisterClassMap<RiskPositionMap>();
        return csv.GetRecords<RiskPosition>().ToList();
    }

    private sealed class RiskPositionMap : ClassMap<RiskPosition>
    {
        public RiskPositionMap()
        {
            Map(m => m.TradeId).Name("tradeId");
            Map(m => m.Book).Name("book");
            Map(m => m.Commodity).Name("commodity");
            Map(m => m.Counterparty).Name("counterparty");
            Map(m => m.Region).Name("region");
            Map(m => m.InstrumentType).Name("instrumentType");
            Map(m => m.Position).Name("position");
            Map(m => m.Currency).Name("currency");
            Map(m => m.MarketPrice).Name("marketPrice");
            Map(m => m.Pnl).Name("pnl");
            Map(m => m.FxExposure).Name("fxExposure");
            Map(m => m.AsOfDate).Name("asOfDate");
        }
    }
}
