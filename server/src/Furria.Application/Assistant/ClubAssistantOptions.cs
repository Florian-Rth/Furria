using Furria.Core.Assistant;

namespace Furria.Application.Assistant;

public sealed class ClubAssistantOptions
{
    public const string SectionName = "ClubAssistant";
    public const string DefaultEndpoint = "https://api.mistral.ai/v1";
    public const string DefaultModel = "mistral-small-2603";
    public const string DefaultReasoningEffort = "none";

    private const decimal DefaultInputEurosPerMillion = 0.15m;
    private const decimal DefaultCachedInputEurosPerMillion = 0.015m;
    private const decimal DefaultOutputEurosPerMillion = 0.60m;

    private static readonly HashSet<string> ReasoningEfforts = new(StringComparer.OrdinalIgnoreCase)
    {
        "",
        "none",
        "low",
        "medium",
        "high",
    };

    public string Endpoint { get; set; } = DefaultEndpoint;

    public string ApiKey { get; set; } = "";

    public string Model { get; set; } = DefaultModel;

    public string ReasoningEffort { get; set; } = DefaultReasoningEffort;

    public decimal InputEurosPerMillion { get; set; } = DefaultInputEurosPerMillion;

    public decimal CachedInputEurosPerMillion { get; set; } = DefaultCachedInputEurosPerMillion;

    public decimal OutputEurosPerMillion { get; set; } = DefaultOutputEurosPerMillion;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);

    public bool IsUsable =>
        !IsConfigured
        || (
            Uri.TryCreate(Endpoint, UriKind.Absolute, out _)
            && Model.Length > 0
            && ReasoningEfforts.Contains(ReasoningEffort)
            && InputEurosPerMillion >= 0
            && CachedInputEurosPerMillion >= 0
            && OutputEurosPerMillion >= 0
        );

    public ClubAssistantPrices Prices =>
        new(InputEurosPerMillion, CachedInputEurosPerMillion, OutputEurosPerMillion);
}
