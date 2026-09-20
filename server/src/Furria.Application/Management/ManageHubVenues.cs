namespace Furria.Application.Management;

public sealed record ManageHubVenues
{
    public required int VenueCount { get; init; }

    public required int ArchivedCount { get; init; }
}
