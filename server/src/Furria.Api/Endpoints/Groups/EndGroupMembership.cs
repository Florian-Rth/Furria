using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class EndGroupMembership : Endpoint<EndGroupMembershipRequest>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public EndGroupMembership(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("groups/{groupId}/memberships/{groupMembershipId}/end");
    }

    public override async Task HandleAsync(EndGroupMembershipRequest req, CancellationToken ct)
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

        var result = await _groupService.EndMembershipAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static EndGroupMembershipCommand ToCommand(EndGroupMembershipRequest req) =>
        new()
        {
            GroupId = req.GroupId,
            GroupMembershipId = req.GroupMembershipId,
            EndedOn = req.EndedOn,
        };
}

public sealed record EndGroupMembershipRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    [RouteParam]
    public required int GroupMembershipId { get; init; }

    public required DateOnly EndedOn { get; init; }
}

public sealed class EndGroupMembershipValidator : Validator<EndGroupMembershipRequest>
{
    public EndGroupMembershipValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.GroupMembershipId).GreaterThan(0);
        RuleFor(request => request.EndedOn).NotEmpty();
    }
}
