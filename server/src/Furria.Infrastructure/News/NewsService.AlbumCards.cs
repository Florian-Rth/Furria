using System.Diagnostics.Contracts;
using Furria.Application.Media;
using Furria.Application.News;
using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.News;

public sealed partial class NewsService
{
    private async Task<IReadOnlyDictionary<int, AlbumCard>> AlbumCardsAsync(
        IReadOnlyCollection<int> albumIds,
        CancellationToken ct
    )
    {
        if (albumIds.Count == 0)
            return new Dictionary<int, AlbumCard>();

        var publishedAlbums = _publicFace.Albums;
        var albums = await _dbContext
            .Albums.AsNoTracking()
            .Where(album => albumIds.Contains(album.Id))
            .Select(album => new CardAlbumRow(
                album.Id,
                album.CoverMediaItemId,
                publishedAlbums.Any(published => published.Id == album.Id)
            ))
            .ToListAsync(ct);
        var selection = (
            await _dbContext
                .MediaItems.AsNoTracking()
                .Where(item =>
                    item.AlbumId != null
                    && albumIds.Contains(item.AlbumId.Value)
                    && item.OwnerKind == MediaOwnerKind.Gallery
                    && item.Kind == MediaKind.Photo
                    && item.State == MediaItemState.Ready
                    && item.BinnedAt == null
                    && item.SelectionPosition != null
                )
                .Select(item => new SelectedPhoto(
                    item.AlbumId!.Value,
                    item.Id,
                    item.SelectionPosition!.Value,
                    item.RenderedAt
                ))
                .ToListAsync(ct)
        ).ToLookup(photo => photo.AlbumId);

        return albums.ToDictionary(
            album => album.AlbumId,
            album => CardOf(album, [.. selection[album.AlbumId]])
        );
    }

    private AlbumCard CardOf(CardAlbumRow album, IReadOnlyList<SelectedPhoto> selection) =>
        new(
            album.IsPublished,
            selection.Count,
            CoverOf(album.CoverMediaItemId, selection) is { } cover
                ? _pictures.GalleryPhotoOf(cover.MediaItemId, cover.RenderedAt)
                : null
        );

    [Pure]
    private static SelectedPhoto? CoverOf(
        int? chosenCoverId,
        IReadOnlyList<SelectedPhoto> selection
    ) =>
        selection.FirstOrDefault(photo => photo.MediaItemId == chosenCoverId)
        ?? selection.MinBy(photo => photo.Position);

    [Pure]
    private static NewsAlbumTie? TieOf(
        AlbumRef? album,
        IReadOnlyDictionary<int, AlbumCard> cards
    ) =>
        album is null
            ? null
            : new NewsAlbumTie(
                album.AlbumId,
                album.Title,
                cards.GetValueOrDefault(album.AlbumId)?.IsPublished ?? false,
                cards.GetValueOrDefault(album.AlbumId)?.PhotoCount ?? 0,
                cards.GetValueOrDefault(album.AlbumId)?.Cover
            );

    private sealed record AlbumRef(int AlbumId, string Title);

    private sealed record CardAlbumRow(int AlbumId, int? CoverMediaItemId, bool IsPublished);

    private sealed record AlbumCard(bool IsPublished, int PhotoCount, PictureDetails? Cover);

    private sealed record SelectedPhoto(
        int AlbumId,
        int MediaItemId,
        int Position,
        DateTimeOffset? RenderedAt
    );
}
