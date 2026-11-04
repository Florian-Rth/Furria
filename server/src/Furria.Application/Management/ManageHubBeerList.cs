namespace Furria.Application.Management;

public sealed record ManageHubBeerList
{
    public required bool HasOpenPot { get; init; }

    public required int StockCrates { get; init; }

    public required int OpenTabCount { get; init; }

    public required int OpenCents { get; init; }
}
