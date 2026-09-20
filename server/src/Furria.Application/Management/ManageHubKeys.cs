namespace Furria.Application.Management;

public sealed record ManageHubKeys
{
    public required int IssuedCount { get; init; }

    public required int HoldingCount { get; init; }

    public required int HolderCount { get; init; }
}
