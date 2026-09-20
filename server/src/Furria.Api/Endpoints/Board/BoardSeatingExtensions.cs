using Furria.Application.Authorization;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Board;

internal static class BoardSeatingExtensions
{
    internal static async Task<bool> MaySeatIntoOfficeAsync(
        this PermissionAuthorizer authorizer,
        BoardService boardService,
        int accountId,
        int boardOfficeId,
        CancellationToken ct
    )
    {
        var impliedRoleId = await boardService.ImpliedRoleIdOfAsync(boardOfficeId, ct);

        return impliedRoleId is null
            || await authorizer.IsGrantedAsync(accountId, FurriaPermissions.RolesManage, ct);
    }
}
