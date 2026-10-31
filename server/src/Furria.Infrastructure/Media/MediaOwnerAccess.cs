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
    private const string UnknownEvent = "There is no such event.";
    private const string UnknownAct = "There is no such act.";
    private const string UnknownSession = "There is no such session record.";
    private const string ArchivedAct = "The act is archived and takes no more media.";
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
            MediaOwnerKind.Event => await MayUploadEventPictureAsync(
                accountId,
                owner.Id!.Value,
                ct
            ),
            MediaOwnerKind.Act => await MayUploadActMediaAsync(accountId, owner.Id!.Value, ct),
            MediaOwnerKind.Session => await MayUploadSessionLogoAsync(
                accountId,
                owner.Id!.Value,
                ct
            ),
            MediaOwnerKind.Website => PermittedIf(
                await _authorizer.IsGrantedAsync(accountId, FurriaPermissions.GalleryPublish, ct)
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

    private async Task<Result> MayUploadEventPictureAsync(
        int accountId,
        int eventId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.Events.AnyAsync(row => row.CalendarEntryId == eventId, ct))
            return Result.NotFound(UnknownEvent);

        return PermittedIf(
            await _authorizer.IsGrantedAsync(accountId, FurriaPermissions.EventsManage, ct)
        );
    }

    private async Task<Result> MayUploadSessionLogoAsync(
        int accountId,
        int sessionId,
        CancellationToken ct
    )
    {
        if (!await _dbContext.Sessions.AnyAsync(session => session.Id == sessionId, ct))
            return Result.NotFound(UnknownSession);

        return PermittedIf(
            await _authorizer.IsGrantedAsync(accountId, FurriaPermissions.ClubManage, ct)
        );
    }

    private async Task<Result> MayUploadActMediaAsync(
        int accountId,
        int actId,
        CancellationToken ct
    )
    {
        var act = await _dbContext
            .Acts.Where(row => row.Id == actId)
            .Select(row => new { row.GroupId, IsArchived = row.ArchivedAt != null })
            .SingleOrDefaultAsync(ct);
        if (act is null)
            return Result.NotFound(UnknownAct);
        if (act.IsArchived)
            return Result.Conflict(ArchivedAct);

        return PermittedIf(
            (
                act.GroupId is { } groupId
                && await _authorizer.CanAdministerGroupAsync(accountId, groupId, ct)
            ) || await IsCoEditorAsync(accountId, actId, ct)
        );
    }

    private async Task<bool> IsCoEditorAsync(int accountId, int actId, CancellationToken ct) =>
        await _authorizer.ActivePersonIdAsync(accountId, ct) is { } personId
        && await _dbContext.ActCoEditors.AnyAsync(
            editor => editor.ActId == actId && editor.PersonId == personId,
            ct
        );

    private static Result PermittedIf(bool isPermitted) =>
        isPermitted ? Result.Success() : Result.Forbidden(NotPermitted);
}
