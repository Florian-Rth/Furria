using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PostGroupMembership
    : Endpoint<PostGroupMembershipRequest, PostGroupMembershipResponse>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public PostGroupMembership(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("groups/{groupId}/memberships");
    }

    public override async Task HandleAsync(PostGroupMembershipRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanAdministerGroupAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _groupService.AddMembershipAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static AddGroupMembershipCommand ToCommand(PostGroupMembershipRequest req) =>
        new()
        {
            GroupId = req.GroupId,
            PersonId = req.PersonId,
            JoinedOn = req.JoinedOn,
        };

    private static PostGroupMembershipResponse ToResponse(int groupMembershipId) =>
        new() { GroupMembershipId = groupMembershipId };
}

public sealed record PostGroupMembershipRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required int PersonId { get; init; }

    public required DateOnly JoinedOn { get; init; }
}

public sealed class PostGroupMembershipValidator : Validator<PostGroupMembershipRequest>
{
    public PostGroupMembershipValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.JoinedOn).NotEmpty();
    }
}

public sealed record PostGroupMembershipResponse
{
    public required int GroupMembershipId { get; init; }
}
