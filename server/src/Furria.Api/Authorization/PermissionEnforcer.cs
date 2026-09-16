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

        if (
            metadata?.GetMetadata<AffiliationRequirement>() is not null
            && !await SatisfiesAsync(
                http,
                (authorizer, accountId) => authorizer.IsAffiliatedAsync(accountId, ct)
            )
        )
        {
            await http.Response.SendForbiddenAsync(ct);
            return;
        }

        if (
            metadata?.GetMetadata<PermissionRequirement>() is { } requirement
            && !await SatisfiesAsync(
                http,
                (authorizer, accountId) =>
                    authorizer.IsGrantedAsync(accountId, requirement.PermissionKey, ct)
            )
        )
        {
            await http.Response.SendForbiddenAsync(ct);
        }
    }

    private static async Task<bool> SatisfiesAsync(
        HttpContext http,
        Func<PermissionAuthorizer, int, Task<bool>> isSatisfied
    )
    {
        var accountId = http.User.AccountId();
        if (accountId is null)
            return false;

        var authorizer = http.RequestServices.GetRequiredService<PermissionAuthorizer>();
        return await isSatisfied(authorizer, accountId.Value);
    }
}
