using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetManagedGroups : EndpointWithoutRequest<GetManagedGroupsResponse>
{
    private readonly GroupService _groupService;

    public GetManagedGroups(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Get("manage/groups");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var groups = await _groupService.GetManagedGroupsAsync(ct);

        await Send.OkAsync(ToResponse(groups), cancellation: ct);
    }

    private static GetManagedGroupsResponse ToResponse(IReadOnlyList<ManagedGroupSummary> groups) =>
        new() { Groups = [.. groups.Select(ToDto)] };

    private static ManagedGroupSummaryDto ToDto(ManagedGroupSummary group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            ArchivedOn = group.ArchivedOn,
            MemberCount = group.MemberCount,
            Admins = [.. group.Admins.Select(ToDto)],
        };

    private static PersonRefDto ToDto(PersonReference person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };
}

public sealed record GetManagedGroupsResponse
{
    public required IReadOnlyList<ManagedGroupSummaryDto> Groups { get; init; }
}

public sealed record ManagedGroupSummaryDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required int MemberCount { get; init; }

    public required IReadOnlyList<PersonRefDto> Admins { get; init; }
}
