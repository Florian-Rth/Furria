using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Infrastructure.Management;

namespace Furria.Api.Endpoints.Management;

public sealed class GetManageHub : EndpointWithoutRequest<GetManageHubResponse>
{
    private readonly ManagementService _managementService;

    public GetManageHub(ManagementService managementService)
    {
        _managementService = managementService;
    }

    public override void Configure()
    {
        Get("manage/hub");
        Definition.RequireAnyPermission(
            FurriaPermissions.PersonsManage,
            FurriaPermissions.GroupsManage,
            FurriaPermissions.RolesManage,
            FurriaPermissions.ClubManage,
            FurriaPermissions.KeyHoldingsManage,
            FurriaPermissions.BoardManage
        );
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var hub = await _managementService.HubAsync(accountId.Value, ct);

        await Send.OkAsync(ToResponse(hub), cancellation: ct);
    }

    private static GetManageHubResponse ToResponse(ManageHubDetails hub) =>
        new()
        {
            Persons = hub.Persons is null ? null : ToDto(hub.Persons),
            Groups = hub.Groups is null ? null : ToDto(hub.Groups),
            Roles = hub.Roles is null ? null : ToDto(hub.Roles),
            Sessions = hub.Sessions is null ? null : ToDto(hub.Sessions),
            Venues = hub.Venues is null ? null : ToDto(hub.Venues),
            Keys = hub.Keys is null ? null : ToDto(hub.Keys),
            Board = hub.Board is null ? null : ToDto(hub.Board),
        };

    private static ManageHubPersonsDto ToDto(ManageHubPersons persons) =>
        new() { PersonCount = persons.PersonCount, MemberCount = persons.MemberCount };

    private static ManageHubGroupsDto ToDto(ManageHubGroups groups) =>
        new() { GroupCount = groups.GroupCount, ArchivedCount = groups.ArchivedCount };

    private static ManageHubRolesDto ToDto(ManageHubRoles roles) =>
        new() { RoleCount = roles.RoleCount, VacantCount = roles.VacantCount };

    private static ManageHubSessionsDto ToDto(ManageHubSessions sessions) =>
        new()
        {
            EntryCount = sessions.EntryCount,
            CurrentStartYear = sessions.CurrentStartYear,
            HasCurrentEntry = sessions.HasCurrentEntry,
        };

    private static ManageHubVenuesDto ToDto(ManageHubVenues venues) =>
        new() { VenueCount = venues.VenueCount, ArchivedCount = venues.ArchivedCount };

    private static ManageHubKeysDto ToDto(ManageHubKeys keys) =>
        new() { HoldingCount = keys.HoldingCount, HolderCount = keys.HolderCount };

    private static ManageHubBoardDto ToDto(ManageHubBoard board) =>
        new() { SeatCount = board.SeatCount, VacantOfficeCount = board.VacantOfficeCount };
}

public sealed record GetManageHubResponse
{
    public required ManageHubPersonsDto? Persons { get; init; }

    public required ManageHubGroupsDto? Groups { get; init; }

    public required ManageHubRolesDto? Roles { get; init; }

    public required ManageHubSessionsDto? Sessions { get; init; }

    public required ManageHubVenuesDto? Venues { get; init; }

    public required ManageHubKeysDto? Keys { get; init; }

    public required ManageHubBoardDto? Board { get; init; }
}

public sealed record ManageHubPersonsDto
{
    public required int PersonCount { get; init; }

    public required int MemberCount { get; init; }
}

public sealed record ManageHubGroupsDto
{
    public required int GroupCount { get; init; }

    public required int ArchivedCount { get; init; }
}

public sealed record ManageHubRolesDto
{
    public required int RoleCount { get; init; }

    public required int VacantCount { get; init; }
}

public sealed record ManageHubSessionsDto
{
    public required int EntryCount { get; init; }

    public required int CurrentStartYear { get; init; }

    public required bool HasCurrentEntry { get; init; }
}

public sealed record ManageHubVenuesDto
{
    public required int VenueCount { get; init; }

    public required int ArchivedCount { get; init; }
}

public sealed record ManageHubKeysDto
{
    public required int HoldingCount { get; init; }

    public required int HolderCount { get; init; }
}

public sealed record ManageHubBoardDto
{
    public required int SeatCount { get; init; }

    public required int VacantOfficeCount { get; init; }
}
