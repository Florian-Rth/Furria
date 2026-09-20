namespace Furria.Application.Management;

public sealed record ManageHubDetails
{
    public required ManageHubPersons? Persons { get; init; }

    public required ManageHubGroups? Groups { get; init; }

    public required ManageHubRoles? Roles { get; init; }

    public required ManageHubSessions? Sessions { get; init; }

    public required ManageHubVenues? Venues { get; init; }

    public required ManageHubKeys? Keys { get; init; }

    public required ManageHubBoard? Board { get; init; }
}
