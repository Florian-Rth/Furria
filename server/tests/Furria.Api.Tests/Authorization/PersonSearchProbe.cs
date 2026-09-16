using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Infrastructure.Authorization;

namespace Furria.Api.Tests.Authorization;

public sealed class PersonSearchProbe : EndpointWithoutRequest
{
    private readonly PermissionAuthorizer _authorizer;

    public PersonSearchProbe(PermissionAuthorizer authorizer)
    {
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("tests/person-search-probe");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanSearchPersonsAsync(accountId.Value, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}
