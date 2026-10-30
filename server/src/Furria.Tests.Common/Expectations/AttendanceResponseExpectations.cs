using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class AttendanceResponseExpectations
{
    private readonly Expected _expected;
    private readonly int _calendarEntryId;

    internal AttendanceResponseExpectations(Expected expected, int calendarEntryId)
    {
        _expected = expected;
        _calendarEntryId = calendarEntryId;
    }

    public Expected ToCarryExactlyOneAnswerFrom(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Single(await AnswersOfAsync(dbContext, personId, ct))
        );

    public Expected ToCarryAnswerFrom(int personId, AttendanceAnswer answer) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(answer, Assert.Single(await AnswersOfAsync(dbContext, personId, ct)))
        );

    public Expected ToCarryNoAnswerFrom(int personId) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Empty(await AnswersOfAsync(dbContext, personId, ct))
        );

    public Expected ToCarryMarkFrom(
        int personId,
        AttendanceAnswer answer,
        int recordedByPersonId
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var response = await dbContext
                    .AttendanceResponses.AsNoTracking()
                    .SingleAsync(
                        row => row.CalendarEntryId == _calendarEntryId && row.PersonId == personId,
                        ct
                    );

                Assert.Equal(
                    (answer, true, (int?)recordedByPersonId),
                    (response.Answer, response.IsRecordedOnBehalf, response.RecordedByPersonId)
                );
            }
        );

    public Expected ToCarryTrailFrom(
        int personId,
        params (AttendanceAnswer Answer, bool IsRecordedOnBehalf)[] newestFirst
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var trail = await dbContext
                    .AttendanceResponseChanges.AsNoTracking()
                    .Where(row =>
                        row.CalendarEntryId == _calendarEntryId && row.PersonId == personId
                    )
                    .OrderByDescending(row => row.Id)
                    .Select(row => new { row.Answer, row.IsRecordedOnBehalf })
                    .ToListAsync(ct);

                Assert.Equal(
                    newestFirst,
                    trail.Select(row => (row.Answer, row.IsRecordedOnBehalf))
                );
            }
        );

    private Task<List<AttendanceAnswer>> AnswersOfAsync(
        AppDbContext dbContext,
        int personId,
        CancellationToken ct
    ) =>
        dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(row => row.CalendarEntryId == _calendarEntryId && row.PersonId == personId)
            .Select(row => row.Answer)
            .ToListAsync(ct);
}
