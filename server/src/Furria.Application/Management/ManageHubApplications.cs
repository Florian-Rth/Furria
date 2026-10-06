namespace Furria.Application.Management;

public sealed record ManageHubApplications
{
    public required int UndecidedCount { get; init; }

    public required int MinorCount { get; init; }
}
