using Furria.Application.Authorization;
using Furria.Application.Gallery;
using Furria.Infrastructure.Authorization;

namespace Furria.Api.Endpoints.Gallery;

public static class GalleryActors
{
    public static async Task<GalleryActor> GalleryActorAsync(
        this PermissionAuthorizer authorizer,
        int accountId,
        CancellationToken ct
    )
    {
        var keys = await authorizer.GrantedKeysAsync(accountId, ct);

        return new GalleryActor
        {
            PersonId = await authorizer.ActivePersonIdAsync(accountId, ct),
            MayUpload = keys.Contains(FurriaPermissions.GalleryUpload),
            MayManage = keys.Contains(FurriaPermissions.GalleryManage),
        };
    }
}
