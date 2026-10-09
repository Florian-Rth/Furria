using Furria.Application.Gallery;
using Furria.Application.Start;
using Furria.Infrastructure.Gallery;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private const int NewInGalleryDays = 14;
    private const int NewInGalleryReach = 12;

    private async Task<IReadOnlyList<StartAlbumSummary>> NewInGalleryAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        if (!GalleryKeys.Viewers.Any(viewer.GrantedKeys.Contains))
            return [];

        var since = viewer.Moment.Now.AddDays(-NewInGalleryDays);
        var albums = await _dbContext
            .Albums.AsNoTracking()
            .Where(album => album.BinnedAt == null && album.CreatedAt >= since)
            .Select(album => new
            {
                album.Id,
                album.Title,
                album.CreatedAt,
                ItemCount = album.Items.Count(item => item.BinnedAt == null),
            })
            .Where(album => album.ItemCount > 0)
            .OrderByDescending(album => album.CreatedAt)
            .ThenByDescending(album => album.Id)
            .Take(NewInGalleryReach)
            .ToListAsync(ct);
        var covers = await _dbContext.AlbumCoversOfAsync([.. albums.Select(album => album.Id)], ct);

        return
        [
            .. albums.Select(album => new StartAlbumSummary
            {
                AlbumId = album.Id,
                Title = album.Title,
                ItemCount = album.ItemCount,
                CreatedAt = album.CreatedAt,
                Cover = covers.GetValueOrDefault(album.Id),
            }),
        ];
    }
}
