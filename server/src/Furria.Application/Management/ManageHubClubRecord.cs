namespace Furria.Application.Management;

public sealed record ManageHubClubRecord
{
    public required string? Name { get; init; }

    public required int MissingFactCount { get; init; }
}
