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
        if (metadata is null)
            return;

        if (
            !await SatisfiesAffiliationAsync(http, metadata, ct)
            || !await SatisfiesPermissionAsync(http, metadata, ct)
            || !await SatisfiesAnyPermissionAsync(http, metadata, ct)
        )
        {
            await http.Response.SendForbiddenAsync(ct);
        }
    }

    private static Task<bool> SatisfiesAffiliationAsync(
        HttpContext http,
        EndpointMetadataCollection metadata,
        CancellationToken ct
    ) =>
        metadata.GetMetadata<AffiliationRequirement>() is null
            ? Task.FromResult(true)
            : SatisfiesAsync(
                http,
                (authorizer, accountId) => authorizer.IsAffiliatedAsync(accountId, ct)
            );

    private static Task<bool> SatisfiesPermissionAsync(
        HttpContext http,
        EndpointMetadataCollection metadata,
        CancellationToken ct
    ) =>
        metadata.GetMetadata<PermissionRequirement>() is { } requirement
            ? SatisfiesAsync(
                http,
                (authorizer, accountId) =>
                    authorizer.IsGrantedAsync(accountId, requirement.PermissionKey, ct)
            )
            : Task.FromResult(true);

    private static Task<bool> SatisfiesAnyPermissionAsync(
        HttpContext http,
        EndpointMetadataCollection metadata,
        CancellationToken ct
    ) =>
        metadata.GetMetadata<AnyPermissionRequirement>() is { } requirement
            ? SatisfiesAsync(
                http,
                (authorizer, accountId) =>
                    authorizer.IsGrantedAnyAsync(accountId, requirement.PermissionKeys, ct)
            )
            : Task.FromResult(true);

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
