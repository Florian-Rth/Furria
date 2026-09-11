using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class EndGroupAdmin : Endpoint<EndGroupAdminRequest>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public EndGroupAdmin(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("groups/{groupId}/admins/{groupAdminId}/end");
    }

    public override async Task HandleAsync(EndGroupAdminRequest req, CancellationToken ct)
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

        var result = await _groupService.EndAdminAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static EndGroupAdminCommand ToCommand(EndGroupAdminRequest req) =>
        new()
        {
            GroupId = req.GroupId,
            GroupAdminId = req.GroupAdminId,
            EndedOn = req.EndedOn,
        };
}

public sealed record EndGroupAdminRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    [RouteParam]
    public required int GroupAdminId { get; init; }

    public required DateOnly EndedOn { get; init; }
}

public sealed class EndGroupAdminValidator : Validator<EndGroupAdminRequest>
{
    public EndGroupAdminValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.GroupAdminId).GreaterThan(0);
        RuleFor(request => request.EndedOn).NotEmpty();
    }
}
