using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;

namespace Furria.Api.Mentions;

internal static class MentionReaders
{
    internal static async Task<MentionReader> OfAsync(
        PermissionAuthorizer authorizer,
        int accountId,
        int? personId,
        CancellationToken ct
    ) =>
        new(
            personId,
            await authorizer.IsGrantedAsync(accountId, FurriaPermissions.CalendarManageClub, ct)
        );
}
