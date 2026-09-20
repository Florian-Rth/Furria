using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Groups;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetManagedGroupById
    : Endpoint<GetManagedGroupByIdRequest, GetManagedGroupByIdResponse>
{
    private readonly GroupService _groupService;

    public GetManagedGroupById(GroupService groupService)
    {
        _groupService = groupService;
    }

    public override void Configure()
    {
        Get("manage/groups/{groupId}");
        Definition.RequirePermission(FurriaPermissions.GroupsManage);
    }

    public override async Task HandleAsync(GetManagedGroupByIdRequest req, CancellationToken ct)
    {
        var group = await _groupService.GetManagedGroupAsync(req.GroupId, ct);
        if (!group.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(group.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(group.Value), cancellation: ct);
    }

    private static GetManagedGroupByIdResponse ToResponse(ManagedGroupDetails group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            GroupKindId = group.GroupKindId,
            GroupKindName = group.GroupKindName,
            ArchivedOn = group.ArchivedOn,
            Members = [.. group.Members.Select(ToDto)],
            Admins = [.. group.Admins.Select(ToDto)],
            PastMembers = [.. group.PastMembers.Select(ToDto)],
            PastAdmins = [.. group.PastAdmins.Select(ToDto)],
        };

    private static ManagedMemberDto ToDto(HubMember member) =>
        new()
        {
            GroupMembershipId = member.GroupMembershipId,
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            JoinedOn = member.JoinedOn,
            LeftOn = member.LeftOn,
            Since = member.Since,
            IsAffiliated = member.IsAffiliated,
        };

    private static ManagedAdminDto ToDto(HubAdministrator admin) =>
        new()
        {
            GroupAdminId = admin.GroupAdminId,
            PersonId = admin.PersonId,
            FirstName = admin.FirstName,
            LastName = admin.LastName,
            Function = admin.Function,
            SinceOn = admin.SinceOn,
            UntilOn = admin.UntilOn,
            Since = admin.Since,
            IsAffiliated = admin.IsAffiliated,
        };
}

public sealed record GetManagedGroupByIdRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class GetManagedGroupByIdValidator : Validator<GetManagedGroupByIdRequest>
{
    public GetManagedGroupByIdValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}

public sealed record GetManagedGroupByIdResponse
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required int? GroupKindId { get; init; }

    public required string? GroupKindName { get; init; }

    public required DateOnly? ArchivedOn { get; init; }

    public required IReadOnlyList<ManagedMemberDto> Members { get; init; }

    public required IReadOnlyList<ManagedAdminDto> Admins { get; init; }

    public required IReadOnlyList<ManagedMemberDto> PastMembers { get; init; }

    public required IReadOnlyList<ManagedAdminDto> PastAdmins { get; init; }
}

public sealed record ManagedMemberDto
{
    public required int GroupMembershipId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly JoinedOn { get; init; }

    public required DateOnly? LeftOn { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }
}

public sealed record ManagedAdminDto
{
    public required int GroupAdminId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Function { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }

    public required DateOnly Since { get; init; }

    public required bool IsAffiliated { get; init; }
}
