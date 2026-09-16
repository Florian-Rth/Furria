using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Infrastructure.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class GroupAccessProbe : Endpoint<GroupAccessProbeRequest, GroupAccessProbeResponse>
{
    private readonly PermissionAuthorizer _authorizer;

    public GroupAccessProbe(PermissionAuthorizer authorizer)
    {
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("tests/group-access-probe/{groupId}");
    }

    public override async Task HandleAsync(GroupAccessProbeRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.IsGroupMemberOrAdminAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        await Send.OkAsync(
            new GroupAccessProbeResponse
            {
                ViewerIsAdmin = await _authorizer.IsGroupAdminAsync(
                    accountId.Value,
                    req.GroupId,
                    ct
                ),
            },
            cancellation: ct
        );
    }
}

public sealed record GroupAccessProbeRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class GroupAccessProbeValidator : Validator<GroupAccessProbeRequest>
{
    public GroupAccessProbeValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}

public sealed record GroupAccessProbeResponse
{
    public required bool ViewerIsAdmin { get; init; }
}
