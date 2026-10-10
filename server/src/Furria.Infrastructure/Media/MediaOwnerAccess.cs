using Furria.Application.Authorization;
using Furria.Application.Results;
using Furria.Core.Media;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class MediaOwnerAccess
{
    private const string UnknownPerson = "There is no such person.";
    private const string UnknownGroup = "There is no such group.";
    private const string UnknownNewsPost = "There is no such news post.";
    private const string NotPermitted = "The caller may not add media to this owner.";

    private readonly AppDbContext _dbContext;
    private readonly PermissionAuthorizer _authorizer;

    public MediaOwnerAccess(AppDbContext dbContext, PermissionAuthorizer authorizer)
    {
        _dbContext = dbContext;
        _authorizer = authorizer;
    }

    public async Task<Result> MayUploadAsync(
        int accountId,
        MediaOwner owner,
        CancellationToken ct
    ) =>
        owner.Kind switch
        {
            MediaOwnerKind.Person => await MayUploadPortraitAsync(accountId, owner.Id!.Value, ct),
            MediaOwnerKind.Group => await MayUploadGroupPictureAsync(
                accountId,
                owner.Id!.Value,
                ct
            ),
            MediaOwnerKind.NewsPost => await MayUploadNewsPictureAsync(
                accountId,
                owner.Id!.Value,
                ct
            ),
            _ => PermittedIf(
                await _authorizer.IsGrantedAsync(accountId, FurriaPermissions.GalleryUpload, ct)
            ),
        };

    private async Task<Result> MayUploadPortraitAsync(
        int accountId,
        int personId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.People.AnyAsync(person => person.Id == personId, ct))
            return Result.NotFound(UnknownPerson);

        return PermittedIf(
            await _authorizer.ActivePersonIdAsync(accountId, ct) == personId
                || await _authorizer.IsGrantedAsync(accountId, FurriaPermissions.PersonsManage, ct)
        );
    }

    private async Task<Result> MayUploadGroupPictureAsync(
        int accountId,
        int groupId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.Groups.AnyAsync(group => group.Id == groupId, ct))
            return Result.NotFound(UnknownGroup);

        return PermittedIf(await _authorizer.CanAdministerGroupAsync(accountId, groupId, ct));
    }

    private async Task<Result> MayUploadNewsPictureAsync(
        int accountId,
        int newsPostId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.NewsPosts.AnyAsync(post => post.Id == newsPostId, ct))
            return Result.NotFound(UnknownNewsPost);

        return PermittedIf(
            await _authorizer.IsGrantedAsync(accountId, FurriaPermissions.NewsManage, ct)
        );
    }

    private static Result PermittedIf(bool isPermitted) =>
        isPermitted ? Result.Success() : Result.Forbidden(NotPermitted);
}
