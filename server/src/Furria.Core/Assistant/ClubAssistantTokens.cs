using System.Diagnostics.Contracts;

namespace Furria.Core.Assistant;

public sealed record ClubAssistantTokens(int Input, int CachedInput, int Output)
{
    public int UncachedInput => Math.Max(0, Input - CachedInput);

    [Pure]
    public ClubAssistantTokens WithoutNegatives() =>
        new(Math.Max(0, Input), Math.Max(0, CachedInput), Math.Max(0, Output));

    [Pure]
    public decimal CostIn(ClubAssistantPrices prices) =>
        (
            UncachedInput * prices.InputEurosPerMillion
            + CachedInput * prices.CachedInputEurosPerMillion
            + Output * prices.OutputEurosPerMillion
        ) / ClubAssistantPrices.TokensPerPriceUnit;
}
