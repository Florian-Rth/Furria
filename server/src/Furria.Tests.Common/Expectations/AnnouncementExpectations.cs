using Furria.Core.Club;
using Furria.Core.Text;
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
                    $"Expected no Announcement with id {_announcementId}."
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

    public Expected ToHaveAuthor(int? personId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(personId, (await SingleAsync(dbContext, ct)).AuthorPersonId)
        );

    public Expected ToHaveMentions(params (MentionKind Kind, int TargetId)[] mentions) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    mentions.Order(),
                    (
                        await dbContext
                            .AnnouncementMentions.AsNoTracking()
                            .Where(row => row.AnnouncementId == _announcementId)
                            .Select(row => new { row.Kind, row.TargetId })
                            .ToListAsync(ct)
                    )
                        .Select(row => (row.Kind, row.TargetId))
                        .Order()
                )
        );

    public Expected ToHaveAnswers(params (int PersonId, AttendanceAnswer Answer)[] answers) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    answers.Order(),
                    (
                        await dbContext
                            .AttendanceResponses.AsNoTracking()
                            .Where(row => row.AnnouncementId == _announcementId)
                            .Select(row => new { row.PersonId, row.Answer })
                            .ToListAsync(ct)
                    )
                        .Select(row => (row.PersonId, row.Answer))
                        .Order()
                )
        );

    public Expected ToAskForAnswersAt(int? position, DateTimeOffset? answersUntil) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var announcement = await SingleAsync(dbContext, ct);
                Assert.Equal(position, announcement.AttendancePosition);
                Assert.Equal(answersUntil, announcement.AnswersUntil);
            }
        );

    public Expected ToHaveAttendanceClosed(DateTimeOffset? closedAt, int? closedByPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var announcement = await SingleAsync(dbContext, ct);
                Assert.Equal(closedAt, announcement.AttendanceClosedAt);
                Assert.Equal(closedByPersonId, announcement.AttendanceClosedByPersonId);
            }
        );

    public Expected ToHaveAttendanceRemindedAt(DateTimeOffset? remindedAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    remindedAt,
                    (await SingleAsync(dbContext, ct)).AttendanceLastRemindedAt
                )
        );

    public Expected ToHavePolls(params string[] questions) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    questions,
                    await dbContext
                        .Polls.AsNoTracking()
                        .Where(poll => poll.AnnouncementId == _announcementId)
                        .OrderBy(poll => poll.Position)
                        .Select(poll => poll.Question)
                        .ToListAsync(ct)
                )
        );

    public Expected ToHaveSignUpLists(params string[] titles) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    titles,
                    await dbContext
                        .SignUpLists.AsNoTracking()
                        .Where(list => list.AnnouncementId == _announcementId)
                        .OrderBy(list => list.Position)
                        .Select(list => list.Title)
                        .ToListAsync(ct)
                )
        );

    private Task<Announcement> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.Announcements.AsNoTracking().SingleAsync(row => row.Id == _announcementId, ct);
}
