using FastEndpoints;
using Furria.Infrastructure.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Api.Authorization;

public sealed class PermissionEnforcer : IGlobalPreProcessor
{
    public async Task PreProcessAsync(IPreProcessorContext context, CancellationToken ct)
    {
        var http = context.HttpContext;
        var metadata = http.GetEndpoint()?.Metadata;

        if (metadata?.GetMetadata<AffiliationRequirement>() is not null)
        {
            await EnforceAsync(
                http,
                (authorizer, accountId) => authorizer.IsAffiliatedAsync(accountId, ct),
                ct
            );
            return;
        }

        if (metadata?.GetMetadata<PermissionRequirement>() is { } requirement)
        {
            await EnforceAsync(
                http,
                (authorizer, accountId) =>
                    authorizer.IsGrantedAsync(accountId, requirement.PermissionKey, ct),
                ct
            );
        }
    }

    private static async Task EnforceAsync(
        HttpContext http,
        Func<PermissionAuthorizer, int, Task<bool>> isSatisfied,
        CancellationToken ct
    )
    {
        var accountId = http.User.AccountId();
        if (accountId is null)
        {
            await http.Response.SendForbiddenAsync(ct);
            return;
        }

        var authorizer = http.RequestServices.GetRequiredService<PermissionAuthorizer>();
        if (await isSatisfied(authorizer, accountId.Value))
            return;

        await http.Response.SendForbiddenAsync(ct);
    }
}
