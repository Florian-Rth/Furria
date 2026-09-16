using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PostGroupAdmin : Endpoint<PostGroupAdminRequest, PostGroupAdminResponse>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public PostGroupAdmin(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("groups/{groupId}/admins");
    }

    public override async Task HandleAsync(PostGroupAdminRequest req, CancellationToken ct)
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

        var result = await _groupService.AddAdminAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static AddGroupAdminCommand ToCommand(PostGroupAdminRequest req) =>
        new()
        {
            GroupId = req.GroupId,
            PersonId = req.PersonId,
            Function = req.Function,
            SinceOn = req.SinceOn,
        };

    private static PostGroupAdminResponse ToResponse(int groupAdminId) =>
        new() { GroupAdminId = groupAdminId };
}

public sealed record PostGroupAdminRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required int PersonId { get; init; }

    public required string? Function { get; init; }

    public required DateOnly SinceOn { get; init; }
}

public sealed class PostGroupAdminValidator : Validator<PostGroupAdminRequest>
{
    public PostGroupAdminValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.PersonId).GreaterThan(0);
        RuleFor(request => request.Function).MaximumLength(64);
        RuleFor(request => request.SinceOn).NotEmpty();
    }
}

public sealed record PostGroupAdminResponse
{
    public required int GroupAdminId { get; init; }
}
