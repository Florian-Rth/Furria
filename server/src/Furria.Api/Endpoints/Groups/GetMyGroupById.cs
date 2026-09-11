using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetMyGroupById : Endpoint<GetMyGroupByIdRequest, GetMyGroupByIdResponse>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public GetMyGroupById(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("my-groups/{groupId}");
    }

    public override async Task HandleAsync(GetMyGroupByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var group = await _groupService.GetMyGroupAsync(req.GroupId, ct);
        if (!group.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(group.Error, ct);
            return;
        }

        if (!await _authorizer.IsGroupMemberOrAdminAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var viewerIsAdmin = await _authorizer.IsGroupAdminAsync(accountId.Value, req.GroupId, ct);

        await Send.OkAsync(ToResponse(group.Value, viewerIsAdmin), cancellation: ct);
    }

    private static GetMyGroupByIdResponse ToResponse(MyGroupDetails group, bool viewerIsAdmin) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            ViewerIsAdmin = viewerIsAdmin,
            Members = [.. group.Members.Select(ToDto)],
            Admins = [.. group.Admins.Select(ToDto)],
            PastMembers = viewerIsAdmin ? [.. group.PastMembers.Select(ToDto)] : [],
            PastAdmins = viewerIsAdmin ? [.. group.PastAdmins.Select(ToDto)] : [],
        };

    private static HubMemberDto ToDto(HubMember member) =>
        new()
        {
            GroupMembershipId = member.GroupMembershipId,
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            JoinedOn = member.JoinedOn,
            LeftOn = member.LeftOn,
            Since = member.Since,
        };

    private static HubAdminDto ToDto(HubAdministrator admin) =>
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
        };
}

public sealed record GetMyGroupByIdRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class GetMyGroupByIdValidator : Validator<GetMyGroupByIdRequest>
{
    public GetMyGroupByIdValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}

public sealed record GetMyGroupByIdResponse
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }

    public required bool ViewerIsAdmin { get; init; }

    public required IReadOnlyList<HubMemberDto> Members { get; init; }

    public required IReadOnlyList<HubAdminDto> Admins { get; init; }

    public required IReadOnlyList<HubMemberDto> PastMembers { get; init; }

    public required IReadOnlyList<HubAdminDto> PastAdmins { get; init; }
}

public sealed record HubMemberDto
{
    public required int GroupMembershipId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly JoinedOn { get; init; }

    public required DateOnly? LeftOn { get; init; }

    public required DateOnly Since { get; init; }
}

public sealed record HubAdminDto
{
    public required int GroupAdminId { get; init; }

    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? Function { get; init; }

    public required DateOnly SinceOn { get; init; }

    public required DateOnly? UntilOn { get; init; }

    public required DateOnly Since { get; init; }
}
