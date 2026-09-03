using FastEndpoints;
using Furria.Application.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Api.Authorization;

public sealed class PermissionEnforcer : IGlobalPreProcessor
{
    public async Task PreProcessAsync(IPreProcessorContext context, CancellationToken ct)
    {
        var http = context.HttpContext;
        var requirement = http.GetEndpoint()?.Metadata.GetMetadata<PermissionRequirement>();
        if (requirement is null)
            return;

        var accountId = http.User.AccountId();
        if (accountId is null)
        {
            await http.Response.SendForbiddenAsync(ct);
            return;
        }

        var authorizer = http.RequestServices.GetRequiredService<PermissionAuthorizer>();
        if (await authorizer.IsGrantedAsync(accountId.Value, requirement.PermissionKey, ct))
            return;

        await http.Response.SendForbiddenAsync(ct);
    }
}
