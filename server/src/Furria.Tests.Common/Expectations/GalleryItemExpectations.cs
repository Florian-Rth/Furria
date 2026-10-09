using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class GalleryItemExpectations
{
    private readonly Expected _expected;
    private readonly int _mediaItemId;

    internal GalleryItemExpectations(Expected expected, int mediaItemId)
    {
        _expected = expected;
        _mediaItemId = mediaItemId;
    }

    public Expected ToSitInTheInboxOf(int? uploaderPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(MediaOwnerKind.Gallery, item.OwnerKind);
                Assert.Null(item.AlbumId);
                Assert.Equal(uploaderPersonId, item.UploadedByPersonId);
            }
        );

    public Expected ToBePlacedIn(int albumId, DateTimeOffset placedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(albumId, item.AlbumId);
                Assert.Equal(placedAt, item.PlacedAt);
                Assert.Null(item.BinnedAt);
            }
        );

    public Expected ToBeBinnedFrom(int albumId, DateTimeOffset binnedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(albumId, item.AlbumId);
                Assert.Equal(binnedAt, item.BinnedAt);
                Assert.Null(item.SelectionPosition);
            }
        );

    public Expected ToBeSelectedAt(int position, string? caption) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Equal(position, item.SelectionPosition);
                Assert.Equal(caption, item.Caption);
            }
        );

    public Expected ToBeUnselected() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var item = await SingleAsync(dbContext, ct);
                Assert.Null(item.SelectionPosition);
                Assert.Null(item.Caption);
            }
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(await dbContext.MediaItems.AnyAsync(row => row.Id == _mediaItemId, ct))
        );

    private Task<MediaItem> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.MediaItems.AsNoTracking().SingleAsync(row => row.Id == _mediaItemId, ct);
}
