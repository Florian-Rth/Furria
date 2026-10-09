using System.Collections.Frozen;
using Furria.Application.Media;
using Furria.Core.Club;
using Furria.Core.Media;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Groups;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class PublicMediaService
{
    private static readonly FrozenSet<MediaRendition> PictureRenditions = new[]
    {
        MediaRendition.Small,
        MediaRendition.Medium,
        MediaRendition.Large,
    }.ToFrozenSet();

    private readonly AppDbContext _dbContext;
    private readonly MediaStore _mediaStore;
    private readonly TimeProvider _timeProvider;

    public PublicMediaService(
        AppDbContext dbContext,
        MediaStore mediaStore,
        TimeProvider timeProvider
    )
    {
        _dbContext = dbContext;
        _mediaStore = mediaStore;
        _timeProvider = timeProvider;
    }

    public async Task<MediaFileDetails?> BoardPortraitFileAsync(
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct
    ) =>
        PictureRenditions.Contains(rendition) && await IsOnThePublicBoardAsync(mediaItemId, ct)
            ? await _mediaStore.FileOfAsync(mediaItemId, rendition, ct)
            : null;

    public async Task<MediaFileDetails?> GroupPictureFileAsync(
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct
    ) =>
        PictureRenditions.Contains(rendition) && await IsShownWithAPublicGroupAsync(mediaItemId, ct)
            ? await _mediaStore.FileOfAsync(mediaItemId, rendition, ct)
            : null;

    public async Task<MediaFileDetails?> GalleryPhotoFileAsync(
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct
    ) =>
        PictureRenditions.Contains(rendition) && await IsInAPublicSelectionAsync(mediaItemId, ct)
            ? await _mediaStore.FileOfAsync(mediaItemId, rendition, ct)
            : null;

    private Task<bool> IsOnThePublicBoardAsync(int mediaItemId, CancellationToken ct) =>
        _dbContext
            .BoardSeats.AsNoTracking()
            .Where(RunningBoardSeats.RunningOn(ClubClock.Today(_timeProvider)))
            .AnyAsync(
                seat => seat.BoardOffice!.IsPublic && seat.Person!.PortraitId == mediaItemId,
                ct
            );

    private Task<bool> IsShownWithAPublicGroupAsync(int mediaItemId, CancellationToken ct) =>
        _dbContext
            .Groups.AsNoTracking()
            .Where(PublicGroups.IsShown)
            .AnyAsync(group => group.PictureId == mediaItemId, ct);

    private Task<bool> IsInAPublicSelectionAsync(int mediaItemId, CancellationToken ct) =>
        _dbContext
            .MediaItems.AsNoTracking()
            .Where(PublicGallery.IsInAPublicSelection)
            .AnyAsync(item => item.Id == mediaItemId, ct);
}
