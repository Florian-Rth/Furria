namespace Furria.Core.Assistant;

public sealed record ClubAssistantPrices(
    decimal InputEurosPerMillion,
    decimal CachedInputEurosPerMillion,
    decimal OutputEurosPerMillion
)
{
    public const decimal TokensPerPriceUnit = 1_000_000m;
}
