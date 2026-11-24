namespace Furria.Core.Assistant;

public sealed class ClubAssistantModelCall
{
    public const int CostPrecision = 12;
    public const int CostScale = 6;

    public long Id { get; set; }

    public DateTimeOffset CalledAt { get; set; }

    public int InputTokens { get; set; }

    public int CachedInputTokens { get; set; }

    public int OutputTokens { get; set; }

    public decimal CostEuros { get; set; }
}
