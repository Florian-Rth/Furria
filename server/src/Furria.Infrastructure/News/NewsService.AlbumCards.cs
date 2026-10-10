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

        var chosenCovers = await _dbContext
            .Albums.AsNoTracking()
            .Where(album => albumIds.Contains(album.Id))
            .ToDictionaryAsync(album => album.Id, album => album.CoverMediaItemId, ct);
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
                    item.SelectionPosition!.Value
                ))
                .ToListAsync(ct)
        ).ToLookup(photo => photo.AlbumId);

        return chosenCovers.ToDictionary(
            album => album.Key,
            album => CardOf(album.Value, [.. selection[album.Key]])
        );
    }

    private AlbumCard CardOf(int? chosenCoverId, IReadOnlyList<SelectedPhoto> selection) =>
        new(
            selection.Count,
            CoverIdOf(chosenCoverId, selection) is { } coverId
                ? _pictures.GalleryPhotoOf(coverId)
                : null
        );

    [Pure]
    private static int? CoverIdOf(int? chosenCoverId, IReadOnlyList<SelectedPhoto> selection) =>
        selection.Any(photo => photo.MediaItemId == chosenCoverId)
            ? chosenCoverId
            : selection.MinBy(photo => photo.Position)?.MediaItemId;

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
                album.IsPublished,
                cards.GetValueOrDefault(album.AlbumId)?.PhotoCount ?? 0,
                cards.GetValueOrDefault(album.AlbumId)?.Cover
            );

    private sealed record AlbumRef(int AlbumId, string Title, bool IsPublished);

    private sealed record AlbumCard(int PhotoCount, PictureDetails? Cover);

    private sealed record SelectedPhoto(int AlbumId, int MediaItemId, int Position);
}
