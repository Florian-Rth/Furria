using Furria.Core.Gallery;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class AlbumExpectations
{
    private readonly Expected _expected;
    private readonly int _albumId;

    internal AlbumExpectations(Expected expected, int albumId)
    {
        _expected = expected;
        _albumId = albumId;
    }

    public Expected ToBeTitled(string title, string? description) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var album = await SingleAsync(dbContext, ct);
                Assert.Equal(title, album.Title);
                Assert.Equal(description, album.Description);
            }
        );

    public Expected ToBeLinkedTo(int? calendarEntryId, int? sessionStartYear) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var album = await SingleAsync(dbContext, ct);
                Assert.Equal(calendarEntryId, album.CalendarEntryId);
                Assert.Equal(sessionStartYear, album.SessionStartYear);
            }
        );

    public Expected ToHaveChosenCover(int? mediaItemId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(mediaItemId, (await SingleAsync(dbContext, ct)).CoverMediaItemId)
        );

    public Expected ToBePublishedAt(DateTimeOffset publishedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(publishedAt, (await SingleAsync(dbContext, ct)).PublishedAt)
        );

    public Expected ToBeUnpublished() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).PublishedAt)
        );

    public Expected ToBeBinnedAt(DateTimeOffset binnedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(binnedAt, (await SingleAsync(dbContext, ct)).BinnedAt)
        );

    public Expected ToBeOutOfTheBin() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).BinnedAt)
        );

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(await dbContext.Albums.AnyAsync(row => row.Id == _albumId, ct))
        );

    private Task<Album> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Albums.AsNoTracking().SingleAsync(row => row.Id == _albumId, ct);
}
