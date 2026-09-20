using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetManagedGroups : EndpointWithoutRequest<GetManagedGroupsResponse>
{
    private readonly GroupService _groupService;
    private readonly GroupKindService _groupKindService;

    public GetManagedGroups(GroupService groupService, GroupKindService groupKindService)
    {
        _groupService = groupService;
        _groupKindService = groupKindService;
    }

    public override void Configure()
    {
        Get("manage/groups");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var groups = await _groupService.GetManagedGroupsAsync(ct);
        var kinds = await _groupKindService.GetKindsAsync(ct);

        await Send.OkAsync(ToResponse(groups, kinds), cancellation: ct);
    }

    private static GetManagedGroupsResponse ToResponse(
        IReadOnlyList<ManagedGroupSummary> groups,
        IReadOnlyList<GroupKindDetails> kinds
    ) => new() { Groups = [.. groups.Select(ToDto)], Kinds = [.. kinds.Select(ToDto)] };

    private static ManagedGroupKindDto ToDto(GroupKindDetails kind) =>
        new()
        {
            GroupKindId = kind.GroupKindId,
            Name = kind.Name,
            SortOrder = kind.SortOrder,
            ArchivedOn = kind.ArchivedOn,
            GroupCount = kind.GroupCount,
        };

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

    public required IReadOnlyList<ManagedGroupKindDto> Kinds { get; init; }
}

public sealed record ManagedGroupKindDto
{
    public required int GroupKindId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required int GroupCount { get; init; }
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
