using Furria.Application.Authorization;
using Furria.Core.Intakes;
using Furria.Infrastructure.Authorization;

namespace Furria.Infrastructure.Intakes;

internal static class IntakeActors
{
    public static async Task<IntakeActor> IntakeActorAsync(
        this PermissionAuthorizer authorizer,
        int accountId,
        CancellationToken ct
    ) =>
        new(
            await authorizer.ActivePersonIdAsync(accountId, ct),
            await authorizer.IsGrantedAsync(accountId, FurriaPermissions.PersonsManage, ct),
            (await authorizer.AdministeredGroupIdsAsync(accountId, ct)).ToHashSet()
        );
}
