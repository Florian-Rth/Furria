using Furria.Core.Assistant;

namespace Furria.Application.Assistant;

public sealed class ClubAssistantOptions
{
    public const string SectionName = "ClubAssistant";
    public const string DefaultEndpoint = "https://api.mistral.ai/v1";
    public const string DefaultModel = "mistral-large-latest";

    private const decimal DefaultInputEurosPerMillion = 0.70m;
    private const decimal DefaultCachedInputEurosPerMillion = 0.07m;
    private const decimal DefaultOutputEurosPerMillion = 2.10m;

    public string Endpoint { get; set; } = DefaultEndpoint;

    public string ApiKey { get; set; } = "";

    public string Model { get; set; } = DefaultModel;

    public decimal InputEurosPerMillion { get; set; } = DefaultInputEurosPerMillion;

    public decimal CachedInputEurosPerMillion { get; set; } = DefaultCachedInputEurosPerMillion;

    public decimal OutputEurosPerMillion { get; set; } = DefaultOutputEurosPerMillion;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);

    public bool IsUsable =>
        !IsConfigured
        || (
            Uri.TryCreate(Endpoint, UriKind.Absolute, out _)
            && Model.Length > 0
            && InputEurosPerMillion >= 0
            && CachedInputEurosPerMillion >= 0
            && OutputEurosPerMillion >= 0
        );

    public ClubAssistantPrices Prices =>
        new(InputEurosPerMillion, CachedInputEurosPerMillion, OutputEurosPerMillion);
}
