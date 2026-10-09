namespace Crr.Api.Models;

public sealed record RiskPosition
{
    public string TradeId { get; init; } = "";
    public string Book { get; init; } = "";
    public string Commodity { get; init; } = "";
    public string Counterparty { get; init; } = "";
    public string Region { get; init; } = "";
    public string InstrumentType { get; init; } = "";
    public decimal Position { get; init; }
    public string Currency { get; init; } = "";
    public decimal MarketPrice { get; init; }
    public decimal Pnl { get; init; }
    public decimal FxExposure { get; init; }
    public DateOnly AsOfDate { get; init; }
}
