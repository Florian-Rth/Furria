using Furria.Application.Authorization;
using Furria.Infrastructure.Authorization;

namespace Furria.Api.Endpoints.Calendar;

internal static class CalendarOwnershipExtensions
{
    internal static Task<bool> MayOwnCalendarEntryAsync(
        this PermissionAuthorizer authorizer,
        int accountId,
        int? ownerGroupId,
        CancellationToken ct
    ) =>
        ownerGroupId is { } groupId
            ? authorizer.CanAdministerGroupAsync(accountId, groupId, ct)
            : authorizer.IsGrantedAsync(accountId, FurriaPermissions.CalendarManageClub, ct);
}
