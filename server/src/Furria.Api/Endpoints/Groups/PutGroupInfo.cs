using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PutGroupInfo : Endpoint<PutGroupInfoRequest>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public PutGroupInfo(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("groups/{groupId}/info");
    }

    public override async Task HandleAsync(PutGroupInfoRequest req, CancellationToken ct)
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

        var result = await _groupService.UpdateInfoAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static UpdateGroupInfoCommand ToCommand(PutGroupInfoRequest req) =>
        new()
        {
            GroupId = req.GroupId,
            Description = req.Description,
            IsRecruiting = req.IsRecruiting,
        };
}

public sealed record PutGroupInfoRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required string Description { get; init; }

    public required bool IsRecruiting { get; init; }
}

public sealed class PutGroupInfoValidator : Validator<PutGroupInfoRequest>
{
    private const int DescriptionMaximumLength = 400;

    public PutGroupInfoValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.Description).NotNull().MaximumLength(DescriptionMaximumLength);
    }
}
