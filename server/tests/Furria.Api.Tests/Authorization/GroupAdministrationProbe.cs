using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Infrastructure.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class GroupAdministrationProbe : Endpoint<GroupAdministrationProbeRequest>
{
    private readonly PermissionAuthorizer _authorizer;

    public GroupAdministrationProbe(PermissionAuthorizer authorizer)
    {
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("tests/group-administration-probe/{groupId}");
    }

    public override async Task HandleAsync(
        GroupAdministrationProbeRequest req,
        CancellationToken ct
    )
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

        await Send.NoContentAsync(ct);
    }
}

public sealed record GroupAdministrationProbeRequest
{
    [RouteParam]
    public required int GroupId { get; init; }
}

public sealed class GroupAdministrationProbeValidator : Validator<GroupAdministrationProbeRequest>
{
    public GroupAdministrationProbeValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}
