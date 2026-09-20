namespace Furria.Application.Management;

public sealed record ManageHubGroups
{
    public required int GroupCount { get; init; }

    public required int ArchivedCount { get; init; }
}
