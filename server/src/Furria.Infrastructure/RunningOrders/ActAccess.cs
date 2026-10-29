using Furria.Application.RunningOrders;
using Furria.Infrastructure.Authorization;

namespace Furria.Infrastructure.RunningOrders;

public sealed class ActAccess
{
    private readonly PermissionAuthorizer _authorizer;

    public ActAccess(PermissionAuthorizer authorizer)
    {
        _authorizer = authorizer;
    }

    public async Task<ActScope?> ScopeOfAsync(int accountId, CancellationToken ct)
    {
        if (await _authorizer.IsGrantedAnyAsync(accountId, RunningOrderKeys.Planners, ct))
            return ActScope.Everything;

        var groupIds = await _authorizer.AdministeredGroupIdsAsync(accountId, ct);

        return groupIds.Count == 0 ? null : ActScope.OfGroups(groupIds);
    }
}
