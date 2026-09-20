using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class AnnouncementExpectations
{
    private readonly Expected _expected;
    private readonly int _announcementId;

    internal AnnouncementExpectations(Expected expected, int announcementId)
    {
        _expected = expected;
        _announcementId = announcementId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .Announcements.AsNoTracking()
                        .AnyAsync(row => row.Id == _announcementId, ct),
                    $"Expected no Aushang with id {_announcementId}."
                )
        );

    public Expected ToHaveTitle(string title) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(title, (await SingleAsync(dbContext, ct)).Title)
        );

    public Expected ToHaveBody(string body) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(body, (await SingleAsync(dbContext, ct)).Body)
        );

    public Expected ToHaveValidUntil(DateOnly? validUntil) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(validUntil, (await SingleAsync(dbContext, ct)).ValidUntil)
        );

    public Expected ToHavePublishedAt(DateTimeOffset publishedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(publishedAt, (await SingleAsync(dbContext, ct)).PublishedAt)
        );

    public Expected ToHaveAuthor(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).AuthorPersonId)
        );

    private Task<Announcement> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Announcements.AsNoTracking().SingleAsync(row => row.Id == _announcementId, ct);
}
